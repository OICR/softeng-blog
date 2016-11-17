---
layout: post
title:  "Staying up to date with Glance Images"
breadcrumb: true
author: jared_baker
date: 2016-11-18
categories: jared_baker
tags:
    - Glance
    - OpenStack
    - Bash
    - Linux
    - Images
teaser:
    info: How we keep our public cloud images up to date, improving the user experience and security!
    image: jared_baker/glanceimages/hashbang.jpg
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Introduction
When users deploy instances in the Cloud the first thing they often do is update their instance with the latest packages & security fixes. That's good practice and we should all be doing that, but as a user I get irritated when a brand new instance requires hundreds of packages to be updated because the cloud image is old and full of vulnerabilities.

<figure>
    <img src="{{site.urlimg}}jared_baker/glanceimages/updates-needed.png" />
    <figcaption>:(</figcaption>
</figure>

As a Cloud admin, part of my job is to provide an efficient but secure user experience. In this post I will share with you how we achieve that by keeping our Glance images in OpenStack up to date.

<figure>
    <img src="{{site.urlimg}}jared_baker/glanceimages/no-updates.png" />
    <figcaption>:)</figcaption>
</figure>

## What does it do?
* Check for new cloud images for various distributions (Ubuntu, CentOS, Debian)
* Alert Cloud admins via email when a new image is available
* Perform checksums along the way to ensure valid images are being downloaded
* Maintain a friendly and consistent image name in OpenStack (ie "CentOS 7 - latest") so users of the cloud can use predictable names in their automated workflows.
* Log script output to a file that is handled by logstash
* By default run as a check & notifier via cron but be able to run interactively to update with added syntax (--update)

#### Prerequisites
* [openstack client](https://github.com/openstack/python-openstackclient)
* [gmail_alert.sh](https://gist.github.com/superdaigo/3754055/)

## The Bash script

##### Disclaimer
I come from a IP Networking & technical support background. I don't claim to be of a developers mindset and clearly you will see that in my rudimentary implementation of automating this task. I encourage you to take this script and make it your own.

[Available here](https://github.com/CancerCollaboratory/infrastructure/blob/master/utils/image_refresh.sh)

## Wish List
These are just a few things I would like to improve upon when I get a bit more time and develop my skills in bash scripting. I will update the script on github when time permits to make these modifications and more!

* Make the script easier to maintain by using for loops
* Check for successful openstack image creation before deletion
* Improve the logging to contain timestamps on each log entry

## Conclusion
 Users will now deploy instances from our public images that contain the latest builds from each Linux distribution. This cuts down on deployment time for the users and reduces exposure to potential vulnerabilities.

 <figure>
     <img src="{{site.urlimg}}jared_baker/glanceimages/glanceimages.png" />
     <figcaption>Nice and clean!</figcaption>
 </figure>
