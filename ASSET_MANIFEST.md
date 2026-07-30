# Foundation asset manifest

Only global identity, interface assets, and the explicit homepage sculpture
test are permitted during the content reset. Nothing in this manifest populates
a project route or project interior.

## Identity assets

### `assets/identity/direction-design-master-logo.svg`

- Purpose: persistent Direction and Design identity mark.
- Source: exact SVG supplied by the user; copied without vector modification.
- Geometry: `viewBox="0 0 352.22 236.19"` with four paths and a single
  `#231f20` fill.
- Use: preserve its 352.22:236.19 aspect ratio and retain the supplied master
  as the provenance copy.
- Accessibility: decorative when adjacent interface text names Direction and
  Design; otherwise expose the accessible name `Direction and Design`.

## System raster assets

### `assets/system/system-object.png`

- Purpose: neutral identity object in the Index system stage.
- Scope: site-wide interface identity only.
- Source: generated for this foundation with the built-in image generator.
- Art direction: a single pale translucent toroidal/ovoid technical object with
  a smaller inner sphere, isolated on cool eggshell paper, soft analogue
  diffusion, faint archival print grain, no text, no shadow theatre, and ample
  clear space.
- Placement: `object-fit: contain`; never crop the complete silhouette.
- Accessibility: decorative when adjacent metadata supplies the meaning.

Generation prompt:

> Create a single site-identity asset for a multidisciplinary design portfolio:
> an abstract pale translucent industrial object combining a softly irregular
> toroidal/ovoid outer ring and a smaller suspended inner sphere. Front-facing
> orthographic product-study composition, isolated in generous empty space on
> cool eggshell manual paper. Monochrome warm-grey and graphite, extremely
> restrained institutional navy undertone, soft analogue diffusion, faint
> halftone/archival print grain, technical museum-catalogue feeling. The object
> should feel real and photographed, not drawn or rendered as UI. No people, no
> letters, no numbers, no logo, no caption, no border, no grid, no dramatic
> shadow, no coloured gradient. Portrait canvas with extra negative space below
> for interface overlays.

### `assets/system/paper-stock.png`

- Purpose: restrained page-stock variation.
- Source: user-supplied reference texture.
- Use: retained as a foundation asset but currently inactive while the site
  uses the requested solid eggshell background.
- Restrictions: no book edge, black surround, stains, or printed marks should
  become a dominant visible motif.
- Accessibility: hidden in forced-colours mode and ignored by assistive
  technology.

### `assets/system/underwater-paper-atmosphere.png`

- Purpose: site-wide submerged-paper atmosphere for the visual direction
  `old documents underwater`.
- Source: generated with the built-in ImageGen tool from two user-supplied
  aged-paper texture references.
- Art-direction prompt:
  `Create a full-screen seamless atmosphere texture for a portfolio site:
  pale eggshell archival paper submerged underwater, very low-contrast cloudy
  refraction and caustic bands, soft vertical depth streaks, slight age,
  mineral grey-green monochrome, and a quiet centre for text. No objects,
  typography, borders, strong stains, black book edges, hard vignette, or
  dominant shadows. Use the supplied blank aged-paper pages as material
  references and preserve their paper tooth without reproducing page edges or
  printed marks.`
- Use: retained as a documented foundation asset but currently inactive while
  the site uses the requested solid eggshell background.
- Restrictions: decorative only; do not use it as project media or allow its
  darker regions to become content-bearing panels.
- Accessibility: ignored by assistive technology and removed in forced-colours
  mode.

## Typography

### Archivo Variable

- Files: `assets/fonts/archivo/`
- Role: display, headings, body copy, and large project names.
- License: SIL Open Font License.

### IBM Plex Mono

- Files: `assets/fonts/ibm-plex-mono/`
- Role: metadata, counters, labels, controls, dates, and coordinates.
- License: SIL Open Font License.

The previous Consolas file may remain for compatibility but is not part of the
Option 2 visual specification.

## Interface icons

Files in `assets/ui/` are sourced from Bootstrap Icons and covered by its MIT
license:

- `arrow-up-right.svg`
- `chevron-left.svg`
- `chevron-right.svg`
- `folder-fill.svg`
- `list.svg`
- `plus-lg.svg`
- `x-lg.svg`

Icons are loaded as external image assets. No emoji, Unicode arrows, or
hand-drawn inline SVG substitutes are used.

## Homepage fashion sculpture system

### `assets/models/fashion-sculptures/`

- Purpose: homepage-only procession of self-directed fashion sculpture studies.
- Source archive:
  `source-assets/3d-fashion/original-export/` (local and Git-ignored).
- Source selection: the supplied `detail-sculpture` variants only. Textured
  variants are archived and never requested by the homepage.
- Original source set: 30 sculpture files, 670.20 MiB, approximately 190
  million triangles.
- Deployment set: 29 unique Meshopt GLBs, 30.42 MiB total, 3.83 MiB maximum.
- Deduplication: two supplied sculpture files were byte-for-byte identical and
  therefore share one unique visual result.
- Optimization: native `gltfpack` simplification with an adaptive target around
  180k triangles, a 0.2% error ceiling, permissive seam handling, quantization,
  and high-ratio Meshopt compression.
- Exception handling: one extreme source mesh could not safely complete direct
  simplification. Its exporter-generated proxy is used as geometry only and is
  forced to the same white, rough sculpture material by the renderer.
- Runtime: one transparent Three.js canvas, four visible positions, nearby-only
  preload/cache, fixed per-model scale, slow yaw, one-minute complete cycle,
  orthographic framing, and a bottom fade.
- Compact/reduced-motion state: one stationary sculpture and no autonomous
  procession.
- Accessibility: canvas is decorative and hidden from assistive technology;
  the figure supplies a concise text alternative.

The rebuild and provenance record is in
`assets/models/fashion-sculptures/README.md`.

### `assets/vendor/three/`

- Pinned dependency: Three.js `0.178.0`.
- Files: complete matching `three.module.js`, `three.core.js`, `GLTFLoader`,
  `BufferGeometryUtils`, and `MeshoptDecoder`.
- License: MIT; local copy retained as `assets/vendor/three/LICENSE`.
- Network boundary: no CDN or third-party runtime request is required.

## Project-media boundary

Disallowed under `/projects/` and in all empty project records:

- PNG, JPEG, WebP, AVIF, GIF
- MP4, MOV, WebM
- MP3, WAV
- GLB, GLTF, FBX
- iframe, canvas, embed, object, audio, or video elements
- thumbnails, galleries, image placeholders, project-specific textures

Automated tests enforce this boundary.

The only GLB exception is the exact allowlisted set under
`assets/models/fashion-sculptures/web/`, used by the homepage and nowhere under
`/projects/`.
