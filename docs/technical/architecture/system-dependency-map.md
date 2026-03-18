# System Dependency Map

> Complete wiring diagram of every major system in the Proto FusionGirl codebase. Shows what depends on what, who creates whom, and where the coupling points are.

---

## System Creation Chain

Everything starts in `GameScene.create()`. The creation order determines initialization dependencies:

```
GameScene.create()
│
├── 1. Asset System (textures, sprites — self-contained)
├── 2. SettingsService (singleton — no dependencies)
├── 3. Background parallax (Phaser tilemaps — depends on textures)
│
├── 4. UILayoutManager → UIBarSystem
│       └── depends on: Phaser scene
│
├── 5. Terrain (ground level calc, ChunkLoader)
│       └── depends on: Phaser scene, config values
│
├── 6. PlayerManager → Jane
│       ├── depends on: EventBus, config data, Phaser scene
│       └── Jane depends on: characterDataLoader, skillDataLoader, cosmeticDataLoader, factionDataLoader
│
├── 7. World Systems
│   ├── TilemapManager (depends on: seed, scene, WorldStateManager)
│   ├── RealityWarpSystem (depends on: TilemapManager)
│   ├── WorldStateManager (depends on: EventBus, TilemapManager)
│   └── LeyLineManager (depends on: TilemapManager seed, EventBus)
│
├── 8. MagnetoSpeeder (depends on: Phaser physics, scene)
│
├── 9. InputManager (depends on: Phaser input, scene)
│
├── 10. EnemyManager (depends on: EventBus, scene, EnemyRegistry)
│
├── 11. ModularGameLoop
│       └── registers 6 systems at priorities 1-5:
│           ├── player-update (priority 1) → PlayerManager.update()
│           ├── navigation-update (priority 1.5) → NavigationManager.update()
│           ├── speeder-movement (priority 1.6) → updateSpeederMovement()
│           ├── enemy-update (priority 2) → EnemyManager.update()
│           ├── ui-update (priority 3) → UIManager.update()
│           └── mission-update (priority 5) → MissionSystem.update()
│
├── 12. Manager Layer
│   ├── UIManager (depends on: EventBus, scene, LeyLineManager)
│   ├── NarrativeManager (depends on: EventBus, scene)
│   ├── WorldEditorManager (depends on: TilemapManager, scene)
│   ├── DevToolsManager (depends on: Jane, scene, various managers)
│   └── PluginManager (depends on: mod_loader)
│
├── 13. ASI Control
│   ├── TrustManager (depends on: EventBus, config {initialTrust: 50, decayRate: 1})
│   ├── ThreatDetector (depends on: EventBus, config {detectionRadius: 300})
│   ├── GuidanceEngine (depends on: EventBus, TrustManager, ThreatDetector)
│   └── CommandCenterUI (depends on: Phaser scene, TrustManager, GuidanceEngine, ThreatDetector)
│
├── 14. NavigationManager (depends on: EventBus, config, scene)
│       ├── SpeedTransitionController (internal)
│       ├── SideScrollCameraController (internal) 
│       └── HighSpeedTerrainSystem (internal)
│
├── 15. NPCManager (depends on: EventBus, scene)
├── 16. InventoryManager (depends on: EventBus, scene)
└── 17. DialogueManager (depends on: EventBus, scene)
```

---

## Coupling Hotspots

### Tier 1: Everything Depends On These

| System | Depended On By | Role |
|--------|---------------|------|
| **EventBus** | Every system | Message passing backbone |
| **Phaser.Scene** | Every visual system | Rendering, physics, input |
| **GameScene** | All systems (creates them) | God object orchestrator |

### Tier 2: Multiple Systems Depend On These

| System | Depended On By | Type |
|--------|---------------|------|
| **TilemapManager** | WorldStateManager, RealityWarpSystem, WorldEditorManager, LeyLineManager, ChunkLoader | World data hub |
| **TrustManager** | GuidanceEngine, CommandCenterUI | ASI trust state |
| **LeyLineManager** | UIManager, NavigationManager, Jane | Ley line queries |
| **PlayerManager/Jane** | GameScene (direct refs), DevToolsManager, multiple event consumers | Character state |

### Tier 3: Mostly Self-Contained

| System | Dependencies | Notes |
|--------|-------------|-------|
| **SpeedTransitionController** | Config only | Pure physics — no external deps |
| **SideScrollCameraController** | Phaser camera ref | Takes camera zoom/position |
| **HighSpeedTerrainSystem** | Config only | Pure terrain generation |
| **ulEngine** | Rule data only | Pure validation engine |
| **EnemyManager** | EventBus, scene | Self-contained spawn/AI/death |
| **MissionSystem** | EventBus only | Listens to events, manages state |

---

## Data Flow Paths

### Player Movement → World Update
```
Input (WASD) → GameScene.updateBasicPlayerMovement()
    → Jane.moveTo(x, y) → emits CHARACTER_MOVED, JANE_MOVED
    → ChunkLoader.updatePlayerPosition() → loads/unloads chunks
    → ThreatDetector listens CHARACTER_MOVED → scans for threats
    → GuidanceEngine listens JANE_MOVED → evaluates position
```

### Speeder Movement → Speed System
```
Input (arrows while mounted) → GameScene.updateSpeederMovement()
    → NavigationManager.getCurrentSpeed() → gets km/h
    → SpeedTransitionController provides adaptive speed
    → SideScrollCameraController adjusts zoom
    → HighSpeedTerrainSystem adjusts LOD
    → ChunkLoader adjusts chunk radius
    → GameScene applies velocity to speeder sprite (cap 800 px/s)
```

### ASI Guidance Loop
```
GuidanceEngine generates suggestions (tick-based)
    → CommandCenterUI displays suggestions
    → Player clicks suggestion → emits GUIDANCE_SELECTED
    → TrustManager records selection → emits trust modifier
    → GameScene receives ASI_GUIDANCE_GIVEN → sets guidance target
    → Jane moves toward target → arrival detected
    → GameScene emits JANE_RESPONSE (followed: true, +2 trust)
    → TrustManager updates trust → emits TRUST_CHANGED
    → GuidanceEngine adapts future suggestions to trust level
```

### Ley Line Instability → World Effects
```
WorldStateManager detects instability condition
    → emits LEYLINE_INSTABILITY (severity: minor/moderate/major)
    → ThreatDetector adds threat → emits THREAT_DETECTED
    → MissionSystem checks mission objectives
    → UIManager shows instability modal
    → If severity escalates → emits RIFT_FORMED
        → GameScene shows rift visual effect
        → MissionSystem may trigger rift-related objectives
```

---

## Disconnected Systems (Not Wired)

| System | Issue | Impact |
|--------|-------|--------|
| **SpeederManager** (`src/magneto/`) | Created in file but never called from GameScene. Events fire to nobody. | Speeder upgrades/energy have no gameplay effect |
| **SpeederUI** (`src/magneto/`) | `renderHUD()` outputs to `console.log()` | No speeder HUD visible |
| **JaneAI** (`src/ai/`) | Empty class, `updateAI()` never called | No autonomous behavior |
| **NarrativeEngine** | Thin delegation, no real consumers | No story delivery |
| **DialogueSystem** | Stub | No dialogue display |
| **CutsceneManager** | Stub | No cutscenes |
| **PsiSysRobot, AlternateJane** | Empty classes | No companions |
| **Speed keys 1-9, H** | Mentioned in welcome text but NOT bound | Phantom features |

---

## Module Boundary Analysis

### Clean Boundaries (Safe to Modify Independently)

| Module | Interface | Notes |
|--------|-----------|-------|
| Speed physics | `SpeedTransitionController.update(dt, pos?) → SpeedState` | Pure function, no side effects |
| Camera | `SideScrollCameraController.update(speed, position)` | Takes state, returns camera config |
| Terrain LOD | `HighSpeedTerrainSystem.update(speed, position)` | Pure streaming logic |
| UL Engine | `ulEngine.processAttempt(symbols) → result` | Pure validation |
| EventBus | `on(type, handler) / emit(event)` | Clean pub/sub |

### Tangled Boundaries (Changes Cascade)

| Module | Entanglement | Risk |
|--------|-------------|------|
| GameScene | References 17 managers directly, owns all input binding, owns speeder sprite | ANY change may break |
| TilemapManager | 4+ systems depend on it; mixes world data + rendering | Changes affect world, editor, persistence |
| Jane | EventBus emitter for 16 events; data model + movement + ASI + speeder in one class | Changes affect all listeners |
| LeyLineManager | Bridges procedural gen + pathfinding + energy + viz + events | 3 directories of ley line code depend on it |

---

## GameScene Direct References (What Needs Extraction)

These are fields directly accessed via `this.` in GameScene:

| Field | Type | Suggested Extraction Target |
|-------|------|-----------------------------|
| `this.playerManager` | PlayerManager | Keep (core) |
| `this.jane` | Jane | Keep (core) |
| `this.tilemapManager` | TilemapManager | Keep (core) |
| `this.speeder` | Phaser.Physics.Arcade.Sprite | → `SpeederController` |
| `this.speederInteractionHint` | Phaser.GameObjects.Text | → `SpeederController` |
| `this.isBoarded` | boolean | → `SpeederController` |
| `this.trustManager` | TrustManager | → `ASISceneIntegration` |
| `this.threatDetector` | ThreatDetector | → `ASISceneIntegration` |
| `this.guidanceEngine` | GuidanceEngine | → `ASISceneIntegration` |
| `this.commandCenterUI` | CommandCenterUI | → `ASISceneIntegration` |
| `this.guidanceTarget` | {x,y} | → `ASISceneIntegration` |
| `this.activeGuidanceId` | string | → `ASISceneIntegration` |
| `this.shieldWindowActive` | boolean | → `ASISceneIntegration` |
| `this.navigationManager` | NavigationManager | Keep (core) |
| `this.uiManager` | UIManager | Keep (core) |
| `this.enemyManager` | EnemyManager | Keep (core) |
| `this.npcManager` | NPCManager | Keep (core) |
| `this.inventoryManager` | InventoryManager | Keep (core) |
| `this.dialogueManager` | DialogueManager | Keep (core) |
| `this.modularGameLoop` | ModularGameLoop | Keep (core) |
| `this.worldEditorManager` | WorldEditorManager | → `SystemInitializer` |
| `this.devToolsManager` | DevToolsManager | → `SystemInitializer` |
| `this.pluginManager` | PluginManager | → `SystemInitializer` |
| `this.narrativeManager` | NarrativeManager | → `SystemInitializer` |
| All key bindings | Phaser.Input.Keyboard.Key | → `InputController` |
| `this.cursors` | CursorKeys | → `InputController` |
| `this.backgrounds` | TileSprite[] | → `TerrainSceneSetup` |
| `this.ground*` | Physics shapes | → `TerrainSceneSetup` |
