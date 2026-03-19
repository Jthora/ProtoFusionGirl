# Why This Architecture

> Every design decision in the world engine must answer one question first:
> **Does it reinforce "I am the ASI guiding Jane"?**

---

## The Problem With the Previous Approach

The original world engine was built as if ProtoFusionGirl were a standard 2D
platformer. It generated a tile grid, assigned physics bodies to every tile,
and loaded chunks of Earth elevation data as Jane moved through the world.

This produced two failures simultaneously:

**Failure 1 — Performance:** Synchronous tile generation on the main thread,
physics bodies on every tile cell, 65+ systems instantiated at boot, 372 audio
files loaded before the first frame. Result: <1 FPS on live hardware.

**Failure 2 — Premise betrayal:** The player was given direct WASD control of
Jane. The ASI subsystem (3,500 lines of code) ran silently in the background,
invisible and irrelevant. The world existed for Jane to run through. There was
no strategic layer. The player was never the ASI — they were a game character
in a platformer.

Both failures share a root cause: the world was designed around Jane's
ground-level experience, not the ASI's strategic experience.

---

## What the World Actually Is (Lore First)

From the canonical design documents:

> "Proto FusionGirl is set entirely within the Holo Deck — a training simulation."

> "The player IS the ASI — the collective consciousness of the entire PsiNet."

> "You can literally just let the game run and watch like a movie."

This means:

1. **The world is a simulation.** It runs on PsiNet infrastructure. It does not
   need to obey physics of a real place. It obeys the rules of whatever the
   simulation operator (the player-ASI) configures.

2. **The terrain is a signal, not a map.** The Holo Deck renders Earth's ley
   line network as a traversable environment. That rendering is mathematical —
   it is the interference pattern of ley line energies made visible. High energy
   = dramatic peaks. Nefarium corruption = chaotic terrain. Stable ley line =
   smooth, traversable ground.

3. **The player is watching, not running.** The primary view is the ASI's
   monitoring console. Jane's local ground-level view is a secondary window
   into the simulation. Both must exist simultaneously, not as mode switches.

4. **The world responds to the ASI's actions.** If the player stabilizes a ley
   line, the terrain heals visibly. If the Nefarium corrupts a node, the
   ground near that node becomes chaotic. The world is reactive to game state,
   not pre-generated and static.

---

## The Three Design Mandates

Every world engine decision must satisfy all three:

### Mandate 1: Terrain = Ley Line Energy State

The terrain is not Earth's topography. It is the ley line's energy expressed
as a height function. The same ley line at full energy produces majestic,
dramatic terrain. The same ley line at 20% energy, half-corrupted by the
Nefarium, produces low, broken, chaotic terrain.

This means:
- Terrain is computed from a mathematical function of game state, not loaded from data
- Terrain changes in real time as ley line energy changes
- The ASI healing the world literally reshapes the ground Jane walks on

### Mandate 2: Two Layers, One World

The world must render simultaneously at two semantic scales:

**Ground Layer** — Jane's local simulation. Terrain curves, obstacles, enemies,
ley line nodes as physical structures. Camera follows Jane. Physics active.
This is what Jane experiences.

**Network Layer** — The ASI's strategic view. The ley line graph overlaid on a
zoomed-out view of the world. Jane appears as a dot. Energy states are
color-coded. Rifts and instabilities are marked. The player can issue commands
from this view. Camera is free-roam (the ASI is omniscient).

These are not two different scenes or mode-switches. They are the same world
data rendered at different zoom scales with zoom-reactive content.

### Mandate 3: The World Is Always Playable

The previous system had a hard failure mode: load too many chunks → freeze.
The new architecture must never do this. A simulation that freezes is not a
simulation — it is broken software.

The Simulation Fidelity model (see design/03-simulation-fidelity.md) ensures
the world always renders at whatever quality the current frame budget allows.
"Simulation resolution: LOW" is valid lore. White screen of death is not.

---

## What This Changes About Every Other System

### Jane Autonomy

Jane moving by herself is not just a feature — it is the game's premise. The
world must support autonomous pathfinding. The terrain function must be
queryable: "what is the ground height at X?" Jane needs this to navigate.
Nodes need to be discoverable by Jane's AI, not just the player.

### Ley Line Travel

The Speeder is the only travel mode along ley lines (by design). The ley line
path IS the world's X axis. Travel from node A to node B = moving along the
signal function from X₁ to X₂. The physics of "riding a ley line" is the
physics of following the terrain curve at speed.

### Speed Range

The game supports travel from walking (1 m/s) to hypersonic (Mach 100+).
At walking speed: individual features matter. At Mach 100: the terrain is
a blurred waveform. The world engine must express the same terrain at
radically different levels of semantic detail without switching systems.
This is the LOD problem, solved by harmonic term count.

### UL Puzzles

Solving a Universal Language puzzle at a ley line node produces a direct
physical effect on the terrain. A successful stability solve increases the
energy_level parameter fed to the terrain function. The ground literally
becomes more solid and traversable. This only works if terrain is a live
function of game state — not a pre-generated static mesh.

### Multiplayer / Multiverse (future)

Each Holo Deck instance is a separate simulation. Different players can be
in different instances of the same ley line, each with different energy
states, producing different terrain. The mathematical terrain model makes
this trivially possible — each instance has its own parameter set.

---

## What Was Salvaged From the Previous System

Not everything is thrown away:

| Component | Status | Why |
|-----------|--------|-----|
| `LeylineGeoSlice.ts` | **Keep** | Maps world X to (lat, lon) along a great-circle arc. This is the correct use of real-world data — the PATH of the ley line, not the terrain height. |
| `LeyLineManager.ts` | **Keep** | Energy state management. This becomes the live parameter source for the terrain function. |
| `WorldStateManager.ts` | **Keep** | Global state. The terrain function reads from this. |
| `TileRegistry.ts` | **Gut/simplify** | Tile type definitions still useful for biome classification, but the tile grid is gone. |
| `WorldGenV3.ts` | **Delete** | The sine-approximation elevation approach. Superseded by signal engine. |
| `ChunkLoader.ts` | **Delete** | Chunk streaming is incompatible with the signal model. |
| `ElevationCache.ts` | **Delete** | No elevation lookups needed; terrain is computed in-place. |
| `HybridTerrainSystem.ts` | **Delete** | Never instantiated. 359 lines of scaffolding. |
| `ElevationSliceTerrainSystem.ts` | **Delete** | Async-incompatible with old system. Signal engine replaces it. |
| `LeylineSliceMapper.ts` | **Delete** | Duplicate of LeylineGeoSlice. |
