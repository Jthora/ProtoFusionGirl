# Core Folder

This folder contains the foundational, reusable, and non-feature-specific logic for ProtoFusionGirl. Only the most essential systems, base classes, and utilities that are used across the entire project should live here.

## What belongs in `src/core/`
- Input and controls (already present)
- Event bus or event system
- Game state manager
- Config/environment manager
- Base entity/system/service classes or interfaces
- Utility modules (math, random, type guards, etc.)
- Dependency injection, logging, or error handling

## What does NOT belong here
- Feature-specific logic (tilemap, combat, inventory, modding, UI, etc.)
- Scene-specific code
- Content/data (items, enemies, quests, etc.)

## Best Practices
- Keep this folder minimal and stable.
- Add comments referencing architectural decisions when moving files here.
- Update this README if the structure or philosophy changes.
