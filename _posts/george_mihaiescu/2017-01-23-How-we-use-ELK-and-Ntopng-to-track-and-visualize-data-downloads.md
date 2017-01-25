---
layout: post
title:  "Using ELK and Ntopng to monitor data downloads."
breadcrumb: true
author: george_mihaiescu
date: 2017-01-23
categories: george_mihaiescu
tags:
    - OpenStack
    - Ceph
    - Collaboratory
teaser:
    info: How we use ELK (Elasticsearch, Kibana, Logstash) and Ntopng to track and visualize data downloads
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Introduction
<a href="http://www.cancercollaboratory.org/">Cancer Genome Collaboratory</a> is a cloud environment built using open-source technologies that aims to offer cancer researchers access to compute resources close to the large data sets used in their analysis. 

Currently we have 4 PB of raw Ceph storage and 2500 CPU cores deployed on top of Ceph and Openstack, but we also use a number of other open-source tools to manage and monitor the infrastructure.

All the servers ship their logs to the central Logstash server where they are parsed and injected into Elasticsearch, so we can easily query the download requests.

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Logstash_fields.png" />
    <figcaption>:(</figcaption>
</figure>

Because we store the large genomics data files as S3 objects uploaded in 1 GB multiparts, we can focus the Kibana search on the download requests for objects larger than 1 GB, while also excluding the IP addresses of some known clients (regular downloads part of our monitoring system).

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Large_downloads_search_query.png" />
    <figcaption>:(</figcaption>
</figure>

Finally, we can create a Kibana visualization out of the search results in order to get a better idea on the major download users (each hit count means 1 GB download).

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Large_downloads_visualization.png" />
    <figcaption>:(</figcaption>
</figure>

In addition to the central aggregation of the application logs in ELK, the core switch connecting the environment to the Internet sends sflow statistics to <a href="http://www.ntop.org/">Ntopng</a> for which we have a free license nicely provided by the Ntop maintainers.

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/Ntopng_flows.png" />
    <figcaption>:(</figcaption>
</figure>

This allows us to see in real time external connections, and even to geographically display them on the map.

<figure>
    <img src="{{site.urlimg}}george_mihaiescu/sflow3.gif" />
    <figcaption>:(</figcaption>
</figure>

