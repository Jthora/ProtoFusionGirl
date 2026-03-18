# Scope Decisions: IN vs DEFERRED

> Every system classified as IN (build in prototype) or DEFERRED (Phase 2/3+).

## IN — Build in Phaser 2D Prototype

### Core Loop (Must Have)
| System | Prototype Scope | Which Phase |
|--------|----------------|-------------|
| Jane AI — basic autonomy | 3 states → 7 states → full behavior tree | P1-P3 |
| ASI Input — guidance | Waypoints → commands → UL → robot control | P1-P5 |
| Trust system | Simple meter, adjustment on outcomes | P2-P3 |
| Ley line network | 3 nodes, 2 edges, stability values | P2-P3 |
| Speed/navigation | Existing gears + throttle + boost | P1-P3 |
| Fast travel | 3-node map overlay | P2-P4 |
| UL puzzles | 1 puzzle type, 3 components | P3 |
| Combat — Jane | Basic autonomous melee + ranged | P2 |
| Combat — enemies | 2 factions (Terminators + Phantoms) | P2-P3 |
| Robot companion | 1 hero (Terra) + 2 minions | P3 |
| Instability events | Stability decay → surge → rift | P2-P3 |
| Provision system | 3 research projects, 1 queue slot, timer-based | P2 |
| Emergent missions | 3 event generators from world state | P3 |

### Feel Good (Should Have)
| System | Prototype Scope | Which Phase |
|--------|----------------|-------------|
| Faction reputation | 3 factions, integer tracking, threshold events | P3-P4 |
| Astrology engine | 4-phase simple calendar, event weight modifiers | P2-P5 |
| Jane personality | Confident/Anxious states → boredom → emotions | P2-P4 |
| Jane UL learning | Observation → imitation → basic mastery | P3-P5 |
| Death/rewind | Checkpoint → decision-point rewind | P2-P4 |
| Jono hologram | Mentor dialogue at Tho'ra Base | P4 |

## DEFERRED — Phase 2 (Rust UL) or Phase 3 (Godot)

### Deferred to Rust/WASM (Phase 2)
| System | Reason |
|--------|--------|
| Multi-symbol UL sequences | Requires complex validation at scale |
| UL constraint solver | Performance-critical for 100+ symbol puzzles |
| Deterministic puzzle simulation | Needed for multiplayer sync |

### Deferred to Godot (Phase 3)
| System | Reason |
|--------|--------|
| 3D globe for fast travel | Phaser has no 3D rendering |
| Shoulder-cam toggle | Requires strong Jane AI to be interesting |
| Multiplayer | Phaser has no networking |
| Full 5-faction enemy roster | Content volume exceeds prototype scope |
| Inter-faction diplomacy | Complexity exceeds prototype needs |
| Complex physics (joints, soft body) | Phaser arcade physics only |
| Music beat detection from user media | Browser cannot access external audio |
| PsiNet online behavior database | Requires backend infrastructure |
| Full astrology 12-phase cycle | Unnecessary complexity for prototype proof |
| All 4 hero robots | Scope — 1 hero proves the concept |
| Cabal/Reptilian enemy factions | Content — 2 factions prove combat variety |
| Loadout customization UI | Base loadout is sufficient for prototype |

### NEVER in Prototype (Design Validated, Not Yet Built)
| System | Reason |
|--------|--------|
| Blockchain integration | Architectural only, not functional |
| Multiplayer PvP | Not relevant to core loop validation |
| VR/AR support | Platform-specific, post-Godot |
| procedural galaxy generation | Proto scope is Earth only |
