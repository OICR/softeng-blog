---
layout: frontpage
header: 
    version: full
    title: Software Engineering Blog
    caption: We are OICR's passionate team of software engineers who build tools that help cancer researchers collaborate, work faster and take on more difficult challenges. This blog allows us to share information about or cutting-edge technology, groundbreaking tools and upcoming events.
    image: header-logo-crop.png
    page: front
    class: no-icon
    buttons:
        - title: Meet the Team
          link: "/team/"
        - title: Join the Team
          link: "/careers/"
permalink: /index.html
---

<div class="small-7 columns posts">
  {% for post in site.posts limit:3 %}
    <div class="row" >
      <div class="small-12 columns b30 blog_teaser">
        <span class="date-display">{{ post.date | date: "%b. %-d, %Y" }}</span>
        <h3 class="post-title"><a href="{{ site.url }}{{ post.url }}">{{ post.title }}</a></h3>
        {% if post.author %}<p class="post-author">By: <a href="#placeholder"><Strong>{{ post.author }}</strong></a></p>{% endif %}
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
            <p>
              {{ post.teaser.info | strip_html | escape }}
            </p>
          </div>
        {% endif %}
        <p class="post-link"><a href="{{ site.url }}{{ post.url }}" title="{{ site.data.language.read }} {{ post.title escape_once }}">Full Article &#187;</a></p>
      </div><!-- /.small-12.columns -->
    </div><!-- /.row -->
  {% endfor %}
  <div class="row">
    {% include _action_buttons.html link='blog' text='View Full Blog' button='right' %}
  </div>
</div>