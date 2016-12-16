---
layout: post
title: "GitHub repository as job scheduling system to orchestrate large data transfer"
breadcrumb: true
author: junjun_zhang, linda_xiang, francois_gerthoffert
date: 2016-12-12
categories: linda_xiang
tags:
   - GitHub
   - data transfer
   - job scheduling
teaser:
   info: The ICGC Data Coordination Centre was tasked to transfer an over 700TB dataset into cloud storage systems. We developed a simple and reliable job scheduling system based on GitHub repository, and successfully employed it to orchestrate and track the execution of over 45,000 transfer jobs to complete the task.
   image:  linda_xiang/data-transfer/git_job_scheduler.png# optional
header: 
   version: small
   title: Software Engineering Blog
   image: header-logo-crop.png
   icon: icon-blog
---

## The task

The Pan-Cancer Analysis of Whole Genomes([PCAWG](https://dcc.icgc.org/pcawg)) project is a collaborative effort by the International Cancer Genome Consortium (ICGC) to identify common mutation pattens from over 2,800 cancer whole genomes with an emphasize in non-coding regions. Large amount of data were generated and stored in multiple [GNOS](https://annaisystems.zendesk.com/hc/en-us/sections/200575407-GNOS-and-GeneTorrent) repositories, core dataset includes:

* 703.89 TB of whole genome uniformly aligned (by BWA-MEM) sample-level BAM
* 695.59 GB of Sanger/DKFZ/Broad/Muse variant calling VCF
* 24.52 TB of RNA-Seq TopHat2/Star aligned BAM

The ICGC Data Coordination Centre ([DCC](https://dcc.icgc.org/)) was tasked to transfer this dataset to cloud based storage systems, specifically, OpenStack Ceph system hosted by [Cancer Genome Collaboratory](https://www.cancercollaboratory.org/) and AWS S3.

Transferring such a volume of data comes its own set of challenges, in an ideal world with consistent end-to-end connectivity, transferring this dataset would take:

* 6.5 days with 10 Gbps connectivity
* 65 days with 1 Gbps connectivity
* 6 years with your typical 30 Mbps home Internet connection

When starting this project we were hoping to get a cumulated bandwidth of 1 Gbps, resulting in a minimum of 2 months of data transfer. It was therefore critical for us to design a system to orchestrate execution of large number of data transfer jobs with the following characteristics:

* simple to develop and use
* highly reliable
* compatible with cloud based compute environment


## The solution

### Synopsis 

We use JSON files to store jobs metadata, each file containing all necessary information for a data transfer job. Those files are generated in advance and checked into a Git repository structured with various directories representing possible job states.

Each data transfer worker would clone the Git repository and picks up a queued job by moving the corresponding JSON file from 'queued-jobs' to 'downloading-jobs' directory. The worker then commits the changes and pushes back to the central repository (GitHub in our case).

If more than one worker picked up the same job, a Git merge conflict would occur preventing double scheduling.

As the transfer job progresses to next steps, the worker will log progress to the job JSON file and move it from one directory to the next, commiting and pushing to GitHub as files are transitioned from one state (or directory) to another.


### Generate job JSONs

Each job transfers data for a particular GNOS Analysis Object consisting of a group of files. Job JSONs with information about files to be transfered are generated using metadata retrieved from GNOS repositories.

Job JSON files are named using a meaningful pre-defined convention, which includes multiple parts to ensure uniqueness and being informative. For example, `001a5fa1-dcc8-43e6-8815-fac34eb8a3c9.RECA-EU.C0015.C0015T.WGS-BWA-Tumor.json`, it follows this pattern: `{gnos_id}.{project_code}.{donor_id}.{specimen_id}.{data_type}.json`. This design makes preventing generating duplicated job a trivial task, which otherwise could be a challenge.

### GitHub repository as the job scheduler and status tracker

Job JSON files are checked into a GitHub repository, and organized in different directories corresponding to available job states. For a typical setup, the following structure is used.

* backlog-jobs
* queued-jobs
* retry-jobs
* downloading-jobs
* uploading-jobs
* failed-jobs
* completed-jobs

Job JSON files are first placed into 'backlog-jobs' which contains the list of jobs to be processed. At this stage they are not yet ready to be picked up by workers. When we are ready to run a batch of jobs, the corresponding JSON files are moved from 'backlog-jobs' to 'queued-jobs'. This allows fine grain scheduling by giving us the ability to precisely select files ready for processing.

This operation can be achieved using the following git commands:

~~~bash
git mv backlog-jobs/001* queued-jobs/
git add .
git commit -m 'put jobs with name starting with "001" to the queue'
git push
~~~

Data transfer workers are constantly watching the content of the 'queued-jobs' directory, and this is done by worker first cloning the GitHub repository and running `git pull` periodically to ensure it accesses the latest version of the job queue.

When new job JSON files are detected in the queue by a worker, it will try to move the first job JSON (assuming alphabetically ordered) from 'queued-jobs' to 'downloading-jobs', then commit the change, and push the commit back to GitHub repo. At this point, there are two possible outcomes:

* git push succeeded. The job is then considered 'scheduled' to that worker which initiates the data transfer.
* git push failed. This is typically caused by the same job JSON having already been picked-up and moved out of the queue by another worker. When this happens, the worker simply re-synchronizes with the remote repository, picks the next job in the queue and goes through the cycle again.

Refreshing the local repository can be achieved using the following set of git commands:

~~~bash
git checkout master && \
git reset --hard origin/master && \
git pull
~~~

These commands wipe out all local changes on the worker machine and re-synchronize with the central repository, this gives the worker a clean starting point to pickup a new queued job JSON.

These steps can be retried as many times as needed until the worker gets a new job and successfully starts working on it.

After starting a job, the worker will update its JSON content to add logging information such as worker_id, start_time, etc. Such changes will be committed to git and pushed back to the central repository. In case of runtime error, before moving the job JSON to the 'failed-jobs' directory, the worker will record the corresponding error messages into JSON to facilitate debugging.

Except for commit messages and revision history stored in the git repository, all other information is stored in the JSON files in plain text. It makes it straightforward to retrieve near real-time job status by performing a `git pull` and simply counting files in job directories.

A simple script can be written to parse the job JSONs to get additional metrics of job executions, such as, average time spent on each step, average data transfer rate for each GNOS repository etc.


## Conclusion

We used a GitHub repository as the source of truth for information about all transfer jobs. It naturally played an orchestration role, accepting latest job status via `git push` from all transfer workers and making latest status accessible to all workers using `git pull`. Leveraging existing technologies greatly simplified our task and saved us from having to write server-side code, since all the key features such as job scheduling, logging, status tracking and high availability have already been provided by Git server. Client-side code was fairly straightforward to implement and mostly identifying the best strategy in terms of git commands to use.

As of today, with large number of worker nodes lauched from Collaboratory/AWS, our system processed over 45,000 jobs, using two GitHub repositories, [ceph_transfer](https://github.com/ICGC-TCGA-PanCancer/ceph_transfer_ops) and [s3-transfer](https://github.com/ICGC-TCGA-PanCancer/s3-transfer-operations), generating over 210,000 and 150,000 commits respectively. This approach was later adapted by PCAWG OxoG pipeline to run over 2800 [jobs](https://github.com/ICGC-TCGA-PanCancer/oxog-ops). All had been very smooth.
