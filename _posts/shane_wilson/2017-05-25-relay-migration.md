---
layout: post
title:  "Migrating to Relay Modern"
breadcrumb: true
author: shane_wilson
date: 2017-05-25
categories: shane_wilson
tags:
    - Relay
    - React
    - Javascript
teaser:
    info: A guide to migrating a legacy Relay code base to Relay Modern
    image: shane_wilson/relay.png
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---


## Introduction
With the release of Relay Modern comes a new way to create Containers and write fragments. Luckily you do not need to rewrite your entire application to take advantage of these updates. There is a compatibility mode that lets Classic and Modern components run at the same time. There is even an official [Conversion Playbook](https://facebook.github.io/relay/docs/conversion-playbook.html){:target="_blank"} to help walk you through the steps needed to update your app. However, while we were converting our app we noticed that sometimes the Playbook hides important information behind links. After getting stuck a few times we decided to write down what it took to get everything up and running.

## Step 0: Incrementally convert to Relay Compat

The first steps invole updating the `react-relay` library and setting up new build tools to get ready for the conversion to Relay Modern syntax.

### Upgrade to react-relay v1.0.0 ([link](https://facebook.github.io/relay/docs/relay-modern.html#upgrade-to-react-relay-v1-0-0){:target="_blank"})

```
yarn add react-relay
```

### react-relay -> react-relay/classic
After the upgrade `react-relay` will point to `modern` by default so update all imports to point to `react-relay/classic` instead.

It should be as simple as using an editor to find and replace all instances of `react-relay` with `react-relay/classic` but there are also [codemods](https://github.com/relayjs/relay-codemod){:target="_blank"} that might be able to automate this step.

### Set up babel-plugin-relay ([link](https://facebook.github.io/relay/docs/babel-plugin-relay.html#using-during-conversion-in-compatibility-mode){:target="_blank"})

```
yarn add --dev babel-plugin-relay
```

Since we are upgrading from Relay Classic to Relay Modern/Compat we will need to remember to add `"compat": true` and `"schema": "schema/schema.graphql"` flags to the babel config.

The schema file from Relay Classic can be in either `.graphql` or `.json` format.

```
// .babelrc
{
 "presets": [...],
 "plugins": [..., ["relay", {"compat": true, "schema": "schema/schema.json"}]]
}
```

### Setup new Relay Complier ([link](https://facebook.github.io/relay/docs/relay-compiler.html#setting-up-relay-compiler){:target="_blank"})

Modern components need to use new relay compiler even in `react-relay/compat` mode.

```
yarn add --dev relay-compiler
```

Note that the relay-compiler requires that you have [watchman](https://facebook.github.io/watchman/){:target="_blank"} globally installed even if you are not trying to run it in `--watch` mode. You should [install it](https://facebook.github.io/watchman/docs/install.html){:target="_blank"} before continuing.

Point the new `relay-compiler` to the same `schema.graphql` used in the babel plugin - again this schema can be in either `.json` or `.graphql` format.

```
// package.json
"scripts": {
  "relay": "relay-compiler --src ./src --schema ./schema/schema.json"
}
```

Now run the compiler - it should not find anything yet:

```
❯ yarn run relay
yarn run v0.17.9
$ relay-compiler --src ./src --schema ./schema/schema.json
HINT: pass --watch to keep watching for changes.
Parsed default in 0.08s

Writing default
Writer time: 0.12s [0.12s compiling, 0.00s generating, 0.00s extra]
Unchanged: 0 files
Written default in 0.30s
✨  Done in 1.01s.
```

### Checkpoint!

 - All components using `react-relay/classic`
 - Still using `Relay.createContainer`
 - Still using `Relay.QL`
 - `relay-compiler` runs but does not find any queries
 - Application works as before

## Step 1: Incrementally convert to Relay Compat!

Start using the modern syntax and compiler for some containers while keeping compatibility with the rest of the project. It might be easier to start with a simple container that does not have fragments in its query but there is also a [codemod](https://github.com/relayjs/relay-codemod) that could automate this step.

### react-relay/classic -> react-relay/compat
Use `react-relay/compat` instead of `react-relay` because `compat` components use Modern syntax while still remaining compatible with Classic containers.

Update the containers by using `createFragmentContainer` in place of `Relay.createContainer` and the fragments by using `graphql` instead of `Relay.QL`. `${MyComponent.getFragment('hits')}` is gone and replaced with more standard graphql syntax `...MyComponent_hits`.

#### Notes on Fragments

- Fragments need a name
- Name needs to start with module name
- Fragment key can be embedded in fragment name

```diff
// MyComponent.js
-import Relay from 'react-relay/classic';
+import {
+  createFragmentContainer,
+  graphql,
+} from 'react-relay/compat';

...

-export default Relay.createContainer(
+export default createFragmentContainer(
   MyComponent,
- {
-   fragments: {
-     viewer: () => Relay.QL`
-       fragment on Root {
-         projects {
-           ${TableData.getFragment('hits')}
-         }
-       }`
-   }
- }
+ graphql`
+   fragment MyComponent_viewer on Root {
+      projects {
+        ...TableData_hits
+      }
+   }
+ `
)
```

### Run Compiler ([link](https://facebook.github.io/relay/docs/relay-compiler.html){:target="_blank"})

Now run the relay-compiler again but this time it should find the new `graphql` queries.

```
❯ yarn run relay
yarn run v0.17.9
$ relay-compiler --src ./src --schema ./schema/schema.json
HINT: pass --watch to keep watching for changes.
Parsed default in 0.11s

Writing default
Writer time: 0.32s [0.11s compiling, 0.21s generating, 0.00s extra]
Created:
 - MyComponent_viewer.graphql.js
Unchanged: 0 files
Written default in 0.49s
```

### Checkpoint!

 - At least one component uses `react-relay/compat`
 - Now using `createFragmentContainer`
 - Query fragment now uses `graphql`
 - `relay-compiler` runs and finds the new queries
 - Application works as before

## Next Steps

 From here it is a matter of moving over the rest of the Classic containers to the Modern API. That is still a work in progress for us but we will have a new guide out when we are finished.