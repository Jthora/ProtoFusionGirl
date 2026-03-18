# Universal Language — Technical Implementation

Source: `src/ul/` (1,580 lines total)

## Component Map

| File | Lines | Role | Status |
|------|-------|------|--------|
| `ulEngine.ts` | 223 | Encoding/decoding, sequence validation, puzzle processing | Working |
| `ulResourceLoader.ts` | 355 | Modding-aware loader with Zod validation, IPFS hooks | Working |
| `ulCanonicalTypes.ts` | 103 | Full type definitions (symbols, elements, modalities, forces) | Complete |
| `ulCanonicalSchemas.ts` | 64 | Zod runtime validation schemas | Complete |
| `cosmicRules.ts` | 86 | Element interactions, modality cycles, cosmic forces | Complete |
| `grammarRules.ts` | 75 | Symbol sequence syntax rules | Complete |
| `puzzleTemplates.ts` | 78 | Puzzle instance templates | Complete |
| `spellRecipes.ts` | 55 | Symbol → effect composition rules | Complete |
| `ULSymbolIndex.ts` | 54 | 11 canonical symbols with elements, modalities, descriptions | Complete |
| `phoneticGlyphMap.ts` | 48 | Phonetic ↔ glyph translation | Complete |
| `ulEventBus.ts` | 48 | UL-specific event bus (puzzle:completed, puzzle:validated) | Complete |

## Critical Gap

**No in-game UI.** The engine can validate puzzles and process attempts, but nothing calls it during gameplay. No puzzle panel exists. This is Priority 3 in the refactoring plan.

## Test Status

All 4 UL test suites are currently **FAILING**: ulEngine.test, ULSymbolIndex.test, ulPuzzle.test, ulResourceLoader.test. Likely cause: schema/type changes not propagated to tests.

## Design Documents

See [../../game-design/universal-language/](../../game-design/universal-language/) for puzzles, cosmic cypher, base-12 harmonics, and the 3-part whitepaper.
