---
name: blog-post
description: Write or edit a post for Azmat Mungur's Jekyll blog (performance engineering for the AI and agentic era). Use for any new post, draft, rewrite or pre-publish check in this repo.
---

# Blog post (Jekyll)

Author: Azmat Mungur, lead and performance engineer. Topic area: performance engineering for the AI and agentic era (latency, throughput, cost, observability, load testing, tail latency, capacity). Voice: first person, plain, precise, no hype. The existing posts are short field notes about something he measured, broke or changed; match that tone.

## Before writing

1. Read `_templates/post.md`, `README.md` ("Write a post") and 2 or 3 files in `_posts/` (for example `2026-03-31-oom-is-a-symptom-not-the-problem.md`). Copy their format; do not invent a new one.
2. Read CLAUDE.md (design system and performance rules) and obey it.
3. Ask Azmat only for what you cannot know: the claim he wants to make, his real measurements, environment details, and any constraints. Never invent benchmarks, numbers, quotes, tool versions or results. If a number is missing, leave a visible `TODO(azmat): ...` and list every TODO at the end.
4. Never mention his employer, its customers, internal systems or any confidential data. Use generic descriptions ("a multi-tenant SaaS platform") or public/synthetic examples. (The home page names the employer; posts must not.)

## Create the file

- Run `scripts/new-post.sh "Post title"`. It writes `_posts/YYYY-MM-DD-slug.md` from the template with today's date and the `+0400` offset. The URL becomes `/slug`.
- There is no `_drafts/` folder. The file in `_posts/` is the draft until he merges; do not publish, commit or push unless he asks. If he does ask, use a new branch and a pull request, never `main`.

## Front matter (exactly these keys, in this order)

```yaml
---
layout: post
title: ...
description: ...
date: YYYY-MM-DD HH:MM:SS +0400
author: azmat
image: '/images/slug.webp'
tags: [Performance, Personal Tech]
featured: false
---
```

- `title`: states a claim or the lesson, not a bare topic ("OOM Is a Symptom, Not the Problem"). Quote it if it contains a colon.
- `description`: one full sentence, 160 characters or fewer, with the key number when there is one. Used on cards, search and social previews.
- `tags`: 2 to 4, **Title Case**, reuse existing tags exactly as written before creating a new one. Current tags: Personal Tech (on most posts), Performance, Performance Testing, Debugging, JVM, Tooling, Architecture, Engineering, Delivery, Jekyll. Check `_posts/` for any added since.
- `featured`: `false` unless he says otherwise. `toc`: omit it (auto TOC at 500+ words and 3+ H2s); set `toc: true` or `false` only to force it.
- Leave out `random_images`; it is not used.

## Cover image

- Each post needs two WebP files in `images/`: `slug.webp` (1600x380 banner, post header) and `slug-thumb.webp` (800x600, 4:3, cards); no JPG. The README has the macOS `sips` commands.
- Do not invent a cover. If he has not supplied one, list it as a `TODO(azmat)`.

## Structure

Pick the shape that fits the post and drop sections that do not apply.

- **Reflective or process posts** (most existing ones, 250 to 650 words): the template shape. An opening paragraph (what happened and why it matters), then `## What I saw`, `## What I changed`, `## What I'd do differently`, or similar first-person headings like the existing posts use.
- **Measurement posts** (new work, usually 700 to 1,400 words):
  1. **Hook** (2 to 3 sentences): the claim and the most striking number. No "In this post we will".
  2. **Context**: the system, who it matters to, why the usual metric misleads (for example averages hiding p99).
  3. **Method**: environment, workload model, tools and versions, number of runs, what was held constant. Enough to repeat it.
  4. **Results**: a table or chart first, then 2 to 4 sentences of reading. Every number has a unit and a comparison (before vs after, p50 vs p99, cost per 1,000 requests).
  5. **What it means**: interpretation and trade-offs. Say what you are not sure about.
  6. **What to do**: 3 or fewer concrete actions.
  7. **Limits**: what the test did not cover.
  8. **Takeaway**: one sentence the reader can repeat.

Short paragraphs, one idea per section. Headings `##` and `###` only (the title is the page `h1`).

## Writing rules

- State claims with evidence; separate measurement from opinion and label opinion as such.
- Prefer the concrete word: "p99 latency rose from 180 ms to 640 ms", not "latency got much worse".
- Define a term once on first use. Spell out acronyms once.
- Percentiles and rates: always say the window and sample size.
- No hype words, no emoji, no filler openings, no "game-changer".
- Where AI or agents are involved, be specific: model, token counts, tool-call counts, concurrency, cost.
- Internal links go to earlier posts by their `/slug` URL. External links only to primary sources (docs, papers, vendor pages). Check every link exists before finishing.

## Code, tables and images

- No existing post uses code blocks or tables yet. When one is needed: fenced block with a language tag, lines under 80 characters so they do not wrap on a phone, only what matters, plus the command that produced the output. Code blocks get a copy button automatically (`js/code-copy.js`) and scroll inside their box.
- Tables: header row, units in headers, right-align numbers.
- Charts: export as static SVG or PNG into `images/`; `alt` text that states the finding; `width` and `height` set to avoid layout shift; `loading="lazy"` below the fold; compressed. They must read on dark and light backgrounds (the site is dark-only today; the sage/graphite design system in CLAUDE.md is the target): transparent or neutral background, ink-coloured text, one accent for the series that matters, direct labels instead of colour alone.
- Never hot-link images or fonts from other sites.

## Before finishing

1. Run `bundle exec jekyll build` and fix errors and warnings.
2. Check the generated page (or `bundle exec jekyll serve`): front matter renders, the card and the post cover show, no broken links or images, code blocks do not overflow, reading time and TOC look right.
3. Re-read every number against the source he gave you. List any claim not backed by his data.
4. Reply with: the file path, a two-line summary of the post, the list of `TODO(azmat)` items (including a missing cover), and the **social handoff**: one headline claim (8 words or fewer), up to three key numbers, and the one chart or table worth turning into a carousel slide, so he can take it to the content skill in Claude.

## Never

- Never invent data, quotes, benchmarks or sources.
- Never name the employer or expose internal details.
- Never change the wording, URL or date of a published post unless he asks; propose title or description changes as a list instead.
- Never change the design system or CSS while writing a post; report the need instead.
