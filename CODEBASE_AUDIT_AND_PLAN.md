# ProtoFusionGirl — Full Codebase Audit & Execution Plan

**Date**: March 15, 2026 (Updated: March 15, 2026)  
**Context**: The Universal Language Rust+WASM module is **complete and available** at https://github.com/Jthora/universal_language. The `@ul-forge/core` npm package provides 23 typed WASM functions covering the full Σ_UL pipeline. This plan focuses on finishing Proto FusionGirl as a tight, shippable MagnetoSpeeder experience with real UL WASM integration.

---

## 1. Codebase Census

| Metric | Value |
|--------|-------|
| Total TS/TSX/JS files in `src/` | 527 |
| Total lines in `src/` | 44,287 |
| Test files (`.test.*`) | 117 |
| Test suites passing | 95/117 |
| Test suites failing | 22/117 |
| Tests passing | 598/609 |
| Tests failing | 11/609 |
| `: any` usages | 494 |
| TODO comments | 236 |
| Artifact files | 264 |
| Task files | 120 |
| Script files | 69 |
| Documentation files | 211 |

---

## 2. System-by-System Status

### TIER 1: Solid — Keep & Polish (5,872 lines of implementation + 2,600 lines of tests)

These systems are **real, tested, and form the core game**:

| System | Key Files | Impl Lines | Tests | Status |
|--------|-----------|----------:|-------|--------|
| **Navigation** | `NavigationManager`, `SpeedControlSystem`, `SpeedCategories`, `ThrottleController`, `BoostSystem`, `FastTravelManager`, `SpeedControlUI` | 1,691 | 7 suites, all pass | Excellent |
| **Terrain** | `HighSpeedTerrainSystem`, `HybridTerrainSystem`, `SimpleBiomeClassifier`, `SimpleTerrainCache`, `ElevationCache`, `LeylineGeoSlice` | 2,430 | 11 suites, all pass | Excellent |
| **Tilemap/World Edit** | `TilemapManager`, `ChunkLoader/Manager`, `TileRegistry`, `WorldGen V1/V2/V3`, `WorldPersistence`, `WorldEditService`, editing tools | 3,200 | 20 suites, 15 pass, 5 fail | Good (test fixes needed) |
| **Camera** | `SideScrollCameraController` | 281 | 1 suite, passes | Excellent |
| **Speed Transition** | `SpeedTransitionController` | 318 | 1 suite, fails | Good (test fix needed) |
| **Speed Indicator UI** | `SpeedIndicatorUI` | 334 | 1 suite, passes | Excellent |
| **Ley Line Energy** | `LeylineEnergySystem` | 504 | 1 suite, fails | Good (test fix needed) |
| **EventBus** | `EventBus`, `EventTypes` | 360 | Pass | Excellent |
| **ModularGameLoop** | `ModularGameLoop` | 48 | 1 suite, passes | Excellent |
| **Jane** | `Jane.ts` (core) | 300 | 1 suite, 2 tests fail (faction/cosmetics loading) | Good (data loading fix) |
| **Player** | `PlayerController`, `PlayerStats`, `PlayerAttackController`, `PlayerFactory` | 451 | Passes | Good |
| **AI Systems** | `JaneAI`, `CompanionAI`, `BoredomSystem`, `EmotionSystem`, `RefusalSystem`, `RobotSummonManager`, `Terra`, `ULObservationSystem` | 1,050 | 8 suites, all pass | Excellent |

### TIER 2: Real Framework — Needs Completion (3,500 lines)

These have real architecture but need gameplay content:

| System | Key Files | Impl Lines | Gap |
|--------|-----------|----------:|-----|
| **ASI Control** | `TrustManager`, `ThreatDetector`, `GuidanceEngine`, `CommandCenterUI` | 2,199 | GuidanceEngine helpers return null; needs real guidance strategies |
| **Ley Line Network** | `LeyLineManager`, `ProceduralGen`, `Pathfinder`, `Visualization`, `Events` | 699 | Pathfinder `findPath()` returns placeholder; visualization thin |
| **Missions** | `MissionSystem`, `MissionManager`, `MissionHandlers`, `sampleMissions` | 733 | Two parallel systems; need unification and real mission content |
| **Timestream** | `TimestreamFramework`, `TimestreamManager`, `TimeMapVisualizer`, `WarpZoneManager` | 570 | Two parallel frameworks; UI is `alert()` based; needs real integration |
| **Universal Language** | `ulEngine`, `ulWasmAdapter`, `symbolIndex`, `ULPuzzleManager`, `ULPuzzleRules`, `ulResourceLoader`, `ulCanonicalTypes/Schemas` | 2,445 | 3 test suites failing; WASM module (`@ul-forge/core`) now available — ready for integration |
| **Combat** | `CombatSystem`, `CombatService`, `AttackRegistry`, `AttackDefinition` | 131 | Works for basic damage; no target resolution, no abilities |
| **Scenes** | `GameScene`, `SpeederController`, `ASISceneIntegration`, `TerrainSceneSetup`, `LeyLineSceneIntegration` | 1,826 | GameScene still large (970 lines) but improved from 1,675 |

### TIER 3: Scaffold — Empty or Near-Empty (< 50 lines each)

| System | File(s) | Lines | Decision |
|--------|---------|------:|----------|
| `PsiAbilities` | `src/combat/PsiAbilities.ts` | 6 | **CUT** — empty class |
| `AlternateJane` | `src/companions/AlternateJane.ts` | 6 | **CUT** — empty class |
| `PsiSysRobot` | `src/companions/PsiSysRobot.ts` | 6 | **CUT** — empty class |
| `CutsceneManager` | `src/narrative/CutsceneManager.ts` | 6 | **CUT** — empty class |
| `DialogueSystem` | `src/narrative/DialogueSystem.ts` | 6 | **CUT** — empty class |
| `StoryEvents` | `src/narrative/StoryEvents.ts` | 6 | **CUT** — empty class |
| `NarrativeEngine (core)` | `src/core/NarrativeEngine.ts` | 6 | **CUT** — empty class (real one is `src/narrative/NarrativeEngine.ts`) |
| `Inventory (core)` | `src/core/Inventory.ts` | 6 | **CUT** — empty class (real one is `src/world/inventory/Inventory.ts`) |
| `Accessibility (core)` | `src/core/Accessibility.ts` | 6 | **CUT** — empty class |
| `SkillTree` | `src/core/SkillTree.ts` | 10 | **CUT** — 3 TODOs, no implementation |
| `UniversalMagic` | `src/core/UniversalMagic.ts` | 41 | **CUT** — interfaces only, parser returns null |
| `GamepadInput` | `src/core/controls/GamepadInput.ts` | 16 | **CUT** — all stubs returning 0/false |
| `OnboardingManager` | `src/onboarding/OnboardingManager.ts` | 21 | **CUT** — all TODO stubs |
| `SelfHealingEngine` | `src/automation/SelfHealingEngine.ts` | 52 | **CUT** — all TODO stubs |
| `UXManager` | `src/ui/UXManager.ts` | 33 | **CUT** — all TODO stubs |
| `SpeederUI` | `src/magneto/SpeederUI.ts` | 36 | **CUT** — renderHUD is a stub |
| `SpeederUpgradeSystem` | `src/magneto/SpeederUpgradeSystem.ts` | 40 | **CUT** — no upgrade data |
| `ModdingAPI` | `src/modding/ModdingAPI.ts` | 25 | **CUT** — minimal, real modding is in `mods/mod_loader.ts` |
| `EconomySystem` | `src/world/economy/EconomySystem.ts` | 36 | **CUT** — one hardcoded reward |

### TIER 4: Dead Code — Delete Entirely

| What | Files | Reason |
|------|-------|--------|
| **`src/mvp/`** (entire directory) | 6 files, 0 bytes | All empty shadow files of `asiControl/` |
| **`src/main_new.ts`** | 1 file, 0 bytes | Abandoned refactor |
| **`src/lang/`** | 1 `.keep` file | Empty directory |
| **`src/legacy/leyLines.ts`** | 1 file, 5 lines | Deprecated stub |
| **`src/core/ChunkLoader.ts`** | 1 file, 71 lines | Deprecated duplicate |
| **`src/world/tilemap/WorldEvents.ts`** | 1 file, 25 lines | Deprecated EventBus copy |
| **`src/customization/`** | 2 files, 0 bytes | Both empty |
| **`src/tests/GameScene.test.ts`** | 1 file | `expect(true).toBe(true)` |
| **`src/tests/mod_loader.test.ts`** | 1 file | `expect(true).toBe(true)` |
| **`src/mods/sample_mod.json`** | 1 file, 0 bytes | Empty JSON |

### TIER 5: Shim Layer — Consolidate or Remove

These 2-line re-export files create a confusing double-address for the same modules:

| Shim File | Points To | Decision |
|-----------|-----------|----------|
| `src/camera/SideScrollCameraController.ts` | `src/world/camera/...` | **REMOVE** — update imports |
| `src/speed/SpeedTransitionController.ts` | `src/world/speed/...` | **REMOVE** — update imports |
| `src/terrain/HighSpeedTerrainSystem.ts` | `src/world/terrain/...` | **REMOVE** — update imports |
| `src/leylines/LeylineEnergySystem.ts` | `src/world/leylines/...` | **REMOVE** — update imports |
| `src/ui/SpeedIndicatorUI.ts` | `src/world/ui/...` | **REMOVE** — update imports |
| `src/characters/Jane.ts` | `src/core/Jane.ts` | **REMOVE** — update imports |
| `src/core/index.ts` | exports `UniversalMagic` only | **REMOVE** (when UniversalMagic cut) |

### TIER 6: Bloat — Tech Level Scaffold Tree

`src/world/tech/levels/` contains **~130 files** averaging **~9 lines each**. 15 tech eras × 7-8 files per era (Main, Lore, Modding, Risks, TestPlan, Triggers, Unlocks, index). All are static string/array exports with no executable logic. `TestPlan.ts` files contain text descriptions, not real tests.

**Decision**: Collapse into a single `tech_levels.json` data file + one `TechLevelEngine.ts` that reads it. Delete the 130-file scaffold tree.

---

## 3. The 22 Failing Test Suites — Root Cause Analysis

| # | Failing Suite | Root Cause | Fix |
|---|---------------|-----------|-----|
| 1 | `test/characters/Jane.test.ts` | Cosmetics/faction loaders return empty when JSON imported via require | Fix data loader path resolution in test env |
| 2 | `test/combat/AttackLoader.test.ts` | `attacks.json` is imported as undefined | Fix JSON import in test config |
| 3 | `test/core/FactionSystem.test.ts` | Same data loading issue as Jane | Fix data loader |
| 4 | `test/core/UIManager.test.ts` | Phaser mock incomplete | Update mock |
| 5 | `test/core/Jane_LeyLineManager.integration.test.ts` | Integration dependencies not wired | Fix wiring |
| 6 | `test/leyline/LeyLineEvents.integration.test.ts` | Event types mismatch | Fix event name constants |
| 7 | `test/navigation/NavigationManager.enhanced.test.ts` | **0 tests** — empty file | Delete or write tests |
| 8 | `test/customization/Cosmetics.test.ts` | **0 tests** — empty file | Delete |
| 9 | `test/ui/Minimap_LeyLineOverlay.integration.test.ts` | Phaser mock incomplete | Fix mock |
| 10 | `src/mvp/systems/MVP.test.ts` | **0 bytes** — dead file | Delete (with all of mvp/) |
| 11 | `src/tests/integration.test.ts` | Complex Phaser integration mocking broken | Fix mocks or simplify |
| 12 | `src/ul/__tests__/ulEngine.test.ts` | UL engine decode/validate changes | Fix tests to match current API |
| 13 | `src/ul/__tests__/ulPuzzle.test.ts` | Puzzle template lookup changed | Fix test expectations |
| 14 | `src/ul/__tests__/ulResourceLoader.test.ts` | Resource loader API changed | Fix tests |
| 15 | `src/world/leylines/__tests__/LeylineEnergySystem.test.ts` | Config/constructor changes | Fix test setup |
| 16 | `src/world/missions/MissionSystem.test.ts` | Event-driven API evolution | Fix test wiring |
| 17 | `src/world/speed/__tests__/SpeedTransitionController.test.ts` | Constructor/API changes | Fix test setup |
| 18 | `src/world/tilemap/TileClipboard.test.ts` | Copy/paste API signature changed | Fix test calls |
| 19 | `src/world/tilemap/TileSelectionOverlay.test.ts` | Selection overlay constructor needs Phaser | Add mock |
| 20 | `src/world/tilemap/WorldEditPermissions.test.ts` | Permission mode API changed | Fix test expectations |
| 21 | `src/world/tilemap/WorldEditService.test.ts` | Service constructor changed | Fix test setup |
| 22 | `src/world/tilemap/WorldPersistence.test.ts` | Persistence API evolved | Fix test expectations |

**Pattern**: Most failures are (a) data loading path issues in test env, (b) API changes not reflected in tests, or (c) empty test files. No deep architectural problems.

---

## 4. Infrastructure Bloat Assessment

| Category | Lines | % of Total | Recommendation |
|----------|------:|:----------:|----------------|
| Error infrastructure (`ErrorLogger`, `StartupErrors`, `ASIErrors`, `ASIHealthMonitor`, etc.) | 4,932 | 11.1% | **KEEP** but demote priority — this is production infrastructure, real but overbuilt for current game state |
| Tech level scaffolds (130 files) | ~1,210 | 2.7% | **COLLAPSE** to single data file |
| Artifacts (264 files) | N/A | meta | **ARCHIVE** — move to `archive/artifacts/`, keep only active ones |
| Tasks (120 files) | N/A | meta | **ARCHIVE** — move to `archive/tasks/`, keep only active ones |
| Scripts (69 files) | N/A | meta | **AUDIT** — keep build/test scripts, archive AI/onboarding scaffolding scripts |
| Docs (211 files) | N/A | meta | **KEEP** — game design documents are valuable reference |

---

## 5. The Execution Plan

### Phase 0: Cleanup (1-2 sessions)

**Goal**: Remove dead weight. No functionality changes.

- [ ] **0.1** Delete `src/mvp/` (6 empty files)
- [ ] **0.2** Delete `src/main_new.ts`, `src/lang/`, `src/legacy/leyLines.ts`, `src/customization/` (5 files)
- [ ] **0.3** Delete dead test files: `src/tests/GameScene.test.ts`, `src/tests/mod_loader.test.ts`, `src/mods/sample_mod.json`
- [ ] **0.4** Delete empty test suites: `test/customization/Cosmetics.test.ts`, `test/navigation/NavigationManager.enhanced.test.ts`
- [ ] **0.5** Delete Tier 3 scaffolds (19 files — PsiAbilities, AlternateJane, PsiSysRobot, CutsceneManager, DialogueSystem, StoryEvents, core/NarrativeEngine, core/Inventory, core/Accessibility, SkillTree, UniversalMagic, GamepadInput, OnboardingManager, SelfHealingEngine, UXManager, SpeederUI, SpeederUpgradeSystem, ModdingAPI, EconomySystem)
- [ ] **0.6** Remove shim files (7 files) and update all imports to point directly at real locations
- [ ] **0.7** Delete deprecated duplicates: `src/core/ChunkLoader.ts`, `src/world/tilemap/WorldEvents.ts`
- [ ] **0.8** Collapse tech level tree: Extract data to `src/world/tech/tech_levels_full.json`, delete 130 scaffold files, update `TechLevelEngine.ts` to read from JSON
- [ ] **0.9** Archive old artifacts/tasks: `mkdir -p archive && mv artifacts/ archive/ && mv tasks/ archive/`
- [ ] **0.10** Run tests — should have fewer failures (3 empty-suite failures gone, mvp/ gone)

**Expected result**: ~170 fewer files, ~1,500 fewer lines, 3-5 fewer test failures.

### Phase 1: Fix Failing Tests (1-2 sessions)

**Goal**: Green test suite. 0 failures.

- [ ] **1.1** Fix JSON data loading in test environment (attacks.json, characters.json, cosmetics.json, factions.json) — likely a `jest.config.mjs` transform/moduleNameMapper issue
- [ ] **1.2** Fix Jane.test.ts faction/cosmetics loading (depends on 1.1)
- [ ] **1.3** Fix AttackLoader.test.ts (depends on 1.1)
- [ ] **1.4** Fix FactionSystem.test.ts (depends on 1.1)
- [ ] **1.5** Fix tilemap tests (TileClipboard, TileSelectionOverlay, WorldEditPermissions, WorldEditService, WorldPersistence) — update test constructors/API calls to match current code
- [ ] **1.6** Fix UL tests (ulEngine, ulPuzzle, ulResourceLoader) — update test expectations to match current API
- [ ] **1.7** Fix UIManager.test.ts and Minimap integration test — update Phaser mocks
- [ ] **1.8** Fix LeylineEnergySystem.test.ts and SpeedTransitionController.test.ts — update constructor calls
- [ ] **1.9** Fix MissionSystem.test.ts — update event-driven wiring
- [ ] **1.10** Fix integration.test.ts or mark as skip with TODO to rewrite
- [ ] **1.11** Fix LeyLineEvents.integration.test.ts and Jane_LeyLineManager.integration.test.ts
- [ ] **1.12** Verify: `npm test:full` → 0 failures

**Expected result**: 117 suites, 0 failures, ~600+ tests passing.

### Phase 2: GameScene Decomposition (2-3 sessions)

**Goal**: Break the 970-line god object into composable scene modules.

- [ ] **2.1** Extract `PlayerSceneSetup` — player creation, physics, input wiring
- [ ] **2.2** Extract `WorldSceneSetup` — tilemap, chunks, terrain, ley lines
- [ ] **2.3** Extract `UISceneSetup` — all HUD elements, overlays, modals, text
- [ ] **2.4** Extract `SystemsSceneSetup` — ModularGameLoop registration, ASI, missions, combat
- [ ] **2.5** GameScene becomes a thin coordinator calling the 4 setup modules + update delegation
- [ ] **2.6** Remove `(this as any)` patterns — use proper typed interfaces
- [ ] **2.7** Kill `__keepRefsForTypeChecker()` hack
- [ ] **2.8** Update GameScene tests to use the decomposed modules

**Expected result**: GameScene.ts < 200 lines. Each setup module < 300 lines. All typed.

### Phase 3: Core Gameplay Polish (3-5 sessions)

**Goal**: Make the MagnetoSpeeder flight experience feel incredible. Add one complete mission arc.

- [ ] **3.1** Polish speeder physics — acceleration curves, drift, inertia at high speed
- [ ] **3.2** Visual effects — speed lines, terrain blur, ley line glow corridors, camera shake
- [ ] **3.3** Audio integration — engine sounds that scale with speed, ley line hum, boost whoosh
- [ ] **3.4** Ley line interaction — enter ley corridor → speed boost + energy recharge + visual effect
- [ ] **3.5** Combat polish — 2-3 enemy types with different behaviors, health drops, death animations
- [ ] **3.6** Create "Awaken in the Rift" mission arc (from sampleMissions) as a complete play-through:
  - Tutorial: WASD movement → board speeder → fly to waypoint
  - Discovery: Follow ley line to ancient node
  - Combat: Defend node from 3 waves of enemies
  - Resolution: Activate node → ley line stabilizes → area unlocked
- [ ] **3.7** Unify mission systems: Pick ONE (MissionSystem is more developed) and wire it end-to-end
- [ ] **3.8** Save/load that actually persists — tie SaveSystem to localStorage + Jane + inventory + missions
- [ ] **3.9** Win condition — completing the mission arc shows completion screen

### Phase 4: UL WASM Integration (3-5 sessions)

**Goal**: Replace the TypeScript UL stub engine with the real `@ul-forge/core` Rust+WASM module.

**Source**: https://github.com/Jthora/universal_language  
**Packages**: `@ul-forge/core` (23 typed WASM functions), `@ul-forge/sdk` (standalone typed SDK)  
**Status**: Complete and available.

#### 4.0 — Understand the API Surface

The real WASM module exposes **23 functions** organized in 6 groups. ProtoFusionGirl has a dedicated game crate (`ul-game`) designed for it:

| Group | Functions | ProtoFusionGirl Use |
|-------|-----------|---------------------|
| **Core Pipeline** | `parseUlScript`, `deparseGir`, `validateGir`, `renderSvg`, `renderGlyphPreview` | Parse player glyph input → GIR, validate Σ_UL constraints, render glyphs |
| **Game Context** | `init`, `createContext`, `evaluate`, `scoreComposition`, `evaluateJaneAttempt`, `validateSequence` | Game session context, evaluate puzzle attempts, score compositions, Jane's learning system |
| **Layout** | `layout`, `getAnimationSequence` | **PositionedGlyph** data for Phaser sprites (NOT SVG), animation keyframes |
| **Algebraic Composer** | `applyOperation`, `composeGir`, `detectOperations`, `analyzeStructure`, `compareGir` | All 11 Σ_UL operations, structural analysis |
| **Teaching System** | `getHints`, `analyzeHints`, `getNextPuzzle` | Contextual hints, proficiency-adaptive puzzle progression |
| **Lexicon** | `queryLexicon`, `lookupLexiconEntry` | In-game lexicon/encyclopedia |
| **Modding** | `loadCustomDefinitions` | Load custom symbol/rule definitions from mods |

Key data types from `@ul-forge/core`:
```typescript
type Sort = "entity" | "relation" | "modifier" | "assertion";
type NodeType = "point" | "line" | "angle" | "curve" | "enclosure";
type EnclosureShape = "circle" | "triangle" | "square" | "ellipse" | "polygon" | "freeform";
type OperationName = "predicate" | "modify_entity" | "modify_relation" | "negate" |
                     "conjoin" | "disjoin" | "embed" | "abstract" | "compose" | "invert" | "quantify";
interface Gir { ul_gir: string; root: string; nodes: Node[]; edges: Edge[]; metadata?: GirMetadata; }
interface ValidationResult { valid: boolean; errors: string[]; warnings: string[]; layers: ValidationLayers; }
interface EvaluationResult { /* game evaluation of a GIR */ }
interface PositionedGlyph { elements: PositionedElement[]; connections: LayoutConnection[]; }
// PositionedElement has { node_id, x, y, shape } — ready for Phaser sprites, NOT SVG
```

#### 4.1 — Install and Configure

- [ ] **4.1.1** Install: `npm install @ul-forge/core` (or `@ul-forge/sdk` if published)
- [ ] **4.1.2** Configure Vite for WASM: add `vite-plugin-wasm` and `vite-plugin-top-level-await` to `vite.config.ts`
- [ ] **4.1.3** Configure Jest for WASM: add WASM transform/mock to `jest.config.mjs` (the WASM binary won't load in jsdom — tests need a mock or Node WASM loading)
- [ ] **4.1.4** Verify: `import { initialize, parse } from '@ul-forge/core'; await initialize(); const gir = parse('●');` works in a test

#### 4.2 — Rewrite the WASM Adapter

Current `IULWasmEngine` has 6 methods (parse, validate, evaluate, compose, embed, abstract). The real API has 23 functions. Rewrite:

- [ ] **4.2.1** Rewrite `src/ul/ulWasmAdapter.ts`:
  - Replace `IULWasmEngine` with a new interface wrapping the real `@ul-forge/core` API:
    ```typescript
    import { initialize, parse, validate, render, deparse, createContext, evaluate,
             scoreComposition, evaluateJaneAttempt, validateSequence, getAnimationSequence,
             layout, applyOperation, composeGir, detectOperations, analyzeStructure,
             getHints, getNextPuzzle, queryLexicon, loadCustomDefinitions
    } from '@ul-forge/core';
    import type { Gir, ValidationResult, EvaluationResult, PositionedGlyph } from '@ul-forge/core';
    ```
  - Keep `ULStubEngine` as fallback (for when WASM fails to load / test env)
  - `ULEngineRegistry.setEngine()` now accepts the real module
  - Add `initializeWasm(): Promise<void>` that calls `initialize()` from `@ul-forge/core`
  - Add context management: `createGameContext()` / `destroyGameContext()`

- [ ] **4.2.2** Create type bridge: `src/ul/ulTypeBridge.ts`
  - Map between ProtoFusionGirl's `ULPrimitive` enum ↔ `@ul-forge/core`'s `NodeType`
  - Map between `ULSort` enum ↔ `Sort` type
  - Map between `ULOperation` enum ↔ `OperationName` type
  - Map between `ULExpression` ↔ `Gir`
  - These are nearly identical — both model the same Σ_UL algebra. The bridge is mostly trivial string conversions.

- [ ] **4.2.3** Delete redundant files:
  - `src/ul/ulTypes.ts` (duplicates `ulCanonicalTypes.ts`)
  - `src/ul/ULSymbolIndex.ts` (Node-only YAML loader, replaced by `queryLexicon()` from WASM)
  - `src/unilang/UniversalLanguageEngine.ts` (dead scaffold)

#### 4.3 — Wire Game Systems Through WASM

- [ ] **4.3.1** Wire `ulEngine.ts` through the WASM adapter:
  - `encodeULExpression()` → call `parse()` from `@ul-forge/core` to get a real `Gir`
  - `validateULSequence()` → call `validateGir()` from WASM (4-layer validation: schema, sort, invariant, geometry)
  - `getAnimationSequence()` → call `getAnimationSequence()` from WASM (returns real keyframes)
  - Keep the stub path as fallback when `ULEngineRegistry.isWasmActive === false`

- [ ] **4.3.2** Wire `ULPuzzleManager.ts` through WASM:
  - `checkSuccess()` → use `scoreComposition(ctxId, girJson, targetJson)` for real scoring
  - Use `getNextPuzzle(proficiencyMap)` for adaptive puzzle progression
  - Use `getHints(attemptJson, targetJson)` for contextual hint generation

- [ ] **4.3.3** Wire `ULObservationSystem` → proficiency tracking:
  - Track which operations the player has been exposed to
  - Feed proficiency map to `getNextPuzzle()` for adaptive difficulty

- [ ] **4.3.4** Create `ULGlyphRenderer.ts` — Phaser sprite renderer for UL glyphs:
  - Call `layout(gir, width, height)` → get `PositionedGlyph` with `{ node_id, x, y, shape }` per element
  - Map `shape` values to Phaser sprites/graphics (circle, triangle, square, line, angle, curve)
  - This replaces SVG rendering with game-native positioned sprites
  - Connect glyph animations to `getAnimationSequence()` keyframes

#### 4.4 — Initialize WASM in Game Startup

- [ ] **4.4.1** Add WASM initialization to game boot sequence:
  ```typescript
  // In game boot / preload:
  import { initialize } from '@ul-forge/core';
  import { ULEngineRegistry } from './ul/ulWasmAdapter';

  try {
    await initialize();  // loads ~600KB WASM binary
    // ULEngineRegistry auto-upgrades to WASM mode
    ulEventBus.emit('ul:wasm:loaded', { version: ULEngineRegistry.engineVersion });
  } catch (err) {
    console.warn('[UL] WASM failed to load, using TypeScript stub:', err);
    ulEventBus.emit('ul:wasm:error', { error: String(err) });
    // Game continues with ULStubEngine — degraded but functional
  }
  ```

- [ ] **4.4.2** Create game context on scene start:
  - On `GameScene.create()`: `const ctxId = createContext(gameConfig)`
  - Store context ID for the session
  - Destroy on scene shutdown

#### 4.5 — Build One Complete WASM-Powered Puzzle

- [ ] **4.5.1** Design puzzle: "Seal the Rift" at a ley line node:
  - Player encounters a corrupted ley line node with a glyph puzzle overlay
  - UI shows target glyph (from `getNextPuzzle()`) and 5 primitive buttons (●, ─, ∠, ∼, ○)
  - Player composes a glyph by selecting primitives and placing them
  - Each placement: `parse(input)` → `validate(gir)` → real-time feedback showing 4-layer validation
  - On submit: `scoreComposition(ctx, playerGir, targetGir)` → graded result (exact/close/partial/unrelated)
  - If stuck: `getHints(attemptGir, targetGir)` → contextual hints displayed in UI
  - Success: ley line node activates → visual effect → area unlocked

- [ ] **4.5.2** Wire `UniversalLanguagePuzzleModal.ts` to use real WASM:
  - Replace mock validation with `validate()` from WASM
  - Show real validation layer breakdown (schema ✓, sort ✓, invariant ✓, geometry ✓/✗)
  - Display `deparseGir()` to show the player their expression in UL-Script notation

- [ ] **4.5.3** Wire Jane's learning system:
  - `evaluateJaneAttempt(ctx, playerAttempt, expected)` → tracks learning progress
  - Feed results back to quest/mission progression

#### 4.6 — Fix and Update Tests

- [ ] **4.6.1** Create `src/ul/__tests__/__mocks__/ul-forge-core.ts` — mock for Jest:
  - Mirror the mock pattern from `@ul-forge/core`'s own test suite
  - Return deterministic GIR, validation, evaluation results
  - Export all 23 function mocks

- [ ] **4.6.2** Update `ulEngine.test.ts` — test both stub and WASM paths
- [ ] **4.6.3** Update `ulPuzzle.test.ts` — test with WASM scoring
- [ ] **4.6.4** Update `ulResourceLoader.test.ts` — fix or replace Node-only tests
- [ ] **4.6.5** Add new test: `ulWasmAdapter.test.ts` — test initialize/parse/validate/evaluate through the adapter
- [ ] **4.6.6** Add integration test: full puzzle flow (compose → validate → score → hints)
- [ ] **4.6.7** Verify: `npm test` → all UL tests green

#### 4.7 — Cleanup UL Layer

- [ ] **4.7.1** Consolidate `ulCanonicalTypes.ts` with `@ul-forge/core` types:
  - ProtoFusionGirl's `ULPrimitive/ULSort/ULOperation` → keep as game-layer enums
  - `@ul-forge/core`'s `NodeType/Sort/OperationName` → the canonical WASM types
  - `ulTypeBridge.ts` maps between them
  - Eventually consider removing the game-layer enums and using `@ul-forge/core` types directly

- [ ] **4.7.2** Remove dead `data/ul/` JSON files that are unused (9 of 15)
- [ ] **4.7.3** Update `ulEventBus.ts` to include WASM event types from `ulCanonicalTypes.ts`
- [ ] **4.7.4** Remove stale debug `console.log` from `ULSymbolIndex.ts` (if file kept)
- [ ] **4.7.5** Fix `grammarRules.ts` `isWellFormedFormula()` — either use WASM `validateGir()` or make the stub check non-trivial

### Phase 5: Ship Proto (1-2 sessions)

**Goal**: Deployable build.

- [ ] **5.1** Remove all console.log debug spam
- [ ] **5.2** Set up production Vite build — `npm run build` produces deployable output
- [ ] **5.3** Test Vercel deployment (vercel.json already exists)
- [ ] **5.4** Add basic meta tags, favicon (FaviconGenerator already exists), Open Graph
- [ ] **5.5** Write a short README for the shipped Proto: what it is, how to play, controls
- [ ] **5.6** Tag release: `proto-fusiongirl-v0.1.0`

---

## 6. What NOT to Build (For Proto)

These are cut from Proto scope. They belong in Fusion Girl (Godot 4):

- Full faction reputation system
- Skill trees
- Psi abilities (beyond basic psi bolt attack)
- Companion AI companions following the player
- Narrative branching / cutscenes / dialogue trees
- Crafting depth (beyond basic demo)
- Web3 / blockchain / NFT anything
- Multiplayer / anchor sync
- Modding marketplace / governance
- Full tech level progression (7 tiers)
- Timeline branching (beyond demo)
- 3D world / full cosmic scope

---

## 7. File Count Projection

| Phase | Files Removed | Files Added | Net Change |
|-------|-------------:|------------:|-----------:|
| Phase 0 (Cleanup) | ~170 | ~2 | **-168** |
| Phase 1 (Test Fix) | 0 | 0 | 0 |
| Phase 2 (Decompose) | 0 | 4 | +4 |
| Phase 3 (Polish) | 0 | ~5 | +5 |
| Phase 4 (UL WASM) | 0 | ~2 | +2 |
| Phase 5 (Ship) | 0 | 0 | 0 |
| **Total** | **~170** | **~13** | **-157** |

Starting: 527 TS files → Target: ~370 TS files (30% reduction)

---

## 8. Architecture After Cleanup

```
src/
├── ai/              # 8 files — JaneAI, CompanionAI, emotions, etc. (KEEP ALL)
├── analytics/       # 2 files — replay engine (KEEP)
├── asiControl/      # 10 files — trust, threats, guidance, command center (KEEP)
├── combat/          # 3 files — CombatSystem, EnemyTypes, index (KEEP)
├── core/            # ~25 files — Jane, EventBus, managers, controls, state (TRIMMED)
├── data/            # 17 files — JSON data + loaders (KEEP)
├── debug/           # 2 files — diagnostics (KEEP)
├── loading/         # 4 files — splash, preloader (KEEP)
├── magneto/         # 2 files — MagnetoSpeeder, SpeederManager (TRIMMED)
├── mods/            # 8 files — mod loader, samples (KEEP)
├── narrative/       # 2 files — NarrativeEngine, index (TRIMMED)
├── navigation/      # 7 files — speeder nav system (KEEP ALL)
├── provision/       # 2 files — research projects (KEEP)
├── save/            # 1 file — SaveSystem (KEEP)
├── scenes/          # 17 files — game scenes + 4 new setup modules (RESTRUCTURED)
├── services/        # 2 files — SettingsService (TRIMMED — cut ModRegistryService)
├── ui/              # 42 files — all Phaser widgets (TRIMMED — cut UXManager)
├── ul/              # 24 files — Universal Language (KEEP)
├── utils/           # 12 files — error infra, assets, monitors (KEEP)
└── world/
    ├── camera/      # 2 files (KEEP)
    ├── combat/      # 3 files (KEEP)
    ├── crafting/    # 2 files (KEEP)
    ├── enemies/     # 3 files (KEEP)
    ├── equipment/   # 5 files (KEEP)
    ├── event/       # 2 files (KEEP)
    ├── inventory/   # 2 files (KEEP)
    ├── items/       # 2 files (KEEP)
    ├── leyline/     # 7 files (KEEP)
    ├── leylines/    # 2 files (KEEP)
    ├── missions/    # 8 files (KEEP)
    ├── player/      # 4 files (KEEP)
    ├── quest/       # 1 file (KEEP — merge into missions later)
    ├── registry/    # 1 file (KEEP)
    ├── scripting/   # 1 file (KEEP)
    ├── simulation/  # 1 file (KEEP)
    ├── speed/       # 2 files (KEEP)
    ├── tech/        # 3 files + 1 JSON (COLLAPSED from 130 files)
    ├── terrain/     # 22 files (KEEP ALL)
    ├── tilemap/     # 51 files (KEEP — minus deprecated WorldEvents)
    ├── timestream/  # 13 files (KEEP)
    └── ui/          # 2 files (KEEP)
```

---

## 9. Priority Order

**If you only have limited time, do these in order:**

1. **Phase 0.1-0.4**: Delete dead files (10 minutes, instant clarity gain)
2. **Phase 1.1**: Fix JSON data loading in tests (probably one config fix)
3. **Phase 0.5-0.7**: Delete scaffolds and shims (30 minutes)
4. **Phase 1**: Fix remaining test failures
5. **Phase 3.6-3.7**: Create the one completable mission (highest player-value)
6. **Phase 2**: GameScene decomposition (maintainability)
7. **Phase 0.8**: Collapse tech tree (nice cleanup)
8. **Phase 3.1-3.5**: Polish speeder feel
9. **Phase 4**: UL WASM integration
10. **Phase 5**: Ship
