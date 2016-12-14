---
layout: post
title: "GitHub repository as job scheduling system to orchestrate large data transfer"
breadcrumb: true
author: junjun_zhang, linda_xiang
date: 2016-12-12
categories: linda_xiang
tags:
   - GitHub
   - data transfer
   - job scheduling
teaser:
   info: The ICGC Data Coordination Centre was tasked to transfer over 700TB dataset into cloud storage systems. We developed a simple and reliable job scheduling system based on GitHub repository to orchestrate and track the execution of over 45,000 transfer jobs.
   image:  linda_xiang/data-transfer/github.png# optional
header: 
   version: small
   title: Software Engineering Blog
   image: header-logo-crop.png
   icon: icon-blog
---

## The task

The Pan-Cancer Analysis of Whole Genomes
([PCAWG](https://dcc.icgc.org/pcawg)) project is a collaborative effort by
the International Cancer Genome Consortium (ICGC) to identify common
mutation pattens from over 2,800 cancer whole genomes with an emphasize in
non-coding regions. Large amount of data were generated and stored in
multiple [GNOS](https://annaisystems.zendesk.com/hc/en-us/sections/200575407-GNOS-and-GeneTorrent) repositories, core dataset includes:

* 703.89 TB of whole genome uniformly aligned (by BWA-MEM) sample-level BAM
* 695.59 GB of Sanger/DKFZ/Broad/Muse variant calling VCF
* 24.52 TB of RNA-Seq TopHat2/Star aligned BAM

The ICGC Data Coordination Centre ([DCC](https://dcc.icgc.org/)) was tasked to transfer this
dataset to cloud based storage systems, specifically, OpenStack Ceph
system hosted by [Cancer Genome
Collaboratory](https://www.cancercollaboratory.org/) and AWS S3.

To rapidly transfer such a large dataset in a well-managed fashion, we
need a system to orchestrate execution of large number of data transfer
jobs with the following characteristics:

* simple to develop and use
* highly reliable
* able to work with cloud based compute environment


## The solution

### Synopsis 

We use JSON files to represent data transfer jobs. Each JSON file contains
necessary information for a data transfer job. JSON files are
pre-generated and checked into a GitHub repository, which is structured
with a few directories each representing a job state. Each data transfer worker clones the GitHub repository and picks up a queued job by moving the corresponding JSON file from 'queued-jobs' to 'downloading-jobs' directory. It then commits the change and pushes back to GitHub central repository. If more than one worker picked up the same job, a Git merge conflict will occur which elegantly avoids double scheduling. As the transfer job progresses to next steps, the worker will add log to the job
JSON file and move it from one directory to the next, every file change
and movement will be committed and pushed to GitHub.

### Generate job JSONs

Each job transfers data for a particular GNOS Analysis Object consisting
of a group of files from a GNOS repository. Job JSON files containing
information about files to be transfered are generated using metadata
retrieved from GNOS repositories. Specially designed convention is
followed to name each job JSON file, which includes multiple parts to
ensure uniqueness and being informative. For example,
`001a5fa1-dcc8-43e6-8815-fac34eb8a3c9.RECA-EU.C0015.C0015T.WGS-BWA-Tumor.json`, it follows this pattern:
`{aliquot_id}.{project_code}.{donor_id}.{sample_id}.{data_type}.json`. This design makes preventing generating duplicated job a trivial task, which
otherwise could be a challenge.


### GitHub repository as the job scheduler and status tracker

Job JSON files are checked into a GitHub repository, and organized in
different directories with each representing a particual job state.
For a typical setup, the following directories are used.

* backlog-jobs
* queued-jobs
* retry-jobs
* downloading-jobs
* failed-jobs
* uploading-jobs
* completed-jobs


Job JSON files are initially put in 'backlog-jobs' directory, this is like
the TODO list. When we are ready to run a batch of jobs, the corresponding
JSON files can be moved from 'backlog-jobs' to 'queued-jobs' by using normal git commands:

~~~
git mv backlog-jobs/001* queued-jobs/
git add .
git commit -m 'put jobs with name starting with "001" to the queue'
git push
~~~

Meanwhile, data transfer workers are watching the content of the
'queued-jobs' directory for jobs to run. This is done by simply cloning
the GitHub repo once to the worker's local machine and running 'git pull'
periodically.

When new job JSON files are detected by a worker, it will try to move the
first job JSON (assuming alphabetically ordered) from 'queued-jobs' to
'downloading-jobs', then commit the change, and finally push the commit
back to GitHub repo. At this point, there are two possible outcomes:

* git push succeeded. Easy, the job will be considered 'scheduled' to that
worker, and the worker keeps going with the transfer job.
* git push failed. It could be by any reason, but typically it is because
the same job JSON has already been picked up and moved out from
'queued-jobs' directory by another worker. In any case, the worker with
failed git push will simply start over to pickup another queued job.

Starting over can be performed by executing the following commands:

~~~
git checkout master && \
git reset --hard origin/master && \
git pull
~~~

This is to wipe out all local changes on the worker machine and re-synchronize with the central GitHub repo, and this will give the worker a clean starting point to pickup a new queued job JSON.

These steps can be retried as many times as needed until the worker gets a
new job successfully and starts working on it.

Once a worker successfully started working on a job, it will first modify
the job JSON file to add some logging information, such as, worker_id,
start_time etc. Such change will be committed to git and pushed back to
GitHub repo. In case of run time error, before moving the JSON to the
'failed-jobs' directory, error message will be recorded in the JSON to
help with debugging and retry.

Except for commit message and revision history are stored in git repository, all other information is kept in JSON files as plain text. It's straightforward to retrieve near real time job status by performing a git pull and simply counting files in different sub-directories. With a simple script one can parse the job JSONs to get addition metrics of job executions, such as, average time spent on each state, average data transfer rate for each GNOS repository etc.

## Conclusion

In summary, we used a GitHub repository as the source of truth for
information about all transfer jobs. The GitHub repository naturally plays an orchestration role accepting latest job status via git push from all transfer workers and making latest status accessible to all workers using git pull. GitHub service is realiably available from any where in the Internet. With this design, there is no need for us to write any server-side code, we get from GitHub for free all of the important features, such as, job scheduling, logging, status tracking and high availability. Client-side code is fairly straightforward to develop, job requesting is a matter of a few git commands: git pull, git mv, git commit and git push. Logging job status is to simply modify a JSON file, commit to git and push back to GitHub.

With large number of worker nodes lauched from Collaboratory/AWS, we used this system to perform over 45,000 transfer jobs. Two GitHub repositories, [ceph_transfer](https://github.com/ICGC-TCGA-PanCancer/ceph_transfer_ops) and [s3-transfer](https://github.com/ICGC-TCGA-PanCancer/s3-transfer-operations) were set up to coordinate and track the whole process, generating over 210,000 and 150,000 commits reperspectively. This approach was later adapted by PCAWG OxoG pipeline to run over 2800 [jobs](https://github.com/ICGC-TCGA-PanCancer/oxog-ops). All had been very smooth.