# System: UL Puzzle Design

> In-game presentation and mechanics of Universal Language puzzles.

## Full Vision

UL puzzles are language composition challenges. The player constructs meaningful symbols from atomic components to achieve specific effects. These are NOT reflex puzzles — they reward understanding, not speed.

### Puzzle Interface

1. **Symbol Palette** opens (modal overlay or side panel)
2. Player sees available components organized by category:
   - **Elemental Bases**: Fire 🔥, Earth 🌍, Water 💧, Air 💨
   - **Modal Modifiers**: Cardinal (initiate), Fixed (sustain), Mutable (transform)
   - **Cosmic Harmonics**: Void, Core, Chaos, Order, Ebb, Flow
3. Player drags/clicks components to compose a symbol
4. Preview shows the composed meaning (tooltip)
5. Player deploys the symbol to target (robot, environment, rift)
6. Result plays out based on accuracy

### Puzzle Context

Puzzles appear in context, not as isolated minigames:

| Context | Goal | Components Available |
|---------|------|---------------------|
| Damaged robot | Communicate "repair" | Earth + Fixed + Core (= "stabilize structure") |
| Hostile robot | Communicate "peace" | Water + Cardinal + Order (= "initiate calm") |
| Rift fragment | Seal instability | Fire + Fixed + Void (= "contain energy") |
| Exploration | Ask for information | Air + Mutable + Flow (= "share knowledge") |

### Scoring

| Accuracy | Result |
|----------|--------|
| Exact match | Perfect outcome — full effect, bonus resources, Jane observes |
| Close match (correct element, wrong modifier) | Partial outcome — reduced effect, no penalty |
| Wrong element | Miscommunication — unexpected result (minor to moderate consequence) |
| Opposite meaning | Severe miscommunication — hostile response or catastrophic effect |

### Difficulty Progression

- Early game: 2-component symbols (base + modifier)
- Mid game: 3-component symbols (base + modifier + harmonic)
- Late game: Multi-symbol sequences (sentences in UL)
- Endgame: Free composition — player creates novel symbol combinations

### No Time Pressure (Usually)

- Standard UL puzzles have no timer — think as long as you need
- Combat UL (mid-fight robot reprogramming, emergency rift seal) has soft timer: Jane is at risk while you compose
- The tension comes from consequences, not speed

## Existing Code

- `src/ul/ulEngine.ts` (250+ lines): Encoding, decoding, validation
- `src/ul/cosmicRules.ts`: Cosmic correspondence rules
- `src/ul/grammarRules.ts`: UL grammar validation
- `src/ul/ulTypes.ts`: Type definitions for symbols

## Prototype Slice

### P3: First Puzzle
- **1 puzzle type**: 2-component symbol matching
- **3 components available**: Fire base, Earth base, Healing modifier (Fixed)
- **1 context**: Repair damaged robot at Node 2
- **Interface**: Simple selection grid (click base → click modifier → deploy)
- **2 outcomes**: Correct (robot healed, joins squad) or wrong (robot confused, tries again)
- No time pressure. Jane observes.

### P5: Expanded Puzzles
- 3-component symbols
- Multiple contexts (repair, peace, seal, query)
- Consequence spectrum (partial success, miscommunication, hostile response)
- Jane attempts observed symbols independently
