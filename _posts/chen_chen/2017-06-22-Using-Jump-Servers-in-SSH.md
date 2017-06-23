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
As the internet matured to become the defining innovative platform of our generation, security and privacy concerns grew. Secure Shell, or SSH, was created to be just a protocol to allow secure connection to a university server. Now, it is one of the most common forms of remote shell access for any server, whether it’s a corporation or personal. It goes beyond a traditional username and password verification, using encryption that is mathematically unbreakable to attackers. The advanced features of SSH can connect an entire network of servers through an encrypted channel. SSH has now grown to become one of the fundamental tools for any software developer. At OICR, almost everyone use these tools daily, to access data, administer servers, run workflows, and many more use cases. 

## Key Based Authentication
### An Introduction to Public Key Infrastructures (PKI)
SSH key-based authentication relies on two elements to establish a secure communication channel between a server and a client:
* A public key: publicly shareable, this file does not contain confidential information and is used by a third party (the server in our case) to verify a remote party’s identity
* A private key: containing the user’s identify, this file must be kept secret.


INSERT DIAGRAM HERE

When the user makes a connection request to the Server, the server sends back a unique challenge string. This challenge string is then encrypted by the user’s SSH client using the user’s private key and sent back to the server. Once the response is received, the server verifies the user by using the public key to decrypt the response. If the verification is successful, the user is granted access as it has been confirmed that the user is in possession of the private key that pairs with the public key on the server. 

One of the main reasons SSH is considered so secure is the fact that the key pair is never communicated during authentication. As long as the private key is never exposed, it is virtually impossible to use any brute force algorithm to calculate the private key from the public key. 

## Setting up a Public and Private Key-Pair
To generate a key-pair, enter the following terminal.
 
```ssh-keygen```

The tool will create a public key and a password-protected private key and place them in the folder of your choice (usually ~/.ssh/). Once keys are generated, you need to tell your client about them using ssh-add.

```ssh-add ~/.ssh/id_rsa```

Granting Access to a Server
Then adding access to a server is as easy as adding the client’s public key (by default id_pub file), to the ‘authorized_keys’ on the server.

```.ssh/authorized_keys```

## Jump Servers
A jump server’s main purpose is to bridge communication between the local computer and another server. Using SSH to connect to jump servers creates an end to end encrypted segway for information flow between the local computer and a server. Using a jump server, security of a server network could be improved since only the jump server would be exposed directly to the Internet (and to attacks from outside). This limits the exposure of networks, thereby providing a blanket of SSH protection for all the other nodes. However, jump servers can be a  double edged sword since an entire network of servers can be exposed if the jump server is compromised. 

INSERT DIAGRAM 2

## Agent Forwarding
When establishing an SSH connection with default parameters, the private key is only kept on the local computer and the actual communication between the server and computer is using a challenge string. 
 
However, what if you want to establish a connection, from that (jump) server, to another remote server ? The solution to avoid having to copy private keys around is to achieve this by calling an Agent running on the client. 
 
Despite the name including the term “forwarding” the actual mechanism for agent forwarding does not move the key at all. What the agent does is act as a redirect for when the private key is challenged. Since the private key must never leave the local computer, the agent forwards the challenge down each level of connection until it reaches the client local machine. Once the challenge is encrypted by the private key, the response is then forwarded by the key back to the server that issued the challenge.

To agent Forward, just include “-A” after the ssh command to call agent.
 
```ssh -A user@server```
 
Which would then allow you to run this:
```
ssh -A user@serverA
serverA# ssh -A user@serverB
serverB# ssh user@serverC
```
