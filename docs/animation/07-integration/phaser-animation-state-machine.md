# Phaser Animation State Machine

Central animation controller that decouples animation logic from
game logic. Lives in `src/animation/AnimationController.ts`.

---

## Design Principles

1. **Single owner**: Only AnimationController calls `sprite.play()`.
   GameScene and AI classes emit events; AnimationController acts.

2. **Priority system**: Higher-priority animations cannot be interrupted
   by lower-priority ones (e.g., death cannot be interrupted by walk).

3. **State tracking**: AnimationController knows what's currently playing
   and prevents redundant calls.

4. **One-shot handling**: Animations that play once (attack, death, land)
   automatically transition to the next appropriate state on completion.

---

## Animation Priority Levels

```typescript
// src/animation/AnimationPriority.ts

export const ANIMATION_PRIORITY: Record<string, number> = {
  // Priority 10 — cannot be interrupted
  jane_death:      10,
  jane_land_hard:  10,

  // Priority 8 — interrupt only by higher
  jane_attack_1:   8,
  jane_attack_2:   8,
  jane_combo:      8,
  jane_land_mid:   8,

  // Priority 6 — combat state
  jane_combat_idle: 6,
  jane_retreat:    6,

  // Priority 5 — air state
  jane_jump_start: 5,
  jane_jump_apex:  5,
  jane_fall:       5,
  jane_land_light: 5,

  // Priority 4 — locomotion
  jane_run:        4,
  jane_walk:       4,
  jane_dash:       4,
  jane_skid:       4,

  // Priority 2 — idle/expressive
  jane_idle:       2,
  jane_bored:      2,
  jane_refusing:   2,
  jane_stand:      2,
  jane_celebrate:  2,
  jane_ul_gesture: 2,
};

export function canInterrupt(current: string, incoming: string): boolean {
  const currentPriority = ANIMATION_PRIORITY[current] ?? 0;
  const incomingPriority = ANIMATION_PRIORITY[incoming] ?? 0;
  return incomingPriority >= currentPriority;
}
```

---

## AnimationController

```typescript
// src/animation/AnimationController.ts

import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { canInterrupt } from './AnimationPriority';

interface CharacterSprites {
  jane?: Phaser.GameObjects.Sprite;
  terra?: Phaser.GameObjects.Sprite;
  aqua?: Phaser.GameObjects.Sprite;
  jono?: Phaser.GameObjects.Sprite;
  [key: string]: Phaser.GameObjects.Sprite | undefined;
}

export class AnimationController {
  private sprites: CharacterSprites = {};
  private currentAnims: Record<string, string> = {};

  constructor(
    private scene: Phaser.Scene,
    private eventBus: EventBus
  ) {
    this.subscribeToEvents();
  }

  registerSprite(key: string, sprite: Phaser.GameObjects.Sprite): void {
    this.sprites[key] = sprite;
  }

  play(spriteKey: string, animKey: string): void {
    const sprite = this.sprites[spriteKey];
    if (!sprite) return;

    const currentAnim = this.currentAnims[spriteKey];
    if (currentAnim === animKey) return;  // already playing
    if (currentAnim && !canInterrupt(currentAnim, animKey)) return;  // priority blocked

    sprite.play(animKey, true);
    this.currentAnims[spriteKey] = animKey;
  }

  playOnce(spriteKey: string, animKey: string, onComplete?: () => void): void {
    const sprite = this.sprites[spriteKey];
    if (!sprite) return;

    const currentAnim = this.currentAnims[spriteKey];
    if (currentAnim && !canInterrupt(currentAnim, animKey)) return;

    sprite.play(animKey);
    this.currentAnims[spriteKey] = animKey;

    sprite.once('animationcomplete', () => {
      if (this.currentAnims[spriteKey] === animKey) {
        this.currentAnims[spriteKey] = '';
      }
      onComplete?.();
    });
  }

  private subscribeToEvents(): void {
    this.eventBus.on('JANE_ANIMATION_CHANGED', (event) => {
      const { animationKey, loop } = event.data;
      if (loop) {
        this.play('jane', animationKey);
      } else {
        this.playOnce('jane', animationKey);
      }
    });

    this.eventBus.on('TERRA_ANIMATION_CHANGED', (event) => {
      this.play('terra', event.data.animationKey);
    });

    this.eventBus.on('AQUA_ANIMATION_CHANGED', (event) => {
      this.play('aqua', event.data.animationKey);
    });

    this.eventBus.on('JONO_ANIMATION_CHANGED', (event) => {
      this.play('jono', event.data.animationKey);
    });
  }
}
```

---

## Transition Rules Table

| From state | To state | Allowed? | Notes |
|-----------|----------|----------|-------|
| `jane_death` | anything | No | Death is terminal |
| `jane_attack_*` | `jane_walk` | No | Don't break attack |
| `jane_attack_*` | `jane_attack_*` | Yes | Combo continuation |
| `jane_jump_start` | `jane_fall` | Yes | Natural air progression |
| `jane_fall` | `jane_land_*` | Yes | Required landing |
| `jane_land_hard` | `jane_walk` | No (until complete) | Hold last frame |
| `jane_combat_idle` | `jane_idle` | Yes (with delay) | Exit combat |
| any | `jane_death` | Yes | Death overrides all |

---

## Hold-Last-Frame Pattern

For animations that should freeze on their final frame:

```typescript
// In AnimationController.playOnce():
sprite.play(animKey);
sprite.once('animationcomplete', () => {
  // Stop on last frame by going back 1 and pausing
  sprite.anims.pause(sprite.anims.currentAnim?.frames.at(-1));
});
```

Or use Phaser's built-in:
```typescript
sprite.play({ key: animKey, stopOnFrame: animTotalFrames - 1 });
```

---

## Registration in GameScene

```typescript
// In GameScene.create():
this.animController = new AnimationController(this, this.eventBus);
this.animController.registerSprite('jane', this.janeSprite);
this.animController.registerSprite('terra', this.terraSprite);
this.animController.registerSprite('aqua', this.aquaSprite);
this.animController.registerSprite('jono', this.jonoSprite);
```

After this, GameScene never calls `sprite.play()` directly —
all animation is mediated by `AnimationController`.
