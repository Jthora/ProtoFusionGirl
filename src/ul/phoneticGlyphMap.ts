// src/ul/phoneticGlyphMap.ts
// Auto-generated from artifacts/ul_phonetic_glyph_map.artifact
// Provides canonical phonetic (IPA) and glyph mappings for Universal Language (UL)

export interface ULPhoneticGlyph {
  ul_symbol: string;
  ipa: string;
  glyph: string;
  sound_group: string;
}

export const phoneticGlyphMappings: ULPhoneticGlyph[] = [
  { ul_symbol: 'point', ipa: 'pɔɪnt', glyph: '•', sound_group: 'plosive' },
  { ul_symbol: 'line', ipa: 'laɪn', glyph: '―', sound_group: 'liquid' },
  { ul_symbol: 'circle', ipa: 'sɜːrkəl', glyph: '○', sound_group: 'fricative' },
  { ul_symbol: 'triangle', ipa: 'traɪæŋɡəl', glyph: '△', sound_group: 'nasal' },
  { ul_symbol: 'square', ipa: 'skwɛər', glyph: '□', sound_group: 'plosive' },
  { ul_symbol: 'curve', ipa: 'kɜːrv', glyph: '〰', sound_group: 'approximant' },
  { ul_symbol: 'angle', ipa: 'æŋɡəl', glyph: '∠', sound_group: 'nasal' },
  { ul_symbol: 'wave', ipa: 'weɪv', glyph: '~', sound_group: 'fricative' },
  { ul_symbol: 'spiral', ipa: 'spaɪrəl', glyph: '🌀', sound_group: 'trill' },
  { ul_symbol: 'zigzag', ipa: 'zɪɡzæɡ', glyph: '〽', sound_group: 'affricate' },
  { ul_symbol: 'leap', ipa: 'liːp', glyph: '⤴', sound_group: 'plosive' },
];

export function getPhoneticBySymbol(symbol: string): string | undefined {
  return phoneticGlyphMappings.find(m => m.ul_symbol === symbol)?.ipa;
}

export function getGlyphBySymbol(symbol: string): string | undefined {
  return phoneticGlyphMappings.find(m => m.ul_symbol === symbol)?.glyph;
}

export function getSymbolByIPA(ipa: string): string | undefined {
  return phoneticGlyphMappings.find(m => m.ipa === ipa)?.ul_symbol;
}

export function getSymbolByGlyph(glyph: string): string | undefined {
  return phoneticGlyphMappings.find(m => m.glyph === glyph)?.ul_symbol;
}

export default {
  phoneticGlyphMappings,
  getPhoneticBySymbol,
  getGlyphBySymbol,
  getSymbolByIPA,
  getSymbolByGlyph,
};
