# Particle Systems

Implementation details for all Phaser particle effects.

---

## Particle Texture

All particle systems share a single tiny sprite: a 4×4 white square.

Create it programmatically (no Blender needed):
```typescript
// In GameScene.preload() or a shared preloader:
const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
particleGraphics.fillStyle(0xffffff, 1);
particleGraphics.fillRect(0, 0, 4, 4);
particleGraphics.generateTexture('particle_dot', 4, 4);
particleGraphics.destroy();
```

Then tint each emitter to the desired color at creation time.

---

## LeylineParticles

Flowing energy dots along leyline corridors.

```typescript
// src/world/fx/LeylineParticles.ts
import Phaser from 'phaser';

export class LeylineParticles {
  private emitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

  constructor(
    private scene: Phaser.Scene,
    private corridorPoints: { x: number; y: number }[]
  ) {}

  create(): void {
    const particles = this.scene.add.particles(0, 0, 'particle_dot', {
      tint: 0x00e5ff,         // cyan
      alpha: { start: 0.7, end: 0 },
      scale: { start: 1.2, end: 0.3 },
      speed: 80,
      lifespan: 1500,
      frequency: 33,           // ~30 per second
      blendMode: 'ADD',        // additive blending for glow effect
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Line(
          this.corridorPoints[0].x, this.corridorPoints[0].y,
          this.corridorPoints[this.corridorPoints.length - 1].x,
          this.corridorPoints[this.corridorPoints.length - 1].y
        ),
        quantity: 1
      },
      angle: {
        // Angle particles along corridor direction
        min: this.getCorridorAngle() - 10,
        max: this.getCorridorAngle() + 10
      }
    });
  }

  private getCorridorAngle(): number {
    const start = this.corridorPoints[0];
    const end = this.corridorPoints[this.corridorPoints.length - 1];
    return Phaser.Math.RadToDeg(Math.atan2(end.y - start.y, end.x - start.x));
  }

  destroy(): void {
    this.emitters.forEach(e => e.destroy());
  }
}
```

---

## RiftAmbientFX

Magenta wisps orbiting a rift center.

```typescript
// src/world/fx/RiftAmbientFX.ts
export class RiftAmbientFX {
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    private scene: Phaser.Scene,
    private center: { x: number; y: number },
    private radius: number = 60
  ) {}

  create(): void {
    this.emitter = this.scene.add.particles(
      this.center.x, this.center.y, 'particle_dot', {
        tint: 0xff2d78,         // magenta
        alpha: { start: 0.8, end: 0 },
        scale: { start: 1.5, end: 0.2 },
        lifespan: 2000,
        frequency: 100,
        blendMode: 'ADD',
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Circle(0, 0, this.radius)
        },
        speedX: { min: -20, max: 20 },
        speedY: { min: -60, max: -20 },  // drift upward
      }
    );
  }

  setInstabilityLevel(level: number): void {
    // 0-100 instability → scale particle density and radius
    const density = 100 + level * 3;
    this.emitter.setFrequency(1000 / density);
  }

  destroy(): void {
    this.emitter?.destroy();
  }
}
```

---

## CombatImpactFX

Short burst on hit events.

```typescript
// src/world/fx/CombatImpactFX.ts
export class CombatImpactFX {
  constructor(private scene: Phaser.Scene) {}

  burst(x: number, y: number, type: 'player_hit' | 'enemy_hit'): void {
    const color = type === 'enemy_hit' ? 0xffaa00 : 0xff2d78;

    this.scene.add.particles(x, y, 'particle_dot', {
      tint: color,
      alpha: { start: 1, end: 0 },
      scale: { start: 2, end: 0 },
      speed: { min: 80, max: 150 },
      angle: { min: 0, max: 360 },
      lifespan: 350,
      quantity: 10,
      blendMode: 'ADD',
      emitting: false,
    }).explode(10, x, y);

    // White core flash
    this.scene.add.particles(x, y, 'particle_dot', {
      tint: 0xffffff,
      alpha: { start: 1, end: 0 },
      scale: { start: 3, end: 0 },
      speed: 20,
      lifespan: 150,
      quantity: 4,
      blendMode: 'ADD',
    }).explode(4, x, y);
  }
}
```

---

## SpeedTrailFX

Afterimage trail for high-speed movement.

```typescript
// src/world/fx/SpeedTrailFX.ts
export class SpeedTrailFX {
  private trailPositions: { x: number; y: number; frame: number }[] = [];
  private trailSprites: Phaser.GameObjects.Image[] = [];
  private frameCount = 0;
  private readonly TRAIL_LENGTH = 5;
  private readonly CAPTURE_INTERVAL = 3; // every 3 frames

  constructor(
    private scene: Phaser.Scene,
    private atlasKey: string = 'jane'
  ) {
    // Pre-create ghost sprites
    for (let i = 0; i < this.TRAIL_LENGTH; i++) {
      const ghost = scene.add.image(0, 0, atlasKey)
        .setAlpha(0)
        .setTint(0x00e5ff);
      this.trailSprites.push(ghost);
    }
  }

  update(janeSprite: Phaser.GameObjects.Sprite, active: boolean): void {
    if (!active) {
      this.trailSprites.forEach(s => s.setAlpha(0));
      return;
    }

    this.frameCount++;
    if (this.frameCount % this.CAPTURE_INTERVAL === 0) {
      this.trailPositions.unshift({ x: janeSprite.x, y: janeSprite.y, frame: 0 });
      if (this.trailPositions.length > this.TRAIL_LENGTH) {
        this.trailPositions.pop();
      }
    }

    this.trailSprites.forEach((sprite, i) => {
      const pos = this.trailPositions[i];
      if (pos) {
        sprite.setPosition(pos.x, pos.y);
        sprite.setFrame(janeSprite.frame.name);
        sprite.setAlpha((this.TRAIL_LENGTH - i) / this.TRAIL_LENGTH * 0.35);
        sprite.setFlipX(janeSprite.flipX);
      } else {
        sprite.setAlpha(0);
      }
    });
  }
}
```

---

## Performance Budget

| Effect | Max particles | Notes |
|--------|--------------|-------|
| Leyline corridors (2 active) | 120 | 60 per corridor |
| Rift ambient | 40 | 20 per rift |
| Combat impacts | 30 | Burst, short lifespan |
| Hologram scanlines | 0 | Not particles — tileSprite overlay |
| Speed trail | 0 | Not particles — ghost sprites |
| **Total** | **190** | Well under 500 budget |

At 190 max particles with additive blending and 4×4 textures,
GPU impact is negligible at 60fps.
