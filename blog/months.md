---
layout: months
title: Sample Category
permalink: /archive
header:
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    page: team
    icon: icon-blog
---

{% for post in site.posts %}
  {% assign currentdate = post.date | date: "%Y %B" %}
  {% assign currentmonth = post.date | date: "%B" %}
  {% assign currentyear = post.date | date: "%Y" %}
  {% assign author = site.data.authors[post.author] %}

  {% if currentdate != date %}
### {{currentmonth}} {{currentyear}}

    {% assign date = currentdate %}
    {% assign year = currentyear %}
  {% endif %}
  <div class="results">
    <ul class="no-bullet months-list">
        <li class="blog_teaser">
          {% assign authors = post.author | split: ", " %}
          <p class="post-author"><strong>Posted by:
          {% for currentAuthorId in authors %}
            {% assign author = site.data.authors[currentAuthorId] %}
            <a href="{{ site.baseurl }}/blog/category/{{ currentAuthorId }}">{{ author.name }}</a>{% unless forloop.last %}, {% endunless %}
          {% endfor %}
          on {{ post.date | date:'%b. %d, %Y' }}
          </strong>          
          </p>        
          <h4 class="post-title">
            <a href="{{ post.url }}">{{ post.title }}</a>
          </h4>
        </li>
    </ul>
  </div>
{% endfor %}
