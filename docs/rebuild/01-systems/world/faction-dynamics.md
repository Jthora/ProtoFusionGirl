# System: Faction Dynamics

> Reputation tracking, political simulation, and faction responses to world events.

## Full Vision

Factions are living entities that respond to world events, player actions, and each other. Faction relationships drive emergent missions, gate content, and shape the world state at game end.

### Factions

| Faction | Starting Rep | Role | Content Gated |
|---------|-------------|------|---------------|
| **Earth Alliance** | Neutral-Positive | Quest-giver, infrastructure, military support | Launch base access, drop pods, air support |
| **PsiSys Collective** | Neutral | Robot civilization, potential deep ally | Robot hero access, PsiNet features, UL rewards |
| **The Nefarium** | Hostile | Primary antagonist syndicate | N/A (always hostile, but infiltration possible) |
| **Remnant Cabal** | Hostile | Decimated death cult, scattered | N/A (hostile, some members can be turned) |
| **Tho'ra Clan** | Allied | Jane's lineage, always supportive | Base upgrades, special missions, mentor access |

### Reputation Model

Each faction has a reputation integer: -100 (mortal enemy) to +100 (blood ally):

```
{
  factionId: string,
  reputation: number,       // -100 to +100
  trend: 'rising' | 'falling' | 'stable',
  lastChangeReason: string,
  threshold: {
    hostile: -50,
    unfriendly: -20,
    neutral: 0,
    friendly: 20,
    allied: 50,
    devoted: 80
  }
}
```

### Reputation Changes

| Action | Earth Alliance | PsiSys | Nefarium |
|--------|---------------|--------|----------|
| Complete EA mission | +5 | +2 | -3 |
| Heal damaged robot (UL) | +1 | +10 | -1 |
| Seal dimensional rift | +5 | +5 | -5 |
| Destroy robot | -5 | -15 | +2 |
| Ignore distress signal | -3 | -5 | 0 |
| Use dark/malefic UL | -10 | -10 | +5 |

### Faction Events

Reputation thresholds trigger events:
- **PsiSys at +50**: Robot hero offers to join ASI's roster
- **Earth Alliance at +50**: Drop pod support unlocked
- **PsiSys at -30**: Robots become wary, won't accept UL communication easily
- **Earth Alliance at -30**: Missions become harder (less intel, no backup)

### Inter-Faction Dynamics

Factions respond to each other:
- Nefarium attacking ley lines → Earth Alliance mobilizes → PsiSys assists if friendly
- Player helps PsiSys → Earth Alliance views positively (robot alliance is strategic)
- Player ignores Earth Alliance missions → EA reputation drops → fewer resources available

## Prototype Slice

### P2: Simple Reputation
- 3 factions tracked: Earth Alliance, PsiSys, Nefarium
- Reputation as integer, adjusted by mission outcomes
- No inter-faction dynamics

### P3: Threshold Events
- PsiSys crossing +30: companion robot becomes more cooperative
- Earth Alliance crossing +30: access to Node 3 granted

### P5: Full Dynamics
- All 5 factions
- Inter-faction responses
- Faction-driven emergent events
