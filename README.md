# azmat.devx — Field Notes

Personal engineering blog by Azmat Mungur: short engineering posts and monthly deep dives on performance, AI-augmented systems and production lessons. Live at https://azmatdevx.github.io.

Built with [Jekyll](https://jekyllrb.com/) on the Nomod theme (by Anvod Studio), customised with a custom brand layer, and hosted on GitHub Pages.

## Run locally

Requires Ruby and Bundler ([Jekyll install guide](https://jekyllrb.com/docs/installation/)).

```bash
bundle install                # first time, or after Gemfile changes
bundle exec jekyll serve      # http://localhost:4000, rebuilds on change
bundle exec jekyll build      # production build into _site/ (not committed)
```

## Write a post

Create `_posts/YYYY-MM-DD-slug.md`. The URL becomes `/slug`.

```yaml
---
layout: post
title: Post title
description: One sentence used on cards and in search results.
date: YYYY-MM-DD HH:MM:SS +0400
author: azmat          # must match `username` in _authors/
image: '/images/cover.png'
tags: [Performance, Personal Tech]
featured: false
toc: false             # true renders a table of contents
---

Post body in Markdown.
```

Put cover images in `images/` and reference them with a root-relative path. Tags are free-form; there is no tag registry to update.

## Where things live

| Path | Purpose |
| --- | --- |
| `_data/settings.yml` | Nav, hero copy, section toggles, social links, integrations |
| `_config.yml` | Site URL, collections, plugins |
| `_posts/`, `_pages/`, `_authors/` | Content |
| `_layouts/`, `_includes/` | Templates and partials |
| `_sass/` | Styles; `5-brand/_overrides.scss` is the custom skin |
| `js/` | Vanilla JS (lazy loading, tag filtering, search) |

## Deployment

GitHub Pages builds the site from `main`. Only GitHub Pages-supported plugins are used (`jekyll-sitemap`).
