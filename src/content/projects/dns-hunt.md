---
title: DNS threat hunt
summary: An in-browser DNS hunting exercise. Simple hunting leads, an investigation panel and a verdict for each name, on synthetic Pi-hole-style data.
status: simulated
order: 3
tags: [threat hunting, DNS, detection]
tools: [TypeScript, Astro, Vitest]
demo: /dns-hunt/
---

## What it shows

DNS is one of the most useful logs a defender has: almost every program looks up a name before it connects anywhere. This demo gives a day of lookups from a made-up home network and asks the visitor to hunt through them the way an analyst would: start from simple leads, investigate each name, decide whether it's normal, unwanted (telemetry or ads) or suspicious, and say why.

Open the [DNS hunt](/dns-hunt/) to try it.

## Where the idea came from

My home lab runs Pi-hole on a Raspberry Pi and sends every lookup to Splunk. Hunting through a real day of my own logs, the long and rare names turned out to be a game's telemetry going to a cloud log service, a tracking endpoint, a voice server lookup and Windows looking for a domain controller. None were malicious, and explaining them was the work. This demo recreates that situation with invented data, and adds the attack patterns a hunt is meant to catch: generated domains, DNS tunneling, beaconing and a look-alike phishing domain.

## Hunting leads

| Lead | Rule | Catches | Also catches |
|---|---|---|---|
| Long name | 40+ characters | encoded data | cloud log services |
| Many parts | 6+ labels | tunneling | Windows service lookups |
| Random-looking part | longest label 10+ characters with entropy of 3.4+ bits per character | generated domains | content-network server IDs |
| NXDOMAIN | the name doesn't exist | generated domains | Windows suffix and proxy lookups |
| TXT records | text answers | tunneling | (rare at home) |
| Very frequent | 100+ a day | beacons | smart TV telemetry |

Every lead has at least one harmless hit in the data, on purpose. A test enforces it, because the lesson is that no single rule is a detection; several signs lining up on one device is.

## How it's built

- The lookups live in `src/data/dns.ts`. Every domain ends in `.example` or `.test` and every address is from the documentation ranges; tests check both.
- Length, label count, entropy, the leads and scoring are plain functions in `src/lib/dns.ts`, covered by `tests/dns.test.ts`.
- The table is rendered at build time and readable without JavaScript. The script only adds filtering, the panel and the score, and writes everything as text, never as HTML.

```ts
export function entropy(text: string): number {
  if (!text) return 0;
  const counts = new Map<string, number>();
  for (const ch of text.toLowerCase()) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  let bits = 0;
  for (const n of counts.values()) {
    const p = n / text.length;
    bits -= p * Math.log2(p);
  }
  return Math.round(bits * 100) / 100;
}
```

## Limits

The data is invented and small: sixteen names with their story already decided. Real hunting has thousands of names, no answer key, and needs a baseline of what's normal for each device. The verdicts are teaching notes, not output from a detection engine.
