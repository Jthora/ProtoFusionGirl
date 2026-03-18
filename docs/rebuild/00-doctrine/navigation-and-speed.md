# Doctrine: Navigation and Speed

> Non-negotiable design law. The speed system is a cockpit, not a slider.

## The Law

**The Magneto Speeder is a psionic exocraft robot — a living machine with gears, throttles, boosters, and a soul.** Navigation operates at two scales: the ley line network map (strategic) and ground-level terrain traversal (experiential). Both must exist. Both must feel good.

## The Speed Rethink

The current 5-tier speed system (walk → jog → run → sprint → hypersonic) is excellent code. It is NOT being replaced. It is being **promoted** from being the whole system to being one component of a larger cockpit.

### New Architecture: Cockpit Model

| Component | What It Is | Implementation |
|-----------|-----------|----------------|
| **Gear Shifter** | The current 5-tier system | EXISTING: Each gear has acceleration curves, camera zoom, collision methods |
| **Throttle** | Continuous speed input within current gear | NEW: Analog input (0-100%) controls speed within the gear's range |
| **Boosters** | Temporary speed burst beyond gear max | NEW: Burns psionic energy, multiplier with cooldown |
| **Fast Travel** | Map-mode, exits ground scene entirely | NEW: Switches to ley line network view, select destination |

### Gear System (Existing — Wrapped)

The 5 tiers remain as gear presets:

| Gear | Speed Class | Camera | Physics |
|------|-----------|--------|---------|
| 1 | Walk/Jog | Close | Standard arcade |
| 2 | Run | Medium | Standard arcade |
| 3 | Sprint | Pulled back | Momentum-based |
| 4 | Hypersonic | Very far | Rail/stream |
| 5 | Ultra | Extreme zoom-out | LOD streaming |

Each gear defines: min speed, max speed, acceleration curve, camera zoom level, collision mode, terrain interaction.

### Throttle (New)

- Continuous input: 0% = gear minimum, 100% = gear maximum
- Analog stick or keyboard hold (with ramp-up)
- Smooth speed changes within a gear — no jarring transitions
- Releasing throttle decelerates to gear minimum, not zero (speeder stays in gear)

### Boosters (New)

- Temporary override: multiplies current speed by boost factor
- Costs psionic energy (regenerates over time or at ley line nodes)
- Duration: short burst (2-4 seconds)
- Cooldown: prevents continuous boosting
- Visual: energy flare effect on speeder, screen effects
- Can push speed into the next gear's range temporarily

### Fast Travel (New)

- Activated from any ley line position
- Transitions to **ley line network map** (2D tactical display of planet's ley network)
- Player selects destination node
- Transition animation: zoom out → map view → select → zoom in to destination
- Skips terrain traversal — strategic movement
- Cannot fast travel during combat or ley line instability events

## Two-Scale Navigation

### Scale 1: Network Map (Strategic)

- Stylized 2D display showing ley line connections as a network graph
- Nodes = locations (launch bases, cities, significant sites, mission zones)
- Lines = ley line connections (color-coded by stability)
- **NOT a 3D globe** in prototype — presented as a Holo Deck tactical display
- In-universe: this is PsiNet visualization, not photographic rendering
- Full 3D globe rendering = Phase 3 (Godot) when Holo Deck fidelity increases

### Scale 2: Ground Level (Experiential)

- 2D side-scrolling terrain along the ley line
- Magneto Speeder flies/rides through terrain
- Terrain generated per ley line segment (biome-based)
- Encounters, anomalies, combat, resources appear along the path
- Stop at nodes to enter local zones (dismount, explore, interact)

### Transition

The zoom between scales should feel seamless:
```
Network Map (full planet) → zoom → ley line segment → zoom → ground level
```
One gesture or keypress transitions between views. The same data at different resolutions.

## Terrain Interaction

At ground level, the speeder interacts with terrain:
- Magnetically locks to ley line paths (default — smooth, fast)
- Can deviate from ley line into open terrain (slower, drains MHD Core)
- Biome effects: volcanic zones heat speeder systems, polar zones slow energy regen, forest zones block sightlines
- Terrain instability affects navigation: cracked paths, energy surges, blocked passages

## Prototype Slice

- **1 ley line segment** with terrain between Node 1 and Node 3
- **Network map**: 3 nodes connected by 2 ley line paths (linear for prototype)
- **Gear system**: Use existing 5-tier system as-is
- **Throttle**: Simple keyboard ramp within current gear (hold = accelerate, release = decelerate within gear)
- **Boosters**: Single boost button with cooldown timer
- **Fast travel**: Map overlay showing the 3 nodes, click to transition
- **Defer**: Ultra gear, ley line deviation, biome effects beyond visual

## References
- [src/navigation/](../../../src/navigation/) — Current 5-tier speed system
- [src/scenes/modules/SpeederController.ts](../../../src/scenes/modules/SpeederController.ts) — Speeder module
- [docs/proto-scope/04-architectural-roadmap.md](../../proto-scope/04-architectural-roadmap.md) — Architecture constraints
