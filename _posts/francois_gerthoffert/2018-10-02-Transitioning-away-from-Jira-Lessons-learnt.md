---
layout: post
title:  "Transitioning away from Jira ? Lessons learnt"
breadcrumb: true
author: francois_gerthoffert
date: 2018-10-02
categories: francois_gerthoffert
tags:
    - Software
    - Agile
    - Jira
    - GitHub
teaser:
    info: Over the past year, we’ve been moving most of our projects away from Jira, in favor of GitHub issues. This blog post will go over the reasons why and lessons we learnt along the way.
    image: francois_gerthoffert/overture-logo.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

Over the past year, we’ve been moving most of our projects away from Jira, in favor of GitHub issues. This blog post will go over the reasons why and lessons we learnt along the way.

It all started with an opportunity. As we were launching an entirely new project [Kids-First](https://kidsfirstdrc.org/) our teams started discussions around the project management tool to be used during implementation. Some of our objective, in looking at new approaches, was to see how to reinforce integration between stories and actual software code, make developers’ life easier, while still providing management with adequate planning and reporting features.

# What’s wrong with Jira ?

Let’s get this straight from the beginning, there is nothing inherently wrong with Jira, it is a great tool (I said it !) with a wide feature-set and an extensive ecosystem of third party tools.

So why be in favor of transitioning away from Jira ?

# Jira, protect me from myself

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/jira-github/jira-workflow.png" />
    <figcaption>Workflows can get complicated !</figcaption>
</figure>

In my opinion, one of the the strongest challenges with Jira is actually what can also be its strength in other situations: Jira offers a lot of possibilities for customization. Trust me, it’s very easy to fall in the trap of wanting to configure all the nitty gritty details of one team’s operation.
Want to prevent an issue from moving to the next stage if testing hasn’t been documented ? Sure, no problem. Require 2 reviewers before a ticket can be completed ? Of course. And the list goes on.

The challenge with a complex workflow is that it easily gets in the way of the development team, in particular around exceptions during burst period. For example on one of our project we required documentation instructions to be written for stories. It makes sense, right ? Now if we look back at the 6,000 issues we have on this particular project, only 175 were populated with actual documentation instructions, most of which were just links to pull requests. Not the most successful workflow rule !

GitHub on the other end, simply doesn’t allow for advanced workflow customizations. Issues can move freely between statuses, with no possibility to add validations steps at the issue level. This gives much more freedom to the team but also helps entrust all team members. It may take a few reminders at the beginning (please don’t forget to estimate unplanned urgent issues), but it’s definitely worthwhile.

# Jira for Open-Source projects

When developing an open source project, it might be nice to give full visibility to the public on features being worked on, their status, and allow external people to comment on existing issues or create their own tickets. Not only opening the code, but also the project management behind it.

Although Jira can be configured for Public Access, over the past years, GitHub progressively became the de-facto platform (with GitLab and BitBucket on a smaller scale) for open source projects. Being the platform of choice for most developers, selecting GitHub for a project is one less hurdle to receiving contributions from the general public.

Plus, with GitHub, you get access to GitHub extensive infrastructure, extensive API (more on that in another blog post) and third party tools.

# Are GitHub issues the ideal solution ?

Although GitHub provides features for [project management](https://github.com/features/project-management/) out of the box, we quickly realized those would not be sufficient for our needs.

## Cross-organizations project boards

Although you can use a GitHub project board across multiple repositories of the same organization, GitHub projects does not allow for cross-organization boards, which is a definite no-go in our context.

We have one GitHub organization for {overture} and one organization per project. Project-specific implementation go into the project organization (for example: ICGC, Kids-First, HCMI), reusable components go into the Overture organization.
Each scrum team uses its own Agile scrum board, and the lack of cross-organizational project boards would definitely be a blocker (more on that later).

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/jira-github/github-overture.png" />
    <figcaption>Some of Overture’s issues on GitHub projects</figcaption>
</figure>

## Story Points

GitHub doesn’t have a dedicated field to store Story Points, neither provide metrics around those (velocity & burndown in particular). But a workaround for points recording is still possible using Labels but nothing is available for charting.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/jira-github/github-points.png" />
    <figcaption>Can you spot points ?</figcaption>
</figure>

## No Issues Hierarchy

GitHub doesn’t make it obvious how to have the traditional Epic -> Story -> SubTask hierarchy.

The recommended approach when working with GitHub issues is as follow:

* Epic: Regular issue attached to an “Epic” label, Stories linked in the issue description.
* Story: Regular issue
* SubTask: List in the description of the parent Story, with checkboxes ( - [ ] ).

## Labels Management

Labels are managed at the repository level, and although Labels can easily be created at any point in time in the interface, there is no provided feature to ensure their consistency across repositories and organizations.
So it’s easy to end up with different colors for the same label, labels with a similar but different name, …

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/jira-github/labels-inconsistencies.png" />
    <figcaption>Some labels inconsistencies across our repositories</figcaption>
</figure>

## Sprints
Milestones are the recommended approach to manage sprints with GitHub, with one small caveat though, there is no start-date for milestones (only end date).
It’s not a huge deal, but a slight annoyance as you cannot precisely determine the beginning of a sprint to get its burndown.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/jira-github/github-milestones.png" />
    <figcaption>Milestone creation in GitHub</figcaption>
</figure>

## I miss JQL though

Jira has its own internal query language called [JQL] (https://confluence.atlassian.com/jirasoftwarecloud/advanced-searching-764478330.html), sadly there is nothing as powerful available in GitHub ecosystem.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/jira-github/issues-search.png" />
    <figcaption>GitHub issues search</figcaption>
</figure>

# GitHub very extensive API
But GitHub played it very smart by providing 2 very extensive APIs ([v3 using REST](https://developer.github.com/v3/) , [v4 using GraphQL](https://developer.github.com/v4/)), their [associated libraries](https://developer.github.com/v3/libraries/) and a live instance of [GraphiQL](https://developer.github.com/v4/explorer/) making it extremely simple to extend GitHub functionality to cover particular use cases.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/jira-github/graphql-explorer.png" />
    <figcaption>How many issues in Arranger ?</figcaption>
</figure>

GitHub provides a strong foundation, and open the door to third party vendors to extend their core functionalities, encouraging an ecosystem of applications to grow alongside (we’ll see how this plays with Microsoft joining the game).

# Third party apps to the rescue
This is a good point to start introducing third party solutions (such as Zenhub, Waffle.io), which, by wrapping metadata around GitHub issues, extend functionalities towards Agile and project management.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/jira-github/kidsfirst-zenhub.png" />
    <figcaption>Running sprint in Kids-First' Zenhub board</figcaption>
</figure>

Over the past few months we’ve been using the two platforms mentioned above. Zenhub is extensive but sometime a bit heavy on the interface, Waffle.io has a lighter interface, but is not as extensive feature-wise. I’m not going to present those solution in details, just cover some challenges using them, especially thinking longer term.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/jira-github/waffle-overture.png" />
    <figcaption>Running sprint in Overture's Waffle board</figcaption>
</figure>

So while using those, things started to get a bit challenging as I wanted to dive a bit more into velocity metrics and forecasting (see my related post on Jira velocity).

# Accessing Agile metadata

Both [ZenHub](https://github.com/ZenHubIO/API) and [Waffle.io](https://docs.waffle.io/v1.0/) have a documented API, but with limitations (some of them being pretty annoying).

Let’s assume one wants to build an app, that will go through all the issues to collect their individual Story Points in order to build metrics, things get slightly challenging:

* ZenHub has an API rate limit of 100 requests per minute to the API with no bulk means of collecting points, it has to be done for each individual issue. Kids-First + Overture account for 2,000+ issues over less than a year. An initial load will be pretty lengthy.
* Waffle.io is very unclear about their API usage, and the API has been labelled “private alpha test”. For the first few months I was able to bulk GET the data since our projects were open and waffle didn’t have restrictions on those (this was closed down in September). But the major challenge is individual archived issues cannot be accessed after 30 days (https://help.waffle.io/faq/done-column-closing-issues/can-i-viewed-my-archived-issues), so all individual historical Story Points are basically gone, sigh …

Furthermore, someone from the general public navigating our repositories on GitHub would not be able to see any of this, sometime valuable, metadata.

So is this dependency to third party platforms something we have to live with, or is there a better option ?

# Solution ?

Understandably, GitHub cannot cover for all possible business needs with their API, and it’s of course preferable to have a strong and stable API instead something unstable with a ton of options.

But does this call for a schema-less user-defined JSON info field directly attached to an issue node in GitHub database ? That would be a great improvement allowing third party apps to store most of their metadata there instead of on third party platforms.

# Conclusion
At the moment there isn’t an ideal tool. We are ok (I’m not going to say happy, because of the issues above) with a mix between third party apps and native GitHub, but I’m looking at ways to bring more into core GitHub issues (through labels) to limit the above-mentioned long-run dependency.

From a project manager point of view, I like the approach and simplicity of it (less is more). In a way, it’s simplicity brings it much closer to a traditional “post-it” Agile board. Most of the key metrics are there and it’s ease of access for our users makes it a great solution for the time being.

We constantly adjust our Agile methodology & tools to best fit our needs, so with no doubts thing will change in the future, but for the time being this is an efficient and workable setup.

# Conclusion bis, so GitHub or Jira for my project ?

Both solutions are perfectly fine and mostly depends of your use case. If you need strict control in your workflow, Jira is probably your best bet. If you want flexibility while giving your team a sense of ownership towards their workflow, then GitHub issues is a great option.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/jira-github/jira-meme.png" />
    <figcaption>Jira ?</figcaption>
</figure>

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/jira-github/github-meme.png" />
    <figcaption>or GitHub ?</figcaption>
</figure>

I don’t have an answer for you, but hopefully this blog post would have helped identifying what would work best for you.
