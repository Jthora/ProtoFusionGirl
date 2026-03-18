# Stage 5 — World Art

> **Goal**: Render the tile set and background layers through the Blender
> pipeline so the game world has a cohesive visual style matching the
> character silhouette aesthetic.

---

## Prerequisites

- Stage 3 complete: automated pipeline working
- Tilemap system working in-game (TilemapManager, TileRegistry)
- Current tileset: placeholder/procedural

---

## Acceptance Criteria

This stage is complete when:

- [ ] At least 16 ground/platform tiles rendered as black silhouette sprites
- [ ] Background layer (sky/horizon) rendered and scrolling behind gameplay
- [ ] Tile sprites loaded via `npm run sprites` (same pipeline as characters)
- [ ] Game runs with full visual cohesion: silhouette characters on silhouette world
- [ ] No placeholder colored blocks visible at default zoom

---

## Approach: Extend Blender Pipeline to Static Objects

Characters use an animated armature. Tiles are static (no armature).
The same Blender render setup (orthographic camera, silhouette material,
white background) works for tiles — just render a single frame per tile.

The pipeline tool needs one addition: a `--single-frame` mode for
objects with no animation.

---

## Tasks

### Task 5.1 — Tile Design Spec

Define the complete tile vocabulary in [tileset-spec.md](tileset-spec.md).

Minimum viable set (16 tiles):
- Ground surface variants (flat, sloped L, sloped R, edge L, edge R)
- Platform types (solid, half-height, floating)
- Background structure tiles (wall, column, arch)
- Hazard tiles (spike, pit edge)
- UL symbol glyphs (for puzzle areas — see Stage 6)
- Leyline energy node (active/inactive state)

Each tile is 128×128 px, rendered as black silhouette on white.

---

### Task 5.2 — Tile 3D Model Creation

Model tiles in Blender as simple geometry (no Meshy.ai needed):

**Ground tile**:
```
Blender: Add → Mesh → Cube
Scale: X=1.0, Y=0.1, Z=0.3 (flat platform)
Apply silhouette material
Position at Z=0
```

**Slope tile**:
```
Add → Mesh → Cube
Edit mode: move top-right vertices to create ramp
Apply silhouette material
```

Most tiles need <5 minutes to model. Organize as separate objects
in a single `tiles.blend` file, each on its own collection layer.

---

### Task 5.3 — Automated Tile Render

Extend `sprite-catalog.json` to support static objects:

```json
{
  "tilesets": {
    "world": {
      "blend_file": "assets-src/world/tiles.blend",
      "output_dir": "public/assets/sprites/tiles",
      "atlas_name": "tiles_atlas",
      "frame_width": 128,
      "frame_height": 128,
      "tiles": [
        { "key": "tile_ground",     "object": "tile_ground_mesh",   "frame": 1 },
        { "key": "tile_slope_l",    "object": "tile_slope_l_mesh",  "frame": 1 },
        { "key": "tile_platform",   "object": "tile_platform_mesh", "frame": 1 },
        { "key": "tile_wall",       "object": "tile_wall_mesh",     "frame": 1 }
      ]
    }
  }
}
```

The render script isolates each object (hides all others), renders
frame 1, saves. Simple extension to `render-sprites.py`.

---

### Task 5.4 — Background Layer

The parallax background uses wider renders (not 128×128 tiles).

**Background layers**:
1. Far background: 512×288 (16:9 at 1/4 scale) — distant terrain silhouettes
2. Mid background: 512×288 — mid-range structures
3. Near background: 256×144 — foreground details

**Blender approach**:
- Create a wide orthographic render scene (separate `.blend`)
- Model abstract terrain features (hills, ruins, towers) as silhouettes
- Render as single 512×288 PNG
- Phaser tiles this horizontally for infinite scroll

See [backgrounds.md](backgrounds.md) for detailed background layer spec.

---

### Task 5.5 — Wire Into TilemapManager

In `src/world/tilemap/TilemapManager.ts`, replace placeholder tiles:

```typescript
// In preload():
this.load.atlas('tiles', 'assets/sprites/tiles/tiles_atlas.png',
                          'assets/sprites/tiles/tiles_atlas.json');
this.load.image('bg_far',  'assets/sprites/bg/bg_far.png');
this.load.image('bg_mid',  'assets/sprites/bg/bg_mid.png');

// In create():
// Replace placeholder tile texture keys with atlas frame keys
this.tileRegistry.registerTile('ground', { atlasKey: 'tiles', frameKey: 'tile_ground' });
```

---

## Outputs of Stage 5

```
assets-src/world/
  tiles.blend              All tile geometry (separate objects per tile)
  background.blend         Background layer scene

public/assets/sprites/
  tiles/tiles_atlas.png + tiles_atlas.json
  bg/bg_far.png
  bg/bg_mid.png
```

---

## Time Estimate

| Task | Time |
|------|------|
| 5.1 Tile design spec | 1 hour |
| 5.2 Tile 3D modeling | 2-3 hours |
| 5.3 Pipeline extension for tiles | 1-2 hours |
| 5.4 Background renders | 2-3 hours |
| 5.5 TilemapManager wiring | 1-2 hours |
| **Total** | **7-11 hours** |

---

## Next Stage

With world art in place, proceed to
[Stage 6: FX Layer](../06-fx-layer/stage-overview.md) to add
the runtime particle effects and UL glyph animations.
