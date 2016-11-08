---
layout: projects
permalink: "/projects/"
header: 
    version: small
    title: Our Projects
    image: header-logo-crop.png
    page: team
    icon: icon-projects
---

<div class="authors projects clearfix">
  {% for project in site.data.projects %}
    <div class="small-4 columns">
      <div class="author project row">
        <div class="small-12 columns">
          <div>
            <div class="small-3 columns">
              <img src="{{project.icon}}" title="{{ project.name }}"/>
            </div>
            <div class="small-9 columns">
              <p class="author-name project-name">{{ project.name }}</p>
            </div>
          </div>
        </div>
        <div class="small-12 columns">
          <span class="author-info project-info">{{ project.info }}</span>
        </div>
        <div class="small-12 columns author-links project-links">
          <div class="small-6 columns">
            <a class="author-blogs project-blogs" href="{{ site.baseurl }}/blog/{{ author[1].name }}">Blog Posts »</a>
          </div>
          <div class="small-6 columns">
            <a class="author-github project-github" href="{{ project.url }}"><i class="fa fa-github"></i> github</a>
          </div>
        </div>
      </div>
    </div>
  {% endfor %}
</div><!-- /.row -->