# Stage 2 — Jane Pilot

> **Goal**: All 24 Jane animations rendered and wired to JaneAI states.
> Jane is fully animated for all gameplay scenarios.
> This stage also validates the manual render process before automation.

---

## Prerequisites

- Stage 1 complete: `jane.blend` exists with at least `jane_idle` action
- All Mixamo animations downloaded and imported into `jane.blend`
- Stage 1 idle animation visible in-game

---

## Acceptance Criteria

This stage is complete when:

- [ ] All 24 animations listed in [animation-list.md](animation-list.md) are rendered
- [ ] All animations loaded in Phaser as a single atlas `jane_atlas.png`
- [ ] Every JaneAI state transition triggers the correct animation
- [ ] Walk/run/combat_idle loop seamlessly
- [ ] Attack/land/death play once and hold last frame
- [ ] Animation transitions have no visible pop between states
- [ ] Game runs at 60 FPS with Jane fully animated

---

## Tasks

### Task 2.1 — Complete Blender Animation Library

Ensure all 24 actions are in `jane.blend`:

1. Open `jane.blend`
2. Open the **Action Editor** (in the NLA editor or Dope Sheet → Action Editor mode)
3. Verify all actions exist: `jane_idle`, `jane_walk`, `jane_run`, etc.
4. For any missing actions: import the corresponding `.fbx` per Mixamo workflow
5. Play each action (Space bar) and verify the deformation looks correct

Common issues to fix at this stage:
- Feet sliding above/below ground plane: add IK constraints or adjust in NLA
- Arms passing through body: minor keyframe editing in Blender
- Animation too fast/slow: scale keyframes in Dope Sheet

---

### Task 2.2 — Render All 24 Animations

For each animation, render the frames and assemble the sprite sheet.

**At this stage, render manually** (automation comes in Stage 3).

For each animation:
1. Set active action in Action Editor
2. Check frame range (Blender timeline Start/End)
3. Adjust FPS: see `render-spec.md` for target FPS per animation
4. Render all frames: `Render → Render Animation` (outputs to `temp/` folder)
5. Assemble into sprite sheet (grid: 8 frames per row)
6. Name: `public/assets/sprites/jane/jane_<animation>.png`

See [render-spec.md](render-spec.md) for exact frame counts and fps per animation.

**Render order** (priority — highest gameplay impact first):

1. `jane_idle` (already done in Stage 1)
2. `jane_walk`
3. `jane_run`
4. `jane_combat_idle`
5. `jane_attack_1`
6. `jane_retreat`
7. `jane_jump_start` + `jane_fall` + `jane_land_mid`
8. `jane_death`
9. `jane_bored`
10. `jane_refusing`
11. All remaining animations

---

### Task 2.3 — Build Complete Atlas JSON

Once all sprite sheets are rendered, combine them into a single atlas.

**Option A — Manual atlas**: Write the JSON by hand, referencing each sprite sheet.
Each animation occupies a row in the final `jane_atlas.png` (2048×2048).

**Option B — Use TexturePacker or FreeTexturePacker (free)**:
1. Import all `jane_*.png` individual sprite sheets
2. Set output size to 2048×2048
3. Set frame naming to match the expected pattern: `jane_<animation>_000`, etc.
4. Export as Phaser 3 JSON Hash format
5. Output: `public/assets/sprites/jane/jane_atlas.png` + `jane_atlas.json`

Recommended: Option B. FreeTexturePacker is free and produces correct Phaser format.

---

### Task 2.4 — Animation State Machine Wiring

In `src/data/animationCatalog.ts`, create the complete animation config:

```typescript
import { JaneAIState } from '../ai/JaneAI';

export const JANE_ANIMATION_KEYS = {
  idle:          'jane_idle',
  walk:          'jane_walk',
  run:           'jane_run',
  combatIdle:    'jane_combat_idle',
  attack:        'jane_attack_1',
  retreat:       'jane_retreat',
  jumpStart:     'jane_jump_start',
  jumpApex:      'jane_jump_apex',
  fall:          'jane_fall',
  landHard:      'jane_land_hard',
  landMid:       'jane_land_mid',
  landLight:     'jane_land_light',
  death:         'jane_death',
  bored:         'jane_bored',
  refusing:      'jane_refusing',
  ulGesture:     'jane_ul_gesture',
  celebrate:     'jane_celebrate',
} as const;

export const JANE_STATE_TO_ANIMATION: Record<JaneAIState, string> = {
  [JaneAIState.Idle]:           JANE_ANIMATION_KEYS.idle,
  [JaneAIState.Navigate]:       JANE_ANIMATION_KEYS.walk,
  [JaneAIState.FollowGuidance]: JANE_ANIMATION_KEYS.walk,
  [JaneAIState.Combat]:         JANE_ANIMATION_KEYS.combatIdle,
  [JaneAIState.Retreat]:        JANE_ANIMATION_KEYS.retreat,
  [JaneAIState.Bored]:          JANE_ANIMATION_KEYS.bored,
  [JaneAIState.Refusing]:       JANE_ANIMATION_KEYS.refusing,
};
```

In `src/ai/JaneAI.ts`, add animation hook to `transitionTo()`:

```typescript
private transitionTo(newState: JaneAIState): void {
  if (this._state === newState) return;
  const previous = this._state;
  this._state = newState;

  // Trigger animation change
  const animKey = JANE_STATE_TO_ANIMATION[newState];
  if (animKey) {
    this.eventBus.emit({
      type: 'JANE_ANIMATION_CHANGED',
      data: { animationKey: animKey, loop: LOOPING_ANIMATIONS.has(newState) }
    });
  }

  this.eventBus.emit({
    type: 'JANE_STATE_CHANGED',
    data: { previousState: previous, newState }
  });
}
```

In `GameScene.ts`, listen for animation changes:

```typescript
this.eventBus.on('JANE_ANIMATION_CHANGED', (event) => {
  const sprite = this.playerManager.getJaneSprite();
  if (sprite && sprite.anims.exists(event.data.animationKey)) {
    sprite.play(event.data.animationKey, true);
  }
});
```

---

### Task 2.5 — Transition Polish

Prevent animation pops at state transitions:

1. **Blend-in frames**: For smooth transitions between similar states
   (idle→walk, walk→run), use `sprite.play({ key, startFrame: 0 })` after
   the first frame of the new animation has been reviewed for compatibility.

2. **Hold last frame on one-shot animations**: Attack, land, death should
   freeze on their last frame:
   ```typescript
   sprite.playOnce('jane_attack_1'); // helper for one-shot + hold
   ```

3. **Speed scaling**: Walk animation speed should scale with movement speed.
   At full sprint speed, play run. At slow approach, play walk.

---

## Outputs of Stage 2

```
assets-src/jane/
  jane.blend                    (updated with all 24 actions)
  jane_*.fbx                    (all Mixamo animation files)

public/assets/sprites/jane/
  jane_atlas.png                (2048×2048 packed atlas)
  jane_atlas.json               (Phaser texture atlas JSON)

src/data/
  animationCatalog.ts           (all animation configs + state map)
```

---

## Time Estimate

| Task | Time |
|------|------|
| 2.1 Complete Blender library | 2-4 hours |
| 2.2 Render all 24 animations | 4-8 hours |
| 2.3 Pack atlas JSON | 1-2 hours |
| 2.4 State machine wiring | 2-3 hours |
| 2.5 Transition polish | 1-2 hours |
| **Total** | **10-19 hours** |

---

## Next Stage

With Jane fully animated, proceed to
[Stage 3: Pipeline Tool](../03-pipeline-tool/stage-overview.md) to automate
the render process so that updating or adding animations takes minutes, not hours.
