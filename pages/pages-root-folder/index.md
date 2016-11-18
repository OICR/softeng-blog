---
layout: frontpage
header: 
    version: full
    title: Software Engineering Blog
    caption: We are OICR's passionate team of software engineers, infrastructure specialists and bioinformaticians building tools to empower researchers in their endeavours to elucidate cancer. This blog allows us to share information about or cutting-edge technology, groundbreaking tools and upcoming events.
    image: header-logo-crop.png
    page: front
    class: no-icon
    buttons:
        - title: Meet the Team
          link: "team/"
        - title: Join the Team
          link: "careers/"
permalink: /index.html
---

<div class="large-8 columns posts">
  {% for post in site.posts limit:3 %}
  {% assign author = site.data.authors[post.author] %}
    <div class="row" >
      <div class="small-12 columns b30 blog_teaser">
        <span class="date-display"><strong>{{ post.date | date: "%b. %-d, %Y" }}</strong></span>
        <h3 class="post-title"><a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></h3>
        {% if author %}<p class="post-author">By: <a href="{{ site.baseurl }}/blog/category/{{ post.author }}"><strong>{{ author.name }}</strong></a></p>{% endif %}
        <div class="circles">
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
        </div>
        {% if post.tags.first %}
        <p class="post-tags">
          <i class="fa fa-tag" aria-hidden="true"></i>
          <span class="pr10">
            <strong>
              {% for tag in post.tags %}
                {{ tag }}
                {% unless forloop.last %}
                / 
                {% endunless %}
              {% endfor %}
            </strong>
          </span>
        </p>
        {% endif %}
        {% if post.teaser %}
          <div class="teaser">
            {% if post.teaser.image %}
            <img class="teaser-image" src="{{site.urlimg}}{{post.teaser.image}}" />
            {% endif %}
          {% if post.teaser.youtube %}
            <iframe width="560" height="315" src="https://www.youtube.com/embed/{{ post.teaser.youtube }}" frameborder="0" allowfullscreen></iframe>
          {% endif %}            
            <p>
              {{ post.teaser.info | strip_html | escape }}
            </p>
          </div>
        {% endif %}
        <p class="post-link"><a href="{{ site.baseurl }}{{ post.url }}" title="{{ site.data.language.read }} {{ post.title escape_once }}">Full Article &#187;</a></p>
      </div><!-- /.small-12.columns -->
    </div><!-- /.row -->
  {% endfor %}
  <div class="row">
    <div class="columns">
      {% include _action_buttons.html link='blog' text='View Full Blog' button='right' %}
    </div>
  </div>
</div>
