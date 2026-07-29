# direction.design — successful reset contract

Status: Reset verified locally on 2026-07-28

## Architecture

- The entry gate and accordion index are removed.
- The homepage immediately communicates identity, scope, selected work, and
  contact routes.
- Native vertical scrolling continuously expands the compact chronology.
- The complete chronology and Practices index use one shared record registry.
- Contexts are multi-value metadata rather than mutually exclusive site lanes.
- Mobile and reduced-motion modes use static, sequential layouts.
- Project links are ordinary routes rather than iframe overlays.

## Content state

- Volume remains an independent-practice record without its deferred 3D runtime.
- All 23 legacy labels remain present.
- The six selected records are Volume, 570 / The Pillow Bag, PUPIL / Sean Leon,
  Mass Exodus / Slate, Muhann.Studio, and Interstice.
- Every project route is a name-only shell.
- No project media or project-interior copy is deployed.

## Release gate

The reset is releasable only when:

1. `npm run build` passes.
2. Every project route resolves without missing assets.
3. Browser console and network checks are clean.
4. Desktop, tablet, mobile, keyboard, and reduced-motion behavior pass.
5. `design-qa.md` reports `final result: passed`.
