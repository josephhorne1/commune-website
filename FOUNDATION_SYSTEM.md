# direction.design foundation system

Status: Foundation reset, Option 2  
Audience priority: employers, then collaborators, then a future customer audience  
Content state: verified registry metadata plus the draft Volume image record

## 1. Governing idea

direction.design is a technical folio and working index. It should feel measured,
editorial, and institutional without becoming sterile. The interface supplies
continuity while later project content is free to vary inside controlled
templates.

The current atmospheric revision is described as `old documents underwater`.
It retains the Option 2 information architecture while softening the page into
an aged, submerged document: porous paper, mineral grey-green ink, quiet depth,
large breathing room, and slow spatial transitions. This is a global system
language, not project content.

The system has two simultaneous reading speeds:

1. A 30-second employer view: identity, location, availability, practices,
   time span, selected work, and contact are immediately legible.
2. A deep archive view: every record can be explored through chronology,
   practice, context, and parent-child relationships.

No splash screen, entry gate, autoplay, or required gesture may delay the first
view. Core comprehension never depends on operating the timeline.

## 2. Information model

### Contexts

Contexts describe the circumstances of work. They are filters, not separate
websites.

- Industry — proof of professional contribution and employment capability.
- Independent — proof of taste, initiative, and sustained personal practice.
- Academic — proof of development, experimentation, and adaptability.
- A record may belong to more than one context.

### Practices

Practices are the primary cross-project discovery system.

1. Creative Direction
2. Fashion & Garment Design
3. Visual Identity & Graphic Design
4. Image & Film
5. Product & 3D
6. Music & Live Experience

Each practice has a permanent route. A future project tag therefore opens a
clear collection page rather than an overlay or an ambiguous “focus” section.

### Record kinds

- Project — one bounded piece of work.
- Body — a sustained independent body of related work.
- Experience — employment, collaboration, or an ongoing role.
- Event — a time-bound public production.
- Education — a parent record for academic work.

Parents contain children through `parentId`. Context does not determine the
visual template.

### Content states

- `empty` — title-only project route; no project media or interior copy.
- `draft` — private editorial development.
- `published` — complete public case study.
- `archived` — preserved public record with an explicit status.

During the foundation reset Volume is the first `draft` record. Every other
current record remains `empty`.

## 3. Route inventory

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Index | Immediate overview in a condensed full-width folio sequence |
| `/work/` | Work Registry | Complete filterable list of records |
| `/timeline/` | Timeline | Chronological canvas and accessible list |
| `/practices/` | Practice Index | Six tangible folder-like collections |
| `/practices/{slug}/` | Practice Collection | All records belonging to one practice |
| `/about/` | Profile Dossier | Biography, working model, capabilities, and location |
| `/contact/` | Contact | Employment, collaboration, commission, and project enquiries |
| `/projects/{slug}/` | Project Record | Name-only shell by default; Volume begins the Visual Folio template |
| `/404.html` | Not Found | Registry-style recovery route |

The primary navigation is always:

`Index / Timeline / Practices / About / Contact`

Work Registry is intentionally a secondary route reached from selected-work
lists and archive controls.

## 4. Index composition

### Homepage opening sequence

The opening identity zone now reads as one deliberate full-width sequence:

1. A thin project ticker links the seven curated featured records above the
   Volume field. JavaScript randomizes their visual order on each load without
   changing the underlying registry or featured set.
2. The full-width Volume carousel moves left to right and links directly to the
   draft Volume image record.
3. Navigate by practice and the Based/Available metadata form the directory at
   left while the fashion-turntable field occupies the open field at right.
4. A direct link to the complete Work Registry sits beside the selected
   chronology and its route to the full Timeline.
5. Active-record metadata, selected work, availability, and location condense
   into one archive block below the chronology.
6. The practice field is the final page section. Its square tiles adapt to the
   viewport while preserving exactly five complete rows, and visible imagery
   is held at 64% opacity.

The Volume and fashion fields begin in autonomous mode but never trap input.
When their dynamic presentations are available, slow wheel input takes control
at `1x`. Sustained fine-pointer input builds a decaying energy signal that drives
capped exponential acceleration and a transient motion blur; sparse input never
inherits the prior burst. Each field keeps separate target and current positions
and resolves them through a `requestAnimationFrame` ease, so wheel cadence does
not appear as discrete visual jumps. A takeover exposes one complete manual lap
from its current phase. Once that target and the visible field reach the lap
boundary, the next outward wheel event is not intercepted and returns to normal
vertical page scrolling. Automatic motion resumes three seconds after the final
wheel event or horizontal swipe release.

Touch/pen input does not take over on contact alone. Horizontal control begins
only after the gesture passes the axis threshold and resolves horizontally;
vertical intent remains native page panning. Dragging suppresses the covered
link only for that gesture, so an ordinary tap or keyboard activation still
opens the associated permanent route.

The ticker is ordinary navigation rather than a live announcement. Its source
links remain static and operable without JavaScript. Hover pauses the enhanced
loop; keyboard focus removes the moving duplicate and restores a static,
horizontally scrollable link row. Reduced-motion mode uses the same static
reading, and every title retains an ordinary permanent project URL.

### Homepage fashion-turntable procession

The opening identity zone contains a homepage-only procession of self-directed
fashion turntable studies in the open field to the right of the identity copy.

- Five complete spatial positions remain visible, with buffered looks entering
  and leaving beyond the viewport edges.
- A 50-second base automatic cycle advances through all 20 supplied looks.
- Original GIF provenance is retained outside the deployable tree at
  `source-assets/fashion-turntables/original-gifs/`; that archive is local and
  Git-ignored.
- Transparent 12 fps animated WebPs travel right to left at the base rate
  without scale tweening.
- Every position uses one viewport-relative stride. Automatic travel uses the
  base cycle; manual wheel targets are eased into the current position on a
  `requestAnimationFrame` clock while direct horizontal swipes follow the
  pointer after axis lock. Five look centres remain distributed across the
  widened field.
- Slow wheel input keeps travel and garment playback at `1x`. Sustained
  fine-pointer input accumulates a time-decaying energy value, accelerates
  spatial travel exponentially to a `6x` cap, and introduces motion blur only
  for the accelerated interval.
- Visible mounted garment loops follow the accelerated signal through in-memory
  `1x`, `1.5x`, `2x`, `3x`, and `4x` playback tiers created by retiming WebP
  frame durations. Tier changes are coalesced so brief thresholds do not churn
  image sources; hidden buffers remain untouched, and settlement restores
  directly to the original `1x` sources. No speed-variant files are deployed.
- Automatic travel resumes after the three-second idle interval. The fixed
  optical scale assigned to each look never changes.
- Full-body exports remain at scale `1`; upper-body exports use documented,
  top-anchored scale corrections so body and garment landmarks remain
  proportionate.
- The lower image field fades into the page; no floor, shadow plane, box, or
  viewer controls are exposed.
- Loading begins only when the field approaches the viewport. The runtime
  maintains a maximum ten-item image cache, using lightweight posters for the
  far buffers and warming animation before each right-edge entry is exposed.
- Capable mobile devices use the same dynamic individual-look procession with
  direct horizontal swipe control. The optimized 5-by-4 contact sheet is a
  compact loading fallback, not the default mobile presentation.
- Reduced-motion, Save-Data, and low-memory modes avoid the dynamic multi-look
  runtime. Compact screens receive the static 5-by-4 poster and larger
  constrained screens receive a still poster; the complete gallery link and
  ordinary manual navigation remain available.
- The procession links to a complete 20-look grid on the Fashion & Garment
  Design practice route.
- The shared homepage motion control pauses the ticker, Volume carousel,
  procession, and practice-field crossfades. Off-screen and hidden-tab pauses
  preserve the current procession and practice-field state.

This is a global system study, not populated project content.

### Desktop, 1280px and wider

The opening uses a full-width vertical sequence rather than forcing identity
and archive material into one rigid viewport. Navigate by practice and the
Based/Available facts occupy the directory column beside the wider garment
field. The Work Registry and selected chronology lead into a compact two-column
active-record and selected-work block. The five-row practice field follows as
the page endpoint. The fixed bottom navigation remains 64px.

### Scroll-linked record selection

The homepage remains a normal vertical document. On larger screens, scroll
progress may update which featured record is reflected in the compact active
record block, but it never changes section geometry, intercepts input, or snaps
between states.

### Smaller breakpoints

- 1024–1279px: the directory and garment field retain the opening emphasis
  while their spacing compresses.
- 768–1023px: the directory/garment and registry/chronology pairs stack into a
  sequential reading.
- Below 768px: ticker, Volume, practice links, Based/Available facts, garment
  field, registry, chronology, active record, selected work, availability, and
  location read vertically before the final practice field.
- Capable touch devices retain the dynamic Volume and garment fields with
  horizontal swipe takeover; reduced-motion and constrained devices receive the
  bounded static presentations described above.
- Mobile uses a chronological list and never a multi-viewport sticky
  transformation.

## 5. Timeline

### Compact timeline

The Index timeline shows the full career span, selected records as strong nodes,
and the remainder as restrained nodes. Selection synchronizes the compact
active-record block. It never autoplays.

### Full timeline

The dedicated route supplies:

- Year scale from first record through the present.
- Flat duration bars for bodies, employment, and education.
- Deterministic vertical lanes.
- Practice and context filters.
- Timeline/list view control.
- Previous/next controls and keyboard navigation.
- URL query state for active record and filters.

At wide sizes labels may use the requested 45-degree orientation. Selected and
focused labels resolve horizontally. Mobile and reduced-motion modes default to
the chronological list.

## 6. Practice folders

The Practice Index makes the category system tangible.

- Six tabbed, outline-only folders.
- One active folder is fully visible.
- Previous folders collect at left; upcoming folders collect at right.
- Direct drag follows input; buttons settle one folder in 480–560ms.
- Every folder shows its name, definition, record count, representative names,
  and a direct collection link.
- Mobile uses native horizontal scrolling with a visible next-card edge,
  followed by a complete vertical list.

The folder silhouette is a sourced interface asset. No photorealistic office
props, fake shadows, or ornamental stationery are used.

## 7. Project template families

Volume begins development of the Visual Folio template with verified metadata
and the exact shared image set. The other templates remain dormant while their
records are empty, defining the future system without placing filler inside
current routes.

### A. Registry Dossier

For direction, identity, events, campaigns, and conventional case studies.

1. Title, period, context, role, and practices
2. One-sentence verified summary
3. Contribution and scope
4. Outcome or deliverable strip
5. Evidence modules
6. Process or responsibilities
7. Credits
8. Related records and practices

### B. Visual Folio

For fashion, garment, photography, film, and image-led work.

1. Quiet cover plate
2. Essential metadata
3. Sequenced plates and spreads
4. Detail rows or contact sheets
5. Figure captions
6. Optional short notes
7. Credits and related work

### C. System / Process Study

For product, 3D, identity systems, fabrication, and production development.

1. Cover and verified brief
2. Constraints and responsibilities
3. Process or relationship diagram
4. Research and evidence
5. Iteration sequence
6. Final system or output
7. Outcome, specifications, credits, and related work

### Collection container

Bodies, experiences, and education use a structural parent container. It
contains period, contexts, high-level role, lineage, and a child-record index.
Each child then uses A, B, or C. This preserves long-running independent bodies
without hiding individual pieces of work.

## 8. Shared components

### Global

- App shell
- Skip link
- Site identity
- Registry header
- Coordinate stamp
- Folio counter
- Availability indicator
- Bottom navigation
- Route announcer
- Section rule

### Archive

- Featured-project ticker
- Homepage practice directory
- Registry/chronology reference row
- Compact active-record and selected-work block
- Adaptive five-row practice field
- Work-registry row
- Context and practice filters
- Compact and expanded timelines
- Timeline ruler, node, and duration bar
- Practice folder stack
- Practice collection list
- Empty-results state

### Project

- Name-only project state
- Project masthead
- Metadata table
- Outcome strip
- Figure plate
- Media spread and grid
- Process sequence
- Diagram stage
- Text note
- Credits block
- Collection lineage
- Related practices
- Previous/next record controls

Absent modules are hidden completely. The site never displays empty media
frames, `TBD`, lorem ipsum, “coming soon,” or fabricated project summaries.

## 9. Visual tokens

### Atmospheric revision

- Current paper: `#EEEDE2`.
- Raised paper: `#F1F0E6`.
- Deep paper: `#E6E5DA`.
- Cool paper: `#E9E9DF`.
- Mineral ink: `#484D48`.
- Graphite: `#5A5F59`.
- Muted ink: `#737871`.
- Quiet ink: `#969990`.
- Submerged olive: `#626D64`; deep state: `#4D574F`.
- Status/mineral green: `#6C756B`.
- Rules use mineral ink at 20%, 10.5%, and 5.5% opacity.
- `paper-stock.png` and `underwater-paper-atmosphere.png` remain documented
  assets but are inactive in the current solid-background presentation.
- Depth comes from texture, density, overlap, opacity, and typographic weight;
  cards, hard boxes, decorative shadows, and visible panel borders are removed.
- Page spacing uses `clamp(1.25rem, 4.1vw, 5rem)` so whitespace expands
  continuously instead of switching between rigid page frames.
- The supplied master identity is
  `assets/identity/direction-design-master-logo.svg`; preserve its aspect ratio
  and native `#231f20` monochrome fill.

### Colour

- Paper: `#F2F0E9`
- Raised paper: `#F7F5EF`
- Graphite: `#171A19`
- Muted ink: `#666A66`
- Quiet ink: `#858983`
- Rule: `rgba(23, 26, 25, 0.28)`
- Institutional navy: `#214F87`
- Status green: `#586A4D`

The palette is cool eggshell and graphite. The supplied paper stock sits at low
opacity and must never become a yellow vintage-page effect.

### Type

- Display and body: Archivo Variable, self-hosted.
- Metadata and controls: IBM Plex Mono, self-hosted.
- Display scale: `clamp(42px, 4.2vw, 64px)`.
- Body: 16px / approximately 1.5.
- Metadata: 12–13px, never below 12px.
- Navigation labels: uppercase mono with restrained tracking.

No decorative ledger serif, distressed face, or grunge type is part of the
foundation.

### Geometry

- Homepage: full-width linear sequence with two-column opening and archive
  blocks where space permits.
- Rules: 1px.
- Radius: 0 except small functional controls where needed.
- Bottom rail: 64px desktop, 58px touch.
- Interactive targets: minimum 44×44px.
- Layout spacing is based on 8px multiples with 12px and 20px editorial
  exceptions.

### Texture and imagery

- `assets/system/paper-stock.png` supplies restrained paper grain.
- `assets/system/underwater-paper-atmosphere.png` supplies the generated
  submerged-document depth field when texture is enabled; it is inactive now.
- `assets/system/system-object.png` retains provenance for the removed neutral
  identity-object study and is not rendered by the current Index.
- `assets/media/fashion-turntables/` supplies the allowlisted homepage-only
  animated fashion procession.
- System texture is decorative, `pointer-events: none`, and removed in forced
  colours.
- Project images, thumbnails, video, audio, and 3D assets remain absent.

## 10. Motion

- Hover and focus response: 120–160ms.
- Navigation state: 160ms.
- Dossier change: 180–240ms.
- Drawer: 260–320ms.
- Folder settle: 480–560ms, `cubic-bezier(.22,1,.36,1)`.
- Route reveal: 280–360ms.
- Scroll-linked geometry: direct progress, no duration.

- Atmospheric document transitions use a 140ms fade/soft blur on exit and a
  300ms fade/soft blur with a 0.75rem rise on entry.
- Link and control colour/opacity changes use 170ms; spatial/filter responses
  use 230ms with `cubic-bezier(.22,.75,.18,1)`.

Autonomous motion is limited to the homepage project ticker, Volume image
field, fashion-turntable procession, and practice-field crossfades. These are
progressive enhancements, never gates: they do not change routes, move focus,
or hide the static information and ordinary links beneath them. The shared
motion control pauses the project ticker, Volume and fashion travel, and
practice-field crossfades; the ticker also pauses on hover and becomes a static
link row on focus.

The Volume and fashion fields accept bounded wheel input and horizontal
touch/pen input after axis lock. Input pauses automatic travel and resets a
three-second idle timer. Sparse wheel movement remains at `1x`; sustained
fine-pointer input accumulates a decaying energy signal, accelerates
exponentially to a `6x` spatial cap, and applies transient blur only while that
signal remains elevated. Manual wheel targets ease toward their rendered
positions on `requestAnimationFrame` rather than jumping at event cadence.

Each takeover begins a finite lap from the current automatic phase. The event
that finishes a remaining visual move is consumed, and the next outward wheel
event after settlement passes back to the vertical document. Fashion animations
use coalesced, visible-only in-memory playback tiers up to `4x` and restore
directly to `1x` as the accelerated interval settles. Direct manipulation
remains available while the shared motion control has paused autonomous travel.

Reduced motion makes the ticker static, converts the Volume field to a native
horizontally scrollable single image set, holds the practice field on still
frames, and replaces the fashion procession with its constrained poster
presentation. Save-Data and low-memory devices use the same bounded fashion
fallback. Permanent Volume and garment-gallery links remain operable in every
mode. Artificial loading delays, automatic route changes, and autoplaying
timeline or dossier selection remain prohibited.

## 11. Accessibility contract

Target: WCAG 2.2 AA.

- Body text contrast is at least 4.5:1.
- Large text and essential graphics are at least 3:1.
- Focus uses a visible 2px navy outline with offset.
- Every route has one H1 and semantic landmarks.
- Navigation exposes `aria-current="page"`.
- Timeline information exists as structured text, not only transformed labels.
- Folder controls are normal links and buttons; never `role="application"`.
- Hover preview is optional; all information is available by focus and click.
- The project ticker exposes one semantic link set; focus and reduced-motion
  modes remove its visual duplicate and continuous movement.
- Carousel swipes lock only after horizontal intent, preserve vertical touch
  panning, and suppress link activation only after an actual drag.
- Desktop wheel capture covers exactly one manual lap from the takeover phase.
  After smoothed travel settles at its boundary, the next outward input is
  released to the page so neither carousel becomes a scroll trap.
- No information relies on colour alone.
- Forced colours, reduced motion, 200% zoom, 400% reflow, keyboard use, and
  no-JavaScript navigation remain operable.

## 12. Reset boundary

Keep:

- Direction and Design / Joseph Horne identity.
- Verified site-wide, About, and Contact copy.
- Project titles, slugs, dates, contexts, kinds, tags, relationships, and
  featured order.
- The route system and accessibility labels.
- Neutral system assets and interface icons.

Exclude:

- Every project image, video, audio file, embed, 3D scene, thumbnail, gallery,
  and project-specific background except the exact 24-image Volume collection.
  The homepage turntable field remains a separate allowlisted system asset and
  does not enter any project route.
- Project descriptions, case-study copy, captions, outcomes, credits, and
  process text.
- Old bespoke project layouts and runtimes.
- Fabricated copy from the generated visual reference.
- Placeholder boxes and “coming soon” panels.

The media allowlist is limited to global system assets, the exact homepage
fashion-turntable set, and the two home-collection WebP sets. Volume references
its shared home-collection assets in place. The `/projects/` tree must still
contain HTML and shared project-shell CSS only.

Twenty-seven current project routes remain name-only placeholders. Volume is
the one draft exception: it may present the exact shared 24-image set, neutral
plate numbering, and verified registry metadata, but no invented descriptions,
outcomes, credits, or process claims.

## 13. Population sequence

1. Confirm final names, dates, contexts, parent relationships, and practice tags.
2. Assign each record a template based on communication need.
3. Populate one representative project from each template family.
4. Test those three records with employers and collaborators.
5. Refine modules before scaling content entry.
6. Populate parent collections and connect child records.
7. Complete accessibility, performance, metadata, and search indexing.
8. Only then introduce store architecture as a separate commercial layer.

## 14. Acceptance gates

- The opening sequence communicates identity, curated featured records,
  location, availability, six practices, registry access, chronology, selected
  work, and a contact path.
- At least one industry record and one academic/industry hybrid are visible
  without operating the timeline.
- Every record has an ordinary permanent URL.
- Index, Timeline, Work, and Practice views derive from one registry.
- Empty project routes contain no project media or interior copy.
- Desktop, tablet, mobile, keyboard, reduced-motion, and no-JavaScript states
  are verified.
- The ticker remains clickable while moving, pauses through the shared control,
  and resolves to one static, horizontally scrollable link set for focus,
  reduced-motion, and no-JavaScript use.
- Volume and fashion automatic travel yield to slow `1x` wheel input and
  horizontal swipe input after axis lock, hold for three seconds after release,
  and resume from the current visual position when autonomous motion is allowed.
- Sustained fine-pointer desktop input uses decaying-energy, capped exponential
  acceleration with smoothed target/current travel and transient motion blur.
  Fashion WebP tier requests are coalesced, affect visible records only, and
  restore directly to `1x`; after one manual lap settles, the next outward wheel
  event returns to page scrolling.
- Capable mobile devices retain direct dynamic swipe interaction; reduced-motion,
  Save-Data, and low-memory fallbacks keep the underlying images and permanent
  project/gallery routes manually accessible.
- The complete homepage fashion-turntable animation/poster package remains
  below 42 MiB, each animated WebP remains below 3 MiB, and nearby looks are
  locally hosted and progressively loaded.
- The implementation is visually compared with the selected Option 2 reference
  at the same viewport before handoff.
