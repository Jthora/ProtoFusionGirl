# Design: Simulation Fidelity Model

> The performance-reactive quality system. Ensures the game never freezes.
> Lore frame: the Holo Deck adjusts simulation resolution based on available
> PsiNet bandwidth.

---

## The Problem

The previous system had one performance mode: full. When it could not sustain
that mode, it froze. There was no graceful degradation.

The new architecture must have a hard guarantee: **the game never drops below
a rendering heartbeat.** The player always sees something. Jane always moves.
The world always ticks.

This is not just an engineering constraint. It is a lore feature. The Holo Deck
is a simulation. Simulations have resource budgets. When PsiNet bandwidth is
constrained (by Ion Storms, Nefarium activity, or the simulation's own complexity),
the Holo Deck reduces fidelity. The player-ASI observes this as visual degradation —
which is itself a gameplay signal.

---

## Fidelity Levels

Four levels, each a complete rendering configuration:

### FIDELITY_CRITICAL
**Trigger:** Measured FPS < 10 for 2 consecutive seconds
**Lore:** "PsiSys: simulation bandwidth critically low — degraded projection active"

| System | Config |
|--------|--------|
| Terrain harmonics | H1 only |
| Physics body | Static floor line (no polygon tracing) |
| Entities rendered | Jane sprite only |
| Background layers | None (solid color) |
| Audio | Silence except critical alerts |
| Particle systems | Disabled |
| DOM overlays | All hidden except FPS counter |
| UL puzzles | Suspended |

**Goal:** Sustain 15+ FPS on any hardware. The game is ugly but functional.

---

### FIDELITY_LOW
**Trigger:** FPS < 30 for 3 consecutive seconds
**Lore:** "PsiSys: simulation fidelity reduced — resource constraints detected"

| System | Config |
|--------|--------|
| Terrain harmonics | H1+H2 |
| Physics body | Polygon from H1+H2 only |
| Entities rendered | Jane + up to 3 enemies |
| Background layers | 1 layer (far only) |
| Audio | Ambient loop only |
| Particle systems | Disabled |
| DOM overlays | FPS + UIBarSystem only |
| UL puzzles | Active (simple display) |

---

### FIDELITY_STANDARD
**Trigger:** Default (FPS 30–55 sustained)
**Lore:** Normal simulation operation.

| System | Config |
|--------|--------|
| Terrain harmonics | H1+H2+H3 |
| Physics body | Full polygon from H1+H2+H3 |
| Entities rendered | All entities within camera |
| Background layers | 2 layers |
| Audio | Full ambient + SFX |
| Particle systems | Reduced (50% particle count) |
| DOM overlays | All active |
| UL puzzles | Active (full) |

---

### FIDELITY_HIGH
**Trigger:** FPS > 58 sustained for 5 seconds
**Lore:** Optimal simulation conditions.

| System | Config |
|--------|--------|
| Terrain harmonics | H1+H2+H3+H4 |
| Physics body | Full polygon including H4 displacement |
| Entities rendered | All + distant LOD sprites |
| Background layers | 3 layers + subtle parallax VFX |
| Audio | Full spatial + HarmonicEngine |
| Particle systems | Full |
| DOM overlays | All + optional debug overlays |
| UL puzzles | Full + animation |

---

## FPS Measurement

The FPS counter (already implemented via `game.loop.actualFps`) feeds a rolling
average sampler:

```typescript
class FidelityController {
  private recentFps: number[] = [];
  private readonly SAMPLE_WINDOW = 120; // frames (~2 seconds at 60fps)
  private readonly UPGRADE_THRESHOLD = 58;
  private readonly DOWNGRADE_THRESHOLDS = [30, 10]; // LOW, CRITICAL

  update(actualFps: number): SimulationFidelity {
    this.recentFps.push(actualFps);
    if (this.recentFps.length > this.SAMPLE_WINDOW) this.recentFps.shift();
    const avg = average(this.recentFps);
    return this.selectFidelity(avg);
  }
}
```

**Hysteresis:** Fidelity only upgrades after sustained high performance. It
downgrades immediately on poor performance. This prevents thrashing.

---

## Fidelity as Gameplay Signal

This is where the lore integration gets interesting.

### Nefarium Interference
When the Nefarium is active near the player's ley line, the game can **artificially
lower fidelity** regardless of hardware performance. The simulation is being
jammed. The player sees visual degradation. This is a threat indicator, not a
bug.

```typescript
// In LeyLineManager, when Nefarium activity is detected:
eventBus.emit({ type: 'SIMULATION_INTERFERENCE', data: { intensity: 0.7 } });
// FidelityController applies artificial fidelity cap:
// effectiveFidelity = min(hardwareFidelity, interferenceMaxFidelity)
```

### Ion Storm
Ion Storms (canonical game event) corrupt PsiNet bandwidth. During an Ion Storm,
simulation fidelity is reduced by one level and the reduction is visible to the
player. It's not a technical failure — it's a story beat.

### PsiNet Downtime Scenario
The design documents include a "PsiNet Down Time Scenario" (docs/game-design/).
Under extreme conditions, the simulation itself could shut down. The fidelity
model supports this: CRITICAL → simulation suspension → black screen with
terminal message → Holo Deck reboot sequence.

---

## Manual Override

For debugging and development:

```
URL parameter: ?fidelity=high|standard|low|critical
Console: game.fidelityController.setManualOverride('high')
Dev tools menu: SimFidelity submenu
```

---

## Per-System Fidelity Interface

Every system that has fidelity-sensitive behavior implements:

```typescript
interface FidelityAware {
  onFidelityChange(level: SimulationFidelity): void;
}
```

Systems that implement this:
- `TerrainRenderer` — harmonic count
- `TerrainPhysics` — polygon resolution
- `ParticleManager` — particle budget
- `AudioManager` — audio layer count
- `EntityRenderer` — entity draw distance
- `BackgroundRenderer` — parallax layer count
- `SectorScanRadar` — update frequency
- `HoloDeckGrid` — grid density

---

## Boot Fidelity

On first load, the game starts at FIDELITY_LOW and auto-upgrades as performance
data accumulates. This prevents the cold-start performance spike that caused the
previous system to freeze immediately.

The loading screen text changes to reflect this:
- "PsiSys: calibrating simulation parameters..." (during fidelity auto-detection)
- "PsiSys: optimal resolution confirmed" (when fidelity stabilizes at STANDARD+)
