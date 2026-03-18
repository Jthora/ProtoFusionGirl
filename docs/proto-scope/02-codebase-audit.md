# 02 — Codebase Audit

> File-by-file audit of every major system in the Proto FusionGirl codebase. Every claim verified by reading actual source code.

---

## Codebase Metrics (Verified)

| Metric | Value | Note |
|--------|-------|------|
| Total .ts files | 507 | Includes tests, stubs, re-exports |
| Total lines | 41,057 | Measured via `find | xargs cat | wc -l` |
| Files ≤ 5 lines | 67 (13%) | Empty stubs, re-exports |
| Files ≤ 20 lines | 214 (42%) | Trivial implementations |
| Files > 100 lines | 102 (20%) | Substantive code |
| Estimated behavioral code | ~18,000 lines | Excluding stubs, tests, types-only, re-exports |
| Test suites | 97 (75 pass / 22 fail) | 23% failure rate |
| Individual tests | 434 (423 pass / 11 fail) | 2.5% failure rate |
| Git contributors | 1 | 19 commits in 2025, mostly AI-assisted |

### Top 15 Largest Files

| Lines | File | Role |
|-------|------|------|
| 1,675 | `src/scenes/GameScene.ts` | God object — orchestrates everything |
| 787 | `src/asiControl/ui/components/CommandCenterUI.ts` | ASI command center UI |
| 732 | `src/utils/ErrorLogger.ts` | Error infrastructure |
| 731 | `src/utils/StartupErrors.ts` | Error infrastructure |
| 612 | `src/asiControl/systems/GuidanceEngine.ts` | ASI guidance AI |
| 551 | `src/world/tilemap/TilemapManager.ts` | World API hub |
| 548 | `src/navigation/core/NavigationManager.ts` | Speed/camera/terrain coordinator |
| 523 | `src/world/speed/SpeedTransitionController.ts` | Speed physics engine |
| 504 | `src/world/leylines/LeylineEnergySystem.ts` | Ley line energy mechanics |
| 493 | `src/world/tilemap/WorldPersistence.ts` | Save/load system |
| 492 | `src/utils/ASIHealthMonitor.ts` | Runtime health checks |
| 475 | `src/asiControl/ASIControlIntegrationTest.ts` | Integration test |
| 472 | `src/asiControl/systems/ThreatDetector.ts` | ASI threat detection |
| 428 | `src/utils/ASIErrors.ts` | Error types |
| 386 | `src/world/terrain/HighSpeedTerrainSystem.ts` | LOD terrain streaming |

### Directory Size Ranking

| Lines | Directory | Description |
|-------|-----------|-------------|
| 17,601 | `src/world/` | World systems (terrain, tilemap, ley lines, missions, enemies, combat, speed, camera, ASI, UI) |
| 4,932 | `src/utils/` | Error handling, diagnostics, runtime monitors |
| 3,500 | `src/asiControl/` | ASI control UI, trust, threat, guidance |
| 3,070 | `src/ui/` | Game UI components |
| 2,792 | `src/scenes/` | Phaser scenes (GameScene dominates) |
| 2,608 | `src/core/` | Jane, EventBus, PlayerManager, ModularGameLoop, managers |
| 1,580 | `src/ul/` | Universal Language engine, rules, puzzles |
| 1,389 | `src/navigation/` | NavigationManager, SpeedControlSystem |
| 799 | `src/loading/` | Asset loading |
| 238 | `src/magneto/` | Speeder data model (thin — real physics elsewhere) |

---

## System-by-System Audit

### 1. GameScene.ts (1,675 lines) — The God Object

**Role**: Core Phaser scene. Instantiates and wires every system. Contains `preload()`, `create()` (~1,000 lines), `update()`, and all gameplay methods.

**59 imports** spanning: Phaser core, 17 manager classes, ASI systems, world systems, UI systems, utilities.

#### create() Initialization Chain (in order)

| Step | What It Does | Lines |
|------|-------------|-------|
| 1. Textures | Creates/loads tileset, player, speeder, effect sprites. Procedural fallbacks if assets missing. | ~65 |
| 2. Settings | SettingsService init + change listeners | ~10 |
| 3. Backgrounds | Two parallax tile sprites (far/near layers) | ~20 |
| 4. UI Layout | UILayoutManager + UIBarSystem (health/PSI bars) | ~12 |
| 5. Terrain | Dynamic ground level calculation, floating platform with stilts, ChunkLoader init | ~100 |
| 6. PlayerManager | Jane sprite, physics, animations, idle start | ~70 |
| 7. World Systems | TilemapManager (seed: `fusiongirl-${Date.now()}`), RealityWarpSystem, WorldStateManager, LeyLineManager, ground group, platform physics | ~100 |
| 8. MagnetoSpeeder | Sprite creation, physics (bounce 0.2, drag 50), F-key boarding toggle, event handlers | ~85 |
| 9. Touch Controls | Touch device detection, TouchControls UI, InputManager wiring | ~20 |
| 10. Pause/Settings | PauseMenuScene, SettingsScene, ESC handler | ~20 |
| 11. Equipment | Starting gear (cyber_helmet), UI panels | ~5 |
| 12. Enemies | EnemyRegistry from sample mod, EnemyManager, test slime at (600,300), SPACE attack | ~25 |
| 13. ModularGameLoop | 6 systems registered at priorities 1–5 | ~70 |
| 14. Managers | UIManager, NarrativeManager, WorldEditorManager, DevToolsManager, PluginManager | ~50 |
| 15. ASI Control | TrustManager (50 trust, 1/sec decay), ThreatDetector (300px radius), GuidanceEngine, CommandCenterUI, guidance/threat event handlers | ~60 |
| 16. Navigation | NavigationManager, SpeedControlUI, speed→speeder wiring | ~40 |
| 17. UI Controls | ASIOverlay (Q), CommandCenterUI (C), UIMode cycling (M), UILayoutManager registration | ~80 |
| 18. NPCs | NPCManager, test NPC, E-key interaction | ~25 |
| 19. Inventory | InventoryManager, test item, F-key pickup, InventoryOverlay (I) | ~35 |
| 20. Dialogue | DialogueManager, DialogueModal, handlers | ~15 |
| 21. Ley Lines | Overlay graphics, SURGE/DISRUPTION/RIFT event handlers | ~40 |
| 22. Welcome | Control list message (dev mode) | ~20 |
| 23. Player Controls | WASD + arrow keys | ~3 |

#### Key Methods

| Method | Purpose | Real Logic? |
|--------|---------|-------------|
| `toggleSpeederBoarding()` | Mount/dismount speeder, hide/show Jane | Yes — physics, sprite management, welcome message |
| `updateSpeederMovement()` | Apply NavigationManager speed to sprite velocity | Yes — speed conversion (km/h × 0.1, cap 800 px/s), camera follow, chunk loading |
| `updateHypersonicEffect()` | Visual effect at >12,000 km/h | Yes — intensity scaling, alpha 0.3–0.8, scale 0.5–2.0, velocity-based rotation |
| `updateBasicPlayerMovement()` | WASD/arrow movement + chunk updates | Yes — 200 px/s walk speed |
| `updateSpeederInteractionHint()` | "Press F" hint near speeder | Yes — distance check, text toggle |
| `refreshLeyLineOverlay()` | Redraw ley line visualization | Yes — clears/redraws from LeyLineManager data |
| `update()` | Main loop: guidance tracking, movement, speeder interaction | Yes — delta-based, ~80 lines |

#### Input Map

| Key | Action | Implemented |
|-----|--------|-------------|
| WASD / Arrows | Move Jane / Speeder | Yes |
| F | Board/dismount speeder | Yes |
| SPACE | Attack nearest enemy | Yes |
| ESC | Pause menu | Yes |
| E | NPC interaction | Yes |
| I | Inventory overlay | Yes |
| Q | ASI overlay toggle | Yes |
| C | Command center toggle | Yes |
| M | UI mode cycle (minimal/standard/debug) | Yes |
| T | Timeline panel toggle | Yes |
| F2 | World editor toggle (dev only) | Yes |
| 1-9 | Speed selection | **Mentioned in welcome text, NOT implemented** |
| H | Hypersonic toggle | **Mentioned in welcome text, NOT implemented** |

#### ASI Integration in GameScene

- **ASI_GUIDANCE_GIVEN** event → Moves Jane/speeder toward target position with arrival detection (GUIDANCE_ARRIVAL_EPS)
- **THREAT_DETECTED** event → Activates shield window (slow-mo, 0.2x timescale)
- **Trust feedback loop** → Emits JANE_RESPONSE with trust change (+2 followed, −1 ignored)

#### Critical Issues

1. **God object**: 59 imports, every system instantiated here, all input wired here. Adding any new feature means modifying this file.
2. **Phantom key bindings**: Welcome text advertises 1-9 and H keys that don't exist.
3. **Procedural texture fallbacks**: Every asset has a generated fallback — good for development but masks missing art pipeline.
4. **Try/catch wrapping**: Gracefully handles missing managers, which means broken integrations fail silently.

---

### 2. Speed Physics Engine (523 + 326 + 386 lines) — The Best Code

Three tightly integrated systems forming the most sophisticated subsystem in the codebase:

#### SpeedTransitionController.ts (523 lines) — Jerk Physics

| Category | Speed Range | Max Accel (km/h/s) | Smoothing |
|----------|------------|---------------------|-----------|
| Walking | 5–50 km/h | 80 | 0.8 |
| GroundVehicle | 50–200 | 200 | 0.7 |
| Aircraft | 200–2,000 | 800 | 0.6 |
| Supersonic | 2,000–34,300 | 3,000 | 0.5 |
| Hypersonic | 34,300–343,000 | 8,000 | 0.3 |

**Adaptive acceleration**: 2x–50x multipliers based on speed delta. Emergency deceleration at 15x. "Hypersonic fast-lane" adds +500 km/h bonus when targeting ≥34,300 to reach threshold quickly. Real jerk physics (position from velocity from acceleration) with `3x POSITION_SCALE` for test compatibility.

**Methods**: `update(deltaTimeMs, position?)`, `setTargetSpeed(target)`, `triggerWarpBoom()`, `triggerEmergencyDeceleration()`, `applySpeedBoost(multiplier)`, category change callbacks.

#### SideScrollCameraController.ts (326 lines) — Motion-Sickness Prevention

| Category | Zoom | View Distance | Look-Ahead Time | Smoothing |
|----------|------|---------------|-----------------|-----------|
| Walking | 1.0 | 200m | 2s | 0.9 |
| GroundVehicle | 0.7 | 800m | 3s | 0.8 |
| Aircraft | 0.3 | 3km | 4s | 0.7 |
| Supersonic | 0.1 | 20km | 5s | 0.6 |
| Hypersonic | 0.02 | 200km | 10s | 0.5 |

50x zoom range. Predictive look-ahead (velocity × time). Zoom transitions at 0.5x position speed (2x slower). Emergency reset to Walking camera on WarpBoom.

#### HighSpeedTerrainSystem.ts (386 lines) — Adaptive LOD Streaming

| Category | Chunk Size | Samples | Stream Distance | Update Freq |
|----------|-----------|---------|-----------------|------------|
| Walking | 1km | 64 | 3 chunks | 100ms |
| GroundVehicle | 2km | 32 | 5 chunks | 50ms |
| Aircraft | 5km | 16 | 10 chunks | 33ms |
| Supersonic | 20km | 8 | 25 chunks | 16ms |
| Hypersonic | 100km | 4 | 50 chunks | 8ms |

Predictive path calculation (50+ waypoints from velocity), priority-based chunk loading (max 10 concurrent), altitude-based speed limits (cubic curve), Earth-curvature visibility distance.

**Terrain height generation**: 3-octave sine noise (continental `sin(x/50000)*500m` + regional `sin(x/10000)*200m` + local `sin(x/1000)*50m`).

**Biome classification**: Elevation-based (`<50m` water, `<200m` grassland, `<500m` forest, `<800m` mountain, `>800m` snow).

#### Integration

`GameScene → NavigationManager → SpeedControlSystem → SpeedTransitionController + SideScrollCameraController + HighSpeedTerrainSystem`

All three systems update each frame via the ModularGameLoop at priority 1.5–1.6.

---

### 3. Jane.ts (300 lines) — Character Data Model

**Properties**: id, name, stats (health/maxHealth/psi/maxPsi/level/experience/skills), eventBus, aiEnabled, asiOverride, speeder (MagnetoSpeeder|null), isMounted, position, skills (SkillDefinition[]), cosmetics (CosmeticDefinition[]), faction (FactionDefinition|null).

**Constructor**: Loads data-driven content from `getCharacterData('jane')`, `loadSkills()`, `loadCosmetics()`, `loadFactions()`. Filters skills by level requirement.

| Category | Methods | Real Logic? |
|----------|---------|-------------|
| Stats | `gainExperience()`, `getNextLevelXP()`, `takeDamage()`, `heal()`, `usePsi()`, `restorePsi()` | Yes — math + events |
| Speeder | `mountSpeeder()`, `dismountSpeeder()`, `setSpeederMode()`, `boostSpeederWithPsi()`, `getSpeederStatus()` | Yes — state + events |
| Movement | `moveTo(x,y)`, `planLeyLineRouteTo(target)` | Yes — position + LeyLineManager query |
| ASI | `setASIOverride()`, `isASIControlled()`, `setAIEnabled()`, `isAIEnabled()` | Yes — flag toggles + events |
| AI | `updateAI(dt)` | **Stub — empty** |
| Persistence | `toJSON()`, `static fromJSON(data, eventBus)` | Yes — serialization |

**16 events emitted**: JANE_ASI_OVERRIDE, JANE_LEVEL_UP, JANE_DAMAGED, JANE_DEFEATED, JANE_HEALED, JANE_PSI_USED, JANE_PSI_RESTORED, JANE_MOUNTED_SPEEDER, JANE_DISMOUNTED_SPEEDER, CHARACTER_MOVED, JANE_MOVED, SPEEDER_MODE_CHANGED, JANE_PSI_USED_FOR_SPEEDER, and more.

**Assessment**: Solid data-driven character model. The missing piece is `updateAI()` — autonomous behavior.

---

### 4. EventBus.ts (70 lines) — Production Quality

Type-safe pub/sub. `on<T>(type, handler)` returns unsubscribe function. `emit<T>(event)`, `off()`, `once()`, `onAny()`. No memory leaks, clean API. Used everywhere. **The best code in the codebase.**

### 5. ModularGameLoop.ts (60 lines) — Clean Architecture

Priority-based system registry. `registerSystem({id, priority, update})`, `update(dt)` calls all systems in priority order, emits `GAMELOOP_POST_UPDATE`. 6 systems registered in GameScene at priorities 1–5.

### 6. PlayerManager.ts (160 lines) — Facade

Wraps Jane + controllers. Creates Jane instance from config, wires UL events (UL_ANIMATION, UL_FEEDBACK, ul:puzzle:completed, ul:puzzle:validated). Has ASI override delegation. **Stubs**: addASI(), removeASI(), addJane(), removeJane() (multiverse/multiplayer prep).

---

### 7. ASI Control Subsystem (3,500 lines total)

The second-largest subsystem by directory. Located in `src/asiControl/`.

#### TrustManager.ts (328 lines)

Dynamic trust scoring. Trust value (0–100, default 50) with configurable decay (1/sec). Trust modifiers from events (assistance +5, threat response +3, intrusion −10, etc.). Trust levels mapped to ASI capability tiers (untrusted/cautious/cooperative/synced/bonded). Emits TRUST_CHANGED events. **Real behavioral logic throughout.**

#### ThreatDetector.ts (472 lines)

Scans for threats within configurable radius (default 300px). Threat types: enemy_proximity, ley_line_instability, environmental_hazard, health_critical, psi_depleted. Priority scoring and distance-based weight. Threat decay over time. Emits THREAT_DETECTED with severity/type/position. **Sophisticated detection system with real geometry.**

#### GuidanceEngine.ts (612 lines)

Context-aware suggestion system. Analyzes: Jane's state (health, psi, position), world state (active threats, nearby nodes, mission objectives), trust level. Generates prioritized guidance suggestions. Each suggestion has: type, priority, target position, description, confidence score. Adapts suggestion style to trust level (cautious = fewer suggestions, synced = proactive). **Most complex ASI system — largely functional.**

#### CommandCenterUI.ts (787 lines)

Phaser-based UI panel. Threat display, trust meter visualization, guidance suggestion list, intervention controls. Toggle with C key. **Real rendering code, functional.**

#### Integration Test (475 lines)

Tests TrustManager ↔ ThreatDetector ↔ GuidanceEngine integration. Verifies trust decay, threat response, guidance generation pipeline. **Well-structured tests but currently in the FAILING suite.**

**Assessment**: This subsystem is architecturally complete and has real behavioral logic. It's the infrastructure for the ASI perspective. What's missing: it's not visible to the player in a meaningful "I am the ASI" way — it runs behind the scenes but doesn't change the player's experience or perspective of the game, and it isn't wired into `GameScene.update()` in a way that drives gameplay.

---

### 8. Ley Line Systems (~900 lines across 3 directories)

**WARNING**: Three separate directories contain ley line code: `src/leyline/`, `src/leylines/`, and `src/world/leyline/`. Duplication and unclear ownership.

#### src/leyline/LeyLineSystem.ts (122 lines)

Standalone proof-of-concept. LCG-based procedural network generation. `generateNetwork(seed, nodeCount, lineCount)`. Static event hooks (NOT connected to EventBus). Graph queries. **Disconnected from main game.**

#### src/world/leyline/ (7 files, ~500 lines)

| File | Lines | Status |
|------|-------|--------|
| `LeyLineManager.ts` | 196 | Semi-functional hub. Network generation, nearest-node queries, strength calculation (0–100 by distance), visualization data output. Pathfinding delegates to LeyLinePathfinder. |
| `types.ts` | 26 | Type definitions: LeyLineNode, LeyLine, LeyLineInstabilityEvent with severity/trigger typing. |
| `procedural/LeyLineProceduralGen.ts` | 104 | **Solid**: LCG PRNG + Prim's MST for guaranteed connected graph + N/3 random extra edges. |
| `pathfinding/LeyLinePathfinder.ts` | 84 | **Stub**: `findPath()` returns `[startNode, endNode]` directly — no actual graph traversal. No A*/Dijkstra. |
| `events/LeyLineEvents.ts` | 40 | Thin EventBus wrapper. Publishes ACTIVATION, SURGE, DISRUPTION, MANIPULATION, INSTABILITY events. |
| `visualization/LeyLineVisualization.ts` | 46 | Returns render data (line segments + nodes + overlays) for UI. |
| `instability/` | ~30 | Escalation chain (minor→moderate→major→rift). Stubs only. |

#### src/world/leylines/LeylineEnergySystem.ts (504 lines)

Energy mechanics for speeder-ley-line interaction. Speed boost/drain based on ley line proximity. Energy transfer calculations. **The most complete ley line gameplay code**, but may overlap with `src/world/leyline/LeyLineManager.ts`.

**Assessment**: Good foundational code for network generation and visualization. Critical gap: no actual pathfinding (the pathfinder is a stub), no real instability mechanics, and confusing triple-directory structure. The 504-line LeylineEnergySystem is the real gameplay integration but lives in a separate directory from the manager/pathfinder.

---

### 9. Universal Language (1,580 lines)

All in `src/ul/`. Separate attempt in `src/unilang/` (47 lines, stub).

| File | Lines | Status |
|------|-------|--------|
| `ulEngine.ts` | 223 | Encoding/decoding engine. Validates symbol sequences against grammar rules. Processes puzzle attempts. Real logic. |
| `ulResourceLoader.ts` | 355 | Modding-aware resource loader with Zod validation. Loads symbols, rules, puzzles from JSON. IPFS integration hooks. |
| `ulCanonicalTypes.ts` | 103 | Full type definitions for UL domain (symbols, elements, modalities, forces, alignments). |
| `ulCanonicalSchemas.ts` | 64 | Zod schemas for runtime validation of canonical types. |
| `cosmicRules.ts` | 86 | Rule definitions: element interactions, modality cycles, cosmic force relationships. |
| `grammarRules.ts` | 75 | Syntax rules for symbol sequences. |
| `puzzleTemplates.ts` | 78 | Template structures for puzzle instances. |
| `spellRecipes.ts` | 55 | Spell composition rules (symbols → effects). |
| `symbolIndex.ts` | 57 | Symbol lookup by ID/name. |
| `ULSymbolIndex.ts` | 54 | 11 canonical symbols defined with elements, modalities, descriptions. |
| `phoneticGlyphMap.ts` | 48 | Phonetic↔glyph translation tables. |
| `ulEventBus.ts` | 48 | UL-specific event bus (puzzle:completed, puzzle:validated, etc.). |
| `ulTypes.ts` | 13 | Basic type aliases. |

**Assessment**: Surprisingly complete data model. The engine can encode/decode, validate, and process puzzle attempts. The resource loader supports modding and external data. What's missing: **no in-game UI for puzzles**. The engine works but nothing calls it during gameplay. The 4 UL test files (ulEngine.test.ts, ULSymbolIndex.test.ts, ulPuzzle.test.ts, ulResourceLoader.test.ts) are all in the FAILING test suite.

---

### 10. Terrain & Tilemap (Largest Subsystem — 17,601 lines in src/world/)

#### TilemapManager.ts (551 lines)

World API hub. Key constants: `WORLD_WIDTH = 40,075,017` tiles (Earth circumference in meters), `WORLD_HEIGHT = 965,400` tiles. **Toroidal wrapping**: `wrapX()`, `toroidalDistanceX()`, BigInt variants for extreme scales. Branch/delta system for timeline branching. Save/load full game state. Mod tile registration. **The wrapping math is real and correct; most world queries delegate to sub-systems.**

#### ChunkLoader.ts (167 lines)

Phaser-integrated chunk rendering. Speed-adaptive chunk radius (4 chunks at walking → 12 at hypersonic). Creates tile sprites, physics bodies. 100ms throttle. **Real rendering integration — this is what makes terrain visible.**

#### ChunkManager.ts (58 lines)

Chunk lifecycle: load (from persistence or worldgen), unload (save if dirty), toroidal edge-aware unloading. Clean state management.

#### WorldPersistence.ts (493 lines)

LocalStorage-based save/load. Branch management, anchor serialization, mod metadata. **Real implementation but tests fail.**

#### HybridTerrainSystem.ts (359 lines)

Framework for real-world elevation data (GEBCO, SRTM). Proper slope/aspect calculation via finite differences. Biome classification. Feature generation. Cache management. **Data source integration is TODO — falls back to procedural noise.**

#### Other terrain files

MockTerrainSystem (379 lines — test mock), SimpleBiomeClassifier (343 lines — elevation→biome mapping), ElevationSliceTerrainSystem (51 lines — 1D slice wrapper), types.ts (200+ lines of comprehensive terrain type definitions).

---

### 11. Combat System (Minimal)

| File | Lines | Status |
|------|-------|--------|
| `src/combat/CombatSystem.ts` | 54 | Speeder-aware combat with PSI synergy and energy management. Events emitted. More than "press SPACE" — has actual damage formulas. |
| `src/world/combat/CombatService.ts` | 40 | Static methods: `playerAttackEnemy()` and `enemyAttackPlayer()`. Formula: `max(1, (attacker.attack + weapon.damage) - defender.defense)`. Ability hooks exist. |
| `src/world/combat/AttackRegistry.ts` | 30 | Registry with mod support. |
| `src/world/combat/AttackDefinition.ts` | 10 | Interface: melee/ranged/magic, damage, range, cooldown, effect. |
| `src/world/enemies/EnemyRegistry.ts` | 45 | Factory + mod registration. |
| `src/world/enemies/EnemyInstance.ts` | 30 | Runtime instance with toroidal position wrapping. |
| `src/world/enemies/EnemyDefinition.ts` | 13 | Interface: stats, aiType, drops. |

**EnemyManager.ts** (100 lines in `src/core/`): Real enemy system. Spawns enemies with sprites, health bars, physics. AI loop: edge-bounce, health bar tracking, death handling with ENEMY_DEFEATED events.

**Assessment**: More than a stub, less than a system. Damage formulas exist and work. Missing: UL type advantages, strategic depth, multiple enemy types in practice (only test slime spawned), no boss AI.

---

### 12. Mission System (450+ lines)

| File | Lines | Status |
|------|-------|--------|
| `MissionManager.ts` | 76 | State machine: load, update status, update objectives, auto-complete. Serialization. `triggerEvent()` is a stub. |
| `MissionSystem.ts` | 277 | Event-driven: listens to ENEMY_DEFEATED, ITEM_COLLECTED, LEYLINE events, UL puzzle events. 16 outcome types defined (victory, defeat, retreat, surrender, diplomatic, betrayal, etc.). **All outcome handlers are empty stubs.** |
| `MissionEventHandlers.ts` | 59 | UI notification on completion (real tween animation). Reward granting is stub. |
| `sampleMissions.ts` | 82 | 4 sample missions: "Awaken in the Rift" (main), "Escape the Burning Lab" (combat), "Negotiate with the Outcasts" (diplomacy), "The Traitor Revealed" (betrayal). |
| `types.ts` | 38 | Complete type definitions for mission/objective/reward/trigger. |

**NarrativeManager.ts** (65 lines in `src/core/`): Loads sample missions, restores from localStorage, wires completion events. Thin orchestration.

**Assessment**: Architectural skeleton is well-typed and complete. 16 outcome types show design ambition. But every outcome handler is empty, and `triggerEvent()` doesn't actually emit events. The 4 sample missions have all metadata but can't actually be played through.

---

### 13. Narrative (100 lines total)

| File | Lines | Status |
|------|-------|--------|
| `NarrativeEngine.ts` | 54 | Event-driven engine with chapter/scene tracking. Real event emission. |
| `DialogueSystem.ts` | ~30 | **Stub** — class exists, no dialogue branching or display. |
| `CutsceneManager.ts` | ~20 | **Stub** — class exists, no sequencing. |
| `StoryEvents.ts` | ~20 | **Stub** — event type definitions. |

**Assessment**: The engine has real event-driven structure. Everything else is empty. No dialogue can be displayed, no cutscenes can play.

---

### 14. Companions (Stubs)

| File | Lines | Status |
|------|-------|--------|
| `PsiSysRobot.ts` | ~15 | Empty class definition |
| `AlternateJane.ts` | ~15 | Empty class definition |

No summoning, no control switching, no individual bot identities.

---

### 15. AI (6 lines)

`src/ai/JaneAI.ts`: Empty class with scaffold comment. **The core design concept of autonomous Jane has zero implementation.**

---

### 16. Magneto Speeder Data Model (238 lines in src/magneto/)

| File | Lines | Status |
|------|-------|--------|
| `MagnetoSpeeder.ts` | 116 | Pure data structure: energy (0–100), mode (manual/auto), upgrades, position. Ley line energy adjustment. **No physics, no speed, no rendering.** |
| `SpeederManager.ts` | 36 | Event emitter wrapper. `updateSpeederEnergy()` and `applyEnvironmentalHazard()`. **Never called from GameScene.** |
| `SpeederUI.ts` | 34 | `renderHUD()` → `console.log()`. No actual rendering. |
| `SpeederUpgradeSystem.ts` | 48 | Upgrade registry. `constructor()` has TODO to load upgrades. No upgrade data exists. |

**Important**: The actual speeder MOVEMENT lives in `GameScene.updateSpeederMovement()` + `NavigationManager` + `SpeedTransitionController`. The `src/magneto/` directory is only the data model. The physics, camera, and terrain integration are in `src/world/speed/`, `src/world/camera/`, and `src/navigation/`.

---

### 17. Other Systems

| System | Location | Lines | Status |
|--------|----------|-------|--------|
| **UIManager** | `src/core/UIManager.ts` | 250 | Real: Minimap, LoreTerminal, TimelinePanel, FeedbackModal, ASIOverlay, LeyLineStabilizationModal. Wired to ley line events. |
| **WorldEditorManager** | `src/core/WorldEditorManager.ts` | 120 | Real: TileBrush, clipboard, undo/redo, palette, inspector. Dev-only (F2 toggle). |
| **DevToolsManager** | `src/core/DevToolsManager.ts` | 60 | Mostly real: giveWeapon, setPosition, toggleGodMode, healPlayer, spawnItem, warpReality. Hotkey binding is stub. |
| **PluginManager** | `src/core/PluginManager.ts` | 30 | Thin wrapper delegating to mod_loader. |
| **InputManager** | `src/core/controls/InputManager.ts` | 65 | Singleton facade: keyboard, touch, gamepad, AI input sub-managers. |
| **Save System** | `src/save/` | ~50 | Clean JSON serialization. LocalStorage-based. |
| **Data Loaders** | `src/data/` | 128 | 8 consistent loaders (characters, skills, attacks, cosmetics, factions, narratives, ley lines, zones). Type-safe pattern. |
| **Modding** | `src/mods/` | 337 | Sample enemy mod, mod_loader with registry injection. Zod validation. IPFS hooks. |
| **Error Infrastructure** | `src/utils/` | 4,932 | ErrorLogger (732), StartupErrors (731), ASIHealthMonitor (492), StartupDiagnostics (491), ASIErrors (428), RuntimeMonitor (381), SceneValidator (339). **~12% of total codebase is error handling.** |

---

### 18. Failing Tests (22 suites)

| Category | Failing Suites | Likely Cause |
|----------|---------------|-------------|
| **Universal Language** | ulEngine, ULSymbolIndex, ulPuzzle, ulResourceLoader | Schema/type changes not propagated to tests |
| **Ley Lines** | LeylineEnergySystem, LeyLineEvents.integration | Dependency mocking issues |
| **Tilemap** | WorldPersistence, WorldEditService, WorldEditPermissions, TileSelectionOverlay, TileClipboard | LocalStorage mocking + DOM dependencies |
| **Navigation** | SpeedTransitionController, NavigationManager.enhanced | Physics timing edge cases |
| **Missions** | MissionSystem | Event wiring assumptions |
| **ASI** | MVP.test | Empty MVP system files (0 bytes) |
| **Integration** | integration.test, Jane_LeyLineManager, Minimap_LeyLineOverlay, UIManager | Cross-system dependency failures |
| **Other** | Jane.test, AttackLoader.test, Cosmetics.test | Data loader path/mock issues |

**Pattern**: Most failures are integration issues (mocking, dependency resolution) rather than logic bugs. The 423 passing tests confirm core logic works. The failing tests are canaries for coupling problems.
