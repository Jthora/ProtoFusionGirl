# 01-systems/ — System Specifications

Detailed design specs for every game system. Each doc covers the full vision first, then a **Prototype Slice** section that scopes what we build in Phaser 2D.

## ASI Interface
| Document | System |
|----------|--------|
| [asi-interface/camera-system.md](asi-interface/camera-system.md) | Dual-mode camera (god-view + shoulder-cam) |
| [asi-interface/input-model.md](asi-interface/input-model.md) | All ASI input verbs and trust gating |
| [asi-interface/guidance-engine.md](asi-interface/guidance-engine.md) | Suggestion system, trust feedback loop |
| [asi-interface/time-rewind.md](asi-interface/time-rewind.md) | Death → Timestream rewind mechanic |

## Jane AI
| Document | System |
|----------|--------|
| [jane-ai/behavior-model.md](jane-ai/behavior-model.md) | Decision-making, priorities, autonomy |
| [jane-ai/learning-system.md](jane-ai/learning-system.md) | How Jane learns UL from ASI |
| [jane-ai/personality-system.md](jane-ai/personality-system.md) | Boredom, astrology influence, moods |

## World
| Document | System |
|----------|--------|
| [world/ley-line-network.md](world/ley-line-network.md) | Planet-scale network, node design |
| [world/fast-travel.md](world/fast-travel.md) | Map view, zoom transitions |
| [world/instability-events.md](world/instability-events.md) | Rifts, storms, global disturbances |
| [world/astrology-engine.md](world/astrology-engine.md) | Event generation from cosmic cycles |
| [world/faction-dynamics.md](world/faction-dynamics.md) | Reputation, political simulation |

## Universal Language
| Document | System |
|----------|--------|
| [universal-language/puzzle-design.md](universal-language/puzzle-design.md) | In-game UL puzzle presentation and mechanics |
| [universal-language/robot-communication.md](universal-language/robot-communication.md) | PsiSys interface, summoning, influence tiers |

## Combat
| Document | System |
|----------|--------|
| [combat/enemy-factions.md](combat/enemy-factions.md) | All enemy types, AI, behaviors |
| [combat/robot-army.md](combat/robot-army.md) | 4 heroes + minions, summoning, control |
| [combat/provision-system.md](combat/provision-system.md) | Background tech tree, research queue |

## Navigation
| Document | System |
|----------|--------|
| [navigation/speed-model.md](navigation/speed-model.md) | Cockpit architecture: gear + throttle + boost + fast travel |
