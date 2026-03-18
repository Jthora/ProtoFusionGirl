# System: Fast Travel

> Network map view, zoom transitions, and strategic movement.

## Full Vision

Fast travel is a MODE, not a speed. It exits the ground-level scene entirely and presents the ley line network as a strategic map.

### Activation
- Available from any point along a ley line (not during combat or active instability event)
- Keypress or UI button opens the network map overlay
- Game pauses or enters slow-mo while map is open (player is the ASI — time manipulation is thematic)

### Network Map View

- Full ley line network displayed as a 2D graph
- Nodes: icons with status (stable ✅, unstable ⚠️, rift 🔴, locked 🔒)
- Edges: colored lines showing stability
- Current position: highlighted marker on the network
- Discovered nodes: bright; undiscovered: dim outlines
- Hover node: tooltip with name, biome, threats, authorization status

### Travel Process

1. Player opens map
2. Selects authorized, reachable destination node
3. Transition animation: current scene zooms out → map view → path highlights → destination zooms in
4. Player arrives at destination node's local zone
5. Travel takes game-time (not instant) — events can occur during transit (shown as notifications)

### Restrictions

- Cannot fast travel TO a node under active rift event (must approach on ground)
- Cannot fast travel FROM combat
- Cannot fast travel to unauthorized nodes
- Ley line severance (extreme instability) blocks travel on that edge

### In-Universe Justification

This is PsiNet-assisted navigation. The ASI plots the optimal course through the ley line network while Jane rides the Magneto Speeder on magnetic auto-pilot. The "fast travel" is Jane actually traveling — the ASI just handles the navigation.

## Prototype Slice

- **P2**: Map overlay showing 3 nodes. Click to travel (instant transition for prototype). No animation.
- **P4**: Travel takes game-time. Path animation (node A → highlight edge → node B). Events during transit shown as popups on arrival.
- **P5**: Full zoom transition animation. Restrictions enforced (can't travel to rift).
