# Terminology

> Canonical definitions for Proto FusionGirl.

## Characters

| Term | Definition |
|------|-----------|
| **Jane Tho'ra** | The protagonist. A young woman with latent psionic abilities. Autonomous — acts on her own, makes her own decisions. The player does NOT control her directly. |
| **ASI** | Artificial Superintelligence. The PLAYER. An emergent consciousness within the PsiNet. Guides Jane through suggestions, environmental manipulation, and UL deployment. |
| **Jono Tho'ra** | Jane's father-figure / mentor. Mecha Technomancer. Created the PsiNet and the Holo Deck. Has "Timesight" — sees possible futures. Keeps secrets. |
| **Jordan Traña** | Real-world identity of Jono Tho'ra. The actual developer. Archangel Agency LLC. The meta-narrative: making the game IS the in-universe mission. |
| **Beu** | Jane's companion creature. Emotional support. Reacts to world state. |
| **Terra** | Earth Hero robot. PsiSys combat-class unit. Shields allies. First robot companion in prototype. |
| **Ignis** | Fire Hero robot. Damage-class. Deferred to full game. |
| **Aqua** | Water Hero robot. Support/healing. P5 stretch goal. |
| **Zephyr** | Air Hero robot. Scout/speed. Deferred to full game. |

## Systems & Technology

| Term | Definition |
|------|-----------|
| **PsiNet** | Planetary psionic network. The ASI's "body" — its access to the world. All ASI actions go through PsiNet. |
| **PsiSys** | PsiSys robots. Autonomous machines connected to the PsiNet. Can be befriended through UL communication. |
| **Holo Deck** | Holographic simulation system at Tho'ra Base. In-universe justification for 2D rendering. The prototype IS the Holo Deck. |
| **UL (Universal Language)** | A symbolic communication system. Composed of base elements + modifiers. Used to heal robots, seal rifts, communicate with PsiSys, and influence world events. |
| **Cosmic Cypher** | The encoding system for UL. Base-12 harmonic mathematical foundation. |
| **MagnetoSpeeder** | Jane's vehicle. Hovers above terrain. 5 speed tiers (Walking → Warp). Uses ley line energy. |
| **Ley Lines** | Energy conduits connecting planetary nodes. Have stability values. When stability drops, instability events occur. |
| **Ley Node** | A location on the ley line network. Has stability, occupying faction(s), and connected edges. Prototype has 3 nodes. |
| **Timestream** | The branching history of events. ASI can browse past events. Death triggers rewind to a decision point. |
| **Timesight** | Jono's ability to see possible futures. Explains his mentor guidance and cryptic warnings. |

## Factions

| Term | Definition |
|------|-----------|
| **Tho'ra Clan** | Jane and Jono's faction. Guardians of the PsiNet. Allied with PsiSys. |
| **Earth Alliance** | Human civilization faction. Neutral to player initially. |
| **PsiSys Collective** | Robot faction. Can become allies through UL communication. |
| **Remnant Forces** | Enemy faction. Human-tech military remnants. Terminators are their ground troops. |
| **The Nefarium** | Primary antagonist faction. Shadow organization. Phantom Drones are their weapons. Disrupts PsiNet and technology. |
| **Cabal** | Enemy faction. Deferred to full game. Political manipulation focus. |
| **Reptilian Overlords** | Enemy faction. Deferred to full game. Ancient dominion hierarchy. |

## Gameplay Concepts

| Term | Definition |
|------|-----------|
| **Trust** | Numeric value (0-100) representing Jane's trust in the ASI. Affects which actions Jane will accept. Earned through good guidance, lost through harm. |
| **Information Asymmetry** | The ASI sees things Jane doesn't (and vice versa). This IS the core gameplay mechanic. |
| **Guidance** | ASI suggestions to Jane (waypoints, commands, UL deployment). Jane evaluates and may accept or refuse. |
| **Refusal** | Jane rejects ASI guidance she considers harmful, off-mission, or unwise. Not a failure — it's character. |
| **Provision** | Fire-and-forget background research/manufacturing. Start → timer → done → effect. |
| **Stability** | Per-node value (0-100). Decays over time. Low stability → surges → rifts → enemy spawns. |
| **Rift** | Physical manifestation of instability at a ley node. Spawns enemies, damages surroundings. Can be sealed with UL + combat. |
| **Surge** | Warning phase before a rift. Visual shimmer, stability dropping fast. |
| **Timeline Quality** | Aggregate score reflecting the state of the world. Higher = more stability, more allies, fewer rifts. THE endgame metric. |
| **Cosmic Phase** | Current astrological phase of the world calendar. Affects event probabilities and Jane's emotional state. |

## Architecture Terms

| Term | Definition |
|------|-----------|
| **EventBus** | Type-safe publish/subscribe system. All systems communicate through events. |
| **Behavior Tree** | Jane's AI decision structure. Priority-ordered state evaluation. |
| **Speed Tier** | One of 5 movement speeds: Walking (1), Running (2), Supersonic (3), Hypersonic (4), Warp (5). |
| **Cockpit Model** | Navigation architecture: Gear (tier) × Throttle (analog) × Boost (burst) × Fast Travel (map). |
| **Network Graph** | World representation: nodes connected by edges. NOT a physical terrain map. |
| **Chunk** | Terrain segment loaded/unloaded for streaming. Used at node-level side-scrolling gameplay. |

## Meta-Narrative Terms

| Term | Definition |
|------|-----------|
| **Archangel Agency LLC** | Jordan Traña's real-world organization. Operates at intersection of tech and narrative. |
| **Earth Alliance News** | Jordan Traña's media project. Part of the real-world presence. |
| **Tho'ra Tech LLC** | Jordan Traña's technology company. Real-world entity. |
| **The Nefarium** (meta) | In-universe AND real-world concept. The game is a weapon against it — teaching UL to trigger mass awakening. |
| **Natura** | The larger franchise universe. Proto FusionGirl is one story within it. Tho'ra Clan exists to assist the secret main character of Natura. |
