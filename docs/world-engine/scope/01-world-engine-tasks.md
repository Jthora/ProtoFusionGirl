# Scope: World Engine Tasks

> Granular task breakdown for the world engine rebuild only.
> Complexity: S = hours, M = 1–2 days, L = 3–5 days, XL = 1+ week.

---

## WE-0: Demolition (prerequisite)

Remove the old systems before building the new ones. This is not optional —
leaving old systems in place while building new ones causes conflicts.

| Task | Complexity | Notes |
|------|-----------|-------|
| WE-0.1 Delete `WorldGenV2.ts` + tests | S | Superseded by signal engine |
| WE-0.2 Delete `WorldGenV3.ts` | S | Replaced by LeyLineSignalEngine |
| WE-0.3 Delete `WorldGenWarp.ts` | S | Only WarpAnchorPanel uses it; that panel is legacy |
| WE-0.4 Delete `HybridTerrainSystem.ts` | S | Never instantiated |
| WE-0.5 Delete `ElevationSliceTerrainSystem.ts` | S | Async, incompatible, replaced |
| WE-0.6 Delete `LeylineSliceMapper.ts` | S | Duplicate of LeylineGeoSlice |
| WE-0.7 Delete `ElevationCache.ts` | S | No longer needed |
| WE-0.8 Delete `SimpleBiomeClassifier.ts` | S | 343 lines; biomes now driven by BiomeState param |
| WE-0.9 Delete `SimpleTerrainCache.ts` | S | Caching now implicit in signal function |
| WE-0.10 Delete `SimpleCoordinateConverter.ts` | S | Check if used in tests only; if so, move to test-utils |
| WE-0.11 Remove ChunkLoader from GameScene | M | Untangle from TerrainSceneSetup, PlayerManager position init |
| WE-0.12 Remove TilemapManager world-gen usage | M | Keep TilemapManager for inventory/save, strip terrain role |
| WE-0.13 Fix all broken imports caused by deletions | M | May be many ripple effects |
| WE-0.14 Fix all test mocks for deleted systems | M | GameScene.test.ts and others reference deleted files |
| WE-0.15 Verify build passes after demolition | S | `npm run build` must succeed |

**WE-0 total estimate: M–L (3–6 days) due to cascade effects**

---

## WE-1: LeyLine Signal Engine

| Task | Complexity | Notes |
|------|-----------|-------|
| WE-1.1 Define `LeyLineSignalState` interface | S | energyLevel, corruptionLevel, biomeState, nodeRegistry, leyLineId |
| WE-1.2 Implement H1 global contour function | S | Seeded by leyLineId hash, very low frequency |
| WE-1.3 Implement H2 regional terrain function | M | BiomeState profiles; 4 biome types minimum |
| WE-1.4 Define BIOME_FREQUENCY_PROFILES data | S | Volcanic, Forest, Polar, Desert — amplitude + frequency tables |
| WE-1.5 Implement H3 local features function | S | Energy-proportional amplitude, medium frequency |
| WE-1.6 Implement H4 corruption noise function | M | Aperiodic hash-based, zero cost when corruption=0 |
| WE-1.7 Implement `node_spikes()` lookup | M | Reads from NodeRegistry, blends by distance |
| WE-1.8 Compose `terrain_height()` master function | S | Sums H1–H4 + node_spikes |
| WE-1.9 Wire `LeyLineSignalState` to `LeyLineManager` | M | LeyLineManager becomes the state owner; event listeners update it |
| WE-1.10 Unit tests for H1–H4 individually | M | Each harmonic has deterministic behavior; easy to test |
| WE-1.11 Unit test `terrain_height()` for known inputs | S | Spot checks: corruption=0 matches baseline, etc. |
| WE-1.12 Performance benchmark: time per evaluation | S | Must be <0.01ms per point |
| WE-1.13 Performance benchmark: 800-point array | S | Full screen width; must be <5ms |
| WE-1.14 Optimise if needed (SIMD-friendly loop unroll) | M | Only if benchmark fails |

**WE-1 total estimate: L (4–6 days)**

---

## WE-2: Polygon Terrain Physics

| Task | Complexity | Notes |
|------|-----------|-------|
| WE-2.1 Implement `sampleTerrainCurve()` | S | X range + interval → Vector2 array |
| WE-2.2 Implement RDP polyline simplification | M | Standard algorithm; many open-source references |
| WE-2.3 Implement slope segment builder (Arcade Physics path) | M | Tilted rectangle per segment pair |
| WE-2.4 Build `TerrainPhysics` class | M | Owns physics body; exposes rebuild() |
| WE-2.5 Wire TerrainPhysics to LeyLineSignalState change events | M | Throttled rebuild on significant state delta |
| WE-2.6 Implement camera-window body refresh | M | Rebuild as Jane moves beyond coverage range |
| WE-2.7 Add collision layers (player / speeder / enemy) | S | Phaser collision group setup |
| WE-2.8 Test: Jane stands on terrain without falling | S | Manual + automated |
| WE-2.9 Test: terrain mutates and Jane falls/rises appropriately | M | Requires triggering state change mid-test |
| WE-2.10 Test: speeder collision on slopes | M | Speeder uses different friction/bounce |
| WE-2.11 (post-prototype) Migrate to Matter.js polygon body | L | Cleaner but not needed for prototype |

**WE-2 total estimate: L (4–6 days)**

---

## WE-3: Terrain Renderer

| Task | Complexity | Notes |
|------|-----------|-------|
| WE-3.1 Implement `TerrainRenderer` class | M | Phaser Graphics; draws fill + surface line each frame |
| WE-3.2 Biome color scheme per terrain type | S | Color table: volcanic=dark orange/black, forest=green/brown, etc. |
| WE-3.3 Surface line styling (energy-responsive) | S | High energy = bright, sharp line; low energy = dim, soft |
| WE-3.4 Implement 3-layer parallax background renderer | M | 3 Phaser TileSprite or Graphics layers at different scroll factors |
| WE-3.5 Corruption visual effect (H4 active) | M | Color shift to sickly purple/green; slight distortion on surface line |
| WE-3.6 Healing visual effect (energy rising) | M | Surface line brightens, emits brief particle burst |
| WE-3.7 LOD render mode switching | M | CRITICAL = fill only, HIGH = all effects |
| WE-3.8 Network-layer terrain waveform display | M | At network zoom: draw signal as mini energy waveform along ley line |
| WE-3.9 Water rendering (sub-zero terrain height) | M | Blue fill for below-sea regions; Jane cannot walk into water |
| WE-3.10 Performance test: 60fps at STANDARD fidelity | M | Profile with DevTools; identify bottlenecks |

**WE-3 total estimate: L–XL (5–8 days) — visual polish is expensive**

---

## WE-4: Simulation Fidelity Controller

| Task | Complexity | Notes |
|------|-----------|-------|
| WE-4.1 Define `SimulationFidelity` enum (CRITICAL/LOW/STANDARD/HIGH) | S | |
| WE-4.2 Implement `FidelityController` with rolling FPS average | S | Reads `game.loop.actualFps` |
| WE-4.3 Implement hysteresis (fast downgrade, slow upgrade) | S | Window-based logic |
| WE-4.4 Define `FidelityAware` interface | S | `onFidelityChange(level)` |
| WE-4.5 Implement fidelity in `TerrainRenderer` | S | Harmonic count changes |
| WE-4.6 Implement fidelity in `TerrainPhysics` | S | Sample interval changes |
| WE-4.7 Implement fidelity in `AudioManager` | M | Layer count changes |
| WE-4.8 Implement fidelity in entity renderer | S | Draw distance + particle budget |
| WE-4.9 Implement artificial fidelity cap (Nefarium interference) | M | EventBus listener in FidelityController |
| WE-4.10 Implement Ion Storm fidelity reduction | M | Requires CosmicCalendar integration |
| WE-4.11 Manual override (URL param + console) | S | Dev/debug utility |
| WE-4.12 Lore UI text ("PsiSys: simulation fidelity reduced") | S | Text notification via UIManager.showFeedback |
| WE-4.13 Boot fidelity: start LOW, auto-upgrade | S | Initial state in FidelityController |
| WE-4.14 Test: downgrade fires correctly at low FPS | M | Requires frame rate throttling in test |

**WE-4 total estimate: M–L (3–5 days)**

---

## WE-5: Dual-Perspective View

| Task | Complexity | Notes |
|------|-----------|-------|
| WE-5.1 Implement `ZoomController` with animated zoom | M | lerp toward targetZoom each frame |
| WE-5.2 Implement ground layer content visibility toggle | M | Show/hide sprite groups at threshold |
| WE-5.3 Implement network layer content (ley line path graphics) | L | Pulsing energy line, color-coded by energy level |
| WE-5.4 Network layer: Jane dot with state color | M | Small sprite/circle following Jane.worldX |
| WE-5.5 Network layer: node icons with status rings | L | Icon per type, animated ring per energy level |
| WE-5.6 Network layer: rift and instability markers | M | Flare/icon at event X coordinates |
| WE-5.7 Implement free-roam ASI camera (network zoom) | M | Mouse drag or WASD pan |
| WE-5.8 Zoom transition animation (smooth crossfade) | M | Alpha blend between layer sets during transition |
| WE-5.9 Keyboard shortcut: TAB to toggle zoom level | S | |
| WE-5.10 Auto-zoom-out during hypersonic travel | M | Speed threshold → target zoom shifts to network |
| WE-5.11 Trust-based view range limits | L | Camera range calculation from trust level |
| WE-5.12 ASI click-to-waypoint at network zoom | M | Click on node → emit waypoint suggestion event |
| WE-5.13 ASI click-to-suggest at ground zoom | M | Click near Jane → emit guidance hint |
| WE-5.14 Test: zoom transition doesn't drop frames | M | FPS must stay > 30 during transition |

**WE-5 total estimate: XL (7–10 days) — this is the most visually complex piece**

---

## WE-6: Node Authoring System

| Task | Complexity | Notes |
|------|-----------|-------|
| WE-6.1 Define `LeyLineNode` interface | S | See design/05-node-authoring.md |
| WE-6.2 Implement `NodeRegistry` class | S | Map + nearbyNodes() query |
| WE-6.3 Implement `TerrainProfileFn` for each node type | L | 5 types × 1 authored function each |
| WE-6.4 Author Tho'ra Launch Base node | M | Position, profile, biomeOverride, encounters |
| WE-6.5 Author Eastern Ley Pulse Recharge node | M | |
| WE-6.6 Author Vortex Theta-4 node | M | |
| WE-6.7 Author Corrupted Sector (Nefarium) rift node | M | |
| WE-6.8 Author Falcon2 Approach recharge node | M | |
| WE-6.9 Integrate NodeRegistry into `terrain_height()` | S | node_spikes() reads from registry |
| WE-6.10 Node discovery mechanic | M | Distance check, EventBus emit, save flag |
| WE-6.11 Ground layer: node visual structures | XL | Sprite assets or procedural Graphics per type |
| WE-6.12 Network layer: node icons and labels | M | Simple icon + text, visibility = discovered |
| WE-6.13 Node interaction trigger (Jane arrives) | M | JaneAI state + NodeInteractionController |
| WE-6.14 Node state persistence (save/load) | M | isDiscovered, energyLevel, stabilityLevel per node |
| WE-6.15 Test: terrain blends smoothly at node boundary | M | Visual inspection + sample point comparison |

**WE-6 total estimate: XL (8–12 days) — node visual design is significant work**

---

## WE-7: Performance Cleanup (prerequisite-adjacent)

These must happen alongside or before WE-1 to prevent the startup cost from
making it impossible to measure true world engine performance.

| Task | Complexity | Notes |
|------|-----------|-------|
| WE-7.1 Strip 372 combinatorial audio preload | M | Keep only ~20 named audio keys; remove `preloadCombinatorialAudio` |
| WE-7.2 Defer 40+ non-essential systems to lazy init | L | Many managers can be created on-demand not at create() |
| WE-7.3 Decompose GameScene.ts into modules | XL | ~2756 lines → target <600. Separate doc: scope/02-full-game-scope.md |

**WE-7 total estimate: XL (ongoing — see full game scope)**

---

## WE Total Summary

| Block | Estimate | Blocking? |
|-------|----------|-----------|
| WE-0 Demolition | 3–6 days | Yes — must be first |
| WE-1 Signal Engine | 4–6 days | Yes — everything builds on this |
| WE-2 Physics | 4–6 days | Yes — Jane needs ground |
| WE-3 Renderer | 5–8 days | No — game playable without visuals, but not shippable |
| WE-4 Fidelity Controller | 3–5 days | No — but needed before any performance claims |
| WE-5 Dual-Perspective View | 7–10 days | No — but this IS the ASI premise |
| WE-6 Node Authoring | 8–12 days | No — game runs without nodes, but has no "places" |
| WE-7 Performance Cleanup | Ongoing | Partial — audio preload must be fixed before anything |

**World engine rebuild alone: approximately 5–9 weeks of focused work.**

This gets a functional, beautiful, performant world. It does NOT get a game.
See scope/02-full-game-scope.md for the rest.
