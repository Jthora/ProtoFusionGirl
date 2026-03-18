# Jane — Character Spec

## Role

The player character. Jane Tho'ra is a pilot-class operative in a slim sci-fi
exosuit. She is the primary animated character and the template that all
other characters are compared against.

Jane is the most animation-rich character in the game — all 24 animations
are required. See [../../02-jane-pilot/animation-list.md](../../02-jane-pilot/animation-list.md)
for the complete list and
[../../02-jane-pilot/render-spec.md](../../02-jane-pilot/render-spec.md)
for frame counts and FPS.

---

## Visual Spec

**Body proportions**: 5.5 heads tall
(establishes the visual grammar — all humanoid allies match this)

**Silhouette distinguishers** (readable at 128×128):
- Ponytail extending from back of head
- Shoulder armor (slight width at shoulders)
- Slim-fitting exosuit (distinct from Terminator's bulky outline)
- Boots with slight heel

**Meshy.ai Prompt** (from Stage 1):
```
athletic female humanoid in a slim sci-fi exosuit with shoulder armor,
T-pose, clean topology, game-ready character model, no face details needed,
smooth limbs, visible ponytail, boots with heel
```

**Negative prompt:**
```
hyper detailed, face detail, wrinkles, bulky, fat, robot, mech suit
```

---

## Files

```
assets-src/jane/
  jane_base.glb          Meshy.ai generated model
  jane_for_mixamo.fbx    Exported for Mixamo upload
  jane_rigged.fbx        Mixamo T-pose with skeleton
  jane_idle.fbx          + one .fbx per animation (24 total)
  jane.blend             Master Blender scene with all 24 actions

public/assets/sprites/jane/
  jane_atlas.png         2048×2048 packed atlas
  jane_atlas.json        Phaser texture atlas JSON
```

---

## Animation Summary

See [../../02-jane-pilot/animation-list.md](../../02-jane-pilot/animation-list.md)
for the complete priority-ordered list.

24 animations total:
- 4 core locomotion (idle, walk, run, combat_idle)
- 8 combat/action (attack_1, attack_2, combo, retreat, dash, skid, leap_start, stand)
- 6 air state (jump_start, jump_apex, fall, land_hard, land_mid, land_light)
- 6 expressive/special (death, bored, refusing, ul_gesture, celebrate)

---

## JaneAI State Machine

Jane is controlled by `JaneAI` (`src/ai/JaneAI.ts`).

States and their primary animations:

| State | Animation |
|-------|-----------|
| `Idle` | `jane_idle` |
| `Navigate` | `jane_walk` / `jane_run` (speed-dependent) |
| `FollowGuidance` | `jane_walk` |
| `Combat` | `jane_combat_idle` |
| `Retreat` | `jane_retreat` |
| `Bored` | `jane_bored` (triggers after ~10s idle) |
| `Refusing` | `jane_refusing` (triggered by refusal events) |

The `AnimationController` (Stage 7) manages all state → animation transitions,
handling priority rules and one-shot completion callbacks.

---

## Notes

Jane was the pilot character for the entire pipeline (Stage 1-2). If something
looks wrong for any other character, compare to Jane as the reference:
- Camera position and ortho scale are tuned to Jane
- All other characters should use identical Blender scene settings
- Proportional differences (Terra taller, Drone smaller) emerge naturally
  from the models, not from camera adjustments
