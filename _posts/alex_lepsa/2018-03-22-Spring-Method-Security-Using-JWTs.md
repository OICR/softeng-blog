---
layout: post
title:  "Using JWT's with Spring Security's @PreAuthorize annotation for method specific security"
breadcrumb: true
author: alex_lepsa
date: 2018-03-22
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

Much has been written about integrating JWT's into spring security, and in fact Pivotal has included more and more first-class support for JWT's in their recent releases. That said, one thing that seems to be missing is a summary on how to stitch JWT's into an existing application using the `@PreAuthorize` annotation for fine-grain access control. We will be referencing our [SONG](https://www.overture.bio/song) application from [Overture](https://www.overture.bio/).

# Enter SONG, the hero we need #

SONG is an open source system for validating and tracking meta-data about raw data submissions, assigning identifiers to entities of interest, and managing the state of the raw data with regards to publication and access. This is an existing, in production, application that we want to update to authorize users in a stateless manner using JWT's. In our case we already have a JWT provider in our [EGO](https://github.com/overture-stack/ego) service which takes care of authenticating our user and then passes us a JWT we can then use to verify the users' permissions.

If we take a quick look at our swagger output we'll see that studies are at the center of this application, and further digging into the existing security strategy will uncover that authorization is evaluated using scopes tied to a particular study.

<center>
  <figure>
      <img src="{{site.urlimg}}alex_lepsa/2018-03/swagger-ui.png"/>  
      <figcaption>SONG Swagger Docs</figcaption>
  </figure>
</center>

With this in mind, let's take a look at how we are currently securing study endpoints. Looking at the `StudyController` in the  `org.icgc.dcc.song.server.controller` package, we see the `@PreAuthorize` annotation (among others) used to secure the create action.

```
@ApiOperation(value = "CreateStudy", notes = "Creates a new study")
@PostMapping(value = "/{studyId}/", consumes = { APPLICATION_JSON_VALUE, APPLICATION_JSON_UTF8_VALUE })
@PreAuthorize("@studySecurity.authorize(authentication, #studyId)")
@ResponseBody
public int saveStudy(@PathVariable("studyId") String studyId, @RequestHeader(value = AUTHORIZATION, required = false) final String accessToken, @RequestBody Study study) {
    return studyService.saveStudy(study);
}
```

You can think of the `@PreAuthorize` annotation as a sort of middle-ware that allows us to define our own configurable security strategy that spring security will inject in it's request handler chain. Once a request has been authenticated, the Authentication object extracted from the request (and in our case the studyId) is passed to this intermediary method to be evaluated, either allowing or denying access to the resource.

# The Setup: POM's, Profiles, and Configs FTW #

There are a couple dependencies we will need above and beyond the usual `spring-boot-starter-security`, make sure your project has the following dependencies (your version for each may vary) ...

### Spring ###
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

### Lombok (super useful but not required) ###
```
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

For this project we will be using profiles in order to have both the existing "legacy" configuration and our new "jwt" configuration co-exist with the ability to switch between them by setting the default loaded profile as an include of the "secure" profile in our `application.yml`.

```
spring.profiles: secure
spring:
  profiles:
    include: [jwt]
```

Let's take a look at what is inside our new `MethodSecurityConfig` class, which is what provides the `studySecurity` method to the `@PreAuthorize` annotation.


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

Since both the new JWT based method security configuration as well as the legacy configuration both provide the `studySecurity()` method, we can easily switch between the two very easily.

# The Meat (or Tofu) of the Solution #

Now that we have our configs updated to use the new JWT strategy, let's take a look at the `StudyJWTStrategy` class where we define our strategy and the details of how we verify a token.

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

There are a few things going on here so let's walk through this file. First we have a couple member variables that are instantiated auto-magically, these dictate the prefix and postfix required in the extracted user role and are configurable in `applcation.yml`, this is our approach from the original OAuth2 scopes strategy that we (at least for now) are porting over to the JWT strategy. Next we have the main authorize method that is what eventually get's called from the `@PreAuthorize` annotation, it extracts the authentication details (which you'll notice is `OAuth2AuthenticationDetails` - more on that later), converts to a `JWTUser` object (more on that too later) and finally returns the result of the verify method. Verify is pretty straightforward, it checks the roles the `JWTUser` possesses against what is constructed as the required role given the studyId, scopePrefix, and scopeSuffix.

# OAuth2Authentication == JWTAuthentication ?  #

At this point you may have noticed that our `authorize` method already has access to `Autentication`, and that it is being treated just like the OAuth2 authentication in our legacy implementation. This is because in order for this whole thing to work, we are converting the JWT token in the request to an OAuth2 compatible token. This means that we have to update our `SecurityConfig` (backing up and tagging the old one as legacy), configuring a JWT token store and converter, and finally adding a `addFilterBefore()` in our http chain within the `configure(HttpSecurity http)` method.

```
@Configuration
@Profile("jwt")
@EnableWebSecurity
@EnableResourceServer
public class SecurityConfig extends ResourceServerConfigurerAdapter {

    @Value("${auth.server.suffix}")
    private String uploadScope;

    @Autowired
    private SwaggerConfig swaggerConfig;

    @Autowired
    private ResourceLoader resourceLoader;

    @Value("${auth.jwt.publicKeyUrl}")
    private String publicKeyUrl;

    @Override
    @SneakyThrows
    public void configure(HttpSecurity http) {
        http
                .addFilterBefore(new JWTAuthorizationFilter(), BasicAuthenticationFilter.class)
                .authorizeRequests()
                .antMatchers("/health").permitAll()
                .antMatchers("/isAlive").permitAll()
                .antMatchers("/studies/**").permitAll()
                .antMatchers("/upload/**").permitAll()
                .antMatchers("/entities/**").permitAll()
                .antMatchers(swaggerConfig.getAlternateSwaggerUrl()).permitAll()
                .antMatchers("/swagger**", "/swagger-resources/**", "/v2/api**", "/webjars/**").permitAll()
                .and()
                .authorizeRequests()
                .anyRequest().authenticated();
    }

    @Override
    public void configure(ResourceServerSecurityConfigurer config) {
        config.tokenServices(tokenServices());
    }

    @Bean
    public TokenStore tokenStore() {
        return new JwtTokenStore(accessTokenConverter());
    }

    @Bean
    @SneakyThrows
    public JwtAccessTokenConverter accessTokenConverter() {
        return new JWTTokenConverter(fetchJWTPublicKey());
    }

    @Bean
    @Primary
    public DefaultTokenServices tokenServices() {
        val defaultTokenServices = new DefaultTokenServices();
        defaultTokenServices.setTokenStore(tokenStore());
        return defaultTokenServices;
    }

    /**
     * Call EGO server for public key to use when verifying JWTs
     * Pass this value to the JWTTokenConverter
     */
    @SneakyThrows
    private String fetchJWTPublicKey() {
        val publicKeyResource = resourceLoader.getResource(publicKeyUrl);

        val stringBuilder = new StringBuilder();
        val reader = new BufferedReader(
                new InputStreamReader(publicKeyResource.getInputStream()));

        reader.lines().forEach(stringBuilder::append);
        return stringBuilder.toString();
    }
}
```

Spring security's OAuth2 package provides both `JwtTokenStore` and `JwtAccessTokenConverter` classes, which in addition to our own `JWTTokenConverter` class (more on that shortly) are used to override the default `configure()` method. That is where we provide our own `DefaultTokenServices` object that uses a `JwtTokenStore`, which in turn is initialized using our implementation of a `JwtAccessTokenConverter` via our `JWTTokenConverter` class. Our implementation reaches out to an EGO service in order to retrieve the public key used to verify the user request JWT authenticity. While this is our approach, your implementation can store the public key in any manner you please, for example in `application.yml` similar to how we store the public key endpoint for EGO.

```
@Slf4j
public class JWTTokenConverter extends JwtAccessTokenConverter {

    public JWTTokenConverter(String publicKey) {
        super();
        this.setVerifierKey(publicKey);
    }

    @Override
    public OAuth2Authentication extractAuthentication(Map<String, ?> map) {
        OAuth2Authentication authentication = super.extractAuthentication(map);

        val context = (Map<String, ?>)map.get("context");
        val user = (Map<String, ?>)context.get("user");
        val jwtUser = TypeUtils.convertType(user, JWTUser.class);

        authentication.setDetails(jwtUser);

        return authentication;
    }
}

```

The `JWTTokenConverter` is responsible for extracting the details from the JWT and converting that into a `OAuth2Authentication` object that spring understands.

```
@Slf4j
public class JWTAuthorizationFilter extends GenericFilterBean {

    private final String REQUIRED_STATUS = "Approved";

    @Override
    @SneakyThrows
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
        val authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {

            val details = (OAuth2AuthenticationDetails) authentication.getDetails();
            val user = (JWTUser) details.getDecodedDetails();

            boolean hasCorrectStatus = user.getStatus().equalsIgnoreCase(REQUIRED_STATUS);

            if (!hasCorrectStatus) {
                SecurityContextHolder.clearContext();
            }
        }

        chain.doFilter(request, response);
    }
}
```

The `new JWTAuthorizationFilter()` we are passing to `addFilterBefore` is where we verify some general properties of the JWT to decide if it's even worth being evaluated by our method security. You'll notice as well that throughout the token conversion and verification process we've been using the `JWTUser` class.

```
@Data
@Builder
@AllArgsConstructor
public class JWTUser {

  private String name;
  private String firstName;
  private String lastName;
  private String email;
  private String status;
  private String createdAt;
  private String lastLogin;
  private String preferredLanguage;
  private List<String> roles;

}
```

This class is the object representation of the JWT we are expecting in the request. We are using a couple [lombok](https://projectlombok.org/) annotation here to drastically reduce the boiler plate required in writing a simple data class, auto-magically generating getters and setters along with a few other nice things. Below is the `TypeUtils` class for reference, it's just a utility class we use that may or may not be of use to your project.

```
public class TypeUtils {
  public static  <T> T convertType(Object fromObject, Class<T> tClass){
    val mapper = new ObjectMapper();
    mapper.configure(JsonGenerator.Feature.IGNORE_UNKNOWN, true);
    return mapper.convertValue(fromObject, tClass);
  }
}
```

With that we conclude this summary of our approach to integrating JWT's into spring security's `@PreAuthorize` annotation, if you've taken a different approach or have any additional question don't hesitate to reach out in the comments below.

You can view this project and all its source code on [Github](https://github.com/overture-stack/SONG).