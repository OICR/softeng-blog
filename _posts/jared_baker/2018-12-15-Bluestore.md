---
layout: post
title:  "Migrating 8 PB of data from Filestore to Bluestore"
breadcrumb: true
author: jared_baker
date: 2018-12-15
categories: jared_baker
tags:
    - ceph
    - linux
    - bluestore
    - tutorial
teaser:
    info: How we migrated an 8 PB cluster from Filestore to Bluestore
    image: jared_baker/bluestore/Ceph_Logo_Standard_RGB_120411_fa.png
header:
    version: small
    title: Software Engineering Blog
    image: jared_baker/le-logo-standard.png
    icon: icon-blog
---
## Introduction
The [Cancer Genome Collaboratory](https://cancercollaboratory.org) is a Cloud computing environment designed for cancer research as well as a data repository of whole genomes for the [ICGC project](https://dcc.icgc.org/repositories). We have used OpenStack and Ceph to provide an extremely scalable and reliable infrastructure. Maintaining the pieces namely through upgrades is our most important and time-consuming task in operating a cloud like this. Whether you are chasing new features, bug fixes, security patches or supportability it seems like we are always planning for the next upgrade.

## About our Ceph environment
Our Ceph cluster was born in 2014 and was built upon Ceph Giant and eventually upgraded to Hammer, then to Ceph Jewel and more recently this year to Luminous. Up until Luminous our Object Storage Daemons (OSD's) were using the only available OSD backend at the time, Filestore, with XFS and co-located journals and 3 replicas for data redundancy. Our number of OSD's has been growing steadily throughout the years to maximize purchase value per terabyte and spreading our budget over a number of years so that hardware purchases only occurred when capacity was forecasted.

We currently have 37 storage nodes, each with 36 drives for a total of 1332 OSD's. As mentioned before, purchasing nodes over time means we have a variety of HDD sizes ranging from 4 TB to 12 TB. Our smallest nodes are 144 TB while our largest are 432 TB. Each storage node has 2 separate SSD's for the OS, 256 GB of RAM, dual Xeon CPU's and 40 Gbps of network capability through the use of vlan bonds to partition the traffic type (Ceph public, replication, etc).

The primary use case for our Ceph Cluster is the storage of those very large genomic files which are served to researchers using the RADOS gateway object storage API. We do also supplement the OpenStack environment with volume support using Cinder but it amounts to less than 1% of our total utilization of the Ceph cluster.

## Bluestore in Ceph Luminous
[Bluestore](https://ceph.com/community/new-luminous-bluestore/) is the new default storage backend starting in Ceph Luminous and proposes to improve write performance by a factor of 2, and sometimes higher in certain scenarios by removing the double write penalty that took place on Filestore's journal and XFS partition. Most notably Bluestore removes the requirement of a POSIX filesystem to store Ceph data. See the diagram below for the architectural differences.

<figure>
    <img id="filestore-vs-bluestore-2" src="{{site.urlimg}}jared_baker/bluestore/filestore-vs-bluestore-2.png" data-featherlight="#filestore-vs-bluestore-2" />
</figure>


## Prequisites
Since Bluestore was first officially supported in Luminous we needed to upgrade from Ceph Jewel to Luminous. We use Ubuntu 16.04 and the official Ceph packages for that distro so it was a straight forward upgrade of adding the repo and upgrading the packages on our mon's, radosgw's and OSD nodes.
<figure>
    <img id="luminous_logo" src="{{site.urlimg}}jared_baker/bluestore/luminous_logo-1-300x116.png" data-featherlight="#luminous_logo" />
</figure>

## Migration Approach
Drain - Convert - Fill!

There is no 'conversion' from Filestore to Bluestore without major data movement so our approach was to drain a storage node of its data, followed by destroying the OSD and then prepare the OSD's using Bluestore followed by the refilling of the data from the cluster. Rinse and repeat for each storage node in the cluster. Depending on your Ceph architecture you may be able to cycle several storage nodes in parallel to reduce the overall migration time. We would migrate 2-3 storage nodes at a time, each in different racks (our failure domain) and tried to keep below a high water mark of 20% 'misplaced objects' during the drain and fills.

In order for this to be successful you have to ensure that your cluster has enough free space to drain each node to account for the temporary loss of cluster capacity when a node has to drain all it's data to the rest of the cluster.

### Draining
To drain a node we would modify the OSD crush weight of all of a storage node's OSD's to 0. This will trigger an evacuation of data away from this storage node and distribute it to the rest of the cluster.

For example, to drain OSD's 720 to 755 we would run:
~~~bash
for i in $(seq 720 755); do ceph osd crush reweight osd.$i 0; done
~~~

When the draining is complete you can check Ceph's health (ceph -s) to confirm if it is done draining the data. You can also use 'ceph osd df tree' to see how much data the disks still have to transfer off. Our storage nodes took on average 24 hours per server to drain.

### Converting the OSD to Bluestore
Follow these steps to safely retire the OSD and bring it back as Bluestore.
[Script available here](https://github.com/CancerCollaboratory/infrastructure/blob/master/migrate_bluestore.sh)

~~~bash
# Stop the OSD process
systemctl stop ceph-osd@<osd-id>.service

# Unmount the OSD
umount /dev/<block-device>

# Zap the disk
ceph-disk zap <osd-id>

# Mark the OSD as destroyed
ceph osd destroy <osd-id> --yes-i-really-mean-it

# Prepare the disk as Bluestore
ceph-disk prepare --bluestore /dev/<block-device> --osd-id <osd-id>
~~~

We noticed that when comparing the output of 'ceph osd tree' before/after conversion that the class column may now indicate your OSD type (SSD or HDD) which for us, was blank before. This may just be something that was added to Luminous but not unique to Bluestore. Just stating as an observation.

Filestore 'ceph osd tree'
~~~bash
ID   CLASS WEIGHT     TYPE NAME                STATUS REWEIGHT PRI-AFF
  -1       8503.16504 root default
 -84                0     rack 1
  -5       1306.07776     rack rack1
 -83        388.79956         host storage1-r1                               
720         10.79999             osd.720         up  1.00000 1.00000
721         10.79999             osd.721         up  1.00000 1.00000
~~~

Bluestore 'ceph osd tree'
~~~bash
ID   CLASS WEIGHT     TYPE NAME                STATUS REWEIGHT PRI-AFF
  -1       8503.16504 root default
 -84                0     rack 1
  -5       1306.07776     rack rack1
 -83        388.79956         host storage1-r1
720   hdd   10.79999             osd.720         up  1.00000 1.00000
721   hdd   10.79999             osd.721         up  1.00000 1.00000
~~~

### Filling
Now it's time to populate the bluestore OSD's with data. Just like the draining step we will change the OSD crush weight

For example, to fill OSD's 720 to 755 (12TB disks) we would run:
~~~bash
for i in $(seq 720 755); do ceph osd crush reweight osd.$i 10.79999; done
~~~

Depending on the size of the disks you will need to find the right value for your OSD crush weight. This is typically the size of the disk in TB. Read more about the differences of 'ceph osd reweight' and 'ceph osd crush reweight' [here.](https://ceph.com/geen-categorie/difference-between-ceph-osd-reweight-and-ceph-osd-crush-reweight/)

Wait for Ceph health to return to HEALTH_OK.

## Tracking and Monitoring
We use a variety of tools to monitor and report on our OpenStack and Ceph cluster. For this migration we were able to monitor filestore's XFS data partition and see the data be copied off to the rest of the cluster.
<figure>
    <img id="drain1" src="{{site.urlimg}}jared_baker/bluestore/drain1.png" data-featherlight="#drain1" />
</figure>

Once the OSD is converted to bluestore we no longer have that trusty posix filesystem to monitor in Zabbix so we had to rely on output from ceph-mgr to obtain how much data is living on the OSD. Grafana and graphite has nice integration with ceph-mgr so that we are still able to see the granularity of data distribution on each storage node.
<figure>
    <img id="zabbixvsgrafana" src="{{site.urlimg}}jared_baker/bluestore/zabbixvsgrafana.png" data-featherlight="#zabbixvsgrafana" />
</figure>

With 37 storage nodes to migrate and each one needing to drain, convert, fill, we had to track it somehow. We are a team of two so we set up a shared google spreadsheet and kept track of the progress.
<figure>
    <img id="tracking" src="{{site.urlimg}}jared_baker/bluestore/tracking.png" data-featherlight="#tracking" />
</figure>


## How long did it take?
We started the migration near the end of July 2018 and finished in early September. During this migration period the cluster was still in production and we recorded the following statistics:
* 480 TB of genomic data uploaded to the cluster
* Added 1 PB worth of new storage capacity
* Served up 188 TB of genomic data to the various researchers of the Collaboratory.

## Performance impact
The draining and filling of each storage node causes massive amounts of replication traffic on the cluster but the front end of the Ceph cluster was still able to serve the environment unimpacted. Researchers were still able to fetch data from the object storage and openstack volumes continued to work without issue. We also benchmark the download of 100GB genomic files from our object storage every hour and saw no deviation from the normal speed during this migration project.
<figure>
    <img id="hourlydownloads" src="{{site.urlimg}}jared_baker/bluestore/hourlydownloads.png" data-featherlight="#hourlydownloads" />
</figure>

## Issues
Late into the project we started to get Ceph health warnings, complaining that the monmap was too large. Our cluster is a few years old so our monmap is leveldb. The monmap was growing to 20GB during the migrations (under 1GB normally). Leveldb can perform poorly during large data movement events and cause everything to slow down. To remedy this we had to enable mon compaction in our /etc/ceph/ceph.conf and then restart ceph-mon and then wait for the compaction to happen.
~~~bash
[mon]
  mon compact on start = true
~~~
This wasn't much of an issue since we had allocated 100GB to the partition where the monmap was stored but did result in us looking into migrating to the monmap backend to Luminous' default of 'rocksdb' which apparently handles data migration events like failures much better.

To find out if your monmap is leveldb or rocksdb, do the following
~~~bash
# cat /var/lib/ceph/mon/ceph-<mon-name>/kv_backend
leveldb
~~~

Currently the only way to migrate from leveldb to rocksdb is to remove/add your mons. For example if you have 3 mons you could deploy a temporary 4th mon and then remove/add your original 3 mons and then retire the 4th mon.

## Future improvements
- Ceph monmap backend change to rocksdb
- Increase PG's to account for the new OSD's we added to the cluster during the migration

## References
* [Slides from our Ceph migration talk at the OpenStack meetup](https://www.slideshare.net/JaredBaker22/open-stack-meetup-oct-2018-migrating-83pb-of-ceph)
* [Bluestore in Luminous](https://ceph.com/community/new-luminous-bluestore/)
