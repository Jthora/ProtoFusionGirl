# Current State Audit — Beta Readiness

> **Assessed**: 2026-03-17
> **Build**: Succeeds (2.7MB gzipped, 248 modules, ~9s build time)
> **Deploy target**: Vercel (`vercel.json` present)
> **Verdict**: NOT ready for beta — critical loop is incomplete

---

## What Actually Works

These systems boot and function correctly end-to-end.

### Core Infrastructure
- **EventBus** — pub/sub event system, used throughout, reliable
- **Phaser scene boot** — StartScene → GameScene loads without crash
- **UILayoutManager** — fullscreen/compact bar modes initialize
- **Parallax backgrounds** — render with canvas fallbacks

### World & Navigation
- **WorldGenV3** — procedural terrain from seed, infinite chunked map
- **ChunkLoader** — streams chunks around player position
- **TileRegistry / TileSpriteFactory** — tile data and rendering
- **HighSpeedTerrainSystem** — dynamic LOD terrain at Mach+ speeds
- **SpeedControlSystem** — walk → run → hypersonic tiers with smooth transition
- **ThrottleController** — acceleration/deceleration curves
- **FastTravelManager** — unlocked node fast travel

### Jane AI
- **JaneAI state machine** — 7 states: Idle → Navigate → FollowGuidance → Combat → Retreat → Bored → Refusing
- **BoredomSystem + RefusalSystem** — wired and tested
- **EmotionSystem** — tracks emotional state
- **ASI waypoint → Jane navigates** — click-to-guide works end-to-end
- **JANE_ARRIVED_AT_WAYPOINT** — fires correctly

### First-Run UX (recently implemented)
- **StartScene** — "Jane Tho'ra is in the field / She doesn't know you're watching", ENTER SIMULATION button, ley line grid background
- **Connecting overlay** — animated progress bar on scene transition
- **Preloader** — 150ms steps, "Locating Jane Tho'ra... FOUND", "Connection established."
- **Jono first-contact** — auto-triggers 2s after game starts, 4-beat dialogue
- **ASI Dashboard** — AUTONOMOUS status, TRUST%, node stability panel, TIMELINE RECORDING

### ASI Control Architecture
- **ASISceneIntegration** — scene module, guidance arrival detection
- **GuidanceEngine** (structure) — categories, priority system, context evaluation
- **TrustManager** (structure) — event subscriptions defined
- **NodeManager** — nodes with stability/decay, events fire on change
- **RiftManager** — rift spawn/seal lifecycle
- **CheckpointManager** — respawn at last checkpoint

---

## Coded But Not Working

These systems exist and partially compile but do not produce visible gameplay.

### ASI Guidance — Inert
**File**: `src/asiControl/systems/GuidanceEngine.ts`

All suggestion-generation methods return `null`:
- `generateThreatSuggestions()`
- `generateMovementSuggestions()`
- `generateCombatSuggestions()`
- `generateMagicSuggestions()`
- `generateSocialSuggestions()`
- `generateEnvironmentalSuggestions()`

The Command Center interface has empty panels. The ASI cannot suggest anything to the player.

### TrustManager — Doesn't Update
**File**: `src/asiControl/systems/TrustManager.ts`

Event handler stubs exist but are not implemented:
- `handleGuidanceGiven()`, `handleGuidanceFollowed()`, `handleGuidanceIgnored()`
- `handlePlayerSuccess()`, `handlePlayerFailure()`, `handleMagicUsage()`

Trust meter is always at its initial value. Player actions have no feedback.

### Combat — Dead Code
- `src/combat/EnemyTypes.ts` — 2 enemy types defined (RemnantTerminator, NefariumPhantom)
- `src/core/EnemyManager.ts` — exists, no patrol/spawn behavior
- `src/data/attackLoader.ts` — loads JSON, nothing calls it at runtime
- Enemies spawned in scene do not move, attack, or die
- No health bars, no damage numbers, no knockback

### Mission System — Two Orphaned Implementations
- `src/world/missions/MissionManager.ts` — CRUD only, no event wiring
- `src/world/missions/MissionSystem.ts` — event-driven, tests fail
- `sampleMissions.ts` exists but is not loaded in GameScene
- No objectives are ever presented to the player

### UL Puzzle System — Missing Dependency
- `src/ul/ULPuzzleManager.ts` — ready to integrate WASM
- `@ul-forge/core` WASM module not in `package.json`
- Players cannot interact with Universal Language puzzles

### Ley Line Interaction — Visualization Only
- `LeyLineManager` tracks nodes, events fire
- `pathfinder.findPath()` returns placeholder
- Node instability fires but has no player-facing consequence
- Players cannot stabilize nodes themselves

### Timestream / Rewind — Stubbed
- `RewindSystem` and `EventHistoryLog` initialized
- `RewindSystem.recordDecisionPoint()` is called
- Actual time-branch playback is not implemented
- `TimelinePanel` uses `alert()` for operations

### Test Suite — Import Blocker
**File**: `src/data/animationCatalog.ts` line 5

Circular dependency with `src/ai/JaneAI.ts` causes the test runner to crash before running any tests. The reported 98% pass rate (598/609) is from a prior run — current state cannot be verified.

---

## Completely Missing

Things a first-time player would immediately notice are absent.

### No Loop Closure
- No victory screen
- No "timeline secured" moment
- No failure state beyond Jane dying (which respawns her silently)
- Players can play indefinitely but experience nothing that resolves

### No Consequence Chain
- Nodes degrade → nothing visible happens to the world
- Enemy approaches Jane → nothing happens on contact
- Player ignores guidance → no acknowledgment
- There is no "if you don't act, this gets worse" feedback

### No Audio
- No music
- No sound effects (movement, combat, UI, ambience)
- No ley line hum
- No rift sound

### No Real Sprites
- All characters are placeholder geometry
- `REAL_SPRITES_ENABLED` is `false` by default
- Animation pipeline exists but no atlas has been rendered yet

### No Onboarding Beyond Jono
- `src/onboarding/OnboardingManager.ts` — all TODO stubs
- Controls are not explained
- Player discovers (or doesn't) that WASD moves Jane by accident

### No Persistence
- `src/save/SaveSystem.ts` — 555 bytes, barely implemented
- All progress resets on page reload
- `operator_id` is stored in localStorage but nothing else is

---

## Technical Debt That Affects Beta Quality

| Issue | File | Impact |
|-------|------|--------|
| 44 `console.log` calls in GameScene | `src/scenes/GameScene.ts` | Unprofessional, spams DevTools |
| `require()` inside scene file | `src/scenes/GameScene.ts:72` | Webpack warning, wrong module system |
| Empty `preload()` in StartScene | `src/scenes/StartScene.ts` | Minor, no impact |
| UILayoutManager shows empty bars | `src/ui/layout/UILayoutManager.ts` | Visible but non-interactive UI chrome |
| `// TODO:` comments in TrustManager | `src/asiControl/systems/TrustManager.ts` | Flags incomplete implementation |
| `alert()` in TimelinePanel | `src/world/timestream/TimestreamUI.ts` | Crashes TypeScript compilation |

---

## Summary Rating

| System | Rating | Blocking? |
|--------|--------|-----------|
| World generation / terrain | ✅ Solid | No |
| Navigation / speed | ✅ Solid | No |
| Jane AI state machine | ✅ Solid | No |
| First-run UX | ✅ Implemented | No |
| ASI waypoint guidance | 🟡 Partial | No — works, no trust feedback |
| ASI suggestion engine | ❌ Inert | Yes — core feature missing |
| TrustManager | ❌ Stubs only | Yes — no feedback loop |
| Combat | ❌ Dead code | Yes — enemies do nothing |
| Mission arc | ❌ Missing | Yes — no objectives |
| Win/lose condition | ❌ Missing | Yes — no loop closure |
| Audio | ❌ Missing | No — can ship without for alpha |
| Real sprites | ❌ Missing | No — placeholders acceptable for alpha |
| Save/load | ❌ Minimal | Yes — resets on reload |
| Test suite | ❌ Blocked | Indirect — can't verify stability |
