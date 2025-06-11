// src/ul/__tests__/ulSpellRecipes.test.ts
// Tests for artifact-driven spell recipe logic and phonetic/glyph mapping

import spells, { getSpellById, getSpellByName, getPhoneticsForSpell, getGlyphsForSpell } from '../spellRecipes';

describe('UL Spell Recipes', () => {
  it('retrieves a spell by ID', () => {
    const spell = getSpellById('spell_001');
    expect(spell).toBeDefined();
    expect(spell?.name).toBe('Shield of Order');
  });
  it('retrieves a spell by name', () => {
    const spell = getSpellByName('Shield of Order');
    expect(spell).toBeDefined();
    expect(spell?.id).toBe('spell_001');
  });
  it('gets phonetics for a spell', () => {
    const spell = getSpellById('spell_001');
    expect(getPhoneticsForSpell(spell!)).toEqual(['laɪn', 'skwɛər', 'sɜːrkəl']);
  });
  it('gets glyphs for a spell', () => {
    const spell = getSpellByName('Shield of Order');
    expect(getGlyphsForSpell(spell!)).toEqual(['―', '□', '○']);
  });
});
