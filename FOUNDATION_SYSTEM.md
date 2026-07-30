# direction.design foundation system

Status: Foundation reset, Option 2  
Audience priority: employers, then collaborators, then a future customer audience  
Content state: project names and verified registry metadata only

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

During the foundation reset every current record remains `empty`.

## 3. Route inventory

| Route | Page | Purpose |
| --- | --- | --- |
| `/` | Index | Immediate overview in the Option 2 three-zone folio |
| `/work/` | Work Registry | Complete filterable list of records |
| `/timeline/` | Timeline | Chronological canvas and accessible list |
| `/practices/` | Practice Index | Six tangible folder-like collections |
| `/practices/{slug}/` | Practice Collection | All records belonging to one practice |
| `/about/` | Profile Dossier | Biography, working model, capabilities, and location |
| `/contact/` | Contact | Employment, collaboration, commission, and project enquiries |
| `/projects/{slug}/` | Project Record | Name-only shell now; selected template when populated |
| `/404.html` | Not Found | Registry-style recovery route |

The primary navigation is always:

`Index / Timeline / Practices / About / Contact`

Work Registry is intentionally a secondary route reached from selected-work
lists and archive controls.

## 4. Index composition

### Desktop, 1280px and wider

The first viewport uses approximately:

- Left identity zone: 22%
- Centre system zone: 52%
- Right dossier zone: 26%
- Fixed bottom navigation: 64px

The left zone establishes identity, positioning, six practice links, location,
and availability. The centre uses the neutral system object, measured
crosshairs, active-record metadata, and a compact timeline. The right zone
contains the active record counter and the selected-work list.

The system object is identity material, not project content.

### Scroll-linked expansion

On large screens the Index may use a native-scroll sticky stage:

- 0–18%: stable three-zone overview.
- 18–55%: side zones narrow continuously.
- 55–90%: timeline dots resolve into labels and duration bars.
- 90–100%: the stage releases into a Practice Index preview.

Scroll input is never intercepted. Geometry follows progress directly so the
user can stop midway. There is no snap transition.

### Smaller breakpoints

- 1024–1279px: identity becomes a top registry strip; system stage and dossier
  form two columns.
- 768–1023px: one primary stage with sequential identity and dossier bands.
- Below 768px: identity, practice links, system object, active record,
  chronology, selected work, and contact read vertically.
- Mobile uses a chronological list and never a multi-viewport sticky
  transformation.

## 5. Timeline

### Compact timeline

The Index timeline shows the full career span, selected records as strong nodes,
and the remainder as restrained nodes. Selection synchronizes the centre
metadata and right dossier. It never autoplays.

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

Templates are dormant while records are empty. They define the future content
system without placing filler inside current routes.

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

- System-object stage
- Active-record dossier
- Selected-work list
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
- `paper-stock.png` remains a faint base grain at approximately 7.2% opacity.
- `underwater-paper-atmosphere.png` sits above it at approximately 10.5%
  opacity, `multiply` blend, cover sizing, and a 0.35px soft blur.
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

- Main desktop grid: 22 / 52 / 26.
- Rules: 1px.
- Radius: 0 except small functional controls where needed.
- Bottom rail: 64px desktop, 58px touch.
- Interactive targets: minimum 44×44px.
- Layout spacing is based on 8px multiples with 12px and 20px editorial
  exceptions.

### Texture and imagery

- `assets/system/paper-stock.png` supplies restrained paper grain.
- `assets/system/underwater-paper-atmosphere.png` supplies the generated
  submerged-document depth field.
- `assets/system/system-object.png` supplies the neutral identity object.
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

No autonomous loop, artificial loading delay, or autoplay carousel is allowed.
Reduced motion replaces transforms with immediate layout and at most an 80ms
opacity change.

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
  and project-specific background.
- Project descriptions, case-study copy, captions, outcomes, credits, and
  process text.
- Old bespoke project layouts and runtimes.
- Fabricated copy from the generated visual reference.
- Placeholder boxes and “coming soon” panels.

The media allowlist is limited to global system assets. The `/projects/` tree
must contain HTML and shared project-shell CSS only.

Every current project route remains a name-only placeholder. The atmospheric
revision does not authorize project imagery, interior copy, captions, outcomes,
credits, or project-specific layouts.

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

- The first viewport communicates identity, location, availability, six
  practices, time span, selected work, and a contact path.
- At least one industry record and one academic/industry hybrid are visible
  without operating the timeline.
- Every record has an ordinary permanent URL.
- Index, Timeline, Work, and Practice views derive from one registry.
- Empty project routes contain no project media or interior copy.
- Desktop, tablet, mobile, keyboard, reduced-motion, and no-JavaScript states
  are verified.
- The implementation is visually compared with the selected Option 2 reference
  at the same viewport before handoff.
