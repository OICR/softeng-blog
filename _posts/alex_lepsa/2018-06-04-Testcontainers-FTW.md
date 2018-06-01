---
layout: post
title:  "Testcontainers FTW (a really really big win)"
breadcrumb: true
author: alex_lepsa
date: 2018-06-04
categories: alex_lepsa
tags:
    - Spring Data
    - Hibernate
    - Testing
teaser:
    info: Never configure another test database again, and no I'm not talking about H2.
    image: alex_lepsa/2018-06/testcontainers-logo.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog 
---

Intro about current scenario .... test db's ... H2 ... blah blah

# Testcontainers to the rescue #

Easy

Configurable

You can use SQL scripts

<center>
  <figure>
      <img src="{{site.urlimg}}alex_lepsa/2018-06/testcontainer-docs.png"/>  
      <figcaption>Test Containers Docs are awesome!</figcaption>
  </figure>
</center>

Blah blah blah

# The Setup: POM  Profiles #

Blah blah blah

### Testcontainers ###
```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
    <version>1.5.2.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework.security.oauth</groupId>
    <artifactId>spring-security-oauth2</artifactId>
    <version>2.1.0.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-jwt</artifactId>
</dependency>
```

Blah blah blah our `application.yml`.

```
spring.profiles: secure
spring:
  profiles:
    include: [jwt]
```

# The Actual Tests #

Blah blah blah

```
@Slf4j
@Component
@Profile("jwt")
public class StudyJWTStrategy implements StudyStrategyInterface {

    @Value("${auth.server.prefix}")
    protected String scopePrefix;

    @Value("${auth.server.suffix}")
    protected String scopeSuffix;

    public boolean authorize(@NonNull Authentication authentication, @NonNull final String studyId) {
        log.info("Checking authorization with study id {}", studyId);

        val details = (OAuth2AuthenticationDetails) authentication.getDetails();
        val user = (JWTUser) details.getDecodedDetails();

        return verify(user, studyId);
    }

    boolean verify(JWTUser user, String studyId) {
        final val roles = user.getRoles();
        val check = roles.stream().filter(s -> isGranted(s, studyId)).collect(toList());
        return !check.isEmpty();
    }

    private boolean isGranted(String tokenScope, String studyId) {
        log.info("Checking JWT's scope '{}', server's scopePrefix='{}', studyId '{}', scopeSuffix='{}'",
                tokenScope, scopePrefix, studyId, scopeSuffix);
        return getSystemScope().equals(tokenScope) || getEndUserScope(studyId).equals(tokenScope); //short-circuit
    }

    private String getEndUserScope(String studyId) {
        return DOT.join(scopePrefix, studyId.toUpperCase(), scopeSuffix);
    }

    private String getSystemScope() {
        return DOT.join(scopePrefix, scopeSuffix);
    }
}
```

Blah blah blah conclusion

You can view this project and all its source code on [Github](https://github.com/overture-stack/ego).