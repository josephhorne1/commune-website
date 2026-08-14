# direction.design

Option 2 technical-folio foundation for `https://direction.design`, built as a
registry-first static portfolio system for direct GitHub Pages deployment.

## What exists

- A 30-second employer-facing Index.
- A thin, randomized ticker linking the seven curated featured records above
  the full-width Volume field.
- Direct wheel and horizontal touch/pen control for the Volume and garment
  carousels. Slow wheel input stays at `1x`; sustained input builds a capped,
  exponentially accelerated energy signal with transient motion blur. A shared
  `requestAnimationFrame` target/current model smooths manual travel through one
  complete lap, then the next outward wheel event returns to page scrolling.
  Automatic movement resumes three seconds after input ends.
- A practice-led opening that pairs Navigate by practice and Based/Available
  metadata with the garment motion field.
- Registry and selected chronology references followed by a compact active
  record, selected-work, availability, and location block.
- A full-bleed adaptive five-row practice mosaic as the final page section,
  with its imagery held at a quieter 64% opacity.
- A 20-look garment procession with a 50-second base cycle, capable-device
  dynamic mobile presentation, coalesced visible-only animated-WebP playback
  tiers that return directly to `1x`, constrained/reduced-motion fallbacks, and
  a complete garment gallery.
- A complete Work Registry.
- A dedicated chronological Timeline with a list fallback.
- A tangible Practice Index and six permanent practice collections.
- About, Contact, and 404 routes.
- Volume, 23 legacy names, and four conservative Allegra industry records in
  one verified registry.
- Twenty-seven permanent name-only project routes and an initial Volume image
  record assembled from the shared homepage collection.
- A documented Registry Dossier, Visual Folio, System / Process Study, and
  Collection-container architecture for later population.

Raster imagery remains limited to site-wide identity material and the explicit
homepage/garment-gallery allowlists. Volume is the sole draft project-media
exception and references the existing 24-image homepage collection without
copying files into `/projects/`. All other project media, embeds, bespoke
case-study layouts, and the old iframe layer remain intentionally absent.

## Source model

`data/portfolio.js` is the single source for titles, slugs, dates, contexts,
relationships, featured order, practices, route helpers, and template
assignment. Volume is explicitly `contentStatus: "draft"`; every other record
remains `contentStatus: "empty"`.

Run `npm run generate` after changing record titles, slugs, or practice groups.
It regenerates:

- Twenty-seven name-only routes and the generated Volume image record under
  `projects/`.
- Every collection route under `practices/{slug}/`.

## Documentation

- `FOUNDATION_SYSTEM.md` — complete page, component, template, token, motion,
  accessibility, responsive, and content-reset specification.
- `CONTENT_POPULATION_GUIDE.md` — controlled sequence for reintroducing work.
- `ASSET_MANIFEST.md` — system assets, fonts, icons, and media boundary.
- `assets/media/fashion-turntables/README.md` — source, optimization, scale,
  runtime, and rebuild record for the homepage animation set.
- `design-qa.md` — final combined-reference implementation review.

## Local verification

```text
npm run build
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

`npm run build` regenerates static routes and runs the reset contract.

## Publishing

The repository remains a dependency-free static GitHub Pages project. `CNAME`
points to `direction.design`; no framework migration or external runtime is
required.

Pre-reset project material remains outside this deployable repository in:

```text
PROJECTS FOR PORTFOLIO\_SITE_CONTENT_VAULT\2026-07-28_PRE_UI_RESET
```

That vault contains the previous project tree, recovered media, prior UI,
history, hashes, and Volume provenance.
