# ProtoFusionGirl — Animation System Plan

> Master index for the animation pipeline rebuild.
> All stages are iterative and independently deliverable.

---

## The Goal

Replace all placeholder canvas sprites with a fully generated, style-consistent
sprite catalog built from 3D source models — rendered in the original
**black silhouette on white, vibrant accent FX** visual style.

The pipeline is designed so that every character and environment asset can be
regenerated on demand by updating a source `.blend` file and running a single
build command.

---

## Stage Map

| Stage | Folder | What Gets Built | Deliverable |
|-------|--------|-----------------|-------------|
| **0** | `00-strategy/` | Decisions, style guide, architecture | Direction docs only |
| **1** | `01-foundation/` | Toolchain setup + one working Jane frame | First real sprite in-game |
| **2** | `02-jane-pilot/` | All 24 Jane animations rendered | Jane fully animated |
| **3** | `03-pipeline-tool/` | Automated render script + atlas generator | `npm run sprites` works |
| **4** | `04-full-roster/` | Terra, Aqua, enemies, Jono hologram | All characters animated |
| **5** | `05-world-art/` | Tileset, terrain, backgrounds | Real world visuals |
| **6** | `06-fx-layer/` | Particle FX, UL glyphs, ley-line pulses | Dynamic runtime effects |
| **7** | `07-integration/` | Phaser wiring, animation state machine | Fully integrated |
| **8** | `08-sprite-factory/` | Publishable OSS render tool | `pfg-sprite-factory` |

---

## Key Constraints

- **Frame size**: 128×128 px per sprite frame (2× retina: 64×64 logical)
- **Color palette**: Silhouette = `#000000`, Background = `#ffffff`, Accents = runtime
- **Atlas format**: Phaser-compatible JSON (texture atlas + frame map)
- **Source files**: All `.blend` models checked into `assets-src/` (git LFS)
- **Build step**: `npm run sprites` regenerates all atlases from `.blend` sources
- **FX**: Never baked into sprites — always Phaser particles/shaders at runtime

---

## Current State (Baseline)

```
Animations:    Placeholder canvas (32×32, 4 animations)
Characters:    1 (Jane, basic geometric shapes)
Real sprites:  0
iOS catalog:   24 Jane + 4 Drone animations extracted (iOS_content_port/)
Pipeline:      Not yet built
```

---

## Directory Structure

```
docs/animation/
  README.md                          ← this file
  00-strategy/
    vision-and-constraints.md        ← what we're building and why
    toolchain-decisions.md           ← Meshy / Mixamo / Blender rationale
    art-style-guide.md               ← visual rules, color, silhouette spec
    pipeline-architecture.md         ← full data-flow diagram
  01-foundation/
    stage-overview.md                ← Stage 1 tasks + acceptance criteria
    meshy-ai-workflow.md             ← character model generation
    blender-setup.md                 ← scene + shader configuration
    mixamo-workflow.md               ← auto-rig + animation library
  02-jane-pilot/
    stage-overview.md                ← Stage 2 tasks + acceptance criteria
    animation-list.md                ← all 24+ animations, priority ordered
    ios-migration-map.md             ← iOS keys → new pipeline map
    render-spec.md                   ← frame sizes, fps, grid layout per anim
  03-pipeline-tool/
    stage-overview.md                ← Stage 3 tasks + acceptance criteria
    render-sprite-sheet-spec.md      ← Python/Blender script design
    atlas-catalog-format.md          ← JSON schema for atlas metadata
    build-integration.md             ← npm script + CI integration
  04-full-roster/
    stage-overview.md                ← Stage 4 tasks + acceptance criteria
    characters/
      jane.md                        ← Jane model + animation spec
      terra.md                       ← Terra model + animation spec
      aqua.md                        ← Aqua model + animation spec
      enemies.md                     ← Terminator + Phantom specs
      jono-hologram.md               ← Jono hologram visual spec
  05-world-art/
    stage-overview.md                ← Stage 5 tasks + acceptance criteria
    tileset-spec.md                  ← tile definitions + render rules
    backgrounds.md                   ← parallax layers spec
  06-fx-layer/
    stage-overview.md                ← Stage 6 tasks + acceptance criteria
    particle-systems.md              ← Phaser particle configs per FX type
    ul-glyph-fx.md                   ← UL symbol render + glow system
  07-integration/
    stage-overview.md                ← Stage 7 tasks + acceptance criteria
    phaser-animation-state-machine.md ← JaneAI state → animation key map
    performance-budget.md            ← texture memory, draw call limits
  08-sprite-factory/
    stage-overview.md                ← Stage 8 tasks + acceptance criteria
    tool-spec.md                     ← OSS tool API design
```

---

## Reference Links

- iOS extraction catalog: `iOS_content_port/extraction_catalog/ios_animation_extraction_catalog.json`
- Current placeholder sprites: `src/utils/PlaceholderAssets.ts`
- Phaser animation config (GameScene): `src/scenes/GameScene.ts` lines 329–336
- JaneAI state machine: `src/ai/JaneAI.ts`
