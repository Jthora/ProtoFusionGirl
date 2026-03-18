# System: Guidance Engine

> The suggestion system through which the ASI communicates intent to Jane and robots.

## Full Vision

The Guidance Engine is the central pipeline between ASI intent and world action. The ASI never directly controls Jane (except via high-trust override) — instead, it places guidance that Jane and robots *evaluate* before acting.

### How Guidance Works

1. **ASI issues guidance** (click, command, symbol)
2. **Guidance enters queue** with context (target, type, urgency)
3. **Recipient evaluates** guidance based on:
   - Trust level with ASI
   - Current situation (in combat? safe? confused?)
   - Personal assessment (is this dangerous? helpful? confusing?)
4. **Recipient responds**: follow, delay, modify, or refuse
5. **Outcome recorded**: trust adjusts based on whether guidance helped

### Guidance Types

| Type | Trigger | Recipient Response |
|------|---------|-------------------|
| **Waypoint** | Click location | Jane/robot moves toward point |
| **Tactical** | "Focus target," "fall back," "defend" | Jane adjusts combat behavior |
| **Interaction** | "Repair this robot," "investigate" | Jane approaches and interacts |
| **Alert** | Threat detected Jane can't see | Jane becomes more cautious in area |
| **UL Communication** | Place symbol near robot | Robot processes symbol, responds |

### Jane's Evaluation

Jane doesn't blindly follow guidance. Her response depends on:

| Factor | Low Trust | Medium Trust | High Trust |
|--------|-----------|-------------|------------|
| Safe guidance | Hesitant, follows slowly | Follows | Follows eagerly |
| Risky guidance | Refuses, questions ASI | Follows with caution | Follows, trusts ASI sees more |
| Suicidal guidance | Refuses, yells at ASI | Refuses, warns ASI | Still refuses (never suicidal) |
| Conflicting info | Ignores ASI, trusts own senses | Weighs both | Trusts ASI over own senses |

### Trust Feedback Loop

```
ASI guides → Jane/robot acts → Outcome occurs → Trust updates → Future responsiveness changes
```

Good outcomes from following guidance = trust rises = more responsive to future guidance

Bad outcomes from following guidance = trust falls = more resistant to future guidance

Jane ignoring guidance that would have helped = no trust change (but narrative moment)

### Visual Feedback

- **Waypoint marker**: Visible to player, subtle glow at target location
- **Guidance accepted**: Brief green flash, Jane adjusts heading
- **Guidance delayed**: Yellow indicator, Jane finishes current action first
- **Guidance refused**: Red X, Jane's dialogue bubble explains refusal
- **Guidance impossible**: Gray out, system explains why (e.g., "too far," "no path")

## Existing Code

- `GuidanceEngine.ts`: Context analysis, suggestion generation (partial)
- `TrustManager.ts`: Trust tracking, thresholds
- `ThreatDetector.ts`: Threat detection feeding guidance context
- `CommandCenterUI.ts`: Click-to-guide, threat indicators
- `src/asiControl/config.ts`: Arrival epsilon, guidance timeout, trust threshold

## Prototype Slice

- **P1**: Waypoint-only guidance. Jane moves toward waypoints. No trust system yet.
- **P2**: Add trust meter. Jane follows guidance with variable responsiveness. Refusal on dangerous waypoints near known threats.
- **P3**: Tactical guidance in combat. Robot guidance for companion. Trust adjustments on outcome.
- **P4-P5**: Full evaluation matrix. Jane dialogue on refusal. Guidance history log.
