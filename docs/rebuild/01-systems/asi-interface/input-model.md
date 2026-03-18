# System: ASI Input Model

> All input verbs the ASI can use, gated by trust level.

## Full Vision

The ASI interacts with the world through multiple simultaneous input channels. All capabilities exist from minute one — authority to use them is earned through trust.

### Input Verb Table

| Verb | Action | Trust Gate | Implementation |
|------|--------|-----------|----------------|
| **Click Location** | Places waypoint for Jane or robots | None | Click → emit `WAYPOINT_PLACED` event |
| **Summon Robot** | Call PsiSys unit to location | Low | Select robot type → place summon marker |
| **Issue Guidance** | Command enters Jane's guidance queue | Low-Medium | Contextual menu → `GUIDANCE_ISSUED` event |
| **Direct Robot** | Take control of a PsiSys robot | Medium | Click robot → enter pilot mode |
| **Place UL Symbol** | Construct and deploy Universal Symbol | Medium | Open UL palette → compose → deploy |
| **Environmental Adjust** | Manipulate world parameters | Medium-High | Context-sensitive interaction (doors, defenses, energy) |
| **Set Research Priority** | Queue tech tree research | Low | Research panel → select project → start timer |
| **Manage Loadout** | Equip Jane between missions | Low | Loadout screen at base |
| **Direct Jane Override** | Temporarily control Jane's body | High + Consent | Hold override key → Jane's systems supercharged |
| **Timeline Browse** | Navigate Timestream history | Medium | Open Timestream panel → scroll history |

### Trust Gating

Trust is a 0-100 float maintained by `TrustManager`:
- Guidance followed → trust +
- Guidance ignored (by ASI choice) → no change
- Guidance that helped Jane → trust ++
- Guidance that hurt Jane → trust --
- Direct override without consent → trust ---

Trust thresholds unlock input verbs progressively:
- 0-20: Waypoints, basic summon, research, loadout
- 20-40: Guidance queue, basic robot direction
- 40-60: UL deployment, environmental manipulation
- 60-80: Advanced robot control, timeline browse
- 80-100: Direct Jane override (with consent check)

### Context Sensitivity

Input verbs change meaning based on context:
- Clicking near an enemy with Jane selected = "attack guidance"
- Clicking near a damaged robot = "interact/repair guidance"
- Clicking terrain = "move here guidance"
- Same input, different context, different guidance type

## Existing Code

- `src/asiControl/systems/GuidanceEngine.ts` (~200 lines): Partial implementation
- `src/asiControl/systems/TrustManager.ts` (~150 lines): Trust tracking exists
- `src/asiControl/config.ts`: Centralized config constants
- CommandCenterUI exists with basic click-to-guide

## Prototype Slice

- **P1**: Click location → waypoint. Jane evaluates and moves (or doesn't).
- **P2**: Issue guidance (contextual: move/interact/attack). Trust meter visible.
- **P3**: Direct robot control (single PsiSys companion). UL symbol placement.
- **P4**: Environmental manipulation. Research queue.
- **P5**: Direct Jane override. Timeline browse.

Each phase adds input verbs as supporting systems come online.
