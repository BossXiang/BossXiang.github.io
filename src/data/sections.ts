// Structural, rarely-changing metadata about each section of the site — the
// desk-object label, the page title/blurb/lead. The repeatable items inside a
// section (case studies, papers, awards...) live in src/content/ instead;
// per the maintainability rule, adding one of those means adding a file here,
// never editing this list or the desk scene.

export const SECTIONS = [
  {
    key: 'work',
    label: 'Work',
    thing: 'The laptop',
    title: 'Work',
    blurb: 'Three things I’ve built and shipped',
    lead: 'I build software that people rely on while doing something else difficult: operating, running a meeting, watching a market.',
  },
  {
    key: 'research',
    label: 'Research',
    thing: 'The stack of papers',
    title: 'Research',
    blurb: 'Papers and the lab I work in',
    lead: 'My research is in computer vision and multimodal models, mostly applied to medicine and to human movement.',
    labs: [
      {
        when: '2024 to 2026',
        title: 'Intelligent Robot Lab, National Taiwan University',
        detail: 'MSc in Computer Science and Information Engineering, advised by Prof. Li-Chen Fu.',
      },
      {
        when: '2023',
        title: 'Institute of Information Science, Academia Sinica',
        detail: 'Research assistant. Language models and workflows for generating sport instruction.',
      },
    ],
  },
  {
    key: 'achievements',
    label: 'Achievements',
    thing: 'The trophy',
    title: 'Achievements',
    blurb: 'Awards, rankings and honours',
    lead: 'A short list, newest first.',
  },
  {
    key: 'side-projects',
    label: 'Side projects',
    thing: 'The controller',
    title: 'Side projects',
    blurb: 'Things built for the fun of it',
    lead: 'Smaller things, made out of curiosity.',
  },
  {
    key: 'photos',
    label: 'Photographs',
    thing: 'The prints',
    title: 'Photographs',
    blurb: 'Pictures from the places below',
    lead: 'Black and white, mostly streets, mostly one person in a lot of space.',
  },
  {
    key: 'travel',
    label: 'Travel',
    thing: 'The globe',
    title: 'Travel',
    blurb: 'Where I’ve lived and studied',
    lead: 'Three cities so far have been home for a while. The pins on the globe mark them.',
  },
  {
    key: 'writing',
    label: 'Writing',
    thing: 'The notebook',
    title: 'Writing',
    blurb: 'Notes, when there are some',
    lead: 'Notes on what I’m building and learning.',
  },
  {
    key: 'about',
    label: 'About',
    thing: 'The nameplate',
    title: 'Tom Cheng',
    blurb: 'Who I am and how to reach me',
    lead: 'I’m Tom (Wen-Hsiang Cheng), a software engineer from Taipei. I build mixed reality and AI systems: surgical navigation at AccuOrtho, and before that agents, language models and backends at Trend Micro, Academia Sinica and IGS.',
  },
];

export const SEC = Object.fromEntries(SECTIONS.map((s) => [s.key, s]));

// Section-to-section navigation, wrapping around — same order as SECTIONS.
export function prevNext(key: string) {
  const i = SECTIONS.findIndex((s) => s.key === key);
  const p = SECTIONS[(i - 1 + SECTIONS.length) % SECTIONS.length];
  const n = SECTIONS[(i + 1) % SECTIONS.length];
  return {
    prev: { href: `/${p.key}`, label: p.label },
    next: { href: `/${n.key}`, label: n.label },
  };
}

// The desk arrangement. Portrait stacks two per row instead of four.
export const LAND = [
  ['achievements', 'work', 'travel', 'about'],
  ['research', 'photos', 'side-projects', 'writing'],
];
export const PORT = [
  ['achievements', 'work'],
  ['travel', 'about'],
  ['research', 'photos'],
  ['side-projects', 'writing'],
];
