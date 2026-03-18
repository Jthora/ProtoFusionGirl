# System: Jane Behavior Model

> How Jane makes decisions, what drives her priorities, and how autonomy works tick-by-tick.

## Full Vision

Jane runs a behavior tree on a tick-based loop. Every tick, she evaluates her situation and selects an action based on priorities, personality, and available information.

### Priority Stack (Highest to Lowest)

1. **Survival** — Flee from lethal threats, heal when critical
2. **Active Guidance** — Follow ASI guidance if trusted and not suicidal
3. **Mission Objective** — Pursue current active objective
4. **Personal Interest** — Explore, talk to robots, investigate curiosities
5. **Rest/Idle** — Return to base, recover, socialize

Higher priorities override lower ones. If in combat (survival), Jane ignores ASI waypoints to non-combat areas. If ASI guidance aligns with a mission objective, both priorities are satisfied simultaneously.

### Decision Inputs

| Input | Source | Affects |
|-------|--------|---------|
| Nearby threats | Jane's sensory range (limited) | Priority 1 triggers |
| ASI guidance queue | GuidanceEngine | Priority 2 evaluation |
| Mission objectives | MissionSystem | Priority 3 targeting |
| Known points of interest | Jane's memory of visited/seen locations | Priority 4 wandering |
| Emotional state | PersonalitySystem + AstrologyEngine | Threshold adjustments |
| Trust level | TrustManager | Willingness to follow guidance |
| Equipment state | Loadout/ammo/health | Tactical decisions |

### Behavioral States

| State | Trigger | Behavior |
|-------|---------|----------|
| **Idle** | No active priorities | Wander, socialize, explore near current location |
| **Navigating** | Waypoint or objective active | Move toward target using pathfinding |
| **Combat** | Threat detected in range | Engage with weapons, use cover, dodge |
| **Retreating** | Health critical or overwhelmed | Flee toward nearest safe zone |
| **Interacting** | NPC/robot/object in range + relevant priority | Talk, repair, investigate |
| **Following Guidance** | ASI guidance accepted | Move/act according to guidance |
| **Refusing** | ASI guidance rejected (dangerous/suicidal) | Stop, dialogue explaining refusal |
| **Observing** | ASI using UL nearby | Watch, learn, register symbols |

### Autonomous Combat

Jane in combat makes her own tactical decisions:
- Prioritizes nearest threat (unless ASI tactical guidance overrides)
- Uses cover when available
- Switches weapons based on enemy type (melee/ranged)
- Retreats when health below 25%
- Calls for help (emits distress event) when overwhelmed
- Effectiveness improves with XP-based skill advancement

## Existing Code

- `src/core/Jane.ts`: Base class, stats, progression hooks
- `src/ai/JaneAI.ts`: **5 lines — empty scaffold**
- `src/ai/CompanionAI.ts`: **5 lines — empty scaffold**
- `src/core/PlayerManager.ts`: ASI/Jane duality support

## Prototype Slice

### P1: Minimal Autonomy
- **3 states**: Idle, Navigating, Following Guidance
- Idle = stand still, face random direction, play idle animation
- Navigating = move toward active waypoint (ASI-placed or self-generated)
- Following Guidance = same as Navigating but triggered by ASI waypoint
- No combat AI, no personality, no UL observation

### P2: Basic Behavior Tree
- **Add states**: Combat (basic), Retreating, Interacting
- Combat: face enemy, fire weapon, retreat if health low
- Interacting: approach robot/object, trigger interaction event
- Simple priority stack: Survival > Guidance > Idle

### P3: Full Behavior
- **Add states**: Refusing, Observing
- Trust-based guidance evaluation
- UL observation when ASI casts nearby
- Personality influences (see personality-system.md)
- Independent objective pursuit when no guidance active

### P4-P5: Polish
- Combat tactics (cover, weapon switching, calling for help)
- XP-based skill improvement affecting combat effectiveness
- Rich idle behaviors (talking to robots, exploring, expressing personality)
