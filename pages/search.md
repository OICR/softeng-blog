---
layout: search
title: "Search"
permalink: /search
output: true
header: 
    version: small
    title: Search Results
    image: header-logo-crop.png
    page: team
    icon: icon-search-results
---

<div class="small-7 columns posts">
  <div class="results">
    <ul class="no-bullet" id="search-results">
      
    </ul>
  </div>
</div>

<script>
  function addslashes(string) {
    return (string + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  }

  window.posts = {
    {% for post in site.posts %}
      "{{ post.url | slugify }}": {
        "title": "{{ post.title | xml_escape }}",
        "author": "{{ site.data.authors[post.author].name | xml_escape }}",
        "author_link" : "{{ post.author }}",
        "teaser": "{{ post.teaser.info  | xml_escape}}",
        "date": "{{ post.date | date:'%b. %d, %Y' }}",
        "url": "{{ post.url | xml_escape }}"
      }
      {% unless forloop.last %},{% endunless %}
    {% endfor %}
  };
</script>


