// Search and filter for the project and research lists.
// Pure functions; the page script reads cards from the DOM and calls these.

import { sanitizeQuery } from './alerts';

export interface ExploreItem {
  id: string;
  title: string;
  summary: string;
  status: string;
  tags: string[];
}

export interface ExploreFilter {
  query?: string;
  status?: string; // 'all' or a status value
  tag?: string; // 'all' or a tag
}

export function filterItems<T extends ExploreItem>(items: readonly T[], filter: ExploreFilter = {}): T[] {
  const terms = sanitizeQuery(filter.query ?? '')
    .split(/\s+/)
    .filter(Boolean);
  const status = filter.status && filter.status !== 'all' ? filter.status : null;
  const tag = filter.tag && filter.tag !== 'all' ? filter.tag.toLowerCase() : null;

  return items.filter((item) => {
    if (status && item.status !== status) return false;
    if (tag && !item.tags.some((t) => t.toLowerCase() === tag)) return false;
    if (terms.length) {
      const text = [item.title, item.summary, ...item.tags].join(' ').toLowerCase();
      if (!terms.every((t) => text.includes(t))) return false;
    }
    return true;
  });
}

/** Tags in alphabetical order, each listed once regardless of case. */
export function collectTags(items: readonly ExploreItem[]): string[] {
  const seen = new Map<string, string>();
  for (const item of items) {
    for (const tag of item.tags) {
      const key = tag.toLowerCase();
      if (!seen.has(key)) seen.set(key, tag);
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/** Turns "a|b|c" (how tags are stored on a card's data attribute) back into a list. */
export function parseTagAttr(value: string | undefined): string[] {
  return (value ?? '')
    .split('|')
    .map((t) => t.trim())
    .filter(Boolean);
}
