# Stage 4 — Full Roster

> **Goal**: All playable and NPC characters have complete animation sets
> rendered through the automated pipeline. The game can run with a full
> cast of animated characters.

---

## Prerequisites

- Stage 3 complete: `npm run sprites` works end-to-end for Jane
- `sprite-catalog.json` schema is stable
- Automated atlas validation passing for Jane

---

## Characters

| Character | Role | Priority | Animation Count |
|-----------|------|----------|-----------------|
| Jane | Player character | P1 (done in Stage 2) | 24 |
| Terra | Ally / companion | P2 | 12 |
| Aqua | Ally / companion | P3 | 12 |
| Terminator | Enemy (humanoid) | P4 | 8 |
| SleeperDrone | Enemy (non-humanoid) | P5 | 4 |
| JonoHologram | NPC guide | P6 | 6 |

---

## Acceptance Criteria

This stage is complete when:

- [ ] Terra fully animated: 12 animations in `terra_atlas.png`
- [ ] Aqua fully animated: 12 animations in `aqua_atlas.png`
- [ ] Terminator enemy animated: 8 animations in `terminator_atlas.png`
- [ ] SleeperDrone animated: 4 animations in `drone_atlas.png`
- [ ] JonoHologram animated: 6 animations in `jono_atlas.png`
- [ ] All characters visible in GameScene without placeholder shapes
- [ ] `sprite-catalog.json` covers all 5 characters
- [ ] `npm run sprites` builds all atlases in one command

---

## Tasks

### Task 4.1 — Terra

Terra is an ally who joins after Node 2 repair. Humanoid, slightly taller
than Jane, more fluid movements.

See [characters/terra.md](characters/terra.md) for:
- Meshy.ai prompt
- Mixamo animation list
- Visual spec (color coding in Blender)

**Terra's 12 animations:**
`terra_idle`, `terra_walk`, `terra_run`, `terra_combat_idle`,
`terra_attack_1`, `terra_jump_start`, `terra_fall`, `terra_land_mid`,
`terra_death`, `terra_bored`, `terra_celebrate`, `terra_heal`

---

### Task 4.2 — Aqua

Aqua is an ally with water-themed movement style (floatier, more graceful).
Same body proportions as Jane.

See [characters/aqua.md](characters/aqua.md) for details.

**Aqua's 12 animations:**
`aqua_idle`, `aqua_walk`, `aqua_run`, `aqua_combat_idle`,
`aqua_attack_1`, `aqua_jump_start`, `aqua_fall`, `aqua_land_mid`,
`aqua_death`, `aqua_bored`, `aqua_celebrate`, `aqua_wave`

---

### Task 4.3 — Terminator Enemy

Humanoid enemy — heavier build, aggressive stance. Same Mixamo workflow
as Jane/Terra/Aqua but with heavier/slower animation choices.

See [characters/enemies.md](characters/enemies.md) for details.

**Terminator's 8 animations:**
`terminator_idle`, `terminator_walk`, `terminator_run`,
`terminator_attack_1`, `terminator_attack_2`, `terminator_hurt`,
`terminator_death`, `terminator_alert`

---

### Task 4.4 — SleeperDrone (Non-Humanoid)

The SleeperDrone is a flying enemy — non-humanoid. It cannot use
Mixamo's humanoid auto-rig directly.

**Approach options:**
1. **Simple Blender keyframe animation**: For a hovering drone with 4
   animations (hover, move, attack, explode), hand-keyed animation
   in Blender takes ~2 hours. No Mixamo needed.
2. **Mixamo humanoid as base, heavily modified**: Download a simple
   floating animation, strip arms/legs, rework for drone shape.

Option 1 is recommended. Drones have simple movement patterns.

See [characters/enemies.md](characters/enemies.md) for drone shape spec.

**Drone's 4 animations:**
`drone_hover`, `drone_move`, `drone_attack`, `drone_explode`

---

### Task 4.5 — JonoHologram

The Jono Hologram NPC appears semi-transparent in-game (handled via
Phaser alpha, not in the sprite). The sprite itself should be a standard
silhouette.

Jono appears standing — limited movement. Hand-keyed in Blender or use
a simple Mixamo idle/gesture set.

See [characters/jono-hologram.md](characters/jono-hologram.md) for details.

**JonoHologram's 6 animations:**
`jono_idle`, `jono_talk`, `jono_point`, `jono_wave`,
`jono_think`, `jono_disappear`

---

### Task 4.6 — Wire All Characters in GameScene

Once all atlases exist, wire them into `GameScene.ts` and their
respective manager classes.

Pattern (same as Jane):
```typescript
// In preload():
this.load.atlas('terra', 'assets/sprites/terra/terra_atlas.png',
                          'assets/sprites/terra/terra_atlas.json');

// In create():
this.anims.create({
  key: 'terra_idle',
  frames: this.anims.generateFrameNames('terra', {
    prefix: 'terra_idle_', start: 0, end: 7, zeroPad: 3
  }),
  frameRate: 8,
  repeat: -1,
});
```

Each character's AI (`TerraAI`, `AquaAI`) follows the same pattern as
`JaneAI` — emits `*_ANIMATION_CHANGED` events that `GameScene` listens for.

---

## Outputs of Stage 4

```
assets-src/
  terra/terra.blend + terra_*.fbx
  aqua/aqua.blend + aqua_*.fbx
  enemies/terminator.blend + terminator_*.fbx
  enemies/drone.blend (hand-keyed, no fbx)
  jono/jono.blend + jono_*.fbx

public/assets/sprites/
  terra/terra_atlas.png + terra_atlas.json
  aqua/aqua_atlas.png + aqua_atlas.json
  enemies/terminator_atlas.png + terminator_atlas.json
  enemies/drone_atlas.png + drone_atlas.json
  jono/jono_atlas.png + jono_atlas.json

scripts/sprite-catalog.json  (updated with all 5 characters)
```

---

## Time Estimate

| Task | Time |
|------|------|
| 4.1 Terra (Meshy + Mixamo + render) | 4-6 hours |
| 4.2 Aqua (Meshy + Mixamo + render) | 4-6 hours |
| 4.3 Terminator (Meshy + Mixamo + render) | 3-5 hours |
| 4.4 SleeperDrone (hand-keyed in Blender) | 2-4 hours |
| 4.5 JonoHologram (Meshy + minimal anims) | 2-3 hours |
| 4.6 GameScene wiring for all | 2-3 hours |
| **Total** | **17-27 hours** |

---

## Next Stage

With all characters animated, proceed to
[Stage 5: World Art](../05-world-art/stage-overview.md) to render
the tileset and background art using the same Blender pipeline.
