---
layout: post
title:  "Build workflows collaboratively using reusable and shareable packages"
breadcrumb: true
author: junjun_zhang
date: 2021-03-31
categories: junjun_zhang
tags:
    - Workflow
    - software reuse
    - package
teaser:
    info: Build workflows together without duplicating work.
    image: junjun_zhang/build-together.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## The problem

Recent advances in bioinformatics workflow development solutions, such as *[Nextflow](https://www.nextflow.io)*,
*[WDL](https://openwdl.org)* and *[CWL](https://www.commonwl.org)* mostly focus on
addressing challenges in reproducibility, portability and transparency. It has been
a great success. However, the support for workflow code reuse and sharing is significantly
falling behind, preventing the community from adopting the widely practised
*Don’t Repeat Yourself (DRY)* principle.


## Our solution

### Introduction
To address the aforementioned limitations, the International Cancer Genome Consortium
Accelerating Research in Genomic Oncology (*[ICGC ARGO](https://www.icgc-argo.org)*) has
been experimenting with a modular approach for over a year. It has established a set of
best practices promoting five principles: *reproducibility*, *portability*, *composability*,
*findability* and *testability*. For *composability*, the code of workflow steps are to
be written in a self-contained and well tested packages that can later be imported
into a workflow codebase. ARGO has successfully utilized the approach in the development
of four production workflows. Not only can we reuse packages across multiple workflows
with code residing in different repositories, but also make it possible for anyone in the
bioinformatics community to reuse them as part of their own workflows. This would
ultimately allow ARGO workflows to be developed collaboratively by its members from
around the globe.

### First iteration

Software code reuse is nothing new, general purpose programming languages support importing
code externally written as dependencies, which take the form as packages, libraries or
modules depending on the language. In this post we use the term *package*.

<a name="prerequisites"></a>
In order to share packages conveniently and reliably, usually these three things are required
to happen:
1. release the package with a version so that it has a stable reference.
2. bundle all artifacts of a package into an archive format for easy retrieval, typically
   a tarball is sufficient.
3. a place to host the packages, usually this is referred as a package registry.

To support these, Python has *[PyPI](https://pypi.org)*, JavaScript has *[npm](https://www.npmjs.com)* etc.
Unfortunately, when we started to design the code reuse approach in workflow development, none
of these existed for workflow languages. The good news was that some GitHub supported features
could be used to support what’s needed. More on this in just a bit.

Over to the package importing side, major workflow languages have some support for importing
code blocks as shown below:

* Nextflow (DSL2): *include <file://>*
* WDL: *import <file:// or http://>*
* CWL: *run <file:// or http://>*

Although the import is limited to only a single file, it’s sufficient to address our main use case,
ie, making the code of a single step tool reusable and shareable. As ARGO uses Nextflow exclusively,
the examples used in this post are based on Nextflow. However, the ideas should be applicable to
other workflow languages.

Here I use an example to demonstrate what we did to create a tool package and import it into the
workflow script. A tool package is called `payload-gen-variant-calling`, [here](https://github.com/icgc-argo/data-processing-utility-tools/releases/tag/payload-gen-variant-calling.0.3.6.0)
is release `0.3.6.0` of the package. This tool generates metadata JSON associated with variant calling,
it’s needed in all of our three variant calling workflows. It makes perfect sense to write the code
once and import it wherever needed.

As shown below in the table, we created the package release as a normal GitHub release with a special version
tag pattern: `<pkg_name>.<pkg_version>`. The release tag serves as a stable reference to the
package; the package code is a single file, no need to create a tarball; the code is directly
downloadable from GitHub (which sort of serves as a package registry) as raw content with a
stable URL. All three items mentioned earlier as [prerequisites](#prerequisites) are fulfilled, so the package is
released and ready to be imported.

|  Artifact  |  Content URL  |
|------------|---------------|
|  package code  |  https://github.com/icgc-argo/data-processing-utility-tools/blob/payload-gen-variant-calling.0.3.6.0/tools/payload-gen-variant-calling/payload-gen-variant-calling.nf  |
|  package release  |  https://github.com/icgc-argo/data-processing-utility-tools/releases/tag/payload-gen-variant-calling.0.3.6.0  |
|  package import URL  |  https://raw.githubusercontent.com/icgc-argo/data-processing-utility-tools/payload-gen-variant-calling.0.3.6.0/tools/payload-gen-variant-calling/payload-gen-variant-calling.nf  |


On the importing workflow side, the import statement is straightforward,
[this](https://github.com/icgc-argo/gatk-mutect2-variant-calling/blob/4.1.8.0-2.0/gatk-mutect2-variant-calling/main.nf#L239) is how it looks like in the *GATK Mutect2* workflow. Since Nextflow only imports from local
files, the package file needs to be downloaded beforehand and checked into the workflow Git repo.
This is also desirable as it makes the workflow code entirely self-contained. The package
installation is done by running a simple
[Python script](https://github.com/icgc-argo/gatk-mutect2-variant-calling/blob/4.1.8.0-2.0/scripts/install-modules.py).

After experimenting and prototyping for a couple of months, we were satisfied with the approach
and started to use it to develop the ARGO production workflows. Up to the time of writing, about
50 packages have been developed and released independently. Four workflows have been developed
using these packages as building blocks.

### Second iteration

As pointed out in [this article](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Package_management#what_exactly_is_a_package_manager),
to use software packages one may not need a *package manager*, which was what we did to get started.
However, comparing to doing everything manually, a package manager can streamline and automate a long
list of activities (mostly chores), ranging from template generation, automated build, testing to releasing etc,
resulting in greatly improved productivity and reliability.

Equipped with the successful experience of our modular approach for workflow code packaging, from the
beginning of 2021 we started to create our own *WorkFlow Package Manager - WFPM*.

A command line interface (CLI) tool called *WFPM CLI* is developed to provide assistance throughout
the entire workflow development life cycle, ensuring conformation to the established ARGO best
practices. It starts with auto-generated templates which include starter workflow code, code for
testing, and GitHub Actions code for automated continuous integration (CI) and continuous delivery
(CD). As part of the release process, package artifacts (scripts, configuration, test fixtures etc.)
are bundled together in a tarball and made available as a release asset. This addresses the
previous limitation of one single file package, it makes it possible to create a multiple-step
workflow as an importable subworkflow package.

Workflow developers can freely import packages as dependencies to build new workflows, which in
turn are also packages that can be released and imported by others. Common software engineering
practices such as CI testing, code review and release management can be seamlessly accommodated in
the process. Once a new version of a package is released, it is locked down with hash codes of the
Git commit and release assets (package tarball and metadata in the `pkg-release.json`), so that the
package becomes immutable and permanently available at GitHub. This provides ultimate reproducibility
and guarantees the package can be reliably imported by others.


## Conclusion

We expect *WFPM CLI* to significantly lower the barriers to adopt the *DRY* principle and promote
collaborative workflow development within the ARGO community and beyond. Similar to building
something amazing, together, with simple *LEGO Bricks* as illustrated below.

<figure>
    <img src="{{site.urlimg}}junjun_zhang/build-together.png" />
    <figcaption>Build something amazing, together!</figcaption>
</figure>


More information about *WFPM* can be found on its documentation site
at: [https://wfpm.readthedocs.io](https://wfpm.readthedocs.io).
