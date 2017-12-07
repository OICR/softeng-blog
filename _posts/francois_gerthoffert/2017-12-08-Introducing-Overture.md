---
layout: post
title:  "Introducing Overture"
breadcrumb: true
author: francois_gerthoffert
date: 2017-12-08
categories: francois_gerthoffert
tags:
    - Software
    - Cloud Infrastructure
teaser:
    info: Today we are introducing Overture, our collection of open, composable and extendable components for data science in the cloud.
    image: francois_gerthoffert/overture-logo.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

Today we are introducing [Overture](https://www.overture.bio) as our collection of open, composable and extendable components for data science in the cloud. Although only introduced today, its inception started as a concept months ago as we were receiving requests from various organizations for guidance on how to run some of the [ICGC](https://dcc.icgc.org/) components in their own environment, with their own data or with a mirror of ICGC data.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/overture-logo.png" />
</figure>

As internal discussions progressed on documenting our ICGC tools in the perspective of them being used outside of the team, we started to better structure our open-source
 repositories, we also created an ICGC Github organization, to separate tools specific to our data portals from re-usable tools. But we soon realized this was not enough, that we were, with all our projects ([ICGC-DCC](https://dcc.icgc.org/), [Collaboratory](http://cancercollaboratory.org/), [Genomic Data Commons](https://gdc.cancer.gov/), Kids-First), in a privileged position to understand, design, implement and deploy components spanning the entire field of genomic data commons. And more than that, some of those components were already built and mature. Using years of experience operating the ICGC Data Coordination Centre, we learnt from our mistakes, optimized the implementation and overall built very robust and scalable components for our field.

# Our projects

To better understand why we are in a privileged situation with [Overture](https://www.overture.bio), it's worth detailing the scope of our main projects:
* On [Cancer Gernome Collaboratory](http://cancercollaboratory.org/) our team is building a cloud environment from scratch, including purchasing hardware, designing and operating the infrastructure (running OpenStack and Ceph), operating a [mirror of the ICGC Dataset](https://dcc.icgc.org/repositories?filters=%7B%22file%22:%7B%22repoName%22:%7B%22is%22:%5B%22Collaboratory%20-%20Toronto%22%5D%7D%7D%7D&files=%7B%22from%22:1%7D) and researching possible ways of implementing a cost recovery model. To do all of this, we are using off-the-shelf tools (OpenStack, Ceph, Zabbix, ...), but also building our own when such tools didn't exist.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/collab-racks.png" />
    <figcaption>Collaboratory Racks. Compute at the top, storage at the bottom.</figcaption>
</figure>

* On [ICGC-DCC](https://dcc.icgc.org/), we are building tools to support the entire data portal lifecycle, receiving data, processing it through a complex ETL, and making the resulting dataset available in a Data Portal. Started more than 5 years ago, it progressively went through different implementations, technological evolutions (ETL rewrite, multiple ES upgrades...), allowing the team to gain experience and better understand long term viable solutions for our field.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/song-and-score.png" />
    <figcaption>Architecture diagram for Song and Score (Metadata and file storage components)</figcaption>
</figure>

* On [Genomic Data Commons](https://gdc.cancer.gov/), we are building the front ends and part of the (GraphQL) API of this large scale project. The GDC allowed us to start a UI from scratch, improving on lessons learnt from the ICGC. The portal and the API went through many iterations, migrating from AngularJS to React and from a REST API to GraphQL. The scale of the project provided us with some level of flexibility for innovation, that would have been slightly more challenging with the ICGC. So GDC was also the opportunity to start [OncoJS](https://github.com/oncojs) to share efforts on visualization components between our projects (a first step towards Overture).

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/oncogrid.jpg" />
    <figcaption>Oncogrid, an OncoJS component shared between GDC and ICGC</figcaption>
</figure>

* On Kids-First (no website yet), we are building upon our experience with the 3 above-mentioned projects, but are faced with a new and exciting challenge, catering not only for researchers and field experts but also for patients and their families. This involves the creation of new components cohabiting with features more traditional of a genomic data portal (file repository, various entity pages...).

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/oicr-softeng.jpg" />
    <figcaption>A knowledge transfer on ETL (yes, lab coats were worn just for the picture)</figcaption>
</figure>

# Share components

As you might guess from the above, we try as much as possible to share expertise and components between our team and projects. But some of them were (and are still)  opinionated to the way our team operate and to the specificities of our projects.

That's where Overture start to play a role, by detaching our components from specific projects and "forcing" us to implement them in a reusable fashion, not only by us but also by anyone facing the same challenge.

# Four categories of components

Detailed on Overture's Website, we divided the components in four categories:
* __Operate__: Components focused on the operations of a cloud environment and its tools. Currently focused on infrastructure, it will extend to more, such as admin UIs.
* __Transfer & Store__: Securely transferring and storing data can be complex, tools in this category will be dedicated to topics such as authentication, authorization, download, upload, transfer management.
* __Do Science__: Once the environment is in operation, tools in this section will be focused on actually running analysis or workflows on the data. From running a Jupyter notebook on ICGC data to distributed computing on genomic files.
* __Share__: The data is there, it has been analyzed, now is the time to make it available to the research community. This category will focus on the dissemination of content, whether it's in the form of datasets or modern UI and visualization tools.

# Where do we stand today ?

We ensured our most recent components (ego, song, persona) are implemented in a reusable fashion and would be from the get-go aligned with Overture goals. We will progressively transition and document existing components (such as SCORE, our storage/data transfer solution) into the project. Ensuring all components within the Overture family retain a level of cohesion in their implementation and documentation.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/overture-github.png" />
    <figcaption>Overture organization on GitHub</figcaption>
</figure>


We are still early in the process, but today is a good time to publish it.

# Next ?

Openness is, and will remain, at the core of Overture. we will progressively transition our project management tools (i.e. Jira) to a public platform (i.e. GitHub issue) to give everyone a vision on our implementation roadmap and priorities. We also welcome external contributions to enhance the tools, get external input and overall make the components better.

There are currently 6 components part of Overture, more will come shortly.  

You can learn more on our website: [https://www.overture.bio](https://www.overture.bio) and of course on Github:  [https://github.com/overture-stack](https://github.com/overture-stack)
