// CombatImpactFX.ts
// One-shot combat hit burst — amber particles + white core + screen shake.

import { LeylineParticles } from './LeylineParticles';

export type HitType = 'player_hit' | 'enemy_hit';

export class CombatImpactFX {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    LeylineParticles.ensureParticleDotTexture(scene);
  }

  /** Emit a hit burst at world coordinates (x, y). */
  burst(x: number, y: number, _type: HitType = 'enemy_hit'): void {
    // Amber outer particles
    const amber = this.scene.add.particles(x, y, 'particle_dot', {
      tint: 0xffaa00,
      blendMode: Phaser.BlendModes.ADD,
      scale: { start: 1.4, end: 0 },
      alpha: { start: 1, end: 0 },
      speed: { min: 60, max: 140 },
      lifespan: 400,
      quantity: 10,
      emitting: false,
    });
    amber.explode(10, x, y);
    this.scene.time.delayedCall(500, () => amber.destroy());

    // White core particles
    const white = this.scene.add.particles(x, y, 'particle_dot', {
      tint: 0xffffff,
      blendMode: Phaser.BlendModes.ADD,
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      speed: { min: 20, max: 60 },
      lifespan: 200,
      quantity: 4,
      emitting: false,
    });
    white.explode(4, x, y);
    this.scene.time.delayedCall(300, () => white.destroy());

    // Screen shake
    this.scene.cameras.main.shake(200, 0.004);
  }
}
