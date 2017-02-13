---
layout: post
title: "JS + Physical Computing"
breadcrumb: true
author: sid_joshi
date: 2017-02-16
categories: sid_joshi
tags:
    - Javascript
    - IoT
teaser:
    info: Javascript has been around for a while but in the past couple of years it has gained a lot of attention. Its about time we start using 
        JS for purposes other then web development. This article aims to demonstrate what can be achieved in the physical world by using Javascript. 
        It will also point you in the direction of various tools, libraries, frameworks, devices and tutorials that can help you get started. 
header: 
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---
The Wikipedia defines Physical computing as building interactive systems by the use of software and hardware that can sense and respond to the analog world. 
Physical computing includes IoT, robotics, wearables, interactive tangible medias and a lot more.  

If you want to build a robot, you would require hardware, you need some sort of application/software to control the hardware, you'll need controls to move the robot, and the robot needs to respond to 
the controls respectively. But can we build something like this with front-end tools? Yes! 
Of course, we won't be actually building a robot here but looking into different tools, libraries, devices and tutorials that can help you get started on building the things you want.  

There are a lot of JS libraries that you can use to start development on your idea.

* To build robots, use  [johnny-five.js](http://johnny-five.io/)

* For home automation, use  [heimcontrol.js](https://ni-c.github.io/heimcontrol.js/)

* For interactive art, use  [p5.js](https://p5js.org/)
  
We will be looking into working with johnny-five.js and Arduino. 

Arduino is a microcontroller that is cheap, open source and has a great community. 
To make Arduino talk to our JS application, we will first need to install 'firmata' on it. Firmata is a protocol that lets your program communicate with any microcontroller. 
You can check out the guide  [here](http://instructables.com/id/Arduino-Installing-Standard-Firmata/) on how to install firmata on your Arduino. You will only need to do this once. 




