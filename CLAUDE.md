# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Jekyll static site (personal engineering blog at azmat.devx / azmatdevx.github.io), built on the **Nomod** Jekyll theme and customized with a "performance engineering and AI engineering" brand. Deployed via GitHub Pages. There is no JS build step, no package.json, no test suite — content is Markdown, styling is Sass, and interactivity is a couple of hand-written vanilla-JS files.

## Commands

```bash
bundle install                  # install Ruby deps (first time / after Gemfile changes)
bundle exec jekyll serve        # local dev server with live rebuild, http://localhost:4000
bundle exec jekyll build        # production build into _site/
```

Ruby gems in use: `jekyll` (4.4.1), `jekyll-paginate`, `jekyll-sitemap`. No linter, formatter, or test runner is configured — verify changes by building and eyeballing the rendered `_site/` output or the local server.

`_site/` is build output and is git-ignored — never commit it.

## Architecture

**Content → Layout → Include → Sass** is the flow for every page:

- **Collections** (`_config.yml`): `posts` (permalink `/:slug`), `pages` (permalink `/:name`, source in `_pages/`, *not* the Jekyll-default root-level pages), `authors` (output: false, used only for lookup data). Front-matter `layout` defaults are set per-collection in `_config.yml` (`defaults:` block) rather than per-file.
- **Layouts** (`_layouts/`): `default.html` is the shell every layout extends via `layout: default` — it renders `head.html`, the ambient background decoration (`.site-geo`, skipped on the homepage), `header.html`, `{{ content }}`, the subscribe section, and `footer.html`. `post.html`, `page.html`, `author.html`, `about.html`, `contact.html` build on top of it.
- **Includes** (`_includes/`): reusable partials for header/footer, article cards (`article.html` / `article-panel.html`), site sections (`section-hero`, `section-about`, `section-posts`, `section-featured-posts`, `section-authors`, `section-recommended`, `section-subscribe`), search, pagination, TOC, share buttons, Disqus/GA integration. `_includes/main.scss` is the Sass entry point (not a partial — it's `@import`ed as a whole and compiled by Jekyll's Sass processor per `_config.yml`'s `sass:` config).
- **Site-wide copy/config lives in data, not layouts**: `_data/settings.yml` drives nearly everything visible — nav items, hero copy, section enable/disable toggles, footer/social links, Mailchimp/Disqus/GA identifiers, contact form config. Prefer editing `_data/settings.yml` over hardcoding text in includes/layouts.
- **Authors**: `_authors/*.md` holds per-author bio/social data, keyed by `username` (e.g. `azmat`), matched against a post's `author:` front-matter field. The collection has `output: false` in `_config.yml`, so no individual author pages are generated — it's purely a data lookup, even though an `author.html` layout exists for that purpose.

### Sass structure (ITCSS-like layering, `_sass/`, entry point `_includes/main.scss`)

Import order matters — later layers override earlier ones:

1. `0-settings/` — variables, color-scheme (light/dark custom properties), mixins, helpers, Font Awesome
2. `1-tools/` — normalize, reset, shared utilities, syntax highlighting, grid, animate
3. `2-base/` — base element styles
4. `3-modules/` — one file per UI module (header, search, pagination, footer, gallery, hero, article, contact, sections, buttons, etc.)
5. `4-layouts/` — page-type-specific styles (post, authors, tags-page, about-page)
6. `5-brand/` (`_overrides.scss`, `_reading.scss`) — imported **last**; this is where the custom brand skin sits on top of the stock Nomod theme. Prefer adding brand/visual customizations here (or a new module explicitly imported at the end) rather than editing early-layer partials, to keep the "theme vs. custom brand" boundary clear.

When adding a new Sass partial, remember it must be explicitly `@import`ed in `_includes/main.scss` — Jekyll's Sass compiler does not auto-glob `_sass/`.

### Posts

New posts go in `_posts/` as `YYYY-MM-DD-slug.md` with front matter:
```yaml
layout: post
title: ...
description: ...
date: YYYY-MM-DD HH:MM:SS +0400
author: azmat        # must match a slug in _authors/
image: '/images/name.webp'   # 1600x380 banner; also needs name-thumb.webp (800x600) for cards
social_image: '/images/name-social.png'   # optional: og:image/JSON-LD override if a platform won't render WebP
tags: [Tag One, Tag Two]
featured: false
toc: false            # true renders a table of contents via _includes/toc.html
```
Tags are freeform strings (rendered/slugified on the fly for the `/tags/` page and post filtering) — no central tag registry to update. `random_images` (commented out in existing posts) lets a post's cover image rotate between multiple images via the lazy-load JS.

### Client-side JS

No bundler/framework — two plain files loaded on every page (`js/scripts.js`, `js/common.js`) handling things like lazy image loading, tag-based post filtering on `/blog/` and `/tags/`, search, and scroll/animation triggers. Edit them directly; no build step to run afterward.

### Images

`images/` at repo root holds all site imagery (post covers, profile photo, logos). Covers are WebP, no JPG: `name.webp` (1600x380 banner, post header) plus `name-thumb.webp` (800x600, 4:3, cards). Old `.jpg` covers (with `-thumb.jpg`) still work until replaced. Reference with root-relative paths (`/images/name.webp`), same convention `_data/settings.yml` and post front matter already use.

## Design system

Colours, theme switch and logo are implemented. Fonts and the 720px column are not yet. Never add blue, gradients or shadows.

**Themes:** light (sage) is the default; dark (graphite) is a toggle.

```css
:root, [data-theme="light"] {
  --bg:#ecf0eb; --bg-raised:#f8faf7; --ink:#121613; --muted:#566259;
  --accent:#e5481c; --accent-ink:#121613; --line:#d0d8cf;
  --link:#bf3a12; --link-hover:#8f2a0b;
}
[data-theme="dark"] {
  --bg:#0f1012; --bg-raised:#17181b; --ink:#f2f3f5; --muted:#9aa0aa;
  --accent:#ff6b3d; --accent-ink:#0f1012; --line:#26282d;
  --link:#ff8a63; --link-hover:#ffb59d;
}
```

**Colour rules**
- Accent coral is for large text (24px or more), shapes and the logo only. Never for small text.
- Links use `--link` and `--link-hover`, always underlined in article text. Never use the bare accent for links.
- No gradients, shadows or emoji. No blue anywhere: remove the old blue `#2B66FF` and any blue-based tokens (`--g-*`).
- Text contrast 4.5:1 or better in both themes.
- The theme toggle must persist (localStorage) and respect `prefers-color-scheme` when nothing is stored.

**Fonts**
- Inter for everything: titles ExtraBold 800 with about -2% letter spacing, body Regular/Medium. JetBrains Mono for code.
- OPEN DECISION: if Everett is kept, use Everett Medium for the site name and headings instead of Inter ExtraBold. Ask before removing Everett.
- Self-host as variable woff2 with `font-display: swap`; preload only the one or two files used above the fold. Remove unused font files and weights.
- No layout shift from fonts (size-adjusted fallback), no render-blocking font CSS.

**Logo**
- `azmat-logo-coral.png` on light, `azmat-logo-coral-dark.png` on dark, about 40px tall.
- Both files are in `images/` (747x605, transparent, coral mark only, no wordmark). Not wired into the header yet: `_includes/header.html` still uses `HeaderLogo.svg`.

**Layout**
- Reading column about 720px; body text never below 17px; code blocks scroll inside their box.
- Keep pages light. Run `bundle exec jekyll build` after style changes and check the output.

**Where things live**
- Tokens (`--bg`, `--bg-raised`, `--ink`, `--muted`, `--accent`, `--accent-ink`, `--line`, `--link`, `--link-hover`): `_sass/0-settings/_color-scheme.scss`. Light is `:root`; dark is `[data-theme="dark"]`. The older semantic variables (`--text-color`, `--border-color`, `--primary-color` and so on) are aliases of these tokens. Use the tokens in new CSS.
- Theme: an inline script in `_includes/head.html` sets `data-theme` before first paint (saved choice, else OS preference, else light). The switch is `.theme-switch` (`role="switch"`) in `_includes/header.html`; logic in `js/common.js` (`applyTheme()`, stores `theme` in localStorage); styles in `_sass/3-modules/_header.scss`.
- Logo: `images/azmat-logo-coral.png` (light) and `azmat-logo-coral-dark.png` (dark), both in `_includes/header.html`, shown per theme in `_header.scss`. `images/HeaderLogo.svg/png` are the old blue logo and are unused.
- Fonts: still Everett (3 woff2 files in `fonts/`, declared in `_sass/5-brand/_overrides.scss`; `--display` in `_color-scheme.scss`). Inter / JetBrains Mono are not adopted yet; this is the open decision above.
- Reading column: posts keep 1200px (cover capped to match), About uses 720px; set in `_sass/5-brand/_reading.scss`. Body text is 17px.
