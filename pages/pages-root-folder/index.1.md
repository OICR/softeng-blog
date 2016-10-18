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

<div class="small-7 columns">
  <div class="posts">
    <div class="post">
      <span> {{ post.date | date: '%b. %d, %Y' }}</span>
    </div>
  </div>
  {% for post in site.posts limit:3 %}
   
  {% endfor %}
</div>
<div class="small-5 columns">
  {% include _blog_sidebar.html %}
</div>
