import { describe, expect, it } from 'vitest';
import { alerts } from '../src/data/alerts';
import {
  countBySeverity,
  filterAlerts,
  formatTime,
  sanitizeQuery,
  severities,
  sortAlerts,
  statuses,
  uniqueSources,
} from '../src/lib/alerts';

describe('sanitizeQuery', () => {
  it('trims, lowercases and removes control characters', () => {
    expect(sanitizeQuery('  WS-ACCT\u0000-07\n ')).toBe('ws-acct-07');
  });
  it('caps the length', () => {
    expect(sanitizeQuery('a'.repeat(500))).toHaveLength(100);
  });
  it('returns an empty string for non-strings', () => {
    expect(sanitizeQuery(undefined)).toBe('');
    expect(sanitizeQuery(42)).toBe('');
    expect(sanitizeQuery({ toString: () => 'x' })).toBe('');
  });
  it('leaves markup as plain text (it is never rendered as HTML)', () => {
    expect(sanitizeQuery('<img src=x onerror=alert(1)>')).toBe('<img src=x onerror=alert(1)>');
  });
});

describe('filterAlerts', () => {
  it('returns everything with no filter', () => {
    expect(filterAlerts(alerts)).toHaveLength(alerts.length);
  });
  it('filters by one or more severities', () => {
    const crit = filterAlerts(alerts, { severities: ['critical'] });
    expect(crit.length).toBeGreaterThan(0);
    expect(crit.every((a) => a.severity === 'critical')).toBe(true);
    const two = filterAlerts(alerts, { severities: ['critical', 'high'] });
    expect(two.length).toBeGreaterThan(crit.length);
  });
  it('ignores invalid severity values instead of failing', () => {
    expect(filterAlerts(alerts, { severities: ['bogus' as never] })).toHaveLength(alerts.length);
  });
  it('filters by status and source', () => {
    const closed = filterAlerts(alerts, { status: 'closed' });
    expect(closed.every((a) => a.status === 'closed')).toBe(true);
    const sysmon = filterAlerts(alerts, { source: 'Sysmon' });
    expect(sysmon.every((a) => a.source === 'Sysmon')).toBe(true);
  });
  it('searches rule, host, user, technique and raw fields', () => {
    expect(filterAlerts(alerts, { query: 'T1110.001' }).map((a) => a.id)).toEqual(['QS-1004']);
    expect(filterAlerts(alerts, { query: '203.0.113.45' }).map((a) => a.id)).toEqual(['QS-1004']);
    expect(filterAlerts(alerts, { query: 'ws-acct-07' }).map((a) => a.id).sort()).toEqual(['QS-1001', 'QS-1008']);
  });
  it('requires every search word to match', () => {
    expect(filterAlerts(alerts, { query: 'powershell ws-it-03' }).map((a) => a.id)).toEqual(['QS-1017']);
  });
  it('returns nothing (not an error) for a search with no match', () => {
    expect(filterAlerts(alerts, { query: 'no such thing anywhere' })).toEqual([]);
  });
});

describe('sortAlerts', () => {
  it('sorts by severity, most severe first', () => {
    const order = sortAlerts(alerts).map((a) => severities.indexOf(a.severity));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
  it('sorts by time both ways', () => {
    const newest = sortAlerts(alerts, 'newest').map((a) => Date.parse(a.time));
    expect(newest).toEqual([...newest].sort((a, b) => b - a));
    const oldest = sortAlerts(alerts, 'oldest').map((a) => Date.parse(a.time));
    expect(oldest).toEqual([...oldest].sort((a, b) => a - b));
  });
  it('does not change the original array', () => {
    const before = alerts.map((a) => a.id);
    sortAlerts(alerts, 'oldest');
    expect(alerts.map((a) => a.id)).toEqual(before);
  });
});

describe('helpers', () => {
  it('counts every alert exactly once', () => {
    const counts = countBySeverity(alerts);
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(alerts.length);
  });
  it('lists unique sources', () => {
    expect(uniqueSources(alerts)).toEqual([...new Set(alerts.map((a) => a.source))].sort());
  });
  it('formats time in UTC and reports bad input', () => {
    expect(formatTime('2026-10-20T03:17:45Z')).toBe('2026-10-20 03:17 UTC');
    expect(formatTime('not a date')).toBe('invalid time');
  });
});

describe('synthetic alert data', () => {
  const ipPattern = /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g;
  const docRanges = ['192.0.2.', '198.51.100.', '203.0.113.'];

  it('has unique ids and valid fields', () => {
    expect(new Set(alerts.map((a) => a.id)).size).toBe(alerts.length);
    for (const a of alerts) {
      expect(severities).toContain(a.severity);
      expect(statuses).toContain(a.status);
      expect(Number.isNaN(Date.parse(a.time))).toBe(false);
      expect(a.mitre.id).toMatch(/^T\d{4}(\.\d{3})?$/);
      expect(a.triage.nextSteps.length).toBeGreaterThan(0);
    }
  });

  it('only uses IP addresses reserved for documentation', () => {
    const text = JSON.stringify(alerts);
    for (const match of text.matchAll(ipPattern)) {
      expect(docRanges.some((r) => match[0].startsWith(r)), `${match[0]} is not a documentation address`).toBe(true);
    }
  });

  it('only uses example domains', () => {
    const domains = JSON.stringify(alerts).match(/\b[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|net|org|io)\b/gi) ?? [];
    // eicar.com appears only as a file name (the EICAR test file), not as a domain.
    const allowedNonExample = new Set(['eicar.com']);
    for (const d of domains) {
      const ok = /(^|\.)example\.(com|net|org)$/i.test(d) || allowedNonExample.has(d.toLowerCase());
      expect(ok, `${d} is not an example domain`).toBe(true);
    }
  });
});
