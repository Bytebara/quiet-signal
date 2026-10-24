// Guards on the honesty rules: these fail the test run if content drifts.
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { skillGroups } from '../src/data/skills';
import { degree, degreeStatusLabel } from '../src/data/education';
import { site } from '../src/config/site';

function frontmatter(file: string): Record<string, string> {
  const text = readFileSync(file, 'utf8');
  const block = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  return Object.fromEntries(
    block
      .split('\n')
      .map((l) => l.match(/^(\w+):\s*(.*)$/))
      .filter((m): m is RegExpMatchArray => !!m)
      .map((m) => [m[1], m[2]]),
  );
}

describe('skills', () => {
  it('every skill states where it comes from', () => {
    for (const g of skillGroups) {
      for (const s of g.skills) expect(s.basis.length, s.name).toBeGreaterThan(10);
    }
  });
});

describe('education', () => {
  it('only claims a completed degree when the status says so', () => {
    expect(degreeStatusLabel('unconfirmed', null)).toBeNull();
    expect(degreeStatusLabel('in-progress', null)).toBe('In progress');
    expect(degreeStatusLabel('completed', '2026')).toBe('Completed 2026');
  });
  it('does not set a conferral year unless the degree is completed', () => {
    if (degree.degreeStatus !== 'completed') expect(degree.conferredYear).toBeNull();
  });
});

describe('planned and simulated content', () => {
  for (const dir of ['src/content/projects', 'src/content/research']) {
    for (const name of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const file = join(dir, name);
      const fm = frontmatter(file);
      if (fm.status === 'planned') {
        it(`${name} (planned) says it is not built yet`, () => {
          expect(readFileSync(file, 'utf8')).toMatch(/not (built|started) yet|Planned\./i);
        });
      }
    }
  }
});

describe('site config', () => {
  it('publishes no contact details', () => {
    const text = JSON.stringify(site);
    expect(text).not.toMatch(/@[a-z0-9-]+\.[a-z]{2,}/i);
    expect(text).not.toMatch(/\+?\d[\d\s().-]{8,}\d/);
  });
  it('has no resume download unless one is explicitly added', () => {
    // When you add an approved file, update this test on purpose.
    expect(site.resumeFile).toBeNull();
  });
});
