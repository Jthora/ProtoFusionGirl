// RiftAmbientFX.ts
// Magenta ambient wisp particles for rift zones.
// Scale density with instability level (0–100).

import { LeylineParticles } from './LeylineParticles';

export class RiftAmbientFX {
  private emitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private scene: Phaser.Scene;
  private centerX: number;
  private centerY: number;
  private radius: number;

  constructor(scene: Phaser.Scene, centerX: number, centerY: number, radius: number = 80) {
    this.scene = scene;
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    LeylineParticles.ensureParticleDotTexture(scene);
    this.createEmitter(20); // default low density
  }

  private createEmitter(frequency: number): void {
    this.destroyEmitter();
    this.emitter = this.scene.add.particles(this.centerX, this.centerY, 'particle_dot', {
      tint: 0xff2d78,
      blendMode: Phaser.BlendModes.ADD,
      scale: { start: 1.0, end: 0 },
      alpha: { start: 0.7, end: 0 },
      speed: { min: 10, max: 35 },
      lifespan: { min: 1200, max: 2000 },
      frequency,
      quantity: 1,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, this.radius),
      },
    });
  }

  /**
   * Update particle density based on instability.
   * @param level 0–100 (0 = stable, 100 = critical)
   */
  setInstabilityLevel(level: number): void {
    const clamped = Math.max(0, Math.min(100, level));
    // frequency = ms between emissions; lower = denser
    // stable (0): 200ms → ~5/sec
    // critical (100): 20ms → ~50/sec
    const frequency = Math.round(200 - clamped * 1.8);
    this.createEmitter(frequency);
  }

  destroyEmitter(): void {
    if (this.emitter) {
      this.emitter.destroy();
      this.emitter = null;
    }
  }
}
