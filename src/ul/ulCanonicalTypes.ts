// ulCanonicalTypes.ts
// Canonical TypeScript interfaces for Universal Language (UL) core data model
// Generated as part of Phase 2 of UL migration (see ul_migration_checklist.artifact)

/**
 * Canonical representation of a Universal Language symbol.
 */
export interface ULSymbol {
  name: string;
  properties: Record<string, any>;
  movement?: string;
  animation?: string;
}

/**
 * Canonical representation of a UL grammar rule.
 */
export interface ULGrammarRule {
  rule: string;
  description?: string;
}

/**
 * Canonical representation of a parsed/validated UL expression.
 */
export interface ULExpression {
  predicates: string[];
  valid: boolean;
  error?: string;
}

/**
 * Canonical feedback for UL expression processing.
 */
export interface ULFeedback {
  step: number;
  valid: boolean;
  hint?: string;
}

/**
 * Canonical event types for the UL event bus.
 */
export type ULEventType =
  | 'ul:puzzle:loaded'
  | 'ul:puzzle:started'
  | 'ul:puzzle:attempted'
  | 'ul:puzzle:validated'
  | 'ul:puzzle:completed'
  | 'ul:context:sync'
  | 'ul:symbol:loaded'
  | 'ul:symbol:validated'
  | 'ul:animation:loaded'
  | 'ul:animation:validated';

/**
 * Canonical event payload for UL event bus events.
 */
export interface ULEventPayload {
  id?: string;
  metadata?: any;
  context?: any;
  input?: any;
  result?: any;
  errors?: string[];
  time?: number;
  stats?: any;
}

/**
 * Canonical resource bundle for all UL resources.
 */
export interface ULResourceData {
  symbols: ULSymbol[];
  animations: Record<string, any>;
  grammar: ULGrammarRule[];
  api: Record<string, any>;
  examples: string[];
  puzzles: Record<string, any>[];
}

/**
 * Canonical representation of a Universal Magic symbol (for spell system).
 */
export interface UniversalSymbol {
  id: string;
  name: string;
  description: string;
  properties?: Record<string, any>;
}

/**
 * Canonical representation of a spell recipe (for Universal Magic system).
 */
export interface SpellRecipe {
  id: string;
  name: string;
  symbolSequence: string[];
  effectDescription: string;
  requirements?: string[];
}

// Add additional canonical types as needed for puzzles, items, ley lines, etc.
