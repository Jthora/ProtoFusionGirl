# 04 — Architectural Roadmap

> Three-phase plan from current Phaser prototype through production-ready game. Phase 1 is the only committed phase. Phase 2+ are conditional on Phase 1 results.

---

## Phase 1: Playable Prototype (Phaser 3 / TypeScript)

**Goal**: Demonstrate the ASI-guides-autonomous-agents core loop in a browser.

**Engine**: Phaser 3.90.0, TypeScript strict, Vite 7, arcade physics.

**What "done" looks like**: The 8-step core loop from the gap analysis runs end-to-end. A player opens the game, sees Jane act on her own, guides her through ley line travel, encounters a puzzle or combat event, and completes a mission objective — all within 3 minutes.

### Architecture Targets

| Component | Current State | Target State |
|-----------|--------------|-------------|
| GameScene | 1,675 lines, 59 imports | < 600 lines, ≤ 10 imports, delegates to extracted controllers |
| Jane AI | `updateAI()` empty | Behavior tree with 7+ states, tick-based decisions |
| ASI Input | WASD moves Jane directly | Guidance/suggestion system, Jane evaluates before acting |
| Ley Lines | Generates + visualizes, no travel | A* pathfinding, rail movement, speed boost, instability events |
| UL Puzzles | Engine validates, no UI | In-game puzzle panel at ley line nodes with gameplay effects |
| Missions | 16 types defined, all empty | 3 outcome types functional, 1 full sample mission |
| Companions | Empty classes | 1 companion (PsiSysRobot) with follow/heal behavior |

### Technical Constraints (Phaser 3 / Browser)

**Canvas rendering**: ~60 FPS budget. Already hitting complexity ceiling with parallax + sprites + UI overlays + chunk loading.

**Physics**: Arcade only (AABB collisions). No rotation physics, no joints, no soft bodies. Sufficient for 2D side-scroller but limits speeder mechanics to velocity-based movement.

**Memory**: Browser tab limit ~1–2 GB. Chunk loading system already manages this. Hypersonic terrain streaming is the bottleneck — LOD system handles it.

**Audio**: Phaser's audio system works. No positional audio. Not a priority for prototype.

**Rendering at zoom extremes**: 0.02 zoom (hypersonic) renders enormous world areas. Frame drops likely with many sprites. Solution: already implemented (LOD reduces visible detail at high speed).

### What Phaser CAN Do for This Game

- 2D side-scrolling with parallax — **already working**
- Sprite-based characters and enemies — **already working**
- Event-driven system architecture — **already working (EventBus)**
- UI overlays (menus, HUD, modals) — **already working**
- Speed transitions with camera zoom — **already working (best code in codebase)**
- Chunk-based world streaming — **already working**
- Keyboard + touch + gamepad input — **already working**

### What Phaser CANNOT Do

- 3D rendering of any kind
- Complex physics (soft bodies, joints, fluid)
- Multiplayer networking (needs separate solution)
- Real-time strategy camera (bird's-eye with unit selection)
- Performance beyond ~500 active sprites per frame

### Honest Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| GameScene refactor breaks things | HIGH | HIGH | Extract one controller at a time, run tests after each extraction |
| Jane autonomy feels bad to play | MEDIUM | CRITICAL | Prototype with simple rules first; tune before adding complexity |
| Ley line rail movement is disorienting | MEDIUM | MEDIUM | Camera controller already handles zoom transitions; test at each speed tier |
| UL puzzles feel like interruptions | MEDIUM | HIGH | Make puzzles optional initially; reward-only, not gate-only |
| Performance at hypersonic with new systems | LOW | MEDIUM | LOD system already handles this; profile early |
| Solo dev bandwidth | HIGH | HIGH | AI-assisted development; scope ruthlessly; one system at a time |

---

## Phase 2: Universal Language Engine (Rust) — CONDITIONAL

**Prerequisite**: Phase 1 core loop is fun and validated by playtesters.

**Why Rust**: UL rule evaluation, WASM puzzle processing, potential for deterministic simulation. Phaser/TypeScript is fine for the game shell but UL symbol processing benefits from compiled performance when scaling to thousands of symbols.

**What to build**:

1. **`ul-engine` Rust crate** — Port `ulEngine.ts` (223 lines) + `cosmicRules.ts` + `grammarRules.ts` to Rust
2. **WASM compilation** — Target `wasm32-unknown-unknown`, expose FFI via `wasm-bindgen`
3. **TypeScript bindings** — Auto-generated from Rust types, drop-in replacement for current `ulEngine.ts`
4. **Puzzle solver** — Constraint solver for UL puzzles (Rust performance enables brute-force validation)

**Scope**: Only the UL engine. NOT the game engine, NOT rendering, NOT physics. The Phaser game continues to run in TypeScript; only puzzle evaluation moves to WASM.

**What this enables**:
- Complex multi-symbol puzzles (100+ symbols per sequence)
- Real-time spell validation during combat
- Modders can write UL extensions validated at native speed
- Deterministic simulation for multiplayer puzzle sync

**What this does NOT enable**:
- Better graphics
- Better physics
- Better networking
- Any visible change if the current UL engine is fast enough

**Decision point**: If the TypeScript UL engine remains fast enough for the puzzle complexity the game needs, SKIP THIS PHASE. Measure before porting.

---

## Phase 3: Godot 4 Migration — CONDITIONAL

**Prerequisite**: Phase 1 game design is validated. Phase 2 UL engine is tested. Team/funding exists for production-scale development.

**Why Godot 4**: Open-source, GDExtension for Rust integration, 2D+3D, built-in multiplayer, visual editor, export to all platforms.

**What migrates**:

| System | Migration Path |
|--------|---------------|
| Game logic (TypeScript) | Rewrite in GDScript or C# — game logic is tightly coupled to Phaser APIs |
| UL Engine (Rust/WASM) | GDExtension binding — Rust crate stays, FFI changes |
| Art assets | Phaser sprites → Godot sprites (direct import) |
| Data files (JSON) | Direct import — Godot reads JSON natively |
| Tilemap system | Godot TileMap node replaces custom TilemapManager |
| Physics | Godot physics replaces arcade physics |
| Audio | Godot audio system |
| UI | Godot Control nodes replace Phaser UI overlays |

**What doesn't migrate**: Phaser-specific code (~60% of current codebase). This is expected and acceptable. The VALUE being carried forward is:
1. Game design (validated by Phase 1)
2. UL engine (Rust crate, platform-independent)
3. Data files (JSON configs, mission definitions, UL rules)
4. Design patterns (EventBus, ModularGameLoop, behavior trees)

**Estimated migration scope**: Full rewrite of rendering/physics/UI layer. Logic layer partially portable. UL engine drops in via GDExtension.

**What Godot 4 enables that Phaser cannot**:
- 3D rendering (potential 3D ley line visualization, globe view)
- Proper physics (speeder mechanics with real forces)
- Built-in multiplayer (for multiverse branching)
- Platform exports (Steam, console, mobile)
- Visual editor (faster content creation)
- Built-in animation system
- Shader support (hypersonic effects, ley line visualization)

---

## Architecture Decisions Log

| Decision | Rationale | Reversible? |
|----------|-----------|-------------|
| Keep Phaser for Phase 1 | Existing code works. Switching engines before validating design wastes effort. | Yes — Phase 3 is the migration |
| Decompose GameScene before adding features | Every new feature touches GameScene. Must reduce coupling first. | Partially — extracted controllers become dependencies |
| Jane autonomy before ley line travel | Without autonomy, ley line travel is just "player walks on a highlighted path." With autonomy, ley lines become JANE's decision. | Yes — can be reordered |
| One companion before four | Validate the companion pattern with PsiSysRobot. If it works, three more are Tier 1 work. | Yes |
| Rust UL engine is conditional, not committed | Only port to Rust if TypeScript performance is insufficient. Premature optimization is the root of all evil. | Yes — can skip Phase 2 entirely |
| Godot migration is conditional, not committed | Only migrate if Phase 1 validates the game design and there's a reason to go 3D or multi-platform. | Yes — Phaser can ship a 2D browser game |

---

## Scope Level Mapping

| Scope Level | What It Means | Phase 1 Includes |
|-------------|--------------|-----------------|
| **MVP** | Bare minimum to demonstrate core loop | P0 (decompose) + P1 (autonomy) + P2 (ley lines) |
| **Playable** | Complete loop with progression | MVP + P3 (UL puzzles) + P4 (missions) |
| **Demo** | Showable to external audience | Playable + P5 (companion) + polish pass |
| **Alpha** | Feature-complete for early access | Demo + 3 more companions + 5+ missions + biome variety |

Phase 1 targets **Playable** scope. **Demo** is stretch. **Alpha** requires sustained development beyond current capacity.

---

## Build & Development Infrastructure

### Current Setup

| Tool | Version | Purpose |
|------|---------|---------|
| TypeScript | ~5.8.3 | Language |
| Phaser | 3.90.0 | Game engine |
| Vite | 7.0.5 | Build/dev server |
| Jest | 30.0.5 | Test runner |
| Hardhat | (config exists) | Blockchain dev — unused |
| Vercel | (config exists) | Deployment target |

### Test Infrastructure

- 97 test suites (75 passing, 22 failing)
- Most failures: integration mocking, dependency resolution
- Core logic tests pass
- No E2E tests
- No visual regression tests
- No performance benchmarks

### Recommended Infrastructure Additions (Phase 1 only)

| Addition | Why |
|----------|-----|
| Fix the 22 failing test suites | They're canaries for coupling problems. Fixing them validates the decomposition. |
| Add E2E smoke test | "Game loads, Jane appears, 30 seconds pass without crash" — catches integration regressions. |
| Performance budget test | "60 FPS at walking speed, 30 FPS at hypersonic" — catches performance regressions. |
| Remove Hardhat config | Unless blockchain features are planned for Phase 1 (they shouldn't be). |
