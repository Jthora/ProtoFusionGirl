# Proto FusionGirl — Scope & Vision Documentation

Comprehensive scope refinement for **Proto FusionGirl**, synthesized from 20+ pitch deck documents, a deep codebase audit (every file read, every system traced), wiki research, and architectural analysis.

## Document Index

| # | Document | Content |
|---|----------|---------|
| 01 | [01-vision-and-identity.md](01-vision-and-identity.md) | **What this game IS.** Pitch deck synthesis + core design identity (Player-as-ASI, autonomous Jane, ethical tension, Holo Deck framing). All game systems reference (Universal Language triads, Ley Lines, Factions, 4 Companions, 4 Biomes, Missions, Economy, Tech Levels). |
| 02 | [02-codebase-audit.md](02-codebase-audit.md) | **What the code actually does.** File-by-file audit of every major system. GameScene method map, subsystem density analysis, integration wiring, real-vs-stub classification. 507 files audited with honest metrics. |
| 03 | [03-gap-analysis-and-plan.md](03-gap-analysis-and-plan.md) | **What's missing and what to build.** System-by-system gap ratings, implementation priorities, dependency graph, success criteria, scope exclusions. |
| 04 | [04-architectural-roadmap.md](04-architectural-roadmap.md) | **Where this is going.** Three-phase tech evolution (Phaser → Rust UL → Godot 4), scope level mapping, risk mitigation, decision log. |

## Audit Methodology

- **Codebase**: 41,057 lines across 507 TS files. Every file >20 lines read in full. GameScene (1,675 lines) traced method-by-method.
- **Tests**: 97 suites (75 pass / 22 fail), 434 tests (423 pass / 11 fail). All failures catalogued.
- **Density**: 214 of 507 files (42%) are ≤20 lines. Only 102 files (20%) exceed 100 lines. Real behavioral code ~18,000 lines.
- **Pitch Deck**: 20+ documents from `docs/PitchDeck/`. FusionGirl wiki (Universal Language, Scope Levels, Jane Tho'ra).
- **External**: Mecha Jono / Jetson AGX context, Archangel Agency methodology.
- **Git**: Single contributor, 19 commits in 2025, mostly AI-assisted.

## Key Insight

> The codebase has strong infrastructure in the right places — a sophisticated speed physics engine (523 lines), adaptive camera (326 lines), LOD terrain streaming (386 lines), and a production-quality event bus. But it's missing the two things that make Proto FusionGirl unique: **the Player-as-ASI perspective** and **Jane's autonomous behavior**. The existing code treats Jane as a directly-controlled platformer character, which contradicts the pitch's central design.
