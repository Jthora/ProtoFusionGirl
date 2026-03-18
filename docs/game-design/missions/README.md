# Missions

Mission design, outcome types, and reward structures.

| Document | Description |
|----------|-------------|
| [game-missions.md](game-missions.md) | 6 mission categories: exploration, diplomatic, combat, rescue/repair, training sims, psychops |
| [rewards-and-unlockables.md](rewards-and-unlockables.md) | XP systems, cosmetic unlocks, narrative branches tied to progression |

## Implementation Status

Source: `src/world/missions/MissionSystem.ts` (277 lines) + `MissionManager.ts` (76 lines)
- 16 outcome types defined (victory, defeat, retreat, surrender, diplomatic, betrayal, etc.)
- **All outcome handlers are empty stubs**
- 4 sample missions exist in `sampleMissions.ts`
