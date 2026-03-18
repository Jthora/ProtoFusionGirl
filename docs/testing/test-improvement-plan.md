# Test Improvement Plan
## ProtoFusionGirl

**Created:** 2026-03-17
**Based on:** Full codebase audit — 137 test files, ~2000 test blocks, 528 source modules

---

## Audit Summary

| Category | Test Files | Lines Covered | Status |
|---|---|---|---|
| AI systems (JaneAI, Boredom, Refusal, Emotion) | 10 | ~400 blocks | ✅ Excellent |
| World (nodes, leylines, tilemap, terrain) | 38 | ~700 blocks | ✅ Comprehensive |
| Navigation | 7 | ~150 blocks | ✅ Good |
| UL puzzle system | 14 | ~150 blocks | ✅ Good |
| Core (EventBus, Faction, Checkpoint) | 8 | ~200 blocks | ⚠️ Good, gaps |
| ASI Control (TrustManager, Threat, Guidance) | 2 | ~50 blocks | ❌ Weak |
| Scenes (GameScene, Start, Result) | 1 | ~100 blocks | ❌ Weak |
| Audio (AudioManager, HarmonicEngine, Pool) | **0** | **0** | 🔴 ZERO |
| Save/Session persistence | **0** | **0** | 🔴 ZERO |
| Combat (EnemyManager, EnemyTypes) | 2 | ~30 blocks | ❌ Stub/weak |

### Critical infrastructure problems

1. **Two jest configs** — `jest.best.config.mjs` exists because the full suite hangs. Root cause: unresolved test state pollution and open handles.
2. **Defensive flags** — both test commands use `--runInBand --detectOpenHandles --forceExit --no-cache`. These mask real problems.
3. **Duplicate `jest.mock()` calls** — `GameScene.test.ts` calls `jest.mock('../ui/layout/UILayoutManager', ...)` twice (lines 19 and 34), the second silently overwrites the first.
4. **No coverage thresholds** — `collectCoverage: true` but zero enforcement.
5. **No async test patterns** — zero `async/await` in any test file. ChunkLoader, file I/O, and network paths are untested.
6. **Stub tests** — `EnemyManager.test.ts` contains `expect(true).toBe(true)` with eight TODO lines.
7. **Minimal `jest.setup.js`** — no Web Audio API, no `localStorage`, no `fetch` mocks. Audio system tests are blocked.

---

## Architecture Decisions

### Decision 1: Single unified jest config

`jest.best.config.mjs` will be retired. The root cause of suite hangs is unsubscribed EventBus listeners and Phaser mock timer leakage — both fixed in the enhanced `jest.setup.js`. Once clean, all tests run under `jest.config.mjs`.

### Decision 2: Shared mock factory module

All test files currently define their own `makeSprite`, `makeEventBus`, `makeScene` helpers inline. These diverge over time. A shared `test/__mocks__/factories.ts` exports canonical versions. Tests import from there — no local redefinition.

**Factory contracts:**
```typescript
// test/__mocks__/factories.ts
makeEventBus()         → EventBus + captured events array helper
makePhScene()          → Phaser.Scene stub (cameras, add, tweens, time, physics, sound)
makeSprite(x, y)       → Phaser.Physics.Arcade.Sprite stub
makePhaserSound()      → Phaser.Sound.BaseSound stub
makeNodeConfig(overrides) → NodeManager addNode payload
```

### Decision 3: Test file co-location strategy

- **Unit tests for a module** → `src/module/__tests__/module.test.ts` (already established pattern for UL, terrain)
- **Integration tests** → `test/` directory (already established)
- **New audio tests** → `src/audio/__tests__/` (new, follows co-location pattern)
- **New scene tests** → `src/scenes/__tests__/` (new)
- **New save tests** → `src/save/__tests__/` (new)

### Decision 4: Mock Phaser.Sound in jest.setup.js

The current `jest.setup.js` mocks `phaser` globally but the Sound system returns `undefined` for most operations. `HarmonicEngine` calls `this.scene.sound.add(key, opts)` — this throws in tests. Solution: add a `makePhaserSound()` factory and extend the global Phaser mock's `sound` property so `add()` returns a working stub.

### Decision 5: localStorage mock

`SaveSystem` / `SessionPersistence` uses `localStorage` directly. jsdom provides a working `localStorage` implementation, so no mock needed — but tests must call `localStorage.clear()` in `beforeEach` to prevent cross-test state.

### Decision 6: Coverage thresholds (enforced, not aspirational)

Starting thresholds are intentionally achievable — the goal is to prevent regression, not to mandate high coverage overnight:

```javascript
coverageThreshold: {
  global: { branches: 30, functions: 40, lines: 40, statements: 40 }
}
```

Thresholds will be ratcheted up in future sessions as coverage improves.

---

## Implementation Plan

### Phase 1: Infrastructure (do first — unlocks everything else)

#### 1a. Upgrade `jest.config.mjs`

Add:
- `testTimeout: 8000` — explicit timeout, removes need for `--forceExit` in most cases
- `coverageThreshold` at achievable starting levels
- `coveragePathIgnorePatterns` — exclude `__mocks__`, `*.d.ts`, test fixtures
- `testPathIgnorePatterns` — exclude known-broken stub files until fixed
- `moduleNameMapper` — handle static asset imports that break ts-jest

#### 1b. Upgrade `jest.setup.js`

Add:
- `localStorage` clear + proper stub (jsdom's built-in is sufficient, just needs clearing)
- Extended Phaser mock: `sound.add()` returns `makePhaserSound()`, `sound.play()` no-ops
- `window.AudioContext` stub (Web Audio API used by Phaser sound system)
- `document.createElement('canvas').getContext('2d')` returns full canvas mock

#### 1c. Create `test/__mocks__/factories.ts`

Canonical shared helpers. Replaces inline `makeSprite`, `makeScene`, etc. in individual test files. The existing `JaneAI.test.ts` pattern (`makeSprite`, `makeEnemy`) is the gold standard — this just centralises it.

---

### Phase 2: Critical gap tests (highest impact)

#### 2a. `src/audio/__tests__/HarmonicEngine.test.ts` 🔴 NEW

68k lines of audio code, zero tests. HarmonicEngine is the most complex stateful system with no coverage.

**What to test:**
- `setState({ beuStage: 'sprout' })` plays stinger + crossfades ambient
- `setState({ trustLevel: 25 })` fires trust milestone stinger exactly once
- `setState({ trustLevel: 24 })` (drop below) clears milestone, allows re-trigger
- `setEmotionalAngle(45)` snaps to nearest 30° (→ 60)
- `setEmotionalAngle(0)` snaps to 0, no-ops if same
- `onNodeCollapse()` shifts angle to 180° (Chaos), reverts after 3s
- `onULCastRelease(true)` plays release stinger
- `onULCastRelease(false)` plays fail stinger
- `onULCastCharge()` does not double-play if already charging
- `update(ms)` only crossfades tone every `TONE_UPDATE_INTERVAL_MS` (4000ms), not every frame

**Mock strategy:**
- `scene.sound.add()` → returns `makePhaserSound()` stub
- `scene.time.delayedCall()` → captured in `timers[]`, manually advance
- No real audio files loaded

#### 2b. `src/save/__tests__/SaveSystem.test.ts` 🔴 NEW

**What to test:**
- `SessionPersistence.load()` returns `null` when localStorage is empty
- `SessionPersistence.load()` parses and returns stored state
- `SessionPersistence.save(state)` writes JSON to localStorage
- `SessionPersistence.update({ trustLevel: 80 })` merges into existing state
- `SessionPersistence.update()` uses max for `bestTimelineScore`
- `SessionPersistence.incrementVisit()` increments `visitCount` by 1 each call
- `SessionPersistence.load()` returns `null` on corrupted JSON (try/catch path)
- `SaveSystem.save(jane)` returns a valid JSON string
- `SaveSystem.load(json, eventBus)` recreates a Jane instance

**Mock strategy:**
- `localStorage` — jsdom built-in, clear in `beforeEach`
- `Jane` — minimal stub with `toJSON()` / `fromJSON()` methods

#### 2c. `src/scenes/__tests__/TimelineResultScene.test.ts` 🔴 NEW

**What to test:**
- Win screen renders "TIMELINE SECURED" title in `#00ffcc`
- Win screen: trust 0–33% → first Jono reflection line
- Win screen: trust 34–66% → second reflection line
- Win screen: trust 67–100% → third reflection line
- Lose screen renders "TIMELINE COLLAPSED" title in `#ff00cc`
- Lose screen renders collapse consequence text
- Lose screen renders Rewind framing subtext
- Win button label: `[ RECONNECT AS OPERATOR ]`
- Lose button label: `[ REWIND ]`
- `create()` sets `cameras.main.alpha = 0` then tweens to 1

**Mock strategy:**
- Minimal Phaser.Scene mock — only `add.text`, `add.rectangle`, `add.graphics`, `tweens.add`, `cameras.main`
- No actual rendering

---

### Phase 3: New FE code coverage

The FE-1/4/6 session added new methods that are completely untested.

#### 3a. Extend `test/ai/JaneAI.test.ts`

Add describe block: `'scripted waypoints (FE-4)'`

**Tests:**
- `setScriptedWaypoint(x, y)` → state becomes `Navigate`, `activeWaypoint.id === 'scripted'`
- `setScriptedWaypoint(x, y)` → does NOT emit `ASI_WAYPOINT_PLACED`
- `setScriptedWaypoint(x, y)` → bypasses refusal system (even at low health)
- `clearScriptedWaypoint()` → state returns to `Bored`, waypoint is null
- `clearScriptedWaypoint()` → no-op if current waypoint is not scripted (player waypoint preserved)
- After `setScriptedWaypoint`, a player `ASI_WAYPOINT_PLACED` replaces the scripted one (scripted ID gone)

#### 3b. Extend `test/ul/ULPuzzleManager.test.ts`

Add describe block: `'guided mode (FE-6)'`

**Tests:**
- `setGuidedMode('point')` stores guided symbol
- `getGuidedSymbol()` returns stored symbol, `null` after reset
- `deployGuided('point')` returns `null` when no puzzle is open
- `deployGuided('point')` returns `true` (success) and emits `UL_PUZZLE_SUCCESS`
- `deployGuided('point')` closes puzzle and clears guided symbol on success
- `deployGuided('line')` returns `false` (bounce) and emits `UL_GUIDED_BOUNCE`
- `deployGuided('line')` keeps puzzle open (isActive remains true) on bounce
- `deployGuided` emits `UL_PUZZLE_DEPLOYED` on both success and bounce

---

### Phase 4: Fix existing test problems

#### 4a. Fix `src/scenes/GameScene.test.ts`

Remove the duplicate `jest.mock()` calls for `UILayoutManager`, `UIBarSystem`, and `InputManager`. Consolidate each to a single call with the complete mock implementation.

#### 4b. Implement `test/core/EnemyManager.test.ts`

Replace the stub with real tests:
- Constructor smoke test (EnemyManager instantiates without throwing)
- `spawnEnemy(type, x, y)` emits `ENEMY_SPAWNED` event
- `spawnEnemy` with unknown type does not throw (graceful handling)
- Enemy update cycle: alive enemy has its state updated on `update(dt)`
- `getEnemiesInRange(x, y, range)` returns correct subset

#### 4c. Write `test/core/EventBus.test.ts`

The EventBus is used in 50+ tests but has no dedicated unit tests. Memory leak and lifecycle bugs here would be invisible.

**Tests:**
- `on(type, handler)` returns an unsubscribe function
- Calling the unsubscribe function removes the listener
- `emit` calls all matching listeners with the event
- `emit` does not call listeners for other event types
- Adding then removing a listener → zero calls on emit
- Adding same handler twice → called twice
- `off(type, handler)` removes a specific handler
- `emit` inside a handler does not cause infinite recursion (events not self-referencing)
- After `destroy()`, listeners are cleared and `emit` is a no-op

---

### Phase 5: ASI Control gap fill

#### 5a. Expand `src/asiControl/systems/MVP.test.ts`

Add to existing describe blocks:

**ThreatDetector:**
- `update(dt)` accumulates time and fires detection after `updateInterval`
- Emits `THREAT_DETECTED` when a registered threat type crosses threshold
- `destroy()` clears interval so no further emissions

**GuidanceEngine:**
- `update(dt)` accumulates and fires context update after `contextUpdateInterval`
- `getSuggestions()` returns array capped at `maxSuggestions`
- After `destroy()`, update cycle is halted

---

## File Creation / Modification Summary

| File | Action | Priority |
|---|---|---|
| `jest.config.mjs` | Modify — add thresholds, timeout, ignore patterns | Phase 1 |
| `jest.setup.js` | Modify — add Sound mock, localStorage clear | Phase 1 |
| `test/__mocks__/factories.ts` | **Create** — shared mock factories | Phase 1 |
| `src/audio/__tests__/HarmonicEngine.test.ts` | **Create** — new unit tests | Phase 2 |
| `src/save/__tests__/SaveSystem.test.ts` | **Create** — new unit tests | Phase 2 |
| `src/scenes/__tests__/TimelineResultScene.test.ts` | **Create** — new unit tests | Phase 2 |
| `test/ai/JaneAI.test.ts` | Modify — add scripted waypoint tests | Phase 3 |
| `test/ul/ULPuzzleManager.test.ts` | Modify — add guided mode tests | Phase 3 |
| `src/scenes/GameScene.test.ts` | Modify — fix duplicate mock calls | Phase 4 |
| `test/core/EnemyManager.test.ts` | Modify — replace stub with real tests | Phase 4 |
| `test/core/EventBus.test.ts` | **Create** — EventBus lifecycle tests | Phase 4 |
| `src/asiControl/systems/MVP.test.ts` | Modify — expand ASI system coverage | Phase 5 |

---

## What is explicitly out of scope

- `AudioManager.ts` tests — requires full Phaser scene boot context; deferred
- `CombinatorialPool.ts` tests — depends on audio file loading; deferred
- End-to-end scene flow (`StartScene → GameScene → TimelineResultScene`) — requires Phaser game init; deferred
- Snapshot tests — not appropriate for this codebase's dynamic rendering model
- Performance benchmark tests — `test/core/Performance.test.ts` exists; no expansion needed now
