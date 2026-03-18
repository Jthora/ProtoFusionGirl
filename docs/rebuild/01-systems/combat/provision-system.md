# System: Provision System (Background Tech Tree)

> Autonomous research queue, lab bot R&D, and gear unlocks.

## Full Vision

At Tho'ra Launch Base, lab bots run R&D 24/7. The ASI sets research priorities. Results arrive as gear, upgrades, and capabilities for Jane and the robot army.

### Design Pattern: Fire and Forget

1. ASI selects a research project from available options
2. Project enters the queue
3. Timer runs (lab bots work in background)
4. Completion event emits when timer finishes
5. Jane receives notification: "New tech available"
6. Gear/upgrade becomes available at next loadout

The ASI never sees the lab floor. The simulation is happening — you don't render it.

### Research Tree Structure

```
Tier 0 (Starting): Fusion Cutter Blades, Blast Pistol, Basic Magneto Speeder
    │
Tier 1: Enhanced Blades, Charge Pistol, Speeder Armor
    │
Tier 2: Psi Blades, Plasma Rifle, Speeder Shields
    │
Tier 3: Fusion Wings (limited), Quantum Pistol, Speeder Boosters
    │
Tier 4: Full Fusion Wings, Rift Stabilizer, Speeder MHD Overdrive
```

### Research Project Format

```
{
  id: string,
  name: string,
  tier: number,
  prerequisites: string[],    // IDs of required prior research
  duration: number,            // Milliseconds (game-time)
  cost: ResourceCost,          // Materials gathered from missions
  result: {
    type: 'weapon' | 'armor' | 'speeder' | 'tool' | 'ability',
    unlockId: string,          // What becomes available
    description: string
  }
}
```

### Resource Costs

Research consumes resources gathered from missions:
- **Exo Shards**: From rift encounters and unstable zones
- **Robot Components**: From damaged/salvaged robots
- **Psionic Crystals**: From ley line nodes (charged by stability)
- **Data Fragments**: From robot memories and lore discoveries

### Multiple Queue Slots

- Start: 1 research slot
- Upgradeable: lab expansion research unlocks 2nd, 3rd slot
- Queue management: prioritize what matters most

### Notifications

When research completes:
- EventBus emits `RESEARCH_COMPLETE` with result data
- UI notification appears (non-intrusive)
- Jane acknowledges in dialogue ("Tho'ra Tech came through again!")
- New option available in loadout panel at next base visit

## Prototype Slice

### P2: Minimal Research
- 1 research slot
- 3 projects available:
  1. **Enhanced Blades** (60 seconds, no cost) — +25% melee damage
  2. **Charge Pistol** (90 seconds, no cost) — charged shot ability
  3. **Speeder Armor** (120 seconds, no cost) — +50% speeder health
- No resource costs (prototype simplification)
- Timer starts → completion event → gear available at base

### P4: Costs and Prereqs
- Resource costs added (gathered from missions)
- Prerequisites: Tier 1 required before Tier 2
- 2 research slots available

### P5: Full Tree
- Multiple tiers
- Resource scarcity drives strategic decisions
- Lab expansion research
