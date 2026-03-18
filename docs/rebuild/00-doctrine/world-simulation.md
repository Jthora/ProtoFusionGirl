# Doctrine: World Simulation

> Non-negotiable design law. The world is alive, planet-scale, and emergent.

## The Law

**Proto FusionGirl is a planetary-scale simulation spanning 2032-2036.** The world generates events, factions respond, ley lines pulse, and the state of everything at 2036 becomes the initial condition for FusionGirl Phase 2. Time passes. Actions have consequences. Inaction has consequences.

## Scale

- **The whole planet.** Real ley lines. Real node positions aligned with real-world sites of significance.
- The prototype renders the **network**, not the geography: nodes and connections on a stylized tactical display.
- Each node has a local zone with terrain, missions, and events.
- Think Civilization: the map IS the world; the cities ARE the detail.

## The Holo Deck

All Proto gameplay occurs inside the **Holo Deck** at Tho'ra Launch Base:
- A training simulation that holographically projects into the real world via Ley Lines
- The Holo Deck IS the 2D rendering — this is an in-universe justification for prototype-level fidelity
- Higher-fidelity rendering comes with Phase 2 (FusionGirl) when the simulation tech improves in-story
- **Lean into the limitation.** The prototype's art style IS the Holo Deck's resolution.

## Ley Line Network

- Ley lines are Earth's geo-magnetic energy highways
- Nodes are located at real-world significant sites (launch bases, ancient sites, power points)
- The Magneto Speeder locks onto ley lines magnetically — requires no fuel on-line
- Between nodes: terrain, enemies, anomalies, damaged areas
- The network is the skeleton of the entire game world

### Instability

Ley lines are alive. They can be aggravated by:
- Dimensional rifts
- Ion storms
- Enemy activity (Nefarium infiltration, Draken Seforthi emergence)

| Severity | Effect |
|----------|--------|
| Ambient | Shimmer effects, minor course corrections |
| Moderate | Traversal becomes hazardous, combat spawns mid-path |
| Critical | Rift opens at a node, area becomes a crisis zone |

Instability drives emergent gameplay: you planned to go to Node B, but the ley line surged.

## Emergent Missions

Missions are NOT designed. They are GENERATED:

| Trigger | Condition | Event Generated |
|---------|-----------|-----------------|
| Ley line stability drops below threshold | Instability accumulates | Rift event |
| Faction hostility rises | Aggression from player actions or neglect | Attack event |
| Jane completes personal objective | Growth milestone reached | Growth event |
| Robot distress signal | Damaged or stranded PsiSys detected | Rescue event |

The mission system is a **consequence engine**. The player doesn't pick missions from a board — they respond to a living world.

## Astrology Engine

The in-game calendar maps to cosmic cycles that influence:
- Jane's emotional state and behavioral tendencies
- Event generation probability and type
- Faction mood and diplomatic openness
- Ley line resonance patterns

**Prototype implementation**: A lookup table. Solar date → event type weights. Simple correspondences. The *interface* is designed for depth; the *implementation* starts as a table.

## Faction Dynamics

| Faction | Role | Alignment |
|---------|------|-----------|
| Earth Alliance | Humanity's defense coalition; StarCom Academy | Order/Core |
| The Nefarium | Transdimensional crime syndicate (Nether energy) | Chaos |
| Draken Seforthi | Super-Cosmic Demon God Species | Void |
| Tho'ra Clan | Jane's psionic lineage | — |
| PsiSys | Robot collective consciousness | Variable (trust-based) |
| The Cabal | Decimated death cult, remnants angry and active | Chaos |

**Prototype implementation**: A reputation integer per faction that shifts based on player actions. Simple threshold math for event triggers.

## Timeline and Win Condition

- Game clock runs from 2032 to 2036 (4 in-game years)
- The game ends when the timespan completes
- There is no "you win" screen — there is a **future**
- The state of the world at game end IS the outcome
- The prototype save state becomes the initial condition for FusionGirl Phase 2
- Everything you did matters. Everything you didn't do also matters.

## Timestream Mechanic

- The astrology engine manifests events → recorded in a history log
- The ASI can traverse the history log backwards (Timestream navigation)
- Jane's death triggers forced Timestream rewind to the causal decision point
- Voluntary Timestream browsing costs psionic energy and becomes available mid-game

## References
- [docs/game-design/world/game-world.md](../../game-design/world/game-world.md) — World overview
- [docs/game-design/world/ley-lines/](../../game-design/world/ley-lines/) — Ley line network design
- [docs/game-design/world/timestreams/](../../game-design/world/timestreams/) — Timeline mechanics
- [docs/game-design/characters/factions/earth-alliance.md](../../game-design/characters/factions/earth-alliance.md) — Earth Alliance
- [docs/game-design/narrative/lore/nefarium.md](../../game-design/narrative/lore/nefarium.md) — The Nefarium
