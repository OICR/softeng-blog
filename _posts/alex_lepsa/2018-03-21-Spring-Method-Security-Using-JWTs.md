---
layout: post
title:  "Using JWT's with Spring Security's @PreAuthorize annotation for method specific security"
breadcrumb: true
author: alex_lepsa
date: 2018-03-21
categories: alex_lepsa
tags:
    - Spring Security
    - JWT
teaser:
    info: We explore how to implement a spring security strategy that statelessly authorizes a user using via JWT, allowing for method level permissions using the @PreAuthorize annotation.
    image: alex_lepsa/2018-03/spring_jwt_thumb.jpg
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

Much has been writing about integrating JWT's into spring security, and in fact Pivotal has included more and more first-class support for JWT's in their recent releases. That said, one thing that seemed to be missing was how to stitch JWT's into an existing application that was using the @PreAuthorize annotation for fine-grain access control. We will be referencing our [SONG](https://www.overture.bio/song) application from [Overture](https://www.overture.bio/).

### The Problem ###

SONG is an open source system for validating and tracking meta-data about raw data submissions, assigning identifiers to entities of interest, and managing the state of the raw data with regards to publication and access. This is an existing, in production, application that we want to update to authorize users in a stateless manner using JWT's. In our case we already have a JWT provider in our [EGO](https://github.com/overture-stack/ego) which takes care of authenticating our user and then passes us a JWT we can verify and extract permissions from.

If we take a quick look at our swagger output we'll see that studies are at the center of this application, and further digging into the existing security strategy will uncover that authorization is evaluated using scopes tied to a particular study.

<center>
  <figure>
      <img src="{{site.urlimg}}alex_lepsa/2018-03/swagger-ui.png"/>  
      <figcaption>SONG Swagger Docs</figcaption>
  </figure>
</center>

With this in mind, let's take a look at how we are currently securing study endpoints. Looking at the `StudyController` in the  `org.icgc.dcc.song.server.controller` package, we see the @PreAuthorize annotation (among others) used to secure the create action.

```
@ApiOperation(value = "CreateStudy", notes = "Creates a new study")
@PostMapping(value = "/{studyId}/", consumes = { APPLICATION_JSON_VALUE, APPLICATION_JSON_UTF8_VALUE })
@PreAuthorize("@studySecurity.authorize(authentication, #studyId)")
@ResponseBody
public int saveStudy(@PathVariable("studyId") String studyId, @RequestHeader(value = AUTHORIZATION, required = false) final String accessToken, @RequestBody Study study) {
    return studyService.saveStudy(study);
}
```

You can think of the @PreAuthorize as a sort of middle-ware that allows us to define our own configurable security strategy that spring security will inject in it's request/response chain.