---
layout: post
title:  "Day 1 as a Collaboratory User"
breadcrumb: true
author: jared_baker
date: 2017-10-20
categories: jared_baker
tags:
    - OpenStack
    - ICGC
    - cloud
    - tutorial
teaser:
    info: A tutorial - from signup to downloads of Cancer data at the Cancer Genome Collaboratory!
    image: jared_baker/day1collab/icgc-collab-splash.png
header:
    version: small
    title: Software Engineering Blog
    image: icgc-collab-splash.png
    icon: icon-blog
---

## Introduction
This is a tutorial meant to cover the steps required to get from signup to downloading of Cancer data at the Cancer Genome Collaboratory. Cancer researchers looking to perform analysis at the Collaboratory will need to do a number of things before they can start their analysis. I will walk you through each step to help get you on your way!

## Prerequisites
* [Obtain DACO approval.](http://icgc.org/daco) This is a Collaboratory prerequisite and all users of the Collaboratory must have DACO approval. DACO handles requests from scientists for access to controlled data from the International Cancer Genome Consortium (ICGC).

* [Request Collaboratory account](http://www.cancercollaboratory.org/services-request-account). The Cancer Genome Collaboratory is the Compute environment and also home to an object storage repository containing hundreds of terabytes of ICGC data. A new & easier signup page is coming soon. Upon signup, you will receive your account details via email.

## Summary of Steps
1. [Log in to the Collaboratory OpenStack dashboard](#1)
2. [Create a SSH key pair](#2)
3. [Create an instance](#3)
4. [Assign a floating IP](#4)
5. [Allow SSH access to the instance](#5)
6. [SSH to the instance](#6)
7. [Install icgc-storage-client](#7)
8. [Configure icgc-storage-client](#8)
9. [Download ICGC data using icgc-storage-client](#9)

<a id="1"></a>
## Step 1: Log in to the Collaboratory OpenStack dashboard

In a browser, go to <https://console.cancercollaboratory.org> and log in using your provided credentials received via email during sign up.
<figure>
    <img id="console-login" src="{{site.urlimg}}jared_baker/day1collab/1-console-login.png" data-featherlight="#console-login" />
</figure>

The Collaboratory OpenStack dashboard is where you will manage your cloud environment, creating things like instances, volumes (additional storage), and security groups (firewall rules), etc.

<figure>
    <img id="console-summary" src="{{site.urlimg}}jared_baker/day1collab/1-console-summary.png" data-featherlight="#console-summary" />
</figure>

<a id="2"></a>
## Step 2: Create a SSH key pair
Before creating any instances you will need to define a key pair which will be used to authenticate you when you SSH to your instances. Give your key a meaningful name and click 'Create Key Pair'.

<figure>
    <img id="create-key" src="{{site.urlimg}}jared_baker/day1collab/2-create-key.png" data-featherlight="#create-key" />
        <figcaption>SSH keys are used in favor of login/password authentication</figcaption>
</figure>

The key is downloaded by your browser as \<key-name>.pem. Make sure to restrict access to this file as it is your private key.

~~~bash
chmod 600 collaboratory-key.pem
~~~

Note, if you are on Windows and use Putty you will need to convert your .pem to .ppk.  [Follow these instructions](https://github.com/davidheijkamp/docs/wiki/Howto:-Creating-and-using-OpenStack---SSH-keypairs-on-Windows)

You can create and manage your keys from the Access & Security tab.

<figure>
    <img id="key-list" src="{{site.urlimg}}jared_baker/day1collab/2-key-list.png" data-featherlight="#key-list" />
</figure>

You can also view the detail of your keys and see the public key pair which is used on the instances you created and stored in the Collaboratory.

<figure>
    <img id="key-detail" src="{{site.urlimg}}jared_baker/day1collab/2-key-detail.png" data-featherlight="#key-detail" />
</figure>

<a id="3"></a>
## Step 3: Create an instance
Instances are Virtual Machines, aka VM's. Let's begin creating one by clicking 'Launch Instance' under the 'Instances' tab. This will launch a wizard where we will need to provide some additional information before it can be created.

Provide a useful name to identify the instance by. Leave the count at 1. If we wanted more instances like the one we are creating we could put the number desired here and your instances would be named dynamically. Example, if our instance name was 'my-first-instance' and the count was 3, we would have 3 instances with names 'my-first-instance-1, my-first-instance-2, my-first-instance-3'.

<figure>
    <img id="instance-name" src="{{site.urlimg}}jared_baker/day1collab/3-instance-name.png" data-featherlight="#instance-name" />
</figure>

The Source tab is where you will choose the Operating System that your instance will run. Ensure that the boot source is **'Image'** and not 'Volume' and that 'Create New Volume' is set to **'No'**. This will make sure that the instance is provisioned correctly and will use the local disk of the underlying compute host. An instance backed by a Volume will have lower disk I/O performance and will incur extra charges.

<figure>
    <img id="instance-source" src="{{site.urlimg}}jared_baker/day1collab/3-instance-source.png" data-featherlight="#instance-source"/>
</figure>

Instances in the Collaboratory come in different *flavours*. Flavours are what defines the specifications (# of CPU, RAM, and local disk space) of the instance. Choose an appropriate flavour to meet your computing needs while keeping in mind that you will have to terminate the instance and recreate it with a different flavour if you need a smaller or larger flavour. One other option would be to take a snapshot and start a new instance from it, but the flavour of the instance started from a snapshot cannot be smaller than the flavour of the instance initially being snapshotted.

<figure>
    <img id="instance-flavor" src="{{site.urlimg}}jared_baker/day1collab/3-instance-flavor.png" data-featherlight="#instance-flavor" />
</figure>

Select a Network for your instance to communicate on. New projects already have a network created for them, but you can create more if needed.

<figure>
    <img id="instance-networks" src="{{site.urlimg}}jared_baker/day1collab/3-instance-networks.png" data-featherlight="#instance-networks"/>
</figure>

Security groups are the firewall for an instance. They define what can and can'grt go to/from your instance over the network. Choose the default security group for now as we will modify this later on.

<figure>
    <img id="instance-secgroups" src="{{site.urlimg}}jared_baker/day1collab/3-instance-secgroups.png" data-featherlight="#instance-secgroups"/>
</figure>

Add your key pair to the instance. This will ensure that your instance will be injected with the appropriate public key allowing you to authorize yourself against the instance via SSH. At this point we can skip the rest of the Launch Instance wizard and click the 'Launch Instance' button!

<figure>
    <img id="instance-keypair" src="{{site.urlimg}}jared_baker/day1collab/3-instance-keypair.png" data-featherlight="#instance-keypair" />
</figure>

<a id="4"></a>
## Step 4: Assign a floating IP
In order to reach your instance from the Internet, we need to associate the instance with a Floating IP (aka Public IP). Follow the screenshots!

<figure>
    <img id="float-associate" src="{{site.urlimg}}jared_baker/day1collab/4-float-associate.png" data-featherlight="#float-associate"/>
</figure>

<figure>
    <img id="float-add" src="{{site.urlimg}}jared_baker/day1collab/4-float-add.png" data-featherlight="#float-add" />
</figure>

<figure>
    <img id="float-allocate" src="{{site.urlimg}}jared_baker/day1collab/4-float-allocate.png" data-featherlight="#float-allocate" />
</figure>

<figure>
    <img id="float-commit" src="{{site.urlimg}}jared_baker/day1collab/4-float-commit.png" data-featherlight="#float-commit" />
</figure>

<a id="5"></a>
## Step 5: Allow SSH access to the instance
Now we have an instance with a Floating IP. We are almost ready to SSH to it! First we will need to modify the security group associated with our instance 'default' to allow SSH access from the Internet.

From the Access & Security, Security Groups tab, click Manage rules

<figure>
    <img id="secgroup-manage" src="{{site.urlimg}}jared_baker/day1collab/5-secgroup-manage.png" data-featherlight="#secgroup-manage" />
</figure>

Add a rule for SSH from the drop down. Provide a range of IP addresses to allow SSH FROM, such as your corporate IP space or alternatively you can leave it open to all (0.0.0.0/0 - less secure)

<figure>
    <img id="secgroup-add" src="{{site.urlimg}}jared_baker/day1collab/5-secgroup-add.png" data-featherlight="#secgroup-add" />
</figure>

<a id="6"></a>
## Step 6: SSH to the instance
It's time to SSH to your instance.

You will need:
- The floating IP address of the instance
- Your SSH private key (the .pem downloaded in step 2)
- The username, which is standardized based on what OS/Image used (ubuntu, centos, debian). Usernames can be viewed in the image description.

~~~bash
ssh -i <key.pem> <username>@<floating-ip-address>
ssh -i collaboratory-key.pem ubuntu@142.1.177.144
~~~

For Windows + Putty users, you will need to convert the .pem to .ppk. See instructions [here](https://github.com/davidheijkamp/docs/wiki/Howto:-Creating-and-using-OpenStack---SSH-keypairs-on-Windows)

<a id="7"></a>
## Step 7: Install icgc-storage-client
The ICGC storage client is an application that allows you to download ICGC data from Collaboratory's protected object storage. It's available as a stand alone client or docker container. [More detailed instructions here](http://docs.icgc.org/cloud/guide/#installation)

First, install the prerequisite java packages on your instance

~~~bash
sudo add-apt-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java8-installer
~~~

Download & Extract the icgc-storage-client

~~~bash
wget -O icgc-storage-client.tar.gz https://dcc.icgc.org/api/v1/ui/software/icgc-storage-client/latest
tar -xvzf icgc-storage-client.tar.gz
~~~

Ensure the client runs
*(The binary is located in the 'bin' directory to where it was extracted)*

~~~bash
./icgc-storage-client --version

> ICGC Storage Client

  Version: 1.0.23
  Built:   10.01.2017 @ 15:03:36 EST
  Contact: dcc-support@icgc.org
~~~

<a id="8"></a>
## Step 8: Configure icgc-storage-client

First obtain or generate your token by logging in to the [The ICGC Data Portal](https://dcc.icgc.org)

<figure>
    <img id="icgc-logged" src="{{site.urlimg}}jared_baker/day1collab/8-icgc-logged-in.png" data-featherlight="#icgc-logged" />
</figure>

<figure>
    <img id="icgc-token" src="{{site.urlimg}}jared_baker/day1collab/8-icgc-tokenmgr.png" data-featherlight="#icgc-token" />
</figure>

<figure>
    <img id="icgc-tokenlist" rc="{{site.urlimg}}jared_baker/day1collab/8-icgc-tokenlist.png" data-featherlight="#icgc-tokenlist" />
</figure>

Copy your token ID and paste it in to the accessToken line in 'application.properties' in the 'conf' directory of the icgc-storage client. Additionally, for improved download performance you can increase the amount of memory and CPU available to the application. If your instance has 8 cores and 48 GB of RAM then use the following:

~~~bash
transport.memory=6
transport.parallel=7
~~~

This will allow 7 parallel download streams with each using 6 GB of RAM to improve the download speed.

Save and exit!

<figure>
    <img id="icgc-appprop" src="{{site.urlimg}}jared_baker/day1collab/8-icgc-appprop.png" data-featherlight="#icgc-appprop" />
</figure>

<a id="9"></a>
## Step 9: Download ICGC data using icgc-storage-client

Using the [ICGC data portal](https://dcc.icgc.org) find the data of interest, ensuring it's available in the Collaboratory using the built in filtering and copy the object ID

<figure>
    <img id="icgc-copyid" src="{{site.urlimg}}jared_baker/day1collab/9-icgc-copyid.png" data-featherlight="#icgc-copyid" />
</figure>

On your instance, run the icgc-storage-client specifying the collab profile, the object id, and the download directory

~~~bash
$ sudo ./icgc-storage-client --profile collab download --object-id ea845b18-9e46-5d16-9657-9b56fa4a2b0e --output-dir ~
Downloading...
-------------------------------------------------------------------------------------------------------------------------------
[1/2] Downloading object: 707ef945-695b-5e1e-80a8-228d168adfcd (PCAWG.8631d5c8-dd36-11e4-b9d1-4999c254ba06.TopHat2.v1.bam.bai)
-------------------------------------------------------------------------------------------------------------------------------
100% [##################################################]  Parts: 1/1, Checksum: 100%, Write/sec: 0B/s, Read/sec: 14.4M/s
Finalizing...
Total execution time:        370.9 ms
Total bytes read    :       5,191,592
Total bytes written :               0
Verifying checksum...Done.
-------------------------------------------------------------------------------------------------------------------------------
[2/2] Downloading object: ea845b18-9e46-5d16-9657-9b56fa4a2b0e (PCAWG.8631d5c8-dd36-11e4-b9d1-4999c254ba06.TopHat2.v1.bam)
-------------------------------------------------------------------------------------------------------------------------------
100% [##################################################]  Parts: 7/7, Checksum: 100%, Write/sec: 0B/s, Read/sec: 31.2M/s
Finalizing...
Total execution time:       3.700 min
Total bytes read    :   7,165,680,103
Total bytes written :               0
Verifying checksum...Done.
~~~

Congratulations! You have successfully downloaded ICGC data from the Collaboratory protected object storage on your Collaboratory instance. At this point you would move on to an analysis phase of the ICGC data using whatever tools available to you.

## Conclusion

This was just a streamlined effort to get you up and running in the Collaboratory. There were many assumptions made along the way and the Collaboratory is a flexible and option rich cloud environment should you want to do things differently.

If you'd like to learn more about advanced usage in the cloud and the icgc-storage-client, please see the links below

[Collaboratory Support (User guide, best practices, etc)](http://www.cancercollaboratory.org/support/overview)

[ICGC Cloud Guide](http://docs.icgc.org/cloud/guide/)
