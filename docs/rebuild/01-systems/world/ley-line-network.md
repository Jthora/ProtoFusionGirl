# System: Ley Line Network

> Planet-scale network architecture, node design, and traversal mechanics.

## Full Vision

The ley line network is Earth's geo-magnetic energy grid — the skeleton of the game world. Every location, mission, and event exists at or between ley line nodes.

### Network Structure

- **Nodes**: Fixed points at real-world significant locations (launch bases, ancient sites, power points)
- **Edges**: Ley line connections between nodes (magnetic energy highways)
- **Biomes**: Each node has a local zone with terrain type based on geography
- **Stability**: Each edge and node has a stability value that fluctuates with events

### Node Types

| Type | Function | Examples |
|------|----------|---------|
| **Launch Base** | Safe zone, mission hub, loadout, research | Tho'ra Base (volcanic/island), Falcon2 (forest/mountain), StarCom (polar/ice), DuneSpire (desert) |
| **Outpost** | Small safe zone, repair, limited services | Robot outposts, mining stations, observation posts |
| **Wild Node** | No services, high-value resources/events | Rift sites, ancient ruins, energy convergence points |
| **Contested Node** | Faction-controlled, requires diplomacy or combat | Nefarium strongholds, rogue robot camps, Cabal remnants |

### Edge Properties

Each ley line connection has:
```
{
  nodeA: string,
  nodeB: string,
  stability: 0-100,          // Current stability (100 = perfect, 0 = rift)
  biome: BiomeType,           // Terrain type for ground traversal
  length: number,             // Travel time at base speed
  activeThreats: Threat[],    // Current enemies/anomalies on this path
  activeEvents: Event[],      // Current emergent events
  discovered: boolean         // Whether player has traversed this edge
}
```

### Network Map Representation (Prototype)

- **2D tactical display** — NOT a 3D globe
- Nodes as icons with status indicators (stable/unstable/contested/rift)
- Edges as colored lines (green = stable, yellow = unstable, red = dangerous, black = severed)
- Minimal geographic context — the network IS the map
- In-universe: this is PsiNet visualization through the Holo Deck
- Player clicks a node to fast-travel; clicks an edge to see its status

### Authorization

- Jane starts with access to Tho'ra Launch Base and adjacent nodes only
- New nodes are unlocked by completing Earth Alliance missions
- Each Launch Base has its own authorization chain
- Unauthorized nodes appear as dim/locked on the network map

## Existing Code

- `src/world/leyline/LeyLineManager.ts` (~170 lines): Network management, pathfinding
- `src/world/leyline/LeyLinePathfinder.ts`: A* pathfinding between nodes
- `src/world/leyline/LeyLineTypes.ts`: Type definitions
- Instability event API defined in `docs/game-design/world/ley-lines/instability-api.md`

## Prototype Slice

### Network: 3 Nodes, 2 Edges

```
[Node 1: Tho'ra Base] ---edge1--- [Node 2: Robot Outpost] ---edge2--- [Node 3: Rift Site]
```

- **Node 1 — Tho'ra Launch Base**: Home. Tutorial. Safety. Loadout. Research panel.
- **Node 2 — Damaged Robot Outpost**: Core ASI-guides-Jane interaction. Damaged PsiSys robots. UL puzzle location.
- **Node 3 — Unstable Rift Site**: Climactic encounter. Rift forming. Combat. High stakes.

- **Edge 1**: Stable. Short. Tutorial traversal. Ambient ley line effects.
- **Edge 2**: Unstable. Longer. May have threats. Instability events possible.

### Map: Simple overlay
- 3 nodes shown as icons on a styled panel
- Click node to fast travel (if authorized + stable)
- Edge color shows stability
