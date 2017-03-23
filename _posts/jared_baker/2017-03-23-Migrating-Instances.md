---
layout: post
title:  "Migrating instances within the cloud"
breadcrumb: true
author: jared_baker
date: 2017-03-23
categories: jared_baker
tags:
    - OpenStack
    - Nova
    - Linux
    - libvirt
teaser:
    info: How migrating instances within the cloud can improve user experience and make your life easier
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Introduction
Migrating instances in a virtualized environment is one of those features that has a marked improvement in an IT administrator's quality of life. Why? Think about it. Migrations allow us to offer an uninterrupted user experience in virtualized computing. We can move instances from one host to another with little to no user impact. Mostly gone are the days of overnight maintenances and downtime for patching! Thankfully migrations are no longer a feature unique to expensive, licensed & proprietary solutions made by VMware, Citrix, etc. This is something you can easily do with Openstack running KVM. Need to patch your kernel? Migrate, patch, reboot, migrate back. No fee's, no licenses and no downtime. <b>Awesome.</b>

For this blog post I will be covering the different types of migrations that can be done in Openstack (Mitaka) with KVM.

## Migrations in The Cancer Genome Collaboratory
In a cloud environment, the focus is on providing highly-redundant API services that let the users quickly provision new workloads, instead of providing highly redundant physical infrastructure which costs a lot more, needs specialized hardware and still fails occasionally.

In genomics research especially, the instances are considered ephemeral because they run workflows that fail for various reasons and can be retried easily. The workloads are also usually provisioned on the local disk of the compute nodes, with very large sizes and high disk I/O rates which makes them poor candidates for migration.

In large environments with tens or hundreds of servers, migrating instances around for maintenance purposes is time consuming, error prone and can still impact the performance of the workloads, potentially causing discrete errors that might affect the results correctness which would be very hard to detect later on.

Here in the Collaboratory we do make use of the migration functionality but in a case by case basis and not typically for instances running CPU intensive workloads.

#### Official documentation
* [Openstack admin guide on migrations](https://docs.openstack.org/admin-guide/cli-nova-migrate.html)
* [Openstack admin guide on live migration](https://docs.openstack.org/admin-guide/compute-live-migration-usage.html)
* [Openstack configuring guide on migrations](https://docs.openstack.org/admin-guide/compute-configuring-migrations.html)
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
  * No downtime and no requirement for shared stored. If you run instances on local disk and need to migrate without interruptions, this is the method you need. May take a long time depending on the amount of data that needs to be migrated and how active (IO & memory) the instance is.

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

Cold migrations don't allow you to specify a destination hypervisor. Instead, the nova scheduler will look for available resources in the cluster and place them accordingly.

#### Migration using the Nova client
<video width="100%" height="auto" controls preload>
    <source src="{{site.urlimg}}jared_baker/migratinginstances/migrate-with-ping.webm"></source>
</video>

#### Migration using the Openstack Dashboard
<video width="100%" height="auto" controls preload>
    <source src="{{site.urlimg}}jared_baker/migratinginstances/gui-migrate.webm"></source>
</video>

## Limitations / Caveats
* Migrations can take longer or even fail if the rate of change to the disk and/or memory contents outpaces the network transfer rate. With a 10Gbps network this should allow lots of headroom in migrating a busy instance.
* In environments with mixed CPU models you need to set the following flags in your /etc/nova/nova.conf to ensure migration compatibility.

~~~bash
[libvirt]
cpu_mode=custom
cpu_model=kvm64
~~~

Note: Any existing instances will need to be power cycled for changes to take effect. Instance performance may also be degraded if you were previously using 'cpu_mode=host-passthrough'.
