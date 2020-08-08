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

# TLDR:

- A strong API can help improve the UI significantly.
- The right use of GraphQL significantly reduced our UI complexity.
- Apollo client removed the need to manage back-end data in UI application code.
- Our setup has limitations, but the cost has been justifiable by the benefits.
- In future services we should investigate GraphQL service behind the gateway.

>     "Initial commit" - Dušan Andrić, April 1 2019

This was the first commit in a repo titled `argo-platform`. "Initial commit" are words with strong power towards us developers. At the time, I was working on The Kids First Data Portal (KF), it was my first project with the team, the project that introduced me to distributed microservice systems. Like any "first projects", many lessons were learned, things that I picked up that stuck with me til today, as well as mistakes that I learned not to repeat. KF was coming to an end, and I could not resist the gravity of "Initial commit". Here was a blank canvas, a chance to put all the lessons to test. So on the same day, I pushed a batch of commits that includes "sets up server and some test schema stitching". This was the foundation of what is today the [platform-api](https://github.com/icgc-argo/platform-api) repo, the front-door to everything the ICGC Argo Platform's backend has to offer. This is what lead to it.

I mostly worked on the front-end of KF. Being the first time I built a production React web project, I did not fully anticipate the complexities of a web app with so many back-end interactions. The apps I was used to building in my previous role were complex educational games, with intricate multi-touch gestures and scorring algorithms, but they only ever had to make a handful of API calls. I thought I knew React, but the code I found myself writing felt different from my expectation for a React app. We had layers and layers of containers to manage data, some of which were coming from the back-end, others are transformed / combination of them with local states.

There were many things that contributed to the problem. During this time, we have generally avoided global application state stores (Redux or otherwise) in favor of local states. This was both a deliberate design decision as well as a result of entropy. Local states reduce boiler plates and allows easier vertical integration of individual features, as individual developers on our team tends to deliver full features end-to-end. Many features require ephemeral data, and storring them in global store would mean we had to manage their lifecycle with side effects. We did have a global state store, but without a defined guideline on what should and shouldn't be placed there, coupled with the boiler plates often associated with these stores, we found ourselves often faced with a dilema that ends up favoring local state.

But the over-reliance on local state created vertical silos and made later horizontal integration more difficult (when multiple vertically-integrated features developed by different developers needed to interact somehow). What we gained from the simplicity of collocating data requirements for each component and its UI rendering, we had to pay back (sometimes with interests) in extra complexity to refactor the component to allow data and code sharing.

React's limitation at the time also called for complex patterns like [HOCs](https://reactjs.org/docs/higher-order-components.html) and [Render Props](https://reactjs.org/docs/render-props.html), which added to the complexity. With multiple developers rotating in and out of different features, we found ourselves with duplicated implmentations and buggy code. This took away much of our ability to focus on solving problems that were unique to the UI, resulting in inconsistent implementations and strange bugs. It was not clear to us how we got there, until we asked the question: Why was there so much business logic in the UI to begin with?

Once this question was asked, we took a step back and looked at the whole system. This was KF's architecture diagram at the time:

...

Simplifying on the above, we arrived at this high-level picture:

...

Have you ever called a business's customer service department, who gave you some information and a different number to call the billing department, only to be given another number to call the product department for the rest of your request?... Hopefully not, because most business should be more coordinated than that. But different government agencies maybe? Regardless, this isn't a pleasant experience. And that's what I felt like developing against our microservices.

The problem was multiplied by the number of developers working on different features, and the number of "independent" features there were...

...

We followed a strong process of code review for every PR. But we were also operating over a period of high turnover in the team. To suggest meaningful code changes, it is not enough to be an expert of the framework or language at hand, but also requires knowledge about the specific codebase being reviewed. In fact, one might argue the later is more important. So how could a reviewer know if a certain piece of information has already been made available to the UI somewhere else, if he was not involved in the implementation of that same feature somewhere else?

Many features required complex wrangling of data from multiple backend services. And because business logic tends to be used in multiple places, there were multiple implemntations of the same flow, resulting in duplicated work. Overall, this took away from our frontend team's ability to focus on solving problems that are unique to the frontend, such as consistent design, responsiveness and accessibility.

So we searched for ways to remove the burden of managing cross-cutting concern from the UI, and arrived here:

...

This would not have been immediately clear for us as a path forward, without some past experience with GraphQL. GraphQL was a technology the team had been experimenting with, but it never came to be seen as a central piece of our tech stack. Some of the services built in KF were using GraphQL, but we made a big mistake of cheating GraphQL as if it was REST. They were individual services with GraphQL interfaces, but it was left to the consumer (i.e the UI) to coordinate between them. Multiple GraphQL endpoint also necessarily resulted in multiple GraphQL client instances, and/or none at all. The n+1 problem that GraphQL is known for solving still remained in our experiments, and other benefits we saw did not justify the learning required. But seeing where things went wrong, we decided to give the technology another try with Argo.

So before any design was made, before we even knew what our product needed to do, we knew we needed to make GraphQL a first-class citizen.

# What does it look like today?

Not very different from the last diagram above actually. Our microservices continue to sit behind our Gateway API. The underlying services are free to have whatever interface they may choose (we currently currently have a few REST services, with one gRPC service). The GraphQL layer offers a place to implement any logic with cross-cutting concern and resolve and relationship between data managed by different services. We have chosen Apollo as our Graphql backend framework, for its large community support as well as Javascript being a de facto language that enables our front-end developers to contribute (although we have since migrated to Typescript for new developement).

The more dramatic change happened on the fron-end. Here, we have once again opted for Apollo. While Apollo was not the only option technically (since any GraphQL client, or none would have done), we chose it for its large community support.

It was not without skepticism at first to rely on Apollo's cache store given the earlier reliance on local state. But we gave Apollo Client a try, and were pleasant to find that the cache store did not result in any of the problem that we feared. By designing our API to automatically return the new data that was written after a write event (a **"mutation"** in GraphQL language), our cache update was automatically handled by the Apollo Client. Because the cache store was global, any change that resulted from a mutation done by one component would automatically reflect in the rest of the UI, without a need for any side effect management solution.

Ultimately this removed the need for us to manage back-end data in the UI as application state entirely. We were no longer faced with the dillema of whether some data needed to be in a global store or pulled down by the local component. Data requirements of each component could be collocated with the rendering logic without risking big refactors down the road. Data update can happen automatically without any boiler plate code to write. We get the best of both worlds when it comes to developer experience. Once we mentally think of the Apollo cache store for what it is (a dumb cache store, rather than a smart application state store), then backend data was no longer something our application code had to manage.

With backend data no longer needed to be managed by our application code, we found the remaining state management need to be too little to justify a large tool. For our products at least, it's very rare (or impossible) to find a feature that needs to be persisted globally while the user is on the site, but gone once they leave. Since all back-end data and side effect are handled by Apollo at the framework level, everything else can be managed with local state like our past preference. Freed from maintaning duplicate implementation and constant refactoring to integrate individual features, we could invest our front-end development effort into the [@icgc-argo/uikit](https://www.npmjs.com/package/@icgc-argo/uikit) library.

# Is it perfect?

**NO.**

Because the Gateway is another layer that sits between the UI and the underlying microservices, some effort needs to be spent in exposing the underlying services' functionalities through the Gateway. For a developer of a microservice who needs to expose the service's functionality to the UI, this can feel like duplication of effort. This is especially true when the underlying services have a non-GraphQL interface, which means a naive Gateway implementation is mostly boiler-plate code that calls the upstream service to transform the result into a GraphQL schema. This is indeed the kind of boiler plate code that we sould like to avoid.

However, without this layer, the UI developer would have had to do similar work in the UI. And from our past experience above, we would prefer that to not be the case. Regardless of who handles exposing the underlying service through the gateway, the extra friction is justified by having a place to handle cross-cutting concerns that can be consumed by future applications. We are accustomed to thinking about the UI as one big application, but it can also be thought of as a collection of multiple applications that is bundled together in one place, hence the benefit outweights the cost here.

The benefit is especially visible for third-party API integration. Recently, a different team has reached out to us about integrating with our JIRA Help Desk. Because we have already done the integration work in our GraphQL Gateway, we could share the integration with them directly by simply pointing them to our public Gateway. Because GraphQL provides a strongly typed schema where every request is validated against, we can be confident that their usage of our API is naturally consistent with what we expect, with minimal documentation.

There are ways to mitigate the boiler plate code problem too. Today we are also writing more services in GraphQL. The Argo Platform is not the only piece of the ICGC Argo project. Our Regional Data Processing Center (RDPC) system has been in development in parallel with the Platform, and have seen wide GraphQL adoption as well, to solve a similar technical but very different business problem. Here the RDPC team has been experimenting with GraphQL services behind their gateway layer, allowing the gateway layer to be a direct proxy of the underlying service, while retaining the ability to resolve cross-cutting concerns through Apollo Federation. This approach is not without some operational challenges and some unknowns, but is something that can prove useful for the Platform as well.
