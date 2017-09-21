---
layout: post
title:  "How to run Kubernetes in Collaboratory."
breadcrumb: true
author: george_mihaiescu
date: 2017-09-21
categories: george_mihaiescu
tags:
    - OpenStack
    - Collaboratory
    - Kubernetes
teaser:
    info: How to run Kubernetes in Collaboratory
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Introduction
This blog is based on the https://cloudblog.switch.ch/2017/06/26/deploy-kubernetes-on-the-switchengines-openstack-cloud/, but I had to adapt it to work in Collaboratory where we don't have LbaaS, or more than 1 floating IP per project usually.

First, you will have to start a jumpserver in Collaboratory using the dashboard (a small Ubuntu 16.04 c1.micro should be enough).
Make sure you allow SSH access from your source IP address and choose your SSH key, so you can access it later.

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kube/instance.png" />
    <figcaption>:(</figcaption>
</figure>

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kube/instance2.png" />
    <figcaption>:(</figcaption>
</figure>

Once this VM is up and running, ssh into it and install some dependencies:
sudo apt-get update 
sudo apt-get -y upgrade
sudo apt install -y python-pip 
sudo pip install python-openstackclient ansible shade git

While logged into Dashboard, collect the info needed to populate the "creds" file that is provided in the git repo.
You can see the info about the network, subnet ID and Project ID in the Network, Networks tab.

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kube/network.png" />
    <figcaption>:(</figcaption>
</figure>
 out the following github repo: 
git clone https://github.com/gmihaiescu/k8s-on-openstack
cd k8s-on-openstack

Edit the creds file with the information collected from Dashboard and source it:
source creds

You will also need your SSH private key that's going to be inserted in the instances created by Ansible to be also available on the Ansible node, so create a file called "key" and add the SSH private key in there.

vi key 
chmod 400 key

Start the <a href="https://kb.iu.edu/d/aeww">SSH agent</a> and load the SSH key: 
eval "$(ssh-agent -s)"
ssh-add -k key 


Finally, run the site.yml playbook that will create a Kubernetes cluster with one master node and two worker nodes.
ansible-playbook site.yaml

Obtain the private IP of the "k8s-master" VM from Dashboard and SSh into it from your jumpserver:

ssh 10.0.0.5

Once there, you can create new pods, services, etc.

ubuntu@k8s-master:~$ cat nginx-svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-nginx
  labels:
    run: my-nginx
spec:
  ports:
  - port: 80
    protocol: TCP
  selector:
    run: my-nginx
    master: ture


ubuntu@k8s-master:~$ cat run-my-nginx.yaml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: my-nginx
spec:
  replicas: 2
  template:
    metadata:
      labels:
        run: my-nginx
    spec:
      containers:
      - name: my-nginx
        image: nginx
        ports:
        - containerPort: 80




If you want to terminate the resources created by Ansible, go back to the jumpserver, source the creds and 

STATE=absent ansible-playbook site.yaml
