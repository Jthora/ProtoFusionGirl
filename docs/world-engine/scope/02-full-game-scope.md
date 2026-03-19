# Scope: Full Game — Every System, Every Task

> The complete accounting of work required to reach a playable prototype that
> demonstrates the 8-step core loop from docs/proto-scope/03-gap-analysis-and-plan.md.
>
> Complexity: S = hours, M = 1–2 days, L = 3–5 days, XL = 1+ week.
> This document is intentionally exhaustive. Its purpose is to prevent
> underestimation. Read it fully before planning sprints.

---

## How to Read This

Each section is a system. Each system has:
- A **status** (what currently exists, honestly)
- A **gap** (what is missing)
- A **task list** with complexity estimates

Total estimates at the bottom of each section. Grand total at the end.

---

## SYSTEM 0: Infrastructure / GameScene Decomposition

**Current status:** GameScene.ts is 2,756 lines. 65+ managers instantiated in
one `create()` call. Any change to GameScene risks cascading failures.

**Gap:** Every other system requires modifying GameScene safely.

| Task | Complexity | Notes |
|------|-----------|-------|
| S0.1 Extract `InputController.ts` | M | All key bindings, touch setup, input state |
| S0.2 Extract `SystemInitializer.ts` | M | Manager instantiation chain |
| S0.3 Extract `WorldSceneSetup.ts` | M | Terrain, chunks, ground setup |
| S0.4 Extract `EntitySceneSetup.ts` | M | Enemy, NPC, player instantiation |
| S0.5 Extract `UISceneSetup.ts` | M | All UI manager creation |
| S0.6 Extract `NarrativeSceneSetup.ts` | M | Jono, Terra, EventHistoryLog, etc. |
| S0.7 Extract `AudioSceneSetup.ts` | M | AudioManager, HarmonicEngine |
| S0.8 Extract `VisualSceneSetup.ts` | M | DOM overlays, particle systems, VFX |
| S0.9 Reduce GameScene to <600 lines | L | Delegation only; no logic |
| S0.10 Fix all GameScene tests post-extraction | L | Many mocks will break |
| S0.11 Remove dead import: AnchorManager | S | Never instantiated |
| S0.12 Remove dead import: BeuDataPanel, BeuTransmission | S | Not initialized |
| S0.13 Strip `preloadCombinatorialAudio` (372 files) | M | Replace with 20 named keys max |
| S0.14 Lazy-init deferred systems (30+ managers) | XL | Identify which 30 can be on-demand |
| S0.15 Boot fidelity: start LOW, upgrade on FPS data | S | Requires FidelityController (WE-4) |
| S0.16 Verify `npm test` passes after full decomposition | M | |

**S0 total: XL (2–3 weeks). This is the longest single block of work.**
**It is also the most foundational. Nothing else can be done safely without it.**

---

## SYSTEM 1: World Engine

See [01-world-engine-tasks.md](01-world-engine-tasks.md) for full detail.

**Summary:** WE-0 through WE-7. ~5–9 weeks.
**Critical path:** WE-0 (demolition) → WE-1 (signal) → WE-2 (physics) → rest parallel.

---

## SYSTEM 2: Jane Autonomy (The Identity Fix)

**Current status:** `JaneAI` class exists, has a state enum, but `updateAI()` is
effectively empty. Jane moves wherever WASD dictates. The ethical tension cannot
exist without autonomy.

**Gap:** Jane makes no independent decisions. Player directly controls Jane.

| Task | Complexity | Notes |
|------|-----------|-------|
| A2.1 Define `JaneBehaviorTree` state enum | S | Idle, Explore, SeekLeyNode, EngageEnemy, Flee, FollowGuidance, ResistGuidance |
| A2.2 Implement Idle state | S | Stand, look around, occasional idle animation |
| A2.3 Implement Explore state | M | Move toward nearest undiscovered node; pathfind around terrain |
| A2.4 Implement SeekLeyNode state | M | Follow ley line curve at walking speed toward waypoint |
| A2.5 Implement EngageEnemy state | M | Move toward enemy, trigger attack at range; retreat at low health |
| A2.6 Implement Flee state | S | Move away from threat; trigger at health < 20% |
| A2.7 Implement FollowGuidance state | M | Move toward ASI waypoint suggestion |
| A2.8 Implement ResistGuidance state | S | Continue current goal; emit JANE_RESISTED event |
| A2.9 Implement state transition conditions | M | Health thresholds, proximity to entities, trust level, goal priority |
| A2.10 Implement `AutonomyManager` (decision tick) | M | 2–5s tick; evaluates world state, selects state |
| A2.11 Implement guidance evaluation in AutonomyManager | M | Receives ASI suggestion; trust-weighted acceptance probability |
| A2.12 Remap WASD: direct movement → direction suggestion | L | Big input paradigm change; affects existing tests and feel |
| A2.13 Implement command tier system (keys 1–3) | M | Subtle / strong / urgent suggestion; trust cost scaling |
| A2.14 Implement emergency override input | M | Forces Jane; significant trust cost; should feel "bad" |
| A2.15 Add trust feedback to UIBarSystem | S | Trust level visible to player at all times |
| A2.16 Add Jane AI state visualization (debug) | S | Small text indicator in dev mode |
| A2.17 Wire AutonomyManager to TrustManager | M | Trust affects acceptance probability, override costs |
| A2.18 Test: Jane moves on her own without input | M | No WASD pressed → Jane explores autonomously |
| A2.19 Test: Jane refuses suggestion at low trust | M | Trust < 20 → ResistGuidance fires with >70% probability |
| A2.20 Test: trust rises when guidance aligns with Jane's goal | M | Jane heading to node, ASI suggests same node → trust +2 |

**A2 total: XL (2–3 weeks). This single system IS the game's identity.**

---

## SYSTEM 3: Ley Line Rail Travel

**Current status:** Ley line network generates and visualizes. Pathfinder returns
stub/fake results. No rail movement mechanics. Speeder energy path broken.

**Gap:** The ley line network is scenery, not infrastructure.

| Task | Complexity | Notes |
|------|-----------|-------|
| LT3.1 Implement A* pathfinder on ley line graph | M | Standard algorithm on node graph; nodes are vertices, ley line segments are edges |
| LT3.2 Implement edge weights (distance + instability penalty) | S | Broken/instable segments cost more; impassable if disrupted |
| LT3.3 Path invalidation on instability event | M | Recalculate when segment breaks |
| LT3.4 Implement rail snap mechanic | M | Jane/speeder within snap distance of ley line → locks to curve |
| LT3.5 Implement rail movement (speed boost on ley line) | M | Movement speed multiplied by ley line energy |
| LT3.6 Rail exit at node (branch choice) | M | At node with multiple connections: branch UI or auto-follow current heading |
| LT3.7 Speeder energy consumption on rail | M | Energy drains at rate proportional to speed; depletes at 0 |
| LT3.8 Speeder recharge at recharge nodes | S | Full restore when at RECHARGE type node |
| LT3.9 Implement node branch choice UI | M | Simple: L/R arrow prompt at junction |
| LT3.10 Instability escalation chain (minor→major→disruption) | M | Existing event system; wire up consequence chain |
| LT3.11 Rift formation from sustained disruption | M | After N seconds of disruption: RIFT_FORMED at that segment |
| LT3.12 Fast travel unlock (visited nodes) | M | Once discovered and visited: fast travel available in network view |
| LT3.13 Test: Jane travels from node A to node B autonomously | L | Full integration test |
| LT3.14 Test: instability breaks path, Jane reroutes | M | |

**LT3 total: L–XL (1.5–2.5 weeks)**

---

## SYSTEM 4: Universal Language Integration

**Current status:** `ulEngine.processAttempt()` validates sequences. Rules
defined. Puzzle objects defined. Zero in-game presence. Nothing calls the engine
during gameplay.

**Gap:** The game's unique mechanic is invisible.

| Task | Complexity | Notes |
|------|-----------|-------|
| UL4.1 Implement UL puzzle input panel (Phaser UI) | L | Symbol grid, selectable cells, submit/cancel |
| UL4.2 Implement symbol render assets | M | 12 base symbols × 3 modifiers = 36 glyphs minimum; can be procedural initially |
| UL4.3 Implement input state machine | M | Select symbol → apply modifier → validate → submit |
| UL4.4 Implement visual feedback for valid/invalid | S | Green glow / red flash + particle |
| UL4.5 Wire panel to `ulEngine.processAttempt()` | S | Existing function; just needs to be called |
| UL4.6 Puzzle trigger: node arrival | M | NodeInteractionController offers puzzle at appropriate nodes |
| UL4.7 Puzzle trigger: instability event | M | UIManager shows puzzle on LEYLINE_INSTABILITY if player-facing |
| UL4.8 Puzzle trigger: rift seal | M | Rift entity offers seal puzzle on interaction |
| UL4.9 Puzzle effect: solve → energy restore (+20) | S | emits LEYLINE_STABILIZED, LeyLineManager handles |
| UL4.10 Puzzle effect: cleanse → corruption reduce (-40) | S | |
| UL4.11 Puzzle effect: combat buff for Jane | S | emits JANE_BUFFED, PlayerManager applies |
| UL4.12 Puzzle fail effect: corruption increase | S | |
| UL4.13 Implement UL knowledge persistence | M | Learned words survive session save/load |
| UL4.14 Implement UL knowledge display (known words) | M | Simple list in HUD or pause menu |
| UL4.15 New Game+ bonus: early UL knowledge | M | SaveSystem provides known words to ulEngine on new game |
| UL4.16 Timer for puzzle (optional, difficulty-based) | M | |
| UL4.17 Test: puzzle completes and fires correct event | M | |
| UL4.18 Test: known words provide correct bonuses in New Game+ | M | |

**UL4 total: L–XL (1.5–2 weeks)**

---

## SYSTEM 5: Mission System

**Current status:** 16 outcome types defined. All outcome handlers are empty.
Missions can start but never resolve. No reward granting.

**Gap:** There is no progression. The loop has no end state.

| Task | Complexity | Notes |
|------|-----------|-------|
| M5.1 Implement VICTORY outcome handler | M | XP grant, trust boost, ley line energy restore |
| M5.2 Implement DEFEAT outcome handler | M | Save-point rollback, trust penalty, optional retry |
| M5.3 Implement DIPLOMATIC outcome handler | M | Faction reputation change, NPC relationship update |
| M5.4 Implement XP reward granting | M | XP → level threshold → level up event |
| M5.5 Implement item reward granting | M | Add to inventory (InventoryManager already exists) |
| M5.6 Implement trust reward/penalty | S | TrustManager.adjustTrust() already exists |
| M5.7 Implement ley line effect from mission | S | Energy change on relevant ley line |
| M5.8 Wire `MissionSystem.triggerEvent()` to EventBus | S | Existing stub; just needs connection |
| M5.9 Design sample mission: "Awaken in the Rift" | M | 3 objectives, all completable without additional systems |
| M5.10 Author mission: objective 1 — reach Vortex Theta-4 | M | Travel + discovery objective |
| M5.11 Author mission: objective 2 — seal the rift | M | Requires UL puzzle (SYSTEM 4) |
| M5.12 Author mission: objective 3 — return to Tho'ra Base | M | Travel back objective |
| M5.13 Wire mission UI (MissionHUD) to display active objectives | M | Already exists; needs live data binding |
| M5.14 Mission completion state machine (all objectives → outcome) | M | |
| M5.15 Test: full mission runs start-to-finish without intervention | L | Integration test |

**M5 total: L (1–1.5 weeks)**

---

## SYSTEM 6: Companion Bootstrap

**Current status:** `PsiSysRobot`, `AlternateJane` — both empty classes.
Terra exists but is not a PsiSys robot. No companion in-game.

**Gap:** The 4-bot system is a core mechanic. Zero bots currently exist in game.

| Task | Complexity | Notes |
|------|-----------|-------|
| C6.1 Implement PsiSysRobot base class | M | Stats, sprite, physics body, basic follow behavior |
| C6.2 Implement Ra (Magneto Speeder personality layer) | M | Ra IS the speeder; when Jane boards, she interacts with Ra's AI |
| C6.3 Ra personality: idle vocalizations (text bubbles) | S | Random lines from Ra character doc |
| C6.4 Ra personality: energy warnings ("I'm running low!") | S | Triggered at < 20% energy |
| C6.5 Implement companion follow behavior (near Jane) | M | Pathfind within 2 tiles of Jane when not in use |
| C6.6 Implement companion heal behavior | M | When Jane health < 30%: companion emits heal pulse |
| C6.7 Implement ASI focus switching | M | Q key cycles ASI focus: Jane → Ra → back to Jane |
| C6.8 ASI focus indicator (visual) | S | Glow ring around focused entity |
| C6.9 Implement per-companion TrustManager | M | Ra has own trust level independent of Jane's |
| C6.10 Ra trust affects speeder responsiveness | M | Low trust = speeder slow to respond to ASI commands |
| C6.11 Test: Ra follows Jane autonomously | M | |
| C6.12 Test: ASI switches focus to Ra and pilots speeder | M | |

**C6 total: M–L (1–2 weeks)**

---

## SYSTEM 7: Combat

**Current status:** One enemy type (test slime). Bounce-only AI. Basic damage
formula works. PlayerAttackController exists.

**Gap:** Combat is functional but has zero variety or tactical depth.

| Task | Complexity | Notes |
|------|-----------|-------|
| CB7.1 Implement 2nd enemy type: Nefarium Drone | M | Ranged attack, patrols ley line segment |
| CB7.2 Implement 3rd enemy type: Corrupted Robot | M | Melee, stronger, drops resource on defeat |
| CB7.3 Enemy spawn tied to ley line instability | M | Higher instability → more enemies, tougher types |
| CB7.4 Enemy spawn tied to rift formation | M | Rift spawns wave of enemies on open |
| CB7.5 Jane attack animations (if sprite available) | M | Dependent on REAL_SPRITES_ENABLED asset |
| CB7.6 Hit visual feedback (flash, particle burst) | S | Already partially exists; polish |
| CB7.7 Enemy death effect (dissolve, drop) | M | Visual + loot spawn |
| CB7.8 Jane combat retreat behavior (Flee state in A2) | S | Requires System 2 |
| CB7.9 Boss encounter for prototype (Corrupted Node Guardian) | XL | Boss fight at rift node; multiple phases |
| CB7.10 UL weakness system (boss weak to specific UL sequence) | M | Requires System 4 |
| CB7.11 Test: combat loop (encounter → fight → win/lose) | M | |

**CB7 total: L–XL (1–2 weeks without boss; 2–3 weeks with boss)**

---

## SYSTEM 8: Audio

**Current status:** AudioManager, HarmonicEngine, 372 combinatorial files.
Performance cost is extreme (372 preloads). HarmonicEngine seeds exist.

**Gap:** Audio is expensive and only partially connected to game state.

| Task | Complexity | Notes |
|------|-----------|-------|
| AU8.1 Strip combinatorial audio (372 files → 20 max) | M | Major impact on startup performance |
| AU8.2 Design 20-key audio manifest | S | Which sounds are actually needed for prototype loop |
| AU8.3 Wire HarmonicEngine to ley line energy | M | High energy = full rich harmonics; low = sparse, dissonant |
| AU8.4 Wire HarmonicEngine to corruption level | M | Corruption = specific dissonance layer activates |
| AU8.5 Biome ambient audio (volcanic: low rumble, wind) | M | 1 ambient loop per biome type |
| AU8.6 Ley line travel audio (speed-responsive) | M | Pitch shifts with speed; high speed = wind/whoosh |
| AU8.7 Node arrival audio (type-specific) | S | Recharge: crystal chime; rift: ominous tone |
| AU8.8 UL puzzle audio (symbol selection, solve, fail) | S | 3 SFX |
| AU8.9 Combat audio (attack, hit, enemy death, player hurt) | M | 6–8 SFX |
| AU8.10 Fidelity-responsive audio (low fidelity → minimal audio) | S | Requires FidelityController (WE-4) |

**AU8 total: M–L (1–2 weeks)**

---

## SYSTEM 9: Save / Persistence

**Current status:** SessionPersistence exists for callsign/session. WorldPersistence
exists for chunks (being deleted). Some save hooks in place.

**Gap:** World state (nodes, ley line energy, corruption, trust, mission progress,
UL knowledge) does not persist meaningfully.

| Task | Complexity | Notes |
|------|-----------|-------|
| SP9.1 Design save schema v2 (post-chunk-system) | M | All persistent fields; versioned |
| SP9.2 Implement node state save/load | M | isDiscovered, energyLevel, stabilityLevel, encounters resolved |
| SP9.3 Implement ley line state save/load | M | Per-ley-line: energyLevel, corruptionLevel |
| SP9.4 Implement Jane stats save/load | S | Health, psi, trust, XP, level |
| SP9.5 Implement UL knowledge save/load | M | Known words array; New Game+ carries over |
| SP9.6 Implement mission state save/load | M | Active mission, completed objectives |
| SP9.7 Implement auto-save on node arrival | S | Trigger on NODE_ARRIVED event |
| SP9.8 Implement manual save in pause menu | S | |
| SP9.9 Implement load-from-save on game start | M | Full world state restore |
| SP9.10 Save migration: handle missing fields gracefully | S | Old saves must not crash new code |
| SP9.11 Test: save → quit → load → world state identical | M | |

**SP9 total: M–L (1–1.5 weeks)**

---

## SYSTEM 10: UI / HUD Completeness

**Current status:** UIBarSystem, MissionHUD, UIManager exist and are styled.
Several components are disconnected from live data.

**Gap:** The HUD shows placeholder data. Several critical pieces aren't wired.

| Task | Complexity | Notes |
|------|-----------|-------|
| UI10.1 Wire COHERENCE bar to Jane actual health | S | Already coded; verify live data binding |
| UI10.2 Wire RESONANCE bar to Jane actual psi | S | Same |
| UI10.3 Wire TRUST indicator to TrustManager live value | S | Currently polling every frame; verify |
| UI10.4 Wire SPEED indicator to actual Jane/speeder speed | S | |
| UI10.5 MissionHUD: wire to active mission objectives live | M | Requires M5 |
| UI10.6 Pause menu: save, settings, quit | M | Pause scene exists; needs save hook |
| UI10.7 Node name display on arrival | S | Toast message styled to PsiSys aesthetic |
| UI10.8 Ley line energy indicator (bar or gauge) | M | Shows current ley line energy level |
| UI10.9 Corruption indicator (shows Nefarium activity) | M | Color overlay or indicator |
| UI10.10 ASI focus indicator (which entity has ASI focus) | S | Requires C6 |
| UI10.11 UL knowledge panel (pause menu) | M | List of known UL words |
| UI10.12 Network view ASI overlay (trust, suggestions, guidance lines) | L | Requires WE-5 |
| UI10.13 Fidelity level indicator ("PsiSys: LOW FIDELITY") | S | Small text, auto-hides at STANDARD+ |
| UI10.14 Responsive layout audit (mobile and desktop) | M | UILayoutManager should handle this; verify |

**UI10 total: M–L (1–2 weeks)**

---

## SYSTEM 11: Narrative Delivery

**Current status:** NarrativeEngine has event definitions. Jono hologram exists.
No dialogue, no cutscenes, no in-game story delivery.

**Gap:** The story is invisible. The player has no narrative context.

| Task | Complexity | Notes |
|------|-----------|-------|
| NR11.1 Author: Jono opening transmission (game start) | M | Text lines delivered by JonoHologram on first load |
| NR11.2 Author: Jane internal monologue on node discovery (3 nodes) | M | Jane reacts to finding each node |
| NR11.3 Author: Jono hint lines for UL puzzle approach | S | 3–5 contextual lines |
| NR11.4 Author: mission briefing for "Awaken in the Rift" | M | Text-based, delivered via dialogue modal |
| NR11.5 Author: Nefarium threat escalation message | S | Delivered on first RIFT_FORMED event |
| NR11.6 Wire NarrativeEngine events to JonoHologram display | M | Event → hologram line delivery |
| NR11.7 DialogueModal: ensure readable, PsiSys styled | S | Already exists; style audit |
| NR11.8 PsiNetLog: wire to narrative events | S | Story events appear in the living console |
| NR11.9 Lore: 3 node lore entries (discoverable) | M | Text lore per authored node |

**NR11 total: M (1–2 weeks) — mostly writing, not coding**

---

## SYSTEM 12: First-Time Player Experience

**Current status:** PsiSysKernel (callsign entry) exists. Start scene works.
But the 3-minute core loop (from gap analysis) is not achievable — too many
broken systems between start and first meaningful event.

**Gap:** A new player cannot experience the 8-step loop within 3 minutes.

| Task | Complexity | Notes |
|------|-----------|-------|
| FE12.1 Tutorial sequence: Jono explains ASI role | M | First-run only; 4 lines; skippable |
| FE12.2 Tutorial: show Jane exploring autonomously (no input needed) | S | Just don't suppress Jane AI for first 30s |
| FE12.3 Tutorial: highlight first suggestion opportunity | S | Toast: "Try clicking near Jane to suggest a direction" |
| FE12.4 Tutorial: introduce zoom to network view | S | Toast + visual cue on first zoom-out |
| FE12.5 Tutorial: first ley line node prompt | S | On first NODE_ARRIVED: explain node interaction |
| FE12.6 Tutorial: first UL puzzle introduction | M | Brief explanation of symbol input |
| FE12.7 Tutorial skip for returning players (callsign session) | S | Check session; skip if not first boot |
| FE12.8 Validate 3-minute loop: measure time to first UL puzzle | L | Playtest + adjust spawn positions/timing |

**FE12 total: M–L (1–1.5 weeks)**

---

## SYSTEM 13: Testing Infrastructure

**Current status:** Jest config exists. Many tests exist but many are broken
(mocking deleted systems, testing empty stubs). Test coverage is low for live systems.

| Task | Complexity | Notes |
|------|-----------|-------|
| T13.1 Fix all broken tests after S0 (demolition) | L | Many mocks reference deleted files |
| T13.2 Unit tests for Signal Engine (WE-1) | M | Already in WE-1 tasks |
| T13.3 Integration test: terrain renders and Jane stands | M | |
| T13.4 Integration test: full 8-step core loop | L | The final validation criterion |
| T13.5 Performance regression test (FPS guard) | M | Fail build if STANDARD fidelity < 30fps |
| T13.6 Test coverage report target: 60% for core systems | M | |

**T13 total: L (ongoing throughout all phases)**

---

## Grand Total Estimate

| System | Estimate | Priority |
|--------|----------|---------|
| S0: GameScene Decomposition | 2–3 weeks | CRITICAL PREREQUISITE |
| WE: World Engine | 5–9 weeks | CRITICAL PATH |
| A2: Jane Autonomy | 2–3 weeks | DEFINES THE GAME |
| LT3: Ley Line Travel | 1.5–2.5 weeks | CORE MECHANIC |
| UL4: Universal Language | 1.5–2 weeks | UNIQUE MECHANIC |
| M5: Mission System | 1–1.5 weeks | PROGRESSION |
| C6: Companion Bootstrap | 1–2 weeks | DEPTH |
| CB7: Combat | 1–3 weeks | ENGAGEMENT (boss optional) |
| AU8: Audio | 1–2 weeks | POLISH |
| SP9: Save / Persistence | 1–1.5 weeks | RETENTION |
| UI10: HUD Completeness | 1–2 weeks | USABILITY |
| NR11: Narrative Delivery | 1–2 weeks | CONTEXT |
| FE12: First-Time Experience | 1–1.5 weeks | ACCESSIBILITY |
| T13: Testing | Ongoing | QUALITY |

**Minimum viable prototype (S0 + WE core + A2 + LT3 + UL4 + M5):**
**~14–21 weeks of focused work.**

**Full prototype with polish (all systems):**
**~22–35 weeks (5–8 months).**

---

## What This Means

This is a game. Not a side project. Not a weekend sprint.

A solo developer working 20 hours/week reaches minimum viable prototype in
approximately **7–10 months**. Working 40 hours/week: **3.5–5 months**.

With AI assistance (code generation, architecture, debugging), compress by
roughly 30–40%: **4–7 months at 20h/week, 2–3.5 months at 40h/week**.

The good news: the architecture is now sound, the WHY is clear, and the
priority order is unambiguous. The work is large but it is *defined*. Undefined
work of unknown scope is worse than large work of known scope.

Every session should produce something in the critical path. Don't work on
boss fights (CB7.9) before Jane moves autonomously (A2). Don't work on
narrative (NR11) before the world engine is performant (WE). The phase plan
(03-phase-plan.md) enforces this.
