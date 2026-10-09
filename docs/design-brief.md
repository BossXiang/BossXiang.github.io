# Personal website: design brief

Decisions agreed so far for the rebuild of tomcheng.me. Last updated 2026-10-09.

## Identity
- Name on site: **Tom Cheng**
- Headline: "Software engineer building mixed reality and AI systems"
- Contact: bosszheng220@gmail.com, linkedin.com/in/chengwenhsiang
- Voice: first person, plain

## Concept
- A dark, playful, tactile **toy desk** (stylised objects, warm amber accent) is the front door.
- Each object opens a section as a **light, calm reading page**.
- No single hero object; the MR headset is not the centrepiece.
- Must work well on PC and phone (desk re-arranges to a tall grid on phones).
- A plain **Index** gives every section without the 3D scene.

## Sections and their desk objects
| Section | Object | Notes |
|---|---|---|
| Work | Laptop | Lead case studies: AccuHip & AccuKnee, Meeting Intelligence + VRL Agent, Competitor Analysis CMS |
| Research | Stack of papers | MAAIG paper, imaging-in-medicine paper, lab affiliation |
| Achievements | Trophy | Awards and rankings, newest first |
| Side projects | Game controller | List still to be supplied |
| Photographs | Prints + toy camera | Placeholders until real photos arrive |
| Travel | Globe | Taipei, Singapore, Toronto so far |
| Writing | Notebook | Hidden until first note exists |
| About | Nameplate | Bio, education, skills, languages, contact |

Toys with no section: lamp (toggles light), mug (tips over), ball (can be flicked).

## Scope decisions
- Product-management work: left off the site.
- Language: English now; structure ready for Traditional Chinese later.
- Maintainability rule: content lives in files (one per item); the 3D scene and
  the pages are both generated from them, so adding something means adding a file.

## Build plan
- Stack: Astro with the 3D scene loaded only on the home page; hosted on GitHub Pages.
- New empty repo for the rebuild; the old repo (BossXiang/BossXiang.github.io,
  a single index.html) is replaced when ready. Keep its `CNAME` (www.tomcheng.me).

## Still open
- MAAIG placement (Research only?), list of side projects, confidentiality limits per employer
- How prominently to show class rank and GPA
- Portrait, real photographs, case-study images
- Typeface sign-off and any visual references Tom likes
