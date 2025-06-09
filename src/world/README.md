# World Domain

This folder contains the world system for ProtoFusionGirl, following the domain-driven, event-oriented, and data-driven architecture.

## Purpose
- Manage world state, zones, ley lines, and related events
- Drive world changes and interactions based on player and system actions

## Main Modules
- `WorldEngine.ts`: Loads zones from data, delegates all ley line management to `LeyLineManager`, and routes ley line events through `LeyLineEvents` for unified, event-driven handling
- `LeyLineManager.ts`: Handles all ley line queries, updates, procedural generation, and pathfinding
- `LeyLineEvents.ts`: Publishes and subscribes to ley line-related world/narrative events

## Integration Points
- Loads zones from `data/zones.json` using loader utilities
- Loads ley lines from `data/leyLines.json` via `LeyLineManager`
- Emits and listens for events via the unified `EventBus` and `LeyLineEvents`

## Example Usage
```ts
import { WorldEngine } from './WorldEngine';
import { EventBus } from '../core/EventBus';
const world = new WorldEngine(new EventBus());
console.log(world.zones); // Data-driven zones
console.log(world.leyLineManager.getLeyLines()); // Unified ley line management
```

## Event Contracts
- Emits: `WORLD_LOADED`, `LEYLINE_STATUS_CHANGED`, etc. (all routed through the unified event bus)
- Listens: (future) world-related triggers and actions

---
