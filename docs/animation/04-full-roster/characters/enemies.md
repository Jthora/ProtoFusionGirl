# Enemy Characters — Spec

Covers both enemy types: the humanoid Terminator and the non-humanoid SleeperDrone.

---

## Terminator

### Role

Primary humanoid enemy. Aggressive, heavy-build opponent. Appears in combat
encounters after Node 2.

### Visual Spec

**Body proportions**: 6.5 heads tall (noticeably taller than Jane — reads
as threatening at 128×128)

**Silhouette distinguishers**:
- Broad shoulders (noticeable width vs Jane)
- Heavy legs, plated boots
- No visible hair — helmet or smooth dome head
- Slightly hunched combat stance

**Meshy.ai Prompt:**
```
heavy-build male humanoid in combat exosuit with shoulder armor,
T-pose, game-ready character, helmeted head, plated boots,
broad chest, mechanical joints visible
```

**Negative prompt:**
```
female, slim, hair, civilian, weapon in hand
```

### Animation List

| Key | Mixamo Search | Loop | Notes |
|-----|---------------|------|-------|
| `terminator_idle` | "fighting idle" | Yes | Aggressive guard stance |
| `terminator_walk` | "walking" | Yes | Heavy, stomping gait |
| `terminator_run` | "running" | Yes | Forward aggressive run |
| `terminator_attack_1` | "right straight punch" | No (hold) | Slow but heavy |
| `terminator_attack_2` | "stomp" or "kick" | No (hold) | Area attack |
| `terminator_hurt` | "hit reaction" | No | Brief flinch |
| `terminator_death` | "dying" | No (hold) | Fall backward |
| `terminator_alert` | "looking around" | No | Detection reaction |

### Render Spec

Slower FPS than Jane — heavier movement feels more threatening.

| Key | FPS | Frames |
|-----|-----|--------|
| `terminator_idle` | 6 | 8 |
| `terminator_walk` | 10 | 12 |
| `terminator_run` | 14 | 16 |
| `terminator_attack_1` | 12 | 10 |
| `terminator_attack_2` | 12 | 10 |
| `terminator_hurt` | 16 | 4 |
| `terminator_death` | 10 | 16 |
| `terminator_alert` | 8 | 8 |

### Blender File

Save as: `assets-src/enemies/terminator.blend`

**Camera adjustment**: Terminator is 6.5 heads tall vs Jane's 5.5.
Increase ortho scale slightly (try 2.5 instead of 2.2) to ensure
Terminator fits in frame. The larger apparent size is intentional —
Terminator will appear bigger on screen than Jane.

---

## SleeperDrone

### Role

Flying non-humanoid enemy. Patrols areas and activates when Jane
enters detection range. Simple AI: patrol → detect → attack → return.

### Visual Spec

**Shape**: Roughly spherical core with 4 blade-like fins extending outward.
Think floating mine meets surveillance drone. ~60% of Jane's height when
rendered at same ortho scale (reads as "smaller but dangerous").

**Not rigged** — no skeleton needed. All animation via object-level
transforms (position/rotation keyframes on the mesh directly in Blender).

**No Meshy.ai or Mixamo**: Model the drone by hand in Blender.
Simple geometry: sphere + 4 extruded planes = ~10 minutes to model.

### Simple Blender Model

```
1. Add → Mesh → UV Sphere
2. Scale: S → 0.3 (small core)
3. Add → Mesh → Plane (create 4 fins):
   - Scale: S → 0.5, 0.05, 0.2
   - Duplicate and rotate 90° four times
   - Parent all fins to sphere
4. Apply silhouette material to all meshes
5. Position: same Z=0 plane but flies up at Z=0.5 during animations
```

### Animation List (Hand-Keyed)

| Key | Description | Loop | Frames | Keyframe approach |
|-----|-------------|------|--------|-------------------|
| `drone_hover` | Gentle vertical bob | Yes | 8 | Z position: 0.5→0.6→0.5 + slight rotation |
| `drone_move` | Tilted forward movement | Yes | 8 | X tilt 10°, faster bob |
| `drone_attack` | Dive toward target | No (hold) | 12 | Z drop + scale pulsing |
| `drone_explode` | Destruction sequence | No (hold) | 16 | Rapid spin + scale 1→0 |

### How to Keyframe in Blender

```
Timeline: Start=1, End=8 (or 16)
Select all drone objects (sphere + fins)
Frame 1: press I → Location Rotation Scale
Frame 4: move/rotate, press I
Frame 8: return to frame 1 pose, press I
→ Blender auto-interpolates
```

For `drone_explode`: add a scale keyframe at frame 1 (1,1,1) and
frame 16 (0,0,0) — the drone shrinks to nothing.

### Render Spec

| Key | FPS | Frames |
|-----|-----|--------|
| `drone_hover` | 6 | 8 |
| `drone_move` | 8 | 8 |
| `drone_attack` | 12 | 12 |
| `drone_explode` | 12 | 16 |

### Blender File

Save as: `assets-src/enemies/drone.blend`

**Camera adjustment**: Drone is smaller than humanoids. The 2.2 ortho
scale will make it appear small in the frame — this is correct. The
drone should appear visually smaller than Jane on screen.
