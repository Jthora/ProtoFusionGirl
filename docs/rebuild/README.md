# docs/rebuild/ — Operations Command

> "The 57 docs in game-design are the Holo Archives — lore, worldbuilding, vision. docs/rebuild is Operations Command — decisions, specs, build plans. Operations references the Archives. Operations supersedes the Archives where they conflict." — Jono Tho'ra

This directory contains the locked design decisions, system specifications, and implementation plans for Proto FusionGirl P1-P5 development. Every document here represents a DECIDED course of action.

## Reading Order

### Start Here
1. [00-doctrine/](00-doctrine/) — **Non-negotiable design law.** Read all 6 docs first.

### Then Understand the Systems
2. [01-systems/](01-systems/) — Detailed specs per system. Each doc has a "Prototype Slice" section.

### Then the Build Plan
3. [02-prototype/](02-prototype/) — What we build NOW, in what order, and how we test it.

### Reference as Needed
4. [03-resolved-tensions/](03-resolved-tensions/) — 7 critical design tensions, all resolved with decisions.
5. [04-reference/](04-reference/) — Codebase inventory, existing doc index, glossary.

## Relationship to Other Docs

| Directory | Role | Authority |
|-----------|------|-----------|
| `docs/rebuild/` | Operations Command — decisions, specs, build plans | **Source of truth** for all implementation decisions |
| `docs/game-design/` | Holo Archives — lore, worldbuilding, 57+ vision docs | Soul of the project; referenced, never deleted |
| `docs/proto-scope/` | Strategic foundation — vision, audit, gap analysis, roadmap | The WHY behind rebuild decisions |
| `docs/technical/` | Architecture reference — event bus, system map, scene analysis | Implementation details |

When a rebuild doc conflicts with a game-design doc, **rebuild wins**. The Archives preserve the vision; Operations defines the execution.

## Document Count

| Section | Files | Status |
|---------|-------|--------|
| 00-doctrine | 6 | Locked |
| 01-systems | 18 | Specs |
| 02-prototype | 5 | Build plan |
| 03-resolved-tensions | 1 | Decided |
| 04-reference | 3 | Lookup |
| **Total** | **33** | — |
