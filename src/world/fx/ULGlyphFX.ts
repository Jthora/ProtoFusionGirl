// ULGlyphFX.ts
// Visual state machine for Universal Language glyph sprites.
// Drives reveal, solving, solve, and fail visual transitions.

import { LeylineParticles } from './LeylineParticles';

export type GlyphState = 'hidden' | 'revealed' | 'solving' | 'solved' | 'failed';

export class ULGlyphFX {
  private state: GlyphState = 'hidden';
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private tween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
    this.scene = scene;
    this.sprite = sprite;
    LeylineParticles.ensureParticleDotTexture(scene);
    this.sprite.setAlpha(0);
  }

  get currentState(): GlyphState {
    return this.state;
  }

  /** Fade glyph in + small cyan burst. */
  reveal(): void {
    if (this.state !== 'hidden') return;
    this.state = 'revealed';
    this.killTween();

    this.sprite.setAlpha(0);
    this.sprite.clearTint();
    this.tween = this.scene.tweens.add({
      targets: this.sprite,
      alpha: 1,
      duration: 400,
      ease: 'Sine.easeOut',
    });
    this.burst(0x00e5ff, 6);
  }

  /** Amber tint + pulsing scale — active while player is solving. */
  startSolving(): void {
    if (this.state !== 'revealed') return;
    this.state = 'solving';
    this.killTween();

    this.sprite.setTint(0xffaa00);
    this.tween = this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** Lock to cyan, sparkle burst, gentle forever pulse. */
  solve(): void {
    if (this.state !== 'solving') return;
    this.state = 'solved';
    this.killTween();

    this.sprite.setTint(0x00e5ff);
    this.sprite.setScale(1);
    this.burst(0x00e5ff, 12);
    this.tween = this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** Magenta flash + screen shake. */
  fail(): void {
    if (this.state === 'solved' || this.state === 'hidden') return;
    this.state = 'failed';
    this.killTween();

    this.sprite.setTint(0xff2d78);
    this.sprite.setScale(1);
    this.burst(0xff2d78, 8);

    // Shake tween
    const origX = this.sprite.x;
    this.tween = this.scene.tweens.add({
      targets: this.sprite,
      x: { from: origX - 6, to: origX + 6 },
      duration: 50,
      yoyo: true,
      repeat: 4,
      ease: 'Linear',
      onComplete: () => {
        this.sprite.setX(origX);
        this.sprite.clearTint();
        this.state = 'revealed';
      },
    });
  }

  /** Reset to hidden state (e.g. on level reload). */
  hide(): void {
    this.state = 'hidden';
    this.killTween();
    this.sprite.setAlpha(0);
    this.sprite.setScale(1);
    this.sprite.clearTint();
  }

  private killTween(): void {
    if (this.tween) {
      this.tween.stop();
      this.tween = null;
    }
  }

  private burst(color: number, count: number): void {
    const em = this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle_dot', {
      tint: color,
      blendMode: Phaser.BlendModes.ADD,
      scale: { start: 1.2, end: 0 },
      alpha: { start: 1, end: 0 },
      speed: { min: 30, max: 80 },
      lifespan: 600,
      quantity: count,
      emitting: false,
    });
    em.explode(count, this.sprite.x, this.sprite.y);
    this.scene.time.delayedCall(700, () => em.destroy());
  }
}
