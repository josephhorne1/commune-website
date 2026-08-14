# Foundation asset manifest

Only global identity, interface assets, and the explicit homepage media systems
are permitted during the content reset. The draft Volume record references its
shared homepage image set in place; no media is copied into `/projects/`.

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

- Purpose: retained provenance for the removed neutral Index-object study.
- Scope: dormant system asset; not rendered by the current homepage.
- Source: generated for this foundation with the built-in image generator.
- Art direction: a single pale translucent toroidal/ovoid technical object with
  a smaller inner sphere, isolated on cool eggshell paper, soft analogue
  diffusion, faint archival print grain, no text, no shadow theatre, and ample
  clear space.
- Former placement: `object-fit: contain`; the current Index does not load it.
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

## Homepage fashion turntable system

### `assets/media/fashion-turntables/`

- Purpose: homepage-only procession of self-directed animated fashion studies.
- Source archive:
  `source-assets/fashion-turntables/original-gifs/` (local and Git-ignored).
- Original source set: 20 transparent GIFs, 605.32 MiB total; every source is
  1080×1350, 180 frames, and a nine-second 20 fps loop.
- Deployment set: 20 transparent animated WebPs at 600×750 and 108 frames,
  plus 20 matching static WebP posters. Animations total 36.01 MiB, the largest
  is 2.71 MiB, and the complete animated/poster package is 36.51 MiB.
- Optimization: premultiplied-alpha Lanczos resizing, even temporal resampling
  to 12 fps, WebP quality 72, and encoder method 3. Hidden green RGB beneath the
  supplied alpha is discarded without chroma-keying garment colours.
- Proportional normalization: full-body exports remain at scale `1`; the three
  upper-body exports use fixed top-anchored scale values of `0.82`, `0.56`, and
  `0.62` so garment/body landmarks remain proportionate.
- Runtime: five complete positions plus off-screen buffers, a ten-item maximum
  DOM cache with poster-only far buffers, deferred intersection loading, fixed
  per-look scale, a 50-second base collection cycle, and horizontal/bottom
  fades. Slow wheel input remains at `1×`; sustained fine-pointer input builds a
  decaying energy signal for capped exponential acceleration up to `6×` and
  transient motion blur. Target/current positions are eased on
  `requestAnimationFrame`. Each takeover provides one full manual lap from its
  current phase; after the field settles at the boundary, the next outward wheel
  event returns to the document. Horizontal touch/pen takeover begins only after
  axis lock. Autonomous motion resumes three seconds after input ends. No WebGL
  or third-party runtime remains.
- Variable playback: desktop acceleration maps visible animated WebPs to `1×`,
  `1.5×`, `2×`, `3×`, or `4×` timing tiers. Requests are coalesced during a
  burst, hidden records are not retimed, and settlement restores affected
  records directly to `1×`. The runtime copies the cached WebP RIFF buffer,
  shortens its in-memory frame durations, and displays a temporary Blob URL; it
  does not add deployment files or change the source derivatives.
- Compact state: capable devices use the same dynamic, swipeable procession.
  The 720×720, 5-by-4 animated WebP contact sheet (72 frames, 8 fps,
  1.40 MiB) remains a compact loading fallback, while reduced-motion,
  Save-Data, and low-memory modes use a still poster fallback (the 24 KiB
  composite poster on compact screens).
- Accessibility: images are decorative and hidden from assistive technology;
  the figure supplies a concise text alternative, a labelled link to the full
  garment grid, and a pause/resume control.

The rebuild and provenance record is in
`assets/media/fashion-turntables/README.md`.

## Homepage Volume and practice collections

### `assets/media/home-collections/`

- Purpose: a full-width left-to-right Volume carousel and a responsive five-row practice
  mosaic with independently crossfading image pairs.
- Sources: the user-supplied `Volume Images` and `Grid images` folders. The
  originals remain untouched outside the repository.
- Volume deployment set: 24 selected WebPs with preserved aspect ratios and a
  shared display height; 1.95 MiB total.
- Practice deployment set: 50 square WebPs reused across responsive crossfade pairs; 2.45 MiB
  total.
- Preparation: EXIF orientation, Lanczos downsampling, sequential lowercase
  filenames, and source-name/dimension/byte provenance JSON.
- Runtime: the Volume row duplicates one complete group and uses a JavaScript
  `requestAnimationFrame` clock for its continuous left-to-right loop. Slow wheel
  input stays at `1×`; sustained fine-pointer input uses decaying-energy, capped
  exponential acceleration up to `6×` with transient motion blur. Manual targets
  ease into their rendered positions on that same frame clock. Each takeover
  permits one complete lap from its current phase; after settlement, the next
  outward wheel event falls through to normal page scroll. Horizontal touch/pen
  movement takes over only after axis lock, and autonomous motion resumes three
  seconds after input ends. The practice grid preloads two unique layers per
  slot and crossfades them on deterministic independent intervals.
- Accessibility: both homepage fields are decorative; the Volume field is
  wrapped by a labelled link to its project record, and the shared homepage
  motion control pauses the carousel and every crossfade. On the draft Volume
  route the same files appear as numbered plates; alternative text remains
  deliberately empty until factual image descriptions are verified.

## Project-media boundary

Disallowed under `/projects/` and in all empty project records:

- PNG, JPEG, WebP, AVIF, GIF
- MP4, MOV, WebM
- MP3, WAV
- GLB, GLTF, FBX
- iframe, canvas, embed, object, audio, or video elements
- thumbnails, galleries, image placeholders, project-specific textures

Automated tests enforce this boundary.

The only project-external media exceptions are the exact WebP allowlists under
`assets/media/fashion-turntables/` and `assets/media/home-collections/`. The
turntables are used by the homepage and Fashion practice collection. The 24
Volume WebPs are also referenced in place by the draft `/projects/volume/`
record; no media files are copied under `/projects/`.
