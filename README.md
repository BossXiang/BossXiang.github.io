# Tom Cheng — desk prototype

An interactive prototype for my personal site. A toy-like desk sits on a dark
background; each labelled object opens a section of the site as a light reading
page. Everything is in one file, `index.html`, with no build step.

This is a **prototype**, made to settle the look and feel. The real site will be
rebuilt from it (see "Where this goes next").

## Run it

Open `index.html` through a local web server (some browsers restrict pages
opened straight from disk):

```bash
# from this folder
python3 -m http.server 8000
# then visit http://localhost:8000
```

It needs an internet connection the first time, because the 3D library
(three.js 0.147.0) and the fonts load from public CDNs.

## Put it on GitHub Pages

1. Create a new empty repository on GitHub.
2. Push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Desk prototype"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. In the repository: Settings → Pages → Source: "Deploy from a branch",
   branch `main`, folder `/ (root)`.
4. The site appears at `https://<you>.github.io/<repo>/` within a minute or two.

`.nojekyll` is included so GitHub serves the files as they are.

**Custom domain:** this folder deliberately has no `CNAME` file. `www.tomcheng.me`
still points at the old repository. Only add a `CNAME` here when this is ready
to replace the live site.

## What's on the desk

| Object | Opens | When touched |
|---|---|---|
| Laptop | Work | Lid opens |
| Paper stack | Research | Pages fan out |
| Trophy | Achievements | Hops and spins |
| Controller | Side projects | Buttons and sticks move |
| Prints + toy camera | Photographs | Prints spread |
| Globe | Travel | Spins |
| Notebook | Writing | Cover lifts |
| Nameplate | About | Nods |
| Lamp | (nothing) | Switches the room between day and night |
| Mug | (nothing) | Tips over |
| Ball | (nothing) | Can be dragged and flicked; bounces off things |

Every object can be dragged and springs back. **Index** (top right) lists every
section without the 3D scene, and is what visitors see if their browser can't
run WebGL. Adding `#work`, `#about` etc. to the address opens that page directly.

## Editing the content

All text lives near the top of the `<script>` in `index.html`, under the comment
`content`:

| To change | Edit |
|---|---|
| Case studies | the `WORK` array |
| Papers | the `PAPERS` array |
| Awards | the `AWARDS` array |
| Places | the `PLACES` array |
| Section titles, intros, About page | the `SECTIONS` array |
| Email address | the `EMAIL` constant |

Each entry in `SECTIONS` has a `key`, the `label` shown on the desk, a `title`,
a `lead` paragraph, and an `html()` function that returns the page body.

### Things that are placeholders

- All page text is a first draft written from my CV. Each page says so in a
  dashed "Draft" note; remove that line in `renderPage()` when the text is final.
- The second research paper has a working title.
- The side project is an example entry.
- The photographs are drawn by code (`photoCanvas()`), not real photos. To use
  real ones, put image files in a `photos/` folder and replace `photoURLs()`
  with a list of their paths.

## Changing the look

- **Page colours and fonts:** the `:root` block at the top of the `<style>`.
- **Object colours:** the constants `CREAM`, `AMBER`, `CORAL`, `TEAL`, `NAVY`,
  `CHAR`, `GOLD` in the script.
- **Desk arrangement:** the `LAND` (wide screens) and `PORT` (tall screens)
  grids. Each is a list of rows of section keys.
- **An object's shape:** its `add('<key>', ...)` block under `desk objects`.

### Adding a new section

1. Add an entry to `SECTIONS` (key, label, title, lead, `html()`).
2. Add an object for it with `add('<key>','section', radius, build)`, modelled
   on an existing one. `build` creates the meshes and returns a function that
   animates them from `o.h` (0 at rest, 1 when hovered or open).
3. Put the key into both `LAND` and `PORT`.

## How the file is organised

1. `<style>`: design tokens, desk interface, paper pages.
2. Markup: the canvas, the label layer, the page overlay.
3. Script, in order: content → pages → scene basics → drawn textures → desk
   objects → desk and lights → layout and camera → labels → pointer input →
   frame loop.

`window.__desk` exposes a few helpers (`open`, `close`, `state`, `step`) used
for automated testing. They are harmless and can be removed.

## Known limits

- One file is right for a prototype and wrong for a site that will grow. See below.
- Search engines can't read page text that only exists inside JavaScript.
- Not yet tested on a wide range of real phones. The scene lowers its own
  resolution if frames are slow.
- `prefers-reduced-motion` is respected: no drop-in, no camera sway, instant pages.

## Where this goes next

The plan, recorded in `docs/design-brief.md`, is to rebuild this as an Astro
site: one Markdown file per project, paper, photo set and note; real pages for
each; and the desk generated from that same content, loaded only on the home
page. `CLAUDE.md` gives a coding assistant the context to continue from here.
