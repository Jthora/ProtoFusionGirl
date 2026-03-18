# Toolchain Decisions

## Chosen Stack

```
Character generation:  Meshy.ai  (text/image → .glb)
Auto-rigging:          Mixamo    (Adobe, free — .glb → rigged .fbx)
Animation library:     Mixamo    (200+ mocap animations)
Render engine:         Blender   (Python-scriptable, free)
Shader:                Blender Cycles / Eevee + custom silhouette node
Sprite assembly:       Python (Pillow / imageio — runs inside Blender)
Atlas metadata:        Custom Python → Phaser-compatible JSON
Build integration:     npm script calling Blender headless
Optional future:       Three.js headless renderer (Node.js) — see Stage 8
```

---

## Tool-by-Tool Rationale

### Meshy.ai — Character Model Generation

**Why Meshy over alternatives:**

| Tool | Quality | Rigging | Cost | Verdict |
|------|---------|---------|------|---------|
| Meshy.ai | ★★★★☆ | Auto (basic) | Free tier | **Chosen** |
| Tripo3D | ★★★★☆ | None | Free tier | Alt if Meshy fails |
| CSM.ai | ★★★☆☆ | None | Free tier | Fallback |
| Luma AI | ★★★☆☆ | None | Free | Scene-focused |
| Hand-modeled | ★★★★★ | Manual | Artist time | Too slow |

**Workflow**: Provide a reference image (concept art or iOS sprite frame)
as the input image + a text description of the character.
Download as `.glb`. This becomes the permanent source model.

**Important**: Meshy output quality is variable. Plan for 2-3 attempts
per character. Save the best result. The Mixamo re-rig step corrects
most geometry issues.

---

### Mixamo — Auto-Rigging and Animations

**Why Mixamo:**
- Free with an Adobe account
- Auto-rig works on any humanoid mesh — no manual bone placement
- Library of 200+ motion-captured animations covers every game state
- Export as `.fbx` with embedded skeleton and any animation baked

**Workflow:**
1. Upload the `.obj` or `.fbx` from Meshy to mixamo.com
2. Use "Auto-Rig" — it detects humanoid anatomy automatically
3. Browse the animation library and preview on your model
4. Download each animation as `.fbx` (with skin, 30fps)
5. Import all `.fbx` files into a single Blender project

**Animation sourcing strategy:**

| Game State | Mixamo Animation Search Term |
|------------|------------------------------|
| Idle | "breathing idle", "standing idle" |
| Walk/Navigate | "walking", "catwalk walking" |
| Run | "running", "fast run" |
| Combat Idle | "fighting idle", "combat stance" |
| Attack | "punching", "right hook", "combo" |
| Retreat | "running backward", "backing up" |
| Jump | "jump", "jump up" |
| Land | "land", "hard landing" |
| Death | "dying", "falling back death" |
| Bored | "looking around", "checking watch" |
| Refusal | "head shake", "disagreeing" |
| UL Gesture | "pointing", "wave gesture" |
| Dash | "dash forward", "quick dash" |

---

### Blender — Render Engine

**Why Blender over alternatives:**

| Option | Pros | Cons |
|--------|------|------|
| **Blender** | Free, Python API, best silhouette shaders | Requires install |
| Three.js headless | No Blender dependency, web-native | More dev work, lower quality |
| Unity | Great rendering | License cost, overkill |
| Godot | Free, good rendering | Less Python scripting |

**Version**: Use Blender 4.x (LTS). The Python API is stable across 4.x.

**Render engine choice:**
- **Eevee** for speed (real-time rasterizer) — good for silhouette style
- **Cycles** for quality (path tracer) — slower but better outlines
- Recommend: Eevee for iteration, Cycles for final renders

---

### Python + Pillow — Sprite Assembly

The Blender Python API runs inside Blender's bundled Python interpreter.
We use it to:

1. Control the render loop (set frame, render, save temp PNG)
2. Assemble frames into sprite sheet grid (Pillow/PIL)
3. Generate Phaser-compatible JSON atlas metadata
4. Write output files to `public/assets/sprites/`

No external Python installation needed — Blender's bundled Python has
Pillow available via `pip install --target` or it can be pre-installed.

---

### Optional: Three.js Headless Renderer (Stage 8)

A future alternative to the Blender pipeline — a Node.js script using
`three.js` + `node-canvas` (or `puppeteer`) that:

- Takes a `.glb` file + animation list
- Renders frames using WebGL (via `gl` npm package for headless)
- Applies the silhouette toon shader in Three.js
- Outputs sprite sheets without requiring Blender

**When to build this**: After the Blender pipeline is working and proven.
This is the "publish as OSS tool" version.

---

## What NOT to Use

### Spine / DragonBones / SkeletalPro
These are 2D skeletal animation tools. They're excellent but require
manually drawing and rigging 2D sprites. We're generating from 3D, so
the entire 2D-rig workflow is unnecessary complexity.

### Unity / Unreal as Render Farm
Overkill. Blender does this better and faster for a 2D sprite pipeline.

### AI Image Generators for Sprite Sheets
Not yet reliable for frame-consistent animation grids. May revisit in 2027.
Worth monitoring: **PixelLab.ai**, **CharacterFactory**, **DreamBooth + Pose ControlNet**.

---

## Fallback Plans

If Meshy.ai quality is insufficient for a character:

1. **Tripo3D** — alternative text-to-3D, similar quality
2. **Ready Player Me** — for humanoid characters only, very clean topology
3. **Manual modeling in Blender** — 2-4 hours per character for simple forms
4. **Purchased asset** — Sketchfab, TurboSquid for standard humanoid bases

The silhouette style is forgiving — even a relatively simple 3D mesh
produces a good-looking silhouette render. Model quality matters less
here than in a textured 3D game.
