# iOS to New Pipeline Migration Map

Maps the original iOS animation keys (from the extracted catalog) to the
new Blender-rendered pipeline keys.

The iOS prototype used a hand-coded sprite atlas with its own key naming.
This document ensures nothing is lost in migration.

---

## iOS Catalog Summary

The iOS atlas was extracted and catalogued with a gap analysis:
- **139 frames found** in source atlas
- **117 frames** in `jane_atlas` (22 missing)
- Source frames covered multiple animation states

The iOS atlas was a single spritesheet with positionally-indexed frames
(not named by animation state). The catalog maps frame positions to
inferred animation states based on visual content.

---

## Key Mapping Table

| iOS Frame Group / Inferred State | iOS Key Pattern | New Pipeline Key | Notes |
|----------------------------------|-----------------|-----------------|-------|
| Idle breathing | `JANE_IDLE_*` or frames 0-7 | `jane_idle` | Direct equivalent |
| Standing / at rest | `JANE_STAND` or `JANE_READY` | `jane_stand` | May be single frame in iOS |
| Walking | `JANE_WALK_*` | `jane_walk` | iOS had ~8 frames; new = 12 |
| Running | `JANE_RUN_*` | `jane_run` | iOS had ~8 frames; new = 16 |
| Combat stance | `JANE_COMBAT_*` or `JANE_FIGHT_*` | `jane_combat_idle` | |
| Punch / attack | `JANE_ATTACK_*` or `JANE_PUNCH_*` | `jane_attack_1` | |
| Jump upward | `JANE_JUMP_*` | `jane_jump_start` | iOS likely single frame |
| Falling | `JANE_FALL_*` | `jane_fall` | |
| Landing | `JANE_LAND_*` | `jane_land_mid` | iOS had one landing |
| Death | `JANE_DEATH_*` or `JANE_DIE_*` | `jane_death` | |
| Idle variant / bored | `JANE_BORED_*` or `JANE_LOOK_*` | `jane_bored` | |
| Refusal / no | `JANE_NO_*` or `JANE_REFUSE_*` | `jane_refusing` | |

---

## Animations New to Rebuild (Not in iOS)

These animations did not exist in the iOS prototype and are new for this rebuild:

| New Key | Why Added |
|---------|-----------|
| `jane_dash` | SpeedSystem added high-speed dash mechanic |
| `jane_skid` | SpeedSystem deceleration visual |
| `jane_jump_apex` | Separate apex float state for better air feel |
| `jane_land_hard` | Hard landing impact — new gameplay mechanic |
| `jane_land_light` | Soft landing variant |
| `jane_leap_start` | Running leap — long jump mechanic |
| `jane_attack_2` | Second attack variant for combo system |
| `jane_combo` | Full combo chain animation |
| `jane_retreat` | Separate retreat vs run — combat fleeing |
| `jane_ul_gesture` | Universal Language puzzle interaction |
| `jane_celebrate` | Win reaction — new reward state |

---

## iOS Frame Gap Analysis

The 22 missing frames from the iOS atlas were gaps in the original
hand-coded spritesheet (frames that existed in source but were never
placed in the atlas). These are **not needed** in the new pipeline —
the new pipeline regenerates all frames from scratch in Blender.

The iOS source can be used as visual reference for:
- Character proportions (5.5 heads tall)
- Silhouette shape at key poses (idle, walk, combat)
- Animation timing "feel" (we can match the iOS timing by counting frames)

---

## Visual Reference Extraction

To extract iOS reference frames for visual comparison:

```
iOS atlas location: iOS_content_port/
Key reference frames to extract:
  - Frame at idle mid-point (most relaxed pose)
  - Frame at walk stride peak (leg fully extended)
  - Frame at combat guard (most characteristic silhouette)
```

These can be opened in any image viewer alongside Blender renders
to compare silhouette style during quality review.

---

## Frame Count Comparison

| Animation | iOS Frames | New Pipeline Frames | Delta |
|-----------|-----------|---------------------|-------|
| Idle | ~8 | 8 | 0 |
| Walk | ~8 | 12 | +4 |
| Run | ~8 | 16 | +8 |
| Combat idle | ~4 | 8 | +4 |
| Attack | ~6 | 8 | +2 |
| Jump | ~4 | 6 | +2 |
| Fall | ~4 | 6 | +2 |
| Land | ~4 | 6 | +2 |
| Death | ~8 | 16 | +8 |
| Bored | N/A | 20 | new |
| Refusing | N/A | 12 | new |
| **Total** | ~54 | 232 | +178 |

The new pipeline produces significantly more frames at the same or
higher frame rate, resulting in much smoother animations.
