---
layout: post
title: The Architecture Decisions I Write Down Now
description: I do not document every idea, but I have learned to capture the choices that become expensive once the context fades.
date: 2025-03-28 20:00:00 +0400
author: azmat
image: '/images/18.jpg'
tags: [Architecture, Personal Tech]
featured: false
toc: true
---

The architecture decisions I regret most were rarely dramatic. They were the quiet choices that seemed obvious at the time and confusing six weeks later. Why did I split this service? Why did I avoid that dependency? Why is the queue configured this way?

I now write down decisions when they have one of three properties:

- the tradeoff was real
- reversing it later would be annoying
- someone, including future me, will absolutely ask why

## What goes into the note

I keep the format simple:

1. the decision
2. the alternatives I considered
3. the reason I chose this path
4. what would cause me to revisit it

That is usually enough. The point is not documentation theater. The point is preserving judgment while the context is still fresh.

## Why this matters on personal projects too

It is easy to assume lightweight projects do not need this kind of discipline. I have found the opposite. Personal projects often have the worst context retention because nobody else is asking for clarity, which means unclear decisions can survive unchallenged for months.

Writing decisions down creates a small amount of accountability. More importantly, it shortens the time required to re-enter a project after a gap. That alone makes the habit worthwhile.
