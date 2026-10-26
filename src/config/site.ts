// Site-wide settings. Everything public about "who runs this site" lives here,
// so the privacy audit only has one place to look.

export const site = {
  name: 'Quiet Signal',
  role: 'Security operations, detection and automation',
  description:
    'Portfolio of an entry-level security operations candidate: skills, experience, education and hands-on lab work, with every claim labeled by evidence.',
  // Deliberately no email, phone, location, or social links.
  colophon:
    'Built with Astro as a static site. No cookies, analytics, trackers or forms.',
  // Leave as null. Only after you add an approved, PII-reviewed file to public/
  // set this to its file name, e.g. 'resume.pdf'. See README > "Adding a resume download".
  resumeFile: null as string | null,
};

export const nav = [
  { href: '/', label: 'Overview' },
  { href: '/skills/', label: 'Skills' },
  { href: '/projects/', label: 'Projects' },
  { href: '/soc-lab/', label: 'SOC lab' },
  { href: '/research/', label: 'Research' },
  { href: '/experience/', label: 'Experience' },
  { href: '/education/', label: 'Education' },
];

/** Prefix an internal path with the deployment base (needed on GitHub Pages project sites). */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
