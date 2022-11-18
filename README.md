# :newspaper: OICR Engineering Blog

###  **We are a team of software engineers, infrastructure specialists, and bioinformaticians creating big-data tools to better treat cancer, one genome at a time.**

# Table of Contents

### [:computer: Running a Local Instance](#computer-running-a-local-instance-1)
### [:ballot_box: Submitting a Blog Post](#ballot_box-submitting-a-blog-post-1)
### [:arrow_up: Updating Blog Content (non-posts)](#arrow_up-updating-blog-content)
### [:memo: Writing Guide](writing_guide.md)
- Non-prescriptive guide covering best practices with structured templates included
### [:bank: Topic Bank](https://docs.google.com/spreadsheets/d/1DpQTHxzmoiRsZAbVWEqD_FN9pUhOC_0cVLudeGFhjbk/edit?usp=sharing)
- A place to store and pull ideas for topics

<br />

# :computer: Running a Local Instance

### **1. Clone this repo**

### **2. cd into the repo and run:**

```bash
gem install jekyll bundler
bundle install
sh serve.sh
```

For livereload, in a separate terminal, run:

```
bundle exec guard
```

# :ballot_box: Submitting a Blog Post

### **1. Setup a local up-to-date copy of the repository:**
```
git clone https://github.com/OICR/softeng-blog.git
cd softeng-blog
```

**(or) Pull recent changes:**
```
cd softeng-blog
git checkout gh-pages
git pull
```

### **2. Branch from gh-pages and push your branch to github.**

- This will create a new branch for your blog post and sync it with github
- Branch name can be your firstname_topic (for example: alexis_argo), branches can be deleted after merge

```
git checkout -b <branch>
git push -u origin <branch>
```

### **3. Start adding content into your user directory inside `/_posts/`, user directories are in the form `firstname_lastname`, if you are unsure about your username, please refer to `/_data/authors.yml`.**

- To be properly indexed, markdown files must contain the specific header, and the file name should start with its date (e.g. `_posts/sam_lee/2021-06-06-starting-up-from-scratch.md`)
- For multiple authors simply list authors separated by ", "

```yml
---
layout: post
title:  "YOUR BLOG TITLE"
breadcrumb: true
author: firstname_lastname
date: 2023-03-15
categories: firstname_lastname
tags:
    - Software Engineering
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

- We are using `kramdown` markdown converter. You can find out more about it here [kramdown](http://kramdown.gettalong.org). We highly recommend going through its syntax documentation
to get yourself more familiar with the coding style.
- Images can be added as an absolute or a relative link. You can look at kramdown syntax documentation to find out about adding absolute links. For a relative link images you can upload them into your folder inside images directory `/images/firstname_lastname/image.png`
    -  To refer them inside your blog post, use the image url from the site config as `{{ site.urlimg }}` and append relative link of your image. `{{ site.urlimg }}/firstname_lastname/image.png`

### **4. Sync your new branch with Github**

- At regular interval, push your content to Github.

```
git commit -a -m "Describe your changes"
git push
```

### **5. Create a Pull Request**

Once your content is ready for review, create a pull request from your new branch towards gh-pages.

https://help.github.com/articles/creating-a-pull-request/

# :arrow_up: Updating blog content

- Blog data (projects, team members, positions, ...) are located in `/_data/`, please edit those files in your own branch and submit pull requests towards gh-pages.
