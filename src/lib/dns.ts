// Pure functions behind the DNS hunt demo. No DOM code here, so they're easy to
// unit test (see tests/dns.test.ts).

export const verdicts = ['normal', 'unwanted', 'suspicious'] as const;
export type Verdict = (typeof verdicts)[number];

export const verdictLabels: Record<Verdict, string> = {
  normal: 'Normal',
  unwanted: 'Telemetry or ads',
  suspicious: 'Suspicious',
};

export interface Lookup {
  id: string;
  domain: string;
  qtype: 'A' | 'AAAA' | 'TXT' | 'SRV' | 'HTTPS';
  device: string; // a device name, not an address
  count: number; // lookups in the last 24 hours
  result: string; // the answer, "NXDOMAIN" (doesn't exist) or "0.0.0.0 (blocked)"
  note?: string; // extra context an analyst would see, e.g. timing
  answer: {
    verdict: Verdict;
    why: string;
    next: string;
  };
}

/** Number of characters in the name. */
export function nameLength(domain: string): number {
  return domain.length;
}

/** Number of dot-separated parts ("labels"): a.b.example = 3. */
export function labelCount(domain: string): number {
  return domain.split('.').filter(Boolean).length;
}

/** The longest single label, which is where random or encoded data usually hides. */
export function longestLabel(domain: string): string {
  return domain
    .split('.')
    .reduce((best, label) => (label.length > best.length ? label : best), '');
}

/**
 * Shannon entropy in bits per character: how unpredictable the characters are.
 * "aaaa" = 0, an English word is about 2.5 to 3, random letters and digits climb toward 4+.
 */
export function entropy(text: string): number {
  if (!text) return 0;
  const counts = new Map<string, number>();
  for (const ch of text.toLowerCase()) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  let bits = 0;
  for (const n of counts.values()) {
    const p = n / text.length;
    bits -= p * Math.log2(p);
  }
  return Math.round(bits * 100) / 100;
}

/** Hunting leads: simple rules a hunter starts with. Each one is noisy on its own. */
export const leads = {
  long: { label: 'Long name (40+ characters)', test: (l: Lookup) => nameLength(l.domain) >= 40 },
  parts: { label: 'Many parts (6+)', test: (l: Lookup) => labelCount(l.domain) >= 6 },
  random: {
    label: 'Random-looking part',
    test: (l: Lookup) => {
      const label = longestLabel(l.domain);
      return label.length >= 10 && entropy(label) >= 3.4;
    },
  },
  failed: { label: "Name doesn't exist (NXDOMAIN)", test: (l: Lookup) => l.result === 'NXDOMAIN' },
  txt: { label: 'TXT records', test: (l: Lookup) => l.qtype === 'TXT' },
  volume: { label: 'Very frequent (100+ a day)', test: (l: Lookup) => l.count >= 100 },
} as const;

export type LeadKey = keyof typeof leads;
export const leadKeys = Object.keys(leads) as LeadKey[];

export function isLeadKey(value: unknown): value is LeadKey {
  return typeof value === 'string' && Object.hasOwn(leads, value);
}

/** Which leads a lookup trips. */
export function leadsFor(lookup: Lookup): LeadKey[] {
  return leadKeys.filter((k) => leads[k].test(lookup));
}

/** Lookups that trip ALL the chosen leads (no leads chosen = everything). */
export function filterLookups(lookups: Lookup[], active: LeadKey[]): Lookup[] {
  if (active.length === 0) return lookups;
  return lookups.filter((l) => active.every((k) => leads[k].test(l)));
}

export function isVerdict(value: unknown): value is Verdict {
  return typeof value === 'string' && (verdicts as readonly string[]).includes(value);
}

/** Score a set of answers: { lookup id: chosen verdict }. Unknown ids are ignored. */
export function score(lookups: Lookup[], answers: Record<string, Verdict>) {
  let answered = 0;
  let correct = 0;
  for (const l of lookups) {
    const choice = answers[l.id];
    if (!choice) continue;
    answered++;
    if (choice === l.answer.verdict) correct++;
  }
  return { answered, correct, total: lookups.length };
}
