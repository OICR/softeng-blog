---
layout: post
title:  "Agile in research - Another take on metrics and estimates"
breadcrumb: true
author: francois_gerthoffert
date: 2018-10-20
categories: francois_gerthoffert
tags:
    - Software
    - Agile
    - Story Points
    - Rolling Average
teaser:
    info: Can data help tell the story of a team? And how, by understanding its story, can a team become better at foreseeing its future?
    image: francois_gerthoffert/agile-estimates/weekly-velocity.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

Can Data help tell the story of a team? And how, by understanding its story, can a team become better at foreseeing its future?

# Some context

Before diving into the meat of this article, it’s worth providing a bit of context around the way our teams operate. At OICR, our Genome Informatics team is building software components, infrastructure and data stores used by researchers on a day-to-day basis to carry-out their research. And although we don’t do pure research, we operate in a research context and are bound to research-oriented sources of funding (grants or contracts).

Compared to the software industry, we operate with fairly limited resources relative to the complexity of the solutions we are building. In a way some of the components built by our team are not that far from those of Amazon, Netflix and Facebook-alike, at a much smaller scale of course!

For us, operating with limited resources means a need for a very tight cohesion in our team and a high level of trust & autonomy given to all our team members. But autonomy is not freewheeling. Agility is not about doing whatever whenever, it is about defining a process that empowers the team and continuously adjusting this process to account for changes in the team and its projects, to optimize its operation.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/agile-estimates/dilbert.png" />
    <figcaption>Credits dilbert.com</figcaption>
</figure>

Which brings me to the core of the article. As part of being agile we collect metrics: how can those metrics serve the team?

# Agility in agile vs traditional metrics

One of the most traditional metric in agile project management is velocity, it helps visualizing a team's delivery pace and facilitates future planning. But traditional Agile tools have, in my opinion, a strong limitation in the way they can account for changes in a team’s operation.

Have your sprints always all had exactly the same number of business days with the exact same number of team members?

Of course not, but usually those metrics are often either bound to one single sprint or one single week, which does not account for any variation.

# Short term estimates using rolling average

In my opinion, the best option is to drop the concept of sprint in velocity calculations and focus on a rolling average (I like having a window of 4 weeks), as it essentially lessens the impact of edge cases and events (vacations, sick days, variation of sprint duration).

Let’s discuss around an hypothetical example, assuming we are currently in week 10, doing planning for the next sprint.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/agile-estimates/rolling-example.png" />
</figure>

We know, by looking at both velocity metrics (individual weeks and rolling average), that:

* There has been a burst in week 6, which corresponded to your release prep. During that week, the team completed a lot of small tickets (which slightly unbalanced the numbers).
* In week 8, Joe was off-sick, the team was also working on slightly more complex tasks, completing less points than usual.
* At the end of week 9, the team was progressively getting back to its usual pace.

So you could point your finger in the air to see in which direction the wind is blowing (that’s called experience, right?), look only at individual weeks average, look at only at rolling average, or take all three to get an estimate of how many points can be completed in your next sprint.

In the above example, this team should be able to complete up to 60 points (maybe a handful more) for its next 2 weeks sprint.

# A team’s story

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/agile-estimates/kf-velocity.png" />
    <figcaption>A real-world example (Kids-First)</figcaption>
</figure>

What do you think will happen to the team’s velocity over this coming end-of-year vacations period? Or for the next major release? Looking at the team history definitely helps in assessing what can be completed in the future.

# How likely are we going to deliver a set of features by a set release date?


This technique is useful, not only in sprint planning, but also in estimating the amount of time necessary to complete a set of activities in your backlog.

Let’s continue on the above exercise, your team sized a set of features requested yesterday by a key stakeholder, for a demo planned in 4 weeks. This backlog of activities account for about 180 points (plus unknowns), your current rolling average is at 30 points per week.

How likely are you going to deliver all of this on-time? Can the above can help you determine your course of actions?

# Likeliness of sprint’s scope completion

It also becomes an interesting tool during a sprint planning, as you can automatically calculate your likeliness of completion based on what is progressively being added in a given sprint.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/agile-estimates/kf-metrics.png" />
    <figcaption>Metrics during a sprint (Kids-First)</figcaption>
</figure>

The diagram on the left represent velocity (top: weekly, bottom: rolling average), the diagram on the left an estimate of the number of days to completion based on different rolling average windows (entire period, 4 weeks, 8 weeks, 12 weeks).

More than only estimating how many days is needed to complete a sprint, it also gives us an indication that this team is, currently, fairly stable in its delivery pace:

* Looking at the past 4 weeks' velocity, delivery should take 6 days
* Looking at the past 8 weeks' velocity, delivery should take 5 days
* Looking at the past 12 weeks' velocity, delivery should take 7 days

We can also look at the velocity for another team’s sprint, who resumed work a project recently.

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/agile-estimates/icgc-metrics.png" />
    <figcaption>Metrics during a sprint (ICGC)</figcaption>
</figure>

Is being in a 2 weeks sprint, but having an estimate to completion of 16 working days an issue? Well actually it might not be and here is why:

* Looking at the past 4 weeks' velocity, delivery should take 16 days
* Looking at the past 8 weeks' velocity, delivery should take 26 days
* Looking at the past 12 weeks' velocity, delivery should take 35 days

The team is ramping up! Its delivery pace is progressively accelerating, and there are strong chances the velocity will keep increasing, until reaching a plateau corresponding to the team’s optimal velocity.

So what would have been a challenging situation for the first example (Kids-First), is not in this particular context.

# Let’s keep playing with numbers

Now an interesting experiment. If we are able to calculate the team’s velocity, the system can also get a sense of each individual team member’s velocity.

What if we ask a developer to temporarily join the team for this sprint?

<figure>
    <img src="{{site.urlimg}}francois_gerthoffert/agile-estimates/time-to-completion.png" />
    <figcaption>Variation of time to completion</figcaption>
</figure>

It brings the estimated time to completion down to 9 days. Does it mean this new team is likely to complete everything in 9 days? Absolutely not! The system doesn’t account for context switching, new team organization, possibly ramping up on a new domain (and I’m not talking about the impact on the other team).

But it is far from being useless. This tells us, that even by adding this developer to the team, it is unlikely that the team will be done in less than 9 days.

_Note: To be more accurate, the above assumption doesn’t account for the team team’s increase in delivery pace mentioned earlier. So since the team is accelerating (with the plateau unknown at this time) and we are bringing an additional developer, there would be a chance to complete in 9 days or less._

# Not an accurate method if taken alone

Before concluding the article, I strongly, strongly, strongly insist: __the above is not an accurate mean of estimating effort or the health of a team__. It is __one of the elements__ that can help the decision making process, as long as the right question is being asked.

Which angle will you be taking, should you be reading those numbers as “likely to complete in X days” or “unlikely to complete in less than X days”? That’s up to you to decide based on your knowledge of the team.

# Conclusion

I sometime find the various reporting metrics provided by traditional agile tools too inflexible (not agile enough?) in the insight they give into a team’s operation. Understandably a tool cannot cover for every possible use cases, they need to remain adaptable enough to multiple use cases, but still, I’m convinced there is still a good margin for improvement.

_PS: Yes, Jira does calculate rolling averages in its [control chart](https://confluence.atlassian.com/jirasoftwareserver079/control-chart-950290877.html), but focused on individual tickets._
