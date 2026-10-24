---
title: Brute force followed by a successful logon
summary: Walking through alert QS-1004 from the SOC lab demo, from the failed logons to the account that got in and what to do next.
status: simulated
kind: investigation
tags: [Windows, authentication, T1110]
date: 2026-10
---

This walkthrough uses the synthetic alert **QS-1004** in the [SOC lab](/soc-lab/). The environment, hosts and accounts are invented.

## What fired

A rule watching Windows Security logs saw 46 failed logons (event ID 4625) against one account in about five minutes, followed by a successful network logon (event ID 4624, logon type 3) from the same source address.

## Why it matters more than plain failures

Failed logons alone are common: mistyped passwords, stale saved credentials, scanners. A burst of failures that **ends in a success** from the same source suggests the guessing worked.

## Questions to answer

1. Is the source address internal or external, and is it expected to reach this host?
2. Is the account a real user, a service account, or a default like `administrator`?
3. What did the session do after the 4624? Look for new processes, new services and outbound connections from the host.

## Disposition

**Escalate as a likely true positive.** Treat the account as compromised until shown otherwise.

## Next steps

1. Disable or reset the account and end its sessions.
2. Block the source address at the perimeter.
3. Review the host's activity from the successful logon onward.
4. Check whether the same source tried other accounts.

## Detection idea

```yaml
title: Many failed logons followed by success from one source
logsource:
  product: windows
  service: security
detection:
  failures:
    EventID: 4625
  success:
    EventID: 4624
  condition: failures | count() by IpAddress > 20 followed by success within 10m
level: high
```

This is pseudo-Sigma: standard Sigma can't express "followed by" in one rule, so a real deployment would use correlation rules or the SIEM's own sequence logic.

## Lesson

The success is the signal; the failures are the context.
