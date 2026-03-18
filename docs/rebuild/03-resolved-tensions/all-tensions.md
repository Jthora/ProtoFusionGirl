# Resolved Tensions

> Seven critical design tensions, all resolved. No open questions remain.
> "Park nothing. Decide everything." — Jono Tho'ra

---

## 1. Planetary Scale vs 2D Engine

**Tension**: The game narrative (Earth, ley lines spanning continents, cosmic forces) implies planetary scope. Phaser 3 renders 2D sprites.

**Resolution**: The game world is a **network graph**, not a physical map. The Holo Deck presents a tactical 2D display — nodes connected by edges. Nodes have stability, edges have condition. The *feel* is planetary scope through event descriptions, faction origins, and Jono's mission briefings. The *rendering* is a 2D interface showing node status, ley line health, and threat markers.

For the prototype: 3 nodes, 2 edges, 2D side-scrolling gameplay at each node. Fast travel is clicking a node on the network map.

For Godot: physical terrain, 3D globe view, shoulder-cam.

**Status**: DECIDED. No further discussion needed.

---

## 2. World Simulation Fidelity vs Feasibility

**Tension**: The design calls for an alive, reactive world (faction economies, cosmic influence, emergent events, propagating instability). Implementing all of this in real-time simulation is beyond prototype scope.

**Resolution**: Use **lookup tables + integer math + timer-based background processing**. No real-time simulation.

Specifically:
- Factions have integer reputation values. Threshold events fire at breakpoints (e.g., rep ≥ 75 = ally event).
- Cosmic phase is a calendar counter. Current phase multiplies event weights from a static table.
- Instability propagation uses adjacency: when one node's stability hits critical, adjacent nodes lose a flat amount.
- Research/provision is a timer. Start → wait → complete → effect.

The rule: **Design for depth, build for function.** The data model can be rich. The runtime process must be cheap.

**Status**: DECIDED.

---

## 3. Jane's Autonomy vs Player Motivation

**Tension**: If Jane can complete missions alone, why does the player (ASI) matter? If the ASI is essential, Jane isn't really autonomous.

**Resolution**: Jane CAN complete missions alone. She does it worse. The difference is made visible through **consequences**, not abstract metrics.

Examples:
- Robot Jane didn't heal → becomes hostile later
- Rift Jane didn't seal → degrades neighboring node
- Research ASI didn't start → combat harder because Jane lacks equipment
- Jane refuses suicidal guidance → trust builds through respect

The ASI's value: **seeing what Jane can't** (information asymmetry) and **acting on longer timescales** (research, preparation, reconnaissance). Jane handles the present. ASI handles the future.

The 3-minute experience demonstrates this: Path A (guided) vs Path B (unguided) produce visibly different worlds.

**Status**: DECIDED.

---

## 4. Speed System: Rethink vs Best Existing Code

**Tension**: The navigation system is the best code in the codebase (~600 lines, clean architecture, 5 speed tiers). But the game design calls for a richer cockpit model (gear + throttle + boost + fast travel).

**Resolution**: **Wrap, don't rewrite.** The existing speed system becomes the "gear" component (selecting base speed tier). New systems layer on top:

- **Throttle** (P2): Analog acceleration within current gear's speed range
- **Boosters** (P3): Single-button boost with cooldown, fed by ley line energy
- **Fast travel** (P2-P4): Network map → select node → transition

The SpeedTierConfig, NavigationManager, and camera zoom system remain untouched. New features compose with them, not replace them.

**Status**: DECIDED.

---

## 5. Background Systems: Simulation vs Fire-and-Forget

**Tension**: Research, resource gathering, faction activities, cosmic events — all want to run "in the background." Real background simulation is expensive and complex.

**Resolution**: **Fire and forget.** Timer-based job queues.

Pattern:
```
startResearch(project) → add to queue with timer → on completion → fire event → apply effect
```

No simulation. No tick-by-tick processing. The player starts something, a timer counts in real-time, and when it completes, the result applies. This is identical to how mobile games handle building/research, but without using it as a monetization gate.

Build the **notification pipeline** (events come in, UI shows them). Stub the internals. The pipeline is the hard part; individual jobs are trivial to add.

**Status**: DECIDED.

---

## 6. Music System: Beat Detection vs Practicality

**Tension**: The design envisions music influencing gameplay through beat detection. Browser JavaScript cannot access the user's external media player.

**Resolution**: Prototype ships with a **built-in soundtrack**. Beat detection runs against the game's own audio (easy — we control the audio data). Music phases map to gameplay intensity.

For post-Godot: Desktop app CAN access system audio, enabling the full beat-reactive vision.

For prototype: Music is atmospheric, may influence event timing, does NOT require user-supplied audio.

**Status**: DECIDED.

---

## 7. Content Scope vs Development Capacity

**Tension**: The full game design describes 5+ enemy factions, 4+ hero robots, dozens of UL puzzles, multiple astrology phases, and extensive emergent events. One developer (plus AI) cannot build all of that.

**Resolution**: **Minimum viable content set:**

| Category | Prototype Count | Full Game |
|----------|----------------|-----------|
| Nodes | 3 | 50+ |
| Edges | 2 | 100+ |
| Enemy factions | 2 (Remnant, Nefarium) | 5 |
| Enemy types | 2 (Terminator, Phantom) | 15+ |
| Hero robots | 1 (Terra) + 1 stretch (Aqua) | 4+ |
| UL puzzle types | 1 (repair) → 2 (repair, banish) | Many |
| UL components | 2-3 | Full alphabet |
| Research projects | 3 | 20+ |
| Cosmic phases | 4 (simplified) | 12 |
| Emergent event types | 3 | Dozens |

The rule: **If the loop works, the content writes itself.** Prove the core experience with minimal content. Then adding more is data, not architecture.

**Status**: DECIDED.
