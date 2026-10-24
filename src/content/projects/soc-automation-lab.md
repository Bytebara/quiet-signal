---
title: SOC automation lab
summary: A home lab wiring Sysmon telemetry into Wazuh, with Shuffle enriching alerts through VirusTotal and opening cases in TheHive.
status: explored
order: 1
tags: [SIEM, SOAR, incident response, threat intelligence]
tools: [Wazuh, Sysmon, Shuffle, TheHive, VirusTotal API]
diagram: soc-automation
---

## What this lab is for

A small SOC needs four things to work together: telemetry from endpoints, a place where that telemetry turns into alerts, automation that does the repetitive first look, and a case system where a person picks up the work. This lab puts one open-source tool in each of those seats so the whole path from event to case can be followed and tested.

## Status, plainly

I have explored this setup hands-on. It is **not yet a finished, documented project**: there are no screenshots, detection results or measured outcomes published here, and none will be until they come from the lab itself. The section below lists exactly what the finished write-up will contain.

## How the pieces connect

1. **Sysmon** runs on a Windows endpoint and records detailed process, network and file events.
2. The **Wazuh agent** ships those events to the **Wazuh manager**, where rules decide which events become alerts.
3. A matching alert is sent by webhook to **Shuffle**, the automation platform.
4. Shuffle pulls the file hash out of the alert and asks the **VirusTotal API** how many engines flag it.
5. Shuffle opens a case in **TheHive** with the alert, the enrichment result and the affected host, so an analyst starts with context instead of a raw event.

## What the finished write-up will include

- The lab topology and the exact versions used.
- The Wazuh rule that fires, with the Sysmon event it matches.
- The Shuffle workflow, with secrets removed.
- A test run end to end, using a harmless test file rather than real malware.
- Screenshots with hostnames, IP addresses and usernames redacted.
- What broke, how it was fixed, and what I'd change.

## Safety notes for anyone copying this

- Keep the VirusTotal API key in Shuffle's secret store, never in a workflow export or a screenshot.
- Hash lookups share the hash with a third party. Fine for lab test files; think twice before doing it with files from a real organization.
- Test detections with benign stand-ins such as the EICAR test file, not live samples.
