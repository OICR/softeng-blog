---
layout: post
title:  "Let's Encrypt the Collaboratory"
breadcrumb: true
author: jared_baker
date: 2018-05-04
categories: jared_baker
tags:
    - Lets Encrypt
    - ssl
    - linux
    - acme
    - tutorial
teaser:
    info: SSL all your sites with Let's Encrypt and Ansible
    image: jared_baker/letsencrypt/le-logo-standard.png
header:
    version: small
    title: Software Engineering Blog
    image: jared_baker/le-logo-standard.png
    icon: icon-blog
---
## Introduction
OICR runs the Cancer Genome Collaboratory, a self-service cloud environment designed for cancer research. The Collaboratory has many web applications that need to be secured with SSL and has done so with long life paid certificates from various traditional Certificate Authorities (Digicert, etc). We would purchase certificates from a traditional CA ($$$) then use a combination of Ansible and scp to distribute the certificates every couple years to the various systems that need them.

## Enter Let's Encrypt
[Let's Encrypt](https://letsencrypt.org) is a certificate authority that provides free self-serve 90-day SSL certificates along with an automated challenge-response protocol called Automated Certificate Management Environment (ACME) to perform certificate issues and renewals. There are many ACME clients available for almost every platform. Let's Encrypt has broad community support and a technical advisory board consisting of members from Akamai, Cisco, Google, Mozilla etc. All major browsers recognize Let's Encrypt's certificate chain of trust.

## Let's Encrypt Prerequisites
In order to take advantage of Let's Encrypt, you will need the following:
* An [ACME client](https://letsencrypt.org/docs/client-options/), such as [Certbot](https://certbot.eff.org/), [acme.sh](https://github.com/Neilpang/acme.sh), etc
* A server under your control and/or control of the DNS for your domain of interest
* A valid A record pointing to the IP address of the server requiring a SSL certificate

## Collaboratory requirements
* [ECDSA](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm) certificates for our high performance object storage gateway
* [Wildcard](https://en.wikipedia.org/wiki/Wildcard_certificate) certificates for operational simplicity
* Automated certificate renewal, distribution and service reloads
* [Amazon Route 53](https://en.wikipedia.org/wiki/Amazon_Route_53) support for ACME challenges

At the time of writing, not all ACME clients supported ECDSA, wildcard certificates or Route 53 support but acme.sh did, so that was the main reason for us using acme.sh. Requirement for the DNS ACME challenge was because the server we are using to issue & renew certificates already has services running on port 80 & 443 so it was much more convenient to leverage the API from Route 53.

## Implementation
### Install acme.sh & configure
~~~bash
curl https://get.acme.sh | sh
~~~
If you are using the DNS challenge-response, follow instructions [here](https://github.com/Neilpang/acme.sh/tree/master/dnsapi) for your specific DNS provider. For Route 53 we needed to get an access key and secret access key and put those values in ~/.acme.sh/account.conf

### Request ECDSA wildcard certificate
~~~bash
./acme.sh --issue --dns dns_aws -d *.cancercollaboratory.org --keylength ec-256
[Tue Apr  3 19:44:34 UTC 2018] Registering account
-snip-
[Tue Apr  3 19:46:43 UTC 2018] Your cert is in  /root/.acme.sh/*.cancercollaboratory.org_ecc/*.cancercollaboratory.org.cer
[Tue Apr  3 19:46:43 UTC 2018] Your cert key is in  /root/.acme.sh/*.cancercollaboratory.org_ecc/*.cancercollaboratory.org.key
[Tue Apr  3 19:46:43 UTC 2018] The intermediate CA cert is in  /root/.acme.sh/*.cancercollaboratory.org_ecc/ca.cer
[Tue Apr  3 19:46:43 UTC 2018] And the full chain certs is there:  /root/.acme.sh/*.cancercollaboratory.org_ecc/fullchain.cer
~~~
* --dns dns_aws enables us to use the Route 53 API for ACME challenge
* -d *.cancercollaboratory.org requests wildcard certificate
* --keylength ec-256 requests a specific type of ECDSA (prime256v1, "ECDSA P-256")

Once the certificate has been issued, acme.sh inserts a crontab entry for the user to auto-renew.
~~~bash
crontab -l
50 0 * * * "/root/.acme.sh"/acme.sh --cron --home "/root/.acme.sh" > /dev/null
~~~

### Certificate distribution with Ansible
We have many different servers that require SSL certs. Some run Apache, Nginx, HAProxy, Python, Docker and Java so we use the Ansible copy function to distribute the certificate files (it varies) to each server in their specific location with specific permissions and then we use Ansible to reload or restart the desired application to load the new certificate so that the service is not interrupted. I will provide some copy examples below but this is just a simplified version of what we use.

#### Ansible inventory
~~~bash
[ssl_nodes]
<server-hostname> apache2=yes ansible_ssh_host=<ip-addr-here> ansible_ssh_user=<username> ansible_ssh_private_key_file=<path-to-key>
~~~

#### Ansible ssl_nodes.yml
~~~bash
---
- hosts: ssl_nodes
  become: true
  become_method: sudo
  gather_facts: yes
  vars_files:
    - group_vars/all
  serial: 1
  roles:
    - { role: ssl-certs, tags: ssl-certs }
~~~

#### Ansible tasks/main.yml
~~~bash
---
- name: Copy SSL certificate for Apache2
  copy:
      src: "{{ item.src }}"
      dest: "{{ item.dest }}"
      mode: "{{ item.mode }}"
      owner: "{{ item.owner }}"
      group: "{{ item.group }}"
      backup: "{{ item.backup }}"
  with_items:
      - { src: '/root/.acme.sh/*.cancercollaboratory.org_ecc/fullchain.cer', dest: '/etc/ssl/certs/cancercollaboratory.org.crt', mode: '0640', owner: root, group: ssl-cert, backup: yes}
      - { src: '/root/.acme.sh/*.cancercollaboratory.org_ecc/*.cancercollaboratory.org.key', dest: '/etc/ssl/private/cancercollaboratory.org.key', mode: '0600', owner: root, group: ssl-cert, backup: yes }
  when: apache2 is defined
  notify: reload apache2
~~~

#### Ansible handlers/main.yml
~~~bash
---
- name: reload apache2
  service:
     name=apache2
     state=reloaded
~~~

### Automate Ansible run with cron
With our Ansible playbook set up to copy & reload services now we just need to automate running the playbook with cron. acme.sh will automatically renew all certificates 30 days prior to certificate expiry so this playbook will run entirely only once every 60 days unless you force a certificate renewal. Remember, Ansible will only copy and trigger the notify handlers when it detects that the remote file is different from the source so it's safe for us to run this playbook once a day or so.

<figure>
    <img id="flow" src="{{site.urlimg}}jared_baker/letsencrypt/flow.png" data-featherlight="#flow" />
</figure>

### Validating your certificate with Qualys
You can get free SSL reports from [Qualys](https://www.ssllabs.com/ssltest/analyze.html) (and others) which helps affirm your certificate details
<figure>
    <img id="sslreport" src="{{site.urlimg}}jared_baker/letsencrypt/sslreport.png" data-featherlight="#sslreport" />
</figure>

## Bonus round
### Monitoring SSL certificates with Zabbix!
Since Let's Encrypt certificates have a short life span and the renewal relies heavily on automation its a good idea to also monitor your certificates and alert you if they reach a certain threshold, such as when a certificate expires in 28 days even though it should auto-renew at 30 days indicating a problem with the renewal.

[Long Chen](https://github.com/omni-lchen) created a nice [solution](https://github.com/omni-lchen/zabbix-ssl) for Zabbix.

<figure>
    <img id="zabbixssl" src="{{site.urlimg}}jared_baker/letsencrypt/zabbixssl.png" data-featherlight="#zabbixssl" />
</figure>

For non-Zabbix users here is a [web based alternative](https://certificatemonitor.org)


## Future improvements
Even though we use the 'backup:yes' Ansible copy feature I would still like to figure out a way to stagger the distribution of renewed certificates in the case a bad cert is propagated to many sites causing widespread SSL warnings.

## References
* [Let's Encrypt](https://en.wikipedia.org/wiki/Let%27s_Encrypt)
* [ACME](https://en.wikipedia.org/wiki/Automated_Certificate_Management_Environment)
* [acme.sh](https://github.com/Neilpang/acme.sh)
* [Ansible](https://en.wikipedia.org/wiki/Ansible_(software))
* [Qualys SSL validity test](https://www.ssllabs.com/ssltest/analyze.html)
* [Zabbix SSL expiry check](https://github.com/omni-lchen/zabbix-ssl)
* [Certificatemonitor](https://certificatemonitor.org)
