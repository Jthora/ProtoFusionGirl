# Tilemap Domain

This folder contains all tilemap and world generation logic for ProtoFusionGirl.

## Purpose
- Manage tilemap data, chunk streaming, and procedural world generation
- Provide APIs for tile editing, world persistence, and modding hooks

## Main Modules
- `TilemapManager.ts`: Central API for tilemap/world operations
- `ChunkManager.ts`: Handles chunk-based streaming and memory management
- `WorldGen.ts`: Procedural world generation logic
- `TileRegistry.ts`: Tile definitions and modding integration

## Integration Points
- Used by `GameScene` and world systems for map logic
- Exposes hooks for mods and procedural content

## Artifact Reference
- See `artifacts/tilemap_system_design.artifact` for design and open questions

---
