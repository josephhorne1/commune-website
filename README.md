# direction.design

Option 2 technical-folio foundation for `https://direction.design`, built as a
content-empty static portfolio system for direct GitHub Pages deployment.

## What exists

- A 30-second employer-facing Index.
- A complete Work Registry.
- A dedicated chronological Timeline with a list fallback.
- A tangible Practice Index and six permanent practice collections.
- About, Contact, and 404 routes.
- Volume plus all 23 legacy project names in one verified registry.
- Twenty-four permanent, name-only project routes.
- A documented Registry Dossier, Visual Folio, System / Process Study, and
  Collection-container architecture for later population.

The only raster imagery is site-wide identity material: a neutral system object
and restrained paper stock. Project interiors, project media, embeds, bespoke
case-study layouts, the old iframe layer, and the deferred Volume renderer are
intentionally absent.

## Source model

`data/portfolio.js` is the single source for titles, slugs, dates, contexts,
relationships, featured order, practices, route helpers, and template
assignment. Every record remains explicitly `contentStatus: "empty"`.

Run `npm run generate` after changing record titles, slugs, or practice groups.
It regenerates:

- Every name-only route under `projects/`.
- Every collection route under `practices/{slug}/`.

## Documentation

- `FOUNDATION_SYSTEM.md` — complete page, component, template, token, motion,
  accessibility, responsive, and content-reset specification.
- `CONTENT_POPULATION_GUIDE.md` — controlled sequence for reintroducing work.
- `ASSET_MANIFEST.md` — system assets, fonts, icons, and media boundary.
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
