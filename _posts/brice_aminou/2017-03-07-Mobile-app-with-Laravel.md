---
layout: post
title: "Create a mobile app with Laravel PHP Framework"
breadcrumb: true
author: brice_aminou
date: 2017-03-07
categories: brice_aminou
tags:
    - Laravel
    - Android
    - Mobile hybrid app
    - PHP
teaser:
    info: An easy way to create a mobile app from an existing Laravel application
---
This tutorial describes an easy way to create a mobile app from your existing Laravel application. 

Laravel is a free open-source PHP web Framework that helps you build web applications rapidly and efficiently using the model-view-controller (MVC) architectural pattern.
To build a web application, Laravel is comparable to Django (Python) or Ruby on Rails (Ruby). The choice of the right Framework to use for your next application if you are not
familiar with any of them depends on how comfortable you feel with PHP, Python or Ruby. In this post, we are only going to talk about Laravel.

At the end of this tutorial, you will be able to create a hybrid app from an existing Laravel project. A hybrid app has many advantages if you are familiar with HTML, CSS and Javascript:

* The app can be published on the Play Store (iOS also, but it is not part of this tutorial)
* There is no API to build so only one source code to manage
* Works on any platform
* Can access the features of a mobile phone like a native app

This tutorial is using:

* [Apache with PHP 7.0 and MySQL](https://www.digitalocean.com/community/tutorials/how-to-install-linux-apache-mysql-php-lamp-stack-on-ubuntu-16-04) Find the right installation for your OS and your required PHP version
* [Laravel 5.*](https://laravel.com/docs/5.4/installation)
* [Android Studio with latest SDK](https://developer.android.com/studio/index.html)
* Ubuntu 16.04
* [Composer](https://bappa.info/2016/05/07/install-composer-in-ubuntu-16-04/)

## Laravel Installation
If you already have an existing project, you can jump directly to the next step.

SSH to your host and make sure that you have the permissions to edit the directory where your website is going to be hosted. If you do not have the permissions,
ask your server administrator to give you the permissions.

Go to the Apache public directory (Usually /var/www/html, but might change depending on your apache setup)

~~~BASH
  cd /var/www/html
~~~

Create a new Laravel project. In this tutorial, we are going to use composer, but you can also use Laravel Installer [in their documentation](https://laravel.com/docs/5.4/installation#installing-laravel), the result is the same.

~~~BASH
composer create-project --prefer-dist laravel/laravel blog
cd blog
~~~

Change the owner of the following folders to let the apache user (often www-data) have read and write permissions.

~~~BASH
sudo chown –R www-data:www-data storage
sudo chown -R www-data:www-data vendor
~~~

Go to:

~~~BASH
http://{YOUR-DOMAIN-NAME}
~~~

And you should see the following example. If you don't, check your Laravel installation or it might be a permission issue.

<center>
  <figure style="width: 85%;">
      <img src="{{site.urlimg}}/brice_aminou/laravel_mobile/laravel_install.png"/>
      <figcaption>Laravel Installation</figcaption>
  </figure>
</center>

## Integrate laravel-mobile-detect

Go to your project root directory (/var/www/html) and run the following command:

~~~BASH
composer require riverskies/laravel-mobile-detect
~~~

Open the file resources/views/welcome.blade.php
An add the following lines before <!DOCTYPE html>:

~~~html
@desktop 
	<h1>Desktop view</h1>
@elsedesktop
	<h1>Mobile view</h1>
@enddesktop
~~~

Open http://{YOUR-DOMAIN-NAME} on your desktop and you should see:

<center>
  <figure style="width: 85%;">
      <img src="{{site.urlimg}}/brice_aminou/laravel_mobile/laravel_desktop.png"/>
      <figcaption>Laravel Desktop View</figcaption>
  </figure>
</center>

If you open the same page from your device or from [Chrome's simulation with google chrome](https://developers.google.com/web/tools/chrome-devtools/device-mode/),
you should see the following:

<center>
  <figure style="width: 50%;">
      <img src="{{site.urlimg}}/brice_aminou/laravel_mobile/laravel_mobile.png"/>
      <figcaption>Laravel Mobile View</figcaption>
  </figure>
</center>

## Build the mobile app

[Download Slymax Webview](https://github.com/slymax/webview/archive/master.zip)

Open Android Studio

Unzip the downloaded directory and open it in Android Studio

### Edit Slymax Webview template

* Uncomment line 31 in MainActivity.java and replace http://example.com with your URL.
* Uncomment line 34
* Open MyAppWebViewClient.java and replace “example.com” with your domain name.

Replace example.com with your domain URL.

Run the app on your mobile device or using an emulator and that's it!

This is an easy way to create a mobile app from a Laravel application. Next thing would be to create two views, one for desktop and one for mobile. If you
want to create a new app from a Laravel application, I would strongly suggest to look or build a responsive web app template using Phonegap, Cordova or Framework7
so you only have to create one unique view for your pages.
