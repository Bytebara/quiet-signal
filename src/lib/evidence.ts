// The evidence labels used across the site. Every skill, project and write-up
// carries exactly one of these, so a reader always knows how much weight a claim has.

export const evidenceLevels = {
  applied: {
    label: 'Applied',
    meaning: 'Used in a job or completed coursework.',
  },
  completed: {
    label: 'Completed',
    meaning: 'Finished and documented, with evidence on this site.',
  },
  'in-progress': {
    label: 'In progress',
    meaning: 'Actively being built or written up.',
  },
  explored: {
    label: 'Explored',
    meaning: 'Set up or worked through hands-on, not yet documented as a finished project.',
  },
  learning: {
    label: 'Learning',
    meaning: 'Currently studying; not yet used in real work.',
  },
  planned: {
    label: 'Planned',
    meaning: 'On the roadmap; nothing to show yet.',
  },
  simulated: {
    label: 'Simulated',
    meaning: 'Runs on synthetic data created for demonstration. Not from a real environment.',
  },
} as const;

export type Evidence = keyof typeof evidenceLevels;

export function isEvidence(value: unknown): value is Evidence {
  return typeof value === 'string' && value in evidenceLevels;
}
