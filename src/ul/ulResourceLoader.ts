// ulResourceLoader.ts
// Resource-driven loader for Universal Language (UL) runtime
// Loads and parses UL resources (not .artifact files) to auto-generate symbol maps, animation maps, grammar rules, and validation schemas.
// Resources: ul_symbol_movement_map.json, ul_animation_library.json, ul_grammar_rules.json, ul_api_contract.json, ul_expression_examples.json, ul_puzzle_templates.json

import fs from 'fs';
import path from 'path';
import { ulEventBus } from './ulEventBus';

export interface ULSymbol {
  name: string;
  properties: Record<string, any>;
  movement?: string;
  animation?: string;
}

export interface ULGrammarRule {
  rule: string;
  description?: string;
}

export interface ULResourceData {
  symbols: ULSymbol[];
  animations: Record<string, any>;
  grammar: ULGrammarRule[];
  api: Record<string, any>;
  examples: string[];
  puzzles: Record<string, any>[];
}

// Schema for UL puzzles (from ul_resource_schema_2025-06-06.artifact)
const UL_PUZZLE_SCHEMA = {
  required: ['id', 'type', 'prompt', 'solution'],
  optional: ['script', 'metadata'],
};

function validateULPuzzle(puzzle: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  for (const field of UL_PUZZLE_SCHEMA.required) {
    if (!(field in puzzle)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  if (puzzle.id && typeof puzzle.id !== 'string') errors.push('id must be a string');
  if (puzzle.type && typeof puzzle.type !== 'string') errors.push('type must be a string');
  if (puzzle.prompt && typeof puzzle.prompt !== 'string') errors.push('prompt must be a string');
  // solution can be string, array, or object
  if (
    puzzle.solution &&
    !(
      typeof puzzle.solution === 'string' ||
      Array.isArray(puzzle.solution) ||
      typeof puzzle.solution === 'object'
    )
  ) {
    errors.push('solution must be string, array, or object');
  }
  // script is optional, but if present must be string
  if (puzzle.script && typeof puzzle.script !== 'string') errors.push('script must be a string');
  // metadata is optional, but if present must be object
  if (puzzle.metadata && typeof puzzle.metadata !== 'object') errors.push('metadata must be an object');
  return { valid: errors.length === 0, errors };
};

// Cross-platform dirname for ESM, CommonJS, and Jest
function getDirname(): string {
  // CommonJS
  if (typeof __dirname !== 'undefined') return __dirname;
  // Jest or fallback
  if (typeof require !== 'undefined' && require.main && require.main.filename) {
    return path.dirname(require.main.filename);
  }
  // ESM (may not work in all test runners)
  try {
    // @ts-ignore
    return path.dirname(new URL(import.meta.url).pathname);
  } catch (e) {
    // Fallback to process.cwd()
    return process.cwd();
  }
}

const DIRNAME = getDirname();
const RESOURCES_DIR = path.resolve(DIRNAME, '../../data/ul');
const MODS_DIR = path.resolve(DIRNAME, '../mods');

const RESOURCE_FILES = {
  symbolMap: 'ul_symbol_movement_map.json',
  animationLibrary: 'ul_animation_library.json',
  grammarRules: 'ul_grammar_rules.json',
  apiContract: 'ul_api_contract.json',
  expressionExamples: 'ul_expression_examples.json',
  puzzleTemplates: 'ul_puzzle_templates.json',
};

function loadModdedPuzzles(): Record<string, any>[] {
  const puzzles: Record<string, any>[] = [];
  if (!fs.existsSync(MODS_DIR)) return puzzles;
  const files = fs.readdirSync(MODS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(MODS_DIR, file), 'utf-8'));
      if (raw.puzzles && Array.isArray(raw.puzzles)) {
        for (const puzzle of raw.puzzles) {
          // Namespace modded puzzle IDs
          if (raw.modId && puzzle.id) puzzle.id = `${raw.modId}:${puzzle.id}`;
          // Mark as modded
          if (!puzzle.metadata) puzzle.metadata = {};
          puzzle.metadata.mod = raw.modId || file.replace('.json', '');
          puzzles.push(puzzle);
        }
      }
    } catch (e) {
      console.warn(`Failed to load mod puzzle file: ${file}`, e);
    }
  }
  return puzzles;
}

function loadModdedSymbols(): ULSymbol[] {
  const symbols: ULSymbol[] = [];
  if (!fs.existsSync(MODS_DIR)) return symbols;
  const files = fs.readdirSync(MODS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(MODS_DIR, file), 'utf-8'));
      if (raw.symbols && Array.isArray(raw.symbols)) {
        for (const symbol of raw.symbols) {
          if (raw.modId && symbol.name) symbol.name = `${raw.modId}:${symbol.name}`;
          if (!symbol.properties) symbol.properties = {};
          symbol.properties.mod = raw.modId || file.replace('.json', '');
          symbols.push(symbol);
        }
      }
    } catch (e) {
      console.warn(`Failed to load mod symbol file: ${file}`, e);
    }
  }
  return symbols;
}

function loadModdedGrammar(): ULGrammarRule[] {
  const rules: ULGrammarRule[] = [];
  if (!fs.existsSync(MODS_DIR)) return rules;
  const files = fs.readdirSync(MODS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(MODS_DIR, file), 'utf-8'));
      if (raw.grammar && Array.isArray(raw.grammar)) {
        for (const rule of raw.grammar) {
          if (raw.modId && rule.rule) rule.rule = `[${raw.modId}] ${rule.rule}`;
          rules.push(rule);
        }
      }
    } catch (e) {
      console.warn(`Failed to load mod grammar file: ${file}`, e);
    }
  }
  return rules;
}

function loadModdedAnimations(): Record<string, any> {
  const animations: Record<string, any> = {};
  if (!fs.existsSync(MODS_DIR)) return animations;
  const files = fs.readdirSync(MODS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(MODS_DIR, file), 'utf-8'));
      if (raw.animations && Array.isArray(raw.animations)) {
        for (const anim of raw.animations) {
          const key = raw.modId && anim.name ? `${raw.modId}:${anim.name}` : anim.name;
          animations[key] = anim;
        }
      }
    } catch (e) {
      console.warn(`Failed to load mod animation file: ${file}`, e);
    }
  }
  return animations;
}

export class ULResourceLoader {
  static loadAll(): ULResourceData {
    // TODO: Implement robust parsing for each resource type
    // For now, stub with empty or minimal data
    return {
      symbols: ULResourceLoader.loadSymbols(),
      animations: ULResourceLoader.loadAnimations(),
      grammar: ULResourceLoader.loadGrammar(),
      api: ULResourceLoader.loadAPI(),
      examples: ULResourceLoader.loadExamples(),
      puzzles: ULResourceLoader.loadPuzzles(),
    };
  }

  static loadSymbols(): ULSymbol[] {
    const filePath = path.resolve(RESOURCES_DIR, RESOURCE_FILES.symbolMap);
    let raw: any;
    try {
      raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error('Failed to load UL symbol map:', e);
      return [];
    }
    if (!raw.entries || !Array.isArray(raw.entries)) {
      console.warn('No entries array found in ul_symbol_movement_map.json');
      return [];
    }
    const seenNames = new Set<string>();
    const symbols: ULSymbol[] = [];
    for (const entry of raw.entries) {
      if (entry.ul_symbol && !seenNames.has(entry.ul_symbol)) {
        seenNames.add(entry.ul_symbol);
        symbols.push({ name: entry.ul_symbol, properties: entry });
        ulEventBus.emit('ul:symbol:loaded', { id: entry.ul_symbol, metadata: entry });
      }
    }
    // Load modded symbols
    for (const symbol of loadModdedSymbols()) {
      if (!seenNames.has(symbol.name)) {
        seenNames.add(symbol.name);
        symbols.push(symbol);
        ulEventBus.emit('ul:symbol:loaded', { id: symbol.name, metadata: symbol.properties });
      } else {
        ulEventBus.emit('ul:symbol:validated', { id: symbol.name, result: false, errors: ['Duplicate symbol name'] });
      }
    }
    return symbols;
  }

  static loadGrammar(): ULGrammarRule[] {
    const filePath = path.resolve(RESOURCES_DIR, RESOURCE_FILES.grammarRules);
    let raw: any;
    try {
      raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error('Failed to load UL grammar rules:', e);
      return [];
    }
    if (!raw.axioms || !Array.isArray(raw.axioms)) {
      console.warn('No axioms array found in ul_grammar_rules.json');
      return [];
    }
    const rules: ULGrammarRule[] = raw.axioms.map((rule: string) => ({ rule }));
    // Load modded grammar
    for (const rule of loadModdedGrammar()) {
      rules.push(rule);
    }
    return rules;
  }

  static loadAnimations(): Record<string, any> {
    const filePath = path.resolve(RESOURCES_DIR, RESOURCE_FILES.animationLibrary);
    let raw: any;
    try {
      raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error('Failed to load UL animation library:', e);
      return {};
    }
    if (!raw.animations || !Array.isArray(raw.animations)) {
      console.warn('No animations array found in ul_animation_library.json');
      return {};
    }
    const animations: Record<string, any> = {};
    for (const anim of raw.animations) {
      animations[anim.name] = anim;
      ulEventBus.emit('ul:animation:loaded', { id: anim.name, metadata: anim });
    }
    // Load modded animations
    const modAnims = loadModdedAnimations();
    for (const key of Object.keys(modAnims)) {
      if (!animations[key]) {
        animations[key] = modAnims[key];
        ulEventBus.emit('ul:animation:loaded', { id: key, metadata: modAnims[key] });
      } else {
        ulEventBus.emit('ul:animation:validated', { id: key, result: false, errors: ['Duplicate animation name'] });
      }
    }
    return animations;
  }

  static loadAPI(): Record<string, any> {
    // TODO: Parse ul_api_contract.json
    return {};
  }

  static loadExamples(): string[] {
    // TODO: Parse ul_expression_examples.json
    return [];
  }

  static loadPuzzles(): Record<string, any>[] {
    const puzzles: Record<string, any>[] = [];
    const filePath = path.resolve(RESOURCES_DIR, RESOURCE_FILES.puzzleTemplates);
    let raw: any;
    try {
      raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error('Failed to load UL puzzle templates:', e);
      return puzzles;
    }
    if (!raw.puzzles || !Array.isArray(raw.puzzles)) {
      console.warn('No puzzles array found in ul_puzzle_templates.json');
      return puzzles;
    }
    const seenIds = new Set<string>();
    // Load core puzzles
    for (const puzzle of raw.puzzles) {
      const { valid, errors } = validateULPuzzle(puzzle);
      let idError = '';
      if (puzzle.id && seenIds.has(puzzle.id)) {
        idError = `Duplicate puzzle id: ${puzzle.id}`;
      }
      if (puzzle.id) seenIds.add(puzzle.id);
      let modError = '';
      if (puzzle.metadata && !puzzle.metadata.author && !puzzle.metadata.mod) {
        modError = 'Modded puzzle missing author or mod metadata.';
      }
      const allErrors = [...(errors || []), ...(idError ? [idError] : []), ...(modError ? [modError] : [])];
      if (valid && !idError && !modError) {
        puzzles.push(puzzle);
        ulEventBus.emit('ul:puzzle:loaded', { id: puzzle.id, metadata: puzzle.metadata });
      } else {
        console.warn(`Invalid UL puzzle (id: ${puzzle.id || 'unknown'}):`, allErrors);
        ulEventBus.emit('ul:puzzle:validated', { id: puzzle.id, result: false, errors: allErrors });
      }
    }
    // Load modded puzzles
    const modded = loadModdedPuzzles();
    for (const puzzle of modded) {
      const { valid, errors } = validateULPuzzle(puzzle);
      let idError = '';
      if (puzzle.id && seenIds.has(puzzle.id)) {
        idError = `Duplicate puzzle id: ${puzzle.id}`;
      }
      if (puzzle.id) seenIds.add(puzzle.id);
      let modError = '';
      if (!puzzle.metadata || !puzzle.metadata.mod) {
        modError = 'Modded puzzle missing mod metadata.';
      }
      const allErrors = [...(errors || []), ...(idError ? [idError] : []), ...(modError ? [modError] : [])];
      if (valid && !idError && !modError) {
        puzzles.push(puzzle);
        ulEventBus.emit('ul:puzzle:loaded', { id: puzzle.id, metadata: puzzle.metadata });
      } else {
        console.warn(`Invalid modded UL puzzle (id: ${puzzle.id || 'unknown'}):`, allErrors);
        ulEventBus.emit('ul:puzzle:validated', { id: puzzle.id, result: false, errors: allErrors });
      }
    }
    return puzzles;
  }
}

export default ULResourceLoader;
