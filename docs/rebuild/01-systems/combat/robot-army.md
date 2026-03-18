# System: Robot Army

> The 4 hero robots, their minion squads, summoning mechanics, and ASI control.

## Full Vision

The ASI commands a robot army through the PsiNet. The backbone is the 4 hero robot leaders, each with an elemental archetype, personality, combat role, and squad of minions.

### The 4 Heroes

| Hero | Element | Code Name | Personality | Combat Role |
|------|---------|-----------|-------------|-------------|
| **Terra** | Earth | The Warden | Steady, protective, stoic | Tank — terrain manipulation, shielding, fortification |
| **Ignis** | Fire | The Striker | Aggressive, bold, impatient | DPS — energy weapons, demolition, area denial |
| **Aqua** | Water | The Mender | Calm, nurturing, wise | Support — healing, defense buffs, damage mitigation |
| **Zephyr** | Air | The Phantom | Quick, playful, unpredictable | Scout — speed, recon, evasion, hit-and-run |

### Hero Relationship

Each hero must be befriended through the game:
1. **Encounter**: Meet the hero in the world (at a node, during an event)
2. **Communicate**: Use UL to establish meaningful contact
3. **Earn trust**: Complete a task that matters to the hero (e.g., repair their squad, defend their territory)
4. **Alliance**: Hero joins your summonable roster

### Minion Squads

Each hero leads a squad of 4-8 minion robots:

| Hero | Minion Type | Role |
|------|------------|------|
| Terra | Heavy drones, fortification bots | Frontline defense, terrain barriers |
| Ignis | Attack drones, flame units | Aggressive assault, area denial |
| Aqua | Repair bots, shield generators | Healing, protection, sustainability |
| Zephyr | Surveillance drones, interceptors | Scouting, flanking, target acquisition |

### Summoning

- ASI emits `ROBOT_SUMMON` with hero ID and target location
- Hero arrives with squad after travel delay (based on distance)
- Only befriended heroes can be summoned
- Multiple heroes can be active simultaneously (resource-limited: PsiNet bandwidth)

### Direct Control

The ASI can pilot individual robots:
- Click robot → enter pilot mode
- ASI directly controls movement and attacks
- Jane continues acting autonomously while ASI pilots a robot
- Useful for flanking maneuvers, operating in hazardous areas Jane shouldn't enter
- Deep UL communication enables advanced squad tactics (formation commands, coordinated strikes)

## Prototype Slice

### P3: One Hero — Terra (The Warden)

Why Terra first:
- Tank role complements Jane's combat (Jane attacks, Terra defends)
- Earth element matches Tho'ra Base (volcanic/island) thematically
- Protective personality naturally teaches player about robot-ASI coordination

Implementation:
- Terra found at Node 2 (damaged robot outpost) — needs repair via UL
- After repair: Terra follows Jane, auto-shields when enemies attack
- 2 minions (heavy drones) accompany Terra
- ASI can direct Terra: "defend here," "follow Jane," "hold position"

### P5: Second Hero
- Add one more hero (Aqua recommended — healing/support rounds out combat options)
- Squad tactics: two heroes + minions coordinating
