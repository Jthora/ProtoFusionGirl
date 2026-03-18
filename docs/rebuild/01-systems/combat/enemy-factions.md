# System: Enemy Factions

> All enemy types, AI behaviors, and combat design for each faction.

## Full Vision

Five enemy factions, each with distinct combat patterns, vulnerabilities, and narrative context.

### Faction 1: Remnant Terminators

**Lore**: Time War survivors. Disconnected from the PsiNet, running on degraded combat protocols. Mindless but dangerous.

| Property | Value |
|----------|-------|
| AI | Patrol → detect → charge → melee attack. No tactics. |
| Attack | Melee (robotic arms, makeshift weapons) |
| Health | Medium |
| Speed | Medium |
| Vulnerability | UL reprogramming (converts to ally), psionic disruption, focused fire |
| Threat Level | Low-Medium (individually); Medium-High (groups) |

**Unique Mechanic**: Can be reprogrammed via UL instead of destroyed. A reprogrammed Terminator becomes a temporary ally.

### Faction 2: Draken Seforthi Spawn

**Lore**: Tiny demon entities that emerge from dimensional rifts. Physical manifestations of the Draken Seforthi's influence.

| Property | Value |
|----------|-------|
| AI | Swarm → surround → psionic interference + bite. Coordinated waves. |
| Attack | Psionic disruption (drains energy) + physical bite (low damage) |
| Health | Very Low (individually) |
| Speed | Fast |
| Vulnerability | Psionic weapons (Fusion Blades), rift sealing (eliminates source) |
| Threat Level | Low (single); High (swarm) |

**Unique Mechanic**: Killing individual spawn is infinite — they keep coming from the rift. Must seal the rift to stop spawning.

### Faction 3: Nefarium Phantom Drones

**Lore**: Shadow constructs manifested from Nether energy. Can appear anywhere, disrupt electronics and psionic equipment.

| Property | Value |
|----------|-------|
| AI | Materialize → disrupt nearby electronics → ranged shadow bolt → dematerialize. Hit and run. |
| Attack | Ranged shadow bolts, electronic disruption aura |
| Health | Low (but hard to hit — phases in/out) |
| Speed | Fast (teleport between positions) |
| Vulnerability | Light-based attacks, UL banishment symbols, sustained psionic damage |
| Threat Level | Medium (disruption is the real danger) |

**Unique Mechanic**: Disrupts Magneto Speeder and equipment when nearby. Must be eliminated before electronics-dependent gameplay (speeder travel, PsiNet comms).

### Faction 4: Cabal Death Cult Legions (Full Vision Only)

**Lore**: Remnants of the decimated Cabal. Human-adjacent with cybernetic augmentation. Organized, tactical, hate the Tho'ra.

| Property | Value |
|----------|-------|
| AI | Organized squad tactics. Cover, flanking, suppression. |
| Attack | Ranged weapons (energy rifles), cybernetic melee |
| Health | Medium-High |
| Speed | Medium |
| Vulnerability | Diplomacy possible (some can be turned), EMP disrupts cybernetics |
| Threat Level | High |

### Faction 5: Hostile Reptilian Forces (Full Vision Only)

**Lore**: Ancient pre-Time War entities emerging from underground. Powerful, territorial.

| Property | Value |
|----------|-------|
| AI | Territorial defense. Won't pursue far from home. Extremely strong in their zone. |
| Attack | Heavy melee, earth manipulation |
| Health | Very High |
| Speed | Slow |
| Vulnerability | Aerial attacks (can't fly), sustained DPS, avoid their territory |
| Threat Level | Very High |

## Prototype Slice

### P2-P3: 2 Enemy Factions

**Remnant Terminators**:
- Simple AI: detect within range → walk toward → melee attack
- Health: 3 hits from blast pistol
- UL reprogramming: deploy "peace" symbol within range → converts to temporary ally
- Spawn: placed at Node 3 area

**Nefarium Phantom Drones**:
- Simple AI: materialize at random position → fire shadow bolt → dematerialize → repeat
- Health: 2 hits from Fusion Blade
- Electronic disruption: speeds up instability decay on nearby ley lines
- Spawn: appear near rift events

Two factions, two combat styles, two vulnerability types. Scales naturally to 5 later.
