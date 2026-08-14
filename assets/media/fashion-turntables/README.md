# Homepage fashion turntables

This directory contains the web derivatives for the homepage-only animated
fashion procession. It does not supply media to any project route.

## Source

The 20 original GIF exports are preserved outside the deployable asset tree at:

```text
source-assets/fashion-turntables/original-gifs/
```

That source directory is Git-ignored. Each original is 1080×1350, 180 frames,
nine seconds, and 20 fps. The complete source set is 605.32 MiB.

The green field visible in some file previews is RGB stored beneath the GIF's
real transparent palette index. The preparation pipeline preserves the supplied
alpha; it does not chroma-key teal or green garment pixels.

## Web package

- `animated/`: 20 transparent animated WebPs, 600×750, 108 frames, 12 fps,
  and nine seconds.
- `posters/`: matching transparent static WebPs for fallback and
  reduced-motion presentation.
- `mobile-grid.webp`: a 720×720 animated 5-by-4 compact loading fallback,
  with `mobile-grid-poster.webp` as the reduced-motion and constrained-device
  counterpart.
- `manifest.js`: source names, URLs, dimensions, crop classification, and fixed
  optical scale values.
- `prepared-assets.json`: generated dimensions, bounds, frame counts, durations,
  and byte sizes from the most recent preparation run.

The animations total 36.01 MiB, no animation exceeds 2.71 MiB, and the complete
animated/poster package is 36.51 MiB. Runtime code keeps at most ten look nodes
mounted, displays five complete positions, and preloads off-screen buffers so a
new look is ready before entering from the right. Capable compact devices use
the same dynamic procession and horizontal swipe control as wider layouts. The
1.40 MiB mobile contact sheet masks compact loading only; reduced-motion,
Save-Data, and low-memory modes resolve to the static poster fallback.

## Runtime interaction

The autonomous procession advances through the collection on a 50-second base
cycle. Slow wheel movement takes over at `1×`. Sustained fine-pointer input
builds a time-decaying energy signal, accelerates exponentially to a `6×` cap,
and applies transient motion blur only while that elevated signal is active.
Target and current positions remain separate, with the visible position eased
on `requestAnimationFrame` so manual travel does not inherit wheel-event steps.

Each takeover grants one complete manual lap from the current automatic phase.
The event needed to finish the eased move remains assigned to the procession;
after the field settles at its lap boundary, the next outward wheel event is not
consumed and the document continues scrolling normally. Horizontal touch/pen
control begins only after the gesture resolves through the horizontal axis lock,
preserving vertical page panning. Autonomous motion remains paused for three
seconds after the last wheel event or horizontal swipe release, then continues
from that position.

The same desktop speed signal retimes visible mounted garment animations to one
of five tiers: `1×`, `1.5×`, `2×`, `3×`, or `4×`. Upward tier requests are
coalesced during a burst, hidden buffer records are not retimed, and settlement
restores affected records directly to their original `1×` source. The browser
fetches the existing animated WebP once, copies its RIFF buffer, shortens the
`ANMF` frame durations in memory, and presents the result through a temporary
Blob URL. These variants are runtime-only: no extra animation files are
deployed, and the source WebPs and package byte totals remain unchanged.

## Proportional scale

The exporter expands every silhouette to nearly the full source canvas, even
when a look shows only the upper body. Normalizing by image bounds alone would
therefore make cropped garments visibly oversized.

`manifest.js` keeps full-body and full-garment exports at `1`. Three cropped
exports use fixed top-anchored scale corrections:

- `Alien 2.gif`: `0.82`
- `Basics 3.gif`: `0.56`
- `1__06d1c551.gif`: `0.62`

The scale never changes while an item moves or fades.

## Rebuild

Use the bundled Codex Python runtime or another Python environment containing
Pillow and NumPy:

```text
python scripts/prepare-fashion-turntables.py \
  --source "source-assets/fashion-turntables/original-gifs" \
  --output "assets/media/fashion-turntables" \
  --width 600 \
  --fps 12 \
  --quality 72 \
  --method 3
```

The preparation step uses premultiplied-alpha Lanczos resizing, discards hidden
green RGB safely, reduces frame rate, and writes deterministic `look-01` through
`look-20` filenames. Rerun `npm run build` afterward to enforce the media and
performance boundaries.

The compact contact sheet is rebuilt from those derivatives with:

```text
python scripts/prepare-home-media.py fashion-grid \
  --source assets/media/fashion-turntables/animated \
  --output assets/media/fashion-turntables \
  --columns 5 --cell-width 144 --cell-height 180 --fps 8
```
