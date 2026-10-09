import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared checked frontmatter every item collection builds on: title, summary,
// date, cover, tags, featured, draft (see CLAUDE.md "Planned rebuild").
const base = {
  title: z.string(),
  summary: z.string(),
  date: z.string(),
  cover: z.string().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(true),
  draft: z.boolean().default(false),
  order: z.number().default(0),
};

const loader = (dir: string) => glob({ pattern: '**/*.md', base: `./src/content/${dir}` });

const work = defineCollection({
  loader: loader('work'),
  schema: z.object({
    ...base,
    role: z.string(),
    org: z.string(),
    stats: z.array(z.string()).default([]),
  }),
});

const research = defineCollection({
  loader: loader('research'),
  schema: z.object({
    ...base,
    link: z.string().optional(),
  }),
});

const achievements = defineCollection({
  loader: loader('achievements'),
  schema: z.object({
    ...base,
    detail: z.string().optional(),
  }),
});

const sideProjects = defineCollection({
  loader: loader('side-projects'),
  schema: z.object(base),
});

const travel = defineCollection({
  loader: loader('travel'),
  schema: z.object(base),
});

const writing = defineCollection({
  loader: loader('writing'),
  schema: z.object(base),
});

export const collections = {
  work,
  research,
  achievements,
  'side-projects': sideProjects,
  travel,
  writing,
};
