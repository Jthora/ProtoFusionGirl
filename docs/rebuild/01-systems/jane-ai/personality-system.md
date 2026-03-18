# System: Jane Personality System

> Boredom, astrology influence, moods, and how personality shapes behavior.

## Full Vision

Jane is not a state machine. She has an emotional inner life that influences her decision-making, combat effectiveness, exploration patterns, and social interactions.

### Personality Traits (Fixed)

| Trait | Value | Effect |
|-------|-------|--------|
| **Curiosity** | High | Drawn to unexplored areas, new robots, unusual phenomena |
| **Bravery** | High | Tolerates danger longer before retreating, approaches threats |
| **Empathy** | High | Prioritizes helping damaged/distressed entities |
| **Recklessness** | Moderate | Sometimes charges into situations without full assessment |
| **Stubbornness** | Moderate | Less likely to change course once committed to an action |

These are constant. They define WHO Jane is.

### Emotional State (Dynamic)

Jane's current emotional state modifies her behavior:

| Emotion | Triggered By | Effect on Behavior |
|---------|-------------|-------------------|
| **Confident** | Recent success, high trust from ASI | More aggressive, takes risks, explores further |
| **Anxious** | Recent failure, low health, unfamiliar area | More cautious, sticks to known paths, seeks allies |
| **Bored** | Extended idle, no objectives, safe area | Wanders further, investigates random things, gets restless |
| **Angry** | Betrayal, trust violation, ally harmed | Aggressive combat, ignores non-combat guidance |
| **Grateful** | ASI saved her from danger she didn't see | Trust boost, follows guidance more readily |
| **Determined** | Mission objective is close, progress made | Focused, ignores distractions, pushes through obstacles |

### Astrology Influence

The in-game cosmic calendar affects Jane's emotional baseline:

| Cycle Phase | Duration | Emotional Tendency |
|-------------|----------|-------------------|
| Fire days | ~3 in-game days | Aggressive, proactive, impatient |
| Earth days | ~3 in-game days | Steady, cautious, focused on resources |
| Air days | ~3 in-game days | Curious, social, scattered attention |
| Water days | ~3 in-game days | Introspective, empathetic, cautious |

The astrology influence is a MODIFIER, not an override. A Fire day makes Jane *slightly* more aggressive. It doesn't override her survival instinct.

### Boredom System

When Jane has no active priorities and is in a safe area:
1. Boredom timer starts
2. After threshold (30-60 seconds of nothing): Jane enters "restless" state
3. She begins exploring on her own — moving toward nearest unexplored area or unvisited robot
4. If nothing interesting is found, she may head toward a known mission area
5. Extended boredom (2+ minutes): Jane may attempt risky exploration (approaching unstable ley line areas)

This ensures the game "plays itself" when the ASI steps away. Jane doesn't stand still. She lives.

## Prototype Slice

### P2: Basic Emotions
- 2 states: Confident (default) and Anxious (after taking damage)
- Confident = standard behavior. Anxious = slower movement, stays closer to allies.
- State transitions on events: `JANE_DAMAGED` → Anxious, `MISSION_COMPLETE` → Confident

### P3: Boredom
- Boredom timer triggers wandering behavior when no active priorities
- Jane moves toward nearest unvisited location or robot

### P4-P5: Full Personality
- All 6 emotion states
- Astrology modifier from world calendar
- Personality traits affect behavior tree thresholds
- Rich idle expressions (dialogue bubbles, animation states)
