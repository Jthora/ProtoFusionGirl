# System: Robot Communication

> PsiSys interface, summoning, influence tiers, and the UL communication depth model.

## Full Vision

PsiSys robots are the ASI's primary agents in the physical world. Communication depth scales with Universal Language mastery.

### Summoning

- The ASI can summon PsiSys robots via PsiNet at any time
- Summon = emit `ROBOT_SUMMON` event with type and location
- Robots arrive from nearest ley line node or hidden cache (narrative justification)
- Arrival time depends on distance and current ley line stability
- Summoning is free (PsiNet access) but robots are finite in an area

### Communication Tiers

| Tier | UL Requirement | Commands Available | Robot Response Quality |
|------|---------------|-------------------|----------------------|
| **0 — Gesture** | None | "Go there," "Come here," "Attack that" | Basic compliance, slow, may misinterpret |
| **1 — Basic** | 1-2 symbols known | "Repair," "Follow," "Defend this," "Scout area" | Willing cooperation, accurate execution |
| **2 — Intermediate** | 3-5 symbols known | "Reconfigure chassis," "Stealth mode," "Share sensor data" | Eager collaboration, proactive assistance |
| **3 — Advanced** | 6+ symbols known | "Share memories," "Teach me," "Coordinate with squad" | Deep alliance, autonomous problem-solving |
| **4 — Fluent** | 10+ symbols mastered | Free communication, novel requests, philosophical exchange | Devoted loyalty, lore access, faction influence |

### Robot Personality

PsiSys robots are not interchangeable. Each robot encountered has:
- A designation (name/number)
- An elemental nature (Fire, Earth, Water, Air — affects personality and combat style)
- A current state (functional, damaged, rogue, dormant)
- A memory of previous ASI interactions
- An opinion of the ASI based on past communication quality

### Befriending

Successful UL communication builds relationships:
1. First contact: robot is wary (unknown ASI)
2. Successful communication: robot registers ASI as competent
3. Repeated positive interactions: robot becomes ally
4. Deep UL exchange: robot becomes devoted, shares lore, provides unique services

Failed communication reverses this: confusion → suspicion → hostility

### Robot Types Available

| Type | Role | UL Interaction |
|------|------|---------------|
| **Scout** | Reconnaissance, early warning | Share sensor data, report threats |
| **Repair** | Heal Jane, fix equipment, stabilize ley lines | Repair commands, component fabrication |
| **Combat** | Direct engagement, defense | Tactical coordination, weapon configs |
| **Specialist** | Unique per encounter | Context-dependent (e.g., mining, research, transport) |
| **Hero** | Leader unit with minion squad | Deep alliance, strategic coordination |

## Prototype Slice

### P1: Basic Summon
- Summon 1 robot type (Scout) to a location via click
- Robot follows Jane at Tier 0 (gesture only): "follow" and "go there"

### P3: UL Communication
- Tier 1 unlocked after first successful UL puzzle
- Scout follows, scouts ahead, reports threats
- Repair robot available at Node 2 (damaged, needs UL repair first)

### P5: Deep Communication
- Tier 2-3 interactions
- Robot personality visible
- Memory of past interactions persists
