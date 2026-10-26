import type { Evidence } from '../lib/evidence';

// Every skill must point to where it comes from. If you can't fill in `basis`
// honestly, the skill doesn't belong here yet.

export interface Skill {
  name: string;
  level: Extract<Evidence, 'applied' | 'explored' | 'learning' | 'planned'>;
  basis: string;
  /** Optional link to a project or page that shows the skill (site path, or a full https:// URL). */
  link?: string;
}

export interface SkillGroup {
  title: string;
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Operating systems and IT troubleshooting',
    skills: [
      {
        name: 'Hardware and software troubleshooting',
        level: 'applied',
        basis: 'Daily work diagnosing customer devices in a retail technical support role.',
        link: '/experience/',
      },
      {
        name: 'Operating system support',
        level: 'applied',
        basis: 'Resolving OS-level issues on customer devices; covered in coursework.',
        link: '/experience/',
      },
      {
        name: 'Repair intake and device documentation',
        level: 'applied',
        basis: 'Creating service labels and keeping device records accurate for handoff.',
        link: '/experience/',
      },
    ],
  },
  {
    title: 'Linux and network security',
    skills: [
      {
        name: 'Linux hardening',
        level: 'explored',
        basis: 'Raspberry Pi sensor in my home lab: key-only SSH, host firewall (ufw), automatic security updates, least-privilege services.',
        link: '/projects/home-security-lab/',
      },
      {
        name: 'Intrusion prevention with CrowdSec',
        level: 'explored',
        basis: 'Detects SSH brute force on the Pi and blocks the source in the firewall; tested with a simulated attack.',
        link: '/projects/home-security-lab/',
      },
      {
        name: 'DNS security',
        level: 'explored',
        basis: 'Pi-hole filtering ads, trackers and known-bad domains for my devices, with encrypted upstream lookups (DNS over TLS).',
        link: '/projects/home-security-lab/',
      },
      {
        name: 'Secure remote access: SSH keys and VPN',
        level: 'explored',
        basis: 'Per-device SSH keys and a Tailscale VPN to reach the lab from anywhere, with no ports open on the router.',
        link: '/projects/home-security-lab/',
      },
      {
        name: 'Publishing without open ports',
        level: 'explored',
        basis: 'This site is served from the Pi through a Cloudflare Tunnel, with security headers set in Caddy.',
        link: '/projects/home-security-lab/',
      },
      {
        name: 'Network segmentation',
        level: 'planned',
        basis: 'Next in the lab: separating untrusted devices (like a smart TV) from the rest of the network.',
      },
      {
        name: 'Containerized services',
        level: 'planned',
        basis: 'Next in the lab: running services in containers and securing them.',
      },
    ],
  },
  {
    title: 'Cloud security',
    skills: [
      {
        name: 'AWS identity and access management (IAM)',
        level: 'planned',
        basis: 'Next after the home lab: least-privilege roles and policies, and auditing who can do what.',
      },
      {
        name: 'Secure cloud network design',
        level: 'planned',
        basis: 'Next: VPCs, subnets and security groups designed so only what is needed is reachable.',
      },
      {
        name: 'Cloud logging and threat detection',
        level: 'planned',
        basis: 'Next: CloudTrail and GuardDuty, with cloud logs sent to the same Splunk I use at home.',
      },
      {
        name: 'Infrastructure as code',
        level: 'planned',
        basis: 'Next: building cloud environments from code so security settings are repeatable and reviewable.',
      },
    ],
  },
  {
    title: 'Security monitoring and log analysis',
    skills: [
      {
        name: 'SIEM with Splunk',
        level: 'explored',
        basis: 'Splunk receiving my lab’s logs: index, field extractions, saved searches and a dashboard I built and use.',
        link: '/projects/home-security-lab/',
      },
      {
        name: 'Threat hunting in DNS logs',
        level: 'explored',
        basis: 'Hunted my own Pi-hole logs in Splunk for long and rare domains and explained each one; the DNS hunt demo is based on it.',
        link: '/dns-hunt/',
      },
      {
        name: 'SIEM and XDR with Wazuh',
        level: 'explored',
        basis: 'Hands-on in a personal SOC automation lab. Write-up not published yet.',
        link: '/projects/soc-automation-lab/',
      },
      {
        name: 'Windows endpoint telemetry with Sysmon',
        level: 'explored',
        basis: 'Used as the event source in the same lab.',
        link: '/projects/soc-automation-lab/',
      },
      {
        name: 'Alert triage and log reading',
        level: 'learning',
        basis: 'Practiced through guided labs and the simulated dashboard on this site.',
        link: '/soc-lab/',
      },
    ],
  },
  {
    title: 'Incident response and threat intelligence',
    skills: [
      {
        name: 'Case management with TheHive',
        level: 'explored',
        basis: 'Receiving alerts as cases in the SOC automation lab.',
        link: '/projects/soc-automation-lab/',
      },
      {
        name: 'Indicator enrichment with the VirusTotal API',
        level: 'explored',
        basis: 'Hash lookups as an automated step in the lab workflow.',
        link: '/projects/soc-automation-lab/',
      },
      {
        name: 'MITRE ATT&CK technique mapping',
        level: 'learning',
        basis: 'Applied to the synthetic alerts in the SOC lab demo.',
        link: '/soc-lab/',
      },
    ],
  },
  {
    title: 'Programming and scripting',
    skills: [
      {
        name: 'Programming fundamentals',
        level: 'applied',
        basis: 'Hands-on programming projects in college coursework.',
        link: '/education/',
      },
      {
        name: 'Security automation with Shuffle (SOAR)',
        level: 'explored',
        basis: 'Workflow connecting Wazuh alerts, VirusTotal and TheHive in the lab.',
        link: '/projects/soc-automation-lab/',
      },
      {
        name: 'Python scripting for defensive tooling',
        level: 'learning',
        basis: 'Studying now; first planned project is an alert-enrichment script.',
        link: '/projects/alert-enrichment-script/',
      },
    ],
  },
  {
    title: 'Security tools and lab environments',
    skills: [
      {
        name: 'TryHackMe guided labs',
        level: 'explored',
        basis: 'Working through hands-on security rooms.',
      },
      {
        name: 'SOC automation lab',
        level: 'explored',
        basis: 'Wazuh, TheHive, Shuffle and Sysmon wired together.',
        link: '/projects/soc-automation-lab/',
      },
    ],
  },
  {
    title: 'Working with people',
    skills: [
      {
        name: 'Explaining technical issues to non-technical people',
        level: 'applied',
        basis: 'Every customer interaction in technical support and retail roles.',
        link: '/experience/',
      },
      {
        name: 'Technical writing and research',
        level: 'applied',
        basis: 'Service documentation at work; written assignments in coursework.',
      },
      {
        name: 'Team troubleshooting',
        level: 'applied',
        basis: 'Working harder repairs through with teammates; team-based college projects.',
      },
    ],
  },
];
