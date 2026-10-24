import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const evidence = z.enum(['completed', 'in-progress', 'explored', 'planned', 'simulated']);

// Projects: one Markdown file per project in src/content/projects/.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string().min(3),
    summary: z.string().min(10).max(240),
    status: evidence,
    order: z.number().int().default(100),
    tags: z.array(z.string()).min(1),
    tools: z.array(z.string()).default([]),
    /** Name of an inline diagram component to show, see src/components/diagrams. */
    diagram: z.enum(['soc-automation', 'triage-flow']).optional(),
    /** Link to a live demo page on this site. */
    demo: z.string().startsWith('/').optional(),
  }),
});

// Research and write-ups: src/content/research/.
const research = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research' }),
  schema: z.object({
    title: z.string().min(3),
    summary: z.string().min(10).max(240),
    status: evidence,
    kind: z.enum(['investigation', 'lab exercise', 'detection logic', 'lessons learned']),
    tags: z.array(z.string()).min(1),
    // Plain date string so no timezone gets attached. Optional for planned items.
    date: z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM').optional(),
  }),
});

export const collections = { projects, research };
