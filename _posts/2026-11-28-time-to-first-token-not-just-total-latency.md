---
layout: post
title: "For AI apps, track time to first token, not just total latency"
date: 2026-11-28 00:30:00 +0400
author: azmat
image: '/images/first-token.webp'
description: "With streaming AI answers, users feel the wait before the first word, not the total response time. Track time to first token next to your p95 response time."
tags: [Performance, AI, Load Testing]
featured: false
toc: false
---

For years, p95 response time was the number I watched. If 95% of requests finished under the target, the release was healthy. Then I started testing apps that stream answers from a language model, and that number stopped telling me what users felt.

### Same p95, very different experience

Picture two versions of the same chat feature. Both have a p95 response time of 8 seconds. In version A, the first words appear after 0.6 seconds and the text flows from there. In version B, the screen stays blank for 7 seconds, then the whole answer lands at once.

On a latency dashboard, they look identical. To a user, A feels fast and B feels broken. A blank screen for seven seconds gets a refresh, a second click or a closed tab.

### What to measure instead

Start with what total time actually measures. For a model's answer, it depends heavily on how long the answer is. A longer, better answer takes longer to finish, so a high p95 can simply mean the model wrote more, not that anyone waited more.

So keep p95, but measure it on the right things. Put two numbers next to total response time:

- **Time to first token (TTFT):** how long until the first word appears. This is the wait users feel.
- **Tokens per second after that:** how smoothly the text flows. If it streams slower than people read, they notice the stutter.

### Why the first token gets slow

When time to first token climbs, the model itself is rarely the only cause. Look at everything that happens before it writes a word:

- **Queueing under load:** requests wait for a free slot, so the first token slips even when generation speed holds steady.
- **Work before the model starts:** retrieval, tool calls and safety checks all run before the first word can appear.
- **Long prompts:** the model reads the whole input before it answers, so a longer prompt means a later start.

### Set thresholds on what users feel

Put pass/fail thresholds on time to first token, not only on total time. In k6, the closest built-in signal is time to first byte. For a streaming endpoint it is a rough stand-in, because the first byte can be headers or an empty event rather than a word:

```javascript
import http from 'k6/http';
import { Trend } from 'k6/metrics';

const ttft = new Trend('ttft_ms', true);

export const options = {
  thresholds: { ttft_ms: ['p(95)<800'] }, // example target
};

export default function () {
  const res = http.post(
    __ENV.CHAT_URL,
    JSON.stringify({ prompt: 'Hello', stream: true }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  ttft.add(res.timings.waiting); // time to first byte: a rough proxy
}
```

For an exact number, you need a client that reads the stream and timestamps the first real token. That deserves a post of its own.

### The old skill still applies

The core of performance engineering has not changed: measure what the user experiences. What changed is the experience itself. With streaming, the first token is the new "page loaded".

*Next Field Note: load testing an agent, where one user request can trigger ten model calls.*
