# Pipeline Architecture

## Full Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  SOURCE LAYER  (checked into git via LFS)                           │
│                                                                     │
│  Concept / Reference          iOS Legacy Catalog                    │
│  (character description,  →   (ios_animation_extraction_catalog.json│
│   pose references)             24 Jane + 4 Drone animations)        │
│         │                              │                            │
│         ▼                              ▼                            │
│  Meshy.ai                    Animation List                         │
│  (text/image → .glb)  ──────► (animation-list.md per character)     │
│         │                                                           │
│         ▼                                                           │
│  assets-src/                                                        │
│    jane/                                                            │
│      jane_base.glb        ← Meshy.ai output                        │
│      jane_rigged.fbx      ← Mixamo auto-rig output                 │
│      jane_idle.fbx        ← Mixamo animation download              │
│      jane_run.fbx                                                   │
│      jane_combat.fbx                                                │
│      ... (one .fbx per animation)                                   │
│      jane.blend           ← Master Blender file (all actions baked) │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  BUILD LAYER  (npm run sprites)                                     │
│                                                                     │
│  render_sprite_sheet.py                                             │
│    ├── Load jane.blend                                              │
│    ├── Apply silhouette shader to all meshes                        │
│    ├── Set orthographic camera (side view, fit-to-frame)            │
│    ├── For each animation in JANE_ANIMATIONS config:                │
│    │     ├── Set active action                                      │
│    │     ├── Render each frame to temp PNG (128×128)                │
│    │     ├── Assemble frames into sprite sheet grid                 │
│    │     └── Write jane_<animation>.png to output/                  │
│    └── Generate jane_atlas.json (Phaser texture atlas format)       │
│                                                                     │
│  pack_atlases.py                                                    │
│    └── Combine all jane_*.png into single jane_atlas.png (2048×2048)│
│        Update jane_atlas.json with packed frame positions           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  OUTPUT LAYER  (build artifact — gitignored, regenerated on demand) │
│                                                                     │
│  public/assets/sprites/                                             │
│    jane/                                                            │
│      jane_atlas.png           ← 2048×2048, all animations packed    │
│      jane_atlas.json          ← Phaser texture atlas JSON           │
│    terra/                                                           │
│      terra_atlas.png                                                │
│      terra_atlas.json                                               │
│    aqua/                                                            │
│    enemies/                                                         │
│      terminator_atlas.png                                           │
│      phantom_atlas.png                                              │
│    world/                                                           │
│      tileset_atlas.png                                              │
│      backgrounds_atlas.png                                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  GAME LAYER  (TypeScript / Phaser)                                  │
│                                                                     │
│  GameScene.preload()                                                │
│    └── this.load.atlas('jane', 'assets/sprites/jane/jane_atlas.png',│
│                                'assets/sprites/jane/jane_atlas.json')│
│                                                                     │
│  GameScene.create()                                                 │
│    └── loadAnimationCatalog('jane', JANE_ANIMATIONS)                │
│          ← reads from src/data/animationCatalog.ts                  │
│            (generated or manually maintained from atlas JSON)       │
│                                                                     │
│  JaneAI.update()                                                    │
│    └── when state changes → janeSprite.play(STATE_TO_ANIMATION[s])  │
│                                                                     │
│  Runtime FX Layer (no sprite dependency)                            │
│    ├── Phaser Particle Manager (energy bursts, ley-line pulses)     │
│    ├── ULGlyphRenderer (cyan glyph overlays)                        │
│    └── LeylineEnergySystem (amber ley-line corridors)               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## File Naming Conventions

### Source Assets (`assets-src/`)

```
assets-src/
  <character>/
    <character>_base.glb           Meshy.ai raw output
    <character>_rigged.fbx         Mixamo auto-rig (T-pose, no animation)
    <character>_<animation>.fbx    One Mixamo animation per file
    <character>.blend              Master Blender file (all FBX imported)
  world/
    tileset_source.blend           Tile geometry source
    backgrounds_source.blend       Background layer geometry
```

### Build Outputs (`public/assets/sprites/`)

```
<character>_atlas.png              Packed sprite atlas (2048×2048)
<character>_atlas.json             Phaser texture atlas JSON
```

### TypeScript Data (`src/data/`)

```
animationCatalog.ts                All animation configs (hand-maintained or generated)
spriteConstants.ts                 Frame size, atlas names, character keys
```

---

## Atlas JSON Format (Phaser-Compatible)

```json
{
  "frames": {
    "jane_idle_000": {
      "frame": { "x": 0, "y": 0, "w": 128, "h": 128 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 128, "h": 128 },
      "sourceSize": { "w": 128, "h": 128 }
    },
    "jane_idle_001": { "frame": { "x": 128, "y": 0, "w": 128, "h": 128 }, ... },
    "jane_walk_000": { "frame": { "x": 0, "y": 128, "w": 128, "h": 128 }, ... }
  },
  "meta": {
    "app": "pfg-sprite-factory",
    "version": "1.0",
    "image": "jane_atlas.png",
    "format": "RGBA8888",
    "size": { "w": 2048, "h": 2048 },
    "scale": "1",
    "pfg": {
      "character": "jane",
      "animations": {
        "jane_idle":   { "frames": 8,  "fps": 8,  "loop": true  },
        "jane_walk":   { "frames": 12, "fps": 12, "loop": true  },
        "jane_run":    { "frames": 12, "fps": 12, "loop": true  },
        "jane_combat": { "frames": 8,  "fps": 10, "loop": true  },
        "jane_attack": { "frames": 10, "fps": 14, "loop": false },
        "jane_retreat":{ "frames": 12, "fps": 12, "loop": true  },
        "jane_jump":   { "frames": 10, "fps": 12, "loop": false },
        "jane_land":   { "frames": 6,  "fps": 12, "loop": false },
        "jane_death":  { "frames": 24, "fps": 10, "loop": false }
      }
    }
  }
}
```

---

## Build System Integration

### Package.json Scripts

```json
{
  "scripts": {
    "sprites":          "node scripts/build-sprites.js",
    "sprites:jane":     "node scripts/build-sprites.js --character jane",
    "sprites:all":      "node scripts/build-sprites.js --all",
    "sprites:preview":  "node scripts/preview-sprites.js"
  }
}
```

### `scripts/build-sprites.js`

```javascript
// Calls Blender in headless mode with render_sprite_sheet.py
const { execSync } = require('child_process');

const BLENDER_PATH = process.env.BLENDER_PATH || 'blender';
const SCRIPTS_DIR = path.join(__dirname, '../assets-src/scripts');

function renderCharacter(character) {
  const blendFile = `assets-src/${character}/${character}.blend`;
  const outputDir = `public/assets/sprites/${character}`;

  execSync(
    `${BLENDER_PATH} --background ${blendFile} \
     --python ${SCRIPTS_DIR}/render_sprite_sheet.py -- \
     --character ${character} \
     --output ${outputDir}`,
    { stdio: 'inherit' }
  );
}
```

---

## Dependency Graph

```
iOS catalog JSON
    └── informs animation-list.md (what animations are needed)
            └── informs render_sprite_sheet.py config
                    └── drives Blender render loop
                            └── produces sprite sheet PNGs
                                    └── packed into atlas PNG + JSON
                                            └── loaded by Phaser GameScene
                                                    └── played by JaneAI state machine
```

No circular dependencies. Each layer has one clear upstream source.

---

## What Changes When You Update Something

| You change... | Re-run... | What regenerates |
|---------------|-----------|-----------------|
| 3D model shape | `sprites:jane` | All Jane sprites |
| One animation pose | `sprites:jane` | All Jane sprites |
| Silhouette shader | `sprites:all` | All character sprites |
| Animation list | edit `animation-list.md` + `sprites:jane` | Jane only |
| Frame size | edit config + `sprites:all` | Everything |
| FX color | edit Phaser particle config | Instant (no re-render) |
| UL glyph shape | edit `ULGlyphRenderer.ts` | Instant (no re-render) |
