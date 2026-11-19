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

1. Create a draft from the template:

   ```bash
   scripts/new-post.sh "My post title"
   ```

   This writes `_posts/YYYY-MM-DD-my-post-title.md` from [`_templates/post.md`](_templates/post.md). The URL becomes `/my-post-title`. (You can also copy the template by hand.)

2. Fill in the front matter:

   ```yaml
   ---
   layout: post
   title: Post title
   description: One sentence (under 160 characters) for cards, search and social previews.
   date: YYYY-MM-DD HH:MM:SS +0400
   author: azmat          # must match `username` in _authors/
   image: '/images/slug.jpg'
   tags: [Performance, Personal Tech]
   featured: false
   toc: true              # optional: true/false forces the table of contents; omit for auto (500+ words and 3+ H2s)
   ---
   ```

3. Add the cover image as two files in `images/`: `slug.jpg` (1200×675) and `slug-thumb.jpg` (640×360), both 16:9 JPEGs. Cards use the thumbnail, the post page uses the large one. On macOS:

   ```bash
   sips -s format jpeg -s formatOptions 70 -Z 1200 cover.png --out images/slug.jpg
   sips -s format jpeg -s formatOptions 72 -Z 640  cover.png --out images/slug-thumb.jpg
   ```

4. Write the body in Markdown. Use `##` for sections (the post title is the H1). Fenced code blocks get a Copy button automatically.

5. Preview with `bundle exec jekyll serve`, then open a pull request. Merging to `main` publishes.

Tags are free-form; there is no tag registry to update.

### Checklist before publishing

- Title and description read well on their own (they become the search and social preview).
- Cover image has both sizes and is under about 350 KB.
- Tags are consistent with existing ones (see `/tags/`).
- No secrets, internal URLs or employer details.

## Analytics

Analytics use [GoatCounter](https://www.goatcounter.com/) (no cookies, no personal data) and are **off until you set an ID**. Create a free site, then put its code in `_data/settings.yml`:

```yaml
analytics:
  goatcounter_code: yourcode   # yourcode.goatcounter.com
```

The script only renders in production builds, so `jekyll serve` never reports visits.

## Where things live

| Path | Purpose |
| --- | --- |
| `_data/settings.yml` | Nav, hero copy, section toggles, social links, integrations |
| `_config.yml` | Site URL, collections, plugins |
| `_posts/`, `_pages/`, `_authors/` | Content |
| `_templates/`, `scripts/` | Post template and the `new-post.sh` helper |
| `_layouts/`, `_includes/` | Templates and partials |
| `_sass/` | Styles. `0-settings/_tokens.scss` holds the design tokens (light and dark) |
| `js/` | Vanilla JS (lazy loading, tag filtering, search) |

## Design system

The look follows the **Azmat Engineering Design System** (see its Blog page): light theme by default with a dark toggle (remembered in `localStorage`, set on `<html data-theme>` before first paint), Everett Medium for headings, Inter for text, JetBrains Mono for code (all self-hosted in `fonts/`), a 720px reading column, underlined links in articles, borders instead of shadows, and one accent per screen. To change colours or type, edit `_sass/0-settings/_tokens.scss` and keep it in step with the design system's `tokens.json`.

There are no decorative animations, pills or gradients. Keep it that way: tags are plain text, and motion is limited to colour and opacity transitions that switch off under `prefers-reduced-motion`.

## Deployment

GitHub Pages builds the site from `main`. Only GitHub Pages-supported plugins are used (`jekyll-sitemap`).
