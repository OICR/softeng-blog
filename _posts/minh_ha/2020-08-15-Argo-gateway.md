---
layout: post
title: Gateway, origin
breadcrumb: true
author: minh_ha
date: 2020-08-15
categories: minh_ha
tags:
  - Micro-service
  - Graphql
  - Apollo
  - Architecture
  - Opinion
teaser:
  info: The history of ARGO Gateway
  image: minh_ha/argo_gateway/argo_gql.png
header:
  version: small
  title: Software Engineering Blog
  image: header-logo-crop.png
  icon: icon-blog
---

<image src="{{ site.urlimg }}/minh_ha/argo_gateway/argo_gql.png" />

# TLDR:

- State management in the UI was difficult in past projects.
- Multiple independent microservices pushed cross-cutting concerns down to UI to handle.
- We needed a back-end to take over cross-cutting business logic, selected GraphQL for its solution to n+1.
- Apollo client removed the need to manage back-end data in UI application code.
- Our setup has limitations, but the cost has been justifiable by the benefits.
- In future services we should investigate GraphQL service behind the gateway.
- Some final JS nerd thoughts at the end 😛

# So...

>     "Initial commit" - Dušan Andrić, April 1 2019

This was the first commit in a repo titled `argo-platform`. "Initial commit" are words with strong power for us developers. At the time, I was working on The Kids First Data Portal (KF), it was my first project with the team, the project that introduced me to distributed microservice systems. Like any "first projects", many lessons were learned, things that I picked up that stuck with me til today, as well as mistakes that I learned not to repeat. KF was coming to an end, and I could not resist the gravity of "Initial commit". Here was a blank canvas, a chance to put all the lessons to test. So that same day, I pushed a batch of commits that includes "sets up server and some test schema stitching". This was the foundation of what is today the [platform-api](https://github.com/icgc-ARGO/platform-api) repo, the front-door to everything the [ICGC ARGO Platform](https://platform.icgc-ARGO.org/)'s backend has to offer. This is what lead to it.

I mostly worked on the front-end of KF. Being the first time I built a production React web project, I did not fully anticipate the complexities of a web app with so many back-end interactions. The apps I was used to building in my previous role were complex educational games, with intricate multi-touch gestures and scoring algorithms, but they only ever had to make a handful of API calls. I thought I knew React, but the code I found my code felt different from my expectation for a React app.

There were many things that contributed to the problem. During this time, we have generally avoided global application state stores (Redux or otherwise) in favor of local states. This was both a deliberate design decision as well as a result of entropy. Local states reduce boiler plates and allow easier vertical integration of individual features. Individual developers on our team tends to deliver full features end-to-end, and with multiple features being developed in parallel, having the data defined locally where it is used means little coordination had to be done between developers. We did have a global state store, but without a defined guideline on what should and shouldn't be placed there, coupled with the boiler plates and coordination required to benefit from it, we found ourselves often faced with a decision that ends up favoring local states.

But the over-reliance on local state created vertical silos and made later horizontal integration more difficult (when multiple vertically-integrated features developed by different developers needed to interact somehow). What we gained from the simplicity of collocating data requirements for each component and its UI rendering, we had to pay back (sometimes with interests) in extra complexity to refactor the components to allow data and code sharing.

React's limitation at the time also called for complex patterns like [HOCs](https://reactjs.org/docs/higher-order-components.html) and [Render Props](https://reactjs.org/docs/render-props.html), which added to the complexity. With multiple developers rotating in and out of different features, we found ourselves with duplicated implmentations and buggy code. This took away much of our ability to focus on solving problems that were unique to the UI, resulting in inconsistent implementations and strange bugs. It was not clear to us how we got there, until we asked the question: Why was there so much business logic in the UI to begin with?

Once this question was asked, we took a step back and looked at the whole system. This was KF's architecture diagram at the time (Thank you [Rosi](/blog/category/rosi_bajari) for finding this from our archive!):

<image src="{{ site.urlimg }}/minh_ha/argo_gateway/KF-Portal-OICR.png" />

Focusing on the "Portal UI" section, we basically have something like so:

<image src="{{ site.urlimg }}/minh_ha/argo_gateway/old_system.png" />

While this looked simple at first glance, it is not quite so straightforward. You might have experienced calling a business, or a government agency's service desk, who gave you some information and a different number to call the billing department, only to be given another number to call the product department... This is complex enough on your own, now imagine doing this in a team, where you and your co-worker are both calling the same departments independently, over and over. So in practice, we had something like this:

<image src="{{ site.urlimg }}/minh_ha/argo_gateway/old_system_reality.png" />

Many features required complex wrangling of data from multiple backend services. And because business logic tends to be used in multiple places, there were multiple implementations of the same flow, resulting in duplicated work. Overtime, this took away from our frontend team's ability to focus on solving problems that are unique to the frontend, such as consistent design, responsiveness and accessibility.

So we searched for ways to remove the burden of managing back-end data from the UI, and arrived here:

<image src="{{ site.urlimg }}/minh_ha/argo_gateway/with_gateway.png" />

This would not have been immediately clear for us as a path forward, without some past experience with GraphQL. GraphQL was a technology the team had been experimenting with, but it never came to be seen as a central piece of our tech stack. Some of the services built in KF were using GraphQL, but we made a big mistake of treating GraphQL as if it was REST. They were individual services with GraphQL interfaces, but it was left to the consumer (i.e the UI) to coordinate between them. Multiple GraphQL endpoint also necessarily resulted in multiple GraphQL client instances, and/or none at all. The n+1 problem that GraphQL is known for solving still remained in our experiments, and other benefits we saw did not justify the learning required. But seeing where things went wrong, we decided to give the technology another try with ARGO.

So before any design was made, before we even knew what our product needed to do, we knew we needed to make GraphQL a first-class citizen.

# What does it look like today?

Not very different from the last diagram above actually. Although the gateway has been extended to include a few REST endpoints, these are really used for special purposes, such as non-JSON data. Our microservices continue to sit behind our Gateway API. The underlying services are free to have whatever interface they may choose (we currently currently have a few REST services, with one gRPC service). The GraphQL layer offers a place to implement any logic with cross-cutting concern and resolve and relationship between data managed by different services. We have chosen Apollo as our Graphql backend framework, for its large community support as well as Javascript being a de facto language that enables our front-end developers to contribute (although we have since migrated to Typescript for new developement).

The more dramatic change happened on the front-end. Here, we have once again opted for Apollo. While Apollo was not the only option technically (since any GraphQL client, or none would have done), we chose it for its large community support.

It was not without skepticism at first to rely on Apollo's cache store given the earlier reliance on local state. But we gave Apollo Client a try, and were pleasant to find that the cache store did not result in any of the problem that we feared. By designing our API to automatically return the new data that was written after a write event (a **"mutation"** in GraphQL language), our cache update was automatically handled by the Apollo Client. Because the cache store was global, any change that resulted from a mutation done by one component would automatically reflect in the rest of the UI, without any additional code from our application to manage this update.

Ultimately this removed the need to manage back-end data in the UI as application state entirely. We were no longer faced with the dilemma between global vs local state. Data requirements of each component could be collocated with the rendering logic without risking big refactors down the road. Data update can happen automatically without any boiler plate code to write. We get the best of both worlds when it comes to developer experience. Once we mentally think of the Apollo cache store for what it is (a dumb cache store, rather than a smart application state store), then backend data was no longer something our application code had to manage.

With backend data no longer needed to be managed by our application code, we found the remaining state management need to be too little to justify a large tool. For our products at least, it's very rare to find a feature that needs to be persisted globally while the user is on the site, but gone once they leave. Since all back-end data and side effect are handled by Apollo at the framework level, everything else can be managed with simple local states. Freed from maintaning duplicate implementation and constant refactoring to integrate individual features, we could invest our front-end development effort into the [@icgc-ARGO/uikit](https://www.npmjs.com/package/@icgc-ARGO/uikit) library.

# Is it perfect?

**NO.**

Because the Gateway is another layer that sits between the UI and the underlying microservices, some effort needs to be spent in exposing the underlying services' functionalities through the Gateway. For a developer of a microservice who needs to expose the service's functionality to the UI, this can feel like duplication of effort. This is especially true when the underlying services have a non-GraphQL interface, which means a naive Gateway implementation is mostly boiler-plate code that calls the upstream service and return the result. This is indeed the kind of boiler plate code that we should like to avoid.

However, without this layer, the same work would have had to be done in the UI, and we would risk repeating our past mistakes. Another less apparent benefit which I believe we gained, is the ability to surface this work in our planning, where the separation forces us to plan for an explicit step for integrating any new service/feature into the existing system. This is a case where the architecture influenced the way we worked, I believe for the better.

Reusability is another benefit, especially visible for third-party API integration. Recently, a different team has reached out to us about integrating with our JIRA Help Desk. Because we have already done the integration work in our GraphQL Gateway, we could share the integration with them directly by simply pointing them to our public Gateway. Because GraphQL provides a strongly typed schema where every request is validated against, we can be confident that their usage of our API is naturally consistent with what we expect, with minimal documentation.

There are ways to mitigate the boiler plate code problem too. Today we are also writing more services in GraphQL. The ARGO Platform is not the only piece of the ICGC ARGO project. Our Regional Data Processing Center (RDPC) system has been in development in parallel with the Platform, and have seen wide GraphQL adoption as well, to solve a similar technical but very different business problem. Here the RDPC team has been experimenting with GraphQL services behind their gateway layer, allowing the gateway layer to be a direct proxy of the underlying service, while retaining the ability to resolve cross-cutting concerns through Apollo Federation. This approach is not without some operational challenges and some unknowns, but is something that can prove useful for the Platform as well.

# JS nerd bonus opinion

So, does that mean we never need Redux ever again? **NO!**

(For the uninitiated, Redux is a "state management library". In short it provides a central place to store all of the data your front-end app needs, so you only need to update data in one place and have every part of your app automatically updated).

Technically speaking, I think a significant improvement in front-end developer experience could have been achieved in the past by using Redux with a defined strategy on what to include in the store, over our over-reliance on local state in the past. The catch there is that quite some additional tooling and discipline would still be required to fully benefit. Even then, you would still be responsible for fetching data from the right place in the right order, manually writing the result to the state store, doing that all again after a write event, and still having to design your store... none of which is easily communicable to non-frontend developers.

It so happens to be that the only truly global state that our front-end apps need to manage are data retrieved from a back-end. Once that is taken care of, the rest are mostly very ephemeral states. This might also be true for the vast majority of web apps out there, so if this is the case for your application, Graphql + Apollo is a great mix.

However, when this is not the case, Redux is still a very attractive option. Imagine, a test-taking program that needs to mostly run off-line and transmit test results only when there is network availability... or a survey app for collecting data in the fields where no network is available... or maybe even the app I am using to write this post right now (VScode), etc... could be benefiting from a strong application state management system like Redux. (Although it seems Apollo client is becoming a full-blown state management solution lately... I have not yet really experienced that approach yet, would love to hear if you have)..

Finally, this is not to claim that all of the improved frontend developer experience in ARGO has been due to the Gateway and Apollo. ARGO was started at the prime time of React with the new react-hooks that drastically changed how we think about React components entirely. Other technologies that we adopted also took some time to mature and for us to learn the usage that works for us. These include Typescript, Next.JS, Storybook, etc... We arrived at our current stack by taking risks on new technologies, making mistakes and learning from them.

In a world where SpaceX's Crew Dragon UI is built with Javascript, the traditional web (or Earth for that matter 😛) is no longer the only place JS developers' may find themselves in. It is ever more important for us to stay up-to-date with an open mind, while critically selecting the right tool for the right job.
