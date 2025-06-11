// ulCanonicalSchemas.test.ts
// Tests for canonical UL data type schemas using Zod
// Validates sample data from data/ul/*.json and artifacts/ul_test_cases_copilot.artifact

import { ULSymbolSchema, ULGrammarRuleSchema, ULExpressionSchema, ULResourceDataSchema } from './ulCanonicalSchemas';
import * as path from 'node:path';

describe('UL Canonical Schemas', () => {
  it('validates ULSymbol sample data', async () => {
    const { readFile } = await import('node:fs/promises');
    const file = path.resolve(process.cwd(), 'data/ul/ul_symbol_movement_map.json');
    let raw;
    try {
      raw = JSON.parse(await readFile(file, 'utf-8'));
    } catch (e) {
      console.error('Failed to parse ul_symbol_movement_map.json:', e);
      throw e;
    }
    for (const entry of raw.entries) {
      expect(() => ULSymbolSchema.parse({
        name: entry.ul_symbol,
        properties: entry,
        movement: entry.movement_primitive || undefined,
        animation: entry.animation_ref || undefined,
      })).not.toThrow();
    }
  });

  it('validates ULGrammarRule sample data', async () => {
    const { readFile } = await import('node:fs/promises');
    const file = path.resolve(process.cwd(), 'data/ul/ul_grammar_rules.json');
    const raw = JSON.parse(await readFile(file, 'utf-8'));
    for (const axiom of raw.axioms) {
      expect(() => ULGrammarRuleSchema.parse({ rule: axiom })).not.toThrow();
    }
  });

  it('validates ULExpression sample data', async () => {
    const { readFile } = await import('node:fs/promises');
    const file = path.resolve(process.cwd(), 'data/ul/ul_expression_examples.json');
    const raw = JSON.parse(await readFile(file, 'utf-8'));
    for (const ex of raw.examples) {
      expect(() => ULExpressionSchema.parse({
        predicates: ex.formal_parse ? ex.formal_parse.split('∧').map((s: string) => s.trim()) : [],
        valid: true,
      })).not.toThrow();
    }
  });

  it('validates ULResourceData structure', () => {
    // Minimal stub, as full resource loading is dynamic
    expect(() => ULResourceDataSchema.parse({
      symbols: [],
      animations: {},
      grammar: [],
      api: {},
      examples: [],
      puzzles: [],
    })).not.toThrow();
  });
});
