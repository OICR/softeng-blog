---
layout: post
title:  "Adding support for multiple authors in Jekyll"
breadcrumb: true
author: francois_gerthoffert
date: 2016-12-09
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

Authors can be simply listed separated by ", ". Jekyll will build an array of authors and loop through them.

~~~yml
# One author:
author: francois_gerthoffert

# Multiple authors
author: francois_gerthoffert, jared_baker
~~~

## Listing authors

To identify authors, the system will [split](https://shopify.github.io/liquid/filters/split/) the author variable by ", " and place the result inside an array.

~~~
(% assign authors = post.author | split: ", " %)
<p class="post-author">By:
(% for currentAuthor in authors %)
  (% assign author = site.data.authors[currentAuthor] %)
  <a href="(( site.baseurl ))/blog/category/(( currentAuthor ))"><strong>(( author.name ))</strong></a>(% unless forloop.last %), (% endunless %)
(% endfor %)
</p>

# Note: replace () with {} in the code above, for it to be understood by Liquid
~~~

## Listing blog posts for a particular author

You might want to display a list of blog posts written by various authors, we performed this using the following logic. The category is used to identify the author's posts to be displayed, and we compare this value with author(s) listed in the blog post.

~~~
(% assign selectedAuthorId = page.category %)
(% for post in site.posts %)
  (% assign displayPost = false %)
  (% assign authors = post.author | split: ", " %)
  (% for currentAuthorId in authors %)
    (% if currentAuthorId == selectedAuthorId %)
      (% assign displayPost = true %)
    (% endif %)
  (% endfor %)
  (% if displayPost == true %)
  (% if displayPost == true %)
    # Logic to display post content
  (% endif %)
(% endfor %)  

# Note: replace () with {} in the code above, for it to be understood by Liquid
~~~

## Conclusion

This implementation is neither fancy nor optimized but is a simple and easy way of achieving our goal. Jekyll being statically built the actual logic does not necessarily need to be optimized considering that the only impact will be on build time which, for a blog, is not a critical component.
