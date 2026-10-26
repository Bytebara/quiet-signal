---
title: Python alert-enrichment script
summary: A command-line script that reads exported alerts, looks up file hashes, and writes a short triage summary for each one.
status: planned
order: 6
tags: [Python, automation, threat intelligence]
tools: [Python, VirusTotal API]
---

## Planned scope

- Read alerts from a JSON export.
- Look up each hash with the VirusTotal API, with the key read from an environment variable and never committed.
- Respect the API's rate limit and handle errors without crashing.
- Write a Markdown summary per alert.
- Include tests that run against saved sample responses, so they never call the real API.

This is the first Python project on the roadmap. Not started yet.
