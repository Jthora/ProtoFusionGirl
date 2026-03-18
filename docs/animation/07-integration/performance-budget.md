# Performance Budget

Defines frame-rate targets, measurement methodology, and optimization strategies
for the full animation system.

---

## Target

**60fps** on:
- Mac: M1/M2 or equivalent (2020+)
- Windows: mid-range GPU (GTX 1060 equivalent)
- Low-end target: 30fps on Intel Iris integrated graphics

---

## Budget Breakdown

| System | Budget (ms/frame at 60fps) | Notes |
|--------|---------------------------|-------|
| Total frame | 16.67ms | Hard limit |
| Physics update | 2ms | Phaser arcade physics |
| AI / game logic | 2ms | JaneAI, enemy AI |
| Sprite rendering | 4ms | Characters + world tiles |
| Particle rendering | 2ms | FX layer |
| UI rendering | 2ms | HUD, overlays |
| Audio | 1ms | |
| **Remaining headroom** | **3.67ms** | Buffer |

---

## Sprite Rendering Cost

At target load (full cast, all FX active):

| Asset | Draw calls | Texture binds | Notes |
|-------|-----------|---------------|-------|
| Jane | 1 | 0 (cached) | Single atlas |
| Terra | 1 | 0 (cached) | Single atlas |
| Aqua | 1 | 0 (cached) | Single atlas |
| Jono | 1 | 0 (cached) | + tint |
| 2× Terminator | 2 | 0 (cached) | |
| 3× Drone | 3 | 0 (cached) | |
| Tiles (visible ~40) | ~5 | 0 (cached) | Batched by Phaser |
| Background (3 layers) | 3 | 3 | Different textures |
| **Total** | **~17** | **3** | Very low |

All character atlases are single textures — Phaser batches sprites sharing
the same texture into one WebGL draw call.

---

## Particle Rendering Cost

| Effect | Active particles | Cost estimate |
|--------|-----------------|---------------|
| Leyline particles | 120 | Low (4×4 px, additive) |
| Rift ambient | 40 | Low |
| Combat burst (peak) | 30 | Very short lifespan |
| **Total** | **190** | ~0.5ms |

---

## Memory Budget

| Asset | Size | Notes |
|-------|------|-------|
| Jane atlas (2048×2048 RGBA) | 16 MB uncompressed | ~4 MB compressed on GPU |
| Terra atlas | ~6 MB | 12 anims |
| Aqua atlas | ~6 MB | 12 anims |
| Terminator atlas | ~4 MB | 8 anims |
| Drone atlas | ~1 MB | 4 anims |
| Jono atlas | ~1 MB | 5 anims |
| Tile atlas (512×512) | 1 MB | |
| Backgrounds (3 × 512×288) | ~2 MB | |
| **Total GPU texture** | **~24 MB** | Within WebGL budget |

Most integrated GPUs have 256MB+ VRAM; 24MB is well within budget.

---

## Profiling Approach

### Chrome DevTools (recommended for Phaser)

```javascript
// Add to GameScene:
if (import.meta.env.DEV) {
  this.events.on('postupdate', () => {
    const fps = this.game.loop.actualFps;
    if (fps < 55) {
      console.warn(`FPS drop: ${fps.toFixed(1)}`);
    }
  });
}
```

### Phaser Debug Display

```typescript
// In game config:
fps: {
  target: 60,
  forceSetTimeOut: false,
},
// Enable in dev:
debug: import.meta.env.DEV,
```

---

## Optimization Strategies

If frame rate drops below 55fps:

### 1. Reduce Particle Density First

Particles are the most variable cost:
```typescript
// Halve particle density at low fps:
if (game.loop.actualFps < 55) {
  leylineEmitter.setFrequency(66);  // 15/sec instead of 30/sec
}
```

### 2. LOD for Off-Screen Characters

Pause animation for characters outside camera bounds:
```typescript
const camera = this.cameras.main;
for (const sprite of allCharacterSprites) {
  const inView = camera.worldView.contains(sprite.x, sprite.y);
  sprite.anims.paused = !inView;
}
```

### 3. Reduce Atlas Sizes

If 2048×2048 is too large for the device (unlikely):
- Drop Jane's lowest-priority animations to a separate atlas
- Load them lazily when needed

### 4. Disable FX on Low-End

Feature flag for particle systems:
```typescript
export const FX_ENABLED = !navigator.hardwareConcurrency ||
                           navigator.hardwareConcurrency >= 4;
```

---

## Baseline Test

Run this test to establish baseline before Stage 7 work:

```typescript
// test/system/Performance.test.ts
// (already exists at test/core/Performance.test.ts — extend it)

it('holds 60fps with full animation load', async () => {
  // Simulate full cast + FX
  // Measure average fps over 5 seconds
  // Assert: average fps > 55, min fps > 45
});
```
