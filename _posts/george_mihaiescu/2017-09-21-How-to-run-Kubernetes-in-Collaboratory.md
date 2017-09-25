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
    info: A quick how-to on deploying Kubernetes on top of Collaboratory VMs.
    image: george_mihaiescu/Kube/kubernetes.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Introduction
These instructions are based on the <a href="https://cloudblog.switch.ch/2017/06/26/deploy-kubernetes-on-the-switchengines-openstack-cloud/">blog written by my friend Saverio at SWITCH </a>, but I had to adapt it to work in Collaboratory where we don't have LbaaS, or more than 1 floating IP per project (usually).

Collaboratory's Openstack APIs are not accessible outside the environment, so you will have to first provision a VM using the dashboard that will be used as a jumpserver (a c1.micro Ubuntu 16.04 should be enough).
Make sure you allow SSH access from your source IP address and choose your SSH key when booting the VM, so you can SSH into it later.

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kube/instance.png" />
</figure>

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kube/instance2.png" />
</figure>

Once this VM is up and running, SSH into it and install the dependencies:

~~~bash
sudo apt-get update 
sudo apt-get -y upgrade
sudo apt install -y python-pip 
sudo pip install python-openstackclient ansible shade
~~~


Next, check out the github repo containing the Ansible playbook that will create the VMs where Kubernetes will be installed:
~~~bash
git clone https://github.com/CancerCollaboratory/k8s-on-openstack.git
cd k8s-on-openstack
~~~

While logged into Dashboard, collect the info needed to populate the "creds" file that is provided in the git repo.
You can see the info about the network, subnet ID and Project ID in the Network, Networks tab.

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kube/network.png" />
</figure>

Edit the creds file with the information collected from Dashboard and source it. Read the "README.md" for more info on the choices you have.
~~~bash
vi creds
source creds
~~~

You will also need your SSH private key that is going to be inserted in the instances created by Ansible to be also available on the Ansible node, so create a file called "key" and add the SSH private key in there.

~~~bash
vi key 
chmod 400 key
~~~

Start the <a href="https://kb.iu.edu/d/aeww">SSH agent</a> and load the SSH key: 
~~~bash
eval "$(ssh-agent -s)"
ssh-add -k key 
~~~

The corporate IP space of OICR is hardcoded inside the variables defined in the "group_vars/all" file, which adds security rules allowing SSH and Kubernetes API to the k8s-master node, but you should change those variables to fit your source IP address space.
The k8s-master doesn't have a floating IP assigned by default, but these rules are useful if you later assign one for direct access.

~~~bash
ubuntu@jumpserver:~/k8s-on-openstack$ cat group_vars/all
SSH_allowed_IP_space: 206.108.127.0/24
allow_kube: 206.108.127.0/24
~~~

Finally, run the site.yml playbook that will create a Kubernetes cluster with one master node and two worker nodes.
~~~bash
ansible-playbook site.yaml
~~~

After the playbook runs successfully, obtain the private IP of the "k8s-master" VM from Dashboard and SSH into it from your jumpserver:

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kube/nodes.png" />
</figure>

~~~bash
ubuntu@jumpserver:~/k8s-on-openstack$ eval "$(ssh-agent -s)"
Agent pid 13815
ubuntu@jumpserver:~/k8s-on-openstack$ ssh-add -k key
Identity added: key (key)
ubuntu@jumpserver:~/k8s-on-openstack$
ubuntu@jumpserver:~/k8s-on-openstack$ ssh 10.10.0.15
Welcome to Ubuntu 16.04.3 LTS (GNU/Linux 4.4.0-96-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  Get cloud support with Ubuntu Advantage Cloud Guest:
    http://www.ubuntu.com/business/services/cloud

0 packages can be updated.
0 updates are security updates.


Last login: Thu Sep 21 20:11:59 2017 from 10.10.0.11
ubuntu@k8s-master:~$ kubectl get nodes
NAME         STATUS    AGE       VERSION
k8s-1        Ready     5h        v1.7.5
k8s-2        Ready     5h        v1.7.5
k8s-3        Ready     5h        v1.7.5
k8s-master   Ready     5h        v1.7.5
~~~


Once logged into the k8s-master node, you can create new pods, services, etc.

Initially, there are no user-created resources in the Kubernetes cluster, but if you look closer you will see quite a few docker containers started by Kubernetes that support its services:

~~~bash
ubuntu@k8s-master:~$ kubectl get pod
No resources found.
ubuntu@k8s-master:~$ sudo docker ps
CONTAINER ID        IMAGE                                                    COMMAND                  CREATED             STATUS              PORTS               NAMES
ed0329d2743d        gcr.io/google_containers/kube-controller-manager-amd64   "kube-controller-m..."   15 minutes ago      Up 15 minutes                           k8s_kube-controller-manager_kube-controller-manager-k8s-master_kube-system_faf322bfd634f97083cdba629d861623_1
104548c71cd8        gcr.io/google_containers/nginx-ingress-controller        "/nginx-ingress-co..."   6 hours ago         Up 6 hours                              k8s_nginx-ingress-controller_nginx-ingress-controller-19586432-r78bm_kube-system_11c64f99-9f09-11e7-8c8a-fa163e20483a_0
65720bedb73a        gcr.io/google_containers/pause-amd64:3.0                 "/pause"                 6 hours ago         Up 6 hours                              k8s_POD_nginx-ingress-controller-19586432-r78bm_kube-system_11c64f99-9f09-11e7-8c8a-fa163e20483a_0
176d263a9750        weaveworks/weave-kube                                    "/home/weave/launc..."   6 hours ago         Up 6 hours                              k8s_weave_weave-net-t8nnm_kube-system_0f5e3113-9f09-11e7-8c8a-fa163e20483a_0
3d294330a213        weaveworks/weave-npc                                     "/usr/bin/weave-npc"     6 hours ago         Up 6 hours                              k8s_weave-npc_weave-net-t8nnm_kube-system_0f5e3113-9f09-11e7-8c8a-fa163e20483a_0
a3dc6ffc63bc        gcr.io/google_containers/kube-proxy-amd64                "/usr/local/bin/ku..."   6 hours ago         Up 6 hours                              k8s_kube-proxy_kube-proxy-gwn77_kube-system_0d0626b7-9f09-11e7-8c8a-fa163e20483a_0
a4e166eaf742        gcr.io/google_containers/pause-amd64:3.0                 "/pause"                 6 hours ago         Up 6 hours                              k8s_POD_weave-net-t8nnm_kube-system_0f5e3113-9f09-11e7-8c8a-fa163e20483a_0
288a74d6f608        gcr.io/google_containers/pause-amd64:3.0                 "/pause"                 6 hours ago         Up 6 hours                              k8s_POD_kube-proxy-gwn77_kube-system_0d0626b7-9f09-11e7-8c8a-fa163e20483a_0
da5014fcc492        gcr.io/google_containers/pause-amd64:3.0                 "/pause"                 6 hours ago         Up 6 hours                              k8s_POD_kube-controller-manager-k8s-master_kube-system_faf322bfd634f97083cdba629d861623_0
853768aee21a        gcr.io/google_containers/kube-scheduler-amd64            "kube-scheduler --..."   6 hours ago         Up 6 hours                              k8s_kube-scheduler_kube-scheduler-k8s-master_kube-system_d5c9d22bf0255bf6b16748bf63fc4c6d_0
384012c2ef66        gcr.io/google_containers/kube-apiserver-amd64            "kube-apiserver --..."   6 hours ago         Up 6 hours                              k8s_kube-apiserver_kube-apiserver-k8s-master_kube-system_10c0ad7fcbef2f6334b803743c3fe2e0_0
0a037fd4ac94        gcr.io/google_containers/etcd-amd64                      "etcd --listen-cli..."   6 hours ago         Up 6 hours                              k8s_etcd_etcd-k8s-master_kube-system_9ef6d25e21bb4befeabe4d0e4f72d1ca_0
d07d91d263e0        gcr.io/google_containers/pause-amd64:3.0                 "/pause"                 6 hours ago         Up 6 hours                              k8s_POD_kube-scheduler-k8s-master_kube-system_d5c9d22bf0255bf6b16748bf63fc4c6d_0
9de7107556f6        gcr.io/google_containers/pause-amd64:3.0                 "/pause"                 6 hours ago         Up 6 hours                              k8s_POD_kube-apiserver-k8s-master_kube-system_10c0ad7fcbef2f6334b803743c3fe2e0_0
1739a990360a        gcr.io/google_containers/pause-amd64:3.0                 "/pause"                 6 hours ago         Up 6 hours                              k8s_POD_etcd-k8s-master_kube-system_9ef6d25e21bb4befeabe4d0e4f72d1ca_0
~~~

You can see details about the Kubernetes nodes (VMs managed by Kubernetes where it can orchestrate containers) with various level of details:
~~~bash
ubuntu@k8s-master:~$ kubectl get nodes
NAME         STATUS    AGE       VERSION
k8s-1        Ready     6h        v1.7.5
k8s-2        Ready     6h        v1.7.5
k8s-3        Ready     6h        v1.7.5
k8s-master   Ready     6h        v1.7.5
ubuntu@k8s-master:~$ kubectl get nodes -o wide
NAME         STATUS    AGE       VERSION   EXTERNAL-IP   OS-IMAGE             KERNEL-VERSION
k8s-1        Ready     6h        v1.7.5    <none>        Ubuntu 16.04.3 LTS   4.4.0-96-generic
k8s-2        Ready     6h        v1.7.5    <none>        Ubuntu 16.04.3 LTS   4.4.0-96-generic
k8s-3        Ready     6h        v1.7.5    <none>        Ubuntu 16.04.3 LTS   4.4.0-96-generic
k8s-master   Ready     6h        v1.7.5    <none>        Ubuntu 16.04.3 LTS   4.4.0-96-generic
ubuntu@k8s-master:~$ kubectl get nodes -o yaml
apiVersion: v1
items:
- apiVersion: v1
  kind: Node
  metadata:
    annotations:
      node.alpha.kubernetes.io/ttl: "0"
      volumes.kubernetes.io/controller-managed-attach-detach: "true"
    creationTimestamp: 2017-09-21T20:11:34Z
    labels:
      beta.kubernetes.io/arch: amd64
      beta.kubernetes.io/os: linux
      failure-domain.beta.kubernetes.io/region: Toronto
      failure-domain.beta.kubernetes.io/zone: nova
      kubernetes.io/hostname: k8s-1
    name: k8s-1
    namespace: ""
    resourceVersion: "33713"
    selfLink: /api/v1/nodes/k8s-1
    uid: 10e8deed-9f09-11e7-8c8a-fa163e20483a
  spec:
    externalID: 0a845519-c3b8-4ba0-8dc5-5f0454e4b112
    providerID: openstack:///0a845519-c3b8-4ba0-8dc5-5f0454e4b112
  status:
    addresses:
    - address: 10.10.0.7
      type: InternalIP
~~~

Let's do a quick example of how Kubernetes can be used to orchestrate some workloads.

Create the following file that describes a Kubernetes service that sends traffic to containers labeled with "run: my-nginx":
~~~bash
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
~~~

Create the following file that describes a Kubernetes deployment comprised of two containers running the Ngnix image and labelled with "run: my-nginx":

~~~bash
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
~~~

Create the two files on the k8s-master VM and load them into kubernetes:

~~~bash
ubuntu@k8s-master:~$ vi run-my-nginx.yaml
ubuntu@k8s-master:~$ vi nginx-svc.yaml
ubuntu@k8s-master:~$ kubectl create -f nginx-svc.yaml
service "my-nginx" created
ubuntu@k8s-master:~$ kubectl create -f run-my-nginx.yaml
deployment "my-nginx" created
~~~

The deployment description shows that there are two replica containers desired, and two running:
~~~bash
ubuntu@k8s-master:~$ kubectl get deployment
NAME       DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
my-nginx   2         2         2            2           8m
~~~

You can see that the two Nginx containers were started on two different pods, on two different nodes:
~~~bash
ubuntu@k8s-master:~$ kubectl get pods -o wide
NAME                        READY     STATUS    RESTARTS   AGE       IP          NODE
my-nginx-4293833666-j86gg   1/1       Running   0          1m        10.44.0.2   k8s-1
my-nginx-4293833666-ps47j   1/1       Running   0          1m        10.40.0.2   k8s-2
~~~ 

Using the dashboard, terminate the VM called "k8s1" that runs one of the Ngnix containers:

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kube/delete_instance.png" />
</figure>

A few seconds later, you can see that Kubernetes started a new Nginx container on a different VM (aka "kubernetes node") to maintain the "replica 2" requirement in the "deployment" description:

~~~bash
ubuntu@k8s-master:~$ kubectl get pods -o wide
NAME                        READY     STATUS    RESTARTS   AGE       IP          NODE
my-nginx-4293833666-ps47j   1/1       Running   0          4m        10.40.0.2   k8s-2
my-nginx-4293833666-qhr8x   1/1       Running   0          48s       10.38.0.2   k8s-3
~~~

You can reach the Ngnix containers being load-balanced by the service you created as it follows:
~~~bash
ubuntu@k8s-master:~$ kubectl get svc my-nginx
NAME       CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
my-nginx   10.99.106.65   <none>        80/TCP    20m
ubuntu@k8s-master:~$ curl http://10.99.106.65
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
~~~

If you want to access the Nginx service from outside Collaboratory, move the floating IP from your jumpserver VM over to the k8s-master VM first:
<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kube/floating_moved.png" />
</figure>

And create an SSH tunnel that will send the localhost:9000 traffic over the tunnel to the CLUSTER-IP address 10.99.106.65, port 80.

~~~bash
ssh -L 9000:10.99.106.65:80 -i ~/Desktop/demo.pem ubuntu@142.1.177.99
~~~

Now you will be able to load the Nginx service in the browser:

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kube/browser.png" />
</figure>

If you want to cleanly terminate the resources created by the Ansible playbook (VMs, security groups,etc) go back to the jumpserver, source the creds and run the Ansible playbook passing in the "STATE=absent" variable:

~~~bash
STATE=absent ansible-playbook site.yaml
~~~

Kubernetes is a very new technology and fairly complex, so more time is needed to work with it and grasp its usefulness, but I hope this blog will make you give it a try.


