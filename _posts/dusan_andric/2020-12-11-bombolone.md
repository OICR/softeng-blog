---
layout: post
title:  "Rust, React, and Raspberry Pi"
breadcrumb: true
author: dusan_andric
date: 2020-12-11
categories: dusan_andric
tags:
    - Rust
    - Raspberry Pi
    - React
    - ARM
    - Picamera
    - Actix
    - Actix-Web
teaser:
    info: A Parental Leave Project.  
    image: dusan_andric/bombolone/pi-connected.png
header: 
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Introduction

Early in the year 2020 of the Common Era, before anyone truly realized there was an impending global crisis heading our way, I got to bear witness to the most wonderful thing: the birth of my baby girl. After the first few hectic weeks, with months of parental leave in front of me, my inner techie found itself a new project to tackle.  

## The Problem

Most new parents will probably be looking to acquire a baby monitor. The potential usefulness of such a device is obvious so we will not go into that. What we will go into is the following: They all suck. I could rant all day about it or type out a defense of a thesis about how these are a window into the state of the consumer electronics industry, but for my own sanity here are some bullet points:

- ***They all use Micro USB B.*** This happens to be the most horrid and brittle connector to ever be used in an electronics device. I am sure there are engineers somewhere still ashamed of the e-waste they created with that standard.
- ***Lots are cloud enabled!*** Because what every new parent wants is images of their home and newborn sucked up for who knows what purposes. That was sarcasm.
- ***Security is a joke.*** Outdated Linux kernels, outdated software packages (looking at you openssl), simple pairing secrets, unencrypted communication via Wi-Fi or “radio”, cloud connected devices providing a backdoor into your network. Heck, even Google’s nest cameras have been hacked to spy on and shout threatening things at a baby.
- ***Closed source.*** You cannot validate the code running the device.
- ***Bad or no repairability.*** This is both a problem in the e-waste it creates as well as the hit you will take to the wallet if something breaks.

<center>
<figure style="width: 60%">
    <img src="{{site.urlimg}}dusan_andric/bombolone/usb-b.png" />
    <figcaption>The whole Micro USB B port ended up ripping off of the PCB!</figcaption>
</figure>
</center>

## Hardware

I had been looking for an excuse to play with a Raspberry Pi for a long time and now finally I had one. The Raspberry Pi 4 had launched the previous year, and with beefier specs compared the previous gen, it looked like a great candidate for being a dev test bench. Also, most importantly, it drew power from a USB C connector!

I ordered my RPi4 kit from [CanaKit](https://www.canakit.com/) and as time went on I added components that I ordered from [ByAPi.ca](https://www.buyapi.ca/).

Knowing that night vision capabilities were essential, I made sure to order a Pi Camera that did not have an infrared filter as well as some IR emitting diodes.  

Once I connected it all together, I validate the functionality of the night vision with a simple python script that utilized the picamera API to serve a mjpg stream over HTTP. You can find an example on how to do this [here](https://picamera.readthedocs.io/en/release-1.13/recipes2.html#web-streaming).

<figure>
    <img src="{{site.urlimg}}dusan_andric/bombolone/pi-connected.png" />
    <figcaption>Power over USB C, display via HDMI, and Wireless USB dongle for keyboard/mouse.</figcaption>
</figure>

## Software

Now that I had the hardware assembled, I wanted to see how far I could stretch the python script. I left the script running, accessibly by local network for a time. I quickly ran into stability issues. The HTTP access to the stream would become unresponsive when multiple clients would be left streaming, for example, the phones of two ever concerned parents. The python process itself also seemed to leak memory over time, not that was an issue with 4GB of RAM on the RPi4.

### Learning new tricks

Looking around for something that would seem like a good fit for a single board or embedded computer, as well as something I would be excited to learn, I decided on taking a crack at the problem with [Rust](https://www.rust-lang.org/). While still new and evolving, Rust is a fast and efficient language that bring some interesting ideas to the table in terms of memory safety without resorting to garbage collection or reference counting. It also has its own TLS implementation called [Rustls](https://github.com/ctz/rustls) so I could avoid OpenSSL. While there was no guarantee I would write secure software with it, it certainly did not hurt to have a sound foundation.

The choice of a web framework was a decision between [Rocket](https://rocket.rs/) and [Actix-Web](https://actix.rs/). I ended up choosing Actix-Web for two reasons. First Rocket required a nightly build of Rust as it used experimental features of the language which I was not interested in dealing with. Second, Actix-Web is built on top of the actor framework Actix, and anything building on actors is immediately sexier.

My first blocker arose trying to manipulate and talk to the PiCam from my Rust application. First, I fell into the trap of thinking that the Video4Linux drivers would just work with the PiCam (linux is linux right?), which of course they did not. Then I came to realize that there were no higher level Rust APIs for the camera and that I would be forced to use the Multi-Media Abstraction Layer (MMAL) API with the VideoCore drivers which I judged to be too much of a time sink.

### Microservices to the rescue

There is a utility called mjpg-streamer that allows for the streaming of mjpg from several input types to several different output types. One of those outputs can be HTTP, and more importantly, there is a fork of the project that allows for the PiCam to be used as an input. You can find the project on GitHub [here](https://github.com/jacksonliam/mjpg-streamer). Testing it out, I found it to be super stable and utilized very few resources. Now that I could spin out the mjpg stream to a separate process, reachable by HTTP, the architecture for the system quickly materialized into the following:

<center>
<figure style="width: 60%">
    <img src="{{site.urlimg}}dusan_andric/bombolone/arch.png" />
    <figcaption>Even tiny concerns can be separated.</figcaption>
</figure>
</center>

This now meant that generating a video stream was a solved problem and I could concentrate on building out some simple auth for pairing, a web server to host the front end, and a reverse proxy for the video stream and eventually environmental sensor data.  

### Bombolone

The Rust project materialized into what I named [Bombolone](https://github.com/andricDu/Bombolone), named after the delicious Italian treat and also a nickname we use for our baby.

App configuration is handled by the dotenv library, which takes after its NPM namesake. Auth / Device Pairing is handled via QR Code generated from a configured secret. For initial pairing, the code is printing to stdout, after which a paired client can share the QR code from the UI. The Actix-Web framework already has ways of handling things like auth, identify, CORS, and so on, so integrating this was a breeze.  

<center>
<figure style="width: 70%">
    <img src="{{site.urlimg}}dusan_andric/bombolone/startup.png" />
    <figcaption>Bombolone on startup. Go ahead, try scanning.</figcaption>
</figure>
</center>

Here is the full dependency list in my `cargo.toml` file to give you an idea what I used.

```toml
[dependencies]
actix-web = { version = "3", features = ["rustls"] }
actix-rt = "1.0"
actix-cors = "0.4.0"
actix-identity = "0.3"
actix-files = "0.3.0"
dotenv = "0.15.0"
rustls = "0.18"
url = "2.0"
futures = "0.3.1"
failure = "0.1.3"
log = "0.4"
qrcode = "0.12.0"
serde = { version = "1.0.43", features = ["derive"] }
serde_json = "1.0.16"
env_logger = "0.7"
time = "0.2.22"
```

Speaking of a breeze, compiling Rust, and in particular the production builds of my app, really pushed the CPU to its limits, so I resorted to blowing on it to make compilation go faster. After doing this exactly one time, I investigated cross compilation from my beefy AMD64 machine to the RPis ARMv7 architecture. Setup for this was trivial and it allowed me to build ARM binaries very quickly and ship them over to the RPi for testing.  

Being able to do this cross-compilation easily was one of the benefits of decoupling the video generation from the app, as I did not have to deal with any driver linking nonsense. The other benefit turned out to be that I could test my app on an AMD64 machine provided I could generate a video stream from my webcam.  

<figure>
    <img src="{{site.urlimg}}dusan_andric/bombolone/bombolone-compile.png" />
    <figcaption>The package manager for rust is called Cargo.</figcaption>
</figure>

For the UI, I quickly wrote a small single page application in Typescript and React. My main requirements for the UI were for it be able to scan QR Codes for login and for it to have a dark background so opening it doesn’t illuminate my whole condo.

I ended up using an off the shelf QR Reader component I found on npm. It worked well enough though sometimes it had issues reading the QR Code from my terminal under certain colour themes.

```jsx
<div className="column center aligned">
    {
        this.state.showQr
        ? <QrReader delay={300} onError={(err) => this.handleError(err)} onScan={(data) => this.handleScan(data)} style={{ 'width': '100%', 'margin-right': '-50%' }}/>
        : <button className="ui button" onClick={() => this.showQr()}>Scan QR Code</button>
    }
</div>
```

## Ship It!

With the main software components ready, it was time to handle the infrastructure. I needed to figure out how to make my baby monitor reachable form the internet for when I am out the house. I already own a domain, but the real trick is how do I solve the issue of being behind a carrier grade NAT.  

Without going into too much detail, the consequence of being behind a NAT managed by your ISP, is that you and several other customers of your ISP will be using the same public internet IP thus making it impossible to directly route to your home router and baby monitor. An analogy would be the following: imagine if you had a condo building that had no unit numbers. It would be impossible to mail a letter directly to a resident.  

I solved this problem by deploying a VM in a local data center with which I would assign a public IP to, and then my RPi would create a reverse SSH tunnel to this VM, forwarding the relevant ports back to itself. Creating an A Record in my DNS config, applying proper network security and iptables rules, generating valid SSL/TSL certificates with Let’s Encrypt, and we were in business!

<center>
<figure style="width: 50%">
    <img src="{{site.urlimg}}dusan_andric/bombolone/phone-view.png" />
    <figcaption>Up and running.</figcaption>
</figure>
</center>

## Satisfaction?

I’m happy, but more importantly, my wife is also satisfied with the solution. It works, it is stable, and we can see our baby snoozing from our phones.  

After a few months of use, there was some moving of furniture and I damaged the IR emitting diodes causing the night vision to no longer work. Replacing these for a few dollars was much better than spending potentially hundreds on a new camera module for a consumer solution. If you were keeping tally up to this point, I have now addressed all my original problems that sent me down this path.

## Next Steps
There are a few features that would be fun to implement. Unique codes per client with per client metrics, which would necessitate some sort of database. Rust has an excellent ORM called [Diesel](https://github.com/diesel-rs/diesel), which I played with and it would be a great fit for this. I would also like to purchase a robust gpio sensor kit so I can monitor things like temp and humidity, and then in turn develop a service to communicate that information securely through my reverse proxy. Finally, I would love to deploy the different components onto separate Pi-Zeros so that the camera could be placed in a spot with an excellent viewing angle while the temperature sensor could be placed closer to the baby and away from the hot IR LEDs. The decoupled nature of the individual services meant they could all be deployed independently while still being served through a central hub.

A cool project for all you machine learning junkies would be to feed the image data into [OpenCV](https://github.com/opencv/opencv) to do motion detection, which would allow you to track sleep cycles.

## Conclusion
Raspberry Pi’s are cool, the Rust compiler makes writing Rust code feel like pair programming with a helpful and more senior developer, and I’m still bad with Flexbox.
