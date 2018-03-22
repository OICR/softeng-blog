---
layout: post
title:  "Drops of Jupyter..."
breadcrumb: true
author: kevin_hartmann 
date: 2018-03-19
categories: kevin_hartmann
tags:
    - JupyterHub 
    - Jupyter Notebooks 
    - Docker 
    - Ansible 
teaser:
    info: "or, How I Learned To Stop Worrying and Dockerized JupyterHub" 
    image: kevin_hartmann/jupiter.jpg
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---
### Warning!
*This post contains references to technology, computer programming, and other, related content. Should you find yourself confused by anything you read, feel free to skip over it until later, or omit it entirely. Don't feel bad about it: it's how people learn: I learned most of what I know by absorbing data in small pieces, and most of the smartest people I know do, too. With that said, let's continue on to the wild and tempetuous world of JupyterHub!*

<image src="{{ site.urlimg }}/kevin_hartmann/jupiter.jpg" alt="Weather vortex pattterns on planet Jupiter" />

Hey, wait! That's the surface of **Jupiter**, the planet! We're talking about **Jupyter**, with a 'y', as in [**Jupyter Notebooks**](https://jupyter-notebook.readthedocs.io/en/latest/notebook.html) and their multi-user counterpart, [**JupyterHub**](http://jupyterhub.readthedocs.io/en/latest/)! 


These guys? <img src="{{ site.urlimg }}/kevin_hartmann/jupyterhub.svg" alt="JupyterHub logo">

Yeah, those guys! That's much better!

This blog post is about how I set up JupyterHub [here](https://jupyterHub.cancercollaboratory.org). The place where I work, the [Ontario Institute for Cancer Research](https://oicr.on.ca) hosts petabytes (millions of gigabytes) of genomic data inside a powerful cloud computing center, as part of its role as a member of the International Cancer Genome Consortium [ICGC](https://dcc.icgc.org).

Our goal was to give [DACO](https://icgc.org/daco) approved cancer researchers a fast and easy way to access all that data. Traditionally, researchers download data sets onto their computer, and then run programs to analyse that data. But for people researching genomic data, where a single DNA sequence can be gigabytes in size, just downloading enough data to do their analysis can take days, or even weeks.
 
Cloud computing lets us reverse the problem: bring the (small) programs to the (big) data, in a way that's interactive, user friendly, and secure. By offering researchers the chance to access data directly on our network, we can cut down on those days or weeks of wait time, and let them get to work right away. That's the solution the [Cancer Collaboratory](https://cancercollaboratory.org) provides.

### Off to Jupyter...

**Jupyter Notebooks** offer a user friendly, interactive way for you to run Python code on a remote server -- right your own web browser! You can email, save, upload, and download indivual notebook files; which include the code that was run, annotations about the code written in Markdown (which lets you write scientific and mathematical symbols using MathML), and the output that the code produced.
With the right python modules, Jupyter Notebooks can even produce charts, graphs, and more!

**JupyterHub** is a server for Jupyter Notebooks that handles things like multiple users, security, and authentication. In our configuration, each user gets access to their own private Jupyter Notebooks, and each user's code is run inside their own virtual machine using [Docker](https://www.docker.com) 

To get started, we decided to run JupyterHub on a single virtual machine within the Cancer Collaboratory. That way, we can give researchers a chance to get started using our data and our systems, to learn, and to experiment -- with no system to configure or administer, no huge datasets to download, and no programs to download. All they need is DACO approval (legal permission to access the research data), and a web browser: we'll set up JupyterHub to do the rest!

Since our service will be hosted on a virtual machine inside an [OpenStack](https://www.openstack.org/) cluster, we naturally want to be able to re-build the whole thing from scratch should the need arise, without having to work too hard at it. We use [*Ansible*](https://www.ansible.com/) for automation of these sorts of things, so I created an Ansible playbook to set up the virtual machine, and set up **JupyterHub** to run as a [*Docker*](https://www.docker.com) container within the virtual machine.

# The play's the thing...
<image class="foo" src="{{ site.urlimg }}/kevin_hartmann/yorick.jpg" width="50%" /> 

### In which, our hero customizes an Ansible playbook 

I set up an ansible playbook with these four tasks: 

1. Create the virtual machine using OpenStack
2. Ensure that the virtual machine is running python (so Ansible can run)
3. Create the users and permissions on the virtual machine 
**and**
4. Set up the JupyterHub server

In order to accomplish these four tasks, I created the following five Ansible roles:

1. **OpenStack:** Accomplishes the OpenStack setup task
2. **users**: Creates the users and groups necessary to run Docker, and the JupyterHub service itself.
3. **certbot**: Runs "certbot" to create a signed SSL certificate for the site [certbot](https://certbot.eff.org), and sets up a cron job that will automatically re-generate the certificate before it expires.
4. **Docker**: Installs Docker on the virtual machine, and sets up our Dockerized JupyterHub system run from a single command.
5. **JupyterHub**: Adds a service configuration for JupyterHub that launches our Dockerized JupyterHub system when the VM boots up, which lets start and stop it like any other service.

### If at first you don't succeed... 

Each step in our Ansible playbook is designed to be re-run if a play fails to complete for any reason. There can be a lot of different steps to configure, but we keep things organized by putting all of that configuration information into two files that do only one thing: set Ansible variables.

One set-up file holds public information, and gets checked into the public repository. The second file is added to the .gitignore file; it contains all of the passwords, SSL certificates, secret keys and other details that should be kept private.

All of the settings are in one place, so changes are fast and easy.

For example, I was able to demo a new prototype version of our system on the same (production) server that was running our old code -- by changing the username of the service, and the port number, I could safely deploy our Ansible script, confident in the knowledge that the new service would not interfere with the old one.

## You've got to keep 'em separated... 

<image src="{{ site.urlimg }}/kevin_hartmann/tangled-wires.jpg" /> 

Docker runs virtual machines. We already have a virtual machine to run JupyterHub on: so why Dockerize the service?

For us, using Docker simplifies development and testing. By using Docker, I can separate many of the issues related to running the virtual machine (and it's associated networking, services, security concerns, and so on) from the configuration of the JupyterHub system itself.

And by using Docker, I and other developers can spin up a copy of JupyterHub on our computer, make any changes we want to the look and feel or operating features that our JupyterHub system should have, and then deploy it.

Within the JupyterHub system, I further isolated the section of the python module that sets up all the web related settings for JupyterHub (the css modules, the template files, and so on), by providing a symbolic link from the service directory to the relavent section of the python library module. That way, we can isolate the changes we make to the JupyterHub front end from the python code that launches those changes; making it easy to change the web side of the system without worrying too much about the code itself.

# What's this button do? 
<image src="{{ site.urlimg }}/kevin_hartmann/cat.gif" /> 

What are the parts of our Dockerized JupyterHub, and how do they all work?

Well, to start with, we have:

- *Docker_compose.yml* : A Docker service  configuration file 
- *build.sh* : A build script that runs all of the Docker commands that we need to build and set up everything from scratch. It creates the Docker network, Docker volumes, builds the Docker images, and so on.
- *hub*: A directory for the JupyterHub server specific details
- *notebook*: A directory for the Jupyter notebook specific details 
  **and** 
- *reset.sh* : A convenience script for development that brings down our service; deletes our old JupyterHub image; builds the new image, and brings the service back up

So far, so good. But what are the contents of the *hub* and *notebook* directories? Let's look at our requirements for our JupyterHub service first, so that we know what files we'll need for the *hub* directory, and then we'll look at the *notebook* directory.

### JupyterHub, at your service... 

Our JupyterHub service's job is to present the main login screen, authenticate our end users using single sign on, and to spin up the right Docker container with the right Docker storage volume mounted for our end-user's account. 

To make matters slightly more complicated, we have our own custom Docker authenticator ( which verifies that our end users have [DACO access](http://icgc.org/daco) ) that we also want to run, and we have some other look and feel settings that we would like to customize for the sign-on portion of our end user's web experience.

### For those who have been keeping notes... 

As for our *notebook* directory, we want our Jupyter notebooks to work like this. Once our end users have authenticated and logged in, we want each of them to be able to run their own Jupyter notebook inside their own Docker container. 

We will also provide our users with their own copy of a demonstration notebook that demonstrates some of the features available on our system when they first 
log in, and how to get started using them, and we want to make the power of the entire [Anconda](https://www.anaconda.com/distribution/) python distribution, which provides over 1,000 science related python modules,  available to them, too, as well as the the ability to write programs using *R* or *scala*. 

JupyterHub provides a Docker image that contains everything we want: but that image is over 6GB. We don't really want one 6GB Docker image per user: a single copy of all that code will do. So, we build their Docker image like normal; then copy over the content that we want into a Docker volume. Then we mount that same volume as read-only, so all of our users can share it, but none of them can make changes that will impact the others.

We can then use the smallest Docker image that JupyterHub provides, install our custom software, and then mount our shared volume. With all these goals in mind, how do we put the pieces together?

# I know the pieces fit...
<image src="{{ site.urlimg }}/kevin_hartmann/square-peg-round-hole.jpg" /> 

### Part 1: JupyterHub  

Our set up for our *hub* directory looks like this:
  - *Dockerfile.JupyterHub-core*: This Dockerfile builds our base image, which contains the base JupyterHub installation, oauthenticator, and Dockerspawner.
  - *Dockerfile.custom*: This Dockerfile is based upon JupyterHub-core, but isolates our customizations from the base system. Because Docker caches previously built images, re-building this image is fast and easy.  
  - *JupyterHub_config.py*: One of the reasons that some people find JupyterHub difficult to install is because JupyterHub's configuration file is actually a Python script. This is great for people who know Python; but less great for people who don't. I customized our JupyterHub configuration script so that if an environment variable called DEV_MODE is set, JupyterHub will run a dummy authenticator that always succeeds, instead of the normal Oauth and DACO authentication steps.
  - *secrets*: This directory is where Ansible places a copy of the SSL certifications created by certbot. If we're running in DEV_MODE, this directory can be empty.
  - *auth_daco*: A directory that holds our python code for our DACO authentication, we have one more directory
  - *environment*: Environment variables used to configure JupyterHub
  - *oath.env*: An environment variable configuration file containing our OAuth secret keys. Ansible will set this up for us when we deploy a real run; if we're running in DEV_MODE, this file can be empty.
  - *www_custom*: The directory which stores our changes to the base JupyterHub web page look and feel. Our Docker image copies this code in, over-writing existing data files in the **JupyterHub** python module 
  - *dshell*:  A command which gives you a root shell inside the running JupyterHub Docker container, so that you can make modifications to the server look and feel at run-time, and see the changes immediately, and decide which ones to keep. To make this process easier, we also mount a local directory called "share", so that we can copy web related files to/from the JupyterHub container, so it's relatively easy to make changes to the look and feel of the JupyterHub container.

### Part 2: Jupyter Notebooks

We have a similar set-up for the notebook environment:

- Dockerfile.create-volume: Installs the complete *anaconda* compilation of python libraries, plus other any python modules that we want to mount with our /opt volume, such as our icgc-python module or our web_page customizations to the notebook python module  
- Dockerfile.notebook: Adds in our custom changes to the minimal JupyterHub notebook, as well as adding in our ICGC specific code for downloading files from our cloud (ICGC-GET), and the Oracle JVM that it depends upon
- *demo.ipynb*: The demonstration notebook that we want to add into our notebook image, so our end users can dive in right away,and start exploring our system and it's services
- *www_custom*: A directory containing the web related changes for to the **notebook** python module

# What could possibly go wrong?

<image src="{{ site.urlimg }}/kevin_hartmann/oops.jpg" /> 

What were the issues that I had to address when setting up JupyterHub on our systems? As usual, most of them came down to issues of documentation.

For example, I originally made the mistake of trying to set the "HubIp" field to an IP address, reasoning to myself that it should an IP address that the JupyterHub service could reference itself from. The IP address "127.0.0.1" (the local host address) was an obvious choice; but it didn't work, because that's not what the "HubIp" field is for. 

The "HubIp" field should *not* be set to an IP address; but rather, an internal **hostname** that the Jupyter Notebook server can use to contact the JupyterHub server across the Docker internal network! 

That's easy enough: we set it to *hub*, which is the name of our JupyterHub service in our docker-compose configuration file. Our *docker-compose* command takes care of the rest for us. It automatically create DNS entry over the Docker network that we've specified: so the hostname *hub* will point to the IP of whichever Docker container is running our JupyterHub service. Now, all we have to do is ensure the Docker container that our Jupyter Notebook is running can access also our Doccker internal network. So, we configure our JupyterHub server to launch our notebooks with the right Docker networking options, and we're done.

But, what do we set the Jupyter Notebook IP address and port number to? After struggling with the issue, I found that the simplest answer is "We don't!" We just omit those configuration settings entirely, and set the internal IP networking setting to 'true'. After that, the Jupyterhub system defaults work fine on their own, and figure everything out for us.

I also had an issue with the names of Docker volumes: our OAuth modules let our users log in using their Google email addresses as usernames; but Docker volumes can't have an '@' symbol, so things kept failing. Once again, what worked was omitting the setting entirely; the default volume name includes the username with all special characters escaped properly. 

The moral of the story? When trying to configure a complex piece of software, try to use the default settings whenever possible. They're usually (but not always) the most well-tested part of the codebase, because they're the ones that people use the most!

# In Summary...
<image src="{{ site.urlimg }}/kevin_hartmann/calculator.jpg" /> 

We use Docker to run JupyterHub so that we can abstract away specific details bout about how JupyterHub is being run, like where the SSL keys are located, or which url to use for the authentication service. We set up JupyterHub to talk to the Jupyter Notebooks across an internal Docker network; and persist state for the JupyterHub service and the individual notebooks in individual Docker volumes so that all our Docker containers will survive a reboot intact.

This way, we can deploy JupyterHub anywhere, just by tweaking the environment we run it in, and specifically, we can run it locally in development mode before deploying it onto our production servers. 

We use Ansible to take care of the details of setting up a virtual machine, setting up users and permissions, setting up environment variables with passwords and access tokens that Docker will use to run, and so on... 

We use two Docker images for each Jupyter service to keep our build times fast. We use the JupyterHub's default Docker image, the one with all of the biology themed Python modules bundled by Anaconda. Because that image is very big, we copy the contents we care about onto single Docker volume; and share that volume in read-only mode with all of our Jupyter Notebook users. 

We keep our local customizations and web content separate from the base JupyterHub Docker images, and we use environment variables to pass in changes to our configuration files. 

We launch everything with docker-compose, build everything with Ansible, and runa simple shell script that to set up all our Docker networks, volumes, and images. Thanks to Ansible, we can tear down our entire virtual machine, and rebuild it from scratch, all with a single *Ansible-playbook* command.

For more information on the technologies mentioned in this blog post, see the links section below. 

So, now you, too, know how to spin up a a JupyterHub service on a Cloud Computing cluster! Aren't you glad you read this post? 

### References 

Here's a list of links to technologies mentioned in the article:

- [Ansible](https://www.ansible.com/) 
- [Anconda](https://www.anaconda.com/distribution/) 
- [Certbot](https://certbot.eff.org)
- [DACO](http://icgc.org/daco)
- [Docker](https://www.docker.com)
- [ICGC](http://icgc.org)
- [Jupyter](https://www.jupyter.org)
- [JupyterHub](http://jupyterhub.readthedocs.io/en/latest/) 
- [OpenStack](https://www.openstack.org/) 

And last, but not least: if you want to see the full details of what I did, and how I did it, you can find my full source code [https://github.com/overture-stack/Jupyter](https://github.com/overture-stack/Jupyter)
