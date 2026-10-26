---
title: Home security lab
summary: A hardened Raspberry Pi sensor feeding Splunk. SSH and firewall hardening, CrowdSec, Pi-hole DNS filtering with encrypted lookups, VPN access and this site served through a tunnel.
status: in-progress
order: 0
tags: [Linux hardening, SIEM, DNS security, detection]
tools: [Raspberry Pi, Splunk, CrowdSec, Pi-hole, Tailscale, Cloudflare Tunnel, Bash]
---

## What it is

A small security operations setup running in my home. A Raspberry Pi 5 is the sensor: hardened, reachable from the internet only through an outbound tunnel, and filtering DNS for my devices. Everything it logs goes to Splunk on a separate Ubuntu PC, where I search, build dashboards and hunt.

The scripts and Splunk configuration are public: [github.com/Bytebara/home-soc-lab](https://github.com/Bytebara/home-soc-lab).

## What's running

- **Hardening:** key-only SSH, a default-deny host firewall, automatic security updates, and services that run without root and listen only where they need to.
- **Intrusion prevention:** CrowdSec detects SSH brute force and blocks the source address in the firewall.
- **DNS security:** Pi-hole blocks ads, trackers and known-bad domains; its own lookups leave the house encrypted (DNS over TLS to Quad9).
- **Remote access:** a Tailscale VPN with one SSH key per device, so a lost phone can be cut off on its own.
- **Publishing:** this site is served from the Pi through a Cloudflare Tunnel, with no ports open on the router, and strict security headers.
- **SIEM:** Splunk with field extractions for SSH, sudo, firewall, CrowdSec, web and DNS logs, saved searches and a dashboard.

## Investigations so far

- **Blocked traffic from inside the network.** Firewall blocks on port 80 traced to a smart TV doing device discovery. Closed as benign; moving it to a separate network is next.
- **A DNS hunt.** The longest and rarest names in my DNS logs turned out to be a game's telemetry going to a cloud log service. No malware; explaining each name was the work. The [DNS hunt](/dns-hunt/) demo is modeled on it.

## Next

Network segmentation and containerized services in the lab, then AWS: identity and access management, secure network design, cloud logging and threat detection, and infrastructure as code.
