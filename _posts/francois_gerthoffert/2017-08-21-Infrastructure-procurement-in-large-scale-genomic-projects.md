---
layout: post
title:  "Infrastructure procurement in large-scale genomic projects."
breadcrumb: true
author: francois_gerthoffert
date: 2017-08-21
categories: francois_gerthoffert
tags:
    - Project Management
    - Procurement
    - Cloud Infrastructure
teaser:
    info: More than 3 years into the project, it's a good time to reflect on our procurement strategy for the Cancer Genome Collaboratory, with a focus on the Storage infrastructure.
    image: francois_gerthoffert/collab-procurement/collab-logo.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

While working on the Cancer Genome Collaboratory project, the team recently finalized procurement of what is likely going to be the last major purchase of storage resources. It will be adding 3,6 PB of raw storage capacity, which should provide us with adequate data redundancy and safeguards, around 1 PB of additional storage available to researchers.

Today, we are more than 3 years into the project, this milestone is a good opportunity to reflect on our procurement strategy.

The [Cancer Genome Collaboratory](http://cancercollaboratory.org/) "program" (although we refer to it as a project, it's more of a program) is composed of multiple projects, also called "cores", each of them with their own mandate, from building the infrastructure to law & ethics. Our group, in charge of Core 1, is providing the cloud infrastructure and software stack to facilitate compute and storage of [genomic data](https://dcc.icgc.org/repositories?filters=%7B%22file%22:%7B%22repoName%22:%7B%22is%22:%5B%22Collaboratory%20-%20Toronto%22%5D%7D%7D%7D&files=%7B%22from%22:1%7D).

# Defining a purchase strategy

The Cancer Genome Collaboratory is a research project involving a large amount of data (petabyte-scale) and compute resources (1000s of CPU cores) on an infrastructure having its own set of requirements and constraints.

Our first infrastructure activity on this project, even before defining our purchase strategy, was to build a proof of concept (PoC) to validate initial designs and verify the infrastructure's capacity for scalability.

As you might know, storage and compute [density grow throughout the years](https://en.wikipedia.org/wiki/Moore%27s_law), with the price per TB or per CPU core constantly decreasing. With a project planned to enter full production stage 4 years after initiation, we decided to stagger procurement throughout the project lifespan and purchase "as late as possible" with the objective of providing our users with more compute and storage resources per project-dollar spent.

This approach also has an interesting side effect on long-term maintenance and warranty when comparing purchasing everything at once versus staggered purchases. Let's imagine purchasing during "Year 1", a storage server composed of 36x 4TB drives. This server will complete its 3 years warranty period during "Year 4". If we keep sufficient funds for purchases towards end of "Year 3" or beginning of "Year 4", we'll likely be in a position of purchasing storage servers composed of 36x 10TB drives. With more than double the capacity, those will be covering replacement of "Year 1" servers, while effectively providing storage components under warranty for an additional 3 years.

# Available procurement methods

The first step in purchasing equipment is to identify and initiate the appropriate procurement strategy. The 4 most common procurement methods available to potential buyers are [RFI, RFP, RFQ and RFSQ](https://www.negotiations.com/articles/procurement-terms/). Those methods provide a framework to purchase physical equipments (that's the most "obvious" part), but also detail all contractual elements associated with this purchase such as warranty period, support services, RMA (Return Merchandise Authorization) process, payment schedule, and so on.

Although the part about equipments is relatively straight-forward, it is key to properly negotiate and identify all the contractual elements associated with hardware purchases.

## RFI: Request For Information

RFIs are usually used to consult vendors on the feasibility of a project and get an estimate of the associated costs. An RFI could eventually be sent to a large number of vendors and used as a mean of shortlisting vendors in preparation for a RFP or RFQ.
For example, sending the RFI to 15 vendors with the objective of keeping to invite the 3 best vendors for a RFP or RFQ phase.

> I would like to build a Compute and Storage cloud capable of storing 6 PB of data and running 1000 Virtual Machines in parallel.

## RFP: Request For Proposal

RFPs are usually used to obtain detailed pricing and conditions from vendors on complex projects. Exact specifications of the components are potentially unknown (or partially known) by the buyer who relies on the Vendor's expertise to identify the most relevant solution.

> I would like to build an OpenStack Compute and Storage cluster capable of storing 6 PB or data and running 1000 Virtual Machines in parallel. The infrastructure should be interconnected with high-performance networking providing at least 10 Gbps connectivity to the servers and 100 Gbps inter-rack connectivity. Storage should rely on 6 to 8 TB SAS drives. Compute servers should be composed of Intel CPUs with 10-14 cores and contain at least 256GB or RAM per server.

## RFQ: Request For Quotation

RFQs are usually used to obtain detailed pricing from vendors based on specifications sent by the buyer. This methods relies on the buyer clearly understanding his needs, requirements and components specifications.

> Please provide a quote for IBM servers with Intel Xeon E5-2670 CPUs, 256GB of DDR4-2133 ECC RAM, 6x 2TB 2.5" SAS drives (12GB/s, 7.2K RPM, 128MB Cache)...

## RFSQ: Request For Supplier Qualification

RFSQs are usually used to pre-select vendors and establish common contractual agreement for multiple purchases made under this agreement. By establishing contractual details upfront, it facilitates subsequent quotation phases, which are all based on the same conditions (support, warranty period, lead times, ...).

The initial stage of a RFSQ has similarities with a RFP in the sense that it contains contractual details and, in our situation, it relied on a "simulated" proposal to evaluate vendors. Following the RFSQ, subsequent procurement is executed through multiple RFQ phases.

After award the RFSQ is limited to an initial set of vendors, which which a contract was signed. But at any point in time, we have the flexibility to initiate a RFP and run purchases outside of the RFSQ framework (as long as the RFP is executed following corresponding rules).

RFSQ are very common for maintenance activities (such as gardening, electrical work), less for IT Infrastructure projects. It was suggested to us by our procurement department as we were discussing the project's procurement approach.

# Evaluation

While preparing a request using one of the methods detailed above, it is critical to identify clear evaluation factors and assign each of them a "weight" in order to establish a score. This allows a fair evaluation of the vendors based on transparent criteria. The evaluation could for example range from 1 to 5, while the weight could be a percentage, giving you a total score to be used while comparing vendors.

| Category      | Evaluation  | Weight  |
|---|---|---|
|Price          | 1 to 5 | 50%  |
|Delivery Time  | 1 to 5 | 20%  |
|Warranty Period| 1 to 5 | 30%  |

The selected vendor will therefore be the one with the closest score to 100.

Establishing the evaluation factors up-front is also a technique to structure your requests and communicate to vendors how their answers should be formatted. The more technical the request is (RFQ in particular), the more precise the evaluation factors are going to be, and the last thing you want when comparing proposals is to spend hours dissecting a proposal to identify factors impacting the scoring.

Less technical requests (RFIs for example), could be evaluated on additional criteria such as:

 - Quality of the technical response
 - Technical expertise of the vendor's personnel (based on their bios, certifications ...)
 - Experience of the vendor in delivering similar projects

Keep in mind, while preparing the request and evaluating responses that the less technical the request and evaluation criteria is, the harder it becomes to evaluate and justify such an evaluation. So chose your evaluation criteria wisely to serve your project's purpose and facilitate the procurement process, in particular if a vendor decides to challenge the award decision.

# Our strategy

As mentioned above, the RFSQ appeared to be the ideal method for Collaboratory procurement, and we used the initial purchase as the baseline to build the RFSQ and to pre-select vendors.

Having an RFSQ signed with vendors allows us to focus our subsequent requests on the technical specifications, maintaining the common contractual framework (support, RMA process) negotiated initially. Each purchase as part of the RFSQ is then a simple RFQ containing detailed specifications of products to be purchased, with the biggest factor impacting the score being pricing.

It is worth mentioning that, at any point in time, we could make purchases outside of the RFSQ framework, as long as we do so following [procurement policies](http://www.procurement.utoronto.ca/programs-and-services/purchasing-goods-services).

# ... Four purchases later

Until now, we've been running 4 RFQ under this RFSQ framework, and are likely going to run a last one by the end of the project's initial grant period. Proceeding with an RFSQ provided us with a relative quick turnover and simplified quotation process while following UofT procurement policies.

<center>
  <figure style="width: 70%;">
      <img src="{{site.urlimg}}francois_gerthoffert/collab-procurement/collaboratory-rack-second-first-purchase.png"/>
      <figcaption>Collaboratory infrastructure after our first purchase</figcaption>
  </figure>
</center>


But did our initial strategy worked out, and effectively provided us with more resources per dollar spent ?

## Comparing options

One of the biggest unknowns impacting pricing on our purchases was hard disks costs, so we decided to focus on cost per TB for our purchases. All our requests were composed of 2 options we believe were, at the time of the purchase, the most cost effective solutions. Comparing for example, 4TB drives versus 6TB drives, 6TB vs 8TB, and so on. We were not comparing just the individual drive costs, but also its impact on the underlying infrastructure. Less storage capacity per server, means more servers, which subsequently means more rack space, more networking capacity, so saving on individual disk costs, could also mean spending more on the infrastructure to support those disks. The challenge being to find the right balance.

## Some numbers

It we look back at our purchases and focus only on disk and storage server costs (which only gives part of the picture), we get the following table:

| Purchase date  | Disk size  | Cost per Disk  | Cost per disk-TB  | Cost per Server | Server Capacity | Cost per server-TB |
|---|---|---|---|---|---|---|
|May 2015       | 4 TB | $270   | $67 | $18,000 | 144 TB | $125 |
|December 2015  | 6 TB | $380   | $63 | $24,000 | 216 TB | $111 |
|September 2016 | 8 TB | $550   | $69 | $29,000 | 288 TB | $101 |
|July 2017      | 10 TB| $620   | $62 | $32,000 | 360 TB | $89  |

___Note: Above prices have been altered but represent a meaningful demonstration___

Although there was a slight spike in September 2016 on individual disk cost, we can see that overall the cost per TB throughout our purchases went down.

## Looking back

Looking back is always easy, but back when we established our procurement strategy, we could only rely on our past experience in the industry, with no guarantees that our strategy relying on purchasing "as late as possible" was going to be effective.

One of the external factors is the USD -> CDN conversion rate, as currency fluctuations directly influence our purchase prices. It probably explains why the cost per TB on an individual disk was higher in September 2016. Our storage needs at that time was only of 3 servers (864 TB), so the impact was fairly limited and the conversion rate started to go back down after that time and is today at the same level it was early 2015 (although still much higher than when the project started in 2014).

<center>
  <figure style="width: 70%;">
      <img src="{{site.urlimg}}francois_gerthoffert/collab-procurement/usd-cdn-conversion-rate.png"/>
      <figcaption>USD-CDN exchange rate evolution</figcaption>
  </figure>
</center>

But ultimately, the thing to look at is that today we are purchasing servers with 2.5 times more storage capacity than in 2015, which means less need for physical resources per TB of storage, which plays largely in our favor from a budget point of view.

# Conclusion

So what could be the recommendations and conclusion of this article ?

If you know upfront that your project will be composed of multiple purchases, identify a procurement strategy and setup a contractual framework before starting. Not having to re-negotiate or re-validate items such as warranty, support details, greatly eases the procurement process.

Don't purchase more storage capacity than required. Considering that transferring petabytes of data takes a long time, and the data to be stored might not yet be available, you might have sufficient time for staggered purchases. Instead, identify your requirements and schedule your purchases accordingly. This will provide the project with better value per dollar spent by benefitting of costs decrease and technological improvements.

Watch out for external factors, such as currency exchange rate. Even if they are outside of your control, you might want to try to articulate your strategy around those.

Establish a clear, fair and re-usable evaluation matrix. This will facilitate vendor evaluation and could also be of a great help may a vendor decide to contest an award. This is particularly true in the public sector. Furthermore, in the context of a particular purchase, don't talk to vendors directly before a quote is awarded, let your procurement department handle the communication. This will help prevent disputes coming from vendors. IT is a relatively small ecosystem and it's not rare from vendors to talk to each other or hear rumors and the last thing you want is to have to re-run a quotation process.

Finally, don't forget that you are not on your own in the process. Your procurement department has experience running such purchases and although they might not have experience in your particular technical domain, they will be able to walk you through the procurement process, help catch potential errors in your request and ensure communication with vendors follows procurement rules and practices.
