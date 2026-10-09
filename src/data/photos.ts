// No real photographs yet (design not settled — see docs/design-brief.md
// "Still open"). These six placeholders are drawn as SVG at build time
// (src/components/PhotoPlaceholder.astro) so the page needs no client JS and
// no canvas/DOM dependency. Swap this module and the component below for a
// real `photos` content collection once photographs exist.

export type PhotoKind = 0 | 1 | 2;

export const PHOTOS: { kind: PhotoKind; flip: boolean }[] = ([0, 1, 2] as PhotoKind[]).flatMap((kind) => [
  { kind, flip: false },
  { kind, flip: true },
]);
