# System: Speed Model (Cockpit Architecture)

> Gear + Throttle + Boosters + Fast Travel — wrapping the existing speed system.

## Full Vision

The Magneto Speeder cockpit has four control layers. The existing 5-tier speed system becomes the gear component. Three new components wrap it.

### Architecture

```
┌──────────────────────────────────────────────────┐
│                 COCKPIT                            │
│                                                    │
│  ┌─────────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  GEAR        │  │ THROTTLE │  │   BOOSTERS   │ │
│  │  (existing)  │  │  (new)   │  │    (new)     │ │
│  │              │  │          │  │              │ │
│  │  5 tiers     │  │ 0-100%   │  │ burst on     │ │
│  │  accel curve │  │ within   │  │ cooldown     │ │
│  │  camera zoom │  │ gear     │  │ psi energy   │ │
│  │  collision   │  │ range    │  │ cost         │ │
│  └─────────────┘  └──────────┘  └──────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │              FAST TRAVEL (mode switch)        │ │
│  │  Exits ground scene → network map overlay     │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### Gear (Existing System — Preserved)

The 5 tiers from `src/navigation/`:

| Gear | Min Speed | Max Speed | Camera Zoom | Collision Mode |
|------|-----------|-----------|-------------|----------------|
| 1 (Walk) | 0 | 100 | 1.0 | Standard |
| 2 (Run) | 80 | 300 | 0.7 | Standard |
| 3 (Sprint) | 250 | 800 | 0.4 | Momentum |
| 4 (Hypersonic) | 700 | 2000 | 0.1 | Rail |
| 5 (Ultra) | 1800 | 5000 | 0.02 | LOD Stream |

*(Values are illustrative — actual values from existing navigation code)*

Gear defines the operating RANGE. Everything else operates within that range.

### Throttle (New — Analog Within Gear)

- Input: keyboard hold (ramp up/down) or analog stick
- Maps to 0-100% of current gear's speed range
- `currentSpeed = gear.minSpeed + (throttle * (gear.maxSpeed - gear.minSpeed))`
- Release throttle → decelerate to gear minimum (not zero)
- Smooth continuous speed control within discrete gear ranges
- Camera zoom interpolates within gear's zoom range based on throttle

### Boosters (New — Temporary Override)

- Activation: single keypress (costs psionic energy)
- Effect: multiply current speed by 1.5-2.0x for 2-4 seconds
- Can exceed current gear's max speed temporarily
- Cooldown: 10-15 seconds
- Visual: energy flare on speeder, screen edge effects
- Audio: burst sound effect
- Cannot boost during cooldown or with insufficient psi energy

### Fast Travel (New — Mode Switch)

See [fast-travel.md](../world/fast-travel.md) for full spec.
- Keypress exits ground scene → network map overlay
- Select destination → travel → arrive at new node
- Not a speed — a completely different interaction mode

### Input Mapping

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Throttle up | Hold W/Up | Right trigger (analog) |
| Throttle down | Hold S/Down | Left trigger |
| Gear up | Shift / E | Right bumper |
| Gear down | Ctrl / Q | Left bumper |
| Boost | Space | A/X button |
| Fast Travel | M (map) | Start/Menu |

## Existing Code to Preserve

- `src/navigation/NavigationManager.ts`: Speed tier management, transitions
- `src/navigation/SpeedTierConfig.ts`: Tier definitions with acceleration curves
- `src/scenes/modules/SpeederController.ts`: Speeder sprite, boarding, movement
- Camera zoom coupling already works per speed tier

## Prototype Slice

### P1: Existing Gear System (No Changes)
- Use current 5-tier speed system exactly as-is
- It already works. Ship it.

### P2: Add Throttle
- Continuous speed input within current gear
- Keyboard: hold to accelerate, release to decelerate within gear range
- Smooth camera zoom interpolation within gear range

### P3: Add Boosters
- Single boost button with cooldown timer
- Psi energy cost (simple energy bar)
- Visual effect on activation

### P4: Add Fast Travel
- Map overlay with 3 nodes, click to travel
- Full cockpit integration
