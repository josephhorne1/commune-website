# direction.design — Option 2 foundation contract

Status: atmospheric foundation revision implemented and design-QA verified

## Architecture

- The selected visual direction is a cool-eggshell technical folio.
- The current visual treatment is `old documents underwater`: aged paper,
  mineral grey-green ink, soft submerged depth, open spacing, and restrained
  document-like motion.
- The Index unfolds as one condensed full-width sequence with a persistent
  five-part bottom navigation rail.
- Index, Work, Timeline, Practice, About, Contact, and project routes use one
  record registry.
- Contexts remain multi-value metadata rather than separate site lanes.
- Practices are permanent collection routes rather than an unclear focus panel.
- Mobile and reduced-motion modes use sequential layouts with explicit motion
  fallbacks.
- The opening identity zone begins with a thin randomized ticker for the seven
  featured records, followed by the full-width Volume carousel. Navigate by
  practice and Based/Available sit beside the 50-second procession of 20
  optimized fashion turntables; registry and chronology links precede a compact
  active-record/selected-work block. The quieter full-bleed adaptive five-row
  practice field is the final page section.
- The Volume and garment fields begin in automatic motion. Slow wheel input
  remains controlled at `1x`; sustained fine-pointer input builds a decaying
  energy signal that accelerates exponentially to a capped speed and adds only
  transient motion blur. A `requestAnimationFrame` target/current model eases
  the visible field toward each manual position. Each takeover permits one full
  lap from its starting phase; after it settles at the boundary, the next
  outward wheel event returns to normal page scrolling. Automatic motion
  resumes three seconds after input ends.
- Capable compact screens run the dynamic garment procession. Horizontal
  touch/pen control begins only after horizontal intent wins the axis lock, so
  vertical page panning remains native. Reduced-motion, Save-Data, and low-memory
  modes use constrained static fallbacks; the optimized 5-by-4 asset remains a
  compact loading/fallback presentation rather than the default mobile runtime.
- Desktop garment acceleration also retimes visible mounted animated WebPs
  through in-memory `1x`, `1.5x`, `2x`, `3x`, and `4x` tiers. Tier requests are
  coalesced during a burst and restore directly to `1x` when it settles, without
  adding duplicate derivative files to the deployed media set.
- A labelled motion control pauses the project ticker, automatic Volume and
  garment travel, and practice-field crossfades. Direct manipulation and the
  ordinary project/gallery links remain available when autonomous motion is
  paused or replaced by a fallback.
- Clicking the procession opens the complete 20-look grid on the Fashion &
  Garment Design practice page, where a second control pauses all visible
  turntables.
- Project links are ordinary routes rather than iframe overlays.

## Content state

- Volume is the first draft project record: a static, no-JavaScript image
  sequence that reuses the homepage collection's exact 24 optimized WebPs.
  The animated fashion field remains isolated to the homepage system.
- All 23 legacy labels remain present.
- The rough archive pass adds Allegra Halton plus three verified child cases,
  corrects MT570, MUHANN Studio, City of Knowledge, Antony Riddle, and In
  Loving Memory metadata, and retains all 23 legacy labels.
- Selected records are Volume, MT570, PUPIL / Sean Leon, Mass Exodus 2024 /
  Slate, Allegra Halton, MUHANN Studio, and Interstice.
- Twenty-seven project routes remain name-only shells with `noindex,follow`.
  Volume is a `draft`, `noindex,follow` image record with verified registry
  metadata and no invented case-study copy.
- No media is copied beneath `/projects/`; Volume references the exact shared
  homepage collection while the turntable set remains homepage-only.
- Raster assets are limited to global paper, neutral identity material, and the
  explicit optimized homepage/garment-gallery WebP sets.
- The exact user-supplied master logo is preserved at
  `assets/identity/direction-design-master-logo.svg`.
- The generated atmosphere is
  `assets/system/underwater-paper-atmosphere.png`; it was created with the
  built-in ImageGen tool from two user-supplied aged-paper texture references.
- Empty project routes remain name-only placeholders after the atmospheric
  revision; Volume is the deliberate draft exception.

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
