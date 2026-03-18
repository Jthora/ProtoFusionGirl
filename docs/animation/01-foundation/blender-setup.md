# Blender Scene Setup Guide

## One-Time Configuration for ProtoFusionGirl Sprite Rendering

This guide sets up the canonical Blender scene that all sprite renders use.
Complete this once. Save as `assets-src/jane/jane.blend`.

---

## Required Blender Version

Blender 4.x (any 4.x release). Download from [blender.org](https://blender.org).

---

## Step 1 — Clean Scene

1. Open Blender → delete all default objects: select all (`A`) → delete (`X`)
2. You should have a completely empty viewport

---

## Step 2 — Import the Mixamo FBX

1. **File → Import → FBX** → select `jane_idle.fbx`
2. Import settings:
   - Scale: `1.0`
   - Armature: Automatic Bone Orientation: ON
   - Primary/Secondary bone axis: default
3. Select the imported armature, press `G Z` to position at `Z = 0`
4. The character's feet should touch the Z=0 plane

---

## Step 3 — Orthographic Camera Setup

```
Add → Camera
Position:    X=0, Y=-5, Z=0.9
Rotation:    X=90°, Y=0°, Z=0°
```

Camera properties (Properties panel → Camera icon):
```
Type:         Orthographic
Ortho Scale:  2.2    (adjust until Jane fills ~80% of frame vertically)
Clip Start:   0.1
Clip End:     100
```

Lock the camera to its current view: `View → Camera → Lock Camera to View` — OFF
(We want a fixed, script-controllable camera, not an interactive one)

---

## Step 4 — Silhouette Material

The silhouette material makes every mesh render as pure black,
independent of lighting.

**Create the material:**

1. Open Shader Editor (top menu: Editor Type → Shader Editor)
2. Select any mesh on the character
3. In Material Properties, click **New**
4. Name it `PFG_Silhouette`
5. Delete all default nodes
6. Add: **Shader → Emission** node
7. Set Emission Color: `R=0, G=0, B=0` (pure black)
8. Set Emission Strength: `1.0`
9. Connect Emission output → **Material Output → Surface**

**Apply to all meshes:**

1. Select the first mesh
2. Assign `PFG_Silhouette` material
3. Select all other meshes (`Shift+Click` each)
4. Shift+select the first mesh last (it becomes the active object)
5. `Ctrl+L → Materials` — links the material to all selected

---

## Step 5 — Freestyle Outlines (Optional but Recommended)

Freestyle adds a thin outline to the silhouette for better edge definition
at 128×128. Without it, the silhouette can look blobby at small sizes.

1. **Render Properties → Freestyle**: Enable
2. Set Line Thickness: `2.0`
3. Line Color: `R=0, G=0, B=0`
4. **View Layer Properties → Freestyle Line Set**: Add a new line set
   - Name: `Silhouette`
   - Edge Types: Contour only (uncheck everything else)
5. This draws the outermost silhouette edge as a crisp black line

---

## Step 6 — World Background

1. **World Properties** (globe icon in Properties panel)
2. Set **Color** to `R=1, G=1, B=1` (pure white)
3. Strength: `1.0`

No HDRI, no environment texture. Just white.

---

## Step 7 — Render Settings

**Render Properties:**

```
Render Engine:   EEVEE (faster, sufficient quality)
                 or Cycles (higher quality, slower)

Resolution:
  X: 128 px
  Y: 128 px
  %: 100%

Frame Rate:      30 fps (Mixamo default; we'll downsample in export)

Output:
  File Format:   PNG
  Color Mode:    RGBA
  Compression:   15%

Color Management:
  Display Device:   sRGB
  View Transform:   Standard   (NOT Filmic — we need true black)
  Exposure:         0
  Gamma:            1.0
```

**Important**: Using "Standard" (not "Filmic") color management ensures
that `R=0,G=0,B=0` renders as true black `#000000`. Filmic tone-mapping
will shift blacks to near-black and break the style.

---

## Step 8 — Output Path Setup

1. **Output Properties** → set Output Path to `//temp/frame_`
2. This writes `temp/frame_0001.png`, `frame_0002.png`, etc.
   relative to the `.blend` file location
3. This is the path the render script reads from

---

## Step 9 — Import Additional Animations

For each Mixamo animation `.fbx`:

1. **File → Import → FBX** → select `jane_<animation>.fbx`
2. Import settings: same as Step 2
3. Blender imports a NEW armature with the animation baked to it
4. To transfer the animation to the main armature:
   - Select the new armature (source)
   - Open **NLA Editor** (or Action Editor)
   - The animation appears as an Action
   - Rename the action to match the animation: e.g., `jane_idle`
   - Delete the extra imported armature
   - Select the main armature → in Action Editor, load the action
5. Repeat for all animations

After all animations are imported, the main armature has actions:
`jane_idle`, `jane_walk`, `jane_run`, `jane_combat_idle`, etc.

---

## Step 10 — Save Master File

1. **File → Save As** → `assets-src/jane/jane.blend`
2. This is the source of truth for all Jane sprite generation

---

## Render Quality Test

Before running any scripts, do a manual test render:

1. Select the main armature
2. In Action Editor, set active action to `jane_idle`
3. Set timeline to frame 1
4. Press `F12` to render
5. Check the result:
   - Background is pure white? ✓
   - Character is pure black? ✓
   - Outline is crisp at 128×128? ✓
   - Character roughly fills 80% of frame height? ✓
   - Feet near bottom of frame, head near top? ✓

If the character is too small/large, adjust **Orthographic Scale** in camera
properties (higher = more zoomed out, lower = more zoomed in).

---

## Common Issues

| Issue | Fix |
|-------|-----|
| Character is grey, not black | Color Management set to Filmic — change to Standard |
| White outline around character | RGBA output has premultiplied alpha — set to straight alpha, or don't use alpha |
| Character floats above ground | Move armature Z to 0, or move camera Z down slightly |
| Proportions look wrong | Adjust camera ortho scale; also check Mixamo import scale |
| Freestyle lines are too thick | Reduce Freestyle line thickness; 2px at 128×128 is usually right |
| Blender crashes on headless render | Use `--background` flag and ensure GPU is available or force CPU rendering |
