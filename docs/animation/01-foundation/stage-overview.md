# Stage 1 — Foundation

> **Goal**: Get one real Jane sprite rendered and visible in the running game.
> Everything else follows from proving this pipeline once.

---

## Acceptance Criteria

This stage is complete when:

- [ ] Jane's 3D model exists as `assets-src/jane/jane_base.glb`
- [ ] Jane is rigged and at least one animation (`idle`) is in `jane.blend`
- [ ] A manually rendered `jane_idle.png` (8 frames, 128×128 each) exists
- [ ] The sprite sheet loads in Phaser without errors
- [ ] Jane renders as a pure black silhouette on white in-game
- [ ] The placeholder `createPlayerSpritesheet()` call in `PlaceholderAssets.ts`
      is bypassed when the real atlas is present (feature flag or file check)

---

## Tasks

### Task 1.1 — Generate Jane 3D Model (Meshy.ai)

**Time estimate**: 1-2 hours (including retries)

1. Go to [meshy.ai](https://meshy.ai)
2. Use the **Image to 3D** mode
3. Input: Use the iOS sprite frame `JANE_READY` as reference image
   (extract from `iOS_content_port/` or use a drawn silhouette)
4. Text prompt: _"athletic female humanoid in light sci-fi exosuit,
   clean topology, game-ready character, T-pose"_
5. Download as `.glb` (not `.obj`)
6. Save as `assets-src/jane/jane_base.glb`
7. Quick quality check: open in Blender, verify humanoid proportions

**If Meshy quality is poor**: Try Tripo3D with same inputs.
See [toolchain-decisions.md](../00-strategy/toolchain-decisions.md) fallback options.

---

### Task 1.2 — Auto-Rig and Download Idle Animation (Mixamo)

**Time estimate**: 30 minutes

1. Go to [mixamo.com](https://mixamo.com) — sign in with Adobe account
2. Click **Upload Character**
3. Upload `jane_base.glb`
4. Mixamo auto-rig runs — place the chin, wrist, and groin markers when prompted
5. Preview the rig with any animation — confirm the mesh deforms correctly
6. Search for **"breathing idle"** — find a natural subtle idle
7. Settings: FPS=30, Trim=0 start/end, Format=FBX with Skin
8. Download as `assets-src/jane/jane_idle.fbx`

---

### Task 1.3 — Blender Scene Setup

**Time estimate**: 1-2 hours (one-time setup)

See [blender-setup.md](blender-setup.md) for the detailed step-by-step.

Quick summary:
1. Open Blender, delete default cube/light/camera
2. File → Import → FBX → import `jane_idle.fbx`
3. Add orthographic camera: position at `(0, -5, 1)`, rotation `(90°, 0°, 0°)`
4. Set camera type to Orthographic, ortho scale `2.2`
5. Add silhouette material to all mesh objects (see shader setup in blender-setup.md)
6. White world background: `Scene Properties → World → Background Color #ffffff`
7. Render settings: Resolution 128×128, output format PNG, no anti-aliasing on alpha
8. Save as `assets-src/jane/jane.blend`

---

### Task 1.4 — Manual Render: Jane Idle (8 frames)

**Time estimate**: 30 minutes

1. In Blender, set timeline: Start=1, End=8 (or whatever covers one idle cycle)
2. Render each frame manually: `Render → Render Image`, save each as
   `temp/jane_idle_000.png` through `temp/jane_idle_007.png`
3. Assemble into sprite sheet grid (8 frames × 1 row = 1024×128 image):
   - Use any image editor (Photoshop, GIMP, Aseprite, or Python/Pillow script)
   - Place frames left-to-right in a single row
4. Save as `public/assets/sprites/jane/jane_idle.png`
5. Write minimal `jane_atlas.json` by hand for just this one animation:

```json
{
  "frames": {
    "jane_idle_000": { "frame": {"x":0,"y":0,"w":128,"h":128}, "rotated":false, "trimmed":false, "spriteSourceSize":{"x":0,"y":0,"w":128,"h":128}, "sourceSize":{"w":128,"h":128} },
    "jane_idle_001": { "frame": {"x":128,"y":0,"w":128,"h":128}, "rotated":false, "trimmed":false, "spriteSourceSize":{"x":0,"y":0,"w":128,"h":128}, "sourceSize":{"w":128,"h":128} },
    "jane_idle_002": { "frame": {"x":256,"y":0,"w":128,"h":128}, "rotated":false, "trimmed":false, "spriteSourceSize":{"x":0,"y":0,"w":128,"h":128}, "sourceSize":{"w":128,"h":128} },
    "jane_idle_003": { "frame": {"x":384,"y":0,"w":128,"h":128}, "rotated":false, "trimmed":false, "spriteSourceSize":{"x":0,"y":0,"w":128,"h":128}, "sourceSize":{"w":128,"h":128} },
    "jane_idle_004": { "frame": {"x":512,"y":0,"w":128,"h":128}, "rotated":false, "trimmed":false, "spriteSourceSize":{"x":0,"y":0,"w":128,"h":128}, "sourceSize":{"w":128,"h":128} },
    "jane_idle_005": { "frame": {"x":640,"y":0,"w":128,"h":128}, "rotated":false, "trimmed":false, "spriteSourceSize":{"x":0,"y":0,"w":128,"h":128}, "sourceSize":{"w":128,"h":128} },
    "jane_idle_006": { "frame": {"x":768,"y":0,"w":128,"h":128}, "rotated":false, "trimmed":false, "spriteSourceSize":{"x":0,"y":0,"w":128,"h":128}, "sourceSize":{"w":128,"h":128} },
    "jane_idle_007": { "frame": {"x":896,"y":0,"w":128,"h":128}, "rotated":false, "trimmed":false, "spriteSourceSize":{"x":0,"y":0,"w":128,"h":128}, "sourceSize":{"w":128,"h":128} }
  },
  "meta": { "image": "jane_idle.png", "format": "RGBA8888", "size": {"w":1024,"h":128}, "scale":"1" }
}
```

---

### Task 1.5 — Wire Into GameScene

**Time estimate**: 1 hour

In `src/scenes/GameScene.ts`, replace the placeholder sprite loading:

```typescript
// BEFORE (in preload()):
const playerTexture = createPlayerSpritesheet();
this.load.spritesheet('player', playerTexture.toDataURL(), { frameWidth: 32, frameHeight: 32 });

// AFTER:
// Use real sprite atlas if available, fall back to placeholder
if (REAL_SPRITES_ENABLED) {
  this.load.atlas('jane', 'assets/sprites/jane/jane_idle.png',
                          'assets/sprites/jane/jane_atlas.json');
} else {
  const playerTexture = createPlayerSpritesheet();
  this.load.spritesheet('player', playerTexture.toDataURL(), { frameWidth: 32, frameHeight: 32 });
}
```

Add the constant to `src/data/spriteConstants.ts`:

```typescript
export const REAL_SPRITES_ENABLED =
  import.meta.env.VITE_REAL_SPRITES === 'true';
```

Set `.env.local`:
```
VITE_REAL_SPRITES=true
```

Wire the idle animation:
```typescript
// In GameScene.create() after sprite creation:
if (REAL_SPRITES_ENABLED) {
  this.anims.create({
    key: 'jane_idle',
    frames: this.anims.generateFrameNames('jane', {
      prefix: 'jane_idle_', start: 0, end: 7, zeroPad: 3
    }),
    frameRate: 8,
    repeat: -1,
  });
  janeSprite.play('jane_idle');
}
```

---

### Task 1.6 — Visual Validation

Run the game with `VITE_REAL_SPRITES=true`.

Check list:
- [ ] Jane appears as a black silhouette (not colored shapes)
- [ ] Idle animation plays and loops smoothly
- [ ] No white/grey fringing around silhouette edge
- [ ] Character scale looks right relative to the terrain
- [ ] No console errors about missing texture frames

If scale is wrong: adjust Blender ortho scale and re-render.
If fringing: check alpha settings in Blender render output (PNG with alpha).

---

## Outputs of Stage 1

```
assets-src/jane/
  jane_base.glb                 Meshy.ai model
  jane_idle.fbx                 Mixamo animation
  jane.blend                    Blender master scene

public/assets/sprites/jane/
  jane_idle.png                 8-frame sprite sheet
  jane_atlas.json               Minimal Phaser atlas

src/data/
  spriteConstants.ts            REAL_SPRITES_ENABLED flag
```

---

## Time Estimate

| Task | Time |
|------|------|
| 1.1 Meshy model generation | 1-2 hours |
| 1.2 Mixamo rig + idle anim | 30 min |
| 1.3 Blender scene setup | 1-2 hours |
| 1.4 Manual render + assemble | 30 min |
| 1.5 GameScene wiring | 1 hour |
| 1.6 Visual validation | 30 min |
| **Total** | **4-6 hours** |

---

## Next Stage

Once Jane's idle animation is visible in-game, proceed to
[Stage 2: Jane Pilot](../02-jane-pilot/stage-overview.md) to render
all 24 animations using the established Blender scene.
