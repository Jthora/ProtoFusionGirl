# Existing Code Inventory

> Current state of all source code mapped to prototype systems.

## System Status Legend

- **Functional** — Works, tested, reliable
- **Partial** — Has logic but incomplete, needs extension
- **Scaffold** — Empty or near-empty, structure only
- **Best Code** — Cleanest, most complete subsystem

---

## Core Infrastructure

| File | Lines | Status | Prototype Role |
|------|-------|--------|---------------|
| src/core/EventBus.ts | ~56 | Functional | Foundation for all inter-system communication |
| src/core/EventTypes.ts | ~350+ | Functional | 100+ typed events — extend for new systems |
| src/core/ModularGameLoop.ts | ~100+ | Functional | Priority-based system registration |
| src/core/Jane.ts | ~200+ | Functional | Character stats, skills, cosmetics |
| src/core/PlayerManager.ts | ~100+ | Partial | Jane/ASI duality manager |

## Scenes

| File | Lines | Status | Prototype Role |
|------|-------|--------|---------------|
| src/scenes/GameScene.ts | ~747 | Functional | Main gameplay (P0 refactored) |
| src/scenes/SpeederController.ts | ~245 | Functional | MagnetoSpeeder management |
| src/scenes/TerrainSceneSetup.ts | ~195 | Functional | Terrain initialization |
| src/scenes/ASISceneIntegration.ts | ~400 | Functional | ASI UI, guidance, threats |
| src/scenes/LeyLineSceneIntegration.ts | ~300 | Functional | Ley line visualization |
| src/scenes/StartScene.ts | ~50+ | Functional | Title/start screen |
| src/scenes/PauseMenuScene.ts | ~50+ | Functional | Pause menu |

## AI (P1-P5 Critical)

| File | Lines | Status | Prototype Role |
|------|-------|--------|---------------|
| src/ai/JaneAI.ts | ~8 | **Scaffold** | **P1 priority** — behavior tree, autonomy |
| src/ai/CompanionAI.ts | ~6 | **Scaffold** | P3 — robot companion behavior |

## Universal Language

| File | Lines | Status | Prototype Role |
|------|-------|--------|---------------|
| src/ul/ulEngine.ts | ~250+ | Partial | Encoding/decoding works; resource loading stubbed |
| src/ul/types/ | ~1000+ | Functional | Schemas, grammar, canonical types |
| src/ul/ulEventBus.ts | ~50+ | Functional | UL-specific events |
| src/ul/validation/ | ~100+ | Functional | Symbol validation rules |

## ASI Control

| File | Lines | Status | Prototype Role |
|------|-------|--------|---------------|
| src/asiControl/types/ | ~200+ | Functional | JaneState, ThreatInfo, GuidanceSuggestion types |
| src/asiControl/systems/ThreatDetector.ts | ~200+ | Partial | Threat classification — needs integration |
| src/asiControl/systems/TrustManager.ts | ~150+ | Partial | Trust adjustment — needs feedback loop |
| src/asiControl/systems/GuidanceEngine.ts | ~200+ | Partial | Suggestion pipeline — needs UI commands |

## Navigation (Best Code)

| File | Lines | Status | Prototype Role |
|------|-------|--------|---------------|
| src/navigation/NavigationManager.ts | ~200+ | **Best Code** | Central speed/movement coordinator |
| src/navigation/SpeedCategories.ts | ~150+ | **Best Code** | 5 tiers: Walk→Run→Sonic→Hyper→Warp |
| src/navigation/SpeedControlSystem.ts | ~100+ | **Best Code** | Tier transitions with Mach calculations |
| src/navigation/SpeedControlUI.ts | ~80+ | Partial | HUD speed display |

## World Systems

| File | Lines | Status | Prototype Role |
|------|-------|--------|---------------|
| src/world/leyline/LeyLineManager.ts | ~300+ | Functional | Network, pathfinding, stability |
| src/world/WorldEngine.ts | ~150+ | Functional | World state management |
| src/world/WorldStateManager.ts | ~100+ | Functional | Persistent state |
| src/world/missions/MissionSystem.ts | ~300+ | Partial | 15 outcome types, handlers empty |
| src/world/tilemap/TilemapManager.ts | ~200+ | Functional | Infinite map chunks |
| src/world/tilemap/ChunkLoader.ts | ~150+ | Functional | Chunk streaming |
| src/world/PlayerController.ts | ~100+ | Functional | Player movement |

## Combat

| File | Lines | Status | Prototype Role |
|------|-------|--------|---------------|
| src/combat/CombatSystem.ts | ~200+ | Partial | Speeder attacks, damage pipeline |
| src/combat/EnemyTypes.ts | ~100+ | Partial | Enemy definitions — extend for 2 factions |
| src/combat/PsiAbilities.ts | ~80+ | Partial | Psi synergy combat |

## UI

| File | Lines | Status | Prototype Role |
|------|-------|--------|---------------|
| src/ui/UILayoutManager.ts | ~150+ | Functional | Central layout coordinator |
| src/ui/UIBarSystem.ts | ~200+ | Functional | Health/PSI/Status/Speed bars |
| src/ui/components/ | ~500+ | Functional | HealthBar, TouchControls, DialogueModal |
| src/ui/AgentOptimizedUI.ts | ~100+ | Partial | Modular overlay system |

## MagnetoSpeeder

| File | Lines | Status | Prototype Role |
|------|-------|--------|---------------|
| src/magneto/MagnetoSpeeder.ts | ~200+ | Functional | Energy, upgrades, ley line interaction |

## Data (JSON)

| Directory | Status | Content |
|-----------|--------|---------|
| src/data/ | Functional | Character definitions, items, skills, ley lines, factions, zones |
| data/ | Functional | Additional game data files |

## Utilities

| File | Lines | Status | Notes |
|------|-------|--------|-------|
| src/PlaceholderAssets.ts | ~150+ | Functional | Runtime sprite generation |
| src/core/diagnostics/ | ~200+ | Functional | Error logging, startup validation |

---

## Priority Build Map

Where new code goes, mapped to existing:

| Prototype System | Build On | Create New |
|-----------------|----------|-----------|
| Jane autonomy (P1) | Jane.ts, EventBus | **JaneAI.ts** (full rewrite) |
| ASI waypoints (P1) | ASISceneIntegration | Input handler in GameScene |
| Trust feedback (P2) | TrustManager.ts | Trust UI component |
| Combat AI (P2) | CombatSystem.ts, EnemyTypes.ts | Jane combat state, enemy behaviors |
| Throttle (P2) | NavigationManager (wrap) | ThrottleController.ts |
| Stability system (P2) | LeyLineManager.ts | Stability pipeline events |
| UL puzzles (P3) | ulEngine.ts, types/ | PuzzleInterface.ts, PuzzleScene |
| Robot companions (P3) | CompanionAI.ts | **CompanionAI.ts** (full rewrite), Terra.ts |
| Instability events (P3) | WorldEngine, EventBus | InstabilityManager.ts |
| Time rewind (P4) | EventTypes | TimelineManager.ts, RewindUI |
| Astrology (P4) | WorldEngine | AstrologyEngine.ts |
