# Scope: Phase Plan

> Sequencing, dependencies, and milestones.
> Each phase has a clear exit criterion — a demo-able, shippable state.
> Never start a phase until the previous phase's exit criterion is met.

---

## Dependency Graph

```
S0: Decompose GameScene
 │
 ├──────────────────────────────────────────────┐
 │                                              │
 ▼                                              ▼
WE-0: Demolish old terrain              AU8.1: Strip 372 audio files
 │                                              │
 ▼                                              │
WE-1: Signal Engine ◄───────────────────────────┘
 │
 ├─────────────────────┐
 │                     │
 ▼                     ▼
WE-2: Physics       WE-3: Renderer
 │                     │
 └──────┬──────────────┘
        │
        ▼
WE-4: Fidelity Controller
        │
        ▼
WE-5: Dual-Perspective View ─────────────────────┐
        │                                        │
        ▼                                        │
WE-6: Node Authoring                             │
        │                                        │
        ├──────────────────────┐                 │
        │                      │                 │
        ▼                      ▼                 │
A2: Jane Autonomy         LT3: Rail Travel       │
        │                      │                 │
        └──────────┬───────────┘                 │
                   │                             │
                   ▼                             │
             UL4: Puzzles ◄──────────────────────┘
                   │
                   ▼
             M5: Missions
                   │
              ┌────┴────┐
              │         │
              ▼         ▼
        C6: Companions  CB7: Combat
              │         │
              └────┬────┘
                   │
              ┌────┴────────────┐
              │                 │
              ▼                 ▼
        SP9: Save        UI10+NR11+FE12
              │                 │
              └────────┬────────┘
                       │
                       ▼
               T13: Full Integration Test
                  (8-step loop validated)
```

---

## Phase 0: Foundation
**Exit criterion:** `npm run build` and `npm test` pass. GameScene < 600 lines.
World renders a flat ground plane. Jane stands on it. 30+ FPS.

### Tasks in this phase

| Task | System | Notes |
|------|--------|-------|
| S0.13 Strip 372 combinatorial audio | S0 | First — largest startup cost |
| S0.1–S0.9 Extract GameScene modules | S0 | Biggest single block of work |
| S0.10–S0.16 Fix tests, remove dead code | S0 | |
| WE-0.1–WE-0.7 Delete legacy terrain files | WE-0 | |
| WE-0.8–WE-0.15 Untangle ChunkLoader, TilemapManager | WE-0 | |
| WE-1.1–WE-1.8 Implement signal engine (H1 minimum) | WE-1 | H1 only for Phase 0 |
| WE-2.1–WE-2.9 Implement terrain physics (Arcade) | WE-2 | Floor line at minimum |
| WE-3.1–WE-3.2 Basic terrain renderer (filled shape) | WE-3 | |
| WE-4.1–WE-4.3 Basic fidelity controller | WE-4 | Start LOW, auto-upgrade |

**Phase 0 duration: 4–6 weeks**
**Risk: HIGH — cascade effects from GameScene decomposition are unpredictable**

---

## Phase 1: World Engine Complete
**Exit criterion:** All 5 authored nodes exist on the ley line. Signal terrain
with H1–H4 renders correctly. Dual-perspective zoom works. Fidelity levels all
function. 60 FPS at STANDARD. Jane can walk/run across the entire ley line arc.

### Tasks in this phase

| Task | System | Notes |
|------|--------|-------|
| WE-1.9–WE-1.14 Complete signal engine | WE-1 | H2–H4, wire to LeyLineManager |
| WE-2.10–WE-2.11 Physics polish | WE-2 | Speeder collision |
| WE-3.3–WE-3.10 Full terrain renderer | WE-3 | All effects, biome colors, water |
| WE-4.4–WE-4.14 Fidelity system complete | WE-4 | All systems implement FidelityAware |
| WE-5.1–WE-5.14 Dual-perspective view | WE-5 | This is the big visual milestone |
| WE-6.1–WE-6.15 All 5 prototype nodes | WE-6 | Author terrain profiles |
| AU8.1–AU8.5 Audio cleanup + biome ambient | AU8 | |

**Phase 1 duration: 5–9 weeks**
**Risk: MEDIUM — well-defined scope, but WE-5 (dual view) is technically novel**

**Milestone demo:** Player zooms from Jane's volcanic terrain to the full ley
line network view, sees energy pulsing, sees rifts flaring, zooms back to Jane.
This IS the game's identity demo. First time seeing this = first time feeling
like the ASI.

---

## Phase 2: Jane Autonomy + Rail Travel
**Exit criterion:** Jane moves without any player input. She explores toward
nodes, fights enemies she encounters, and follows the ley line when traveling.
Player can suggest direction; Jane sometimes follows, sometimes doesn't.
Trust meter changes based on interactions.

### Tasks in this phase

| Task | System | Notes |
|------|--------|-------|
| A2.1–A2.11 Behavior tree and autonomy manager | A2 | Core Jane AI |
| A2.12–A2.15 ASI input remap (WASD → suggestion) | A2 | Major input paradigm shift |
| A2.16–A2.20 Tests and integration | A2 | |
| LT3.1–LT3.8 Pathfinder + rail movement | LT3 | |
| LT3.9–LT3.14 Instability + fast travel | LT3 | |
| CB7.1–CB7.8 Two new enemy types (no boss yet) | CB7 | Enemies needed for Jane to react to |

**Phase 2 duration: 4–6 weeks**
**Risk: HIGH — Jane autonomy is the game's hardest design problem. The "feel"
of trust/resistance needs extensive tuning, not just implementation.**

**Milestone demo:** Press no keys. Watch Jane decide to explore, encounter an
enemy, fight it, then head toward a ley line node. Offer a suggestion when
she's heading the wrong direction. She considers it. If trust is high, she
follows. The player IS the ASI for the first time.

---

## Phase 3: UL Puzzles + Mission Loop
**Exit criterion:** The 8-step core loop from gap analysis runs start to finish
without developer intervention. A new player can experience it within 3 minutes.

### Tasks in this phase

| Task | System | Notes |
|------|--------|-------|
| UL4.1–UL4.18 Full UL puzzle system | UL4 | UI, wiring, effects, persistence |
| M5.1–M5.15 Mission system + sample mission | M5 | "Awaken in the Rift" |
| SP9.1–SP9.11 Save / persistence | SP9 | Game must be saveable by Phase 3 |
| UI10.1–UI10.14 HUD completeness | UI10 | All live data wired |
| NR11.1–NR11.9 Narrative delivery | NR11 | Jono transmissions, Jane monologue |
| FE12.1–FE12.8 First-time experience | FE12 | Tutorial + 3-minute loop validation |
| T13.1–T13.6 Testing | T13 | Integration test for full loop |

**Phase 3 duration: 4–6 weeks**
**Risk: MEDIUM — most components exist; this is wiring and content.**

**Milestone demo:** Boot game cold. Watch Jane start at Tho'ra Base, decide to
explore. She travels the ley line, discovers Vortex Theta-4, a rift forms.
ASI (player) suggests Jane investigate. She does (trust is moderate). UL puzzle
appears. Player solves it. Rift sealed. Mission objective completes. Jane
returns to base. Trust is higher. Energy on the ley line is higher. The terrain
is visibly more detailed (energy level rose). Save happens automatically.

**This demo is the prototype. This is the exit criterion for all of Proto scope.**

---

## Phase 4: Depth (Post-Prototype)
**Start after:** Phase 3 exit criterion is met and demo has been shown.

Phase 4 adds breadth and depth to the validated loop. Nothing here is
prerequisite to anything in Phase 3 — all of it is layered on top.

| System | Content |
|--------|---------|
| C6: Companions | Ra personality, companion switching, per-companion trust |
| CB7.9: Boss | Corrupted Node Guardian fight |
| CB7.10: UL weakness | Boss requires correct UL sequence |
| AU8.6–AU8.10 | Speed-responsive audio, SFX library |
| NR11 additions | More Jono transmissions, Jane relationship development |
| Second ley line (Falcon2 biome) | Extends the world beyond Tho'ra scope |
| Multiplayer scaffolding | Multiple Holo Deck instances, shared ley line state |
| Web3 integration | Deferred; only if Phase 3 is working smoothly |

**Phase 4 duration: open-ended. Expand as resources allow.**

---

## Session-Level Guidance

**Every working session should produce something on the critical path.** The
critical path is: S0 → WE-0 → WE-1 → WE-2 → WE-3 → A2 → LT3 → UL4 → M5.

If a session produces work that is NOT on this path (a boss fight, a visual
effect, a new audio track), it is not wasted — but it should not happen while
anything on the critical path is incomplete.

**How to pick the next task:**
1. Find the earliest incomplete phase (0, 1, 2, or 3)
2. Find the first incomplete task in that phase's task list
3. If blocked on that task, find the next unblocked task in the same phase
4. Never jump to a later phase's tasks to avoid a difficult current-phase task

**Definition of "done" for any task:**
- Code compiles
- Tests pass (or tests are written and passing)
- The feature is observable in the running game
- No regressions in previously passing tests

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| GameScene decomposition breaks everything | HIGH | HIGH | Do S0 first; commit after every extracted module; never extract two at once |
| Jane autonomy feels wrong (not the game) | MEDIUM | HIGH | Build trust/resistance tuning tools before polish; expect many iterations |
| WE-5 dual-perspective view is technically blocked by Phaser | LOW | HIGH | Test zoom crossfade with a spike/prototype before committing to design |
| Scope expands during Phase 2 | HIGH | MEDIUM | Enforce strict proto scope filter; defer anything not in Phase 3 exit criterion |
| Audio performance causes FPS drop after cleanup | LOW | MEDIUM | Benchmark after AU8.1 before proceeding |
| Save schema changes break old saves | MEDIUM | LOW | Version the schema; migration handlers from Phase 3 on |
