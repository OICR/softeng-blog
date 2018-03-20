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

You can think of the @PreAuthorize as a sort of middle-ware that allows us to define our own configurable security strategy that spring security will inject in it's request/response chain. For this project we will be using profiles in order to have both the existing "legacy" configuration, and our new "jwt" configuration, co-existing with the ability to switch between them by setting the default loaded profile as an include of the "secure" profile in our `application.yml`.

```
spring.profiles: secure
spring:
  profiles:
    include: [jwt]
```

Let's take a look at what is inside our new `MethodSecurityConfig` class, which is what provides the `studySecurity` method to the @PreAuthorize annotation.


```
@Profile("jwt")
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
@Order(SecurityProperties.ACCESS_OVERRIDE_ORDER)
public class MethodSecurityConfig extends GlobalMethodSecurityConfiguration {

    @Autowired
    private ApplicationContext context;

    @Override
    protected MethodSecurityExpressionHandler createExpressionHandler() {
        OAuth2MethodSecurityExpressionHandler handler = new OAuth2MethodSecurityExpressionHandler();
        handler.setApplicationContext(context);
        return handler;
    }

    @Bean
    public StudyJWTStrategy studySecurity() {
        return new StudyJWTStrategy();
    }

}
```

Since both the new JWT based method security configuration as well as the legacy configuration both provide the `studySecurity()` method, we can easily switch between the two very easily. Next, let's take a look at the `StudyJWTStrategy` class where we define our strategy and the details of how we verify a token.

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