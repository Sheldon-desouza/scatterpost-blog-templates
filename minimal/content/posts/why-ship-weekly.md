---
title: "Why we ship weekly, not monthly"
slug: "why-ship-weekly"
date: "2026-07-14T09:00:00.000Z"
description: "A smaller release cadence catches regressions earlier and keeps the backlog honest. Here is what changed when we moved from monthly to weekly."
tags: ["process", "product"]
scatterpostId: "sample-why-ship-weekly"
---

For most of last year we shipped once a month. It felt disciplined at
the time: a fixed cut-off, a changelog, a quiet week to catch our
breath. It was also slow, and slow cadences hide problems rather than
surfacing them.

## What monthly releases actually cost us

A bug introduced in week one was not seen by a user until week four,
sometimes later. By the time a report came in, nobody on the team
remembered the change that caused it. We spent entire days reconstructing
context that a same-week release would have kept fresh.

There was a second cost, less visible: a monthly release calendar
encourages batching. Small, low-risk changes queue up behind bigger
ones, waiting for "the next release" instead of going out the day they
are ready.

## The switch

We moved to weekly releases in March. The rule is simple: anything
merged to `main` by Thursday goes out on Friday morning, UK time. No
exceptions, no "let's hold this for next week".

```bash
git log --since="last friday" --oneline main
```

That one command became our release note generator. If a change is in
the log, it ships. If it is not ready, it is not merged, which turned
out to be a healthier line than "is it ready for the big release".

### Smaller batches, smaller blast radius

A regression now reaches a handful of users for a few days at most
before the next release can fix it, rather than a few weeks. Our
rollback rate went up slightly (we ship more, so more things need
fixing), but the average time a user spends with a broken feature went
down by more than half.

## What we would tell a smaller team

Start with a cadence you can actually hold for two months straight. A
weekly release you skip every third week teaches the team that the
deadline is soft, which is worse than a monthly one you never miss.

Three things made ours stick:

1. A release is a non-event: no ceremony, no sign-off meeting.
2. The changelog is written as we go, not reconstructed on Thursday.
3. Nothing is held back "to make a bigger release" ever again.

> The best release cadence is the fastest one your team can sustain
> without dreading Fridays.

If you are still on monthly, the honest test is whether you could ship
today's `main` branch right now, with no extra work. If the answer is
no, that gap is the real backlog, cadence is just what makes it visible.
