# UL Glyph FX

Animation and visual feedback for Universal Language puzzle interactions.

---

## Overview

UL glyphs are rendered as pre-rendered silhouette sprites (Blender) combined
with runtime Phaser effects (tinting, particles, tweens).

The glyph lifecycle:
```
HIDDEN → REVEALED → SOLVING → SOLVED
```

Each transition has a distinct visual FX event.

---

## Glyph States

| State | Visual | FX |
|-------|--------|-----|
| Hidden | No glyph visible | — |
| Revealed | Glyph fades in | Cyan particle burst, alpha 0→1 tween |
| Solving | Glyph pulses | Amber tint, oscillating scale |
| Solved | Glyph locks | Cyan tint, sparkle burst, gentle pulse |
| Failed | Glyph shakes | Magenta flash, shake tween |

---

## Implementation

```typescript
// src/world/fx/ULGlyphFX.ts

export type GlyphState = 'hidden' | 'revealed' | 'solving' | 'solved' | 'failed';

export class ULGlyphFX {
  private sprite!: Phaser.GameObjects.Sprite;
  private state: GlyphState = 'hidden';

  constructor(
    private scene: Phaser.Scene,
    private x: number,
    private y: number,
    private glyphKey: string  // e.g., 'tile_ul_glyph_fire'
  ) {
    this.sprite = scene.add.sprite(x, y, 'tiles', glyphKey);
    this.sprite.setAlpha(0);
  }

  reveal(): void {
    if (this.state !== 'hidden') return;
    this.state = 'revealed';

    // Fade in
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 1,
      duration: 400,
      ease: 'Cubic.Out',
    });

    // Cyan burst particles
    this.scene.add.particles(this.x, this.y, 'particle_dot', {
      tint: 0x00e5ff,
      alpha: { start: 0.9, end: 0 },
      scale: { start: 1.5, end: 0 },
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      lifespan: 600,
      blendMode: 'ADD',
    }).explode(16, this.x, this.y);

    this.sprite.clearTint();
  }

  startSolving(): void {
    if (this.state !== 'revealed') return;
    this.state = 'solving';

    // Amber tint + pulsing scale
    this.sprite.setTint(0xffaa00);
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  solve(): void {
    if (this.state !== 'solving') return;
    this.state = 'solved';

    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1);
    this.sprite.setTint(0x00e5ff);  // Cyan = solved

    // Sparkle burst
    this.scene.add.particles(this.x, this.y, 'particle_dot', {
      tint: 0xffffff,
      alpha: { start: 1, end: 0 },
      scale: { start: 0.8, end: 0 },
      speed: { min: 20, max: 80 },
      angle: { min: 0, max: 360 },
      lifespan: 800,
      blendMode: 'ADD',
    }).explode(20, this.x, this.y);

    // Slow gentle pulse to confirm solved state
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.7,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  fail(): void {
    this.state = 'revealed';  // reset to revealed, not hidden

    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setTint(0xff2d78);  // Magenta = failed
    this.sprite.setScale(1);

    // Shake + flash
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.x + 8,
      duration: 50,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.sprite.setPosition(this.x, this.y);
        this.sprite.clearTint();  // Back to default
      }
    });
  }

  hide(): void {
    this.state = 'hidden';
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setAlpha(0).setTint(0xffffff).setScale(1);
  }
}
```

---

## ULPuzzleOverlay Integration

The existing `ULPuzzleOverlay` (`src/ul/ULPuzzleOverlay.ts`) shows the
glyph input UI. `ULGlyphFX` complements it with world-space 3D-style effects
on the game world tiles/objects (not the UI overlay).

Event flow:
```
ULPuzzleManager.revealTarget(targetId)
  → emits UL_PUZZLE_REVEALED
  → GameScene listener creates ULGlyphFX at target position
  → calls glyphFX.reveal()

ULPuzzleManager.startSolving(targetId)
  → emits UL_PUZZLE_SOLVING
  → GameScene calls glyphFX.startSolving()

EventBus: UL_PUZZLE_SUCCESS
  → GameScene calls glyphFX.solve()

EventBus: UL_PUZZLE_FAILURE
  → GameScene calls glyphFX.fail()
```

---

## Glyph Sprite Assets

The glyph tile sprites (from Stage 5 tileset spec) are used as the
sprite source. The FX layer tints and animates them — no additional
render needed beyond what Stage 5 provides.

Minimum required tiles for UL puzzles:
- `tile_ul_glyph_fire` — Fire element
- `tile_ul_glyph_water` — Water element
- `tile_ul_glyph_earth` — Earth element
- `tile_ul_glyph_air` — Air element
- `tile_ul_node` — Node (general purpose)

One ULGlyphFX instance per active puzzle target in the world.
Destroy and recreate when puzzle targets change.
