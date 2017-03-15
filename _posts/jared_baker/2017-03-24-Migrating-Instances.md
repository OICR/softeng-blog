---
layout: post
title:  "Migrating instances within the cloud"
breadcrumb: true
author: jared_baker
date: 2017-03-24
categories: jared_baker
tags:
    - OpenStack
    - Nova
    - Linux
    - libvirt
teaser:
    info: How migrating instances within the cloud can improve user experience and make your life easier
    image: jared_baker/glanceimages/hashbang.jpg
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Introduction
Migrating instances in a virtualized environment is one of those features that has a marked improvement in an IT administrators quality of life. Why? Think about it. Migrations allow us to offer an uninterrupted user experience in virtualized computing as we can move instances from one host to another with little to no user impact. Mostly gone are the days of overnight maintenances and downtime for patching! Thankfully this is no longer a feature unique to expensive, licensed & proprietary solutions made by VMware, Citrix, etc. This is something you can easily do with Openstack running KVM. Need to patch your kernel? Migrate, patch, reboot, migrate back. No fee's, no licenses and no downtime. <b>Awesome.</b>

For this blog post I will be covering the different types of migrations that can be done in Openstack with KVM.

#### Official documentation
* [Openstack doc on Nova migrations](https://docs.openstack.org/admin-guide/cli-nova-migrate.html)
* [Openstack live migration](https://docs.openstack.org/admin-guide/compute-live-migration-usage.html)
* [Openstack configuring migrations](https://docs.openstack.org/admin-guide/compute-configuring-migrations.html)
* [KVM Migration](https://www.linux-kvm.org/page/Migration)

#### Prerequisites
* [Enable SSH between compute nodes](https://docs.openstack.org/admin-guide/cli-nova-migrate-cfg-ssh.html#clinovamigratecfgssh)

## Migration types
* Cold Migration
  * Requires downtime and shared storage. No way to specify destination hypervisor. Very fast.
* Live Migration
  * No downtime, requires shared storage. Very fast.
* Cold Block Migration
  * Requires downtime, does not require shared storage. Uses local disk on the host to store & run the instances. May take a long time depending on the amount of data that needs to be migrated. No way to specify destination hypervisor.
* Live Block Migration
  * No downtime and no requirement for shared stored. If you run instances on local disk and need to migrate without interruptions, this is the method you need. May take a long time dependong on the amount of data that needs to be migrated and how active (IO & memory) the instance is.

## How to migrate

Migrating instances can be done from the openstack cli or from the dashboard.

~~~bash
# Cold Migration
nova migrate <instance id>
# Block migration
nova migrate --block-migrate <instance id>
# Live migration
nova live-migration <instance id> <optional: destination hypervisor>
# Live block migration
nova live-migration --block-migrate <instance id> <optional: destination hypervisor>
~~~

#### CLI migration demo
<video controls preload>
    <source src="{{site.urlimg}}jared_baker/migratinginstances/migrate-with-ping.webm"></source>
</video>

#### Dashboard migration demo
<video width="100%" height="auto" controls preload>
    <source src="{{site.urlimg}}jared_baker/migratinginstances/gui-migrate.webm"></source>
</video>


## Limitations / Caveats
* Migrations can take longer or not complete if the rate of change to the disk and/or memory contents outpaces the network transfer rate. With a 10Gbps network this should allow lots of headroom in migrating a busy instance.
* In environments with mixed CPU models you need to set some flags in your /etc/nova/nova.conf to ensure migration compatibility

~~~bash
[libvirt]
cpu_mode=custom
cpu_model=kvm64
~~~
