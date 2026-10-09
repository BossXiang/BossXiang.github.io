# Tom Cheng — tomcheng.me

An Astro site. Content lives as one Markdown file per item under
`src/content/`; a dark, playful three.js desk scene on the home page opens
into calm, light "paper" reading pages — one real page per section/item.

The earlier single-file prototype (made to settle the look and feel before
this rebuild) is kept at `legacy/index.html` for reference; see
`docs/design-brief.md` for the design decisions it settled.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview  # serve the built output locally
```

## How the repo is organised

```
src/
  content/<section>/*.md   # one file per item — work, research, achievements,
                            # side-projects, travel, writing. Adding content
                            # here never requires touching the scene or layouts.
  content/config.ts        # the checked frontmatter schema for each collection
  data/
    sections.ts            # per-section label/thing/title/blurb/lead (structural,
                            # not repeatable — see content/ for the lists)
    about.ts                # bio/education/skills (a single entity, not a collection)
    photos.ts                # the six placeholder "photograph" descriptors
  components/
    Desk/                   # the three.js desk scene — a client-side island,
                             # mounted only on the home page
    PhotoPlaceholder.astro  # SVG-drawn placeholder photo (no real photos yet)
  layouts/
    BaseLayout.astro        # shared page chrome: paper background, back bar,
                             # eyebrow/title/lead, prev/next
    ItemPage.astro          # the single-item permalink template
  pages/
    index.astro              # home: desk scene + an always-present plain index
    about.astro
    photos/index.astro
    <section>/index.astro + [slug].astro   # section list + item pages, for
                                             # work, research, achievements,
                                             # side-projects, travel, writing
  styles/tokens.css          # the one shared colour/type/spacing file
```

### Adding content

Add a Markdown file under `src/content/<section>/` with the frontmatter
`content/config.ts` expects (title, summary, date, tags, order, ...) — that's
it. The section's index page and its item page pick it up automatically.

### Adding a whole new section

This is structural, not routine, so it does mean touching code:

1. Add an entry to `SECTIONS` in `src/data/sections.ts` (key, label, thing,
   title, blurb, lead), and to `LAND`/`PORT`.
2. Add a `src/content/<key>/` collection (or a `src/data/<key>.ts`, if it's a
   single entity like `about`), and `src/pages/<key>/index.astro` +
   `[slug].astro`.
3. Add a desk object for it in `src/components/Desk/scene.js`'s `add('<key>',
   'section', radius, build)` chain, modelled on an existing one.

### Things that are still placeholders

- All page text is a first draft written from Tom's CV — every page says so.
- The second research paper has a working title.
- Side projects are an example entry plus two open slots.
- Photographs are drawn as SVG placeholders (`PhotoPlaceholder.astro`), not
  real photos — the design isn't settled yet (see `docs/design-brief.md`
  "Still open"). Once real photos exist, add a `photos` content collection
  and swap the component for real `<img>`s.

## Deploying

`.github/workflows/deploy.yml` builds with `withastro/action` and deploys via
GitHub's official Pages Actions on every push to `main`. This repo is a
user/org Pages repo (`<user>.github.io`), so it serves at the domain root —
no project-page subpath to configure.

**Before this goes live:** the repo's Settings → Pages → Source needs to be
switched from "Deploy from a branch" to "GitHub Actions" (a manual step, not
done by the workflow). Per `CLAUDE.md`, no `CNAME` is added here until Tom
says the new site should replace the live one.

## Known limits

- Photographs are placeholders (see above).
- Side projects beyond the one example entry aren't supplied yet.
