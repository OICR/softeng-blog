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
              <img src="{{site.urlimg}}avatars/{{author[1].avatar}}.svg" title="{{ author[1].name }}"/>
            </div>
            <div class="small-9 columns">
              <p class="author-name">{{ author[1].name }}</p>
              <p class="author-position">{{author[1].position}}</p>
            </div>
          </div>
        </div>
        <div class="small-12 columns">
          <span class="author-info">{{ author[1].info }}</span>
        </div>
        <div class="small-12 columns author-links">
          <div class="small-6 columns">
            <a class="author-blogs" href="{{ site.url }}/blog/{{ author[1].name }}">Blog Posts »</a>
          </div>
          <div class="small-6 columns">
            <a class="author-github" href="https://github.com/{{ author[1].github }}"> github</a>
          </div>
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