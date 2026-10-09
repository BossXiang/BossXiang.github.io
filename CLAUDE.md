# Project context

Personal website for Tom Cheng (tomcheng.me). An Astro site: content lives as
one Markdown file per item under `src/content/`, and a three.js desk scene on
the home page opens into real, light "paper" pages. Read `README.md` for how
the repo is organised and `docs/design-brief.md` for the agreed design
decisions and open questions before changing anything.

The earlier single-file prototype that settled the look and feel is kept at
`legacy/index.html` for reference; it's no longer served or maintained.

## Ground rules

- Name on the site is "Tom Cheng". Voice is first person and plain.
- Dark, playful, tactile desk as the entrance; light, calm reading pages.
- Stylised toy-like objects, warm amber as the only accent.
- No single hero object. Do not make the mixed-reality headset a centrepiece.
- Must work well on both desktop and phone. Check both after every visual change.
- Product-management work is deliberately left off the site.
- English only for now; keep the structure ready for Traditional Chinese.
- Do not add a `CNAME` file, and do not switch the repo's Pages source to
  "GitHub Actions" in Settings, until Tom says the new site should go live.

## Working on the site

- `npm install`, then `npm run dev` (http://localhost:4321). `npm run build`
  outputs to `dist/`.
- Content: add a Markdown file under `src/content/<section>/` — the schema is
  checked in `src/content/config.ts`. Never edit the scene or a layout to add
  routine content; see README "Adding content" / "Adding a whole new section".
- Structural, non-repeatable metadata (section label/thing/title/blurb/lead,
  the About bio, the photo placeholders) lives in `src/data/`, not as content
  collections — it changes rarely and isn't "one file per item".
- The desk scene (`src/components/Desk/scene.js` + `textures.js` +
  `Desk.astro`) is a client-side island mounted only on `/`. It no longer
  pins an old three.js version — ESM imports from the `three` npm package
  work fine with a real bundler, so keep using current three.js and its
  `three/examples/jsm/...` modules rather than the old global-build add-ons.
- three's `ColorManagement` already converts sRGB hex colours to the linear
  working space on construction. Don't add a manual `.convertSRGBToLinear()`
  call on top of `new THREE.Color(hex)` — that double-converts and darkens
  everything. Canvas-drawn textures still need `texture.colorSpace =
  THREE.SRGBColorSpace` explicitly (that part didn't change).
- Clicking a labelled desk object navigates to that section's real page
  (`location.href`), after a short hop-animation delay — it no longer opens
  an in-scene overlay. The home page always renders a plain, real `<nav>`
  listing of every section (`#plain-index`) in the HTML; the desk scene
  hides it and takes over only once it has actually managed to initialize
  WebGL, so a failed/no-JS visit still gets a working, crawlable page.
- Frame time must be clamped to be non-negative (`Math.max(0, …)`); a negative
  first frame once blew up every damped value.
- Camera near/far are kept tight (1 to 70) because thin stacked objects showed
  depth striping with a wider range.

## Maintainability rule

Adding something to the site should mean adding a file, never editing the
scene or the layout code. That's true for every section's items; adding a
whole new *section* is the one case that's still expected to touch code (see
README).
