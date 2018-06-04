---
layout: post
title:  "Testcontainers FTW (a really big win)"
breadcrumb: true
author: alex_lepsa
date: 2018-06-05
categories: alex_lepsa
tags:
    - Spring Data
    - Hibernate
    - Testing
teaser:
    info: Never configure another test database again, and no we're not talking about H2.
    image: alex_lepsa/2018-06/testcontainers-logo.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

Our [overture-stack/EGO](https://github.com/overture-stack/ego) project will be undergoing active development over the coming months, in order to ensure consistency and because it's just best practice, we decided it was time to add at least some basic unit/integration tests to ensure things go smoothly. Whether you follow the TDD approach and are writing your tests from the very beginning or like us you are adding them in retro-actively, the objective remains the same; ensure that the application works correctly and consistently end-to-end.

There are two tried and tested approaches (probably more than two but for brevity let's just say two), one is to manage a local database yourself as well as potentially a remote DB when using something like Jenkins or CircleCI for automated build testing, leveraging something like Spring profiles in test mode to connect to these locally running instances. This approach absolutely works but you are manually managing databases, potentially across multiple machines, whether they be remote systems or other team members workstations, each have to manage their own local setup that is manually configured.

The second approach, one that is much more portable, is an in-memory database that simulates what a real DB is doing, something like H2. While this is much simpler to setup and faster to run at test time it is still a simulation. Databases are not always as well behaved as H2, your applications SQL can fail in production against a real DB while the H2-based tests are all passing without issue. Ultimately all in-memory databases are a good approximation, but are not 100%.


# Testcontainers to the rescue

Wouldn't it be great if we could have something that is as easy to setup and as portable as an in-memory DB, but that is an actual database not a simulation, and wouldn't it also be nice if that one solution could support the most popular databases out of the box but also allow us to roll our own custom containers as needed. The word "container" kind of gives my big reveal away (that and the article's headline ...). That's right, Docker to the rescue, more specifically the wonderfully built [Testcontainers](https://www.testcontainers.org) is the hero of this story. Testcontainers is a Java library that supports JUnit tests, providing lightweight, throwaway instances of common databases, Selenium web browsers, or anything else that can run in a Docker container.

<center>
  <figure>
      <img src="{{site.urlimg}}alex_lepsa/2018-06/testcontainer-docs.png"/>  
      <figcaption>Testcontainers Docs are awesome!</figcaption>
  </figure>
</center>

When we set out to solve this problem we had three simple objectives in mind:

1.  The setup must be easy and automated (no manual effort by individual developers)

2.  We must be able to manage it using our existing configs (application.yml)

3.  We have to be able to treat the same as a full-fledged database (ex. run a SQL init script)

I can't stress enough how easy it was for us to get going writing tests that use the same exact version of Postgres that our application uses in production, giving us 100% confidence in our tests and by extension our application. As you'll see below the actual setup was made easy because Testcontainers integrates easily with Spring requiring nothing more than a couple additions to our POM and as little as two small edits in our application.yml, including pointing it to our SQL init script!


# The Setup: POM + Application.yml Profile

Below are the dependencies and configs we needed, your project may differ but the idea is the same, just get what you need for your POM and then configure your datasource in whatever profile you are running for your tests to use Testcontainers instead of your existing datasource, for us it was as simple as adding the letters "tc" to our JDBC postgres url and updating the driver-class-name to use the provided test containers JDBC database driver.

```
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers</artifactId>
    <version>1.7.2</version>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>jdbc</artifactId>
    <version>1.7.2</version>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <version>1.7.2</version>
</dependency>
```

Our `application.yml` production profile looks almost identical to what is below, and with this minor addition we can now start our application
with the test profile and Testcontainers will spin up a postgres 9.5.13 container, run our init script, and then use that container just as if
it was our production database.

```
spring:
  profiles: test

spring.datasource:
  driver-class-name: org.testcontainers.jdbc.ContainerDatabaseDriver
  url: jdbc:tc:postgresql:9.5.13://localhost:5432/ego?TC_INITSCRIPT=01-psql-schema.sql

  username: postgres
  password:
  max-active: 10
  max-idle: 1
  min-idle: 1
```


# The Tests

At this point you can now stand-up your app for testing just as you did before, or for the first time, but with all the added benefits of using a dockerized database container as if it running in production, the same is also true if you were using JDBC H2 or some other similarly configured in-memory testing database. Nothing changes on the tests implementation side of things at all.

```
@Slf4j
@SpringBootTest
@RunWith(SpringRunner.class)
@ActiveProfiles("test")
@Transactional
public class UserServiceTest {
  @Autowired
  private ApplicationService applicationService;

  @Autowired
  private UserService userService;

  @Autowired
  private GroupService groupService;

  @Autowired
  private EntityGenerator entityGenerator;

  // Create
  @Test
  public void testCreate() {
    val user = userService.create(entityGenerator.createOneUser(Pair.of("Demo", "User")));
    assertThat(user.getName()).isEqualTo("DemoUser@domain.com");
  }

  .
  ..
  ...
}
```

I want to also point out a couple gotchas that may or may not save someone time as they get this all going:

* For a quick way of tearing down DB tables between tests we annotated our test classes with @Transactional (org.springframework.transaction.annotation.Transactional) - might not work for everyone but very handy if it does!
* Our SQL init script is located in our resource folder but within a sub-folder, meaning that we had to include it on the
  classpath for Testcontainers to be able to run it:

```
<resources>
    <resource>
        <directory>src/main/resources</directory>
    </resource>
    <resource>
        <directory>src/main/resources/schemas</directory>
    </resource>
</resources>
```

* We use CircleCI, it was configured to spin up a postgres container and use that for testing. This was no longer needed so we updated the configuration, removing all lines pertaining to the test database setup, and specifying the executor type as machine instead of the default docker executor. With that change our tests are executing perfectly with no additional work on our end.

```
# Check https://circleci.com/docs/2.0/language-java/ for more details
#
version: 2
executorType: machine
jobs:
  build:
    steps:
      - checkout

      - run: mvn -B clean install
```

The peace of mind in knowing that every developer on your team, and even your automated testing environments, are all using the exact same database container is priceless. Not to mention how much time this saves you when on-boarding new staff or even just setting up new machines, no one should be installing Postgres or MySQL directly on their development machines in 2018.

You can view this project and all its source code on [Github](https://github.com/overture-stack/ego).
