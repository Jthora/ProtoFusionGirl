# EventBus Reference

> Complete catalog of every event type in the Proto FusionGirl EventBus. Generated from source code audit.

**Implementation**: `src/core/EventBus.ts` (70 lines) — Type-safe pub/sub with `on<T>()`, `emit<T>()`, `off()`, `once()`, `onAny()`. Returns unsubscribe function.

**Secondary bus**: `src/ul/ulEventBus.ts` (48 lines) — UL-specific events (puzzle:completed, etc.)

**Total distinct event types**: ~110  
**Properly typed**: ~85  
**Listened but never emitted**: 3  
**Emitted but not in EventTypes.ts**: ~13

---

## Jane / Character Events

| Event | Emitter(s) | Listener(s) | Payload |
|-------|-----------|-------------|---------|
| `JANE_LEVEL_UP` | Jane.ts | (tests only) | `{ level }` |
| `JANE_DAMAGED` | Jane.ts | (tests only) | `{ amount, health }` |
| `JANE_DEFEATED` | Jane.ts | TrustManager | `{}` |
| `JANE_HEALED` | Jane.ts | (tests only) | `{ amount, health }` |
| `JANE_PSI_USED` | Jane.ts | (tests only) | `{ amount, psi }` |
| `JANE_PSI_RESTORED` | Jane.ts | (tests only) | `{ amount, psi }` |
| `JANE_MOUNTED_SPEEDER` | Jane.ts | (tests only) | `{}` |
| `JANE_DISMOUNTED_SPEEDER` | Jane.ts | (tests only) | `{}` |
| `JANE_MOVED` | Jane.ts | GuidanceEngine, CommandCenterUI, GameScene | `{ x, y }` |
| `JANE_ASI_OVERRIDE` | Jane.ts | GameScene, ASIController | `{ enabled }` |
| `CHARACTER_MOVED` | Jane.ts | ThreatDetector, ASIControlIntegrationTest | `{ id, x, y }` |

**Note**: Most Jane events are emitted but only consumed by tests. Only `JANE_MOVED`, `JANE_DEFEATED`, `JANE_ASI_OVERRIDE`, and `CHARACTER_MOVED` have production listeners.

---

## Speeder / MagnetoSpeeder Events

| Event | Emitter(s) | Listener(s) | Payload |
|-------|-----------|-------------|---------|
| `SPEEDER_MODE_CHANGED` | Jane.ts | (tests only) | `{ mode: 'manual'|'auto' }` |
| `JANE_PSI_USED_FOR_SPEEDER` | Jane.ts | (tests only) | `{ psiAmount }` |
| `SPEEDER_MOVED` | Jane.ts | (tests only) | `{ x, y }` |
| `SPEEDER_ENERGY_UPDATED` | SpeederManager.ts | (tests only) | `{ energy }` |
| `SPEEDER_HAZARD` | SpeederManager.ts | (tests only) | `{ hazard, effect }` |
| `SPEEDER_ATTACK` | CombatSystem.ts | (tests only) | `{ type }` |
| `SPEEDER_PSI_ATTACK` | CombatSystem.ts | (tests only) | `{ type, psiCost }` |
| `SPEEDER_ATTACK_FAILED` | CombatSystem.ts | (tests only) | `{ reason }` |
| `SPEEDER_DAMAGED` | CombatSystem.ts | (tests only) | `{ amount, energy }` |
| `SPEEDER_DISABLED` | CombatSystem.ts | (tests only) | `{}` |

**Note**: SpeederManager is DISCONNECTED from GameScene. These events fire but nothing in the game loop listens.

---

## Combat / Enemy Events

| Event | Emitter(s) | Listener(s) | Payload |
|-------|-----------|-------------|---------|
| `COMBAT_STARTED` | (dynamic) | ThreatDetector, GuidanceEngine | `{ participants[] }` |
| `ENEMY_ATTACKED` | (implicit) | ThreatDetector | `{ attackerId, targetId, attackId, damage }` |
| `ENEMY_DEFEATED` | EnemyManager, PlayerAttackController | **MissionSystem** | `{ enemyId }` |
| `PLAYER_ATTACKED` | (implicit) | (tests only) | `{ attackerId, targetId, attackId, damage }` |
| `PLAYER_DEFEATED` | (implicit) | TrustManager | `{ playerId }` |

**Active wiring**: `ENEMY_DEFEATED` → MissionSystem (mission progress), `PLAYER_DEFEATED` → TrustManager (trust penalty).

---

## Mission Events

| Event | Emitter(s) | Listener(s) | Payload |
|-------|-----------|-------------|---------|
| `MISSION_STARTED` | MissionSystem | GuidanceEngine | `{ missionId }` |
| `MISSION_OBJECTIVE_COMPLETED` | MissionSystem | (tests only) | `{ missionId, objectiveId }` |
| `MISSION_COMPLETED` | MissionSystem | TrustManager, EconomySystem | `{ missionId }` |
| `MISSION_OUTCOME` | MissionSystem | (tests only) | `{ missionId, outcome }` |
| `PLAYER_USED_ABILITY` | PlayerStats | MissionSystem | `{ abilityId, playerId }` |
| `ITEM_COLLECTED` | (on collection) | MissionSystem | `{ itemId, ownerId }` |
| `RESOURCE_COLLECTED` | (on collection) | EconomySystem | `{ resourceId, amount }` |

---

## Ley Line Events

| Event | Emitter(s) | Listener(s) | Payload |
|-------|-----------|-------------|---------|
| `LEYLINE_ACTIVATED` | LeyLineEvents | (tests only) | `{ leyLineId }` |
| `LEYLINE_SURGE` | LeyLineEvents, GameScene | **MissionSystem**, GameScene | `{ leyLineId, magnitude?, affectedTiles?, triggeredBy? }` |
| `LEYLINE_DISRUPTION` | LeyLineEvents, WorldStateManager | **MissionSystem**, GameScene, **UIManager** | `{ leyLineId, affectedTiles?, triggeredBy? }` |
| `LEYLINE_MANIPULATION` | LeyLineEvents | (tests only) | `{ leyLineId, status }` |
| `LEYLINE_INSTABILITY` | LeyLineEvents, WorldStateManager | **MissionSystem**, **ThreatDetector**, GameScene, **UIManager** | `LeyLineInstabilityEvent` |
| `RIFT_FORMED` | WorldStateManager | **MissionSystem**, **ThreatDetector**, GameScene, **UIManager** | `{ leyLineId, nodeId?, severity, timestamp }` |
| `LEYLINE_ENTERED` | NavigationManager | NavigationManager (internal) | `{ leyLineId }` |
| `LEYLINE_EXITED` | NavigationManager | NavigationManager (internal) | `{ leyLineId }` |
| `LEYLINE_SPEED_BOOST_ACTIVE` | NavigationManager | (unclear) | `{ boostMultiplier, timestamp }` |
| `LEYLINE_SPEED_BOOST_INACTIVE` | NavigationManager | (unclear) | `{ timestamp }` |

**Most connected system**: Ley line events wire into MissionSystem, ThreatDetector, UIManager, and GameScene.

---

## Speed / Navigation Events

| Event | Emitter(s) | Listener(s) | Payload |
|-------|-----------|-------------|---------|
| `SPEED_UPDATE` | NavigationManager | **SpeedControlUI** | `{ speedKmh, category, mach?, isAccelerating? }` |
| `SPEED_MODE_CHANGED` | SpeedControlSystem | **SpeedControlUI** | `{ mode, previousMode? }` |
| `SPEED_CATEGORY_CHANGED` | SpeedControlUI (listener) | (tests only) | `{ previousCategory, newCategory, speedKmh }` |
| `HYPERSONIC_MODE_TOGGLED` | SpeedControlSystem | **SpeedControlUI** | `{ enabled }` |
| `QUICK_SPEED_SET` | SpeedControlSystem | (tests only) | `{ speedKmh, level? }` |
| `EMERGENCY_STOP` | SpeedControlUI | (unclear) | `{ reason?, speedBefore? }` |
| `EMERGENCY_DECELERATION_REQUEST` | (pending) | NavigationManager | `{ reason? }` |
| `SPEED_CATEGORY_TRANSITION` | (example only) | (example only) | `{ previousCategory, newCategory, speedKmh }` |
| `SUPERSONIC_ENTRY` | (example only) | (example only) | `{ speedKmh, mach }` |
| `HYPERSONIC_ENTRY` | (example only) | (example only) | `{ speedKmh, mach, warpBoomArmed? }` |
| `WARP_BOOM_ACTIVATED` | (example only) | (example only) | `{ speedKmh, mach, energyCost? }` |

**Note**: Many speed events exist only in NavigationManagerIntegration.example.ts — they're designed but not wired into production code.

---

## ASI / AI Control Events

| Event | Emitter(s) | Listener(s) | Payload |
|-------|-----------|-------------|---------|
| `ASI_GUIDANCE_GIVEN` | CommandCenterUI, GameScene | CommandCenterUI, GameScene | `{ suggestion, context }` |
| `GUIDANCE_SELECTED` | CommandCenterUI | **TrustManager**, **GuidanceEngine** | `{ suggestion, timestamp }` |
| `JANE_RESPONSE` | GameScene | **TrustManager** | `{ guidanceId, followed, responseTime, trustChange }` |
| `TRUST_CHANGED` | TrustManager | **CommandCenterUI**, **GuidanceEngine** | `{ previousLevel, currentLevel, change, trend }` |
| `THREAT_DETECTED` | ThreatDetector | **CommandCenterUI**, **GuidanceEngine**, GameScene | `{ threat }` |
| `THREAT_RESOLVED` | (threat handling) | CommandCenterUI | `{ threatId, resolution }` |
| `MAGIC_CAST` | (player action) | TrustManager | `{ symbolId, targetPosition, success, trustLevel }` |
| `ASI_MODE_CHANGED` | CommandCenterUI | (tests only) | `{ previousMode, newMode }` |
| `SHIELD_WINDOW_STARTED` | GameScene | CommandCenterUI | `{ timestamp, cooldownUntil }` |
| `SHIELD_WINDOW_ENDED` | GameScene | CommandCenterUI | `{ timestamp, cooldownUntil }` |

**Core feedback loop**: `GUIDANCE_SELECTED` → `JANE_RESPONSE` → `TRUST_CHANGED` → (adjusts future guidance behavior). This is the most tightly integrated event chain in the codebase.

---

## Universal Language Events

| Event | Emitter(s) | Listener(s) | Payload |
|-------|-----------|-------------|---------|
| `ul:puzzle:completed` | ulEngine | **MissionSystem**, ASIController, **PlayerManager**, **WorldStateManager** | `{ id, metadata?, result? }` |
| `ul:puzzle:validated` | ulEngine | **MissionSystem**, ASIController, **PlayerManager**, **WorldStateManager** | `{ id, result, errors? }` |
| `ul:puzzle:loaded` | (ulEventBus) | (tests/integration) | `ULEventPayload` |
| `ul:puzzle:started` | (ulEventBus) | (tests/integration) | `ULEventPayload` |
| `ul:puzzle:attempted` | (ulEventBus) | (tests/integration) | `ULEventPayload` |
| `ul:context:sync` | (ulEventBus) | (tests/integration) | `ULEventPayload` |
| `ul:symbol:loaded` | (ulEventBus) | (tests/integration) | `ULEventPayload` |
| `ul:animation:loaded` | (ulEventBus) | (tests/integration) | `ULEventPayload` |

**Note**: `ul:puzzle:completed` and `ul:puzzle:validated` are the most connected UL events — they wire into 4 production systems each.

---

## UI / Overlay Events

| Event | Emitter(s) | Listener(s) | Payload |
|-------|-----------|-------------|---------|
| `OVERLAY_SHOW` | AgentOptimizedUI | AgentOptimizedUI | `OverlayConfig` |
| `OVERLAY_HIDE` | (UI systems) | AgentOptimizedUI | `{ id }` |
| `NOTIFICATION_SHOW` | (UI systems) | AgentOptimizedUI | `{ role, message, context? }` |
| `MINIMAP_LEYLINE_UPDATE` | (leyline systems) | Minimap | `{ leyLines[], eventOverlays? }` |
| `GAMELOOP_POST_UPDATE` | ModularGameLoop | (any listener) | `{ dt }` |

---

## Orphaned Events (Listened but Never Emitted)

| Event | Listener | Expected Purpose |
|-------|----------|-----------------|
| `UL_ANIMATION` | PlayerManager | Should trigger UL animations on player — never emitted |
| `UL_FEEDBACK` | PlayerManager | Should show UL feedback — never emitted |
| `NARRATIVE_FEEDBACK` | NarrativeManager | Should trigger narrative responses — never emitted |

---

## Unregistered Events (Emitted but Not in EventTypes.ts)

| Event | Source | Issue |
|-------|--------|-------|
| `ASI_OVERRIDE_REQUESTED` | ASIController | Missing from type definitions |
| `ASI_INTERVENTION` | ASIController | Missing from type definitions |
| `BRANCH_REPAIR_REQUESTED` | RepairMigrationWizard | Missing, no listener |
| `BRANCH_MIGRATION_REQUESTED` | RepairMigrationWizard | Missing, no listener |
| `BRANCH_DIFF_REQUESTED` | MultiverseExplorerPanel | Missing, no listener |
| `BRANCH_MERGE_REQUESTED` | MultiverseExplorerPanel | Missing, no listener |
| `npcUpdated` | NPCManager | Custom string, not in EventTypes |

---

## Key Integration Chains

### ASI Trust Loop
```
GUIDANCE_SELECTED → GuidanceEngine evaluates
    → ASI_GUIDANCE_GIVEN → GameScene moves Jane toward target
        → JANE_RESPONSE (followed: true/false) → TrustManager adjusts trust
            → TRUST_CHANGED → GuidanceEngine adapts suggestion style
```

### Ley Line → World State
```
LEYLINE_INSTABILITY → WorldStateManager escalates
    → LEYLINE_DISRUPTION → UIManager shows modal
    → RIFT_FORMED → ThreatDetector adds threat, MissionSystem updates
```

### UL Puzzle → Game Effects
```
ul:puzzle:completed → MissionSystem (mission progress)
                    → PlayerManager (UL animation)
                    → WorldStateManager (world state change)
                    → ASIController (trust effect)
```

### Combat → Missions → Economy
```
ENEMY_DEFEATED → MissionSystem checks objectives
    → MISSION_OBJECTIVE_COMPLETED → (check all objectives)
        → MISSION_COMPLETED → TrustManager (+trust), EconomySystem (rewards)
```
