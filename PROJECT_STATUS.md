# direction.design — Option 2 foundation contract

Status: atmospheric foundation revision implemented and design-QA verified

## Architecture

- The selected visual direction is a cool-eggshell technical folio.
- The current visual treatment is `old documents underwater`: aged paper,
  mineral grey-green ink, soft submerged depth, open spacing, and restrained
  document-like motion.
- The Index unfolds as three long identity, system-object, and dossier zones
  with a persistent five-part bottom navigation rail.
- Index, Work, Timeline, Practice, About, Contact, and project routes use one
  record registry.
- Contexts remain multi-value metadata rather than separate site lanes.
- Practices are permanent collection routes rather than an unclear focus panel.
- Mobile and reduced-motion modes use static, sequential layouts.
- Project links are ordinary routes rather than iframe overlays.

## Content state

- Volume remains an independent-practice record without its deferred 3D runtime.
- All 23 legacy labels remain present.
- Selected records remain Volume, 570 / The Pillow Bag, PUPIL / Sean Leon,
  Mass Exodus / Slate, Muhann.Studio, and Interstice.
- Every project route is a name-only shell with `noindex,follow`.
- No project media or project-interior copy is deployed.
- Raster assets are limited to global paper and neutral identity material.
- The exact user-supplied master logo is preserved at
  `assets/identity/direction-design-master-logo.svg`.
- The generated atmosphere is
  `assets/system/underwater-paper-atmosphere.png`; it was created with the
  built-in ImageGen tool from two user-supplied aged-paper texture references.
- Project routes remain name-only placeholders after the atmospheric revision.

## QA status

- Full-view and focused source/implementation comparisons are recorded in
  `.design-qa/`.
- Desktop, tablet, mobile, keyboard, responsive, interaction, and static route
  checks passed.
- `design-qa.md` reports `final result: passed`.

## Release gate

The foundation is releasable only when:

1. `npm run build` passes.
2. Every page and generated route resolves without missing assets.
3. Browser console and network checks are clean.
4. Desktop, tablet, mobile, keyboard, and reduced-motion behaviour pass.
5. The archival source truth and browser implementation are judged together in
   normalized full-view and focused comparison frames.
6. `design-qa.md` reports `final result: passed`.
