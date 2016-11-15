# ICGC - Software Engineering Blog

## Instructions for development


```bash
gem install jekyll bundler
bundle install
sh serve.sh
```

For livereload, in a separate terminal, run

```
guard
```

## Contributing

### Suggest Blog posts

We are open to ideas and suggestion about the blog's content, please suggest your idea to the team by creating github issues. Discussions can also happen in [#softeng-blog](https://oicr.slack.com/messages/softeng-blog/) on OICR slack.

When creating github issues, please use the following format: YYYY-MM-DD - Assignee - Topic 
 - YYYY-MM-DD: Target completion date

### Add a blog post

Create your own branch and start adding content into your user directory inside `/_posts/`, user directories are in the form `firstname_lastname`, if you are unsure about your username, please refer to `/_data/authors.yml`.

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
    youtube: youtubevideokey # optional\
header: 
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    icon: icon-blog
---
```

We are using `kramdown` markdown converter. You can find out more about it here [kramdown](http://kramdown.gettalong.org). We highly recommend going through its syntax documentation 
to get yourself more familiar with the coding style. 

##### Images

Images can be added as an absolute or a relative link. You can look at kramdown syntax documentation to find out about adding absolute links. For a relative link images you can upload them into your folder inside images directory `/images/firstname_lastname/image.png`

To refer them inside your blog post, use the image url from the site config as `{{ site.urlimg }}` and append relative link of your image. `{{ site.urlimg }}/firstname_lastname/image.png`

### Update blog content (non-posts)

Blog data (projects, team members, positions, ...) are located in `/_data/`, please edit those files in your own branch and submit pull requests towards gh-pages.
