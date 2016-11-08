---
layout: category
title: Sample Category
permalink: /blog/category/
header: 
    version: small
    title: Software Engineering Blog
    image: header-logo-crop.png
    page: team
    icon: icon-blog
---

<h3>All Authors</h3>
<ul class="no-bullet">
  {% for author in site.data.authors %}
    <li>
      <a href="{{ site.baseurl }}/blog/category/{{author[0]}}">{{author[1].name}}</a>
    </li>
  {% endfor %}
</ul>