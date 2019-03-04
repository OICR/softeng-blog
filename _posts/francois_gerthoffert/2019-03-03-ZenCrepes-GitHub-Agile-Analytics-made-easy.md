---
layout: post
title:  "Introducing ZenCrepes - Agile analytics across GitHub orgs & repos"
breadcrumb: true
author: francois_gerthoffert
date: 2019-03-03
categories: francois_gerthoffert
tags:
    - Agile
    - GitHub
    - Sprints
teaser:
    info: Have you ever tried managing a scrum team across GitHub organizations and repositories? ZenCrepes has been created to facilitate project management for teams operating solely over GitHub issues, and across multiple organizations & repositories.
    image: francois_gerthoffert/zencrepes/zencrepes-issues.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

Approximately a year ago, our team transitioned away from Jira to GitHub for our ticketing system, bringing our source code and project management in the same place. A few months back, I wrote a [blog post detailing this transition](https://softeng.oicr.on.ca/francois_gerthoffert/2018/10/02/Transitioning-away-from-Jira-Lessons-learnt/) and another one giving some [insights about some Agile metrics that could be used for team](https://softeng.oicr.on.ca/francois_gerthoffert/2018/10/20/Agile-another-take-on-estimates/) management, in particular in the context of research. 

Both articles contained screenshots from an “unknown tool” and now is the right time to start introducing ZenCrepes (bonus points for those who guess where the name is coming from), a personal project I’ve been spending evenings on for the past few months to provide Agile analytics and management across GitHub organizations & repositories.

# Why ZenCrepes?

In an ideal (naive?) world, one product would have one source code repository and one single team, dedicated to this single product, and GitHub would be an awesome platform for both source control and agile management. 

But more and more agile teams span multiple repositories or even multiple organizations. In our case, our scrum teams are frequently using two organizations, one for [Overture.bio](https://github.com/overture-stack/) containing our reusable components used across multiple projects and one for each of our projects such as [ICGC-DCC](https://github.com/icgc-dcc/), [Kids-First](https://github.com/kids-first), [HCMI](https://github.com/nci-hcmi-catalog/)... 

As soon as you begin operating on more than one repository, there is a lack of tools to facilitate management at an organization level or even across organizations. GitHub Projects at an organization level are limited to 5 repositories per project, labels and milestones are unique per repositories... 

ZenCrepes was created to address this limitation, by providing the missing cross-org & cross-repos view.

# Key Features

It focuses on three primary objectives:
* __Report and search__: Quickly find relevant issues based on selected criteria (faceted search). For example, “List open defects assigned to John or Max in rock or paper repos” or “Display the team's overall velocity on paper and scissor repos”.
* __Scrum operation__: Provide one scrum view to identify the amount of work left in a sprint, estimate completion based on past velocity, review repartition of open issues (by repo, by labels, by assignees).
* __Consistency__: Ensure labels and milestones are consistent across multiple organizations and repositories, clean-up when necessary.


# Report and search

For those familiar with our portals, no need to search long to understand where the inspiration is coming from for the “Issues” view (no pie charts though!).

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/report-and-search.png" />
    <figcaption>Summary view in the issues tab</figcaption>
</figure>

Using faceted search users can build queries to filter down on elements being analyzed and displayed, providing views into the operation of multiple teams. 

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/report-and-search-list-view.png" />
    <figcaption>List view in the Issues tab</figcaption>
</figure>

The list view contains the list of all issues resulting from the query. Clicking on the issue opens it in GitHub for further investigations/modifications.

Two more tabs (Velocity & Burndown) are also available to view those metrics over the entire duration of the project.


## Find the odd status

Do we have any issues, part of closed milestones, which are still open? This shouldn’t be possible, right? Let’s check it out!

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/report-and-search-odd.png" />
    <figcaption>Something to investigate</figcaption>
</figure>

So out of the ~3500 issues, 5 are in an incorrect state and worth further investigations. Those were last updated almost a year ago, likely forgotten by their team.


## Assembling a team


__Note of caution__: _The elements detailed below only works for teams, used at working together with a similar process, and should only be considered as one of the possible metrics (or as a starting point), but shouldn't be considered as an accurate metric._

Let’s imagine you are assembling a scrum team for a major deliverable, how could you get a sense of their potential velocity at the start of the initiative, until the velocity stabilizes?

Well, you can simply assemble their past velocity.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/report-and-search-velocity.png" />
    <figcaption>Rob, Dusan and Minh’s joint weekly velocity over the past year
</figcaption>
</figure>

This is probably a very controversial statement to make. Those metrics are truly useful when used as part of a large amount of data, the more you narrow down your criteria, the less trustworthy it will be as it becomes more prone to variability (See [Statistical Regularity](https://en.wikipedia.org/wiki/Statistical_regularity)). 

But it gives us a starting point, indications that can be used to get a sense of initial velocity for this newly assembled team. In a sense, not a precise metric, but better than no metric at all.

For example, if I was to take the chart above, I would be tempted to use 10 points/week as a starting point. So for a first 2 weeks sprint, it is probable that the team will deliver up to 20 points, fairly unlikely the would deliver more than 30, quite likely they would deliver more than 15. Makes sense? Again not an accurate prediction, but some insights usable during sprint planning (better than no metrics at all).

## And More...

More insights can also be obtained from this view, such as the issues opened for the longest, how long were issues opened for, repartition of opened issues per repository...

# Scrum Operation

The other major area of ZenCrepes is centered around the operation of a scrum team, the objective is to serve as a support, available when necessary, for the various scrum events (planning, retro, demo, daily stand-up). A bit more than just showing an Agile Board.

## How much work is left?

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/scrum-forward.png" />
    <figcaption>Looking Forward</figcaption>
</figure>

This view provides quick insight on how much work has been completed, what is the repartition of remaining work (whether assigned or not to individuals is also an indication) and tries to forecast how many working days would be necessary to complete the sprint’s scope.

## How have we been doing?

Burndown and velocity charts provide a view on how the team has been doing on the short term (the sprint’s burndown) and what was the team’s velocity on the long run (velocity over the past 16 weeks). 

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/scrum-notes.png" />
    <figcaption>Scrum notes, burndown and weekly velocity</figcaption>
</figure>

This view also contains a small area to write down some notes resulting from the various meetings (planning, demo, retro). It is useful to keep an eye on the most important elements discussed as a team during your cycle.

## What is our current state?

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/scrum-table.png" />
    <figcaption>Table View</figcaption>
</figure>

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/scrum-board.png" />
    <figcaption>Board View</figcaption>
</figure>

Probably the most traditional feature of all, a table and a board view of the current issues in the sprint.

## How’s the repartition within the sprint?

Finally, the bottom of the view contains issues and points repartition by assignee, milestone, and label.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/scrum-repartition.png" />
    <figcaption>Repartition by assignee, milestone, and label</figcaption>
</figure>

All of those being available in the same view, it’s easy to scroll up and down between the various elements.

# Manage Labels & Milestones

As you might have figured out, it is challenging to manage labels and milestones across multiple organizations and repositories in GitHub.

Those two views have been created to assist in the bulk creation, modification or deletion of labels and milestones.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/labels-view.png" />
    <figcaption>Labels view</figcaption>
</figure>

In the above screenshot, the “bug”, “invalid”, “help wanted” label have different labels colors. “Help wanted” in particular has only 1 repository with a different color.

<figure style="width: 320px">
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/labels-colors.png"/>
    <figcaption>Colors repartitions for “help wanted”</figcaption>
</figure>

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/labels-colors-pick.png" />
    <figcaption>Picking a color for the label</figcaption>
</figure>

Users can then update the color and bulk push the change to all repositories at once. Users can also push this label to additional repositories by clicking on the small folder icon on the left side.

# Safeguards

The challenge for ZenCrepes when operating with GitHub data is that there are no available backups. ZenCrepes is, therefore, doing its best to inform users about the bulk changes it’s about to perform.

Before any bulk update, ZenCrepes fetches the latest version of the node and will “refuse” to push the bulk change if any of the nodes was modified since the last time the node was loaded locally. This prevents overwriting changes by mistake.

Finally, ZenCrepes will also verify the user’s permission against the repository. Of course, I cannot update the label’s color into one of Microsoft public repositories. 

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/review-changes.png" />
    <figcaption>Review changes before pushing to GitHub</figcaption>
</figure>

# Exploring

When public GitHub repositories are configured to authorize fetching of data (most are), ZenCrepes also allows its users to add external repositories and organizations. Doing so has, of course, some limitations, such as story points or agile board which require a specific label format. 

## Microsoft Issues

Microsoft made the headlines sometime back when it became one of the most active Open Source projects on GitHub or when it actually acquired GitHub. But have you been curious to dive a bit into how Microsoft operates its teams?

### About vscode

First, don’t try to load vscode, Microsoft has a “LOT” of issues in their repository, and by a lot I mean ~64,000 of them as of today, this would definitely stretch the capabilities of ZenCrepes in-browser minimongo database, and is actually taking a toll on GitHub own API’s, seeing the unknown errors received when loading the data (even from the first few calls). ZenCrepes doesn’t load more than 100 nodes at a time, so for GitHub’s public API to choke on this, is an interesting thing to see (not related to stress created by ZenCrepes, but rather by the data itself).

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/vscode-error.png" />
    <figcaption>Error while fetching vscode data</figcaption>
</figure>

Instead, I would suggest instead to try with a slightly less popular repository, for example, “azuredatastudio” and its ~2700 issues.

But for now, let's continue with ~42k issues from Microsoft vscode's data, which I manage to load on a Sunday.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/vscode-metrics.png" />
    <figcaption>Metrics for vscode</figcaption>
</figure>

Yes, you are reading this properly, Microsoft's current velocity is at an impressive 327 closed tickets per week!

Now, if we want to take a closer look at what’s being completed, let’s focus on last week and its 330 tickets.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/vscode-lastweek.png" />
    <figcaption>Vscode last week's metrics </figcaption>
</figure>

So what deductions can we make from last week’s metrics?
* There is a group of 5 very active contributors assigned to more than 20 closed issues
* 64 tickets were closed but not assigned, but there is also 80 duplicates, are all of the unassigned duplicates?
* Only 92 tickets were actually assigned to a milestone, out of which 60 were bugs
* Out of the 330 tickets, 161 were closed in less than a day

Sadly, ZenCrepes doesn’t support (yet) filtering by empty labels or empty assignees, it would have been interested to see where there are unassigned closed tickets in a milestone.

We can also take a look at past releases, for example, to look at a release burndown.

You can get an idea of the number of issues contained in the release, when the first and last issues were closed, what is the release burndown.... 

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/vscode-feb2019.png" />
    <figcaption>February 2019's release</figcaption>
</figure>

## JetBrains Labels

Have you been wondering how JetBrains labels are configured across all their public repositories?

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/jetbrains-labels.png" />
    <figcaption>Different colors for JetBrains labels</figcaption>
</figure>

Interesting isn’t it? Look at the slight variations of red or green for “bug” and “help wanted” or the strong difference in colors for the “feature” label. Interestingly, for some reason, GitHub update from time to time the colors of the default labels, so even if you were to always stick with the default, you’d notice slight inconsistency over time.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/jetbrains-labels-features.png" />
    <figcaption>Colors for the “feature” label</figcaption>
</figure>

Actually, with the exception of 2 repositories, every single one has a different color. All of this is not of much value to an external user, but I guess if JetBrains was to want consistent colors across their repositories, ZenCrepes would allow this change to be propagated in a few minutes.

# Behind the scene

## Tech-Stack

This app is built using [Meteor](https://www.meteor.com/) and [React](https://reactjs.org/) enhanced with [Rematch](https://rematch.gitbooks.io/rematch/#getting-started) (state management through Redux), [Material-ui](https://material-ui.com/), [Highcharts](https://www.highcharts.com/), [Nivo](https://nivo.rocks/)... 

ZenCrepes pulls data about issues, labels, and milestones from GitHub and stores all of the content in [Minimongo](https://github.com/mWater/minimongo), a client-side in-memory mongodb implementation. 

Communication with GitHub is a mix of their GraphQL v4 API and their REST v3 API. GraphQL is a very convenient way of querying for data, but has limited support for mutations. On the contrary, the v3 API is very complete. On slight challenge for ZenCrepes is that the model between the two is not exactly the same. To simplify things, ZenCrepes, after mutation data through the REST API will fetch data through the GraphQL API instead of parsing the response of the REST call.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/zencrepes/graphql-explorer.png" />
    <figcaption>I learned about GraphQL using GitHub’s GraphQL explorer (GraphiQL</figcaption>
</figure>

Issues and milestones are fetched from the latest to oldest, this allows ZenCrepes to only fetch recent changes. The first load takes the longest, subsequent calls only need to fetch the updated nodes. 

From there, everything all metrics are computed in-browser.

## Philosophy

The entire point, from the very beginning of ZenCrepes development, was not to create another tool with a mix between secret sauce and GitHub data. I wanted to base the entire application over GitHub data model with no external data. The point was not to create another Agile tool, but to provide a solution to some of GitHub limitations when dealing with Agile project management.
 
Making this application client-side only was a good way to ensure no dependencies were created but it might not be a sustainable model, due to the UX challenges it creates around refreshing data.

Aside from refreshing data, there are also a couple of elements I’m not super happy with, for example, points using points requires specifically formatted labels, same for the agile board (although ZenCrepes will be moving towards support for GitHub projects). 

# What’s next?

I am honestly not sure yet how the app will evolve from there. The initial reason for building ZenCrepes was to give me a better view over GitHub issues and I feel it reached that point and is now a usable tool.

But during the process, lots of shortcuts were taken (for example, ZenCrepes doesn’t have tests), many parts of the code can and should be optimized and there has been literally no effort spent on styling.

So what could be next? ZenCrepes is Open-Source and it would be great to receive external contributions, to progressively move from a one-person app, to a platform built by a community. 

# Conclusion

ZenCrepes is available at [https://zencrepes.io](https://zencrepes.io), its source is available on GitHub at [https://github.com/zencrepes/zencrepes](https://github.com/zencrepes/zencrepes).

That’s it for today, this was also my last article on this blog, created in October 2016. After 4 and a half years at OICR, working alongside [great people](https://softeng.oicr.on.ca/team/), the time has come for me to begin a new adventure.

Goodbye everyone.

