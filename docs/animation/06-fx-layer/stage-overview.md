# Stage 6 — FX Layer

> **Goal**: Add runtime particle effects and glyph animations that make the
> game world feel alive. All FX are pure Phaser — no additional Blender renders.
> The two-layer system: pre-rendered silhouette sprites + runtime cyan/amber/magenta FX.

---

## Prerequisites

- Stage 4 complete: all characters animated
- Stage 5 complete: world art in place
- Phaser particle system available (Phaser 3.6+ built-in particles)

---

## Acceptance Criteria

This stage is complete when:

- [ ] Leyline energy corridors have flowing particle effects
- [ ] UL glyph puzzle interactions have glyph reveal animations
- [ ] Combat hits have impact particle bursts
- [ ] Rift zones have ambient particle fields
- [ ] Jono Hologram has scanline/glitch particle overlay
- [ ] All particle effects stay within the 3-color palette (cyan/amber/magenta)
- [ ] FX do not tank frame rate below 60fps (budget: 500 active particles max)

---

## Color Palette

All runtime FX use exactly these three colors:

| Effect type | Color | Hex | Use |
|-------------|-------|-----|-----|
| Energy / leylines / UL | Cyan | `#00e5ff` | Friendly energy, player actions |
| Alert / warning / heat | Amber | `#ffaa00` | Danger warnings, enemy presence |
| Rift / corruption | Magenta | `#ff2d78` | Rift instability, negative events |

White (`#ffffff`) is used sparingly as a burst/flash core.

---

## Tasks

### Task 6.1 — Leyline Particle System

Flowing energy effect along leyline corridors.

See [particle-systems.md](particle-systems.md) for implementation.

```typescript
// LeylineParticles: cyan dots flowing along leyline path
// Emitter: continuous, 30 particles/sec along leyline spline
// Particle: 4×4 px white square tinted cyan, alpha 0.6
// Lifespan: 1500ms
// Speed: along leyline direction, 80 px/s
```

---

### Task 6.2 — UL Glyph Animation

When a UL puzzle target is revealed or solved, animate the glyph.

See [ul-glyph-fx.md](ul-glyph-fx.md) for the complete glyph system.

States:
1. **Hidden**: no glyph visible
2. **Revealed**: glyph fades in with a cyan particle burst
3. **Solving**: glyph pulses amber while player interacts
4. **Solved**: glyph locks cyan, sparkle burst, then steady

---

### Task 6.3 — Combat Impact FX

Hit effects that communicate damage without requiring additional sprites.

```typescript
// On COMBAT_HIT event:
// Amber burst: 8 particles, 60px radius, lifespan 300ms
// Screen shake: amplitude 4px, duration 200ms
// Hit flash: target sprite flashes white for 2 frames
```

---

### Task 6.4 — Rift Zone Ambient FX

Rift zones emanate a magenta particle field that communicates threat.

```typescript
// RiftParticles: magenta wisps orbiting rift center
// Count: 20 particles ambient
// Orbit radius: 60px
// Lifespan: 2000ms
// On rift instability increase: radius grows, count increases
```

---

### Task 6.5 — Jono Hologram Scanlines

The hologram appearance effect for Jono NPC.

```typescript
// When jono_atlas sprite is active:
// Overlay a scanline texture (1×4 px: black/transparent/black/transparent tile)
// Apply as tileSprite over Jono's sprite bounds
// Set alpha: 0.3 (subtle scanline)
// Add slow flicker: alpha tween 0.3 → 0.5 → 0.3 over 2s, repeat
```

---

### Task 6.6 — Speed FX (High Speed Trails)

When Jane reaches Supersonic speed tier, add a speed trail effect.

```typescript
// SpeedTrail: cyan afterimage of Jane's previous positions
// Ring: capture Jane's sprite position every 3 frames
// Render 5 ghost positions, each 20% less alpha
// Tint: cyan (#00e5ff)
// This makes speed feel fast without new animations
```

---

## Outputs of Stage 6

All FX are TypeScript files, no new assets:

```
src/world/fx/
  LeylineParticles.ts
  ULGlyphFX.ts
  CombatImpactFX.ts
  RiftAmbientFX.ts
  HologramFX.ts
  SpeedTrailFX.ts
```

---

## Time Estimate

| Task | Time |
|------|------|
| 6.1 Leyline particles | 1-2 hours |
| 6.2 UL glyph animation | 2-3 hours |
| 6.3 Combat impact FX | 1 hour |
| 6.4 Rift zone ambient | 1 hour |
| 6.5 Jono hologram | 1 hour |
| 6.6 Speed trail | 1 hour |
| **Total** | **7-10 hours** |

---

## Next Stage

With character sprites, world art, and FX in place, proceed to
[Stage 7: Integration](../07-integration/stage-overview.md) to wire
the full animation system to the game state machine and validate
the complete visual experience end-to-end.
