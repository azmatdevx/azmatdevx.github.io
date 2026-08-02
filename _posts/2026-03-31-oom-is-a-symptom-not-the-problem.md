---
layout: post
title: OOM Is a Symptom, Not the Problem
description: Rerunning a failing performance test never fixes a memory leak. Here is the heap analysis framework I use to tell capacity limits apart from real retention issues.
date: 2026-03-30 20:00:00 +0400
author: azmat
image: '/images/oom.png'
# random_images:
#   - '/images/18.jpg'
#   - '/images/17.jpg'
#   - '/images/16.jpg'
#   - '/images/15.jpg'
#   - '/images/14.jpg'
#   - '/images/13.jpg'
tags: [Performance Testing, JVM, Debugging]
featured: false
toc: false
---

A performance test fails with `OutOfMemoryError`, and the reaction is almost always the same: rerun it. If it fails again, add agents. That instinct makes sense under delivery pressure, but it treats capacity as the problem when the problem is usually retention — and no amount of scaling fixes a leak.

## The reactive loop

The pattern is familiar. OOM occurs, someone skims the logs, the test gets rerun, more agents get provisioned, and the failure comes back anyway. The loop repeats. It feels like progress because something is happening, but no diagnosis is taking place — just capacity being thrown at a problem capacity can't solve.

I have watched this loop cost far more than it looks like it should. Two failed executions, each rerun three times, four engineers pulled into the analysis: that is six reruns at roughly ninety minutes each, plus eight engineering-hours of discussion, plus the infrastructure cost of the extra agents. Easily seventeen hours spent without getting materially closer to the cause. The real cost was never compute — it was the insight the reruns kept deferring.

## Symptom vs. root cause

`OutOfMemoryError`, a JVM crash, slowness under load — these are what we see. What they actually mean is that objects are being retained, the garbage collector can't reclaim enough memory, and the heap keeps growing across GC cycles. OOM is a JVM safety mechanism firing correctly, not a random failure mode. Scaling increases capacity; it does nothing to a retention problem.

Under sustained load, retention shows up as heap usage that doesn't drop after GC cycles, memory trending upward across iterations, and — once you look — a Dominator Tree with large retained subtrees. The distinction that matters here is between **shallow heap** (the memory an object consumes by itself) and **retained heap** (the total memory that would be freed if that object were collected). Shallow heap tells you what an object costs. Retained heap tells you what it's actually holding hostage.

## A repeatable investigation

Instead of rerunning blind, the response I now follow is structured:

1. stop the rerun loop and preserve the logs and heap dump
2. check the memory growth trend
3. analyze the heap dump in Eclipse MAT — run the Leak Suspects report, inspect the Dominator Tree, sort by retained heap
4. identify the dominant retained object and the reference chain preventing GC
5. reproduce it in a controlled way — a single local run, a script, or manual execution against the app
6. if the fix holds, deploy and monitor; if not, go back to the memory trend and keep digging

The difference this makes is the size of the feedback loop. What used to take repeated blind reruns now takes one controlled run and a heap dump.

## The new standard

Before I rerun a failed performance test now, I ask whether I've actually looked at the logs and the heap dump, whether this is capacity or retention, and whether I can reproduce it locally before touching infrastructure. Diagnose first, scale later.

`OutOfMemoryError` isn't random. It's a signal that something is retaining memory incorrectly — and the fastest way through it has never been another rerun.
