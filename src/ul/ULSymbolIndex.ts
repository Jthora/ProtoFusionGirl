// Canonical Universal Language Symbol Index
// Auto-generated from artifacts/ul_symbol_index.artifact
// Do not edit directly; update the artifact instead.

import * as fs from 'fs';
import * as path from 'path';

// Use require for js-yaml for compatibility in Jest/Node
// @ts-ignore
const yaml = require('js-yaml');

// Loads and parses the canonical symbol index from the artifact
export function loadULSymbolIndex(): ULSymbol[] {
  const artifactPath = path.resolve(__dirname, '../../artifacts/ul_symbol_index.artifact');
  const file = fs.readFileSync(artifactPath, 'utf-8');
  const yamlBlock = file.match(/```yaml([\s\S]*?)```/);
  if (!yamlBlock) throw new Error('YAML block not found in ul_symbol_index.artifact');
  // Debug: print YAML block to help diagnose indentation issues
  console.log('YAML BLOCK EXTRACTED:', yamlBlock[1]);
  const parsed = yaml.load(yamlBlock[1]);
  if (!parsed || typeof parsed !== 'object' || !('symbols' in parsed)) throw new Error('Invalid symbol index YAML');
  return (parsed as any).symbols as ULSymbol[];
}

// Singleton export for convenience
export const ULSYMBOL_INDEX: ULSymbol[] = loadULSymbolIndex();

// Lookup utilities
export function getSymbolByGlyph(glyph: string): ULSymbol | undefined {
  return ULSYMBOL_INDEX.find(s => s.glyph === glyph);
}
export function getSymbolByPhonetic(phonetic: string): ULSymbol | undefined {
  return ULSYMBOL_INDEX.find(s => s.phonetic === phonetic);
}
export function getSymbolByName(name: string): ULSymbol | undefined {
  return ULSYMBOL_INDEX.find(s => s.ul_symbol === name);
}

// ULSymbol interface definition
export interface ULSymbol {
  ul_symbol: string;
  meaning: string;
  geometric_property: string;
  formal_axiom: string;
  movement_primitive: string;
  animation_ref: string;
  example_equation: string;
  usage: string;
  modality: string;
  element: string;
  cosmic_force: string;
  phonetic: string;
  glyph: string;
}
