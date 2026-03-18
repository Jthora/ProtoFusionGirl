# Build Sequence: P1 through P5

> Phase-by-phase implementation plan. Each phase builds on the previous. Each phase has a playable deliverable.

## P0 — COMPLETE (GameScene Decomposition)

**Deliverable**: Clean architecture for development.

- [x] GameScene.ts: 1,675 → 747 lines
- [x] 4 extraction modules: SpeederController, TerrainSceneSetup, ASISceneIntegration, LeyLineSceneIntegration
- [x] F-key conflict resolution
- [x] Phantom key removal
- [x] Test baseline: 22 fail / 75 pass (stable)
- [x] Zero TypeScript errors

---

## P1 — Foundation: Jane Walks and ASI Points

**Goal**: Jane exists as an autonomous entity that responds to ASI waypoints.

### Deliverables

| Task | Detail | Depends On |
|------|--------|-----------|
| Jane AI — Idle state | Stand, face direction, play idle anim | Jane.ts scaffolding |
| Jane AI — Navigate state | Move toward waypoint using pathfinding | Idle state |
| Jane AI — Follow Guidance state | Accept ASI waypoint, evaluate, move | Navigate state |
| ASI Input — Click waypoint | Click on world → create waypoint marker | Event system |
| Jane response to waypoint | Jane sees waypoint, moves toward it, arrives | Navigate + Guidance |
| Basic HUD | Trust meter (static 50), Jane health, current state label | UIManager |

### Playable Deliverable
Open the game. Jane stands at Tho'ra Base. Click anywhere. A waypoint appears. Jane walks to it. She arrives and returns to Idle.

### Acceptance Test
- Jane moves to waypoint within 5 seconds of placement
- Jane returns to Idle on arrival
- Waypoint marker visible and clears on arrival

---

## P2 — Life: Combat, Speed, World State

**Goal**: The world has enemies, Jane fights, speed system gets throttle, ley lines have stability.

### Deliverables

| Task | Detail | Depends On |
|------|--------|-----------|
| Jane AI — Combat state | Detect enemy → face → shoot → retreat if low health | P1 behavior tree |
| Jane AI — Retreat state | Flee toward nearest safe zone when health < 25% | Combat state |
| Remnant Terminators | Patrol → detect → charge → melee. 3-hit kill. | Enemy base class |
| Nefarium Phantoms | Materialize → shadow bolt → dematerialize. 2-hit kill. | Enemy base class |
| Speed — Throttle | Hold key = accelerate within gear, release = decelerate | Existing speed system |
| Trust meter — functional | Starts at 50, adjusts +/- based on guidance outcomes | TrustManager |
| Node stability values | 3 nodes with stability (80, 60, 30). Slow decay over time. | World state |
| Surge events | At stability < 40: visual warning, shimmer effects | Stability values |
| Provision system | 3 research projects, timer-based, completion events | Event system |
| Basic emotions | Confident (default), Anxious (after damage) | PersonalitySystem |
| Death → checkpoint | Jane dies → respawn at last safe point | Health system |
| Fast travel (basic) | Map overlay with 3 nodes, click to transition | Node system |

### Playable Deliverable
Jane fights Terminators and Phantoms. Player guides her with waypoints. Trust adjusts. Speed has analog throttle. Ley lines show stability warnings. Research starts in background.

### Acceptance Test
- Jane engages Terminators when within detection range
- Jane retreats at low health
- Throttle provides smooth speed within current gear
- Stability decay visible over 2 minutes of gameplay
- Research completion notification fires after timer

---

## P3 — Soul: UL, Robots, Emergent Events

**Goal**: The core loop runs end-to-end. The 3-minute experience is playable.

### Deliverables

| Task | Detail | Depends On |
|------|--------|-----------|
| UL puzzle interface | 2-component symbol palette, deploy to target | UL engine |
| Repair puzzle | Earth + Healing = repair damaged robot at Node 2 | Puzzle interface |
| Terra (Earth Hero) | Follow, shield, respond to "defend here" command | Robot companion class |
| Robot summoning | ASI clicks to summon Terra (if befriended) | PsiNet events |
| ASI tactical guidance | "Focus target," "fall back," "defend" commands | Guidance engine |
| Rift event at Node 3 | Rift spawns at Node 3 when stability hits 10 | Instability system |
| Emergent events | 3 generators: surge, distress, rift expansion | World state + thresholds |
| Jane UL observation | Jane registers nearby UL usage, exposure counter | Learning system |
| Faction reputation | 3 factions tracked, adjusted by actions | Faction system |
| Boredom system | Jane wanders after 30-60s of no activity | Personality system |
| Speed — Boosters | Single boost button with cooldown | Throttle system |
| Jane refusal | Refuses suicidal guidance with dialogue | Trust system |

### Playable Deliverable
**The 3-minute experience** from minimum-viable-loop.md. Player guides Jane to damaged robot, uses UL to repair it, Terra joins, they fight to Node 3, seal the rift. OR: player doesn't guide, Jane goes alone, fails, world degrades.

### Acceptance Test
- UL puzzle completes successfully with correct symbol
- Terra follows and shields after repair
- Rift at Node 3 is sealable with combat + UL
- Different outcomes visible between guided and unguided play
- Jane wanders independently when ASI disengages

---

## P4 — Depth: Rewind, Astrology, Jono

**Goal**: Time mechanics, world calendar, and narrative depth.

### Deliverables

| Task | Detail | Depends On |
|------|--------|-----------|
| Death → decision-point rewind | Timeline visualization, select rewind point | Event history log |
| Astrology — 4-phase calendar | Fire/Earth/Air/Water phases affect event weights | World time system |
| Event history log | All events recorded with timestamps and outcomes | Event system |
| Jane — full emotions | 6 emotion states, astrology modifier | Personality system + calendar |
| Fast travel — animated | Path highlight, travel time, transit events | Map system |
| Network map — stability visualization | Color-coded edges, node status icons | Stability system |
| Jono hologram | Mentor dialogue at Tho'ra Base, tutorial guidance | Dialogue system |
| Environmental manipulation | ASI interacts with doors, defenses, energy at nodes | Input model |
| Instability propagation | Adjacent nodes affected by rifts | Instability system |
| Provision — resource costs | Research consumes gathered materials | Mission rewards |

### Playable Deliverable
Game has time progression. Events influenced by cosmic cycle. Death triggers rewind mechanic. Jono provides context at base. World feels alive beyond immediate vicinity.

### Acceptance Test
- Death rewind returns to a valid decision point
- Cosmic phase visibly changes event types over time
- Jono dialogue provides useful tutorial/context
- Rift at Node 3 causes stability drop at Node 2

---

## P5 — Polish: Learning, Depth, Integration

**Goal**: All systems at prototype-quality integration. The full loop runs cleanly.

### Deliverables

| Task | Detail | Depends On |
|------|--------|-----------|
| Jane UL mastery | Full learn-by-observation pipeline | Learning system |
| Jane independent UL use | Attempts known symbols autonomously | Mastery levels |
| ASI feedback on Jane | Encourage/correct Jane's UL attempts | Learning system |
| UL failure consequences | Miscommunication results in varied outcomes | Puzzle system |
| Full behavior tree | All states, all transitions, personality integrated | All Jane systems |
| Combat tactics | Cover, weapon switching, calling for help | Combat AI |
| Voluntary Timestream browse | ASI reads event history as list | History log |
| PsiNet behavior log (local) | ASI actions logged, viewable at end | Logging system |
| Second hero (Aqua) | Support/healing robot | Robot army system |
| Expanded UL puzzles | 3-component symbols, multiple contexts | UL engine |
| Timeline quality score | Final score based on world state at game "end" | All world systems |
| 12-phase astrology | Full cosmic cycle | Calendar system |

### Playable Deliverable
Complete prototype. All systems integrated. Multiple playthroughs yield measurably different outcomes. Jane learns. The world responds. The ASI's presence is felt.

### Acceptance Test
- Jane uses UL independently after sufficient observation
- Two full playthroughs (guided vs unguided) produce visibly different world states
- Timeline quality score reflects cumulative decisions
- All systems run at 60 FPS in browser
