---
layout: team
permalink: "/team/"
header: 
    version: small
    title: < Writing Code + Solving Problems + Eating Pizza; />
    image: header-logo-crop.png
    page: team
    icon: icon-pizza
---

<div class="authors clearfix">
  {% for author in site.data.authors %}
    <div class="small-4 columns">
      <div class="author row">
        <div class="small-12 columns">
          <div>
            <div class="small-3 columns" style="padding:0;">
              <img src="{% if author[1].avatar contains 'http' %}{{ author[1].avatar }}{% else %}{{site.urlimg}}avatars/{{author[1].avatar}} {% endif %}" title="{{ author[1].name }}"/>
            </div>
            <div class="small-9 columns">
              <p class="author-name">{{ author[1].name }}</p>
              <p class="author-position">{{author[1].position}}</p>
            </div>
          </div>
        </div>
        <div class="small-12 columns" class="author-info">
          <span>{{ author[1].info }}</span>
        </div>
        <div class="small-12 columns author-links">
          <div class="small-6 columns">
            <a class="author-blogs" href="{{ site.url }}/blog/category/{{ author[0] }}">Blog Posts »</a>
          </div>
          <div class="small-6 columns">
            <a class="author-github" href="https://github.com/{{ author[1].github }}"> {{ author[1].github }}</a>
          </div>
        </div>
      </div>
    </div>
  {% endfor %}
</div><!-- /.row -->

<div class="join-the-team row">
  <div class="small-1 columns">&nbsp;</div>
  <div class="small-10 columns label">
    <strong>Join the Team:</Strong> Check out the interesting opportunities we have to offer.
    {% include _action_buttons.html link='careers' text='Browse Careers' %}
  </div>
  <div class="small-1 columns">&nbsp;</div>
</div>
