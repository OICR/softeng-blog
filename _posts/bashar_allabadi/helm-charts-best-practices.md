
---
layout: post
title:  "Helm for Kuberenetes, Lessons Learned"
breadcrumb: true
author: bashar_allabadi
date: 2021-03-31
categories: bashar_allabadi
tags:
    - Devops
    - Helm
    - Helm Charts
    - Best Practice
teaser:
    info: Team's experience with helm, and the lessons we learnd 
    image: bashar_allabadi/Helm.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Background

We started the ICGC ARGO project (https://platform.icgc-argo.org/) in mid 2019, and it's still on going. so it's relatively new project and the team decided to adopt and use Kubernetes (https://kubernetes.io/) for the first time. 

Kuberenetes is a very powerful and the defacto container orcherstrator tool at this time (not sure if tool is the right word to describe this beast!). K8s comes with a new set of challanges as any other new abstraction layer we introduce in software building process, and one of these challanges is the management of the Resource files we need to create, update and manage to communuicate with K8s on how we want to deploy, scale, control storage and conenct our containers together and monitor their needs and health.

to easily author and maintain these Resource files, which are in YAML, K8s has a package manager, called Helm (https://helm.sh/). Helm is the defacto package manager for K8s and is widely adopted by the indudstry. Briefly, what Helm does is to allow users to create templated YAML files and provide a way to render these templates based on a set of values so that we can reuse these resources and package them in one coherent self contained package (called Chart) and it communicates with K8s APIs to deploy these resrouces after rendering the templates with the provided values (a Release) and gives the users the ability to track the history of their release.

For examples on our charts, you can visit this Repostiory: https://github.com/overture-stack/helm-charts

## Using Helm

To use helm as deployment tool for charts we needed to:
- Have a Helm tool script.
- Create charts and host them:
  -  to host the charts, we have the charts in their own repository and we use github pages as way to host them publicly, it's a quick and easy way to get up and running quickly, see https://github.com/overture-stack/charts-server.
- write the script that will call the helm tool 



