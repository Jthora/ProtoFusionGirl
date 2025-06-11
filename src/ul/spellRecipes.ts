// src/ul/spellRecipes.ts
// Auto-generated from artifacts/ul_spell_recipes.artifact
// Provides canonical spell recipes and links to phonetic/glyph mapping for Universal Language (UL)

import phoneticGlyphMap from './phoneticGlyphMap';

export interface ULSpellRecipe {
  id: string;
  name: string;
  symbol_sequence: string[];
  effect: string;
  requirements: string[];
  related_symbols: string[];
  related_phonetics: string[];
  glyphs: string[];
}

// Canonical spell list (inlined from artifact for now)
export const spellRecipes: ULSpellRecipe[] = [
  {
    id: 'spell_001',
    name: 'Shield of Order',
    symbol_sequence: ['line', 'square', 'circle'],
    effect: 'Creates a protective barrier.',
    requirements: ['Order', 'Fixed'],
    related_symbols: ['line', 'square', 'circle'],
    related_phonetics: ['laɪn', 'skwɛər', 'sɜːrkəl'],
    glyphs: ['―', '□', '○'],
  },
  // ...add more spells as needed from artifact...
];

export function getSpellById(id: string): ULSpellRecipe | undefined {
  return spellRecipes.find(s => s.id === id);
}

export function getSpellByName(name: string): ULSpellRecipe | undefined {
  return spellRecipes.find(s => s.name === name);
}

export function getPhoneticsForSpell(spell: ULSpellRecipe): string[] {
  return spell.symbol_sequence.map(sym => phoneticGlyphMap.getPhoneticBySymbol(sym) || '');
}

export function getGlyphsForSpell(spell: ULSpellRecipe): string[] {
  return spell.symbol_sequence.map(sym => phoneticGlyphMap.getGlyphBySymbol(sym) || '');
}

export default {
  spellRecipes,
  getSpellById,
  getSpellByName,
  getPhoneticsForSpell,
  getGlyphsForSpell,
};
