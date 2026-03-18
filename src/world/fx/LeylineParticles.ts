// LeylineParticles.ts
// Cyan particle flow along active leyline corridors.
// Attach to a scene after leyline corridors are known.

export interface LeylineCorridorSpline {
  points: Array<{ x: number; y: number }>;
}

export class LeylineParticles {
  private emitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.ensureParticleDotTexture(scene);
  }

  /** Ensure the shared 4×4 particle dot texture exists in the cache. */
  static ensureParticleDotTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists('particle_dot')) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('particle_dot', 4, 4);
    g.destroy();
  }

  private ensureParticleDotTexture(scene: Phaser.Scene): void {
    LeylineParticles.ensureParticleDotTexture(scene);
  }

  /** Create a flowing particle emitter along a corridor spline. */
  addCorridor(spline: LeylineCorridorSpline): void {
    const points = spline.points;
    if (points.length < 2) return;

    const emitter = this.scene.add.particles(points[0].x, points[0].y, 'particle_dot', {
      tint: 0x00e5ff,
      blendMode: Phaser.BlendModes.ADD,
      scale: { start: 1.0, end: 0.2 },
      alpha: { start: 0.8, end: 0 },
      speed: { min: 40, max: 80 },
      lifespan: { min: 800, max: 1400 },
      frequency: 33,  // ~30/sec
      quantity: 1,
    });

    // Distribute emission along spline path
    emitter.setPosition(points[0].x, points[0].y);
    // Use emitZone to spread along the corridor (approximated as rect between first/last point)
    const last = points[points.length - 1];
    const mx = (points[0].x + last.x) / 2;
    const my = (points[0].y + last.y) / 2;
    const hw = Math.abs(last.x - points[0].x) / 2 + 8;
    const hh = Math.abs(last.y - points[0].y) / 2 + 8;
    emitter.setPosition(mx, my);
    emitter.setEmitZone({
      type: 'random',
      source: new Phaser.Geom.Rectangle(-hw, -hh, hw * 2, hh * 2),
    });

    this.emitters.push(emitter);
  }

  /** Remove all emitters (e.g. when leyline deactivates). */
  destroyAll(): void {
    for (const e of this.emitters) {
      e.destroy();
    }
    this.emitters = [];
  }
}
