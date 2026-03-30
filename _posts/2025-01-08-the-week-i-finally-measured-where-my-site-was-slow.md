---
layout: post
title: The Week I Finally Measured Where My Site Was Slow
description: I stopped guessing, profiled the obvious bottlenecks, and learned that most of my performance work had been aimed at the wrong layer.
date: 2025-01-08 09:00:00 +0400
author: azmat
image: '/images/04.jpg'
tags: [Performance, Personal Tech]
featured: true
toc: true
---

I had been describing one of my side projects as "mostly fast" for months, which really meant I had never measured it properly. Pages felt acceptable on my laptop, deploys were clean, and synthetic checks looked fine until I opened the site over a weaker connection and watched the delays stack up.

The first useful change was embarrassingly small: I stopped treating the browser waterfall like an afterthought. Once I looked at the actual request sequence, the problem stopped being vague. The page was not slow because of one giant failure. It was slow because I had accumulated several medium-sized costs that all landed before the interface felt stable.

## What I measured first

I started with three things:

- time to first byte on uncached requests
- image weight on the home page
- render-blocking CSS and font requests

That short list was enough. I did not need a giant observability rollout to learn something useful. I needed a tight feedback loop and the discipline to compare before and after changes.

## What turned out to matter

The backend was not innocent, but it also was not the main villain. The bigger problem was that my front end was asking the browser to do too much work before showing anything convincing. A heavy hero image, blocking assets, and a few careless content decisions produced a page that felt slower than its raw server timing suggested.

Once I compressed the largest images, removed a couple of non-essential assets from the critical path, and simplified the above-the-fold layout, the site felt different immediately. The best part was that these changes were easier to ship than the backend optimizations I had assumed would save me.

## The lesson I kept

I now treat performance work as measurement first, optimization second. If I cannot show where time is being spent, I am probably optimizing for the story I want to tell myself rather than the system I actually have.

That sounds obvious, but it is surprisingly easy to skip when a project is small and familiar. Personal projects are exactly where sloppy assumptions survive the longest.
