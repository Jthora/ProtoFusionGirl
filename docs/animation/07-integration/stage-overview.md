# Stage 7 — Integration

> **Goal**: Wire the entire animation system to the game state machine.
> Every gameplay event triggers the correct visual response across sprites,
> particles, UI, and transitions. The game is visually complete.

---

## Prerequisites

- Stage 4 complete: all characters animated
- Stage 5 complete: world art in place
- Stage 6 complete: FX layer implemented
- All EventBus event types defined and wiring partially done

---

## Acceptance Criteria

This stage is complete when:

- [ ] Every JaneAI state has a correctly playing animation (no missing/wrong anims)
- [ ] All 7 JaneAI states → animation mappings tested (see Stage 2 acceptance)
- [ ] Walk/run speed-scaling works (slow → walk anim, fast → run anim)
- [ ] Jump/fall/land state machine plays in correct sequence
- [ ] Attack animation plays once and returns to combat_idle
- [ ] Death → rewind transition shows death animation then fades
- [ ] All allies (Terra, Aqua) animate correctly in their AI states
- [ ] Enemies animate correctly in patrol → combat → death sequence
- [ ] Leyline, rift, and UL puzzle FX all trigger on correct events
- [ ] 60fps confirmed with full cast + FX active
- [ ] No animation "pops" (visible frame skips at state transitions)

---

## Tasks

### Task 7.1 — Complete Animation State Machine

The animation state machine is the core of this stage.
See [phaser-animation-state-machine.md](phaser-animation-state-machine.md)
for the complete implementation.

Key implementation points:
- Centralize all animation control in `AnimationController` class
- AnimationController listens to EventBus, not spread across GameScene
- Handles blending rules (e.g., don't interrupt death with walk)
- Handles hold-last-frame logic

---

### Task 7.2 — Speed-Scaled Locomotion

Wire Jane's movement speed to animation selection:

```typescript
// In AnimationController or GameScene update():
const speed = janeBody.speed;  // Phaser arcade physics body speed

if (state === JaneAIState.Navigate || state === JaneAIState.FollowGuidance) {
  if (speed > 200) {
    playIfNotPlaying('jane_run');
  } else if (speed > 10) {
    playIfNotPlaying('jane_walk');
  } else {
    playIfNotPlaying('jane_idle');
  }
}

// Also scale run animation speed to match actual movement:
const runAnimSpeed = Phaser.Math.Clamp(speed / 300 * 16, 8, 24);
janeSprite.anims.msPerFrame = 1000 / runAnimSpeed;
```

---

### Task 7.3 — Jump/Air State Sequencing

The air state sequence (jump_start → apex → fall → land) requires
sequencing multiple one-shot animations:

```typescript
// JUMP_STARTED event:
janeSprite.play('jane_jump_start').once('animationcomplete', () => {
  if (body.velocity.y < 0) {  // still going up
    janeSprite.play('jane_jump_apex');
  } else {
    janeSprite.play('jane_fall');
  }
});

// In update() while airborne:
if (playingApex && body.velocity.y > 20) {
  janeSprite.play('jane_fall');
}

// JANE_LANDED event:
const landAnim = body.velocity.y > 400 ? 'jane_land_hard' :
                 body.velocity.y > 150 ? 'jane_land_mid' : 'jane_land_light';
janeSprite.play(landAnim).once('animationcomplete', () => {
  // Return to appropriate ground state
  transitionToGroundState();
});
```

---

### Task 7.4 — Combat Animation Sequencing

Attack plays once, then returns to appropriate state:

```typescript
// On attack input:
janeSprite.play('jane_attack_1').once('animationcomplete', () => {
  if (janeAI.state === JaneAIState.Combat) {
    janeSprite.play('jane_combat_idle');
  }
});
```

Prevent attack interruption by other events while playing:
```typescript
if (janeSprite.anims.currentAnim?.key.includes('attack')) {
  return;  // don't override attack animations
}
```

---

### Task 7.5 — Death and Rewind Transition

```typescript
// JANE_DIED event:
janeSprite.play('jane_death').once('animationcomplete', () => {
  // Hold on last death frame, then begin rewind sequence
  this.time.delayedCall(500, () => {
    // Fade out Jane
    this.tweens.add({ targets: janeSprite, alpha: 0, duration: 300 });
    // Trigger RewindSystem
    this.eventBus.emit({ type: 'REWIND_REQUESTED', data: {} });
  });
});

// REWIND_COMPLETE event:
janeSprite.setAlpha(1);
janeSprite.play('jane_idle');
```

---

### Task 7.6 — Performance Validation

Run a full stress test with all systems active simultaneously.

See [performance-budget.md](performance-budget.md) for targets and profiling approach.

Target: 60fps with:
- Jane (24 anims loaded, 1 playing)
- Terra (12 anims loaded, 1 playing)
- Aqua (12 anims loaded, 1 playing)
- 2× Terminator enemies
- 3× Drones
- 2× Leyline particle systems
- 1× Rift ambient
- 1× UL glyph puzzle active

---

## Outputs of Stage 7

```
src/animation/
  AnimationController.ts    Central animation state machine
  AnimationPriority.ts      Priority rules (attack > walk > idle)

src/world/fx/
  (all FX classes from Stage 6 — fully wired to EventBus)
```

---

## Time Estimate

| Task | Time |
|------|------|
| 7.1 Animation state machine | 3-4 hours |
| 7.2 Speed-scaled locomotion | 1 hour |
| 7.3 Jump/air sequencing | 1-2 hours |
| 7.4 Combat sequencing | 1 hour |
| 7.5 Death/rewind transition | 1 hour |
| 7.6 Performance validation | 1-2 hours |
| **Total** | **8-11 hours** |

---

## Next Stage

With everything working and validated, proceed to the optional
[Stage 8: Sprite Factory](../08-sprite-factory/stage-overview.md) —
a developer tool that makes creating new characters and animations
even faster, with a preview window and real-time Blender preview.
