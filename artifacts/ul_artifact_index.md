# Universal Language (UL) Artifact Index

This document summarizes all key UL artifacts, their schemas, usage, and test file locations for developers and agents.

---

## 1. ul_symbol_index.artifact.json
- **Purpose:** Master index of all UL symbols, meanings, properties, and formal definitions.
- **Fields:** ul_symbol, meaning, geometric_property, formal_axiom, movement_primitive, animation_ref, example_equation, usage, modality, element, cosmic_force, phonetic, glyph
- **Usage:** Source of truth for code, puzzles, UI, and modding.

## 2. ul_cosmic_rules.artifact.json
- **Purpose:** Encodes all cosmic force relationships, balance rules, and combinatorics for gameplay and logic.
- **Fields:** forces, relationships, modality_cycles, elemental_cycles, combinations
- **Usage:** Loadable by UL engine for validation and gameplay.

## 3. ul_grammar_rules.artifact.json
- **Purpose:** Defines valid symbol arrangements, grammar rules, and edge cases for UL expressions.
- **Fields:** rules, examples, edge_cases
- **Usage:** Used by parser/validator for syntax and logic.

## 4. ul_puzzle_templates.artifact.json
- **Purpose:** Repository of Universal Language puzzles for gameplay, testing, and modding.
- **Fields:** id, prompt, required_symbols, solution, difficulty, narrative_context
- **Usage:** Used by puzzle engine and for onboarding.

## 5. ul_spell_recipes.artifact.json
- **Purpose:** Repository of spell recipes for Universal Magic system.
- **Fields:** id, name, symbol_sequence, effect, requirements
- **Usage:** Used by UniversalMagic and UQPLParser.

## 6. ul_phonetic_glyph_map.artifact.json
- **Purpose:** Maps UL symbols to phonetic (IPA) and glyph (SVG/Unicode) representations for the Universal Writing System.
- **Fields:** ul_symbol, ipa, glyph, sound_group
- **Usage:** Used for writing system, UI, and accessibility.

## 7. ul_test_cases.artifact.json
- **Purpose:** Defines test cases for symbol encoding/decoding, grammar, cosmic rules, and puzzles. References distributed test files.
- **Fields:** test_type, input, expected_output, description, target_file
- **Usage:** Used for onboarding, validation, and future test consolidation.

---

## Test File Locations
- `src/ul/__tests__/ulEngine.test.ts`
- `src/ul/__tests__/ulResourceLoader.test.ts`
- `test/core/UniversalMagic.test.ts`
- `src/tests/`
- `src/world/tilemap/`, `src/world/timestream/`, etc. (various .test.ts files)

**Note:** Tests are currently distributed. This index and the test artifact reference all known locations and encourage future consolidation.

---

## Update Instructions
- Update this index and all artifacts after any major change to UL logic, symbol set, or rules.
- Use the onboarding flow and validation scripts to ensure all artifacts and tests are in sync.
- For more details, see ONBOARDING.md and the onboarding artifacts.
