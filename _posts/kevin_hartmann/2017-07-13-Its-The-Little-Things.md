---
layout: post
title:  "It's the Little Things..."
breadcrumb: true
author: kevin_hartmann
date: 2017-07-13
categories: kevin_hartmann
tags:
    - Software Engineering Club
    - Spring 
    - Gotchas 
teaser:
    info: It's often the little things in life, and in coding, that trip us up.
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---
It's often the little things in life, and in coding, that trip us up. With Spring, it's a single character that can make the difference between code that runs, and code that doesn't; and it's a character that's completely optional in most other contexts. Can you guess what it is, and in which situation this gotcha applies?

Consider a situation where you have a jar file containing a Java program written using the Spring framework, named _CoolProgram.jar_. You put all the configuration files that you want it to use inside a directory called _conf_.

## Why doesn't this work?

```
java -jar --spring.config.location=conf
```

Programmers tend to use the "Principle of Least Surprise" when developing systems in order to make them easier for other programmers to learn; the basic rule is that if something looks the same as it does on another system, it should act the same, too.  

On most systems, most of the time, a reference to "pathname/file" is resolved exactly the same way as "pathname/directory".

So, you might naturally think that the command above should work. 

## Why does this work, instead?

```
java -jar --spring.config.location=conf/
```

The short answer is because Spring defines it that way. The **/** character at the end makes all the difference in the world. 

**spring.config.location** actually behaves something like this: 

1. If the location ends with a "/", treat the location as a **directory**, and use it as a place to look for known configuration files. 
2. If the location **doesn't** end with a "/", treat the location as a **configuration file**. If that location doesn't refer to a valid configuration file, ignore it. 

It's actually slightly more complicated than that, because you can specify multiple directories and multiple files, separated by commas, within a given _spring.config.location_ setting. Worse yet, configuration files are only one of over ten different ways that Spring lets you set (or over-ride) a given property. When Spring fails to do what you expect, it can be very difficult to try to guess what it's actually doing, and it can be very confusing when you don't understand why it's not working when it seems like it should be! 

The most important thing to remember is that, despite all the other powerful auto-configuration magic that Spring can do, for the specific setting _spring.config.location_, Spring can't figure out that your configuration is refering to a configuration directory unless you explicitly tell it, by adding a "/" to the end of the directory name.

Watch out for this one. It's a simple gotcha, but a perplexing one. When dealing with _spring.config.location_, **always remember the "/" at the end** of the directory name, or you, too, might waste an afternoon trying to figure out why Spring can't find your configuration files for you.
