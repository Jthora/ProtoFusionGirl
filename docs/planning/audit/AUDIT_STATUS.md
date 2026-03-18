# ProtoFusionGirl Systems Audit Status (2025-08-09)

## Purpose
Living snapshot of the ongoing engine/system audit focused on: first-run playability, unified event architecture, input & UI responsiveness, and stabilization of existing tests over net-new features.

## Scope (Current Cycle)
- Startup / Bootstrap Flow
- EventBus consolidation & cross-system emissions
- Input → Player → Navigation → Terrain integration
- UI / ASI / Command Center visibility & feedback
- World state (ley lines, branches, persistence) correctness
- High-speed (supersonic/hypersonic) navigation side-effects
- Test gap: character data & world edit factories adoption

## Methodology
1. Enumerate all *Manager* classes & scene orchestrators.
2. Read source (no changes) capturing: responsibilities, dependencies, event surface, risks.
3. Classify priority (P0 = blocks playability, P1 = correctness / cohesion, P2 = enhancement).
4. Record immediate remediation actions (surgical, low-risk) vs. architectural tasks (bootstrap refactor).
5. Keep deltas incremental; verify tests after each change cluster.

## Completed Audits (Summarized)
| Component | Role | Key Findings | Priority | Immediate Action |
|-----------|------|--------------|----------|------------------|
| StartScene | Entry splash | Local start button OK; transitions to GameScene; no global bootstrap | P0 | Introduce GameBootstrap before scene switch |
| GameScene | Monolithic init | Instantiates its own EventBus; minimal UI mode hides feedback; ordering risk (enemy after player) | P0 | Refactor to consume shared bootstrap (single EventBus, UI defaults standard) |
| InputManager | Movement input | Keyboard/gamepad only; no pointer abstraction; singleton life-cycle tied to first scene | P0 | Extend for pointer + action mapping; ensure created via bootstrap |
| UIManager | Aggregates UI | Optional ASI overlay, minimal mode default; risk of user perceiving no feedback | P0 | Default to standard layout on first-run; ensure overlay events wired |
| ASIOverlay | Toggle ASI override | Emits+listens on local bus only; not guaranteed to connect to PlayerManager | P0 | Rebind to shared EventBus; ensure initial state emission |
| CommandCenterUI | ASI dashboard | Subscribes to trust/threat/guidance events; inert if events never fire | P0 | Seed initial trust + guidance events during bootstrap |
| style.css (.preloader) | Preloader overlay | High z-index; if not hidden intercepts input | P0 | Add safety timeout & force-hide after bootstrap complete |
| LoadingCoordinator | Multi-phase loader | Calls callback; does not instantiate core systems | P0 | Replace callback with bootstrap pipeline |
| NarrativeEngine (prior) | Narrative fallback | onAny events; debug logging left in; fallback events OK | P1 | Remove debug logs after bootstrap introduced |
| TileRegistry & integration tests | Tile defaults flag | includeDefaults option working; tests green | P2 | Add explicit defaults seeding test case |
| HighSpeedTerrainSystem | Speed-based terrain | Overload added; tests green | P2 | None immediate |
| LeyLineManager | Activation logic | Fixed mutation; tests green | P1 | Add instability propagation tests (later) |
| WorldEdit Factories | Test helpers | Added; tests not yet updated to use | P1 | Refactor WorldEdit tests to factory helpers |
| MultiverseEventEngine | Branch events | Gating removed; potential unchecked event names | P2 | Add validation utility (later) |
| WorldStateManager | Canonical state | Migration + ley line instability propagation emits; eventBus adaptation shim | P1 | Character fallback seeding path |
| TilemapManager | World tile ops | Creates internal WorldStateManager/EventBus (fragmentation risk) | P0 | Accept injected dependencies from bootstrap |
| PlayerManager | Player/Jane orchestration | Creates Jane + controller; listens for UL events; depends on provided EventBus | P0 | Ensure bootstrap passes shared EventBus & seeds Jane state |
| NavigationManager | Speed orchestration | Emits multiple speed events; relies on PlayerManager + UIManager | P1 | Confirm integration after bootstrap; add pointer instrumentation hook |
| AccessibilityManager | Option relay | Very thin wrapper | P3 | Potentially merge or expand; low urgency |
| SpeederManager | Energy + hazards | Emits speeder events; TODO patches for world state | P2 | Integrate with LeyLineManager in unified loop |
| OnboardingManager | Phase tracking | Stub only | P2 | Delay until core interaction fixed |
| InventoryManager | Item store | Local callbacks; no EventBus usage | P2 | Optional: emit INVENTORY_CHANGED |

## Pending Audits (Next Wave)

## Architectural Risks
1. EventBus Fragmentation: Multiple instances (GameScene, TilemapManager, systems) prevent UI & ASI from receiving gameplay events.
2. Invisible / Minimal UI First-Run: Suppresses feedback (speed, trust, interaction hints).
3. Input Scope Gap: No pointer action routing; initial clicks may do nothing post-start.
4. Preloader Overlay Persistence: Potentially intercepts pointer events if hide race occurs.
5. State Seeding Absence: Character/player data fallback not ensured; PlayerManager may attach sprite late or fail silently.
6. Bootstrap Ordering: Managers rely on each other (Navigation → Player → UI); ad hoc construction obscures failures.

## Immediate Remediation Plan (Execution Order)
- Added GameBootstrap singleton establishing shared EventBus, InputManager, WorldStateManager, TilemapManager injection point.
- Modified TilemapManager to accept injected dependencies (non-breaking, optional).
- Refactored GameScene to use shared bootstrap context and default UI mode to 'standard'.
- Added InteractionDiagnostics overlay (enable via ?diag=1; toggle visibility F9).
- Prepared path for migrating additional managers (Trust/Guidance/UI) into bootstrap Phase 2.
1. Introduce GameBootstrap singleton: constructs shared EventBus, InputManager, PlayerManager, WorldStateManager, TilemapManager (using injected bus), UIManager (standard layout), ASIOverlay, CommandCenterUI, TrustManager seed, NavigationManager.
2. Refactor GameScene to call bootstrap.ensureInitialized() and reference managers from bootstrap context instead of new instances.
3. Add InteractionDiagnostics overlay (FPS, pointer coords, pressed keys, ASI override state) — toggle via query flag or dev key.
4. Force-hide preloader after bootstrap complete + 3s safety timer.
5. Seed character/player fallback data if none loaded (ensures Jane spawn deterministic).
6. Update WorldEdit test files to use factories.
7. Remove NarrativeEngine debug logs, add optional verbose flag.
8. Add INVENTORY_CHANGED event emission.

## Test Impact Watchlist
- Player spawn tests (character data fallback)
- World edit tests (factory adoption pending)
- Tile registry integration (ensure dependency injection doesn't break includeDefaults behavior)
- Ley line instability (unchanged but touched by bootstrap if moving event bus)

## Metrics / Instrumentation To Add
- Boot time (ms) from window load to Jane active & input responsive
- EventBus listener counts by category (assert no duplicates after scene transitions)
- Pointer latency measurement (first pointerdown to corresponding action event)

## Open Questions
- Is there a legacy NarrativeManager distinct from NarrativeEngine needing consolidation?
- Should SpeedControlSystem events be throttled to reduce UI spam?
- Do we need branch-aware seeding for world state before or after bootstrap?

## Next Actions (This Session)
- Continue auditing remaining managers (batch 1: DialogueManager, NarrativeManager, EnemyManager, NPCManager, MissionManager).
- Append their summaries & priorities below.

---
## Per-Manager Summaries (Rolling)
(Entries above already populated; new audits appended here.)

### Newly Audited (Batch 1 Post-Doc Creation)
- DialogueManager: In-memory dialogue nodes, no EventBus usage, manual callbacks. Risk: isolated from global narrative/UI, safe to integrate later. Priority P2. Action: Emit DIALOGUE_STARTED and CHOICE_SELECTED events via shared EventBus after bootstrap.
- NarrativeManager (core): Wraps MissionManager + feedback text injection using eventBus.on('NARRATIVE_FEEDBACK'). Overlaps conceptually with NarrativeEngine fallback logic. Risk: dual narrative layers could diverge. Priority P1. Action: Plan consolidation path (decide one source of narrative events).
- EnemyManager: Spawns enemies and health bars, no shared EventBus emission for combat outcomes. Priority P1 for adding COMBAT_ENEMY_HIT/DEFEATED events to unify UI and analytics.
- NPCManager: Stores NPCs with npcUpdated events (lowercase) over EventBus. Consistency issue in event naming (others are uppercase). Priority P2. Action: Normalize to NPC_UPDATED and add initial NPC_REGISTERED emission.
- MissionManager: Mission/objective tracking; no EventBus integration; uses callback for completion. Priority P1. Action: Emit MISSION_STATUS_CHANGED and MISSION_COMPLETED events; integrate with NarrativeManager.

### Newly Audited (Batch 2)
- TechLevelManager: Local tech progression + unlock listing, no EventBus emissions (contrast with WorldStateManager.advanceTechLevel already emitting). Duplication risk. Priority P1. Action: Defer to WorldStateManager for canonical emits; wrap or remove standalone manager.
- TimelineManager: Pure scaffold. Priority P3. Action: None until timestream integration defined.
- StartingLocationManager: Generates leylines, selects start node, emits STARTING_LOCATION_SET. Risk: calls leyLineManager.generateProcedural each run (possible duplication) and random scoring (non-deterministic). Priority P1. Action: Seed RNG or inject randomness strategy; ensure idempotent generation if world already loaded.
- WarpZoneManager: In-memory zones + handler map; no EventBus hooks; safe isolation. Priority P2. Action: Emit WARP_ZONE_TRIGGERED with zone context.
- TimestreamManager: Branch/merge timeline stubs; random ID creation; no persistence or events. Priority P2. Action: Add serialize diff discipline + TIMELINE_BRANCH_CREATED events later.
- WorldEditorManager: Dev-only gating; builds editing toolchain on scene; heavy dynamic require. Priority P2. Action: Move enable check to bootstrap & attach visibility through UILayout/Modal rather than direct input listeners.
- DevToolsManager: Direct mutation methods; no safety gating (god mode toggle stub, etc.). Priority P2. Action: Add isDev guard & emit DEV_ACTION events for analytics.
- AnchorManager: Manages anchor trading UI, uses alerts (blocking), triggers MissionManager triggers (string keys). No EventBus usage; direct DOM injection. Priority P1. Action: Replace alert/prompt with ModalManager; emit ANCHOR_* events; centralize to shared EventBus.
- SplashScreenManager: DOM-based splash; independent of Phaser; high z-index (15000). Priority P1. Action: Integrate with bootstrap lifecycle & ensure forced teardown if gameplay already started.
- UXManager: Stub feature methods; logs only. Priority P3. Action: Convert to event-driven display controllers post-bootstrap.
- UILayoutManager: Robust zone layout + mode switching; defaults to 'standard'. Good separation; risk: GameScene forcing 'minimal'. Priority P0 (interaction). Action: Prevent forced minimal on first-run; integrate with bootstrap state.
- ModalManager: Queue system; independent; sets overlay depth near overlays. Priority P2. Action: Register with UILayout overlays zone & emit MODAL_OPENED/CLOSED events.

### Aggregate Cross-Cutting Additions (Post Batch 2)
Pending Event Names to Standardize/Introduce: DIALOGUE_STARTED, CHOICE_SELECTED, COMBAT_ENEMY_HIT, COMBAT_ENEMY_DEFEATED, NPC_UPDATED (uppercase), MISSION_STATUS_CHANGED, MISSION_COMPLETED, WARP_ZONE_TRIGGERED, ANCHOR_ADDED/EDITED/DELETED/TRADE_* variants, MODAL_OPENED/CLOSED, TECH_LEVEL_ADVANCED (canonical already), STARTING_LOCATION_SET (exists), TIMELINE_BRANCH_CREATED.

## Implementation Progress (Updates)
- Phase 1 COMPLETE (Bootstrap core systems, UI default, diagnostics overlay).
- Phase 2 started: EnemyManager now emits ENEMY_ATTACKED (contact damage) and ENEMY_DEFEATED; PlayerAttackController also emits ENEMY_DEFEATED (temporary redundancy until defeat emission centralized). GameScene passes shared EventBus into EnemyManager. First enemy spawn triggers COMBAT_STARTED via existing event type for downstream systems (ThreatDetector, MissionSystem).
- Upcoming: Migrate Navigation/Trust/Guidance creation into bootstrap second stage; normalize NPC/Mission/Anchor/Warp events; splash safety teardown; character fallback seeding & test alignment.

