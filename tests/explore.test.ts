import { describe, expect, it } from 'vitest';
import { collectTags, filterItems, parseTagAttr } from '../src/lib/explore';

const items = [
  { id: 'a', title: 'SOC automation lab', summary: 'Wazuh and Shuffle', status: 'explored', tags: ['SIEM', 'SOAR'] },
  { id: 'b', title: 'IOC extractor', summary: 'Pull indicators from text', status: 'planned', tags: ['IOC', 'siem'] },
  { id: 'c', title: 'Alert dashboard', summary: 'Synthetic alerts', status: 'simulated', tags: ['Detection'] },
];

describe('filterItems', () => {
  it('returns all items with no filter or "all" values', () => {
    expect(filterItems(items)).toHaveLength(3);
    expect(filterItems(items, { status: 'all', tag: 'all', query: '' })).toHaveLength(3);
  });
  it('filters by status', () => {
    expect(filterItems(items, { status: 'planned' }).map((i) => i.id)).toEqual(['b']);
  });
  it('filters by tag regardless of case', () => {
    expect(filterItems(items, { tag: 'SIEM' }).map((i) => i.id)).toEqual(['a', 'b']);
  });
  it('searches title, summary and tags', () => {
    expect(filterItems(items, { query: 'wazuh' }).map((i) => i.id)).toEqual(['a']);
    expect(filterItems(items, { query: 'DETECTION' }).map((i) => i.id)).toEqual(['c']);
  });
  it('combines filters', () => {
    expect(filterItems(items, { tag: 'siem', status: 'explored' }).map((i) => i.id)).toEqual(['a']);
  });
});

describe('tags', () => {
  it('collects each tag once, ignoring case, sorted', () => {
    expect(collectTags(items)).toEqual(['Detection', 'IOC', 'SIEM', 'SOAR']);
  });
  it('parses the pipe-separated data attribute', () => {
    expect(parseTagAttr('SIEM| SOAR |')).toEqual(['SIEM', 'SOAR']);
    expect(parseTagAttr(undefined)).toEqual([]);
  });
});
