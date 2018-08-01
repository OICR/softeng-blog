---
layout: post
title:  "let there be auth"
breadcrumb: true
author: ann_catton
date: 2018-08-01
categories: ann_catton
tags:
    - authentication
    - relay
    - fetch
    - javascript
teaser:
  info:
  image:
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---

Recently we had a project that required taking our open data portal and putting it behind a layer of authentication. This actually required logging into 2 separate services (which could be a post in itself!).
Originally, the portal UI was designed with the expectation that it would be open to everyone, everywhere, with the exception of some downloading capabilities. Adding authentication required a ton of work on the api side, but this post addresses just a few of the tweaks we had to make to the Root component of our app.

Our UI uses a mix of [Relay Classic](https://facebook.github.io/relay/docs/en/classic/classic-api-reference-relay.html) and [Relay Modern](https://facebook.github.io/relay/). We’ve updated a lot of the components to use modern, but there are still classic fragments hanging around that require a parent fragment. The query itself does nothing, but it creates the necessary container so that all those classic fragments don’t shout and scream.

~~~
const PortalQuery = {
  fragments: {
    viewer: () => Relay.QL'
      fragment on Root {
        user {
          username
        }
      }
    ',
  },
};
~~~

There were 2 problems that needed solving:

1.  Ensure we had the user's credentials before trying the initial relay query, which would fail and prevent the Portal from rendering.
2.  Because we want to use the same codebase for both, we need 2 paths for the app Root, one that would render as normal, without requiring authentication, and the other path that would require a login before accessing any data.

For the first issue we juggled the order in which components were rendered. Instead of creating the store and a Provider/Router component in Portal.js, we moved all of that to Root.js, so that we could delay the Portal rendering until after we had a user set up in our store. This allowed us to render our login Route before the Portal home route tried to render, and allowed us to set up
This allowed us to set up the login route and the main route, and delay any rendering until after the relay network is set up and we have a chance to get credentials from login. Once we have credentials, they can be sent with that relay query in Portal.js.

~~~
const Root = () => (
  <Router>
    <Provider store={store}>
      <LoginRoute />
      {…checking here if we have a logged in user before we render the Portal Relay container}
      </Provider>
  </Router>
);
~~~

For the second issue, allowing the codebase to be used for open and authenticated portals, there was more tinkering to be done in the relay network layer. We’re using react-relay-network-layer (the classic version). There was a lot of trial and error here as I’ve never worked with this library or this part of the ui code. Happily the flow for the open portal worked well with the change to the order in which Root components were rendered, so it was just a simple check of a flag, IS_AUTH_PORTAL? to decide when to render the first Relay container.

Everything else is happening in the injectNetworkLayer call. The first goal was just to get the logic working inside injectNetworkLayer. For the open portal, the function returns early if the IS_AUTH_PORTAL flag is false:
if (!IS_AUTH_PORTAL) { return next(req) }
If it is true, the function continues. Fetch doesn’t include credentials by default, so we add them to the request object:

~~~
req.credentials = ‘include’
~~~

Everything seemed like it was going smoothly (!) until it came to handling authentication errors. There is the initial flow, where the user logs in and is either successful (and is redirected to the portal proper) or fails (and remains on the login screen). The trick was handling the expiry of the auth token when the user was in the middle of using the data portal. We wanted the boot the user - ever so gently - to the login screen in that case, with a nice message saying to please log in again.
Initially I tried using the catch block to control authentication errors, but I learned the hard way that fetch, being promise-based, does not reject on http errors (even though it seems like it should! why not make my life easier, fetch??). So instead, http errors need to be handled in the then block, by detecting the response status and then acting accordingly. Something like:

~~~
if (response.ok) { return response }
else
{ throw Error(‘Everything is not ok!’, response.status) }
~~~

and then handle the error in the catch.

I was having issues with the throw statement behaving consistently, so at the moment I have a working version where everything is handled in the then clause. The code will branch depending on if auth is needed or not, and the user is sent to login if they do have the correct token or their token does not grant the correct access. Each redirect has its own info message describing why the user is being denied. But the code is messy and non-obvious. Also, because there are 2 services which provide authentication, if one authentication is missing, and we're sending the user back to login, we need to make sure the other token (There’s also another part of auth error handling, that involves the double-login I mentioned earlier. But that’s a post for another day). So my next goal is getting that throw statement in there to handle http errors where I think they should be handled.

There is another strategy I would like to try, once I get the basic promise version working. react-relay-network-layer provides middlewares you can add to customize your network layer, and one of them is an authmiddleware. From the docs the default middleware has properties for a token and a tokenRefreshPromise, which looks like it may not work in this case, as we’re handling httponly cookies. But the library allows you to create custom functions to replace what the middlewares they provide by default. I don’t know if I’ll be able to implement what I need inside this framework, but it seems worth trying as it would clean up some of code, and make it a little more obvious what’s happening and why!
