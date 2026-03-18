# Meshy.ai Character Generation Workflow

## Overview

Meshy.ai generates 3D character models from text descriptions or reference images.
We use the reference image mode for maximum control over the silhouette shape.

---

## Account Setup

1. Go to [meshy.ai](https://meshy.ai)
2. Sign up (free tier is sufficient — provides ~20 generations/month)
3. Free tier gives you `.glb` download access

---

## Generating Jane

### Recommended Input

**Mode**: Image to 3D

**Reference image**: Use one of these sources (in preference order):
1. An iOS prototype frame extracted from the atlas — `JANE_READY` frame
2. A hand-drawn silhouette sketch matching the art style guide
3. A photo reference of a person in similar proportions + outfit

**Text prompt**:
```
athletic female humanoid in a slim sci-fi exosuit with shoulder armor,
T-pose, clean topology, game-ready character model, no face details needed,
smooth limbs, visible ponytail, boots with heel
```

**Negative prompt** (if available):
```
hyper detailed, face detail, wrinkles, bulky, fat, robot, mech suit
```

---

## Settings

```
Polygon count:   Medium (20K-50K polygons is plenty for silhouette rendering)
Texture:         None needed (silhouette shader ignores texture)
Format:          GLB
```

---

## Quality Assessment

After download, open in Blender and check:

**Accept if:**
- Humanoid proportions visible (head, neck, torso, arms, legs)
- Roughly 5.5 heads tall
- Arms not fused to body at rest
- Hands have roughly 5-finger structure (or mitten-hands — fine for silhouette)
- Legs clearly separate

**Reject and retry if:**
- Body parts merged/fused
- Non-humanoid proportions (too short, alien limbs)
- Major holes or disconnected geometry

---

## Typical Retry Rate

Expect 1-3 generations before getting a usable model.
Keep all generated `.glb` files — label them `jane_attempt_01.glb` etc.
Use the best one, save as `jane_base.glb`.

---

## After Download

```
Save as: assets-src/jane/jane_base.glb
```

Quick prep before uploading to Mixamo:
1. Open in Blender
2. Verify orientation: Character should face -Y axis in Blender coordinates
   (if not, rotate 90° on Z)
3. Verify feet at Z=0
4. Export as `.fbx` for Mixamo upload: File → Export → FBX
   - Scale: 1.0
   - Apply Transforms: ON
   - Mesh: Smoothing=Face, Triangulate=ON (Mixamo prefers tris)
   - Armature: OFF (no rig yet)
   Save as `assets-src/jane/jane_for_mixamo.fbx`

---

## Generating Other Characters

Use the same workflow for each character. See the character spec docs:
- Terra: [../04-full-roster/characters/terra.md](../04-full-roster/characters/terra.md)
- Aqua: [../04-full-roster/characters/aqua.md](../04-full-roster/characters/aqua.md)
- Enemies: [../04-full-roster/characters/enemies.md](../04-full-roster/characters/enemies.md)

Each character doc includes the specific Meshy prompt and key shape indicators to check.
