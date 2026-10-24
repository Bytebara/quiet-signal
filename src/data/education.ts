// Education. The degree's status is a single setting so it can't be overstated by accident.
//
// degreeStatus:
//   'unconfirmed' - shows the program and dates only, with no claim either way
//   'in-progress' - shows "In progress" (current setting, confirmed October 2026)
//   'completed'   - shows "Completed" and the conferral year. Only set this once the degree is conferred.

export type DegreeStatus = 'unconfirmed' | 'in-progress' | 'completed';

export const degree = {
  credential: 'Associate of Science in Cybersecurity',
  school: 'Westchester Community College',
  years: '2024 to present',
  degreeStatus: 'in-progress' as DegreeStatus,
  conferredYear: null as string | null,
  notes: [
    'Hands-on programming projects as part of the coursework.',
    'Team-based project work focused on open-source hardware.',
    'Recognized by instructors for problem-solving and analytical thinking on cybersecurity assignments.',
  ],
  nextStep: 'Next: planning to pursue a B.S. in Machine Learning and Cybersecurity.',
};

export function degreeStatusLabel(status: DegreeStatus, conferredYear: string | null): string | null {
  switch (status) {
    case 'completed':
      return conferredYear ? `Completed ${conferredYear}` : 'Completed';
    case 'in-progress':
      return 'In progress';
    default:
      return null;
  }
}
