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
          {% assign authorsCount = post.authors | size %}
          {% assign authorCount = post.author | size %}
          <p class="post-author">
          {% if authorsCount > 0 %}            
              <strong>Posted By:
              {% for currentAuthor in post.authors %}
                {% assign author = site.data.authors[currentAuthor] %}
                <a href="{{ site.baseurl }}/blog/category/{{ currentAuthor }}">{{ author.name }}</a>{% unless forloop.last %}, {% endunless %}
              {% endfor %}
              on {{ post.date | date:'%b. %d, %Y' }}
              </strong>
          {% else if authorCount > 0 %}
            {% assign author = site.data.authors[post.author] %}
            <strong>Posted By: <a href="{{site.baseurl}}/blog/category/{{post.author}}">{{ author.name }}</a> on {{ post.date | date:'%b. %d, %Y' }}</strong>
          {% endif %}
          </p>        
          <h4 class="post-title">
            <a href="{{ post.url }}">{{ post.title }}</a>
          </h4>
        </li>
    </ul>
  </div>
{% endfor %}
