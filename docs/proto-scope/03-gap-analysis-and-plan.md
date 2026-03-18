# 03 — Gap Analysis & Implementation Plan

> Honest assessment of what works, what's missing, and what to build next. Effort is measured in complexity tiers, not time estimates. Priorities are ordered by "what unblocks the most gameplay."

---

## Design vs. Code Reality Matrix

### The Core Design Promise

The game promises: **You are an ASI guiding autonomous robots across a planetary ley-line network, navigating ethical tension between intervention and autonomy, using a Universal Language as both power system and puzzle mechanic.**

### What Exists vs. What's Needed

| Design Element | Code Status | Gap Severity |
|---------------|-------------|-------------|
| Player = ASI | ASI Control subsystem (3,500 lines) runs behind scenes. **Player directly controls Jane with WASD.** No ASI perspective exists. | **CRITICAL** — the game is fundamentally a platformer, not an ASI sim |
| Autonomous Jane | `updateAI()` is empty. Jane does whatever WASD says. | **CRITICAL** — the ethical tension can't exist without autonomy |
| Ley Line Travel | Network generates, visualizes, energy system exists. **Pathfinder returns fake results.** No rail mechanics. | **HIGH** — core traversal mechanic is non-functional |
| Universal Language | Engine validates, rules exist, puzzles defined. **No in-game UI.** Nothing calls the engine during gameplay. | **HIGH** — entire magic/science system invisible to player |
| MagnetoSpeeder Physics | Speed physics engine is excellent. Speeder data model is separate. **SpeederManager disconnected from GameScene.** | **MEDIUM** — speed works through NavigationManager, but upgrade/energy path is broken |
| Multiple Companions | PsiSysRobot, AlternateJane defined. **Both are empty classes.** | **HIGH** — 4 unique bots is core to the game loop |
| Mission Completion | 16 outcome types defined. **All handlers empty.** Missions can start but never resolve. | **HIGH** — no gameplay loop completion |
| Narrative | NarrativeEngine has events. **No dialogue, cutscenes, or story delivery.** | **MEDIUM** — can defer to text-only initially |
| Combat Depth | Basic damage formula works. **One enemy type (test slime), bounce-only AI.** | **MEDIUM** — sufficient for prototype loop |
| Biomes | Classification code exists. **Only procedural sine terrain generated.** | **LOW** — can ship with one biome for prototype |

---

## Priority Stack

Ordered by "what creates the most demonstrable gameplay per unit of work." Each priority has a clear done-when exit criterion.

### Priority 0: Decompose GameScene

**Why first**: Every other priority requires modifying GameScene. At 1,675 lines with 59 imports, any change risks cascading breakage. This is infrastructure that unblocks everything else.

**What to extract**:

| Extract To | Lines Moving | Methods |
|------------|-------------|---------|
| `InputController.ts` | ~120 | All key bindings, touch setup, input state |
| `SystemInitializer.ts` | ~200 | Manager instantiation chain (steps 12-21 from create()) |
| `SpeederController.ts` | ~150 | `toggleSpeederBoarding()`, `updateSpeederMovement()`, `updateSpeederInteractionHint()`, `updateHypersonicEffect()` |
| `ASISceneIntegration.ts` | ~80 | Guidance tracking, threat response, trust feedback |
| `TerrainSceneSetup.ts` | ~120 | Ground level calculation, platforms, ChunkLoader init |

**Target**: GameScene < 600 lines, only `create()` delegation, `update()` loop, and scene lifecycle.

**Done when**: All existing tests still pass. GameScene has ≤ 10 direct imports.

**Complexity**: Tier 2 — Substantial refactor, but purely mechanical. No new logic.

---

### Priority 1: Jane Autonomy (The Identity Fix)

**Why**: Without this, the game is "platformer with overhead." With it, the core ethical tension EXISTS.

**What to build**:

1. **Behavior Tree for Jane** (`src/ai/JaneBehaviorTree.ts`)
   - States: Idle → Explore → Seek Ley Node → Engage Enemy → Flee → Follow Guidance → Resist Guidance
   - Each state = simple movement + event emission
   - Transition conditions: health thresholds, ley line proximity, threat presence, trust level

2. **Autonomy System** (`src/ai/AutonomyManager.ts`)
   - Jane makes her own decisions on a tick timer (every 2–5 seconds)
   - ASI (player) can suggest actions (existing GuidanceEngine)
   - Jane evaluates suggestions against her own priorities
   - At low trust: Jane ignores most suggestions
   - At high trust: Jane follows most suggestions
   - Player never has direct WASD control (or direct control is "emergency override" that costs trust)

3. **ASI Input Remap**
   - Current WASD → "Suggest direction" (guidance arrow appears)
   - Click destination → "Set waypoint" (guidance target)
   - Number keys → "Command tier" (subtle hint / strong suggestion / direct override)
   - Jane responds based on trust level and her own state

**Done when**: Jane moves on her own. Player can suggest movement. Jane sometimes refuses. Trust goes up when suggestions align with Jane's goals, down when they conflict.

**Complexity**: Tier 3 — New system with behavioral logic. Requires integrating with existing TrustManager + GuidanceEngine.

---

### Priority 2: Ley Line Rail Travel

**Why**: The ley line network is the world's skeleton. Without travel mechanics, the planet is just flat ground.

**What to build**:

1. **Real Pathfinder** — Replace `LeyLinePathfinder.ts` stub with A*/Dijkstra on the ley line graph.
2. **Rail Movement** — When Jane/speeder enters a ley line node, movement snaps to the line until the next node. Speed boosted by ley line energy.
3. **Node Interaction** — At each node: branch choice (if multiple connections), energy cost, optional puzzle/encounter.
4. **Instability** — Implement the existing instability escalation chain (minor→moderate→major→rift). Ley line breaks force pathfinding recalculation.

**Done when**: Jane can travel from node A to node B along a ley line path. Speed boost is visible. An instability event disrupts a line.

**Complexity**: Tier 2 — Foundation code exists. Need to connect pieces + write pathfinder.

---

### Priority 3: UL Puzzle Integration

**Why**: The Universal Language IS the game's unique mechanic. The engine works. It just needs a face.

**What to build**:

1. **Puzzle UI** — Symbol input panel (Phaser), visual feedback for valid/invalid sequences
2. **Puzzle Triggers** — At ley line nodes, during instability events, before boss encounters
3. **Puzzle Effects** — Solve → energy restore, line stabilization, or combat buff
4. **Wire to ulEngine** — Existing `ulEngine.processAttempt()` already validates; just need to call it

**Done when**: Player encounters a puzzle at a ley line node, inputs symbols, engine validates, gameplay effect occurs.

**Complexity**: Tier 2 — Engine done, needs UI + trigger wiring.

---

### Priority 4: Mission Loop Closure

**Why**: Without mission completion, there's no progression.

**What to build**:

1. **Complete 3 outcome handlers** in MissionSystem: victory, defeat, diplomatic (of 16 defined)
2. **Reward granting** — XP, items, trust change, ley line effects
3. **Mission trigger system** — Wire `triggerEvent()` to EventBus
4. **One complete sample mission** — "Awaken in the Rift" with all objectives completable

**Done when**: A mission starts via trigger, all objectives can be completed, an outcome fires, rewards grant.

**Complexity**: Tier 1 — Filling in stubs with relatively simple logic.

---

### Priority 5: Companion Bootstrap

**Why**: The 4-bot system is unique to the game, but implementing all 4 is too much for prototype. Start with one.

**What to build**:

1. **PsiSysRobot implementation** — Stats, sprite, basic behavior (follow Jane, heal on low health)
2. **Companion switching** — ASI can switch focus between Jane and PsiSysRobot
3. **Trust per companion** — Each bot has independent trust relationship with ASI

**Done when**: PsiSysRobot exists in-game, follows Jane, heals, can be directly focused by ASI.

**Complexity**: Tier 2 — Needs new sprite, behavior tree (simpler than Jane's), UI indicator.

---

## Complexity Tier Definitions

| Tier | Description | Example |
|------|-------------|---------|
| 1 | Filling stubs, wiring existing pieces, writing handlers | Mission outcome handlers, puzzle trigger points |
| 2 | New system with existing patterns to follow, moderate integration | Ley line pathfinder, companion with existing patterns |
| 3 | New architectural concept, significant integration across systems | Jane autonomy + ASI input remap |
| 4 | Engine-level change, may require fundamental redesign | (Nothing in this plan — deferred to Phase 2/Godot) |

---

## What NOT to Build (Prototype Scope)

| Feature | Why Not |
|---------|---------|
| Multiple biomes with real data | One procedural biome sufficient to validate loop |
| Full 16 mission outcome types | 3 types validates the system |
| All 4 companions | 1 companion validates the pattern |
| Blockchain/web3 integration | Not a gameplay feature |
| Multiplayer/multiverse branching | Deferred to Phase 2 |
| Real-world terrain data (SRTM/GEBCO) | Procedural is fine for prototype |
| IPFS content loading | Local mods sufficient |
| Full narrative/cutscene system | Text UI + events sufficient |
| Character cosmetics system | No visual variety needed for prototype |

---

## Suggested Work Sequence

```
P0: Decompose GameScene
 └── Unblocks safe modification of everything below
     │
     ├── P1: Jane Autonomy ←── MOST IMPORTANT, defines the game
     │    └── Requires: InputController.ts (from P0), existing ASI subsystem
     │
     ├── P2: Ley Line Rail Travel ←── Defines the world
     │    └── Requires: TerrainSceneSetup.ts (from P0), existing ley line code
     │
     └── P3: UL Puzzle Integration ←── Defines the magic system
          └── Requires: existing ulEngine, Ley Line nodes (from P2)
          │
          ├── P4: Mission Loop Closure ←── Progression
          │    └── Requires: Events from P1/P2/P3
          │
          └── P5: Companion Bootstrap ←── Depth
               └── Requires: Autonomy pattern from P1
```

Dependencies flow downward. P1–P3 can be parallelized after P0 completes. P4–P5 depend on earlier priorities.

---

## Core Loop Validation Target

A playable prototype demonstrates THIS loop:

1. **ASI views world** — Camera shows Jane near a ley line node
2. **Jane acts autonomously** — She decides to explore toward a nearby unstable node
3. **ASI can guide** — Player suggests a different direction; Jane evaluates and may follow
4. **Ley line travel** — Jane enters a ley line segment, speed increases, terrain LOD adapts
5. **Encounter** — Instability event or enemy at next node
6. **UL puzzle or combat** — Player solves puzzle to stabilize / Jane fights autonomously
7. **Resolution** — Mission objective completes, trust adjusts, energy flows change
8. **Repeat** — Jane makes new decision based on updated world state

**Exit criterion**: All 8 steps occur in sequence without developer intervention. A new player can experience this loop within 3 minutes of starting the game.
