---
layout: post
title:  "Use Git to Manage the Jobs for data transferring"
breadcrumb: true
author: linda_xiang
date: 2016-12-06
categories: linda_xiang
tags:
    - Git
    - data transfer
    - JSON
teaser:
    info: Use Git to manage the .
    image: linda_xiang/data-transfer/data_migrate_block.png # optional
header: 
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Background

The clouds offer scalable and competitively priced computing resources for the analysis and storage of data from large-scale genomics studies. They are now offered by both commercial companies including [Amazon](https://aws.amazon.com/), [Google](https://cloud.google.com/) and [Microsoft](https://azure.microsoft.com/), as well as some academic data centres such as [Cancer Genome Collaboratory](https://www.cancercollaboratory.org/)(Collaboratory) at OICR. Provided the cloud infrastructures and computing enviroments are operational, migrating the big genomic data to those cloud storage systems becomes crucial and urgent.

## Motivation

We were once faced with the challenge to migrate huge-scale [Pan-Cancer Analysis of Whole Genomes project](http://pancancer.info/)(PCAWG) data from GNOS to Collaboratory/Amazon S3 cloud storage.

As it is well known that the Pan-Cancer Analysis of Whole Genomes project(PCAWG) is an effort to understand the role of non-coding regions of the genome in cancer. For this purpose many different datasets were generated and stored in individual GNOS repositories hosted at different academic centres globally. Overall, from 2834 donors among 48 cancer projects, the PCAWG project generated:

* 703.89 TB whole genome uniformly aligned (by BWA-MEM) sample-level BAM files
* 695.59 GB Sanger/DKFZ/Broad/Muse variant calling VCF files
* 24.52 TB RNA-Seq TopHat2/Star aligned BAM files

Given the large number of files(e.g, in total 5789 whole genome aligned BAM files) and the big size of each file(e.g, in average 200GB for each whole genome aligned BAM file) to be transferred, the crucial questions get asked are: 

* How to track each file so that there is neither missing nor duplicated files? 
* How to maximize bandwidth utilization so as to migrate the data as efficient as possible?


## Our solution

#### Generate the jobs

In order to track each file which is to be transferred, we will retrieve and organize the important metadata into a single JSON file. E.g.,

~~~~
{
    "aliquot_id": "04db8bef-8777-48ac-bc2e-3c9acb103f48", 
    "available_repos": [
        {
            "https://gtrepo-ebi.annailabs.com/": {
                "file_md5sum": "de3d65673a34470da768ca7d4135ccbd", 
                "file_size": 31867
            }
        }, 
        {
            "https://gtrepo-bsc.annailabs.com/": {
                "file_md5sum": "cf09ea2d42b3e04c7ce39de4f40ac15a", 
                "file_size": 31868
            }
        }
    ], 
    "data_type": "WGS-BWA-Tumor", 
    "files": [
        {
            "file_md5sum": "8a4e304e7b2742d2214aad519ba2f00f", 
            "file_name": "8a4e304e7b2742d2214aad519ba2f00f.bam", 
            "file_size": 111511575598, 
            "object_id": "c255b8ff-267a-5c7c-9262-80647fa064f9"
        }, 
        {
            "file_md5sum": "8e679ea1b673568c7da57c822f8f650c", 
            "file_name": "8a4e304e7b2742d2214aad519ba2f00f.bam.bai", 
            "file_size": 20316224, 
            "object_id": "b9787ed5-6fb6-573f-94ce-4cb36d3e5c07"
        }, 
        {
            "file_md5sum": "de3d65673a34470da768ca7d4135ccbd", 
            "file_name": "001a5fa1-dcc8-43e6-8815-fac34eb8a3c9.xml", 
            "file_size": 31867, 
            "object_id": "fee46097-9d12-5e30-90ba-0b7172a06c25"
        }
    ], 
    "gnos_id": "001a5fa1-dcc8-43e6-8815-fac34eb8a3c9", 
    "gnos_repo": [
        "https://gtrepo-ebi.annailabs.com/"
    ], 
    "is_santa_cruz": false, 
    "project_code": "RECA-EU", 
    "specimen_type": "Primary tumour - solid tissue", 
    "submitter_donor_id": "C0015", 
    "submitter_sample_id": "C0015T", 
    "submitter_specimen_id": "C0015T"
}
~~~~

Obviously, each JSON file is regarded as one job. The job contains the information about where to get the data and what is the data about. Importantly, each file in the job got a unique object_id. In this way, we can easily tracking each file. 

#### Organize the jobs 

Moreover, the jobs are organized into the following folders and moved among these folders during the process of the data transferring so that we can easily get the status of each job:

~~~~
├── backlog-jobs
├── completed-jobs
├── downloading-jobs
├── failed-jobs
├── queued-jobs
└── uploading-jobs
~~~~ 

In order to maximize bandwidth utilization, we used multiple cloud instances to do the jobs simultaneously. Following the [user guide](http://docs.openstack.org/user-guide/dashboard-launch-instances.html), it is easy to spin up as many instances as needed in Collaboratory. While many softwares are required to be installed before running the data migration job. E.g, 

* [gtdownload](https://hpc.nih.gov/apps/GeneTorrent.html): tool to download the data from GNOS
* [icgc-storage-client](http://docs.icgc.org/cloud/guide/#storage-client-usage): tool to Upload/Download/View/Mount data to/from/among Collaboratory

Therefore, it should be more convinient to install everything in one instance, create image and spin up instances from that image. 

However, using multiple instances comes with the risk that different machines may pick up the same job. So it is very important to properly schedule those jobs. 

#### Put the jobs folder under Git version control

In order to solve this problem, here we employ a remote git repository which is accessible to all the machines to store and synchronize all the jobs. You can choose to use a public space like [GitHub](https://github.com/) to host those jobs, but this comes with the risk of accidentally pushing sensitive data to a world-readable location. Therefore, we can instead install and set up a self-hosting git repository on our own machines.

Firstly, We make the above entire home directory under git version control and add the remote git repository as the origin. While starting the worker on each instance, a clone of the remote git repository will be created. E.g,:

~~~~
git clone git@github.com:ICGC-TCGA-PanCancer/ceph_transfer_ops.git
~~~~

Whenever the workers want to move the job, they needs to check whether the jobs on their local machine come into conflict with what are sitting in the remote Git repo. The worker can run a sequence of git commands as so to synchronize the local repo with the remote repository. E.g,:

~~~~
git checkout master
git reset --hard origin/master
git pull
~~~~

We do this by first checking out the master branch, then telling git to reset to the most recent commit, which should be the remote versions before the local machine makes any changes to the local repo. And then git pull will bring all of the remote files into our local machine.  

Now you can easily modify files on this machine and push them back to the remote repo as well. E.g.,

~~~
git mv ceph-transfer-jobs-bwa/queued-jobs/001a5fa1-dcc8-43e6-8815-fac34eb8a3c9.RECA-EU.C0015.C0015T.WGS-BWA-Tumor.json ceph-transfer-jobs-bwa/downloading-jobs/001a5fa1-dcc8-43e6-8815-fac34eb8a3c9.RECA-EU.C0015.C0015T.WGS-BWA-Tumor.json
git commit -m 'queued to downloading: 001a5fa1-dcc8-43e6-8815-fac34eb8a3c9.RECA-EU.C0015.C0015T.WGS-BWA-Tumor.json in run_1452616302_940fc28b-5c4e-494b-a044-1ad79f2a5065' 
git push
~~~~

In case there is conflict when the worker push back to the remote repo, the Git system will refuse the merge automatically and the process will return error code. So what we need to do is just pause a few seconds and retry the above commands until the successfully push back the changes. 


## Conclusion

It is obvious that all these Git procedures are completely visible to all the workers and anyone who has the authority to check out the Git repo. It is very convenient and straightforward for the user to monitor the whole process. Since all historical actions are automatically recorded as commits by Git, in-depth reports on the job process performance can be also easily generated by using data mining techniques. 


