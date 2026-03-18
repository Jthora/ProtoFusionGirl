# Jane Animation List

All 24 animations required for Stage 2. Listed in render priority order
(highest gameplay impact first).

See [render-spec.md](render-spec.md) for exact frame counts and FPS.
See [ios-migration-map.md](ios-migration-map.md) for mapping from iOS keys.

---

## Priority 1 — Core Locomotion (render first)

| # | Key | Description | Loop |
|---|-----|-------------|------|
| 1 | `jane_idle` | Breathing idle — subtle weight shift | Yes |
| 2 | `jane_walk` | Standard walk with natural arm swing | Yes |
| 3 | `jane_run` | Forward run (not sprinting) | Yes |
| 4 | `jane_combat_idle` | Guard stance — fighting ready pose | Yes |

---

## Priority 2 — Combat Core

| # | Key | Description | Loop |
|---|-----|-------------|------|
| 5 | `jane_attack_1` | Right straight punch | No (hold last) |
| 6 | `jane_retreat` | Running backward | Yes |

---

## Priority 3 — Jump / Air States

| # | Key | Description | Loop |
|---|-----|-------------|------|
| 7 | `jane_jump_start` | Leave-ground moment | No (play once) |
| 8 | `jane_fall` | Descending idle loop | Yes |
| 9 | `jane_land_mid` | Normal landing | No (hold last) |

---

## Priority 4 — Death / Bored / Refusal

| # | Key | Description | Loop |
|---|-----|-------------|------|
| 10 | `jane_death` | Fall-back death | No (hold last) |
| 11 | `jane_bored` | Looking around — idle restlessness | No (play once) |
| 12 | `jane_refusing` | Head-shake no — refusal gesture | No (play once) |

---

## Priority 5 — Remaining Locomotion

| # | Key | Description | Loop |
|---|-----|-------------|------|
| 13 | `jane_dash` | Quick burst forward | No (play once) |
| 14 | `jane_skid` | Momentum stop / sliding stop | No (play once) |
| 15 | `jane_stand` | Static standing pose | Yes |
| 16 | `jane_leap_start` | Running leap takeoff | No (play once) |

---

## Priority 6 — Additional Air States

| # | Key | Description | Loop |
|---|-----|-------------|------|
| 17 | `jane_jump_apex` | Apex hang / floating | Yes |
| 18 | `jane_land_hard` | Impact stomp — hard landing | No (hold last) |
| 19 | `jane_land_light` | Soft touch-down | No (hold last) |

---

## Priority 7 — Additional Combat

| # | Key | Description | Loop |
|---|-----|-------------|------|
| 20 | `jane_attack_2` | Left kick variant | No (hold last) |
| 21 | `jane_combo` | Multi-hit combo | No (hold last) |

---

## Priority 8 — Expressive / UL

| # | Key | Description | Loop |
|---|-----|-------------|------|
| 22 | `jane_ul_gesture` | Pointing / casting — UL symbol gesture | No (play once) |
| 23 | `jane_celebrate` | Jump celebration — win reaction | No (play once) |
| 24 | `jane_stand` | Static standing idle (duplicate of #15 — confirm needed) | Yes |

---

## Notes on Loop Behavior

- **Loop**: plays continuously until state changes
- **Play once**: plays through then transitions to next state automatically
- **Hold last**: plays through and freezes on final frame (attack, death, land)

The distinction between "play once" and "hold last" matters in Phaser:
- Play once: `sprite.play(key)` with `onComplete` callback to transition
- Hold last: `sprite.play(key)` with `stopOnFrame` set to last frame index, or use `playOnce()` helper (see Stage 2 task 2.5)

---

## JaneAI State → Animation Mapping

| JaneAI State | Primary Animation | Fallback |
|--------------|------------------|----------|
| `Idle` | `jane_idle` | `jane_stand` |
| `Navigate` | `jane_walk` or `jane_run` (speed-dependent) | `jane_walk` |
| `FollowGuidance` | `jane_walk` | `jane_walk` |
| `Combat` | `jane_combat_idle` | `jane_idle` |
| `Retreat` | `jane_retreat` | `jane_run` |
| `Bored` | `jane_bored` | `jane_idle` |
| `Refusing` | `jane_refusing` | `jane_idle` |

Walk vs run switch: if movement speed > 200 px/s → play `jane_run`, else → play `jane_walk`.
