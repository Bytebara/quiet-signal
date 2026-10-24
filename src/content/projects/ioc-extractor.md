---
title: IOC extractor and defanger
summary: Paste a report or email and get the IP addresses, domains, URLs and file hashes pulled out, validated and defanged for safe sharing.
status: planned
order: 4
tags: [threat intelligence, IOC, defensive tooling]
tools: [TypeScript]
---

## Planned scope

- Extract IPv4 addresses, domains, URLs and MD5/SHA-1/SHA-256 hashes from pasted text.
- Validate each one (an IP's octets are 0–255, a hash has the right length and characters).
- Defang for sharing: `example[.]com`, `hxxps://`.
- Run entirely in the browser with no external lookups, so nothing pasted leaves the page.

Not built yet.
