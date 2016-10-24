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
<ul>
  {% for author in site.data.authors %}
    <li>{{author[1].name}}</li>
  {% endfor %}
</ul>