---
layout: post
title: OOM Is a Symptom, Not the Problem
description: A structured approach to heap analysis in performance testing, with a focus on distinguishing capacity limits from true memory retention issues.
date: 2026-03-30 20:00:00 +0400
author: azmat
image: '/images/18.jpg'
random_images:
  - '/images/18.jpg'
  - '/images/17.jpg'
  - '/images/16.jpg'
  - '/images/15.jpg'
  - '/images/14.jpg'
  - '/images/13.jpg'
tags: [Performance Testing, JVM, Debugging]
featured: false
toc: true
---

## Session Outcomes

By the end of this session, you should be able to:

- distinguish between capacity issues and memory retention issues
- recognize memory retention patterns under load
- analyze a heap dump using Eclipse MAT
- identify dominant retained objects using the Dominator Tree
- validate memory fixes through structured reproduction

> OOM is not the problem. It is evidence.

## What Usually Happens When OOM Hits?

When performance tests fail with `OutOfMemoryError`, the reaction is usually predictable:

1. test execution fails
2. JMeter throws OOM
3. a heap dump is generated
4. the rerun starts immediately
5. more agents get added
6. the failure returns

This is understandable under delivery pressure, but it treats capacity instead of cause.

### The Reactive Loop

The pattern usually looks like this:

1. OOM occurs
2. someone checks logs quickly
3. the test is rerun
4. more agents are provisioned
5. OOM happens again
6. the loop restarts

The system feels active, but the diagnosis is still missing.

## The Cost of Reactive Reruns

Consider a simple scenario:

- 2 performance test executions
- each rerun 3 times
- additional test agents provisioned
- 4 engineers pulled into analysis discussions

The impact adds up fast:

- 6 total reruns
- roughly 1.5 hours per execution, or about 9 hours of execution time
- 4 engineers at about 2 hours each, or about 8 engineering hours
- extra infrastructure cost from more agents and compute

Operationally, that means:

- a longer performance test cycle
- delayed root cause identification
- higher delivery risk
- lower predictability when deadlines tighten

That is easily 17 or more hours spent without getting materially closer to the root cause.

> The real cost was not compute. It was delayed insight.

## Symptom vs Root Cause

### What We See

- `OutOfMemoryError`
- JVM crash
- slowness under load

### What It Actually Means

- objects are being retained
- the garbage collector cannot reclaim enough memory
- the heap keeps growing across GC cycles

OOM is a JVM safety mechanism, not a random failure mode.

> Scaling increases capacity. It does not eliminate memory retention.

## Recognizing a Retention Pattern

Under sustained load, retention often shows up as:

- heap usage not dropping after GC cycles
- memory trending upward across iterations
- a Dominator Tree showing large retained subtrees

One distinction matters here:

- **Shallow heap** is the memory consumed by the object itself
- **Retained heap** is the total memory that would be freed if that object were collected

Retained heap is what exposes the real impact.

## A Repeatable OOM Investigation Framework

When OOM occurs, the response should be structured:

1. stop blind reruns
2. preserve logs and the heap dump
3. check the memory growth trend
4. analyze the heap in Eclipse MAT
5. identify the dominant retained objects
6. reproduce and validate in a controlled way

The decision flow is simple:

1. observe the OOM
2. stop the rerun loop
3. preserve the evidence
4. inspect the memory trend
5. analyze the dump in Eclipse MAT
6. identify what retains memory
7. reproduce and validate
8. if the fix is confirmed, deploy and monitor
9. if not, return to the memory trend and continue the investigation

This turns chaos into a repeatable investigation.

## Applying the Framework

### Step 1: Inspect Logs

- confirm the memory exhaustion pattern
- identify repeated allocation behavior

### Step 2: Analyze the Heap Dump in Eclipse MAT

- run the Leak Suspects Report
- inspect the Dominator Tree
- sort by Retained Heap

### Step 3: Identify the Root Cause

Look for:

- the dominant retained object
- the reference chain preventing GC
- accumulation that only becomes obvious under load

### Step 4: Reproduce in a Controlled Way

- single local execution
- script-based validation
- manual execution in the application
- browser DevTools inspection where relevant

The result is a much smaller feedback loop. In the original flow, diagnosis was reduced to a single controlled run instead of repeated blind reruns.

## The New Standard

Before rerunning a failed performance test, ask:

- have we reviewed the logs?
- have we analyzed the heap dump?
- is this capacity or retention?
- can we reproduce it locally?
- have we validated the fix?

> Diagnose first. Scale later.

## Final Thought

`OutOfMemoryError` is not random. It is a signal that something is retaining memory incorrectly.

We do not react our way out of failures. We diagnose our way to clarity.
