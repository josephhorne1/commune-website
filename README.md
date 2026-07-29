# direction.design

Content-free portfolio system for `https://direction.design`, built for direct
GitHub Pages deployment.

## Current phase

The deployed site intentionally contains:

- Joseph Horne / Direction and Design identity and site copy;
- one data registry containing Volume and all 23 legacy project labels;
- a six-record employer-facing overview;
- a scroll-linked chronology;
- a practice-based alternate index;
- name-only project routes;
- About and Contact information.

Project interiors, images, videos, embeds, bespoke case-study layouts, the old
project iframe, and the deferred Volume renderer are intentionally absent.

## Source model

`data/portfolio.js` is the single source for:

- project names and slugs;
- dates and ongoing states;
- industry, self-directed, and education contexts;
- parent and related-record relationships;
- featured ranking;
- practice indexing;
- the explicit `contentStatus: "empty"` reset state.

Run `npm run generate` after changing slugs or titles. It regenerates every
content-free route under `projects/`.

## Local verification

```text
npm run build
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

`npm run build` regenerates the project shells and runs the reset contract.

## Publish

The repository remains a static GitHub Pages project. `CNAME` points to
`direction.design`; no framework migration or external runtime is required.

The pre-reset project material is stored outside this deployable repository in:

```text
PROJECTS FOR PORTFOLIO\_SITE_CONTENT_VAULT\2026-07-28_PRE_UI_RESET
```

That vault includes file hashes, the complete previous project tree, recovered
media, the previous UI, Git history, and Volume provenance.
