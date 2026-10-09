# Project context

Personal website for Tom Cheng (tomcheng.me). This repository currently holds a
single-file interactive prototype (`index.html`). Read `README.md` for how the
file is organised and `docs/design-brief.md` for the agreed design decisions and
open questions before changing anything.

## Ground rules

- Name on the site is "Tom Cheng". Voice is first person and plain.
- Dark, playful, tactile desk as the entrance; light, calm reading pages.
- Stylised toy-like objects, warm amber as the only accent.
- No single hero object. Do not make the mixed-reality headset a centrepiece.
- Must work well on both desktop and phone. Check both after every visual change.
- Product-management work is deliberately left off the site.
- English only for now; keep the structure ready for Traditional Chinese.
- Do not add a `CNAME` file until Tom says the new site should go live.

## Working on the prototype

- No build step. Serve the folder (`python3 -m http.server`) and reload.
- three.js is pinned to 0.147.0 because the prototype uses the global
  (non-module) build and its `examples/js` add-ons, which later versions removed.
- Content is data at the top of the script (`WORK`, `PAPERS`, `AWARDS`, `PLACES`,
  `SECTIONS`). Desk objects are built in `add(...)` blocks; layouts are the
  `LAND` and `PORT` grids.
- Frame time must be clamped to be non-negative (`Math.max(0, …)`); a negative
  first frame once blew up every damped value.
- Camera near/far are kept tight (1 to 70) because thin stacked objects showed
  depth striping with a wider range.

## Planned rebuild

Astro, hosted on GitHub Pages:
- `src/content/<section>/*.md`, one file per item, with checked frontmatter
  (title, summary, date, cover, tags, featured, draft).
- Two templates: a section index and an item page.
- The desk scene becomes a client-side island on the home page only, generated
  from the same content collections.
- One shared tokens file for colours, type and spacing.
- GitHub Actions deploys on push.

Maintainability rule: adding something to the site should mean adding a file,
never editing the scene or the layout code.
