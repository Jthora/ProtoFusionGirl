# Missions Domain

This folder contains the mission and quest management systems for ProtoFusionGirl.

## Purpose
- Manage mission state, progression, and triggers
- Integrate with world, UI, and event systems
- Support branching, prerequisites, and modding hooks

## Main Modules
- `MissionManager.ts`: Core mission state and progression logic

## Integration Points
- Used by `GameScene` and UI for mission tracking
- Emits and listens for mission-related events via the unified event bus

## Artifact Reference
- See `artifacts/mission_system_design.artifact` for design and open questions

---
