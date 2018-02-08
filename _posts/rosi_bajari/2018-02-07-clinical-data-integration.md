---
layout: post
title:  "Integrating Clinical Annotation Features into the ICGC Data Portal"
breadcrumb: true
author: rosi_bajari
date: 2018-02-07
categories: rosi_bajari
tags:
    - ICGC
    - data portal
teaser:
    info: In February 2018, we integrated new features focusing on clinical annotation of variants into the ICGC data portal.  Here, we will explore some of those features and how they can be used by researchers! 
    image: rosi_bajari/clinical/post_thumb.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

As part of the ICGCs goal of creating comprehensive descriptions of cancer genomics, we are introducing a new integration of clinically relevant data to the ICGC data portal from [CIVIC](https://civic.genome.wustl.edu/), a database of curated, clinically relevant cancer variants, and [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/), a database of alleles and their phenotype relationship.  CIVIC curated variants are reviewed regularly by curators and editors and help link mutations to published supporting material as well as targeted therapeutics.   ClinVar annotates the clinical significance of genetic variants based on aggregated results of published evidence.  

# How does this new clinical data fit into the ICGC data portal ? 
The ICGC has collected a massive volume of cancer data.  To date, there are 76 participating cancer projects with 17,440 donors with molecular data, with a whopping 68 million individual mutations!  Annotating, the process of identifying data features, helps researchers sort through all 68 million mutations to help answer scientific inquiries.  Through our new clinical integration, 447 Pathogenic or likely pathogenic mutations have been identified. 

<center>
  <figure>
      <img src="{{site.urlimg}}rosi_bajari/clinical/gene_pyrmid.png"/>  
      <figcaption>Data pyramiding - sorting from everything to the most important things</figcaption>
  </figure>
</center>

Now that we have all the data, the next questions is "How can scientific community members use this information?". Let’s examine how researchers or clinicians could use this information to help answer these questions.   

# Finding significant mutations

One interesting question a cancer researcher could ask would be: How many clinically significant mutations in the KRAS gene from the [ICGC PCAWG](http://docs.icgc.org/pcawg/) (PanCancer Analysis of Whole Genomes) donors are there?  Using our new clinical significance and evidence facets in Advanced Search, there are 17 different mutations across 282 donors (query accessible [here](https://icgc.org/Zuh)). This interesting discovery can lead to more questions to investigate like how effectively a clinically significant mutation can predict survival rate, or what pathways the mutation might affect that causes certain cancerous symptoms.  

<center>
  <figure >
      <img src="{{site.urlimg}}rosi_bajari/clinical/av4.png"/>
  </figure>
</center>

In addition to discovery, this integration will also help users focus on the clinical impact of specific mutations.  For example, a clinician may have a set of patients with mutations in the BRAF gene at the 600 Valine position.  What types of evidence or treatments have been tested on other patients like theirs? Using the updated gene and mutation entity pages, clinicians can find other similar profiles and investigate evidence types and drug investigations; Using the previous example, a clinician and see that[BRAF V600E](https://dcc.icgc.org/mutations/MU62030) mutations have been shown to respond to treatment with Trametinib &
Dabrafenib (shown below).  Conveniently, clinicians can directly access the evidence items published article through our link to Pubmed to further their investigation!

<center>
  <figure>
      <img src="{{site.urlimg}}rosi_bajari/clinical/av2.png"/>
  </figure>
</center>

# Discover with us!

Have a burning question sparked by this blog post that you need to answer now?  [Use](https://dcc.icgc.org/search) our new clinical integration to investigate and share your results or with us below!
 



