import { describe, expect, it } from 'vitest';
import { lookups } from '../src/data/dns';
import {
  entropy,
  filterLookups,
  isLeadKey,
  isVerdict,
  labelCount,
  leadsFor,
  longestLabel,
  score,
  verdicts,
} from '../src/lib/dns';

describe('measurements', () => {
  it('counts labels and finds the longest one', () => {
    expect(labelCount('a.b.example')).toBe(3);
    expect(labelCount('_ldap._tcp.dc._msdcs.home.lan.example')).toBe(7);
    expect(longestLabel('dGhpcy1pcy1mYWtlLWRhdGE.c2.data-sync.test')).toBe('dGhpcy1pcy1mYWtlLWRhdGE');
  });

  it('scores repeated characters low and random ones high', () => {
    expect(entropy('aaaa')).toBe(0);
    expect(entropy('')).toBe(0);
    expect(entropy('ab')).toBe(1);
    expect(entropy('kzqxvbmrtwpl')).toBeGreaterThan(3.4);
    expect(entropy('connectivity-check')).toBeLessThan(3.4);
  });
});

describe('hunting leads', () => {
  const byId = (id: string) => lookups.find((l) => l.id === id)!;

  it('flags the generated and encoded names as random-looking', () => {
    expect(leadsFor(byId('D-10'))).toContain('random');
    expect(leadsFor(byId('D-11'))).toContain('random');
  });

  it('includes a false positive for every lead, so no lead works alone', () => {
    // The lesson of the page: each simple rule also catches harmless traffic.
    for (const key of ['long', 'parts', 'random', 'failed', 'volume'] as const) {
      const hits = lookups.filter((l) => leadsFor(l).includes(key));
      expect(hits.length, key).toBeGreaterThan(0);
      expect(hits.some((l) => l.answer.verdict !== 'suspicious'), `${key} should catch something harmless`).toBe(true);
    }
  });

  it('every suspicious lookup trips at least one lead or carries a note', () => {
    for (const l of lookups.filter((x) => x.answer.verdict === 'suspicious')) {
      expect(leadsFor(l).length > 0 || Boolean(l.note), l.id).toBe(true);
    }
  });

  it('filters by all chosen leads, and shows everything with none chosen', () => {
    expect(filterLookups(lookups, [])).toHaveLength(lookups.length);
    const both = filterLookups(lookups, ['random', 'txt']);
    expect(both.map((l) => l.id)).toEqual(['D-11']);
  });

  it('rejects unknown lead names', () => {
    expect(isLeadKey('random')).toBe(true);
    expect(isLeadKey('__proto__')).toBe(false);
    expect(isLeadKey(42)).toBe(false);
  });
});

describe('scoring', () => {
  it('counts only answered lookups', () => {
    const s = score(lookups, { 'D-01': 'normal', 'D-11': 'normal', 'nope': 'suspicious' });
    expect(s).toEqual({ answered: 2, correct: 1, total: lookups.length });
  });
});

describe('synthetic data stays synthetic', () => {
  it('uses only reserved domain endings', () => {
    for (const l of lookups) expect(l.domain, l.id).toMatch(/\.(example|test)$/);
  });

  it('uses only documentation addresses', () => {
    for (const l of lookups) {
      for (const ip of l.result.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g) ?? []) {
        expect(ip, l.id).toMatch(/^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.|0\.0\.0\.0$)/);
      }
    }
  });

  it('has unique ids, valid verdicts and all three verdicts represented', () => {
    expect(new Set(lookups.map((l) => l.id)).size).toBe(lookups.length);
    for (const l of lookups) expect(isVerdict(l.answer.verdict), l.id).toBe(true);
    for (const v of verdicts) expect(lookups.some((l) => l.answer.verdict === v), v).toBe(true);
  });
});
