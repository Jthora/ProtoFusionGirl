# Loader & Boot Sequence Review (ProtoFusionGirl)

Date: 2025-08-08
Author: GitHub Copilot

## Scope
Review the initial data loaders, boot flow, and their integration with the world + leyline terrain overhaul. Identify issues, odd interfaces, and propose targeted fixes.

## Summary
- Boot path initializes Phaser via `main.ts` with StartScene → GameScene.
- GameScene constructs `TilemapManager` (now uses `WorldGenV3`) and generates terrain synchronously via `generateFromSeed(...)`.
- World systems using data loaders are simple sync JSON imports (resolveJsonModule). Consumers:
  - WorldEngine: `loadZones()` (zones.json) and leyline managers; emits WORLD_LOADED-like event (string literal).
  - NarrativeEngine: `loadNarrativeEvents()`; subscribes `onAny` to EventBus.
  - CustomizationEngine: `loadCosmetics()`; reacts to UNLOCK/EQUIP.

## Findings

### 1) Event typing and names
- `WorldEngine` emits `{ type: 'WORLD_LOADED' as any, ... }` but `EventTypes.ts` doesn’t define WORLD_LOADED. This forces `as any` casts and weakens safety.
- NarrativeEngine listens to `onAny`, which isn’t implemented in `core/EventBus` (only on/once/off/emit). The NarrativeEngine here is in `src/narrative/NarrativeEngine.ts` and directly calls `this.eventBus.onAny(this.handleEvent...)` — this will not compile/run with the EventBus implementation.

Recommendations:
- Add `WORLD_LOADED` to `EventName` and payloads; remove `as any`.
- Either implement `onAny` in EventBus or change NarrativeEngine to explicitly subscribe to events of interest.

### 2) Duplicate NarrativeEngine classes
- There are two NarrativeEngine files:
  - `src/narrative/NarrativeEngine.ts` (active, data-driven, uses EventBus).
  - `src/core/NarrativeEngine.ts` (stub/scaffold).
- This creates confusion on which to import; risk of wrong import path.

Recommendations:
- Remove or rename the stub, or move it to `legacy/` with clear comment.

### 3) Loader simplicity vs. robustness
- Loaders return raw JSON with minimal typing. Pros: simple. Cons:
  - No validation/schema checks.
  - No error handling for malformed JSON or unexpected shapes.
  - Tight coupling to file names and paths.

Recommendations:
- Introduce lightweight zod/yup schema validation per loader in dev builds/tests.
- Provide `index.ts` to re-export all loaders (partially exists, only exports attacks).
- Consider lazy vs eager loading and cache.

### 4) Boot/creation order and terrain timing
- `GameScene.create()` calls `tilemapManager.worldGen.generateFromSeed(this.worldSeed)` early, before `ChunkLoader` is created and before ground group exists. That’s okay (worldgen is internal), but ensure chunk-based sprites sync happens after.
- Ground level detection scans chunk data directly (`chunk.tiles[localX]`). That assumes chunkManager.loadChunk(...) synchronously produces tile arrays with surface semantics — true now, but brittle.

Recommendations:
- Provide a `WorldGen.getSurfaceY(x)` API to query surface without peeking chunk arrays.
- Document when worldgen/chunks are safe to query in scene lifecycle.

### 5) Two slice mappers
- There’s `src/world/terrain/LeylineGeoSlice.ts` and `src/world/terrain/LeylineSliceMapper.ts` with near-duplicate code.

Recommendations:
- Consolidate to one mapper; deprecate the duplicate.

### 6) EventBus feature gaps
- No `onAny`/wildcard; no error handling in handlers; no try/catch wrapper to isolate faulty listeners.
- No global event logging toggle.

Recommendations:
- Add `onAny(cb)`, `offAny(cb)`, and safe `emit` wrapping.

### 7) WorldEngine and loading cohesiveness
- WorldEngine loads zones and instantiates leyline managers but isn’t wired into GameScene. GameScene constructs leyline manager separately.

Recommendations:
- Decide single source of truth: either GameScene owns managers or a higher-level `WorldRuntime` does. Avoid duplicate leyline managers.

### 8) Data type cohesion
- CosmeticDefinition type repeats union literals (outfit|hairstyle|wings); ensure no drift with UI systems. Consider centralizing cosmetic slots.

### 9) Missing tests around loaders
- No unit tests verifying loader schemas and event wiring.

Recommendations:
- Add Jest tests for each loader schema and key event flows (WORLD_LOADED, narrative triggers).

## Proposed Actions (low-risk, incremental)
- Add WORLD_LOADED to EventTypes with payload: `{ zoneCount: number; leyLineCount: number }`.
- Implement onAny in EventBus or refactor NarrativeEngine to explicit subscriptions.
- Consolidate Leyline slice mapper files.
- Create `WorldGen.getSurfaceY(x)` with cache.
- Add zod-based validation in loaders (dev only) and minimal Jest tests.
- Remove `core/NarrativeEngine.ts` or move to `legacy/`.

## Boot Trace (current)
- main.ts → LoadingCoordinator.quickStart/developmentStart → initializePhaserGame
- Phaser config scenes: StartScene → GameScene create()
- GameScene:
  - new TilemapManager() → WorldGenV3 wired
  - worldGen.generateFromSeed(seed)
  - new WorldStateManager + LeyLineManager
  - new ChunkLoader(scene, tilemapManager, groundGroup)
  - chunkLoader.updateLoadedChunks(initial)
  - Physics, UI, ASI systems, etc.

## Notes for Terrain Overhaul Integration
- WorldGenV3 is used by TilemapManager; generation is synchronous with LRU cache.
- Next steps: real elevation source, richer biome mapping, and debug overlay to visualize slice path.

## Open Questions
- Should zones.json seed the slice endpoints for WorldGenV3? If so, define a mapping in TilemapManager constructor.
- Where should persistent elevation cache live (WorldPersistence vs. a dedicated cache dir)?

