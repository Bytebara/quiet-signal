import type { Evidence } from '../lib/evidence';

// Every skill must point to where it comes from. If you can't fill in `basis`
// honestly, the skill doesn't belong here yet.

export interface Skill {
  name: string;
  level: Extract<Evidence, 'applied' | 'explored' | 'learning'>;
  basis: string;
  /** Optional link to a project or page that shows the skill. */
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
    title: 'Security monitoring and log analysis',
    skills: [
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
        name: 'Building a home SOC lab',
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
