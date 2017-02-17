---
layout: post
title: "JS + Physical World"
breadcrumb: true
author: sid_joshi
date: 2017-02-16
categories: sid_joshi
tags:
    - Javascript
    - IoT
teaser:
    info: Javascript has been around for a while but in the past couple of years it has gained a lot of attention. Its about time we start using 
        it for purposes other then web development. This article aims to demonstrate what can be achieved in the physical world by using Javascript. 
        It will also point you in the direction of various tools, libraries, frameworks, devices and tutorials that can help you get started. 
header: 
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---
The Wikipedia defines Physical computing as building interactive systems by the use of software and hardware that can sense and respond to the analog world. 
Physical computing includes IoT, robotics, wearables, interactive tangible medias and a lot more.  

If you want to build a robot, you would require hardware, you need some sort of application/software to communicate with the hardware, you'll need controls to move the robot, and the robot needs to respond to 
those controls respectively. But can we build something like this with JS? Yes! So, why should you use Javascript to start playing with microcontrollers? Its very easy to learn, has a huge community support and 
learning it will also open doors for you into web application development. Or, if you are a web developer and would like a low-barrier way to start developing your cool ideas.

There are a lot of JS libraries that you can use to start development on your idea.

* To build robots, use  [johnny-five.js](http://johnny-five.io/)

* For home automation, use  [heimcontrol.js](https://ni-c.github.io/heimcontrol.js/)

* For interactive art, use  [p5.js](https://p5js.org/)
  
For this blog post we will be looking into working with johnny-five.js and Arduino. Before we get started make sure you have latest verison of `node` and `npm` install.  

Arduino is a microcontroller that is cheap, open source and has a great community. 
To make Arduino talk to our JS application, we will first need to install 'firmata' on it. Firmata is a protocol that lets your program communicate with any microcontroller. 
You can check out the guide  [here](http://instructables.com/id/Arduino-Installing-Standard-Firmata/) on how to install firmata on your Arduino. You will only need to do this once.  

Once the Arduino is set up we can go ahead and install johnny-five using node module. Ideally, we should be setting up a project with a proper `package.json` file, however to make this simple  
we will be installing it globally and working with it right through the console. 

```Javascript
npm install johnny-five -g
```

We will start with a very simple and industry standard **Hello World!** program. In Arduino world a **Hello World!** program basically means blinking and LED. With johnny-five blinking an LED is very simple. 
First we will need to connect our LED to the Arduino board. LED comes with two legs. The shorter leg is ground which would go into arduino's **GND** pin. The long leg can be connected to any of Arduino's digital pins. 
For simplicity and not to involve breadboard we will use pin **13** which is right next to **GND** pin. You can take a look at below diagram to see how it should be connected.

<figure>
    <img src="http://johnny-five.io/img/breadboard/led-13.png" />
    <figcaption>
        Fritzing diagram: <a href="http://johnny-five.io/img/breadboard/led-13.fzz">led-13.fzz</a>
    </figcaption>
 </figure>

So, lets get started on the coding part. We will first require johnny-five library and save it to a variable. In this case `five`. 
Johnny-five supports Arduino out of the box so to initialize it we simply say `new five.Board()`. Once the board is ready we can initialize our LED. For initializing LED we will need to inform johnny-five 
on which pic the LED is connected to. In this case `new five.Led(13)`. You can save it to a variable and use the `blink` function provided by johnny-five to blink the LED at your desired interval.

```Javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var led = new five.Led(13);
  led.blink(500);
});
```

Once the program is uploaded onto Arduino it doesn't need to be connected to the computer. You can remove the USB connector and supply different power source to Arduino to keep the LED blinking.

There you go. The very basic of physical computing. Johnny-five provides lot of functionalities, utilities and tutorials to get you hooked on to Arduino. You can check the [examples](http://johnny-five.io/examples/).  

This example did not include the HTML or CSS the super basic of front-end technologies. To get our microcontroller to talk with HTML, CSS and JS we will need something called **node-webkit** now known as **NW.js**. 
NW.js uses Chromium and is a full NodeJS environment so you can use everything that comes with Node along with your other front-end tools. This set of tools, NW, Johnny-five, and the Arduino, is called the NJA or ninja tool chain. 
To get started with NJA please refer to *Jean-Philippe Côté* tutorial on  [TangibleJs](http://tangiblejs.com/posts/nw-js-johnny-five-arduino-wicked-trio).