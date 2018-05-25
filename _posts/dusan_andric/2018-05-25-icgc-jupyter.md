---
layout: post
title:  "JupyterHub in ICGC"
breadcrumb: true
author: dusan_andric
date: 2018-05-25
categories: dusan_andric
tags:
    - ICGC
    - Collaboratory
    - Jupyter
    - Analysis
    - Data Science
    - Overture
teaser:
    info: The ICGC Data Portal gets a new analysis tool! 
    image: dusan_andric/jupyter/jupyter.png
header: 
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Introduction

After a successful soft launch, the ICGC DCC Software Engineering is proud to announce the availability of Jupyter notebooks as a new tool in the analysis toolbox within the ICGC Data Portal. 

Users with DACO approval to the ICGC dataset will have the ability to login using their Google credentials. Once inside, users are presented with a familiar looking Jupyter Notebook environment with some value adds provided by us. 

Our goal is to provide researchers and data scientists a way to programmatically explore the available ICGC data and get their hands dirty with some data science and analysis in a way that is sharable and reproducable. 

<figure>
    <img src="{{site.urlimg}}dusan_andric/jupyter/jupyter_signin.png" />
    <figcaption>The Welcome Page</figcaption>
</figure>


Users can get to Jupyter by either visiting the following URL directly in their browser: https://jupyterhub.cancercollaboratory.org/ or by navigating to the [analysis toolbox in the ICGC Data Portal](https://dcc.icgc.org/analysis)

<figure>
    <img src="{{site.urlimg}}dusan_andric/jupyter/analysis_page.png" />
    <figcaption>The Analysis Toolbox</figcaption>
</figure>

## Technology

The main driving project behind our ability to deploy this new feature is JupyterHub. JupyterHub itself is a bundle of three main technologies (tornado, node-http-proxy, jupyter) which allows notebook servers to be provisioned on a per user or session basis. 

The other secret sauce is that we are using the docker spawner for launching new notebook servers using a docker image that we hand rolled ourselves to include the particular customizations and features that we want. JupyterHub and the docker containers all run inside the Cancer Genome Collaboratory cloud. 

We've also extended the Authorization mechanism to perform the required DACO checks for access to the ICGC dataset in addition to generalizing the whole deployment using Ansible.

The Ansible deployment of this solution, from the building of docker images to the launching of VMs, has been made available as [Jukebox](https://github.com/overture-stack/Jukebox) which is part of the [Overture software stack](http://www.overture.bio/).  

<figure>
    <img src="{{site.urlimg}}dusan_andric/jupyter/jukebox.png" />
    <figcaption>A high level overview</figcaption>
</figure>


## Features

The most important fact to know about ICGC Jupyter Notebooks is that they run inside the Cancer Genome Collaboratory, meaning they are co-located with the ICGC dataset itself. This provides the fastest possible access to the data stored there, and we bundle the icgc-storage-client as part of the notebook server containers such that users can interact with this data. The effort has also been made such that all the advanced features of the icgc-storage-client work inside the notebook containers. For example, users will be able to use the FUSE mount capabilities of the client.

<figure>
    <img src="{{site.urlimg}}dusan_andric/jupyter/storage_jupyter.png" />
    <figcaption>Mounting a manifest ID from the ICGC Data Portal inside Jupyter</figcaption>
</figure>

<figure>
    <img src="{{site.urlimg}}dusan_andric/jupyter/coverage_jupyter.png" />
    <figcaption>A simple example of plotting read coverage from a mounted file</figcaption>
</figure>

Additionally, we've also bundled the [ICGC Python API](https://icgc-python.readthedocs.io/en/develop/) for interfacing with the data annotated and indexed in the ICGC Data Portal. This API provides a nice wrapper around the REST API and a programmatic mechanism for downloading the TSV data provided by the dynamic download service. 

<figure>
    <img src="{{site.urlimg}}dusan_andric/jupyter/data_frame.png" />
    <figcaption>Protein expression data from the ICGC Data Portal visualized as a data frame</figcaption>
</figure>

## It's a sandbox!

Even though we've provided a lot of useful tools, users will still have the ability to install any missing packages they require as it is their sandbox to play with. We make no guarantees, but user experience with regard to installing python packages with pip should fairly good. 

It is important to take this time to remind users that as this is a sandbox that will be occasionally updated with additional tools and extra features, and therefore we recommend users download important notebooks to their local machines. One of the most useful things about Jupyter notebooks is that they are downloadable and sharable, and as such, users should build a habit for backing up their notebooks, even possibly going as far as using a VCS like Git to manage their revisions and backups.

Happy data mining!

