# ASI Control — Technical Implementation

Source: `src/asiControl/` (3,500 lines total)

## Component Map

| File | Lines | Role | Status |
|------|-------|------|--------|
| `systems/TrustManager.ts` | 328 | Dynamic trust scoring (0-100), decay, modifier system | Complete |
| `systems/ThreatDetector.ts` | 472 | Radius-based threat scanning, priority scoring | Complete |
| `systems/GuidanceEngine.ts` | 612 | Context-aware suggestion generation, trust-adaptive | Complete |
| `ui/components/CommandCenterUI.ts` | 787 | Phaser-based command center panel | Complete |
| `types/index.ts` | 374 | Comprehensive type definitions | Complete |
| `ASIControlIntegrationTest.ts` | 475 | Integration tests (currently failing) | Needs fix |
| `MVP.test.ts` | 381 | MVP tests (currently failing) | Needs fix |

## Architecture

```
GuidanceEngine ←── TrustManager (trust level affects suggestion style)
     ↑                    ↑
     |                    |
ThreatDetector ───→ Trust modifiers (+3 threat response, -10 intrusion)
     |
     ↓
CommandCenterUI (visualizes threats, trust meter, guidance suggestions)
```

## Integration with GameScene

- `ASI_GUIDANCE_GIVEN` event → GameScene moves Jane toward target
- `THREAT_DETECTED` event → GameScene activates shield window (0.2x timescale)
- `JANE_RESPONSE` event → Trust feedback (+2 followed, -1 ignored)

## Design Documents

See [../../game-design/asi-control/](../../game-design/asi-control/) for the 8 interface paradigm designs and MVP plan.
