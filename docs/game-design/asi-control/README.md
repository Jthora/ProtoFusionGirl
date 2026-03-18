# ASI Control — Interface Design

The defining game mechanic: Player IS the ASI. These documents define 8 interface paradigms through which the ASI experiences and manipulates the game world.

## Key Concept

See [interfaces/asi-superiority.md](interfaces/asi-superiority.md) — **How ASI control feels BETTER than direct avatar control.** This is the design thesis for the entire game.

## Interface Paradigms

| Document | Interface | Description |
|----------|-----------|-------------|
| [interfaces/command-center.md](interfaces/command-center.md) | Command Center | Multi-panel mission control dashboard, omniscient player capabilities |
| [interfaces/ecosystem-orchestrator.md](interfaces/ecosystem-orchestrator.md) | Ecosystem Orchestrator | Swarm intelligence UI for commanding robot/NPC collectives |
| [interfaces/influence-web.md](interfaces/influence-web.md) | Influence Web | Faction/relationship network visualization and manipulation |
| [interfaces/mentorship-console.md](interfaces/mentorship-console.md) | Mentorship Console | NPC guidance system UI |
| [interfaces/quantum-strategy.md](interfaces/quantum-strategy.md) | Quantum Strategy | Multi-timeline simultaneous manipulation |
| [interfaces/reality-composer.md](interfaces/reality-composer.md) | Reality Composer | Environmental manipulation and world state editor |
| [interfaces/2d-interface.md](interfaces/2d-interface.md) | 2D Interface | 2D UI paradigms for ASI control systems |
| [interfaces/asi-superiority.md](interfaces/asi-superiority.md) | Design Thesis | Why ASI perspective > direct character control |

## MVP Implementation Plan

8 documents covering the first implementation pass of ASI Control:

| Document | Focus |
|----------|-------|
| [mvp/README.md](mvp/README.md) | Entry point |
| [mvp/MASTER_PLAN.md](mvp/MASTER_PLAN.md) | Master plan |
| [mvp/MVP_Overview.md](mvp/MVP_Overview.md) | Scope and requirements |
| [mvp/Technical_Architecture.md](mvp/Technical_Architecture.md) | System design |
| [mvp/Implementation_Guide.md](mvp/Implementation_Guide.md) | Build instructions |
| [mvp/Integration_Guide.md](mvp/Integration_Guide.md) | Integration with game systems |
| [mvp/UI_UX_Specifications.md](mvp/UI_UX_Specifications.md) | UI/UX specs |
| [mvp/Testing_Strategy.md](mvp/Testing_Strategy.md) | Test plan |
| [mvp/Development_Timeline.md](mvp/Development_Timeline.md) | Timeline |

## Implementation Status

Source: `src/asiControl/` (3,500 lines) — TrustManager, ThreatDetector, GuidanceEngine, CommandCenterUI. Architecturally 95% complete. Missing: player-visible ASI perspective.
