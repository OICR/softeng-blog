---
layout: post
title:  "Understand velocity and forecast with JIRA Agile"
breadcrumb: true
author: francois_gerthoffert
date: 2017-07-04
categories: francois_gerthoffert
tags:
    - JIRA
    - Project Management
    - Agile
teaser:
    info: Agile is at the heart of project management methodologies within our software engineering team. While trying our best to follow the Agile principles, we frequently adjust tools, workflows, methodologies in an effort to deliver better software, more efficiently. Understanding the team’s velocity in this evolving context is key to assess remaining effort and guesstimate completion dates.
    image: francois_gerthoffert/jira-agile-velocity/jav-slack.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

Agile is at the heart of project management methodologies within our software engineering team. While trying our best to follow the [Agile principle](http://agilemanifesto.org/iso/en/principles.html), we frequently adjust tools, workflows, methodologies in an effort to deliver better software, more efficiently. Understanding the team’s velocity in this evolving context is key to assess remaining effort and guess-timate completion dates.
 
We use Story Points [1, 2, 3, 5, 8, 13] to [estimate the level of complexity](https://www.atlassian.com/agile/estimation) of our activities, all tickets making their way into a sprint, must be estimated. Jira, our Agile ticket/project management platform does provide various tools and reports to assist in estimation and planning but we found those challenging to use in our context of fairly large teams and projects.
 
This article details how, by collecting statistics around previous work, we can better understand remaining effort and possible completion dates.
 
# What is Velocity ?
 
Quoting [Wikipedia](https://en.wikipedia.org/wiki/Velocity), "The velocity of an object is the rate of change of its position with respect to a frame of reference, and is a function of time." In our context it’s the evolution of activities completion over time, and the likelihood of maintaining acquired implementation rate in the future. 
 
# Jira meets real life
 
Metrics/Reports provided by default by Jira have a pretty naive approach, in particular when displaying velocity. In its reports, the tool displays velocity on a per sprint basis, but we find (and I guess it’s the same for most team) very challenging to keep a very strict sprint length from one sprint to the next. 
 
Jira does not account for sprint duration when displaying velocity, but people take vacation days, attend conferences, meetings, and of course, not all at the same time. Although we do come to an agreement on the sprint end date during planning meetings, its duration is not always identical. For example,  a team working on 2 weeks sprint schedule will usually end up planning for 9 to 12 business days sprints. 
 
<center>
  <figure style="width: 70%;">
      <img src="{{site.urlimg}}francois_gerthoffert/jira-agile-velocity/jira-sprint-velocity.png"/>
      <figcaption>Jira Sprint Velocity Report</figcaption>
  </figure>
</center>


Although Jira Velocity chart is useful to compare sprint "Commitment" versus "Completion" within a sprint, it is slightly less when comparing velocity from one sprint to the next since it does not account for exact sprint duration.
 
# Build your own
 
One solution is to build your own metrics, I personally find relevant to use the average completed story points per day, then multiply this number by the planned number of days in the sprint. It gives us an estimate on the number of story points the team could complete in a sprint. 
 
Although built-in reporting tools are limited, the good news is that Jira also provides access to its ticket through a REST API, meaning we can very easily extend its feature.
 
Furthermore this will let you gather metrics and forecast across multiple projects in a single Jira instance.
 
# Understand remaining effort
 
The first step, in understanding remaining effort, is to build a [JIRA JQL query](https://confluence.atlassian.com/jirasoftwarecloud/advanced-searching-764478330.html) to list all tickets the team is either currently working on or will be working on in the near future (for example tickets in open sprints).
 
To do so we are using the following query:

~~~
sprint in openSprints() and project in ("GDC Data Submission Portal", "GDC Documentation", "GDC Data Portal", "GDC API", "GDC Legacy Archive Portal", "GDC Website", "GDC Data Transfer Tool")  AND (assignee in membersOf("OICR") or assignee is empty) AND status not in (Merged, Closed)
~~~

It returns a list of all non-finished tickets, in an open sprint which are either unassigned or assigned to someone in our team.
 
# Understand past work
 
We then need to understand our velocity by gathering daily completion metrics. In our particular case, completion is calculated based on the transition to the "Merged" status.  
 
To do so we are using the following query:

~~~
project in ("GDC Data Submission Portal", "GDC Documentation", "GDC Data Portal", "GDC API", "GDC Legacy Archive Portal", "GDC Website", "GDC Data Transfer Tool") AND (assignee in membersOf("OICR") or assignee is empty) AND status changed to (Merged)
~~~

The tool will simply append the date [ON (2017-05-12)] and loop through previous days.
 
# Crunch numbers
 
Next is simple enough, record daily completed activities in a data set and use it to extract various statistics.
 
To be as relevant as possible with our estimates we are using rolling averages instead of all-time average. By comparing data over a short(er) period of time, rolling averages are a more accurate mean of extracting trends and understanding potential bottlenecks. 
 
<center>
  <figure>
      <img src="{{site.urlimg}}francois_gerthoffert/jira-agile-velocity/daily-velocity.png"/>
      <figcaption>Daily rolling average (over 4 weeks)</figcaption>
  </figure>
</center>

<center>
  <figure>
      <img src="{{site.urlimg}}francois_gerthoffert/jira-agile-velocity/weekly-velocity.png"/>
      <figcaption>Weekly rolling averages (over 4 weeks)</figcaption>
  </figure>
</center>

 
# Estimate completion
 
Once we understand past velocity, we can estimate the amount of time necessary to complete remaining work. When looking at those numbers it is critical to understand how to interpret them and compare them with multiple metrics. Those numbers should be, when possible, compared to a similar effort within a similar timeframe.
 
If the remaining amount of work is limited (let’s say a handful of days), looking at "this week" and "last week"’s velocity is likely going to be your best bet in estimating possible completion date. But if daily velocity calculated over a short timeframe strongly diverges from daily velocity calculated over 4 weeks rolling average, some uncertainty should be added around completion date.
 
If the remaining amount of work account for 1-2 weeks or work, looking at last week’s velocity and a 4 week rolling average is probably your best bet. The longer your period is, the more uncertainty there will be (people will take vacations, are out sick, need to attend meetings, etc...). Comparing over a similar duration, as close as possible from current date, is likely to be most accurate option. 
 
Although we might have been consistent in our estimates and might have been collecting data over a long period of time, the team do changes, project context do changes, which includes variation in the team’s velocity. So comparing velocity in June 2016 versus June 2017 would likely not be relevant.
 
An imperfect solution
 
The estimates details above are far from being a 100% accurate mean of estimating completion dates, but they do provide the team with trends and number to work with when answering the typical "when will this be ready ?" or "when can we release next ?".
 
# Let’s play
 
The code (although imperfect) supporting this article is on github and [yours to play with](https://github.com/Fgerthoffert/jira-agile-velocity).

<center>
  <figure style="width: 70%;">
      <img src="{{site.urlimg}}francois_gerthoffert/jira-agile-velocity/jav-slack.png"/>
      <figcaption>Our Velocity Bot on Slack</figcaption>
  </figure>
</center>

