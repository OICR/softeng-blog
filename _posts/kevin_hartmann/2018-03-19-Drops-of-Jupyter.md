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
    - ansible 
teaser:
    info: "or, How I Learned To Stop Worrying and Dockerized JupyterHub" 
    image: kevin_hartmann/jupiter.jpg
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---
<image src="{{ site.urlimg }}/kevin_hartmann/jupiter.jpg" alt="Weather vortex pattterns on planet Jupiter" />

Hey, wait! That's the surface of **Jupiter**, the planet! We're talking about **Jupyter**, with a 'y', as in [**Jupyter Notebooks**](https://jupyter-notebook.readthedocs.io/en/latest/notebook.html) and their multi-user counterpart, [**JupyterHub**](http://jupyterhub.readthedocs.io/en/latest/)! 


These guys? <img src="{{ site.urlimg }}/kevin_hartmann/jupyterhub.svg" alt="JupyterHub logo">

Yeah, those guys! That's much better!

This blog post is about how I set up [our JupyterHub service](https://jupyterHub.cancercollaboratory.org). It's aimed at a technical audience, so if you don't have that kind of background, don't be afraid to skip over parts that you don't understand right away, and come back to them later. That's how I learned most of what I know about computers; as far as I know, it's how most people still do. With that said, let's carry on into our exploration into the wild and tumultuous world of JupyterHub!

Our JupyterHub service is hosted on a virtual machine inside an [OpenStack](https://www.openstack.org/) cluster, and we naturally wanted to be able to re-build the whole thing from scratch without having to work too hard at it. We use [*ansible*](https://www.ansible.com/) for automation of these sorts of things, so I created an ansible playbook to set up the virtual machine, and set up **JupyterHub** to run as a [*Docker*](https://www.docker.com) container within the virtual machine.

# The play's the thing...
<image class="foo" src="{{ site.urlimg }}/kevin_hartmann/yorick.jpg" width="50%" /> 

### In which, our hero customizes an ansible playbook 

I set up an *ansible* playbook with these four tasks: 

1. Create the virtual machine using OpenStack
2. Ensure that the virtual machine is running python (so ansible can run)
3. Create the users and permissions on the virtual machine 
**and**
4. Set up the JupyterHub server

In order to accomplish these four tasks, I created the following five ansible roles:

1. **OpenStack:** Accomplishes the OpenStack setup task
2. **users**: Creates the users and groups necessary to run Docker, and the JupyterHub service itself.
3. **certbot**: Runs "certbot" to create a signed SSL certificate for the site [certbot](https://certbot.eff.org), and sets up a cron job that will automatically re-generate the certificate before it expires.
4. **Docker**: Installs Docker on the virtual machine, and sets up our Dockerized JupyterHub system run from a single command.
5. **JupyterHub**: Adds a service configuration for JupyterHub that launches our Dockerized JupyterHub system when the VM boots up, which lets start and stop it like any other service.

### If at first you don't succeed... 

Each step in our ansible playbook is designed to be re-run if a play fails to complete for any reason. There can be a lot of different steps to configure, but we keep things organized by putting all of that configuration information into two files that do only one thing: set ansible variables.

One set-up file holds public information, and gets checked into the public repository. The second file is added to the .gitignore file; it contains all of the passwords, SSL certificates, secret keys and other details that should be kept private.

All of the settings are in one place, so changes are fast and easy.

For example, I was able to demo a new prototype version of our system on the same (production) server that was running our old code -- by changing the username of the service, and the port number, I could safely deploy our ansible script, confident in the knowledge that the new service would not interfere with the old one.

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
log in, and how to get started using them, and we want to make the power of the entire [anconda](https://www.anaconda.com/distribution/) python distribution, which provides over 1,000 science related python modules,  available to them, too, as well as the the ability to write programs using *R* or *scala*. 

JupyterHub provides a Docker image that contains everything we want: but that image is over 6GB. We don't really want one 6GB Docker image per user: a single copy of all that code will do. So, we build their Docker image like normal; then copy over the content that we want into a Docker volume. Then we mount that same volume as read-only, so all of our users can share it, but none of them can make changes that will impact the others.

We can then use the smallest Docker image that JupyterHub provides, install our custom software, and then mount our shared volume. With all these goals in mind, how do we put the pieces together?

# I know the pieces fit...
<image src="{{ site.urlimg }}/kevin_hartmann/square-peg-round-hole.jpg" /> 

### Part 1: JupyterHub  

Our set up for our *hub* directory looks like this:
  - *Dockerfile.JupyterHub-core*: This Dockerfile builds our base image, which contains the base JupyterHub installation, oauthenticator, and Dockerspawner.
  - *Dockerfile.custom*: This Dockerfile is based upon JupyterHub-core, but isolates our customizations from the base system. Because Docker caches previously built images, re-building this image is fast and easy.  
  - *JupyterHub_config.py*: One of the reasons that some people find JupyterHub difficult to install is because JupyterHub's configuration file is actually a Python script. This is great for people who know Python; but less great for people who don't. I customized our JupyterHub configuration script so that if an environment variable called DEV_MODE is set, JupyterHub will run a dummy authenticator that always succeeds, instead of the normal Oauth and DACO authentication steps.
  - *secrets*: This directory is where ansible places a copy of the SSL certifications created by certbot. If we're running in DEV_MODE, this directory can be empty.
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

# In Summary
<image src="{{ site.urlimg }}/kevin_hartmann/calculator.jpg" /> 

We use Docker to run JupyterHub so that we can abstract away specific details bout about how JupyterHub is being run, like where the SSL keys are located, or which url to use for the authentication service. 

That way, we can deploy JupyterHub anywhere, just by tweaking the environment we run it in, and specifically, we can run it locally in development mode before deploying it onto our production servers. 

We use ansible to take care of the details of setting up a virtual machine, setting up users and permissions, setting up environment variables with passwords and access tokens that Docker will use to run, and so on... 

We use multiple Docker images, and a Docker volume, copies the data from the Docker image into the volume, run Docker-compose to run JupyterHub, which launches Jupyter notebooks with the volume for the anconda distribution mount on /opt, which lets our users enjoy the fun of Jupyter notebooks without all of the hassle of setting up JupyterHub. 

If you want to see the full details of what I did, you can find my full source code [here](https://github.com/overture-stack/Jupyter)
