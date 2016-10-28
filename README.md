# ICGC - Software Engineering Blog

## Contributing

### Add a blog post

We are open to ideas and suggestion about the blog's content, please suggest your idea to the team on #blog on slack.

Create your own branch and start adding content into your user directory inside /_posts/, user directory are in the form firstname_lastname, if you are unsure about your username, please refer to /_data/authors.yml.

To be properly indexed, markdown files must contain the specific header.

```
---
layout: post
title:  "YOUR BLOG TITLE"
breadcrumb: true
author: firstname_lastname
date: 2016-08-22
categories: firstname_lastname
tags:
    - Software Engineering Club
    - Python
    - React
teaser:
    info: A talk given for the Ontario Institute for Cancer Research’s software engineering club on PGMLab (Probabilistic Graphical Model Lab) and developing web applications for Celery. Javascript web technologies such as React, Redux, Immutable.js, ECMAScript 6 (ES6) are discussed...
    image: post.png # optional
    youtube: youtubevideokey # optional
---
```

### Update blog content (non-posts)

Blog data (projects, team members, positions, ...) are located in /_data/, please edit those files in your own branch and submit pull requests towards gh-pages.
