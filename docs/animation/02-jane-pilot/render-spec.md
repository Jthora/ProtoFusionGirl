# Jane Render Specification

Exact frame counts, FPS, and sprite sheet dimensions for every animation.
Use these numbers when configuring Blender timeline and Phaser animation config.

---

## Global Render Settings

```
Resolution:    128 × 128 px per frame
Output format: PNG (RGBA)
Blender FPS:   30 (Mixamo standard; downsample in export)
Grid layout:   8 frames per row
Atlas size:    2048 × 2048 (packed by FreeTexturePacker)
```

---

## Animation Specifications

| Key | Game FPS | Frames | Duration | Grid Rows | Sprite Sheet Size | Notes |
|-----|----------|--------|----------|-----------|-------------------|-------|
| `jane_idle` | 8 | 8 | 1.0s | 1 | 1024 × 128 | Gentle weight shift |
| `jane_stand` | 4 | 4 | 1.0s | 1 | 512 × 128 | Near-static |
| `jane_walk` | 12 | 12 | 1.0s | 2 | 1024 × 256 | Full gait cycle |
| `jane_run` | 16 | 16 | 1.0s | 2 | 1024 × 256 | Full run cycle |
| `jane_dash` | 8 | 6 | 0.75s | 1 | 768 × 128 | Quick burst |
| `jane_skid` | 10 | 8 | 0.8s | 1 | 1024 × 128 | Decel stop |
| `jane_combat_idle` | 8 | 8 | 1.0s | 1 | 1024 × 128 | Guard stance loop |
| `jane_attack_1` | 16 | 8 | 0.5s | 1 | 1024 × 128 | Hold last frame |
| `jane_attack_2` | 16 | 8 | 0.5s | 1 | 1024 × 128 | Hold last frame |
| `jane_combo` | 16 | 16 | 1.0s | 2 | 1024 × 256 | Hold last frame |
| `jane_retreat` | 12 | 12 | 1.0s | 2 | 1024 × 256 | Backward run |
| `jane_jump_start` | 16 | 6 | 0.375s | 1 | 768 × 128 | Play once |
| `jane_jump_apex` | 6 | 4 | 0.67s | 1 | 512 × 128 | Float loop |
| `jane_fall` | 8 | 6 | 0.75s | 1 | 768 × 128 | Fall loop |
| `jane_land_hard` | 16 | 8 | 0.5s | 1 | 1024 × 128 | Hold last frame |
| `jane_land_mid` | 16 | 6 | 0.375s | 1 | 768 × 128 | Hold last frame |
| `jane_land_light` | 16 | 4 | 0.25s | 1 | 512 × 128 | Hold last frame |
| `jane_leap_start` | 16 | 6 | 0.375s | 1 | 768 × 128 | Play once |
| `jane_death` | 12 | 16 | 1.33s | 2 | 1024 × 256 | Hold last frame |
| `jane_bored` | 10 | 20 | 2.0s | 3 | 1024 × 384 | Play once |
| `jane_refusing` | 10 | 12 | 1.2s | 2 | 1024 × 256 | Play once |
| `jane_ul_gesture` | 12 | 16 | 1.33s | 2 | 1024 × 256 | Play once |
| `jane_celebrate` | 12 | 20 | 1.67s | 3 | 1024 × 384 | Play once |

**Total frames: 232**

---

## Blender Frame Range Settings

For each animation, set these values in the Blender timeline:
(`Timeline → Start Frame` and `End Frame`)

| Key | Start | End | Source FPS → Game FPS |
|-----|-------|-----|-----------------------|
| `jane_idle` | 1 | 24 | 30 → every 3-4th frame = 8 fps |
| `jane_stand` | 1 | 8 | 30 → every 7th frame = 4 fps |
| `jane_walk` | 1 | 36 | 30 → every 2.5th frame = 12 fps |
| `jane_run` | 1 | 32 | 30 → every 2nd frame = 16 fps |
| `jane_dash` | 1 | 18 | 30 → every 3rd frame = 10 fps |
| `jane_skid` | 1 | 24 | 30 → every 3rd frame = 10 fps |
| `jane_combat_idle` | 1 | 24 | 30 → every 3rd frame = 8 fps |
| `jane_attack_1` | 1 | 15 | 30 → every 2nd frame = 16 fps |
| `jane_attack_2` | 1 | 15 | 30 → every 2nd frame = 16 fps |
| `jane_combo` | 1 | 30 | 30 → every 2nd frame = 16 fps |
| `jane_retreat` | 1 | 36 | 30 → every 2-3rd frame = 12 fps |
| `jane_jump_start` | 1 | 12 | 30 → every 2nd frame = 16 fps |
| `jane_jump_apex` | 1 | 20 | 30 → every 5th frame = 6 fps |
| `jane_fall` | 1 | 22 | 30 → every 4th frame = 8 fps |
| `jane_land_hard` | 1 | 15 | 30 → every 2nd frame = 16 fps |
| `jane_land_mid` | 1 | 12 | 30 → every 2nd frame = 16 fps |
| `jane_land_light` | 1 | 8 | 30 → every 2nd frame = 16 fps |
| `jane_leap_start` | 1 | 12 | 30 → every 2nd frame = 16 fps |
| `jane_death` | 1 | 40 | 30 → every 2-3rd frame = 12 fps |
| `jane_bored` | 1 | 60 | 30 → every 3rd frame = 10 fps |
| `jane_refusing` | 1 | 36 | 30 → every 3rd frame = 10 fps |
| `jane_ul_gesture` | 1 | 40 | 30 → every 2-3rd frame = 12 fps |
| `jane_celebrate` | 1 | 50 | 30 → every 2-3rd frame = 12 fps |

**Technique for frame downsampling**: In Blender's render output settings,
set `Frame Step` to skip frames. E.g., `Frame Step = 3` renders every 3rd
frame from Mixamo's 30fps source, giving ~10 fps output.

Alternatively, render all frames and thin them out in the Python atlas-build
script (Stage 3). Manual render at this stage: just step through manually.

---

## Sprite Sheet Grid Layout

Each individual sprite sheet uses 8-frame rows:

```
Frames 0-7  →  Row 0  (y = 0)
Frames 8-15 →  Row 1  (y = 128)
Frames 16-23→  Row 2  (y = 256)
...
```

For animations with fewer than 8 frames, the row is partially filled
(remaining cells are transparent/empty). This is fine for Phaser atlas.

---

## Phaser Animation Config (generated from this spec)

These values go into `src/data/animationCatalog.ts`:

```typescript
export const JANE_ANIM_SPEC: Record<string, { fps: number; frames: number; loop: boolean; hold: boolean }> = {
  jane_idle:         { fps: 8,  frames: 8,  loop: true,  hold: false },
  jane_stand:        { fps: 4,  frames: 4,  loop: true,  hold: false },
  jane_walk:         { fps: 12, frames: 12, loop: true,  hold: false },
  jane_run:          { fps: 16, frames: 16, loop: true,  hold: false },
  jane_dash:         { fps: 8,  frames: 6,  loop: false, hold: false },
  jane_skid:         { fps: 10, frames: 8,  loop: false, hold: false },
  jane_combat_idle:  { fps: 8,  frames: 8,  loop: true,  hold: false },
  jane_attack_1:     { fps: 16, frames: 8,  loop: false, hold: true  },
  jane_attack_2:     { fps: 16, frames: 8,  loop: false, hold: true  },
  jane_combo:        { fps: 16, frames: 16, loop: false, hold: true  },
  jane_retreat:      { fps: 12, frames: 12, loop: true,  hold: false },
  jane_jump_start:   { fps: 16, frames: 6,  loop: false, hold: false },
  jane_jump_apex:    { fps: 6,  frames: 4,  loop: true,  hold: false },
  jane_fall:         { fps: 8,  frames: 6,  loop: true,  hold: false },
  jane_land_hard:    { fps: 16, frames: 8,  loop: false, hold: true  },
  jane_land_mid:     { fps: 16, frames: 6,  loop: false, hold: true  },
  jane_land_light:   { fps: 16, frames: 4,  loop: false, hold: true  },
  jane_leap_start:   { fps: 16, frames: 6,  loop: false, hold: false },
  jane_death:        { fps: 12, frames: 16, loop: false, hold: true  },
  jane_bored:        { fps: 10, frames: 20, loop: false, hold: false },
  jane_refusing:     { fps: 10, frames: 12, loop: false, hold: false },
  jane_ul_gesture:   { fps: 12, frames: 16, loop: false, hold: false },
  jane_celebrate:    { fps: 12, frames: 20, loop: false, hold: false },
};
```

---

## Atlas Packing Budget

Total frames × 128×128 px each:

```
232 frames × (128 × 128 × 4 bytes RGBA) = ~15 MB uncompressed
Packed into 2048×2048 atlas:  2048 × 2048 × 4 = ~16 MB max

232 frames actually require:  232 × 128 × 128 = 3,801,088 px²
2048 × 2048 atlas capacity:  4,194,304 px²
Utilization: ~91% — fits comfortably in a single 2048×2048 atlas
```

GPU texture memory (compressed): ~4 MB per 2048×2048 atlas (DXT/BC1 compression).
At 60fps with one draw call for Jane: well within budget.
