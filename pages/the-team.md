---
layout: team
permalink: "/team/"
---

<div class="authors clearfix">
  {% for author in site.data.authors %}
    <div class="small-4 columns"> 
      <div class="author row">
        <div class="small-12 columns">
          <div>
            <div class="small-3 columns">
              <img src="{{site.urlimg}}avatars/{{author.avatar}}.svg" title="{{ author.name }}"/>
            </div>
            <div class="small-9 columns">
              <p class="author-name">{{ author.name }}</p>
              <p class="author-position">{{author.position}}</p>
            </div>
          </div>
        </div>
        <div class="small-12 columns">
          <span class="author-info">{{ author.info }}</span>
        </div>
        <div class="small-12 columns author-links">
          <a class="author-blogs" href="{{ site.url }}/blog/{{ author.name }}">Blog Posts »</a>
          <a class="author-github" href="https://github.com/blog/{{ author.github }}"> Github </a>
        </div>
      </div>
    </div>
  {% endfor %}
</div><!-- /.row -->

<div class="join-the-team row">
  <div class="small-1 columns">&nbsp;</div>
  <div class="small-10 columns label">
    <strong>Join the Team:</Strong> Check out the interesting oppertunities we have to offer.
    {% include _action_buttons.html link='careers' text='Browse Careers' %}
  </div>
  <div class="small-1 columns">&nbsp;</div>
</div>