---
layout: post
title: OOM Is a Symptom, Not the Problem
description: Rerunning a failed performance test or adding agents will not fix a memory leak. A heap-analysis approach for telling capacity limits from object retention.
date: 2026-03-30 20:00:00 +0400
author: azmat
image: '/images/oom.webp'
tags: [Performance Testing, JVM, Debugging]
featured: false
toc: true
---

A performance test fails with `OutOfMemoryError`, and the reaction is almost always the same: rerun it. If it fails again, add agents. That instinct makes sense under delivery pressure, but it treats capacity as the problem when the problem is usually retention — and no amount of scaling fixes a leak.

One thing to settle first: which JVM ran out of memory? "Add agents" only makes sense if the load generator is the one failing, and a tool like JMeter can run out of memory on its own, for example by holding every response in a listener. Check whether the error is in the application under test or in the load generator. The rest of this post is about the application under test.

## The reactive loop

The pattern is familiar. OOM occurs, someone skims the logs, the test gets rerun, more agents get provisioned, and the failure comes back anyway. The loop repeats. It feels like progress because something is happening, but no diagnosis is taking place — just capacity being thrown at a problem capacity can't solve.

I have watched this loop cost far more than it looks like it should. Two failed executions, each rerun three times, four engineers pulled into the analysis: that is six reruns at roughly ninety minutes each, plus eight engineering-hours of discussion, plus the infrastructure cost of the extra agents. Easily seventeen hours spent without getting materially closer to the cause. The real cost was never compute — it was the insight the reruns kept deferring.

## Symptom vs. root cause

`OutOfMemoryError`, a JVM crash, slowness under load — these are what we see. What they actually mean is that objects are being retained, the garbage collector can't reclaim enough memory, and the heap keeps growing across GC cycles. OOM is a JVM safety mechanism firing correctly, not a random failure mode. Scaling increases capacity; it does nothing to a retention problem.

Under sustained load, retention shows up as heap usage that doesn't drop after GC cycles, memory trending upward across iterations, and — once you look — a Dominator Tree with large retained subtrees. The distinction that matters here is between **shallow heap** (the memory an object consumes by itself) and **retained heap** (the total memory that would be freed if that object were collected). Shallow heap tells you what an object costs. Retained heap tells you what it's actually holding hostage.

### Capacity or retention?

Retention is the usual cause, not the only one. Sometimes `-Xmx` really is too small for the workload. You can tell the two apart by looking at the heap right after full GCs, the floor the heap falls back to:

- **The floor stays flat across iterations**, and sits comfortably below the limit. The app is fine, and the failure was something else.
- **The floor stays flat but sits close to the limit.** This is a capacity problem. The live data set is simply too big for the heap you gave it.
- **The floor climbs with every iteration.** This is retention. More memory only delays the failure.

### Which OutOfMemoryError is it?

Not every OOM is a heap problem, and the message tells you where to look:

| What you see | What it usually means |
|---|---|
| `Java heap space` | Heap exhausted. The heap dump is the right tool. |
| `GC overhead limit exceeded` | The JVM is spending nearly all its time collecting and freeing almost nothing. Same family as heap space. |
| `Metaspace` | Too many classes loaded, often from repeated class loading or redeploys. A heap dump won't show it. |
| `Direct buffer memory` | Off-heap buffers, often from networking code. Not in the heap dump either. |
| No Java exception, process just disappears (container exit code 137 / `OOMKilled`) | The container's memory limit was hit and the OS killed the process. Check the limit against heap plus off-heap usage. |

The investigation below applies to the first two.

## A repeatable investigation

Instead of rerunning blind, the response I now follow is structured:

1. stop the rerun loop and preserve the logs and heap dump
2. check the memory growth trend
3. analyze the heap dump in Eclipse MAT — run the Leak Suspects report, inspect the Dominator Tree, sort by retained heap
4. identify the dominant retained object and the reference chain preventing GC
5. reproduce it in a controlled way — a single local run, a script, or manual execution against the app
6. if the fix holds, deploy and monitor; if not, go back to the memory trend and keep digging

The first step only works if a heap dump exists. Set the JVM up to write one before the next test, not after the failure:

```bash
# Write a heap dump automatically when the JVM runs out of memory
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps

# GC log, so you can see the post-GC heap floor over time (JDK 9+)
-Xlog:gc*:file=gc.log

# Or take a dump from a running process
jcmd <pid> GC.heap_dump /dumps/app.hprof
```

Make sure the dump path has room for a file about as large as the heap, and that it survives the container restarting.

When the Dominator Tree gets big, the culprit is usually one of a small set: an unbounded cache or map, a static collection that only grows, `ThreadLocal` values that outlive the request, or listeners and sessions that are registered but never removed. Follow the reference chain from the dominant object up to its GC root to see which one it is.

The difference this makes is the size of the feedback loop. What used to take repeated blind reruns now takes one controlled run and a heap dump.

## The new standard

Before I rerun a failed performance test now, I ask whether I've actually looked at the logs and the heap dump, whether this is capacity or retention (is the post-GC floor climbing?), and whether I can reproduce it locally before touching infrastructure. Diagnose first, scale later.

`OutOfMemoryError` isn't random. It's a signal that something is retaining memory incorrectly — and the fastest way through it has never been another rerun.
