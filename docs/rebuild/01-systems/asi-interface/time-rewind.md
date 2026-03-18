# System: Time Rewind (Timestream)

> Death → rewind mechanic and voluntary Timestream navigation.

## Full Vision

### Death Rewind (Core Mechanic)
When Jane dies:
1. Screen freezes — moment of impact
2. Timestream visualization activates: the player sees the timeline as a branching path
3. Key decision points are highlighted — moments where ASI guidance could have changed the outcome
4. ASI selects a rewind point (constrained by difficulty mode)
5. Timeline rewinds to that point — the player now has foreknowledge of what happens
6. Play continues from the rewind point with ASI awareness intact

This is **NOT save/load**. It's a narrative mechanic:
- The ASI remembers the death
- Jane does not (she's re-living the timeline)
- The player experienced watching their protégé die and must prevent it
- Emotional weight increases with each rewind — you're not retrying, you're *intervening in time*

### Difficulty Modes

| Mode | Rewind Rules |
|------|-------------|
| **Casual** | Free rewind to any prior decision point. Unlimited. |
| **Standard** | Rewind to most recent decision point only. Limited psionic energy cost. |
| **Hard** | Rewind costs significant psionic energy. Fewer viable rewind points. |
| **Hardcore** | Death is permanent for that timeline branch. ASI continues in a new branch. |

### Voluntary Timestream Browse (Mid-Game Unlock)

- Costs psionic energy
- ASI opens the Timestream panel: a visual history of all events
- Can browse past events, see cause-and-effect chains
- Cannot change past events without a rewind (which costs more)
- Useful for understanding: "why did this faction turn hostile?" → trace back through event history
- Astrology engine generates events → events form the history log → ASI navigates the log

### PsiNet Behavior Monitoring

- Every ASI action is logged
- Catastrophic negligence, malefic behavior, and Jane deaths are flagged
- This data is stored in a **central PsiNet database** (online leaderboard/reputation)
- Other players can see your ASI's record
- Not punitive — informational. The PsiNet remembers.

## Prototype Slice

- **P2**: Basic death → respawn at last safe point (standard checkpoint). No visual Timestream yet.
- **P4**: Death → decision point rewind. Simple branch visualization (linear timeline, highlighted nodes). Emotional beat: freeze frame, brief "you failed" moment, then rewind.
- **P5**: Voluntary browse (history log as simple list). PsiNet logging (local only for prototype).

Rationale: Rewind requires a functioning event history, which requires the emergent event system. Build events first (P2-P3), then time mechanics (P4-P5).
