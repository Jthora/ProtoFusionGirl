// AnimationController.ts
// Central dispatcher for all character sprite animations.
// Enforces priority rules so high-priority animations (death, attack)
// cannot be interrupted by lower-priority ones (walk, idle).
//
// GameScene registers sprites via registerSprite(); it should then avoid
// calling sprite.play() directly — route everything through this controller.

import { EventBus } from '../core/EventBus';
import { canInterrupt, getPriority } from './AnimationPriority';

interface SpriteEntry {
  sprite: Phaser.GameObjects.Sprite;
  currentAnimKey: string;
  locked: boolean; // true while a one-shot is completing
}

export class AnimationController {
  private sprites = new Map<string, SpriteEntry>();
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.subscribeToEvents();
  }

  /** Register a sprite to be controlled by this controller. */
  registerSprite(key: string, sprite: Phaser.GameObjects.Sprite): void {
    this.sprites.set(key, { sprite, currentAnimKey: '', locked: false });
  }

  /**
   * Play a looping animation.
   * Blocked if current animation has higher priority and is not the same key.
   */
  play(spriteKey: string, animKey: string): void {
    const entry = this.sprites.get(spriteKey);
    if (!entry) return;
    if (entry.locked) return;
    if (entry.currentAnimKey === animKey) return; // already playing — dedupe
    if (!canInterrupt(entry.currentAnimKey, animKey)) return;

    entry.currentAnimKey = animKey;
    entry.sprite.play(animKey, true);
  }

  /**
   * Play a one-shot animation (no repeat).
   * Locks the sprite until the animation completes, then calls onComplete.
   */
  playOnce(spriteKey: string, animKey: string, onComplete?: () => void): void {
    const entry = this.sprites.get(spriteKey);
    if (!entry) return;
    if (entry.locked && getPriority(animKey) <= getPriority(entry.currentAnimKey)) return;

    entry.locked = true;
    entry.currentAnimKey = animKey;
    entry.sprite.play(animKey, true);

    entry.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + animKey, () => {
      entry.locked = false;
      onComplete?.();
    });
  }

  /** Force-play regardless of priority (use sparingly, e.g. death). */
  forcePlay(spriteKey: string, animKey: string): void {
    const entry = this.sprites.get(spriteKey);
    if (!entry) return;
    entry.locked = false;
    entry.currentAnimKey = animKey;
    entry.sprite.play(animKey, true);
  }

  // ─── Event subscriptions ──────────────────────────────────────────────────

  private subscribeToEvents(): void {
    this.eventBus.on('JANE_ANIMATION_CHANGED', (event) => {
      this.play('jane', event.data.animKey);
    });
  }
}
