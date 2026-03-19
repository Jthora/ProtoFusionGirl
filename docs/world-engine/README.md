# World Engine — Documentation Index

> Architecture, design, and full scope for the ProtoFusionGirl world engine rebuild.
> Generated: 2026-03-18. All reasoning is grounded in the game's WHY (see vision/).

---

## Why This Exists

The original tile-based chunk system collapsed to <1 FPS and was architecturally
misaligned with the game's core premise. This directory documents the replacement
architecture and a complete accounting of what it takes to build it properly.

---

## Directory Structure

```
docs/world-engine/
├── README.md                          ← you are here
│
├── vision/
│   └── 01-why-this-architecture.md   ← WHY alignment with the ASI premise
│
├── design/
│   ├── 01-ley-line-signal-engine.md  ← core terrain generation model
│   ├── 02-dual-perspective-view.md   ← ground layer + network layer camera
│   ├── 03-simulation-fidelity.md     ← performance-reactive quality model
│   ├── 04-terrain-physics.md         ← polygon physics from signal curve
│   └── 05-node-authoring.md          ← authored places along the ley line
│
└── scope/
    ├── 01-world-engine-tasks.md      ← granular task breakdown: world engine only
    ├── 02-full-game-scope.md         ← every system, every task, full game
    └── 03-phase-plan.md              ← sequencing, dependencies, milestones
```

---

## Reading Order

1. Start with [vision/01-why-this-architecture.md](vision/01-why-this-architecture.md)
   to understand why every design decision was made.

2. Read the design docs in order — each builds on the previous.

3. Read [scope/02-full-game-scope.md](scope/02-full-game-scope.md) to understand
   the full magnitude of work. Do not skip this. It exists to prevent
   underestimating the effort involved.

4. Use [scope/03-phase-plan.md](scope/03-phase-plan.md) to understand what to
   build in what order and why.

---

## Key Constraints

- Browser-based (Phaser 3 + TypeScript). No native engine.
- Solo or small team development.
- Proto scope: Tho'ra Launch Base only. One ley line. One biome.
- Every design decision must pass the implementation priority filter from
  [docs/proto-scope/01-vision-and-identity.md](../proto-scope/01-vision-and-identity.md):
  *Does this reinforce "I am the ASI guiding Jane"?*

---

## Related Documents

- [docs/proto-scope/01-vision-and-identity.md](../proto-scope/01-vision-and-identity.md) — canonical WHY
- [docs/proto-scope/03-gap-analysis-and-plan.md](../proto-scope/03-gap-analysis-and-plan.md) — what's broken and priority order
- [docs/gameworld/leylines/](../gameworld/leylines/) — earlier terrain research (mostly superseded)
- [docs/planetary-architecture/](../planetary-architecture/) — coordinate theory (still valid)
