// Pure functions behind the SOC lab dashboard. No DOM code here,
// which is what makes them easy to unit test (see tests/alerts.test.ts).

export const severities = ['critical', 'high', 'medium', 'low', 'informational'] as const;
export type Severity = (typeof severities)[number];

export const statuses = ['new', 'investigating', 'closed'] as const;
export type Status = (typeof statuses)[number];

export type Disposition = 'True positive' | 'Benign true positive' | 'False positive' | 'Escalate';

export interface Alert {
  id: string;
  time: string; // ISO 8601, UTC
  severity: Severity;
  status: Status;
  rule: string;
  source: string; // log source, e.g. "Sysmon"
  host: string;
  user: string;
  mitre: { id: string; name: string; tactic: string };
  raw: Record<string, string | number>;
  triage: {
    disposition: Disposition;
    reasoning: string;
    nextSteps: string[];
  };
}

export interface AlertFilter {
  severities?: Severity[];
  status?: Status | 'all';
  source?: string | 'all';
  query?: string;
}

const severityRank: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  informational: 4,
};

/** Clean free-text input before using it: strings only, no control characters, length-capped, lowercase. */
export function sanitizeQuery(raw: unknown, maxLength = 100): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, maxLength)
    .toLowerCase();
}

export function isSeverity(value: unknown): value is Severity {
  return typeof value === 'string' && (severities as readonly string[]).includes(value);
}

export function isStatus(value: unknown): value is Status {
  return typeof value === 'string' && (statuses as readonly string[]).includes(value);
}

/** Text the search box matches against: id, rule, host, user, source, technique and raw field values. */
function searchableText(alert: Alert): string {
  return [
    alert.id,
    alert.rule,
    alert.host,
    alert.user,
    alert.source,
    alert.mitre.id,
    alert.mitre.name,
    alert.mitre.tactic,
    ...Object.values(alert.raw).map(String),
  ]
    .join(' ')
    .toLowerCase();
}

export function filterAlerts(alerts: readonly Alert[], filter: AlertFilter = {}): Alert[] {
  const query = sanitizeQuery(filter.query ?? '');
  const sevs = (filter.severities ?? []).filter(isSeverity);
  const terms = query.split(/\s+/).filter(Boolean);

  return alerts.filter((alert) => {
    if (sevs.length > 0 && !sevs.includes(alert.severity)) return false;
    if (filter.status && filter.status !== 'all' && alert.status !== filter.status) return false;
    if (filter.source && filter.source !== 'all' && alert.source !== filter.source) return false;
    if (terms.length > 0) {
      const text = searchableText(alert);
      // Every word typed must appear somewhere in the alert.
      if (!terms.every((t) => text.includes(t))) return false;
    }
    return true;
  });
}

export type SortKey = 'severity' | 'newest' | 'oldest';

/** Returns a new sorted array; never mutates the input. Ties fall back to newest first. */
export function sortAlerts(alerts: readonly Alert[], key: SortKey = 'severity'): Alert[] {
  const byTime = (a: Alert, b: Alert) => Date.parse(b.time) - Date.parse(a.time);
  const copy = [...alerts];
  switch (key) {
    case 'newest':
      return copy.sort(byTime);
    case 'oldest':
      return copy.sort((a, b) => -byTime(a, b));
    default:
      return copy.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || byTime(a, b));
  }
}

export function countBySeverity(alerts: readonly Alert[]): Record<Severity, number> {
  const counts = Object.fromEntries(severities.map((s) => [s, 0])) as Record<Severity, number>;
  for (const a of alerts) counts[a.severity] += 1;
  return counts;
}

export function uniqueSources(alerts: readonly Alert[]): string[] {
  return [...new Set(alerts.map((a) => a.source))].sort();
}

/** Formats an ISO time as "2026-10-19 14:02 UTC" without depending on the visitor's locale. */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'invalid time';
  return `${d.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}
