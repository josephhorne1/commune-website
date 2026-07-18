# Direction and Design — Portfolio MK4

Static portfolio for `https://direction.design`, built for direct GitHub Pages deployment.

## Framework

- The site shell uses Consolas only, with the warm paper palette, compact scale, asymmetric columns, and controlled whitespace established by Joseph Horne's resume.
- Direction and Design is the primary identity; Joseph Horne is secondary.
- The supplied Volume mark is used as the entry, site, and Volume launch icon.
- Enter expands the homepage outward from the central control.
- On desktop, the homepage and persistent header occupy the central third of the viewport, leaving intentional white space on both sides. Mobile remains full-width.
- The homepage is a restrained four-record index: Volume, Projects and Collaborations, About, and Contact. Records collapse and morph between states, only one opens at a time, and direct section URLs are supported.
- Volume contains GROUND ZERO and IV. GROUND ZERO releases a 5 × 4 grid of 20 textured FBX garments from the central Volume control; the garments load on demand and rotate asynchronously in one WebGL scene.
- Projects and Collaborations opens into an animated two-axis timeline covering 2020–2026.
- Project-specific expression is contained inside the persistent Direction and Design project frame.
- About, current work, and public contact information are aligned with the supplied resume.

## Developed case studies

- `projects/interstice` preserves the full Interstice case study and interaction set.
- `projects/index-index` preserves the full INDEX INDEX case study and interaction set.
- `projects/aira-bumi` preserves the full Aira Bumi case-study content and controls.
- `projects/mass-ex` contains the Mass Exodus / Slate case study.
- `projects/suburban-propaganda` contains the Suburban Propaganda case study.
- `projects/570` contains the 570 / The Pillow Bag case study.

Timeline records without a developed case study open as restrained document placeholders.

## Publish

Push the contents of this folder to the GitHub repository root and publish the branch root through GitHub Pages. `CNAME` already points to `direction.design`.
