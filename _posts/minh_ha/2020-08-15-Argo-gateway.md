---
layout: post
title: "How we built Argo's API"
breadcrumb: true
author: minh_ha
date: 2020-08-15
categories: minh_ha
tags:
  - Micro-service
  - Graphql
  - Architecture
teaser:
  info: How did we arrive where we are
  image: minh_ha/ai_robot.jpg
header:
  version: small
  title: Software Engineering Blog
  image: header-logo-crop.png
  icon: icon-blog
---

# How we built Argo's API

> "Initial commit" - Dušan Andrić, April 1 2019

This was the first commit in a repo titled `argo-platform`. "Initial commit" are words with strong magical power towards us developers. At the time, I was working on The Kids First Data Portal (KF), it was my first project with the team, the project that introduced me to distributed microservice systems. Like any "first projects", many lessons were learned, both things that I picked up that stuck with me til today, and mistakes that I learned not to repeat. KF was coming to an end, and I could not resist the gravity of "Initial commit". Here was a blank canvas, a chance to put all the lessons to test. So on the same day, I pushed a batch of commits that includes "sets up server and some test schema stitching". This is the story of how we got there.

## TLDR:

- If you have a messy UI, maybe re-examine your API.
- Graphql was awesome

I mostly worked on the front-end of KF. Being the first time I built a production React web project, I did not fully anticipate the complexities of a web app with so many back-end interactions. The apps I was used to building in my previous role were complex educational games, with intricate multi-touch gestures and scorring algorithms, but they only ever had to make a handful of API calls. I thought I knew React, but the code I found myself writing with KF felt different from what I imagined a React project would be. Gone were the nicely defined class components, instead we had layers and layers of containers to provide data, some of which were coming from the back-end, others are transformed / combination of them with local states.

There were many things that contributed to the problem. We did not have a defined state management strategy, hence it was often difficult to decide whether a piece of data should be persisted in the global store, or local within a component (and if so, which component...). And since it was hard to decide at the time of writing the feature, it was also difficult after the fact, to find out where a piece of data came from. React's limitation at the time also called for complex patterns like [HOCs](https://reactjs.org/docs/higher-order-components.html) and [Render Props](https://reactjs.org/docs/render-props.html), which added to the complexity. With multiple developers rotating in and out of different features, we found ourselves with duplicated implmentations, causing strange bugs. Juggling these business logics took away much of our ability to focus on solving problems that were unique to the UI, resulting in inconsistent implementations and strange bugs. It was not clear to us how we got there, until we asked the question: Why was there so much business logic in the UI to begin with?

Once this question was asked, we took a look at the whole system without isolating the UI. This was KF at the time:

...

Simplifying on the above, we arrived at this high-level picture:

...

This did not look too troubling, until we slice the UI into smaller slices, reflecting how it is in code, to arrive at this:

...

We have been thinking of the UI as one piece of software, where in fact it was a collection of many smaller pieces of software, all living under the same roof of the same code base. Like a micro service back-end, these UI components had their own life cycle, but they also had cross-cutting concerns. Our architecture simply did not include a first-class citizen that was responsible for handling these cross-cutting concerns.

So we drew the following:

...
