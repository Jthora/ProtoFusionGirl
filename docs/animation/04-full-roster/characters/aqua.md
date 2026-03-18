# Aqua — Character Spec

## Role

Second ally character. Aqua's movement style is fluid and graceful —
she moves as if in water (floatier jumps, wider stances, sweeping gestures).
Joins after the first rift seal.

---

## Visual Spec

**Body proportions**: 5.5 heads tall

**Silhouette distinguishers**:
- Similar height to Jane
- Wider, more sweeping arm poses
- Short bob haircut (very distinct from Jane's ponytail and Terra's long hair)
- Slight flare at lower legs (fin-like boot detail)

**Meshy.ai Prompt:**
```
athletic female humanoid in a flowing sci-fi aquatic suit,
T-pose, game-ready character, short bob haircut,
smooth rounded armor plates, flared boots
```

**Negative prompt:**
```
ponytail, long hair, sharp edges, heavy armor, bulky
```

---

## Animation List

Aqua's animations prioritize fluid, sweeping motion. In Blender, keyframe
timing should be stretched slightly vs Jane to give a "water" feeling —
slower eases in and out.

| Key | Mixamo Search | Loop | Notes |
|-----|---------------|------|-------|
| `aqua_idle` | "breathing idle" or "floating" | Yes | Slow swaying |
| `aqua_walk` | "walking" | Yes | Smooth, gliding gait |
| `aqua_run` | "running" | Yes | Arms sweep wide |
| `aqua_combat_idle` | "fighting idle" | Yes | Low stance, wider |
| `aqua_attack_1` | "roundhouse kick" or "sweep kick" | No (hold) | Sweeping motion |
| `aqua_jump_start` | "jump" | No | Higher arc feel |
| `aqua_fall` | "falling idle" | Yes | Arms out, gliding |
| `aqua_land_mid` | "landing" | No (hold) | |
| `aqua_death` | "dying" | No (hold) | |
| `aqua_bored` | "looking around" | No | |
| `aqua_celebrate` | "jump celebration" | No | |
| `aqua_wave` | "wave hello" | No | Greeting NPC animation |

---

## Render Spec

| Key | FPS | Frames |
|-----|-----|--------|
| `aqua_idle` | 6 | 8 | Slower = floatier |
| `aqua_walk` | 10 | 12 | Slightly slower than Jane |
| `aqua_run` | 14 | 16 | |
| `aqua_combat_idle` | 6 | 8 | |
| `aqua_attack_1` | 14 | 8 | |
| `aqua_jump_start` | 14 | 6 | |
| `aqua_fall` | 6 | 6 | Slow glide |
| `aqua_land_mid` | 14 | 6 | |
| `aqua_death` | 10 | 16 | |
| `aqua_bored` | 8 | 16 | |
| `aqua_celebrate` | 10 | 20 | |
| `aqua_wave` | 8 | 16 | |

**Note on timing**: Aqua's FPS values are deliberately slightly lower than
Jane's equivalent animations. This is intentional — it creates the floatier
aesthetic without requiring different Blender animations. Same Mixamo source,
different playback rate.

---

## Blender File

Save as: `assets-src/aqua/aqua.blend`

Same camera setup as Jane/Terra. Aqua's slightly different silhouette
(wider stances, flared boots) will distinguish her at 128×128.

---

## GameScene AI Integration

Aqua is managed by `AquaAI` (in `src/ai/AquaHero.ts` — already exists).
Same event-driven animation pattern as Jane/Terra.

```typescript
// AquaAI states (check src/ai/AquaHero.ts for current state)
// Wire aqua_atlas in preload and listen for AQUA_ANIMATION_CHANGED
```
