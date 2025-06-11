// ulCanonicalSchemas.ts
// Zod schemas for canonical Universal Language (UL) data types
// Generated as part of Phase 2 of UL migration (see ul_migration_checklist.artifact)

import { z } from 'zod';

export const ULSymbolSchema = z.object({
  name: z.string(),
  properties: z.record(z.any()),
  movement: z.string().optional(),
  animation: z.string().optional(),
});

export const ULGrammarRuleSchema = z.object({
  rule: z.string(),
  description: z.string().optional(),
});

export const ULExpressionSchema = z.object({
  predicates: z.array(z.string()),
  valid: z.boolean(),
  error: z.string().optional(),
});

export const ULFeedbackSchema = z.object({
  step: z.number(),
  valid: z.boolean(),
  hint: z.string().optional(),
});

export const ULEventPayloadSchema = z.object({
  id: z.string().optional(),
  metadata: z.any().optional(),
  context: z.any().optional(),
  input: z.any().optional(),
  result: z.any().optional(),
  errors: z.array(z.string()).optional(),
  time: z.number().optional(),
  stats: z.any().optional(),
});

export const ULResourceDataSchema = z.object({
  symbols: z.array(ULSymbolSchema),
  animations: z.record(z.any()),
  grammar: z.array(ULGrammarRuleSchema),
  api: z.record(z.any()),
  examples: z.array(z.string()),
  puzzles: z.array(z.record(z.any())),
});

export const UniversalSymbolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  properties: z.record(z.any()).optional(),
});

export const SpellRecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbolSequence: z.array(z.string()),
  effectDescription: z.string(),
  requirements: z.array(z.string()).optional(),
});
