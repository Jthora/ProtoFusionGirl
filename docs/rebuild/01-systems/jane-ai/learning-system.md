# System: Jane Learning System

> How Jane acquires Universal Language knowledge by observing the ASI.

## Full Vision

Jane starts knowing zero Universal Language. She cannot communicate with PsiSys beyond basic gestures. All UL capability begins with the ASI. Jane learns by watching.

### Learning Pipeline

```
ASI uses UL symbol → Jane is nearby → Jane observes → Symbol registered in Jane's memory
→ Exposure count increases → Threshold reached → Jane attempts symbol independently
→ Success/failure recorded → Accuracy improves with repetition
```

### Observation Requirements

- Jane must be within a defined proximity radius of the UL usage
- Jane must not be in Combat or Retreating state (can't learn while fighting)
- The observation is automatic — no player action required
- Visual feedback: Jane looks toward the UL effect, brief "!" indicator

### Knowledge Model

Each UL symbol Jane can learn has:
```
{
  symbolId: string,
  exposureCount: number,      // How many times Jane has observed this symbol
  attemptCount: number,       // How many times Jane has tried it
  successCount: number,       // How many times Jane succeeded
  masteryLevel: 0-3,          // 0=unknown, 1=attempting, 2=competent, 3=mastered
  lastObserved: timestamp,
  lastAttempted: timestamp
}
```

### Mastery Progression

| Level | Exposure Needed | Attempt Success Rate | Jane's Behavior |
|-------|----------------|---------------------|-----------------|
| 0 — Unknown | 0 | N/A | Cannot attempt symbol |
| 1 — Attempting | 2-3 observations | ~30% | Tries occasionally, often fails |
| 2 — Competent | 5-7 observations + 3 successes | ~70% | Uses when appropriate, occasional errors |
| 3 — Mastered | 10+ observations + 7 successes | ~95% | Reliable independent use |

### ASI Feedback

- When Jane attempts a symbol, ASI can:
  - **Encourage** (positive feedback event) → boosts next attempt success rate
  - **Correct** (correction event) → resets attempt toward correct usage
  - **Ignore** (no action) → neutral, Jane learns at base rate

### Independent UL Use

Once Jane reaches mastery level 2+ on a symbol:
- She may use it independently when appropriate context appears
- Example: sees a damaged robot, attempts "repair" symbol without prompting
- ASI sees Jane doing this — a milestone moment showing growth
- Late-game: Jane handles basic robot communication, freeing ASI for advanced tasks

## Prototype Slice

### P3: Basic Observation
- Jane registers when ASI uses UL within proximity
- Exposure counter increments
- After 3 exposures to "repair" symbol, Jane attempts it on next damaged robot
- Single success/failure outcome (50/50 for prototype)
- Visual: Jane looks at UL effect, "?" then "!" indicators

### P5: Learning Feedback
- ASI encourage/correct actions
- Mastery level progression
- Jane independently attempts known symbols
- Multiple symbol types



## Technical Notes

- Learning data stored per-save as part of Jane's state
- Events: `UL_OBSERVED`, `UL_ATTEMPTED`, `UL_SUCCEEDED`, `UL_FAILED`, `UL_MASTERY_UP`
- UI: Optional panel showing Jane's known symbols and mastery levels
