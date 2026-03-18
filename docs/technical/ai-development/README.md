# AI Development

NPC/agent behavior systems and AI training plans.

| Document | Description |
|----------|-------------|
| [ai-development-plan.md](ai-development-plan.md) | AI training roadmap for NPC behavior and decision-making |

## Implementation Status

- `src/ai/JaneAI.ts`: **6 lines, empty class** — zero autonomous behavior implemented
- `Jane.updateAI(dt)`: **Empty stub** — called but does nothing
- No behavior trees, no decision systems, no pathfinding AI

This is the **single largest gap** between design and code. The game's identity (player-as-ASI guiding autonomous robots) requires Jane to have her own decision-making. See [../../planning/proto-scope/03-gap-analysis-and-plan.md](../../planning/proto-scope/03-gap-analysis-and-plan.md) Priority 1.
