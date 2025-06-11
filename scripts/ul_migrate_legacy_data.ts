// scripts/ul_migrate_legacy_data.ts
// Migration script: Extracts and normalizes legacy data from src/data/ to canonical UL format in data/ul/
// Run with: npx ts-node scripts/ul_migrate_legacy_data.ts

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import {
  ULSymbolSchema,
  ULGrammarRuleSchema,
  ULExpressionSchema,
  ULResourceDataSchema,
  UniversalSymbolSchema,
  SpellRecipeSchema
} from '../src/ul/ulCanonicalSchemas';

// ESM-compatible __dirname
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const LEGACY_DATA_DIR = path.resolve(__dirname, '../src/data');
const CANONICAL_DATA_DIR = path.resolve(__dirname, '../data/ul');

const legacyFiles = [
  'skills.json',
  'narrative.json',
  'leyLines.json',
  'characters.json',
  'factions.json',
  'attacks.json',
  'cosmetics.json',
  'zones.json',
];

// Mapping function: skills.json → ULSymbol[]
function mapSkillsToULSymbols(raw: any[]): any[] {
  return raw.map(skill => ({
    name: skill.id || skill.name,
    properties: {
      ...skill,
      type: 'skill',
    },
    movement: undefined, // Not present in legacy
    animation: undefined // Not present in legacy
  }));
}

// Mapping function: narrative.json → ULGrammarRule[]
function mapNarrativeToULGrammarRules(raw: any[]): any[] {
  // Each narrative event becomes a rule: trigger → actions
  return raw.map(event => ({
    rule: `${event.trigger} => [${(event.actions || []).join(', ')}]`,
    description: event.id || undefined
  }));
}

// Mapping function: leyLines.json → ULSymbol[]
function mapLeyLinesToULSymbols(raw: any[]): any[] {
  return raw.map(ley => ({
    name: ley.id,
    properties: {
      ...ley,
      type: 'leyline',
    },
    movement: undefined,
    animation: undefined
  }));
}

// Mapping function: characters.json → UniversalSymbol[]
function mapCharactersToUniversalSymbols(raw: any[]): any[] {
  return raw.map(char => ({
    id: char.id,
    name: char.name,
    description: char.baseStats ? `Level ${char.baseStats.level}, HP ${char.baseStats.health}` : '',
    properties: {
      ...char.baseStats,
      factionId: char.factionId,
      cosmeticIds: char.cosmeticIds
    }
  }));
}

// Mapping function: factions.json → ULSymbol[]
function mapFactionsToULSymbols(raw: any[]): any[] {
  return raw.map(faction => ({
    name: faction.id,
    properties: {
      ...faction,
      type: 'faction',
    },
    movement: undefined,
    animation: undefined
  }));
}

// Mapping function: attacks.json → SpellRecipe[]
function mapAttacksToSpellRecipes(raw: any[]): any[] {
  return raw.map(atk => ({
    id: atk.id,
    name: atk.name,
    symbolSequence: [], // No sequence in legacy, could infer from type/effects
    effectDescription: atk.description || '',
    requirements: atk.effect ? [atk.effect] : undefined
  }));
}

// Mapping function: cosmetics.json → ULSymbol[]
function mapCosmeticsToULSymbols(raw: any[]): any[] {
  return raw.map(cos => ({
    name: cos.id,
    properties: {
      ...cos,
      type: 'cosmetic',
    },
    movement: undefined,
    animation: undefined
  }));
}

// Mapping function: zones.json → ULSymbol[]
function mapZonesToULSymbols(raw: any[]): any[] {
  return raw.map(zone => ({
    name: zone.id,
    properties: {
      ...zone,
      type: 'zone',
    },
    movement: undefined,
    animation: undefined
  }));
}

function migrateFile(filename: string, schema: z.ZodTypeAny, outName: string) {
  const srcPath = path.join(LEGACY_DATA_DIR, filename);
  const outPath = path.join(CANONICAL_DATA_DIR, outName);
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(srcPath, 'utf-8'));
  } catch (e) {
    console.error(`[ERROR] Failed to read ${filename}:`, e);
    return;
  }
  let mapped = raw;
  if (filename === 'skills.json') mapped = mapSkillsToULSymbols(raw);
  if (filename === 'narrative.json') mapped = mapNarrativeToULGrammarRules(raw);
  if (filename === 'leyLines.json') mapped = mapLeyLinesToULSymbols(raw);
  if (filename === 'characters.json') mapped = mapCharactersToUniversalSymbols(raw);
  if (filename === 'factions.json') mapped = mapFactionsToULSymbols(raw);
  if (filename === 'attacks.json') mapped = mapAttacksToSpellRecipes(raw);
  if (filename === 'cosmetics.json') mapped = mapCosmeticsToULSymbols(raw);
  if (filename === 'zones.json') mapped = mapZonesToULSymbols(raw);
  let valid = true;
  let errors: string[] = [];
  if (Array.isArray(mapped)) {
    for (const entry of mapped) {
      const result = schema.safeParse(entry);
      if (!result.success) {
        valid = false;
        errors.push(JSON.stringify(result.error.issues));
      }
    }
  } else {
    const result = schema.safeParse(mapped);
    if (!result.success) {
      valid = false;
      errors.push(JSON.stringify(result.error.issues));
    }
  }
  if (valid) {
    fs.writeFileSync(outPath, JSON.stringify(mapped, null, 2));
    console.log(`[OK] Migrated ${filename} → ${outName}`);
  } else {
    console.warn(`[WARN] Validation failed for ${filename}:`, errors);
  }
}

// Map legacy files to canonical schemas and output names
const migrationMap = [
  { file: 'skills.json', schema: ULSymbolSchema, out: 'ul_skills.json' },
  { file: 'narrative.json', schema: ULGrammarRuleSchema, out: 'ul_narrative.json' },
  { file: 'leyLines.json', schema: ULSymbolSchema, out: 'ul_leylines.json' },
  { file: 'characters.json', schema: UniversalSymbolSchema, out: 'ul_characters.json' },
  { file: 'factions.json', schema: ULSymbolSchema, out: 'ul_factions.json' },
  { file: 'attacks.json', schema: SpellRecipeSchema, out: 'ul_attacks.json' },
  { file: 'cosmetics.json', schema: ULSymbolSchema, out: 'ul_cosmetics.json' },
  { file: 'zones.json', schema: ULSymbolSchema, out: 'ul_zones.json' },
];

for (const { file, schema, out } of migrationMap) {
  migrateFile(file, schema, out);
}

console.log('UL legacy data migration complete.');
