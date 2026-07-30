# Fashion sculpture web set

This folder contains the homepage-only web derivatives for the self-directed
fashion sculpture procession.

## Source and deploy boundaries

- Local source archive:
  `source-assets/3d-fashion/original-export/`
- Deployed model manifest:
  `assets/models/fashion-sculptures/manifest.js`
- Deployed web meshes:
  `assets/models/fashion-sculptures/web/`
- Rebuild script:
  `scripts/optimize-fashion-sculptures.ps1`

`source-assets/` is ignored by Git. It contains the complete original export,
including the sculpture, textured, proxy, thumbnail, catalogue, and demo files.
Only optimized sculpture-presentation meshes are deployed.

## Optimization record

- Original sculpture files: 30
- Original sculpture weight: 670.20 MiB
- Original sculpture triangles: approximately 190 million
- Deployed unique meshes: 29
- Deployed total: 30.42 MiB
- Largest deployed mesh: 3.83 MiB

Two supplied sculpture files were byte-for-byte identical, so one duplicate is
not deployed. Twenty-eight web meshes were simplified directly from their
`detail-sculpture` source. The densest source could not safely reach the web
budget with the native simplifier, so that single look uses the exporter's own
geometry proxy and receives the same forced white sculpture material at
runtime. Textured models and textures are never loaded by the homepage.

The optimizer uses Meshopt compression. Three.js, GLTFLoader, and MeshoptDecoder
are vendored locally under `assets/vendor/three/`.

## Rebuild

From the repository root:

```powershell
powershell.exe -ExecutionPolicy Bypass -File `
  ".\scripts\optimize-fashion-sculptures.ps1" `
  -SourceDirectory ".\source-assets\3d-fashion\original-export\assets" `
  -Force
```

The renderer keeps four positions visible, preloads only nearby looks, and
evicts distant decoded meshes. Compact and reduced-motion presentations load
one stationary sculpture.
