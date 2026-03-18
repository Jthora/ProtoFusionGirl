# Doctrine: Combat and Factions

> Non-negotiable design law. Combat is multi-modal, enemies are varied, and PsiSys robots are your army.

## The Law

**Combat in Proto FusionGirl is a three-layer system: Jane fights autonomously, the ASI directs strategy and controls robots, and Universal Language provides the most powerful interventions.** Combat is never JUST shooting — it's coordination, communication, and tactical decision-making across multiple agents.

## Jane's Combat

Jane is a trained Psi Operator with standard Tho'ra Tech field gear:

### Standard Loadout
- **Fusion Cutter Blades** — Melee psionic weapons, effective against physical enemies
- **Blast Pistols** — Ranged energy weapons, standard issue

### Advanced Gear (Provisioned by ASI)
- Comes from the background research tech tree
- ASI's lab bots develop new tech based on research priorities the player sets
- When research completes, new gear becomes available for Jane's next loadout
- Jane does NOT craft in the field — provisioning happens between missions
- Tho'ra Tech provides.

### Jane's Combat AI
- Jane fights independently based on training and personality
- She prioritizes threats she can see
- She uses cover, dodges, retreats when overwhelmed
- She's brave but not suicidal — won't charge a clearly superior force alone
- Her effectiveness improves over time through XP-based skill advancement

## ASI Combat Roles

All three control modes are available simultaneously:

| Mode | Mechanism | Best For |
|------|-----------|----------|
| **Autonomous Jane** | Jane fights on her own AI | Standard encounters, conserves ASI attention |
| **ASI Tactical Guidance** | Issue commands: "fall back," "focus target," "psionic defense" | Coordinated response, directing Jane's priorities |
| **Direct Robot Control** | Pilot PsiSys robots as remote combat units via PsiNet | Flanking, support fire, hazardous area operations |
| **Direct Jane Control** | Temporarily supercharge Jane's systems with ASI override | Nuclear option — powerful but costs trust if overused |

Direct Jane control requires her consent (high trust) and should be used sparingly.

## Robot Army

### The 4 Hero Robots

Each is an elemental archetype with personality, combat style, and minion squad:

| Hero | Element | Role | Combat Style | Minions |
|------|---------|------|-------------|---------|
| **[Earth Hero]** | Earth | Tank | Terrain manipulation, shielding, endurance | Heavy units, fortification drones |
| **[Fire Hero]** | Fire | DPS | Aggressive strikes, energy weapons, demolition | Attack drones, flame units |
| **[Water Hero]** | Water | Support | Healing, defense buffs, damage mitigation | Repair bots, shield generators |
| **[Air Hero]** | Air | Scout | Speed, reconnaissance, evasion, ranged strikes | Surveillance drones, interceptors |

- ASI can summon any befriended hero robot
- Each hero leads a squad of elemental minions
- Communication via UL deepens robot cooperation and unlocks advanced tactics
- **Prototype**: Earth Hero only (complements Jane's combat, teaches robot-ASI coordination)

### PsiSys General Units

- Always present in the world, available for summon
- Basic compliance without UL; deep cooperation with UL
- Can be repaired, upgraded, and befriended
- Befriended robots remember the ASI and respond faster in future encounters

## Enemy Factions

### Full Vision (5 factions)

| Faction | Type | Combat Style | Vulnerability |
|---------|------|-------------|--------------|
| **Remnant Terminators** | Time War survivors, mindless | Melee ground assault, relentless | UL reprogramming, psionic disruption |
| **Draken Seforthi Spawn** | Tiny demons from rifts | Swarming, psionic interference | Psionic weapons (Fusion Blades), rift sealing |
| **Nefarium Phantom Drones** | Shadow constructs (Nether) | Appear anywhere, disrupt electronics | Light-based attacks, UL banishment |
| **Cabal Death Cult Legions** | Human-adjacent, cybernetic | Organized military tactics | Can be reasoned with OR fought |
| **Hostile Reptilian Forces** | Ancient pre-Time War | Emerge from underground, powerful | Heavy weapons, environmental tactics |

### Prototype (2 factions)

- **Remnant Terminators**: Melee ground threats. Simple AI: approach + attack. Vulnerable to UL reprogramming (showcase UL combat utility).
- **Nefarium Phantom Drones**: Ranged aerial threats. Shadow constructs that appear unpredictably, disrupt speeder electronics. Require psionic weapons or UL banishment.

Two factions, two combat styles. Scale later.

## Provision System (Background Tech Tree)

- The ASI manages a research queue
- Lab bots work autonomously on research projects
- Projects are timer-based: start → wait → completion event → unlock
- Research priorities set by ASI determine what technology becomes available
- Jane receives new gear at mission loadout, not in the field

### Prototype Implementation
- Simple timer-based job queue
- Start research → timer elapses → emit completion event → unlock gear option
- No simulation of the research process itself
- Build the notification pipeline, stub the internals

## References
- [docs/game-design/combat/dynamic-threats.md](../../game-design/combat/dynamic-threats.md) — Dynamic threat design
- [docs/game-design/characters/game-robots.md](../../game-design/characters/game-robots.md) — Robot types and elements
- [docs/game-design/characters/factions/earth-alliance.md](../../game-design/characters/factions/earth-alliance.md) — Earth Alliance forces
- [docs/game-design/narrative/lore/nefarium.md](../../game-design/narrative/lore/nefarium.md) — Nefarium + Draken Seforthi
