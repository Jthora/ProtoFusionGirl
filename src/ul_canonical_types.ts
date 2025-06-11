// Canonical TypeScript interfaces for Universal Language (UL) core data types
// Generated as part of UL Code Unification Phase 3 (Canonical Data Model)
// Source: artifact audit, progress log, and artifact summaries

// UL Symbol (from ul_symbol_index_copilot.artifact)
export interface ULSymbol {
  id: string; // unique symbol identifier
  name: string;
  glyph: string; // unicode or custom glyph
  phonetic: string; // IPA or phonetic representation
  properties: Record<string, any>; // extensible symbol properties
}

// UL Grammar Rule (from ul_grammar_rules_copilot.artifact)
export interface ULGrammarRule {
  id: string;
  description: string;
  pattern: string; // e.g., regex or BNF
  appliesTo: string[]; // symbol ids or categories
  examples?: string[];
}

// UL Cosmic Rule (from ul_cosmic_rules_copilot.artifact)
export interface ULCosmicRule {
  id: string;
  description: string;
  forces: string[]; // e.g., cosmic force ids
  relationships: string[]; // e.g., cycle, opposition, combination
}

// UL Spell Recipe (from ul_spell_recipes_copilot.artifact)
export interface ULSpellRecipe {
  id: string;
  name: string;
  sequence: string[]; // ordered symbol ids
  requirements?: string[]; // e.g., cosmic forces, puzzle templates
  result: string; // effect or output
}

// UL Puzzle Template (from ul_puzzle_templates_copilot.artifact)
export interface ULPuzzleTemplate {
  id: string;
  name: string;
  description: string;
  structure: any; // flexible, e.g., grid, tree, etc.
  validationRules: string[]; // grammar or logic rule ids
}

// UL Test Case (from ul_test_cases_copilot.artifact)
export interface ULTestCase {
  id: string;
  description: string;
  input: any;
  expected: any;
  type: 'encoding' | 'grammar' | 'cosmic' | 'puzzle';
}

// UL Phonetic/Glyph Map Entry (from ul_phonetic_glyph_map_copilot.artifact)
export interface ULPhoneticGlyphMapEntry {
  symbolId: string;
  phonetic: string;
  glyph: string;
}

// Canonical UL Data Model (aggregate)
export interface ULCorpus {
  symbols: ULSymbol[];
  grammarRules: ULGrammarRule[];
  cosmicRules: ULCosmicRule[];
  spellRecipes: ULSpellRecipe[];
  puzzleTemplates: ULPuzzleTemplate[];
  testCases: ULTestCase[];
  phoneticGlyphMap: ULPhoneticGlyphMapEntry[];
}

// End of canonical UL data model interfaces
