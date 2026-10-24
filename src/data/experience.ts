// Professional experience. Written fresh rather than copied from the resume.
// Years only (no months) to keep the public record minimal.

export interface Role {
  title: string;
  org: string;
  years: string;
  summary: string;
  highlights: string[];
  /** How this work carries over to a security operations role. */
  carriesOver: string;
}

export const roles: Role[] = [
  {
    title: 'Consultant Agent',
    org: 'Geek Squad, Best Buy',
    years: '2026 to present',
    summary: 'Front-line technical support for customer computers, phones and other devices.',
    highlights: [
      'Diagnose hardware and software faults, then recommend and explain a fix the customer can act on.',
      'Run repair intake end to end: service labels, device condition and records that hold up at handoff.',
      'Bring harder cases to teammates and work them through together.',
      'Keep a high in-store productivity average by handling each interaction efficiently.',
    ],
    carriesOver:
      'Intake records are tickets by another name, and a busy service desk is a queue to triage. Both habits apply directly to working an alert queue.',
  },
  {
    title: 'Sales Floor Associate',
    org: 'Dollar Tree',
    years: '2021 to 2023',
    summary: 'Customer service, transactions and store upkeep.',
    highlights: [
      'Processed cash and card transactions accurately at the register.',
      'Listened for what customers actually needed and resolved issues on the spot.',
      'Kept stock and displays organized.',
    ],
    carriesOver: 'Accuracy under routine pressure, and following procedure every time, not most of the time.',
  },
  {
    title: 'Brand Ambassador',
    org: 'Essence Med',
    years: '2020 to 2021',
    summary: 'Public outreach at community events.',
    highlights: [
      'Represented the brand at community events and explained its services to the public.',
      'Gathered customer feedback and reported it back to support service improvements.',
    ],
    carriesOver: 'Collecting information from people clearly and reporting it in a usable form.',
  },
];
