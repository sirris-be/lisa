---
layout: page
title: Events
---

{% for event in site.events %}

### {{ event.title }}

**Date:** {{ event.date | date: "%B %d, %Y" }}  
**Location:** {{ event.location }}

{{ event.description }}

[Read more]({{ event.url }})

{% endfor %}
