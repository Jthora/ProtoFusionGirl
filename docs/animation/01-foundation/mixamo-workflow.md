# Mixamo Auto-Rig and Animation Workflow

## Overview

Mixamo provides free auto-rigging and a library of 200+ motion-captured
animations. We use it to rig the Meshy.ai model and download all game
animations as separate `.fbx` files.

---

## Step 1 — Upload and Auto-Rig

1. Go to [mixamo.com](https://mixamo.com)
2. Sign in with an Adobe account (free)
3. Click **Upload Character** (top right)
4. Upload `assets-src/jane/jane_for_mixamo.fbx`
5. Mixamo's auto-rig runs automatically (30-60 seconds)
6. **Landmark placement screen**: place the 4 markers:
   - Chin: on the chin/jaw
   - Left wrist: at the left wrist joint
   - Left elbow: at the left elbow
   - Left knee: at the left knee
   - Groin: at the crotch/waist juncture
7. Click **Next** — Mixamo fits the skeleton
8. Preview with any animation — check for deformation errors (skin tearing,
   bones going through mesh)

**If rig looks wrong**: Re-upload and adjust marker placement.
Common fix: move chin marker up slightly, groin marker lower.

---

## Step 2 — Download the Rigged T-Pose

Before downloading any animations, download the rigged T-pose:

1. Search for **"T-pose"** in the animation search
2. Set: FPS=30, No Skin=OFF, With Skin=ON, Format=FBX
3. Download → save as `assets-src/jane/jane_rigged.fbx`

This is your base rigged model — import it into Blender once,
then overlay all other animation `.fbx` files on top.

---

## Step 3 — Download All Animations

For each animation in the list below, search Mixamo, preview on your model,
select the best match, and download.

**Download settings for every animation:**
- Format: **FBX**
- Skin: **With Skin** (required to preserve deformation for import)
- FPS: **30** (we'll downsample to game FPS in Blender)
- Keyframe Reduction: **None** (keep all keyframes)

### Jane Animation Downloads

| Game Animation | Mixamo Search | Notes |
|----------------|---------------|-------|
| `jane_idle` | "breathing idle" | Subtle weight shift preferred |
| `jane_stand` | "standing idle" | Static standing pose |
| `jane_walk` | "walking" | Standard walk, natural arm swing |
| `jane_run` | "running" | Forward run, not sprinting |
| `jane_dash` | "quick dash forward" or "sprint start" | Fast burst |
| `jane_skid` | "skidding stop" or "sliding stop" | Momentum stop |
| `jane_combat_idle` | "fighting idle" | Guard stance, ready pose |
| `jane_attack_1` | "right straight punch" | Single clean strike |
| `jane_attack_2` | "left kick" | Kick variant |
| `jane_combo` | "sword and shield combo" | Multi-hit |
| `jane_jump_start` | "jump" | Leave-ground moment |
| `jane_jump_apex` | "jump float" or "floating" | Apex hang |
| `jane_fall` | "falling idle" | Descending loop |
| `jane_land_hard` | "hard landing" | Impact stomp |
| `jane_land_mid` | "landing" | Normal landing |
| `jane_land_light` | "light landing" | Soft touch-down |
| `jane_leap_start` | "long jump" | Running leap |
| `jane_retreat` | "running backward" | Backward run |
| `jane_death` | "dying" or "back death" | Fall back death |
| `jane_bored` | "looking around" | Idle restlessness |
| `jane_refusing` | "disagreeing" or "head shake no" | Refusal gesture |
| `jane_ul_gesture` | "pointing gesture" or "casting" | UL symbol gesture |
| `jane_celebrate` | "jump celebration" | Win reaction |

**File naming**: Save each as `assets-src/jane/jane_<animation>.fbx`

---

## Step 4 — Import All Into Blender

See [blender-setup.md](blender-setup.md) Step 9 for the FBX import process.

The result is a single `jane.blend` file where the main armature
has one Action per animation, all accessible in the Action Editor.

---

## Animation Quality Tips

- **Preview each animation on your model before downloading** — not all
  Mixamo animations look right on every body type
- **Prefer loops**: for idle/walk/run/combat_idle, check that the last frame
  connects back to frame 1 without a visible pop. Mixamo labels some animations
  as "in place" — prefer these for locomotion
- **Prefer "in place"** (checkbox in Mixamo) for all locomotion animations.
  We control character movement in Phaser; we don't want root motion in the sprites
- **Adjust timing in Blender**: If an animation is too fast or slow,
  scale its keyframes in the NLA Editor

---

## Drone Animations (for SleeperDrone/Enemies)

The iOS catalog has 4 drone animations. Mixamo has limited non-humanoid options.
For enemy robots (Terminator is humanoid, Phantom is non-humanoid):

- **Terminator (humanoid)**: Use same Mixamo workflow
- **SleeperDrone/Phantom (non-humanoid)**:
  - Download a humanoid animation as base
  - Modify keyframes in Blender manually
  - Or use Blender's built-in animation tools for simple up/down hover cycles

---

## Saving Progress

After downloading all animations for a character:
1. Import all into `jane.blend`
2. Verify each action plays correctly in Blender's timeline
3. Save `jane.blend`
4. Commit `assets-src/jane/` to git LFS

The `.fbx` files are the source — keep them even after importing to Blender.
They're needed if the `.blend` file gets corrupted or Blender version changes.
