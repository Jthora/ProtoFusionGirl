// Tests for ULSymbolIndex
// Validates that the canonical symbol index loads and supports lookups

import { ULSYMBOL_INDEX, getSymbolByGlyph, getSymbolByPhonetic, getSymbolByName } from '../ULSymbolIndex';

describe('ULSymbolIndex', () => {
  it('loads all canonical symbols', () => {
    // Should include at least the core set
    expect(ULSYMBOL_INDEX.length).toBeGreaterThanOrEqual(10);
    expect(ULSYMBOL_INDEX.some(s => s.ul_symbol === 'point')).toBe(true);
    expect(ULSYMBOL_INDEX.some(s => s.ul_symbol === 'circle')).toBe(true);
    expect(ULSYMBOL_INDEX.some(s => s.ul_symbol === 'triangle')).toBe(true);
  });

  it('supports lookup by glyph', () => {
    expect(getSymbolByGlyph('○')?.ul_symbol).toBe('circle');
    expect(getSymbolByGlyph('△')?.ul_symbol).toBe('triangle');
  });

  it('supports lookup by phonetic', () => {
    expect(getSymbolByPhonetic('pɔɪnt')?.ul_symbol).toBe('point');
    expect(getSymbolByPhonetic('laɪn')?.ul_symbol).toBe('line');
  });

  it('supports lookup by name', () => {
    expect(getSymbolByName('square')?.glyph).toBe('□');
    expect(getSymbolByName('wave')?.phonetic).toBe('weɪv');
  });
});
