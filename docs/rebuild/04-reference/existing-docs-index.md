# Existing Documentation Index

> Map to all documentation files. docs/rebuild/ is authoritative; docs/game-design/ is the Holo Archives.

## Authority Hierarchy

1. **docs/rebuild/** — Authoritative design documents (you are here)
2. **docs/proto-scope/** — Strategic vision and codebase audit
3. **docs/game-design/** — Holo Archives (lore, worldbuilding, expanded concepts)
4. **docs/technical/** — Implementation-level architecture docs

Where docs/rebuild/ and docs/game-design/ conflict, **docs/rebuild/ wins**.

---

## docs/rebuild/ (Authoritative)

| Path | Topic |
|------|-------|
| 00-doctrine/player-as-asi.md | Camera, input verbs, info asymmetry, death model |
| 00-doctrine/jane-autonomy.md | Refusal, learning, solo completion, interface |
| 00-doctrine/world-simulation.md | Scale, Holo Deck, ley lines, factions, timeline |
| 00-doctrine/universal-language.md | UL integration, puzzles, failure, Jane learning |
| 00-doctrine/combat-and-factions.md | Jane combat, ASI roles, heroes, enemies, provisions |
| 00-doctrine/navigation-and-speed.md | Cockpit model, 2-scale navigation, terrain |
| 01-systems/ | 18 system specifications (see 01-systems/README.md) |
| 02-prototype/ | Build sequence, scope decisions, test criteria, constraints |
| 03-resolved-tensions/ | 7 critical design tensions, all resolved |
| 04-reference/ | Code inventory, doc index, terminology |

## docs/proto-scope/ (Strategic)

| File | Topic |
|------|-------|
| README.md | Scope refinement from pitch decks + codebase audit |
| 01-vision-and-identity.md | Player-as-ASI concept, core systems |
| 02-codebase-audit.md | 507 TS files audit, real-vs-stub classification |
| 03-gap-analysis-and-plan.md | System gaps, priorities, dependencies |
| 04-architectural-roadmap.md | Phaser → Rust/WASM → Godot evolution |

## docs/game-design/ (Holo Archives)

### Core
| File | Topic |
|------|-------|
| core/core-game-loop.md | Main game loop spec |
| core/gameplay-mechanics.md | Core mechanics reference |
| core/real-immersive-experience.md | Jordan Traña = Jono Tho'ra meta-narrative |

### Characters
| File | Topic |
|------|-------|
| characters/jane-thora.md | Jane character design and backstory |
| characters/beu.md | Beu companion specs |
| characters/game-robots.md | Robot army specifications |
| characters/factions/earth-alliance.md | Earth Alliance faction |

### World
| File | Topic |
|------|-------|
| world/game-world.md | World structure, biomes, zones |
| world/ley-lines/ley-lines-and-vortices.md | Ley line network and vortex mechanics |
| world/ley-lines/ion-storms.md | Ion storm hazards |
| world/ley-lines/instability-api.md | Instability event API |
| world/timestreams/timestreams-and-timeline.md | Timestream branching |

### Combat
| File | Topic |
|------|-------|
| combat/dynamic-threats.md | Dynamic threat scaling |

### Missions
| File | Topic |
|------|-------|
| missions/game-missions.md | Mission types and structures |
| missions/rewards-and-unlockables.md | Reward system |

### Progression
| File | Topic |
|------|-------|
| progression/player-progression.md | XP and level systems |
| progression/tech-levels.md | 16-tier tech levels |
| progression/difficulty-levels.md | 7 difficulty levels |
| progression/economy.md | Economy and resource management |

### Universal Language
| File | Topic |
|------|-------|
| universal-language/cosmic-cypher.md | Cosmic Cypher protocol |
| universal-language/base12-harmonic.md | Base-12 math foundation |
| universal-language/mind-puzzles.md | Mind puzzle templates |
| universal-language/whitepaper/part1-3.md | UL whitepaper (3 parts) |

### ASI Control
| File | Topic |
|------|-------|
| asi-control/interfaces/*.md | 7 interface paradigms (2D, Command Center, Ecosystem, Influence Web, Mentorship, Quantum Strategy, Reality Composer) |
| asi-control/mvp/*.md | 7 MVP docs (Overview, Master Plan, Timeline, Implementation, Architecture, Integration, Testing, UI/UX) |

### Business
| File | Topic |
|------|-------|
| business/innovative-concept.md | Market differentiation |
| business/pitch-strategy.md | Investor strategy |

### Narrative
| File | Topic |
|------|-------|
| narrative/lore/nefarium.md | Nefarium antagonist lore |
| narrative/psinet-downtime.md | PsiNet downtime scenarios |

## docs/technical/ (Architecture)

| Path | Topic |
|------|-------|
| architecture/event-bus-reference.md | Event bus API |
| architecture/game-scene-analysis.md | GameScene structure |
| architecture/system-dependency-map.md | System dependencies |
| systems/navigation/*.md | 20+ navigation docs (2D + 3D variants) |
| systems/world/leylines/*.md | 5 ley line technical docs |
| systems/asi-control/README.md | ASI technical architecture |

## Root-Level Documentation

| File | Topic |
|------|-------|
| README.md | Project description, quick start |
| ONBOARDING.md | AI/Copilot onboarding flow |
| SECURITY.md | Security policy |
| ASI_ERROR_SYSTEM_COMPLETE.md | Error handling |
| MAGNETOSPEEDER_TERRAIN_SYSTEM.md | Speeder terrain physics |
| UI_LAYOUT_SYSTEM.md | UI layout architecture |

## Artifacts

~70+ artifact files in artifacts/ covering: build instructions, system specs, anchor points, combat mechanics, community/modding, accessibility, analytics, and more. These are time-stamped AI-generated artifacts — use as supplementary reference, not source of truth.
