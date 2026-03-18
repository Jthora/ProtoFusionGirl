# System: Instability Events

> Ley line rifts, ion storms, and global disturbances as emergent gameplay drivers.

## Full Vision

Ley line instability is the primary world-event engine. Instability generates content — encounters, crises, opportunities — from the world's internal state without scripted triggers.

### Instability Pipeline

```
World state changes → Stability values update → Threshold crossed → Event generated → Consequences propagate
```

### Event Types

| Event | Trigger | Effect | Duration |
|-------|---------|--------|----------|
| **Ley Line Surge** | Stability drops below 70 | Visual effects, minor hazards on edge | 1-3 minutes |
| **Ley Line Disruption** | Stability drops below 40 | Combat spawns on edge, traversal hazardous | 3-5 minutes |
| **Ion Storm** | Random (astrology-influenced) + low stability | Area-wide electronics disruption, plasma atmosphere, aggravated enemies | 5-10 minutes |
| **Rift Formed** | Stability drops below 10 | Dimensional rift opens at node, enemies pour through, node becomes crisis zone | Until resolved |
| **Robot Distress** | Damaged PsiSys detected | Rescue mission available at location | Until resolved or robot destroyed |

### Stability Factors

What decreases stability:
- Time passing (slow natural decay)
- Nearby rift proximity
- Enemy faction activity in area
- Player neglect (leaving unstable areas unattended)
- Cosmic cycle (astrology engine modifiers)

What increases stability:
- ASI stabilization actions (UL symbols, rift sealing)
- PsiSys robot presence at node
- Completed missions in area
- Ley line maintenance (repair actions)

### Propagation

Instability at one node affects neighbors:
- Rift at Node A → stability at adjacent nodes drops by 10-20%
- Surge on Edge 1 → increased chance of surge on connected edges
- Successfully sealing a rift → stability boost to adjacent nodes
- Cascade failure possible: neglected instability spreads across the network

### State Transitions

```
Stable (100-70) → Surge (70-40) → Disruption (40-10) → Rift (below 10)
```

Each transition emits events via EventBus (`LEYLINE_INSTABILITY`, `LEYLINE_SURGE`, `LEYLINE_DISRUPTION`, `RIFT_FORMED`). Systems subscribe and respond.

## Existing Code

- Instability Event API fully defined: `docs/game-design/world/ley-lines/instability-api.md`
- `LeyLineInstabilityEvent` interface with types, severity, triggers
- EventBus integration contract documented
- Integration points: CosmicEnvSimulation, WorldStateManager, MultiverseEventEngine, LeyLineSystem, UIManager, MissionSystem

## Prototype Slice

### P2: Basic Stability
- Each node and edge has a stability value (start at 80-90)
- Stability decays slowly over game-time
- At threshold 40: surge effect (visual shimmer, warning notification)

### P3: Events
- At threshold 10: rift event (enemies spawn at node, combat required)
- Robot distress events when stability drops near robot outpost
- Stability recovery on successful mission completion

### P4: Propagation
- Adjacent node stability affected by rifts
- Cascade mechanics
- Ion storm events (area-wide)
