---
layout: post
title:  "Shading Elasticsearch"
breadcrumb: true
author: vitalii_slobodianyk
date: 2016-11-25
categories: vitalii_slobodianyk
tags:
    - Elasticsearch
    - Maven
    - Jar Hell
teaser:
    info: A guide how to prepare an Elasticsearch distribution tailored to your needs.
    image: vitalii_slobodianyk/elastic/elastic-logo.png
header: 
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

## Introduction

'Shading' or package renaming a.k.a [class relocation](https://maven.apache.org/components/plugins/maven-shade-plugin/examples/class-relocation.html) is a process of creating an [uber-jar](http://imagej.net/Uber-JAR) which contains its dependencies and package names of some of the dependencies are renamed.

In this blog post I will provide instructions how to create an Elasticsearch jar file with 'shaded' dependencies. This operation is often required when you use some libraries that Elasticsearch depends on, but the version of the library conflicts in breaking ways. In such a case your project might not compile or run. This is one of the cases of the problem known as the [Jar Hell](https://en.wikipedia.org/wiki/Java_Classloader#JAR_hell). A solution to the problem is to create a custom Elasticsearch distribution jar file which has the problematic dependencies 'shaded' (renamed).

I will also guide how to create a 'shaded' jar file for testing with an in-memory Elasticsearch instance.

## Maven project configuration

We will use Apache Maven to create the jar files, so let's prepare the standard maven directories layout.

First, we create 2 modules which provide a shaded Elasticsearch artifact and shaded dependencies for Elasticsearch testing. A parent pom will be created to organize common configuration, versions and variables. The project layout will be the following:

~~~
.
├── elasticsearch-shaded
│   └── pom.xml
├── elasticsearch-test-shaded
│   └── pom.xml
└── pom.xml

2 directories, 3 files
~~~

#### Parent pom

We start with a parent pom to centralize the common information we need as well as a `maven-shade-plugin` configuration. It easy to maintain plugin configuration if it is stored in one location.

To define some common variables and settings we'll use:

~~~xml
<properties>
  <!-- Versions -->
  <elasticsearch.version>5.0.0</elasticsearch.version>
  <shade-plugin.version>2.4.3</shade-plugin.version>
  
  <!-- Configuration -->
  <elasticsearch.package>org.elasticsearch.shaded</elasticsearch.package>
  <install.dir>${project.build.directory}/distribution</install.dir>
  
  <!-- Encoding -->
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
</properties>
~~~

Next, we will define the `maven-shade-plugin` configuration. 

We include only Elasticsearch packages and the relocated dependencies in shaded jar files. All the other Elasticsearch dependencies are promoted as transitive ones. Such a setup provides a better dependencies control, as it's possible to exclude some of the dependencies or override their version downstream in your project if the need arise.

The following configuration enables such functionality. We also instructed the plugin to include source into shaded artifacts.

~~~xml
<createSourcesJar>true</createSourcesJar>
<shadeSourcesContent>true</shadeSourcesContent>
<promoteTransitiveDependencies>true</promoteTransitiveDependencies>
~~~

The generated jar files should contain `META-INF/MANIFEST.MF`. Elasticsearch relies on some of the properties in the `MANIFEST.MF` to identify if the artifact was properly built. For this reason `Change` and `Build-Date` properties are included. Their values do not really matter.

~~~xml
<transformers>
  <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
    <!-- Elasticsearch relies on these entries to verify build correctness -->
    <manifestEntries>
      <Change>GIT commit ID</Change>
      <Build-Date>${maven.build.timestamp}</Build-Date>
    </manifestEntries>
  </transformer>
</transformers>
~~~

Now, we'll define the 'meat' of the configuration: the dependencies relocation configuration. Not all the dependencies are shaded. We relocate only those ones which we use on our team or some common dependencies with other packages we use. For example, relocation of `com.fasterxml.jackson` is crucial because the Apache Spark version we use relies on an older version of the package, what causes problems.

~~~xml
<relocations>
  <!-- elasticsearch-shade relocations -->
  <relocation>
    <pattern>com.fasterxml.jackson</pattern>
    <shadedPattern>${elasticsearch.package}.jackson</shadedPattern>
  </relocation>
  <relocation>
    <pattern>io.netty</pattern>
    <shadedPattern>${elasticsearch.package}.netty</shadedPattern>
  </relocation>
  <relocation>
    <pattern>org.jboss.netty</pattern>
    <shadedPattern>${elasticsearch.package}.jboss.netty</shadedPattern>
  </relocation>
  <relocation>
    <pattern>org.yaml</pattern>
    <shadedPattern>${elasticsearch.package}.yaml</shadedPattern>
  </relocation>
  <!-- elasticsearch-test-shade relocations -->
  <relocation>
    <pattern>org.objectweb.asm</pattern>
    <shadedPattern>${elasticsearch.package}.objectweb.asm</shadedPattern>
  </relocation>
  <relocation>
    <pattern>org.antlr</pattern>
    <shadedPattern>${elasticsearch.package}.antlr</shadedPattern>
  </relocation>
  <!-- common relocations -->
  <relocation>
    <pattern>org.apache.http</pattern>
    <shadedPattern>${elasticsearch.package}.apache.http</shadedPattern>
  </relocation>
  <relocation>
    <pattern>org.apache.commons.codec</pattern>
    <shadedPattern>${elasticsearch.package}.apache.commons.codec</shadedPattern>
  </relocation>
</relocations>
~~~


It is important to note that `joda` packages should not be shaded if you use scripts written in `Painless` language. It is the default Elasticsearch scripting language developed by the Elasticsearch team. It relies on Java data types and uses `joda`'s types for date. If you relocate it `Painless` query scripts will fail to compile.

As mentioned before, we want to include only Elasticsearch and the relocated dependencies. To do that we define artifact sets which should be included in the shaded jar file.

~~~xml
<artifactSet>
  <includes>
    <include>org.icgc.dcc:*</include>
    <include>org.elasticsearch:*</include>
    <include>org.elasticsearch.client:*</include>
    <include>org.elasticsearch.plugin:*</include>
    <include>org.elasticsearch.test:*</include>
    <include>com.fasterxml.jackson.core:*</include>
    <include>com.fasterxml.jackson.dataformat:*</include>
    <include>io.netty:*</include>
    <include>org.yaml:*</include>
    <include>org.apache.httpcomponents:*</include>
    <include>commons-codec:*</include>
    <include>org.jboss.netty:*</include>
  </includes>
</artifactSet>
~~~

`org.icgc.dcc` group ID was added to the included artifacts set, because the artifacts extracted from the Elasticsearch distibution (`antlr4-runtime`, `asm-debug-all` and `lang-painless`) derive this group ID.

The last step in terms of `maven-shade-plugin` configuration is to configure filters so other files, like README's, licenses etc are excluded.

~~~xml
<filters>
  <filter>
    <artifact>*:*</artifact>
    <excludes>
      <exclude>META-INF/license/**</exclude>
      <exclude>META-INF/*</exclude>
      <exclude>META-INF/maven/**</exclude>
      <exclude>LICENSE</exclude>
      <exclude>NOTICE</exclude>
      <exclude>/*.txt</exclude>
      <exclude>build.properties</exclude>
    </excludes>
  </filter>
</filters>
~~~

Now we are done with the shade plugin configuration. For more information on the configuration parameters refer to the [plugin documentation](https://maven.apache.org/plugins/maven-shade-plugin/shade-mojo.html).

The last piece of configuration. We put in the parent pom is configuration for artifacts deployment. This is a repository for our internal dependencies, which is publicly available.


~~~xml
<distributionManagement>
  <repository>
    <id>dcc-dependencies</id>
    <url>https://artifacts.oicr.on.ca/artifactory/dcc-dependencies</url>
  </repository>
</distributionManagement>
~~~
and `maven-deploy-plugin` configuration.
 
~~~xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-deploy-plugin</artifactId>
  <version>2.8.2</version>
</plugin>
~~~

A complete pom could be found in our [repository](https://github.com/icgc-dcc/dcc-common/blob/3e243b124043961405a3fb25635ee444fac6c9b1/dcc-common-es/src/main/poms/elasticsearch/pom.xml).

#### elasticsearch-shaded

Now we define `elasticsearch-shaded` jar. It will provide `elasticsearch` and Elasticsearch transport client with 'shaded' dependencies.

Define dependencies this artifact requires:

~~~xml
<dependencies>
  <dependency>
    <groupId>org.elasticsearch</groupId>
    <artifactId>elasticsearch</artifactId>
    <version>${elasticsearch.version}</version>
  </dependency>
  <dependency>
    <groupId>org.elasticsearch.client</groupId>
    <artifactId>transport</artifactId>
    <version>${elasticsearch.version}</version>
    <exclusions>
      <exclusion>
        <groupId>org.elasticsearch</groupId>
        <artifactId>elasticsearch</artifactId>
      </exclusion>
    </exclusions>
  </dependency>
</dependencies>
~~~

`elasticsearch` is excluded from `org.elasticsearch.client` to avoid warnings generated by the shade plugin.

There is no other configuration as all the dependencies relocations are defined in the parent pom. A complete pom definition is could be found in our [repository](https://github.com/icgc-dcc/dcc-common/blob/3e243b124043961405a3fb25635ee444fac6c9b1/dcc-common-es/src/main/poms/elasticsearch/elasticsearch-shaded/pom.xml).

#### elasticsearch-test-shaded

There is a problem related to testing with Elasticsearch. Sometimes it is preferable to be able to query against a running instance of Elasticsearch in unit tests, because mocking it too cumbersome or even not possible. There are cases (like development of your own [domain-specific language](https://github.com/icgc-dcc/dcc-portal/tree/develop/dcc-portal-pql)), when it is not suitable to query against a real Elasticsearch instance and you need an `in-memory` one. There are not good 3rd party projects yet which provide this functionality for Elasticsearch 5.x. The only way is to use the provided [ESIntegTestCase](https://www.elastic.co/guide/en/elasticsearch/reference/5.0/integration-tests.html) even though it is [not recommended](https://discuss.elastic.co/t/5-0-0-using-painless-in-esintegtestcase/64447/12). 

The drawback of using the `ESIntegTestCase` is that it requires additional configuration when you would like to run scripts. Modules which support particular query language, for example `Painless` or `Groovy` should be added separately. Those modules are not available in the Central Maven repository, however they are provided with the Elasticsearch distribution.

`elasticsearch-test-shaded` module will provide the plugin dependencies as well as a 'shaded' `org.elasticsearch.test` framework.


Let's define dependencies this jar provides. We will exclude `org.elasticsearch` from dependencies so undesired artifacts do not sneak in.

~~~xml
<dependencies>
  <dependency>
    <groupId>org.elasticsearch.test</groupId>
    <artifactId>framework</artifactId>
    <version>${elasticsearch.version}</version>
    <exclusions>
      <exclusion>
        <groupId>org.elasticsearch</groupId>
        <artifactId>securemock</artifactId>
      </exclusion>
      <exclusion>
        <groupId>org.elasticsearch</groupId>
        <artifactId>elasticsearch</artifactId>
      </exclusion>
    </exclusions>
  </dependency>
</dependencies>
~~~

Next, we need to download ES distribution and extract the `lang-painless` jar file with all its dependencies and include those to the classpath. This is accomplished with `com.googlecode.maven-download-plugin` and `com.googlecode.addjars-maven-plugin`. The plugins' configuration is pretty self-describing:

~~~xml
<build>
  <plugins>
    <plugin>
      <groupId>com.googlecode.maven-download-plugin</groupId>
      <artifactId>download-maven-plugin</artifactId>
      <version>1.3.0</version>
      <executions>
        <execution>
          <id>download-elasticsearch</id>
          <phase>validate</phase>
          <goals>
            <goal>wget</goal>
          </goals>
          <configuration>
            <url>https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-${elasticsearch.version}.tar.gz</url>
            <unpack>true</unpack>
            <cacheDirectory>${project.build.directory}</cacheDirectory>
            <outputDirectory>${install.dir}</outputDirectory>
          </configuration>
        </execution>
      </executions>
    </plugin>
    <plugin>
      <groupId>com.googlecode.addjars-maven-plugin</groupId>
      <artifactId>addjars-maven-plugin</artifactId>
      <version>1.0.5</version>
      <executions>
        <execution>
          <goals>
            <goal>add-jars</goal>
          </goals>
          <configuration>
            <resources>
              <resource>
                <directory>${install.dir}/elasticsearch-${elasticsearch.version}/modules/lang-painless</directory>
              </resource>
            </resources>
          </configuration>
        </execution>
      </executions>
    </plugin>
  </plugins>
</build>
~~~

We are done with project configuration. A complete setup is available in our [repository](https://github.com/icgc-dcc/dcc-common/tree/feature/dcc-5433-migration-dcc-common-es/dcc-common-es/src/main/poms/elasticsearch).

## Building

To build the 'shaded' jar files and install them in the local maven repository use the following command in the project root directory (the one which contains the parent pom):

~~~shell
mvn clean install
~~~

If it is required to build only one jar we could specify that:

~~~shell
mvn -pl elasticsearch-test-shaded clean install
~~~

To deploy the artifacts to a remote repository the use

~~~shell
mvn clean deploy
~~~

Most likely the remote repository requires authentication. The following lines should be added to your `~/.m2/settings.xml`:

~~~xml
<settings>
  <servers>
    <server>
      <id>dcc-dependencies</id>
      <username>foo</username> <!-- Not 'foo', your real user name :) -->
      <password>bar</password>
    </server>
  </servers>
</settings>
~~~

As you can see it is not hard to prepare Elasticsearch distribution tailored to your needs. Feel free to modify the configuration and like this post ;)
