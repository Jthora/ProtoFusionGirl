# Terra — Character Spec

## Role

Ally who joins after the player repairs the damaged robot at Node 2.
Terra appears mid-game and fights alongside Jane through the rift seal sequence.

---

## Visual Spec

**Body proportions**: 5.5 heads tall (same as Jane — same silhouette shader,
same Blender camera, will read as cohesive)

**Silhouette distinguishers** (readable at 128×128):
- Slightly taller/leaner than Jane
- Long hair flowing behind (distinct from Jane's ponytail)
- No shoulder armor — sleeker outline
- Longer limbs = different movement rhythm

**Meshy.ai Prompt:**
```
athletic female humanoid in a sleek sci-fi bodysuit,
T-pose, clean topology, game-ready character, long flowing hair,
slender build, no armor plating, boots with flat sole
```

**Negative prompt:**
```
shoulder pads, armor, chunky, short hair, ponytail, helmet
```

---

## Animation List

| Key | Mixamo Search | Loop | Notes |
|-----|---------------|------|-------|
| `terra_idle` | "breathing idle" | Yes | Slightly floatier than Jane |
| `terra_walk` | "walking" | Yes | Long-stride, elegant |
| `terra_run` | "running" | Yes | |
| `terra_combat_idle` | "fighting idle" | Yes | More aggressive stance than Jane |
| `terra_attack_1` | "right straight punch" | No (hold) | |
| `terra_jump_start` | "jump" | No | |
| `terra_fall` | "falling idle" | Yes | |
| `terra_land_mid` | "landing" | No (hold) | |
| `terra_death` | "dying" | No (hold) | |
| `terra_bored` | "looking around" | No | |
| `terra_celebrate` | "jump celebration" | No | |
| `terra_heal` | "standing react" or "breathing" modified | No | Healing animation for repair scenes |

---

## Render Spec

Same settings as Jane (128×128, silhouette material, Standard color management).

| Key | FPS | Frames |
|-----|-----|--------|
| `terra_idle` | 8 | 8 |
| `terra_walk` | 12 | 12 |
| `terra_run` | 16 | 16 |
| `terra_combat_idle` | 8 | 8 |
| `terra_attack_1` | 16 | 8 |
| `terra_jump_start` | 16 | 6 |
| `terra_fall` | 8 | 6 |
| `terra_land_mid` | 16 | 6 |
| `terra_death` | 12 | 16 |
| `terra_bored` | 10 | 16 |
| `terra_celebrate` | 12 | 16 |
| `terra_heal` | 8 | 12 |

---

## Blender File

Save as: `assets-src/terra/terra.blend`

Same scene setup as `jane.blend`:
- Same orthographic camera (same scale ensures Terra/Jane are the same size
  on screen, but Terra's taller model will naturally fill more frame height)
- Same silhouette material
- Same white world background

**Important**: Use the same camera position and ortho scale as Jane.
Terra being slightly taller should appear naturally taller in the sprite.
Do NOT resize the camera to fit Terra — the scale difference is intentional.

---

## GameScene AI Integration

Terra is managed by `TerraAI` (in `src/ai/Terra.ts`). The states mirror
JaneAI but are simpler — Terra is an NPC ally, not player-controlled.

```typescript
// Terra AI states
enum TerraAIState {
  Inactive = 'inactive',  // before Node 2 repair
  Follow   = 'follow',    // following Jane
  Combat   = 'combat',
  Heal     = 'heal',
  Celebrate = 'celebrate',
}
```

Terra emits `TERRA_ANIMATION_CHANGED` events; `GameScene` listens and calls
`terraSprite.play(...)` in the same pattern as Jane.
