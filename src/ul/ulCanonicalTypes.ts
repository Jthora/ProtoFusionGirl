// ulCanonicalTypes.ts
// Canonical TypeScript interfaces for Universal Language (UL) core data model
// Grounded in the real Universal Language — Σ_UL formal algebra discovered by Jordan Traña (Jono Tho'ra)
// Reference: https://github.com/Jthora/universal_language

// ---------------------------------------------------------------------------
// REAL UL FOUNDATIONS — Σ_UL Formal Algebra
// ---------------------------------------------------------------------------

/**
 * The 5 geometric primitives of Universal Language.
 * These are geometrically forced — each is the unique construction of its kind.
 * Theorem: the mapping from geometric primitive to semantic primitive is the unique
 * structure-preserving bijection (Unique Grounding Theorem, formal-foundations.md §4.5).
 *
 * Point    → Existence  (G1/S1): 0-dimensional, no internal structure, dependency rank 0
 * Line     → Relation   (G2/S2): 1D, requires 2 Points, introduces directionality
 * Angle    → Quality    (G3/S3): 2 Lines at vertex, parameterized by θ, comparative
 * Curve    → Process    (G4/S4): Line with continuously varying direction, has curvature κ
 * Enclosure→ Concept    (G5/S5): Closed boundary, partitions plane (Jordan Curve Theorem)
 */
export enum ULPrimitive {
  Point     = 'Point',      // Existence — the minimum act of meaning: "something IS"
  Line      = 'Line',       // Relation  — directed connection between two existences
  Angle     = 'Angle',      // Quality   — character of a relation, parameterized by θ
  Curve     = 'Curve',      // Process   — relation whose direction varies continuously
  Enclosure = 'Enclosure',  // Concept   — closed boundary giving concept its scope
}

/**
 * The 4 sorts of the Universal Linguistic Signature Σ_UL.
 * Sorts are the type categories — the "nouns" of the algebra's type system.
 */
export enum ULSort {
  Entity    = 'entity',     // Things that can be talked about
  Relation  = 'relation',   // Ways things relate
  Modifier  = 'modifier',   // Ways to alter entities or relations
  Assertion = 'assertion',  // Complete statements (sentences)
}

/**
 * The 11 operations of Σ_UL — the primitive combinators of Universal Language.
 * All 11 are T1 or T2 (Geometrically Forced or Structurally Distinguished).
 * Removing any one makes the system unable to express some class of relationships.
 *
 *  1. predicate      e × r × e → a   Assemble subject + relation + object into a statement
 *  2. modify_entity  m × e → e       Apply a modifier to an entity
 *  3. modify_relation m × r → r      Apply a modifier to a relation (changes its quality)
 *  4. negate         a → a           Negate an assertion (geometric: reflection)
 *  5. conjoin        a × a → a       AND — two frames that overlap
 *  6. disjoin        a × a → a       OR  — two frames that are adjacent
 *  7. embed          a → e           Nominalization — turn a statement into a thing
 *  8. abstract       e → m           Adjectivalization — extract quality from an entity
 *  9. compose        r × r → r       Chain two relations (transitivity)
 * 10. invert         r → r           Reverse a directed relation (active ↔ passive)
 * 11. quantify       m × e → a       Apply a quantifier (all/some/none) to produce an assertion
 */
export enum ULOperation {
  Predicate       = 'predicate',
  ModifyEntity    = 'modify_entity',
  ModifyRelation  = 'modify_relation',
  Negate          = 'negate',
  Conjoin         = 'conjoin',
  Disjoin         = 'disjoin',
  Embed           = 'embed',
  Abstract        = 'abstract',
  Compose         = 'compose',
  Invert          = 'invert',
  Quantify        = 'quantify',
}

/**
 * Constructive levels as defined in the UL Lexicon.
 * Level = minimum number of geometric construction steps from empty glyph space.
 * Level 0: Void (pre-constructive)
 * Level 1: Atomic Carriers (the 5 primitives)
 * Level 2: Distinguished Parameters and Single Operations
 * Level 3: Two-Primitive Combinations
 * Level 4: Multi-Primitive Compositions
 * Level 5+: Higher Compositions
 */
export enum ULConstructiveLevel {
  PreConstructive = 0,
  AtomicCarriers  = 1,
  Distinguished   = 2,
  TwoPrimitive    = 3,
  MultiPrimitive  = 4,
  Higher          = 5,
}

/**
 * Justification tiers for UL lexicon entries (from lexicon.md §0.4).
 * T1: Geometrically Forced — a theorem, not a choice
 * T2: Structurally Distinguished — motivated, canonical, but with alternatives
 * T3: Conventional — a design decision, one of multiple reasonable options
 */
export enum ULTier {
  T1_GeometricallyForced        = 'T1',
  T2_StructurallyDistinguished  = 'T2',
  T3_Conventional               = 'T3',
}

// ---------------------------------------------------------------------------
// GAME-LAYER SYMBOL SYSTEM
// (Game symbols are a conventional mapping (T3) layered over the 5 primitives)
// ---------------------------------------------------------------------------

/**
 * Canonical representation of a Universal Language symbol.
 * Each game symbol is grounded in one or more UL primitives.
 * The primitive field gives the geometric foundation per the real Σ_UL algebra.
 */
export interface ULSymbol {
  name: string;
  /** The real UL primitive(s) this game symbol is built from */
  primitive: ULPrimitive | ULPrimitive[];
  /** Constructive level of this symbol in the UL lexicon */
  constructiveLevel?: ULConstructiveLevel;
  /** Tier justification for this symbol's canonical status */
  tier?: ULTier;
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
 * Includes WASM bridge events for the incoming Rust+WASM+TypeScript module.
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
  | 'ul:animation:validated'
  // WASM bridge events — fired when the Rust+WASM module (from universal_language repo) is used
  | 'ul:wasm:loaded'
  | 'ul:wasm:evaluated'
  | 'ul:wasm:error'
  | 'ul:wasm:parse'
  | 'ul:wasm:validate';

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
