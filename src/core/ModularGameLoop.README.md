# ModularGameLoop System

This module implements the modular, event-driven core game loop for ProtoFusionGirl.

## Purpose
- Enable registration and prioritized updating of modular systems (player, tilemap, enemy, UI, mission, etc.)
- Support extensibility, testability, and mod/plugin integration

## Main API
- `registerSystem(system: GameLoopSystem)`: Register a new system with id, priority, and update method
- `update(dt: number)`: Update all registered systems in priority order

## Integration Points
- Instantiated and used in `GameScene.ts`
- Systems registered: player, tilemap, enemy, UI, mission (see artifact: modular_game_loop_registered_systems_2025-06-08.artifact)

## Artifact Reference
- See `artifacts/modular_game_loop_2025-06-05.artifact` for design
- See `artifacts/modular_game_loop_registered_systems_2025-06-08.artifact` for current system registry

---
