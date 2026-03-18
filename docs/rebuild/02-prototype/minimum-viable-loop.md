# Minimum Viable Loop: The 3-Minute Experience

> The single scenario that proves Proto FusionGirl's core concept works.

## The Scene

**Setup**: The Holo Deck activates. The PsiNet comes online. You are the ASI.

### Minute 0:00 — 0:30 (Orientation)

Jane drops into the simulation at **Node 1: Tho'ra Launch Base**. She's standing on a volcanic island platform. The HUD shows:
- Trust meter (starts at 50/100 — neutral)
- Ley line stability indicator (Node 1: stable, Node 2: declining, Node 3: critical)
- Jane's status (health, position, current action)

**Jane acts immediately.** Without ASI input, she turns toward the nearest mission marker (Node 3 — the urgent rift). She starts walking.

The ASI sees something Jane doesn't: a **damaged PsiSys robot** on the path toward Node 2, emitting a distress signal. The robot is not on Jane's radar — it's outside her current objective.

### Minute 0:30 — 1:30 (The Choice)

**Path A (ASI Guides):**
The player clicks near the damaged robot. A waypoint appears. Jane hesitates (she was headed to Node 3), then redirects. She reaches the robot.

The UL puzzle palette opens. The player selects **Earth base + Healing modifier** → deploys the repair symbol. The robot reactivates. It's Terra — a combat-class PsiSys unit.

Terra joins Jane's squad. Trust meter rises (+5 — guidance helped).

Jane and Terra proceed to Node 3 together.

**Path B (ASI Ignores):**
The player does nothing or guides Jane directly to Node 3. Jane passes the damaged robot without noticing. The robot remains broken.

Jane arrives at Node 3 alone.

### Minute 1:30 — 2:30 (The Consequence)

**At Node 3: Unstable Rift Site**

A rift is forming. Remnant Terminators patrol the area. Nefarium Phantom Drones materialize and disrupt Jane's equipment.

**With Terra (Path A):**
Terra shields Jane during combat. Jane fights Terminators. The ASI directs Terra: "defend here." The ASI deploys a UL banishment symbol to disperse phantom drones. Working together, they clear the area. Jane reaches the rift. The ASI can attempt to seal it.

**Without Terra (Path B):**
Jane fights alone. She takes more damage. Phantom drones disrupt her equipment. She's overwhelmed. She retreats. The rift isn't sealed. Stability continues to drop.

### Minute 2:30 — 3:00 (The Outcome)

**Path A result:**
Rift sealed. Node 3 stabilized. Timeline quality: **IMPROVED**. 
Jane: "That robot... I wouldn't have found it without you."
Terra follows Jane loyally. PsiSys reputation rises.

**Path B result:**
Rift expanding. Node 3 unstable. Jane retreats to Node 2, discovers the robot she missed — now further damaged by the rift's expansion. Timeline quality: **DEGRADED**.
Jane survives. The world suffers.

## What This Proves

1. **Player = ASI works**: The player's value is information and guidance, not direct control
2. **Jane is autonomous**: She acts on her own, heads toward objectives, fights when needed
3. **Information asymmetry**: The ASI saw the robot; Jane didn't
4. **Consequence of intervention**: Helping → robot ally → combat success → rift sealed
5. **Consequence of inaction**: Ignoring → solo combat → failure → world degrades
6. **UL has gameplay impact**: Healing the robot was a UL puzzle with tangible results
7. **"Watched my movie, different outcomes"**: Same start, different endings based on ASI involvement

## Systems Required

To run this loop, the following must be functional:

| System | State Required |
|--------|---------------|
| Jane AI | Navigate to waypoints + objectives, basic combat |
| ASI Input | Click-to-waypoint, UL symbol placement |
| Trust Meter | Display + basic adjustment |
| 3 Nodes | Base, Outpost, Rift — with transitions |
| 1 UL Puzzle | Repair symbol (2 components) |
| 1 Robot Companion | Terra — follow, shield, respond to commands |
| 2 Enemy Types | Terminators (melee) + Phantoms (ranged, disruption) |
| Instability | Node 3 has declining stability + rift spawn |
| Outcome Display | Timeline quality indicator |

This is the **P3 deliverable** — the integration test for all core systems.
