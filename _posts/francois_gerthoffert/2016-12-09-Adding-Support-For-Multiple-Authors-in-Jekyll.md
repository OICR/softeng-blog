---
layout: post
title:  "Adding support for multiple authors in Jekyll"
breadcrumb: true
author: francois_gerthoffert
date: 2016-12-08
categories: francois_gerthoffert
tags:
    - Blog
    - Jekyll
    - Github
teaser:
    info: OICR being a research institute, a portion of the team, in particular those of us more on the science side, is used to Academic Publishing and its related conventions such as Academic Authorship. It was not long before we were asked for supporting multiple authors in a blog post.
    image: francois_gerthoffert/jekyll-logo.png

---

OICR being a research institute, a portion of the team, in particular those of us more on the science side, is used to [Academic Publishing](https://en.wikipedia.org/wiki/Academic_publishing) and its related conventions such as [Academic Authorship](https://en.wikipedia.org/wiki/Academic_authorship). It was not long before we were asked for supporting multiple authors in a blog post.

This blog post will detail the solution we implemented to add this feature into our Jekyll implementation of the blog hosted on [GitHub Pages](https://pages.github.com/).

## jekyll & Liquid

The blog is built on [jekyll](http://jekyllrb.com/), which uses [Liquid](https://shopify.github.io/liquid/) for its template engine. Liquid provides basic operators, types and a set of filters to implement logic into templates.

## Declaring authors in a blog post

There was multiple options to declare authors in a blog post, I was initially looking at having different types for the 'author' variable, and then depending of the type, implement a different logic to display authors.

~~~yml
# One author:
author: francois_gerthoffert

# Multiple authors
author:
   - francois_gerthoffert
   - jared_baker
~~~

Sadly Liquid did not allow type checking, so our solution used a simpler approach, using different variable names when having one or having multiple authors

~~~yml
# One author:
author: francois_gerthoffert

# Multiple authors
authors:
   - francois_gerthoffert
   - jared_baker
~~~

## Listing authors

To list authors, the system will first count the size of the "author" and "authors" variable declared in the blog post, returning 0 if the variable does not exists or is empty.

~~~
(% assign authorsCount = post.authors | size %)
(% assign authorCount = post.author | size %)
(% if authorsCount > 0 %)
 <p class="post-author">By:
 (% for currentAuthor in post.authors %)
    (% assign author = site.data.authors[currentAuthor] %)
    <a href="{{ site.baseurl }}/blog/category/{{ currentAuthor }}"><strong>{{ author.name }}</strong></a>(% unless forloop.last %), (% endunless %)
 (% endfor %)
 </p>
(% else if authorCount > 0 %)
 (% assign author = site.data.authors[post.author] %)
 <p class="post-author">By: <a href="{{site.baseurl}}/blog/category/{{post.author}}"><strong>{{ author.name }}</strong></a></p>
(% endif %)

# Note: replace () with {} in the code above, for it to be understood by Liquid
~~~

## Listing blog posts for a particular author

You might want to display a list of blog posts written by various authors, we performed this using the following logic. The category is used to identify the author's posts to be displayed, and we compare this value with author(s) listed in the blog post.

~~~
(% assign selectedAuthorId = page.category %)
(% for post in site.posts %)
   (% assign displayPost = false %)
   (% assign authorsCount = post.authors | size %)
   (% assign authorCount = post.author | size %)
   (% if authorsCount > 0 %)
      (% for currentAuthorId in post.authors %)
         (% if currentAuthorId == selectedAuthorId %)
            (% assign displayPost = true %)
         (% endif %)
      (% endfor %)
   (% else if authorCount > 0 %)
      (% if post.author == selectedAuthorId %)
         (% assign displayPost = true %)
      (% endif %)
   (% endif %)
   (% if displayPost == true %)
      # Logic to display post content
   (% endif %)
(% endfor %)  

# Note: replace () with {} in the code above, for it to be understood by Liquid
~~~

## Conclusion

This implementation is neither fancy nor optimized but is a simple and easy way of achieving our goal. Jekyll being statically built the actual logic does not necessarily need to be optimized considering that the only impact will be on build time which, for a blog, is not a critical component.
