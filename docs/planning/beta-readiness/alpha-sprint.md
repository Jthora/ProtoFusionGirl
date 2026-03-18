# Alpha Sprint Plan — 3 Days to Internal Testable Build

> **Goal**: A first-time player can complete one full loop:
> enter → understand they're the ASI → guide Jane → face real stakes → succeed or fail → want to return
>
> **Not the goal**: polish, sprites, audio, full mission set.
> The goal is a loop that *communicates the game's identity*.

---

## Pre-Sprint Blocker (30 min before anything else)

### Fix the test import crash

**File**: `src/data/animationCatalog.ts`
**Problem**: Circular dependency with `src/ai/JaneAI.ts` — the test runner cannot boot.
**Fix**: Extract `JaneAIState` enum into its own file (`src/ai/JaneAIState.ts`), import from there in both `JaneAI.ts` and `animationCatalog.ts`. No functional change, breaks the cycle.

**Why first**: Every other task involves writing or fixing code. If the test suite can't run, there's no way to verify anything without manually playing the game every time.

---

## Work Item 1 — Wire TrustManager (2–3 hours)

**Files**: `src/asiControl/systems/TrustManager.ts`, `src/asiControl/systems/GuidanceEngine.ts`
**Tracker**: Part of P1 in `docs/proto-scope/03-gap-analysis-and-plan.md`

**What's missing**: The 6 event handler stubs in TrustManager all have `// TODO` bodies. The trust meter shows on the ASI Dashboard but never moves.

**What to implement**:
```
handleGuidanceGiven()     → trust += 0 (neutral — the act of guiding isn't rewarded)
handleGuidanceFollowed()  → trust += 3 (Jane chose to follow → relationship is working)
handleGuidanceIgnored()   → trust -= 1 (Jane chose not to follow → slight friction)
handlePlayerSuccess()     → trust += 5 (node stabilized, rift sealed)
handlePlayerFailure()     → trust -= 3 (node collapsed, timeline event)
handleMagicUsage()        → trust += 2 (UL gesture — Jane notices the operator knows the language)
```

The trust delta values are tunable. The key is that they fire at all.

**Wire to dashboard**: `ASIDashboard.setTrust()` is already implemented — just call it when trust changes.

**Verification**: Play the game, place a waypoint, Jane navigates to it → trust increases. Watch the TRUST% on the dashboard update.

---

## Work Item 2 — Add One Enemy Behavior (1 day)

**Files**: `src/core/EnemyManager.ts`, `src/combat/EnemyTypes.ts`, `src/scenes/GameScene.ts`
**Tracker**: P2 combat items in gap analysis

**Current state**: The slime is spawned at `playerStartX + 380` (from first-run UX work) but it doesn't move, attack, or die. It is a static sprite.

**What to implement**:

### Patrol/approach behavior
Simple state machine on the slime: `patrol → chase → attack`.
- `patrol`: move left/right between two points, reverse on wall/edge
- `chase`: if Jane is within `detectionRange` (200px), move toward her
- `attack`: if within `attackRange` (48px), deal damage every 800ms

This doesn't need to be sophisticated. The emotional requirement is: *the player can see the enemy approaching Jane and feel compelled to act.*

### Damage application
```typescript
// On attack contact:
eventBus.emit({ type: 'JANE_TOOK_DAMAGE', data: { amount: 10, sourceId: enemy.id } });
```
Wire `JANE_TOOK_DAMAGE` in `PlayerManager` to reduce Jane's health. The health bar is already rendered by `UIManager`.

### Enemy death
When health reaches 0:
- Play death animation (placeholder: scale to 0 over 300ms)
- Remove from physics group
- Emit `ENEMY_DEFEATED`
- Wire `ENEMY_DEFEATED` in `TrustManager.handlePlayerSuccess()`

**Verification**: Spawn game → see slime approach Jane from behind → place waypoint to redirect Jane → she escapes → feel like the ASI.

---

## Work Item 3 — Consequence Chain (4–6 hours)

**Files**: `src/world/NodeManager.ts`, `src/world/RiftManager.ts`, `src/scenes/GameScene.ts`
**Tracker**: P2 in gap analysis — node stability consequences

**Current state**: Nodes decay at defined rates, `NODE_STABILITY_CHANGED` fires, `RiftManager.checkNodeStability()` is called. But the consequences are not visible to the player.

**What to implement**:

### Node at 0 → world event
When any node reaches `stability === 0`:
```typescript
eventBus.emit({ type: 'NODE_COLLAPSED', data: { nodeId, x, y } });
```
Wire to: spawn 3 enemies at node position, show "NODE COLLAPSED — RIFT EXPANDING" on ASI Dashboard (in red), trigger rift ambient FX (`RiftAmbientFX.appear()` is already implemented).

### Rift sealed → recovery
When a rift is sealed (`RIFT_SEALED` already fires):
- Restore 30 stability to the collapsed node
- Show "RIFT SEALED — NODE STABILIZING" on dashboard
- Emit `PLAYER_SUCCESS` → TrustManager fires

### Timeline degradation as pressure
Every 30 seconds of no player action: degrade Rift Zone node by 5. The player needs to feel urgency. The node panel on the ASI Dashboard already shows the numbers — they just need to move.

**Verification**: Do nothing for 2 minutes → Rift Zone node collapses → rift spawns → enemies pour out → timeline event shows. Player understands the stakes required no explanation.

---

## Work Item 4 — Win / Lose Moment (4 hours)

**Files**: `src/scenes/GameScene.ts`, new `src/scenes/TimelineResultScene.ts`
**This is the most important item.** Without it there's no loop.

### Win condition
When all three nodes are above 60% stability simultaneously for 10 continuous seconds:
- Fade to black
- Show: `TIMELINE SECURED` (large, cyan) / trust rating / time elapsed / `[ RECONNECT ]` button

### Lose condition
When all three nodes simultaneously hit 0% stability:
- Slow the game to 0.3x speed for 2s (dramatic pause)
- Show: `TIMELINE COLLAPSED` (magenta) / `"The timeline unraveled without your guidance."` / `[ REWIND ]` button

The `[ REWIND ]` button uses `RewindSystem.rewindTo()` — the system exists and records decision points. This is the literal reason RewindSystem was built.

### Score display (minimal)
```
TIMELINE SECURED
━━━━━━━━━━━━━━━━━━━
Trust Rating:    72%  ▲
Nodes Saved:     2/3
Timeline Intact: YES
━━━━━━━━━━━━━━━━━━━
[ RECONNECT AS OPERATOR ]
```

**Verification**: Stabilize all nodes → get a win screen with a meaningful score → press reconnect → first-run sequence runs (shorter version for returning players).

---

## Work Item 5 — Basic Session Persistence (3 hours)

**Files**: `src/save/SaveSystem.ts`, `src/core/GameBootstrap.ts`
**Tracker**: First-run detection already uses `pfg_operator_id` in localStorage

**What to save**:
```typescript
interface SessionState {
  operatorId: string;        // already saved
  visitCount: number;        // increment on each session
  trustLevel: number;        // save on session end / periodically
  bestTimelineScore: number; // highest trust % on a win
  lastNodeStabilities: Record<string, number>; // for returning player context
}
```

**How to use it**:
- On return visit: Jono's greeting references trust level ("You've built 72% trust with Jane. She's starting to anticipate your guidance.")
- Dashboard initializes with last-session trust level instead of 50
- Win screen shows "Personal Best: 72%" if beaten

**This is not a full save system.** It's just enough to make returning feel meaningful.

**Verification**: Play to win → close tab → reopen → Jono greeting references your history → trust starts where you left off.

---

## Work Item 6 — Remove Debug Noise (2 hours)

**File**: `src/scenes/GameScene.ts` and others

44 `console.log` calls in GameScene alone produce wall-of-text spam in DevTools. Beta testers will open DevTools — it needs to not look like a development crash.

**Replace with**:
```typescript
if (import.meta.env.DEV) {
  console.log('🎮 GameScene create() method called');
}
```

Or better: gate behind a `DEBUG_LOGGING` env flag so it can be toggled without code changes.

Also: fix the `require()` call at line 72 of `GameScene.ts` — it's CommonJS inside an ESM file. Webpack logs a warning. Replace with a dynamic `import()` or remove entirely if the asset validation isn't needed at runtime.

---

## Sprint Schedule

| Day | Morning | Afternoon |
|-----|---------|-----------|
| **Day 1** | Fix import blocker + wire TrustManager | Enemy behavior (patrol + damage) |
| **Day 2** | Enemy death + `ENEMY_DEFEATED` wiring | Consequence chain (node collapse → rift → enemies) |
| **Day 3** | Win / lose screens + result display | Session persistence + debug cleanup |

---

## Definition of "Alpha Done"

Run through this sequence without touching any code:

1. Open the game fresh (no localStorage)
2. See the ASI boot sequence and StartScene
3. Click ENTER SIMULATION
4. Watch Jono materialize and give the 4-beat intro
5. See Jane moving autonomously with a slime approaching from behind
6. Place a waypoint → Jane navigates away → trust increases
7. Do nothing for 90 seconds → Rift Zone node collapses → rift appears → enemies spawn
8. Guide Jane toward the rift → she fights → enemies die → rift begins sealing
9. Stabilize all three nodes → see `TIMELINE SECURED` screen with trust score
10. Close browser → reopen → Jono references previous session

If all 10 steps work, the game is alpha.

---

## What This Sprint Does NOT Include

These are real needs but are **out of scope for the 3-day sprint**:

- Real sprite art (placeholder geometry acceptable)
- Audio (silence acceptable for alpha)
- UL puzzle system (no `@ul-forge/core` integration)
- Full mission arc with named objectives
- Multiplayer / server-side persistence
- Onboarding beyond Jono's existing dialogue
- `TimestreamUI.ts` TypeScript error (pre-existing, does not affect gameplay)
- Phase 2 (Rust UL engine, Godot migration) — see architectural roadmap

---

## Files That Will Change

| File | Change |
|------|--------|
| `src/ai/JaneAI.ts` | Extract `JaneAIState` enum |
| `src/ai/JaneAIState.ts` | New file — enum only |
| `src/data/animationCatalog.ts` | Import from new file |
| `src/asiControl/systems/TrustManager.ts` | Implement 6 event handlers |
| `src/core/EnemyManager.ts` | Add patrol + chase + attack loop |
| `src/scenes/GameScene.ts` | Wire `NODE_COLLAPSED`, remove console.logs, fix require() |
| `src/world/NodeManager.ts` | Emit `NODE_COLLAPSED` at 0 stability |
| `src/save/SaveSystem.ts` | Implement SessionState persistence |
| `src/scenes/TimelineResultScene.ts` | New file — win/lose screen |
