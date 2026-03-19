# Design: Node Authoring System

> Authored places along the ley line. Nodes are where the world becomes
> meaningful — where missions start, where puzzles live, where the story happens.

---

## Nodes vs. Procedural Terrain

The signal engine generates infinite terrain. Nodes are exceptions: specific
X coordinates along the ley line where the terrain has been **authored** to
feel like a real place, not a random curve.

The two systems blend seamlessly. The `node_spikes()` function (from
design/01-ley-line-signal-engine.md) reads from the node registry and applies
each node's terrain profile within its influence radius. Outside that radius,
the procedural signal dominates. Inside the radius, authored shape overrides.

---

## Node Data Model

```typescript
interface LeyLineNode {
  // Identity
  id: string;                  // e.g. "thora_launch_base"
  name: string;                // e.g. "Tho'ra Launch Base"
  type: NodeType;              // LAUNCH_BASE | RECHARGE | QUEST | RIFT | VORTEX

  // Position
  leyLineId: string;           // which ley line this node is on
  worldX: number;              // exact world X coordinate
  arcPosition: number;         // 0–1 along the ley line arc (derived from worldX)

  // Terrain override
  influenceRadius: number;     // world units — how far the authored shape extends
  terrainProfile: TerrainProfileFn; // authored height function relative to center
  biomeOverride?: BiomeState;  // if present, overrides procedural biome in radius

  // Game state
  isDiscovered: boolean;       // has Jane visited this node?
  energyLevel: number;         // 0–100, node-local energy (may differ from ley line avg)
  stabilityLevel: number;      // 0–100, structural integrity
  controlledBy: FactionId | null; // which faction holds this node

  // Encounters
  encounters: NodeEncounter[]; // what happens when Jane arrives
  puzzles: ULPuzzleId[];       // UL puzzles available at this node
  missions: MissionId[];       // missions triggered at this node
}
```

---

## Terrain Profile Functions

Each node type has a characteristic terrain shape:

### Launch Base (Tho'ra — volcanic/crater)
```
     ↑ height
 ____|         |____
     \         /
      \___↑___/
       (basin — base is below surrounding terrain)
       Node center at lowest point.
       Caldera rim rises on both sides.
```

```typescript
const thoraLaunchBaseProfile: TerrainProfileFn = (dist) => {
  const rimDist = 80; // world units from center to rim
  if (dist < rimDist) {
    // Basin: descent toward center
    return -30 * (1 - dist / rimDist);
  } else if (dist < rimDist + 40) {
    // Caldera rim: rises sharply
    return 20 * ((dist - rimDist) / 40);
  }
  return 0; // beyond influence: blends to procedural
};
```

### Recharge Node (ley line pulse station)
```
      ↑
  ____|_____   _____|_____
       \   / \ /
        \_/   (two converging slopes, structure at center)
```

### Rift Node (hostile — impassable spike)
```
         ↑ (very tall)
    ____|_____↑↑↑↑↑|_____
               ↑
           (spike at center, impassable without sealing)
```

### Vortex Node (dimensional weak point)
```
    ___________↓↓↓___________
              (crater — terrain dips, dimensional distortion visual)
```

---

## Node Registry

The registry is the authoritative list of all nodes on a ley line. It is
seeded at game start and persisted in the save system.

```typescript
class NodeRegistry {
  private nodes: Map<string, LeyLineNode>;

  nearbyNodes(worldX: number, radius: number): LeyLineNode[] {
    // Returns nodes whose influence radius overlaps worldX
    return [...this.nodes.values()]
      .filter(n => Math.abs(n.worldX - worldX) < n.influenceRadius + radius);
  }

  getNodesForLeyLine(leyLineId: string): LeyLineNode[] {
    return [...this.nodes.values()].filter(n => n.leyLineId === leyLineId);
  }
}
```

---

## Proto Scope: Node Placement

For the prototype (Tho'ra ley line only), the node layout:

| Position | Node | Type | Distance from start |
|----------|------|------|---------------------|
| X = 0 | Tho'ra Launch Base | LAUNCH_BASE | Origin |
| X = 3,000 | Eastern Ley Pulse Node | RECHARGE | 3km |
| X = 7,500 | Vortex Theta-4 | VORTEX | 7.5km |
| X = 12,000 | Corrupted Sector (Nefarium) | RIFT | 12km |
| X = 18,000 | Falcon2 Approach Node | RECHARGE | 18km |

These are authored. Their X positions are fixed. The terrain around them is
authored. Everything between them is signal-generated.

---

## Node Discovery

Nodes start **undiscovered** (hidden from the ASI's network view, unnamed on
the map). When Jane's position comes within discovery range:

1. Node becomes **discovered** (saved to persistence)
2. Network layer: node icon appears on the ley line map
3. Ground layer: node structure becomes visible (was previously just terrain)
4. EventBus: `NODE_DISCOVERED` event fires
5. Optional: Jono hologram appears with lore about the node

**ASI can see undiscovered nodes if trust > 80** (the ASI has full sensor
access when Jane is fully cooperative — she shares her sensor feed).

---

## Node Interaction

When Jane arrives at a node (within interaction radius):

```
Arrival → Jane AI state: AT_NODE
        → EventBus: NODE_ARRIVED
        → NodeInteractionController.handleArrival(node, jane)
           ├── If node.missions contains active mission: trigger mission event
           ├── If node.puzzles.length > 0: offer UL puzzle
           ├── If node.type === RECHARGE: restore Jane and Speeder energy
           ├── If node.type === RIFT: spawn rift encounter
           └── If node.controlledBy === NEFARIUM: trigger hostile encounter
```

**The interaction is primarily driven by Jane's AI, not the player.** Jane
decides to interact based on her current goal. The ASI can influence the
interaction by:
- Setting the node as a waypoint (Jane will go there)
- Issuing a command tier 2+ suggestion to interact with a specific puzzle
- Using ASI abilities (if unlocked) to pre-scan the node before Jane arrives

---

## Node Visual Design

### Ground layer representation

Each node type has a distinctive visual signature visible at ground zoom:

| Type | Visual | Animation |
|------|--------|-----------|
| LAUNCH_BASE | Multi-level platform structure, caldera mouth, PsiSys insignia | Slow ambient energy pulse |
| RECHARGE | Crystalline spire, energy rings, ley line conduit visible | Energy pulse from ground up |
| VORTEX | Swirling dimensional distortion, unstable terrain, dimensional shimmer | Continuous slow rotation |
| RIFT | Jagged crack in terrain, hostile red energy, spike terrain | Flickering, erratic |

### Network layer representation

At network zoom, each node is:
- An icon (type-specific symbol)
- A name label (if discovered)
- A status ring (color = energy level: green→yellow→orange→red)
- A pulse animation (frequency = stability level: fast=stable, slow=unstable)

---

## Node Persistence

Node state that persists across sessions:
- `isDiscovered`
- `energyLevel` (restored partially on rest, not fully)
- `stabilityLevel`
- `controlledBy`
- Which encounters have been resolved
- Which puzzles have been solved (and UL words earned)

Node terrain shape does NOT persist — it is always computed fresh from the
`terrainProfile` function plus the current signal state.
