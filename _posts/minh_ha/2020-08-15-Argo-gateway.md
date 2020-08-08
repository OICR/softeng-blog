---
layout: post
title: Argo Gateway, the beginning
breadcrumb: true
author: minh_ha
date: 2020-08-15
categories: minh_ha
tags:
  - Micro-service
  - Graphql
  - Architecture
teaser:
  info: A look back at how it was born
  image: minh_ha/ai_robot.jpg
header:
  version: small
  title: Software Engineering Blog
  image: header-logo-crop.png
  icon: icon-blog
---

> "Initial commit" - Dušan Andrić, April 1 2019

This was the first commit in a repo titled `argo-platform`. "Initial commit" are words with strong power towards us developers. At the time, I was working on The Kids First Data Portal (KF), it was my first project with the team, the project that introduced me to distributed microservice systems. Like any "first projects", many lessons were learned, things that I picked up that stuck with me til today, as well as mistakes that I learned not to repeat. KF was coming to an end, and I could not resist the gravity of "Initial commit". Here was a blank canvas, a chance to put all the lessons to test. So on the same day, I pushed a batch of commits that includes "sets up server and some test schema stitching". This was the foundation of what is today the [platform-api](https://github.com/icgc-argo/platform-api) repo, the front-door to everything the ICGC Argo Platform's backend has to offer.

# TLDR:

- If you have a messy UI, maybe your API can use a change.
- The right use of GraphQL significantly reduced our UI complexity.

I mostly worked on the front-end of KF. Being the first time I built a production React web project, I did not fully anticipate the complexities of a web app with so many back-end interactions. The apps I was used to building in my previous role were complex educational games, with intricate multi-touch gestures and scorring algorithms, but they only ever had to make a handful of API calls. I thought I knew React, but the code I found myself writing with felt different from what I imagined a real React project would be. Gone were the nicely defined class components, instead we had layers and layers of containers to provide data, some of which were coming from the back-end, others are transformed / combination of them with local states.

There were many things that contributed to the problem. We did not have a defined state management strategy, hence it was often difficult to decide whether a piece of data should be persisted in the global store, or local within a component (and if so, which component...). And since it was hard to decide at the time of writing the feature, it was also difficult after the fact, to find out where a piece of data came from. React's limitation at the time also called for complex patterns like [HOCs](https://reactjs.org/docs/higher-order-components.html) and [Render Props](https://reactjs.org/docs/render-props.html), which added to the complexity. With multiple developers rotating in and out of different features, we found ourselves with duplicated implmentations, causing strange bugs. Juggling these business logics took away much of our ability to focus on solving problems that were unique to the UI, resulting in inconsistent implementations and strange bugs. It was not clear to us how we got there, until we asked the question: Why was there so much business logic in the UI to begin with?

Once this question was asked, we took a step back and looked at the whole system. This was KF's architecture diagram at the time:

...

Simplifying on the above, we arrived at this high-level picture:

...

Have you ever called a business's customer service department, who gave you some information and a different number to call the billing department, only to be given another number to call the product department for the rest of your request?... Hopefully not, because most business would be more coordinated than that. But different government agencies maybe? Regardless, this isn't a pleasant experience. And that's what I felt like developing against our microservices.

The problem was multiplied by the number of developers working on different features, and the number of "independent" features there were...

...

We followed a strong process of code review for every PR. But we were also operating over a period of high turnover in the team. To suggest meaningful code changes, it is not enough to be an expert of the technology at hand, but also an expert at the specific codebase being reviewed. In face, one might argue the later is more important. So how could a reviewer know if a certain piece of information has already been made available to the UI somewhere else, if he was not involved in the implementation of that same feature somewhere else?

Many features required complex wrangling of data from multiple backend services. And because business logic tends to be used in multiple places, there were multiple implemntations of the same flow, resulting in duplicated work. Overall, this took away from our frontend team's ability to focus on solving problems that are unique to the frontend, such as consistent design, responsiveness and accessibility.

So we searched for ways to remove the burden of managing cross-cutting concern from the UI, and arrived here:

...

This would not have been immediately clear for us as a path forward, without some past experience with GraphQL. GraphQL was a technology the team had been experimenting with, but it never came to be seen as a central piece of our tech stack. Some of the services built in KF were using GraphQL, but we made a big mistake of cheating GraphQL as if it was REST. They were individual services with GraphQL interfaces, but it was left to the consumer (i.e the UI) to coordinate between them. Multiple GraphQL endpoint also necessarily resulted in multiple GraphQL client instances, and/or none at all. The n+1 problem that GraphQL is known for solving still remained in our experiments, and other benefits we saw did not justify the learning required. But seeing where things went wrong, we decided to give the technology another try with Argo.

So before any design was made, before we even knew what our product needed to do, we knew we needed to make GraphQL a first-class citizen.

# What does it look like today?

Not very different from the last diagram above actually. Our microservices continue to sit behind our Gateway API. The underlying services are free to have whatever interface they may choose, most are REST services, with one gRPC service currently. We have chosen Apollo as our Graphql backend framework, for its large community support as well as Javascript being a de facto language that enables our front-end developers to contribute (although we have since migrated to Typescript for new developement).

On the frontend, we have once again opted for Apollo. While Apollo was not the only option technically (since any GraphQL client, or none would have done), we once again chose it for its large community support. Because of our generally flat team structure, we have generally preferred to work with local state over global stores in React to avoid having to manage side effects.

As such, it was without skepticism at first to rely on Apollo's cache store. However, we were pleasant to find that the cache store did not result in any side effect problem once we really adopted it as a cache store rather than a smart application data store (afterall, it's called **cache store** for a reason). By designing our API to automatically return the new data that was written after a write event (a **"mutation"** in GraphQL language), our cache update was automatically handled by the Apollo Client. Because the cache store was global, any change that resulted from a mutation done by one component would automatically reflect in the rest of the UI, without a need for side effect management framework.
