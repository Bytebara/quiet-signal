---
title: SOC alert triage dashboard
summary: An in-browser alert queue with filtering, MITRE ATT&CK mapping and a triage panel that explains each disposition. Runs on synthetic alerts.
status: simulated
order: 2
tags: [SIEM, alert triage, detection]
tools: [TypeScript, Astro, Vitest]
diagram: triage-flow
demo: /soc-lab/
---

## What it shows

A tier 1 analyst's day is mostly a queue: read the alert, decide whether it's real, decide what happens next, and write down why. This demo recreates that queue with eighteen synthetic alerts, written to resemble what Sysmon, Windows Security logging, a web proxy and an identity provider would produce.

Open the [SOC lab](/soc-lab/) to use it.

## Triage approach used for every alert

1. **What fired?** The rule name and the raw event that triggered it.
2. **Is it plausible?** Compare against what is normal for that host and user.
3. **What technique does it map to?** A MITRE ATT&CK technique gives a shared vocabulary for the behavior.
4. **Disposition.** True positive, benign true positive, false positive, or escalate.
5. **Next steps.** What a responder should do now, in order.

## How it's built

- The alerts live in one data file, `src/data/alerts.ts`. Every IP address comes from the ranges reserved for documentation (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) and every domain uses `example` names, so nothing points at a real system.
- Filtering and sorting are plain functions in `src/lib/alerts.ts`, covered by unit tests in `tests/alerts.test.ts`.
- The search box trims input, removes control characters and caps the length before it's used. Results are written into the page as text, never as HTML.

```ts
export function sanitizeQuery(raw: unknown, maxLength = 100): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, maxLength)
    .toLowerCase();
}
```

## Limits

The data is invented. The dispositions are written as teaching notes, not as output from a real detection engine. The value here is the triage reasoning, which is mine to explain in an interview.
