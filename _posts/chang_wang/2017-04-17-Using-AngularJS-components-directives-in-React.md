---
layout: post
title:  "Using AngularJS components & directives inside React"
breadcrumb: true
author: chang_wang
date: 2017-04-17
categories: chang_wang
tags:
    - Javascript
    - React
    - Angular
teaser:
    info: Using AngularJS components & directives inside React

---

## Why  
We've seen some [informative](http://blog.rangle.io/migrating-an-angular-1-application-to-react/) [articles](https://tech.small-improvements.com/2017/01/25/how-to-migrate-an-angularjs-1-app-to-react/) on how to use React components inside an Angular app, but guides for "using Angular components inside React" were scarce.

The [GDC project](https://portal.gdc.cancer.gov/) is in the process of migrating from AngularJS (Angular 1) to React. For quite a while, the React-in-Angular pattern was used to perform a [strangler migration](https://www.martinfowler.com/bliki/StranglerApplication.html) one component at a time. As React ate through more and more of the project, we reached a tipping point where it could become the root app, but we were still short a few pieces of somewhat complex Angular directives that prevented us from reaching feature parity.  

Being able to reuse those Angular directives as-is allowed us to continue the migration without compromising existing features or our delivery timeline.  


## Bootstrapping Angular

This part is actually incredibly simple.  

Assuming the name of the root module for your legacy Angular app is `ngApp`, and the name of the Angular component you want to wrap as a react component is `widget`

```js
{% raw %}
class AngularWidget extends React.Component {
  componentDidMount() {
    angular.bootstrap(this.container, ['ngApp']);
  }
  render = () => (
    <div
      ref={c => { this.container = c; }}
      dangerouslySetInnerHTML={{ __html: '<widget></widget>' }}
    />
  )
}
{% endraw %}
```

Here's a contrived example using angular-bootstrap-datetimepicker

<p data-height="430" data-theme-id="dark" data-slug-hash="ryoqEp" data-default-tab="js,result" data-user="cheapsteak" data-embed-version="2" data-pen-title="Angular Bootstrap DateTimePicker in React" class="codepen">See the Pen <a href="http://codepen.io/cheapsteak/pen/ryoqEp/">Angular Bootstrap DateTimePicker in React</a> by Chang Wang (<a href="http://codepen.io/cheapsteak">@cheapsteak</a>) on <a href="http://codepen.io">CodePen</a>.</p>

This would suffice for completely self-contained components/directives, but what if there are buttons or links in the Angular component that are supposed to take the user to the now react app?

## Hijacking ui-router

Assuming ui-router is being used for routing, we only have to intercept calls to `$state.go`

```js
componentDidMount() {
    angular.module('ngApp')
      .run(($state) => {
        $state.go = (state, params, options) => {
          console.log('hijacked ui router');
        }
      })
    angular.bootstrap(this.container, ['ngApp']);
}
```

You can then choose how the app should handle those requests

Here's an example that passes it off to react-router v4
<p data-height="430" data-theme-id="dark" data-slug-hash="PpvBzy" data-default-tab="js,result" data-user="cheapsteak" data-embed-version="2" data-pen-title="Angular Hijack ui-router in React" class="codepen">See the Pen <a href="http://codepen.io/cheapsteak/pen/PpvBzy/">Angular Hijack ui-router in React</a> by Chang Wang (<a href="http://codepen.io/cheapsteak">@cheapsteak</a>) on <a href="http://codepen.io">CodePen</a>.</p>

If the old routes and new routes don't match 1:1, you could insert a mapping function that maps old routes to new routes. An example of that can be found in our codebase [here](https://github.com/NCI-GDC/portal-ui/blob/7dd05963c638d1ff9ae60b4f2eb089151aa1a473/modules/node_modules/%40ncigdc/components/GitHut.js#L86-L110)

## Neutralize Angular's location tampering  

A problem we ran into was that after initializing and then navigating away from the Angular component, the browser's address bar would become "stuck", always resetting to the route the angular component was on. 

Keep an eye on the address bar:

<video class="share-video" id="share-video" poster="{{site.urlimg}}chang_wang/ng-in-react/SizzlingKeyDolphin-poster.jpg" autoplay="" muted="" loop>
    <source id="webmSource" src="{{site.urlimg}}chang_wang/ng-in-react/SizzlingKeyDolphin.webm" type="video/webm">
    <source id="mp4Source" src="{{site.urlimg}}chang_wang/ng-in-react/SizzlingKeyDolphin.mp4" type="video/mp4">
    <img title="Sorry, your browser doesn't support HTML5 video." src="{{site.urlimg}}chang_wang/ng-in-react/SizzlingKeyDolphin.gif">
</video>

It turns out Angular's digest cycle checks the browser's location, and when it notices that the browser's url is different from what it thinks it should be, it sets the browser's url to the "correct" value. Since the url is now being handled outside of Angular, we need to disable this behaviour.  

Looking at Angular's source, we see it sets the url via the (🕵️private) `$browser` service

- $browser.url is a method that is both a [setter](https://github.com/angular/angular.js/blob/2c7400e7d07b0f6cec1817dab40b9250ce8ebce6/src/ng/browser.js#L132-L170) and a [getter](https://github.com/angular/angular.js/blob/2c7400e7d07b0f6cec1817dab40b9250ce8ebce6/src/ng/browser.js#L171-L178)
- when used as a setter, it [calls `history.pushState/replaceState`](https://github.com/angular/angular.js/blob/2c7400e7d07b0f6cec1817dab40b9250ce8ebce6/src/ng/browser.js#L150), then [returns $browser](https://github.com/angular/angular.js/blob/2c7400e7d07b0f6cec1817dab40b9250ce8ebce6/src/ng/browser.js#L170) (possibly for chaining)
- when used as a getter, it [returns the current location](https://github.com/angular/angular.js/blob/2c7400e7d07b0f6cec1817dab40b9250ce8ebce6/src/ng/browser.js#L177)  

We need to neutralize the setter without breaking the app. 
Here's how:

```js
angular
  .module('ngApp')
  .run(($browser) => {
    $browser.url = function (url) {
      if (url) {
        // setter is now a noop
        return $browser;
      } else {
        // getter always returns ''
        return '';
      }
    };
  })
```
Note that the above would result in `$browser.url()` when used as a getter to always return an empty string. That could be replaced with an actual path if the component needs a specific route or query param (e.g. `return 'http://localhost/route/subroute/123?q=4'` instead of `return ''`), or even the `location` from react-router.  

## Cleanup

We're nearly done, just need to clean up the bootstrapped angular app when the React component unmounts.  

Here's a minimal example (you can replace `ngApp` with the name of your angular module).

```js
{% raw %}
class AngularWidget extends React.Component {
  componentDidMount() {
    this.$rootScope = angular.injector(['ng', 'ngApp']).get('$rootScope');
    angular.bootstrap(this.container, ['ngApp']);
  }
  componentWillUnmount() {
    this.$rootScope.$destroy();
  }
  render = () => (
    <div
      ref={c => { this.container = c; }}
      dangerouslySetInnerHTML={{ __html: '<widget></widget>' }}
    />
  )
}
{% endraw %}
```

## Summary  

It's always a difficult decision on whether, when, and how to migrate from a framework. For those that have started or are about to begin, I hope this article will help ease and complete that transition.  

If you've read this far, consider following me on [Medium](https://medium.com/@cheapsteak/latest) or tweet at me [@CheapSteak](https://twitter.com/CheapSteak)  

You might also be interested in my article on [Migrating a legacy frontend build system to Webpack](https://softeng.oicr.on.ca/chang_wang/2017/01/03/Legacy-Build-Tool-Migration/) and [Quick and Dirty tricks for debugging Javascript](https://medium.com/@cheapsteak/quick-and-dirty-tricks-for-debugging-javascript-d0e911c3afa), or perhaps [Animations with ReactTransitionGroup](https://medium.com/p/animations-with-reacttransitiongroup-4972ad7da286)

Thanks to [Ben Hare](https://twitter.com/hare_ben), [Dusan Andric](https://twitter.com/andricDu), [Jeffrey Burt](https://twitter.com/jephuff) and [Francois Gerthoffert](https://twitter.com/fgerthoffert) for proofreading and feedback 😄

<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
