// src/ul/__tests__/ulPhoneticGlyphMap.test.ts
// Tests for artifact-driven phonetic and glyph mapping

import map from '../phoneticGlyphMap';

describe('UL Phonetic & Glyph Map', () => {
  it('gets IPA by symbol', () => {
    expect(map.getPhoneticBySymbol('circle')).toBe('sɜːrkəl');
    expect(map.getPhoneticBySymbol('zigzag')).toBe('zɪɡzæɡ');
  });
  it('gets glyph by symbol', () => {
    expect(map.getGlyphBySymbol('triangle')).toBe('△');
    expect(map.getGlyphBySymbol('leap')).toBe('⤴');
  });
  it('gets symbol by IPA', () => {
    expect(map.getSymbolByIPA('laɪn')).toBe('line');
    expect(map.getSymbolByIPA('spaɪrəl')).toBe('spiral');
  });
  it('gets symbol by glyph', () => {
    expect(map.getSymbolByGlyph('□')).toBe('square');
    expect(map.getSymbolByGlyph('~')).toBe('wave');
  });
});
