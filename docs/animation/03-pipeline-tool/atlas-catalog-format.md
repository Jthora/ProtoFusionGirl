# Atlas Catalog Format

Defines the JSON format for `sprite-catalog.json` (build manifest)
and the output `*_atlas.json` (Phaser texture atlas).

---

## sprite-catalog.json — Build Manifest

Full schema for the build orchestrator input:

```json
{
  "$schema": "scripts/sprite-catalog-schema.json",
  "version": "1",
  "characters": {
    "<character-id>": {
      "blend_file": "<relative path to .blend file>",
      "armature_name": "<Blender armature object name>",
      "output_dir": "<relative path for output sprites>",
      "atlas_name": "<base name for atlas files, no extension>",
      "frame_width": 128,
      "frame_height": 128,
      "atlas_max_size": 2048,
      "animations": [
        {
          "key": "<game animation key>",
          "action": "<Blender action name>",
          "frame_step": 3,
          "fps": 12,
          "loop": true,
          "hold_last": false
        }
      ]
    }
  }
}
```

### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `blend_file` | string | Path to `.blend` relative to repo root |
| `armature_name` | string | Name of the Blender `ARMATURE` object |
| `output_dir` | string | Where to write `*_atlas.png` and `*_atlas.json` |
| `atlas_name` | string | Filename stem, e.g. `jane_atlas` |
| `frame_width` | int | Width of each frame in pixels |
| `frame_height` | int | Height of each frame in pixels |
| `atlas_max_size` | int | Maximum atlas dimension (2048 or 4096) |
| `key` | string | Phaser animation key, e.g. `jane_walk` |
| `action` | string | Blender action name — must match exactly |
| `frame_step` | int | Render every Nth frame (1 = all, 3 = every 3rd) |
| `fps` | int | Phaser animation frame rate |
| `loop` | bool | Whether animation loops |
| `hold_last` | bool | Whether to freeze on last frame after playing |

### Complete Example

```json
{
  "version": "1",
  "characters": {
    "jane": {
      "blend_file": "assets-src/jane/jane.blend",
      "armature_name": "Armature",
      "output_dir": "public/assets/sprites/jane",
      "atlas_name": "jane_atlas",
      "frame_width": 128,
      "frame_height": 128,
      "atlas_max_size": 2048,
      "animations": [
        { "key": "jane_idle",        "action": "jane_idle",        "frame_step": 4, "fps": 8,  "loop": true,  "hold_last": false },
        { "key": "jane_stand",       "action": "jane_stand",       "frame_step": 7, "fps": 4,  "loop": true,  "hold_last": false },
        { "key": "jane_walk",        "action": "jane_walk",        "frame_step": 3, "fps": 12, "loop": true,  "hold_last": false },
        { "key": "jane_run",         "action": "jane_run",         "frame_step": 2, "fps": 16, "loop": true,  "hold_last": false },
        { "key": "jane_dash",        "action": "jane_dash",        "frame_step": 3, "fps": 8,  "loop": false, "hold_last": false },
        { "key": "jane_skid",        "action": "jane_skid",        "frame_step": 3, "fps": 10, "loop": false, "hold_last": false },
        { "key": "jane_combat_idle", "action": "jane_combat_idle", "frame_step": 4, "fps": 8,  "loop": true,  "hold_last": false },
        { "key": "jane_attack_1",    "action": "jane_attack_1",    "frame_step": 2, "fps": 16, "loop": false, "hold_last": true  },
        { "key": "jane_attack_2",    "action": "jane_attack_2",    "frame_step": 2, "fps": 16, "loop": false, "hold_last": true  },
        { "key": "jane_combo",       "action": "jane_combo",       "frame_step": 2, "fps": 16, "loop": false, "hold_last": true  },
        { "key": "jane_retreat",     "action": "jane_retreat",     "frame_step": 3, "fps": 12, "loop": true,  "hold_last": false },
        { "key": "jane_jump_start",  "action": "jane_jump_start",  "frame_step": 2, "fps": 16, "loop": false, "hold_last": false },
        { "key": "jane_jump_apex",   "action": "jane_jump_apex",   "frame_step": 5, "fps": 6,  "loop": true,  "hold_last": false },
        { "key": "jane_fall",        "action": "jane_fall",        "frame_step": 4, "fps": 8,  "loop": true,  "hold_last": false },
        { "key": "jane_land_hard",   "action": "jane_land_hard",   "frame_step": 2, "fps": 16, "loop": false, "hold_last": true  },
        { "key": "jane_land_mid",    "action": "jane_land_mid",    "frame_step": 2, "fps": 16, "loop": false, "hold_last": true  },
        { "key": "jane_land_light",  "action": "jane_land_light",  "frame_step": 2, "fps": 16, "loop": false, "hold_last": true  },
        { "key": "jane_leap_start",  "action": "jane_leap_start",  "frame_step": 2, "fps": 16, "loop": false, "hold_last": false },
        { "key": "jane_death",       "action": "jane_death",       "frame_step": 3, "fps": 12, "loop": false, "hold_last": true  },
        { "key": "jane_bored",       "action": "jane_bored",       "frame_step": 3, "fps": 10, "loop": false, "hold_last": false },
        { "key": "jane_refusing",    "action": "jane_refusing",    "frame_step": 3, "fps": 10, "loop": false, "hold_last": false },
        { "key": "jane_ul_gesture",  "action": "jane_ul_gesture",  "frame_step": 3, "fps": 12, "loop": false, "hold_last": false },
        { "key": "jane_celebrate",   "action": "jane_celebrate",   "frame_step": 3, "fps": 12, "loop": false, "hold_last": false }
      ]
    }
  }
}
```

---

## *_atlas.json — Phaser Texture Atlas Output

Standard Phaser 3 JSON Hash format with ProtoFusionGirl extension metadata.

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
    "jane_idle_001": {
      "frame": { "x": 128, "y": 0, "w": 128, "h": 128 },
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 128, "h": 128 },
      "sourceSize": { "w": 128, "h": 128 }
    }
  },
  "meta": {
    "app": "ProtoFusionGirl sprite pipeline",
    "version": "1",
    "image": "jane_atlas.png",
    "format": "RGBA8888",
    "size": { "w": 2048, "h": 2048 },
    "scale": "1",
    "pfg": {
      "character": "jane",
      "generated": "2024-01-01T00:00:00Z",
      "animations": {
        "jane_idle": {
          "frames": ["jane_idle_000", "jane_idle_001", "jane_idle_002", "jane_idle_003",
                     "jane_idle_004", "jane_idle_005", "jane_idle_006", "jane_idle_007"],
          "fps": 8,
          "loop": true,
          "hold_last": false
        },
        "jane_walk": {
          "frames": ["jane_walk_000", "..."],
          "fps": 12,
          "loop": true,
          "hold_last": false
        }
      }
    }
  }
}
```

### pfg Extension Metadata

The `meta.pfg` block is a ProtoFusionGirl extension that allows `animationCatalog.ts`
to be auto-generated from the atlas JSON at build time:

```typescript
// src/data/animationCatalog.ts (auto-generated by scripts/gen-animation-catalog.ts)
import atlasJson from '../../public/assets/sprites/jane/jane_atlas.json';

export const JANE_ANIM_CONFIG = atlasJson.meta.pfg.animations;
```

This eliminates the need to manually maintain `animationCatalog.ts` —
the catalog is derived directly from what was actually rendered.

---

## Frame Naming Convention

```
{character}_{animation}_{frame_index_zero_padded_3_digits}

Examples:
  jane_idle_000
  jane_idle_007
  jane_walk_000
  jane_walk_011
  terra_idle_000
  drone_hover_000
```

The zero-padded 3-digit index allows Phaser's `generateFrameNames` to work:
```typescript
this.anims.generateFrameNames('jane', {
  prefix: 'jane_walk_',
  start: 0,
  end: 11,
  zeroPad: 3
})
```
