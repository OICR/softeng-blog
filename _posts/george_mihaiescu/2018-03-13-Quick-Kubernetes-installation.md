---
layout: post
title:  "Scripted Kubernetes installation with dasboard and monitoring."
breadcrumb: true
author: george_mihaiescu
date: 2018-03-21
categories: george_mihaiescu
tags:
    - OpenStack
    - Collaboratory
    - Kubernetes
teaser:
    info: A quick how-to on deploying Kubernetes on top of Collaboratory VMs with Kubernetes dashboard and Graphana monitoring enabled.
    image: george_mihaiescu/Kube/kubernetes-dashboard.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---
tl;dr

Step 1: Start an instance that will serve as your Kubernetes master and dump a config script.  
Step 2: Start one or more instances that will serve as your Kubernetes worker nodes and dump a config script.  
Step 3: Start using Kubernetes.  


## Introduction

In the previous blog [How-to-run-Kubernetes-in-Collaboratory](http://softeng.oicr.on.ca/george_mihaiescu/2017/09/28/How-to-run-Kubernetes-in-Collaboratory/) I described how Kubernetes can be deployed using Ansible.

In this blog I will show how you can use cloud-init to accomplish the same goal while also adding the Kubernetes dashboard and monitoring.  
This blog post will not cover making Kubernetes highly available, as it's a more advanced topic reserved for a future blog post.

Kubernetes has a server-client architecture, with two main types of servers:

- A main node running the Kubernetes API, Etcd, scheduler, Kube-DNS and other management services.
- One or more worker nodes running Kubelet and Kube-proxy where the Docker containers deployed by the user will be scheduled to run.

First, go to the "Network, Security Group" tab and create a new security group called "All_TCP_access".
Add a rule allowing access to all TCP ports from your source IP address (you can find your address by visiting [https://www.whatismyip.com/](https://www.whatismyip.com/).

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/sec_rule.png" />
</figure>

Then go to the "Compute, Key Pairs" tab and create an SSH key if you don't have one already:
<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/key_pair.png" />
</figure>



Finally, deploy a Ubuntu 16.04 based instance with a flavor of your choice.

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/instance.png" />
</figure>

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/image.png" />
</figure>

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/flavor.png" />
</figure>


Select the SSH key that you created before hand and add the "default" security group and "All_TCP_access". The "default" security group is needed so the Kubernetes master can reach to the Kubernetes workers and the "All_TCP_access" is needed so you can access the Kubernetes dashboard and Grafana UI on the dynamic allocated TCP ports.

You also need to select the network your project should have already created.

In the "Customization Script" tab, paste the following script that installs Kubernetes.

~~~bash
#!/bin/sh
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install  -y   apt-transport-https     ca-certificates     curl     software-properties-common
   
sudo apt-get install -y docker.io
   
   
sudo bash -c 'cat << EOF > /etc/docker/daemon.json
{
   "exec-opts": ["native.cgroupdriver=systemd"]
}
EOF'
   
   
   
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
   
sudo bash -c 'cat << EOF > /etc/apt/sources.list.d/kubernetes.list
deb http://apt.kubernetes.io/ kubernetes-xenial main
EOF'
   
   
sudo apt update
   
sudo apt install -y kubelet kubeadm kubectl
   
sudo kubeadm init --pod-network-cidr=10.244.0.0/16
   
   
sleep 60
   
mkdir -p /home/ubuntu/.kube
   
cp -i /etc/kubernetes/admin.conf /home/ubuntu/.kube/config
   
chown ubuntu:ubuntu /home/ubuntu/.kube/config
 
sleep 60
 
export KUBECONFIG=/etc/kubernetes/admin.conf && kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/v0.9.1/Documentation/kube-flannel.yml
 
echo 'source <(kubectl completion bash)' >>  /home/ubuntu/.bashrc
 
# Allow workloads to be scheduled to the master node
kubectl taint nodes `hostname`  node-role.kubernetes.io/master:NoSchedule-
 
# Deploy the monitoring stack based on Heapster, Influxdb and Grafana
git clone https://github.com/kubernetes/heapster.git
cd heapster
 
# Change the default Grafana config to use NodePort so we can reach the Grafana UI over the Public/Floating IP
sed -i 's/# type: NodePort/type: NodePort/' deploy/kube-config/influxdb/grafana.yaml
 
kubectl create -f deploy/kube-config/influxdb/
kubectl create -f deploy/kube-config/rbac/heapster-rbac.yaml
 
 
# The commands below will deploy the Kubernetes dashboard
 
wget https://raw.githubusercontent.com/kubernetes/dashboard/master/src/deploy/recommended/kubernetes-dashboard.yaml
echo '  type: NodePort' >> kubernetes-dashboard.yaml
kubectl create -f kubernetes-dashboard.yaml
 
# Create an admin user that will be needed in order to access the Kubernetes Dashboard
sudo bash -c 'cat << EOF > admin-user.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kube-system
EOF'
 
kubectl create -f admin-user.yaml
 
# Create an admin role that will be needed in order to access the Kubernetes Dashboard
sudo bash -c 'cat << EOF > role-binding.yaml
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kube-system
EOF'
 
kubectl create -f role-binding.yaml
 
 
# This command will create a token and print the command needed to join slave workers
kubeadm token create --print-join-command --ttl 24h
 
# This command will print the port exposed by the Grafana service. We need to connect to the floating IP:PORT later
kubectl get svc -n kube-system | grep grafana
 
# This command will print the port exposed by the Kubernetes dashboard service. We need to connect to the floating IP:PORT later
kubectl -n kube-system get service kubernetes-dashboard
 
 
# This command will print a token that can be used to authenticate in the Kubernetes dashboard
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}') | grep "token:"
~~~

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/config.png" />
</figure>

After the instance has started, visit the "Log" tab and click on the "View Full Log" on the top-right side. 

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/log.png" />
</figure>

Scroll to the end of the file and refresh the page every minute or so until you see a line showing that the cloud-init script execution finished, e.g.

**[  241.915134] cloud-init[1286]: Cloud-init v. 17.1 finished at Thu, 01 Mar 2018 20:47:01 +0000. Datasource DataSourceOpenStack [net,ver=2].  Up 241.90 seconds**


Also, close to the end of the file look for the command needed to join the cluster as you will need it when provisioning the worker nodes, e.g.

**kubeadm join --token ca0872.c7e8654d399ff986 172.16.16.19:6443 --discovery-token-ca-cert-hash sha256:6861ba7543c750a44efe4165f82cc42046c186bd5f387f4f9984154c28531548**

NOTE !!! The token is valid for 24h, so if you later want to add new Kubelet workers to the cluster, you will have to ssh into the Master node, become root by running "sudo su -" and run:
~~~bash
root@kubernetes:~# kubeadm token create --print-join-command --ttl 24h
kubeadm join --token 123091.73f18d0e3afcd54b 172.16.16.15:6443 --discovery-token-ca-cert-hash sha256:000ccded7dfae148a89ed2bce9c17f584a7048e2e898da2cc102a11e14334f42
~~~


Associate a floating IP address to your instance so you can reach it in your browser:

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/floating.png" />
</figure>

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/floating2.png" />
</figure>


In order to see the Grafana dashboard that was provisioned by the script, visit **http://floatingIP:port**, where floating IP is the public address you allocated to your Kubernetes master node, and the Grafana port is displayed in the instance's **console log** (example below):

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/console.png" />
</figure>


<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/Grafana_UI.png" />
</figure>

In order to see the Kubernetes dashboard that was provisioned by the script, visit **https://floatingIP:port**, where floating IP is the public address you allocated to your Kubernetes master node, and the Kubernetes dashboard allocated port is displayed in the instance's **console log** (example below):

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/kubernetes_dashboard.png" />
</figure>

When you visit that page, the browser will prompt you because the SSL cert is self-signed, but you'll have to go ahead and accept it.  
Use the **Token** authentication method and paste the **token** you can find in the **console log**:

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/token.png" />
</figure>

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/token_init.png" />
</figure>

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/dashboard.png" />
</figure>

---

**Kubernetes worker installation instructions (aka Kubelet).**



Now that you have successfully deployed the Kubernetes master with its own dashboard and monitoring solution, you will need to deploy some worker nodes (aka Kubelets).  
Follow the same steps as above to deploy one or more VMs that will be used to run the Kubernetes workloads.  

Make sure the flavor you choose is large enough to accommodate whatever production workloads you plan running in your cluster, and **VERY IMPORTANT: change the "join" command at the end of the bash script below to use the valid token and IP address for your existing cluster** that you obtained from the Kubernetes master's console log:


<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/join.png" />
</figure>

Dump this script in the Use the following cloud-init script while starting the VM(s):
When starting the new instance(s) to be used as worker node(s), in the "Customization Script" tab, paste the following script that installs **kubelet**.


~~~bash
#!/bin/sh
 
# These commands will install the Kubernetes worker components and join an existing cluster.
apt-get update
 
apt-get upgrade -y
 
bash -c 'cat << EOF > /etc/docker/daemon.json
{
   "exec-opts": ["native.cgroupdriver=systemd"]
}
EOF'
 
apt-get install  -y   apt-transport-https     ca-certificates     curl     software-properties-common
 
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
 
add-apt-repository    "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
 
apt-get update
 
apt-get install -y docker-ce
 
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
 
bash -c 'cat << EOF > /etc/apt/sources.list.d/kubernetes.list
deb http://apt.kubernetes.io/ kubernetes-xenial main
EOF'
 
apt update
 
apt install -y kubelet kubeadm kubectl
 
 
#### IMPORTANT ###
# Change the command below to use a valid token and IP address for your existing cluster
 
kubeadm join --token 123091.73f18d0e3afcd54b 172.16.16.15:6443 --discovery-token-ca-cert-hash sha256:000ccded7dfae148a89ed2bce9c17f584a7048e2e898da2cc102a11e14334f42
~~~

If everything went fine, after a few minutes the Kubernetes dashboard should show three worker nodes:


<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/new-nodes.png" />
</figure>

You can SSH into the Kubernetes master node and execute commands:
<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/kubectl.png" />
</figure>

If you later need to add more Kubelet nodes, but the **joining** token expired, you should first become root on the master node and run the following command to generate a new joining token:  
**kubeadm token create --print-join-command --ttl 24h**

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Kubernetes/gen_token.png" />
</figure>


