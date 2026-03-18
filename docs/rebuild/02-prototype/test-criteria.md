# Test Criteria: Acceptance Tests Per Phase

> Concrete pass/fail criteria for each phase deliverable.

## P1 Tests — Jane Walks and ASI Points

| ID | Test | Pass Criteria |
|----|------|--------------|
| P1.1 | Jane idle state | Jane stands at spawn, plays idle animation, does not move |
| P1.2 | Waypoint creation | Click on game world creates visible waypoint marker at click position |
| P1.3 | Jane navigation | Jane moves toward waypoint at walking speed, arrives within 5 seconds |
| P1.4 | Waypoint clearing | Waypoint marker disappears when Jane arrives within 20px |
| P1.5 | Return to idle | Jane enters Idle state after reaching waypoint |
| P1.6 | Multiple waypoints | Placing new waypoint while navigating redirects Jane to new target |
| P1.7 | HUD display | Trust meter, health bar, and state label visible on screen |
| P1.8 | No regression | Existing speed system still works (all 5 gears functional) |

## P2 Tests — Combat, Speed, World State

| ID | Test | Pass Criteria |
|----|------|--------------|
| P2.1 | Terminator spawn | Terminators appear at Node 3 area, patrol pattern visible |
| P2.2 | Jane combat engage | Jane detects enemy within range, enters Combat state, fires weapon |
| P2.3 | Terminator death | Terminator dies after 3 blast pistol hits |
| P2.4 | Phantom behavior | Phantom materializes, fires bolt, dematerializes, repositions |
| P2.5 | Jane retreat | Jane retreats toward safe zone when health < 25% |
| P2.6 | Throttle smooth | Holding W increases speed within current gear, release decelerates |
| P2.7 | Trust adjustment | Trust increases when good guidance is followed, decreases on bad outcome |
| P2.8 | Stability decay | Node stability values decrease over 2 minutes of game time |
| P2.9 | Surge warning | Visual shimmer + notification when stability crosses 40 threshold |
| P2.10 | Research timer | Starting research → timer counts → completion event fires → gear unlocked |
| P2.11 | Death respawn | Jane dying → respawn at Node 1 (Tho'ra Base) |
| P2.12 | Fast travel basic | Map overlay opens, shows 3 nodes, click transfers Jane |

## P3 Tests — UL, Robots, Emergent Events (3-Minute Loop)

| ID | Test | Pass Criteria |
|----|------|--------------|
| P3.1 | UL palette opens | Clicking damaged robot opens UL puzzle interface |
| P3.2 | Symbol composition | Selecting Earth + Healing creates valid repair symbol |
| P3.3 | Repair success | Deploying correct symbol repairs Terra, Terra activates |
| P3.4 | Repair failure | Wrong symbol → robot confused, try again prompt |
| P3.5 | Terra follows | After repair, Terra follows Jane, maintains formation |
| P3.6 | Terra shields | Terra auto-shields when enemy attacks nearby |
| P3.7 | ASI tactics | "Defend here" command causes Terra to hold position and shield |
| P3.8 | Rift spawns | Node 3 stability hits 10 → rift visual + enemies spawn |
| P3.9 | Rift sealable | UL symbol at rift + cleared enemies → rift seals, stability recovers |
| P3.10 | Distress signal | Robot at Node 2 emits distress event when stability drops |
| P3.11 | Jane observes UL | When ASI uses UL near Jane, exposure counter increments |
| P3.12 | Jane boredom | After 45+ seconds idle, Jane wanders toward nearest unexplored |
| P3.13 | Jane refuses | Guide Jane into rift without sealing → she refuses with dialogue |
| P3.14 | Guided vs unguided | Playing with guidance produces better outcome than without |
| P3.15 | Boost works | Boost key → speed burst → cooldown → re-available |

## P4 Tests — Rewind, Astrology, Depth

| ID | Test | Pass Criteria |
|----|------|--------------|
| P4.1 | Death rewind | Jane dies → timeline vis → select rewind point → resume at that point |
| P4.2 | Cosmic phase | Day counter advances → phase changes → event weights shift |
| P4.3 | History log | Events recorded with timestamp, type, outcome |
| P4.4 | Jono dialogue | Arriving at Tho'ra Base triggers Jono mentor dialogue |
| P4.5 | Propagation | Rift at Node 3 → Node 2 stability drops by 10-20% |
| P4.6 | Fast travel animated | Travel between nodes shows path animation, takes game-time |
| P4.7 | Emotions varied | Jane shows different emotions based on context + cosmic phase |

## P5 Tests — Full Integration

| ID | Test | Pass Criteria |
|----|------|--------------|
| P5.1 | Jane learns UL | After 3 observations, Jane attempts repair symbol independently |
| P5.2 | Jane success/fail | Jane's independent UL attempt has ~50% success rate initially |
| P5.3 | ASI encourage | Positive feedback → Jane's next attempt has higher success rate |
| P5.4 | UL consequences | Wrong symbol on hostile robot → robot becomes aggressive |
| P5.5 | Two playthroughs | Guided run produces higher timeline quality than unguided |
| P5.6 | Timeline score | End-of-game displays aggregate score based on world state |
| P5.7 | Performance | All systems running, 60 FPS maintained in Chrome |
| P5.8 | Second hero | Aqua discoverable, healable, joins squad with healing role |
| P5.9 | 3-component puzzles | Puzzles use base + modifier + harmonic for more complex UL |
| P5.10 | Full behavior tree | All Jane states functional and transitioning correctly |
