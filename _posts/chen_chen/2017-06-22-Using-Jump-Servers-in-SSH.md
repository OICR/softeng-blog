---
layout: post
title: "Using Jump Servers in SSH"
breadcrumb: true
author: chen_chen
date: 2017-06-22
categories: chen_chen
tags:
    - SSH
    - terminal
    - security
    - servers
teaser:
    info: An introduction and tutorial for key based authentication, jump servers, and port forwarding.
---
## Introduction
As the internet matured to become the defining innovative platform of our generation, security and privacy became growing concerns. Secure Shell, or SSH, was created to be just a protocol to allow secure connection to a university server. Now, it is one of the most common forms of remote shell access for any server, whether it’s a corporation or personal. It goes beyond a traditional username and password verification, using encryption that is mathematically unbreakable to attackers. The advanced features of SSH can connect an entire network of servers through an encrypted channel. SSH has now grown to become one of the fundamental tools for any software developer. At OICR, almost everyone use these tools daily, to access data, administer servers, run workflows, and many more use cases. 

## Key Based Authentication
# An Introduction to Public Key Infrastructures (PKI)
SSH key-based authentication relies on two elements to establish a secure communication channel between a server and a client:
* A public key: publicly shareable, this file does not contain confidential information and is used by a third party (the server in our case) to verify a remote party’s identity
* A private key: containing the user’s identify, this file must be kept secret.
