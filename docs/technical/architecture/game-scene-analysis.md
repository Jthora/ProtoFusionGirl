# GameScene Decomposition Analysis

> [src/scenes/GameScene.ts](../../../src/scenes/GameScene.ts) — 1,675 lines, 59 imports, Priority 0 refactoring target.

This document maps every block of code in GameScene to its extraction destination. Use it as an execution checklist.

---

## Current State Summary

| Metric | Value |
|--------|-------|
| Total lines | 1,675 |
| Imports | 59 |
| Private fields | 40+ |
| Methods | 19 |
| Key bindings | 10 keys (WASD, F, Q, C, M, H, U, D, E, I, ESC, TAB, SPACE) |
| Event listeners | 9 EventBus subscriptions |
| Phaser input listeners | 11 keyboard listeners |
| Systems created | 17 managers/systems |

---

## Method Map (Line Ranges)

| Method | Lines | Purpose | Extraction Target |
|--------|-------|---------|-------------------|
| `constructor()` | ~163-167 | Scene key + ref keeper | Keep |
| `getDynamicGroundLevel()` | ~173-210 | Terrain height query | → `TerrainService` |
| `adjustSpawnForLoadedTerrain()` | ~215-260 | Post-load position fixes | → `SpawnManager` |
| `findActualGroundLevel()` | ~262-280 | Ground sprite scan | → `TerrainService` |
| `monitorTerrainChanges()` | ~285-305 | 5-second terrain polling | → `TerrainService` |
| `preload()` | ~307-355 | Asset loading/generation | → `AssetLoader` or keep minimal |
| `saveMissionState()` | ~358-361 | localStorage persist | Keep (one-liner) |
| `create()` | ~363-1228 | **866 lines — THE PROBLEM** | → See extraction plan below |
| `addBasicPlayerControls()` | ~1230-1240 | WASD/arrow setup | → `InputController` |
| `toggleSpeederBoarding()` | ~1242-1295 | Mount/dismount logic + UI | → `SpeederController` |
| `updateSpeederMovement()` | ~1297-1360 | Speeder physics + chunk update | → `SpeederController` |
| `updateHypersonicEffect()` | ~1362-1395 | Visual effects for speed tiers | → `SpeederController` |
| `showWelcomeMessage()` | ~1397-1440 | Dev welcome overlay | → Delete or `DevUI` |
| `handleNPCInteraction()` | ~1442-1452 | NPC dialogue trigger | → `NPCInteractionService` |
| `refreshLeyLineOverlay()` | ~1454-1492 | Ley line rendering | → `LeyLineSceneIntegration` |
| `showLeyLineFeedback()` | ~1494-1505 | Floating event text | → `LeyLineSceneIntegration` |
| `triggerLeyLineVisualEffect()` | ~1512-1565 | Glow/flicker on instability | → `LeyLineSceneIntegration` |
| `update()` | ~1567-1600 | Main loop + guidance check | Keep (thin) |
| `updateUIElements()` | ~1602-1620 | Bar updates each tick | Keep (thin) |
| `updateBasicPlayerMovement()` | ~1622-1660 | WASD velocity + chunk update | → `InputController` |
| `updateSpeederInteractionHint()` | ~1662-1700 | F-to-board hint distance check | → `SpeederController` |
| `resize()` | ~1702-1710 | Layout resize delegation | Keep |

---

## create() Extraction Plan

The 866-line `create()` method is the core problem. Here is every block with its extraction target:

### Block 1: Settings & Backgrounds (L363-420)
```
SettingsService.getInstance()
Background texture fallbacks
Parallax tileSprite creation
```
**Extract to:** `SceneSetup.initBackgrounds(scene)` — static helper, ~60 lines

### Block 2: UI Layout System (L420-440)
```
getBootstrapContext → eventBus, inputManager
UILayoutManager creation
UIBarSystem creation
InteractionDiagnostics (conditional)
```
**Extract to:** `SceneSetup.initUILayout(scene, eventBus)` — ~20 lines

### Block 3: Terrain & Platform (L440-620)
```
Ground level calculation
Platform positioning
groundGroup static physics
Floating platform with stilts
ChunkLoader initialization
Collision setup
Terrain monitoring
```
**Extract to:** `TerrainSceneSetup.init(scene, tilemapManager)` — ~180 lines. This is the largest pure-extraction win.

### Block 4: Player Manager (L450-500)
```
PlayerManager construction with config
Jane sprite, animations, position
Camera follow
```
**Extract to:** Keep in `create()` but use config object from external file. PlayerManager construction is fine here — it's the *config* that should be extracted to a data file.

### Block 5: World Systems (L500-525)
```
WorldStateManager construction
LeyLineManager construction
TilemapManager seed + generate
```
**Extract to:** `WorldInit.init(scene, eventBus, worldSeed)` — ~25 lines

### Block 6: MagnetoSpeeder (L620-700)
```
Speeder sprite creation
Hypersonic effect sprite
F-key boarding handler
```
**Extract to:** `SpeederController.init(scene, playerManager, groundGroup)` — ~80 lines. This is a self-contained extraction.

### Block 7: Touch Controls (L700-720)
```
TouchControls for mobile
Pointer addition
```
**Extract to:** `InputController.initTouch(scene, inputManager)` — ~20 lines

### Block 8: Pause/Settings Scenes (L720-740)
```
PauseMenuScene/SettingsScene registration
ESC handler
```
**Extract to:** Keep (simple boilerplate, 20 lines)

### Block 9: Tilemap UI Panels (L740-750)
```
Equipment service, inventory panel, crafting panel render
```
**Extract to:** Keep — wiring calls. Could move to `UIInit` but low priority.

### Block 10: Enemy System (L750-780)
```
EnemyRegistry mod loading
EnemyManager construction
Enemy spawn
SPACE attack handler
```
**Extract to:** `CombatInit.init(scene, eventBus, groundGroup, janeSprite)` — ~30 lines

### Block 11: Modular Game Loop (L780-830)
```
ModularGameLoop construction
6 system registrations at priorities 1-5
```
**Extract to:** `GameLoopInit.init(modularGameLoop, managers)` — ~50 lines. Clean extraction because it only references manager methods.

### Block 12: Manager Layer (L830-880)
```
UIManager, NarrativeManager, WorldEditorManager, DevToolsManager, PluginManager construction
```
**Extract to:** `ManagerInit.init(scene, eventBus, ...)` — ~50 lines. These have many constructor args but the pattern is repetitive.

### Block 13: ASI Control (L880-940)
```
TrustManager, ThreatDetector, GuidanceEngine, CommandCenterUI construction
```
**Extract to:** `ASISceneIntegration.init(scene, eventBus, playerManager)` — ~60 lines. **High-value extraction** because ASI is a major subsystem.

### Block 14: Navigation (L940-970)
```
NavigationManager, SpeedControlUI construction
```
**Extract to:** Keep (short, 2 constructors)

### Block 15: ASI Overlay & Key Bindings (L970-1010)
```
ASIOverlay construction
Q/C/M key handlers
Layout manager registrations
```
**Extract to:** `ASISceneIntegration` (extend Block 13)

### Block 16: Guidance Handler (L1010-1060)
```
ASI_GUIDANCE_GIVEN event listener
Physics.moveTo call
GuidanceViz path drawing
Timeout scheduling
```
**Extract to:** `ASISceneIntegration.wireGuidanceEvents(scene, eventBus, ...)` — ~50 lines

### Block 17: Shield Window (L1060-1090)
```
THREAT_DETECTED event listener
Slow-motion activation
Visual cue overlay
Cooldown tracking
```
**Extract to:** `ASISceneIntegration.wireShieldWindow(scene, eventBus, trustManager)` — ~30 lines

### Block 18: Tab Quick Guidance (L1090-1130)
```
Tab key handler
GuidanceEngine.generateSuggestions with mock context
```
**Extract to:** `ASISceneIntegration` — ~40 lines

### Block 19: NPC System (L1130-1160)
```
NPCManager construction + global registration
Test NPC spawn
E-key interaction handler
```
**Extract to:** `NPCInit.init(scene, npcManager, playerManager)` — ~30 lines

### Block 20: Inventory System (L1160-1200)
```
InventoryManager construction + global registration
Test item spawn
F-key pickup handler
InventoryOverlay + I-key toggle
```
**Extract to:** `InventoryInit.init(scene, inventoryManager, uiLayoutManager)` — ~40 lines

### Block 21: Dialogue System (L1200-1215)
```
DialogueManager construction + registration
DialogueModal creation + layout registration
```
**Extract to:** Keep (10 lines)

### Block 22: Ley Line Visualization (L1215-1260)
```
LeyLineOverlay graphics
4 ley line event listeners
D-key debug toggle
Initial overlay draw
```
**Extract to:** `LeyLineSceneIntegration.init(scene, eventBus, worldStateManager, uiManager, uiLayoutManager)` — ~45 lines

### Block 23: Welcome Message + Controls (L1260-1230)
```
Dev welcome message (gated)
addBasicPlayerControls()
```
**Extract to:** Delete welcome message. Keep `addBasicPlayerControls()` inline.

---

## Extraction Priority Order

Based on value (lines saved × isolation × complexity reduction):

| Priority | Extraction | Lines Freed | Risk | Dependencies |
|----------|-----------|-------------|------|-------------|
| **1** | `TerrainSceneSetup` (Block 3) | ~180 | Low | groundGroup ref, chunkLoader ref |
| **2** | `ASISceneIntegration` (Blocks 13+15+16+17+18) | ~180 | Medium | trustManager, guidanceEngine, threatDetector, commandCenterUI refs |
| **3** | `SpeederController` (Block 6 + methods) | ~200 | Low | magnetoSpeederSprite, isOnSpeeder, navigationManager refs |
| **4** | `LeyLineSceneIntegration` (Block 22 + methods) | ~100 | Low | leyLineOverlay, worldStateManager refs |
| **5** | `CombatInit` + `ManagerInit` (Blocks 10+12) | ~80 | Low | Constructor args only |
| **6** | `GameLoopInit` (Block 11) | ~50 | Low | Manager references |
| **7** | `InputController` (Blocks 7+WASD) | ~40 | Low | playerControls ref |

### After All Extractions

GameScene `create()` becomes ~150-200 lines:
```typescript
create() {
  const { eventBus, inputManager } = getBootstrapContext(this);
  this.eventBus = eventBus;
  
  SceneSetup.initBackgrounds(this);
  SceneSetup.initUILayout(this, eventBus);
  
  this.playerManager = PlayerInit.create(this, eventBus, inputManager);
  const janeSprite = this.playerManager.getJaneSprite();
  
  const { groundGroup, chunkLoader } = TerrainSceneSetup.init(this, this.tilemapManager);
  this.groundGroup = groundGroup;
  
  WorldInit.init(this.tilemapManager, this.worldStateManager, eventBus);
  
  this.speederController = SpeederController.init(this, janeSprite, groundGroup);
  
  CombatInit.init(this, eventBus, groundGroup, janeSprite);
  
  const managers = ManagerInit.init(this, eventBus, ...);
  GameLoopInit.init(this.modularGameLoop, managers);
  
  ASISceneIntegration.init(this, eventBus, this.playerManager);
  NPCInit.init(this, eventBus);
  InventoryInit.init(this, this.uiLayoutManager);
  LeyLineSceneIntegration.init(this, eventBus, this.worldStateManager);
  
  InputController.init(this, inputManager);
}
```

---

## update() After Extraction

```typescript
update(_time: number, delta: number) {
  this.modularGameLoop.update(delta);           // All registered systems
  ASISceneIntegration.checkGuidanceArrival();    // Guidance arrival
  this.updateUIElements();                       // Bar updates (5 lines)
  this.updateBasicPlayerMovement();              // Until InputController handles it
  this.speederController.updateInteractionHint(); // F prompt
}
```

Target: ~20 lines.

---

## Fields That Must Be Shared After Extraction

These fields on GameScene are accessed by multiple extraction targets. They must either stay on GameScene, or move to a shared context object:

| Field | Accessed By | Recommendation |
|-------|------------|----------------|
| `eventBus` | Everything | Pass to each init function |
| `playerManager` | ASI, Combat, Speeder, UI | Keep on scene |
| `magnetoSpeederSprite` | Speeder, ASI guidance | Move to `SpeederController`, provide getter |
| `isOnSpeeder` | Speeder, ASI guidance, movement | Move to `SpeederController`, provide getter |
| `groundGroup` | Terrain, Player, Speeder, Enemy | Keep on scene |
| `tilemapManager` | World, Editor, Narrative, DevTools | Keep on scene |
| `trustManager` | ASI subsystem only | Move to `ASISceneIntegration` |
| `uiLayoutManager` | Many registrations | Keep on scene |
| `chunkLoader` | Terrain, Speeder movement, Walk movement | Keep on scene or move to `TerrainSceneSetup` |

---

## Key Bindings Inventory

All keyboard bindings currently wired in GameScene:

| Key | Action | Extraction Target |
|-----|--------|-------------------|
| WASD / Arrows | Move Jane (walking) | `InputController` |
| WASD / Arrows (mounted) | Move speeder | `SpeederController` |
| F | Board/dismount speeder + pickup items | `SpeederController` + `InventoryInit` (CONFLICT!) |
| ESC | Pause menu | Keep |
| SPACE | Attack nearest enemy | Keep (one-liner) |
| Q | Toggle ASI override | `ASISceneIntegration` |
| C | Toggle Command Center | `ASISceneIntegration` |
| M | Cycle UI mode (minimal/standard/debug) | Keep |
| H | Hide/show contextual UI | Keep |
| U | Layout debug | Keep |
| D | Toggle ley line overlay | `LeyLineSceneIntegration` |
| E | NPC interaction | `NPCInit` |
| I | Toggle inventory | `InventoryInit` |
| TAB | Quick guidance suggestions | `ASISceneIntegration` |

**BUG: F key is bound TWICE** — once for speeder boarding (~L640), once for item pickup (~L1180). Both fire on the same keypress. The speeder handler checks distance < 64; the item handler also checks distance. If player is near both, both execute.

**BUG: Speed keys 1-9 and H for hypersonic** are mentioned in the welcome message but never actually bound to anything. They are phantom controls.

---

## Risk Assessment

| Extraction | Risk | Mitigation |
|-----------|------|------------|
| TerrainSceneSetup | Low — self-contained ground setup | Pass groundGroup back |
| ASISceneIntegration | Medium — many cross-refs | Create facade that holds ASI state |
| SpeederController | Low — well-isolated | Return controller instance for update() calls |
| LeyLineSceneIntegration | Low — event-driven | Pass refs, return nothing |
| CombatInit | Low — one-shot setup | Return enemyManager |
| GameLoopInit | Low — pure registration | Pass all managers |
| InputController | Low — key bindings | Must coordinate with SpeederController on mounted state |

### Biggest Risk: Shared Mutable State

GameScene currently shares `this.isOnSpeeder` between:
- `updateSpeederMovement()` (reads it)
- `toggleSpeederBoarding()` (writes it)
- `update()` guidance arrival (reads it for actor selection)
- `updateBasicPlayerMovement()` (reads it to skip when mounted)

After extraction, one controller must own this state and others must query it.
