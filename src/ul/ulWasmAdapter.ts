// ulWasmAdapter.ts
// Adapter for the Universal Language @ul-forge/core Rust+WASM module.
//
// Mirrors all 23 functions from @ul-forge/core/wasm-bridge.ts.
// When the WASM module is not available (not yet on npm), falls back to
// deterministic stub implementations that produce structurally valid GIR
// and results — game works identically with either backend.
//
// Integration: all game systems route UL computation through this adapter.
// Reference: https://github.com/Jthora/universal_language

import type {
  Gir,
  GirNode,
  ValidationResult,
  EvaluationResult,
  ScoreResult,
  JaneResult,
  SequenceResult,
  AnimationSequence,
  PositionedGlyph,
  LoadResult,
  OperationName,
  StructureReport,
  ErlangenLevel,
  EquivalenceResult,
  Hint,
  Puzzle,
  LexiconEntry,
  GameConfig,
  NodeType,
  Sort,
} from './ulForgeTypes';

// Re-export all types so consumers can import from this file
export type {
  Gir,
  GirNode,
  ValidationResult,
  EvaluationResult,
  ScoreResult,
  JaneResult,
  SequenceResult,
  AnimationSequence,
  PositionedGlyph,
  LoadResult,
  OperationName,
  StructureReport,
  ErlangenLevel,
  EquivalenceResult,
  Hint,
  Puzzle,
  LexiconEntry,
  GameConfig,
  NodeType,
  Sort,
};

// ---------------------------------------------------------------------------
// IULEngine — full 23-function interface matching @ul-forge/core
// ---------------------------------------------------------------------------

export interface IULEngine {
  // Core Pipeline
  parse(input: string): Gir;
  validate(gir: Gir, checkGeometry?: boolean): ValidationResult;
  render(gir: Gir, width?: number, height?: number): string;
  renderPreview(gir: Gir): string;
  deparse(gir: Gir): string;
  parseAndRender(input: string, width?: number, height?: number): string;
  parseValidateRender(input: string): { gir: Gir; validation: ValidationResult; svg: string | null };

  // Game Context
  createContext(config?: GameConfig): number;
  evaluate(ctxId: number, gir: Gir): EvaluationResult;
  scoreComposition(ctxId: number, gir: Gir, targetJson: string): ScoreResult;
  evaluateJaneAttempt(ctxId: number, attempt: Gir, expected: Gir): JaneResult;
  validateSequence(ctxId: number, glyphs: Gir[]): SequenceResult;
  getAnimationSequence(gir: Gir, width: number, height: number): AnimationSequence;
  layout(gir: Gir, width: number, height: number): PositionedGlyph;
  loadCustomDefinitions(ctxId: number, rulesJson: string): LoadResult;

  // Algebraic Composer
  applyOperation(operation: OperationName, operands: Gir[]): Gir;
  composeGir(a: Gir, b: Gir, operation: OperationName): Gir;
  detectOperations(gir: Gir): string[];

  // Analysis
  analyzeStructure(gir: Gir): StructureReport;
  compareGir(a: Gir, b: Gir, level: ErlangenLevel): EquivalenceResult;

  // Teaching
  getHints(attempt: Gir, target: Gir): Hint[];
  getNextPuzzle(proficiency: Record<string, number>): Puzzle;

  // Lexicon
  queryLexicon(query: string): LexiconEntry[];
  lookupLexiconEntry(name: string): LexiconEntry | null;

  // Meta
  readonly isWasm: boolean;
  readonly version: string;
}

// ---------------------------------------------------------------------------
// Helper: build a minimal valid GIR from a node type
// ---------------------------------------------------------------------------

function makeGir(nodeType: NodeType, label: string): Gir {
  return {
    ul_gir: '1.0',
    root: 'n1',
    nodes: [{ id: 'n1', type: nodeType, sort: nodeTypeToSort(nodeType), label }],
    edges: [],
    metadata: { generated_by: 'stub' },
  };
}

function nodeTypeToSort(t: NodeType): Sort {
  switch (t) {
    case 'point': return 'entity';
    case 'line': return 'relation';
    case 'angle': return 'modifier';
    case 'curve': return 'relation';
    case 'enclosure': return 'assertion';
  }
}

const SCRIPT_TO_NODE: Record<string, NodeType> = {
  'point': 'point', '●': 'point', '•': 'point',
  'line': 'line', '─': 'line', '―': 'line',
  'angle': 'angle', '∠': 'angle',
  'curve': 'curve', '∼': 'curve', '〰': 'curve',
  'enclosure': 'enclosure', '○': 'enclosure', 'circle': 'enclosure',
  'triangle': 'enclosure', '△': 'enclosure',
  'square': 'enclosure', '□': 'enclosure',
};

const LABEL_FOR_NODE: Record<NodeType, string> = {
  point: 'existence',
  line: 'relation',
  angle: 'quality',
  curve: 'process',
  enclosure: 'concept',
};

// ---------------------------------------------------------------------------
// ULStubEngine — deterministic TypeScript stub for all 23 functions
// ---------------------------------------------------------------------------

export class ULStubEngine implements IULEngine {
  readonly isWasm = false;
  readonly version = 'stub-0.2.0';

  private nextCtx = 1;

  parse(input: string): Gir {
    const trimmed = input.toLowerCase().trim();
    // Try known primitives first
    for (const [key, nodeType] of Object.entries(SCRIPT_TO_NODE)) {
      if (trimmed === key || trimmed === `point(${key})` || trimmed.includes(key)) {
        return makeGir(nodeType, LABEL_FOR_NODE[nodeType]);
      }
    }
    // Default: point (existence is the root primitive)
    return makeGir('point', 'existence');
  }

  validate(gir: Gir, _checkGeometry = false): ValidationResult {
    const errors: string[] = [];
    if (!gir.nodes || gir.nodes.length === 0) {
      errors.push('GIR has no nodes');
    }
    if (!gir.root) {
      errors.push('GIR has no root');
    }
    return {
      valid: errors.length === 0,
      errors,
      warnings: errors.length === 0 ? ['Stub validation — install @ul-forge/core for full Σ_UL'] : [],
      layers: { schema: [], sort: [], invariant: [], geometry: [] },
    };
  }

  render(gir: Gir, width = 256, height = 256): string {
    const node = gir.nodes[0];
    const label = node?.label ?? 'unknown';
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" text-anchor="middle" dy=".3em">${label}</text></svg>`;
  }

  renderPreview(gir: Gir): string {
    return this.render(gir, 64, 64);
  }

  deparse(gir: Gir): string {
    const node = gir.nodes[0];
    return node ? `${node.type}(${node.label ?? node.type})` : '';
  }

  parseAndRender(input: string, width = 256, height = 256): string {
    return this.render(this.parse(input), width, height);
  }

  parseValidateRender(input: string): { gir: Gir; validation: ValidationResult; svg: string | null } {
    const gir = this.parse(input);
    const validation = this.validate(gir);
    const svg = validation.valid ? this.render(gir) : null;
    return { gir, validation, svg };
  }

  createContext(_config: GameConfig = {}): number {
    return this.nextCtx++;
  }

  evaluate(_ctxId: number, gir: Gir): EvaluationResult {
    const isValid = gir.nodes.length > 0;
    return {
      score: isValid ? 0.5 : 0,
      grade: isValid ? 'partial' : 'unrelated',
      matched_rules: [],
      violated_rules: isValid ? [] : ['no_nodes'],
      feedback: isValid
        ? ['Stub evaluation — WASM required for full scoring']
        : ['Invalid GIR: no nodes'],
    };
  }

  scoreComposition(_ctxId: number, gir: Gir, _targetJson: string): ScoreResult {
    return {
      score: gir.nodes.length > 0 ? 0.5 : 0,
      grade: 'partial',
      partial_credit: { structural_match: 0.5, sort_correctness: 0.5, operation_correctness: 0, sequence_order: 0.5 },
      feedback: ['Stub scoring — install @ul-forge/core for real Σ_UL grading'],
    };
  }

  evaluateJaneAttempt(_ctxId: number, _attempt: Gir, _expected: Gir): JaneResult {
    return {
      score: 0.5,
      grade: 'partial',
      improvements: ['Install @ul-forge/core for real learning feedback'],
      proficiency_delta: {},
    };
  }

  validateSequence(_ctxId: number, glyphs: Gir[]): SequenceResult {
    return {
      valid: glyphs.length > 0,
      errors: glyphs.length === 0 ? ['Empty sequence'] : [],
      pair_scores: glyphs.slice(1).map(() => 0.5),
    };
  }

  getAnimationSequence(gir: Gir, _width: number, _height: number): AnimationSequence {
    return {
      keyframes: gir.nodes.map((n, i) => ({
        node_id: n.id,
        timestamp_ms: i * 300,
        x: 128,
        y: 128,
        scale: 1,
        rotation: 0,
        opacity: 1,
        easing: 'ease_in_out' as const,
      })),
      total_duration_ms: gir.nodes.length * 300,
    };
  }

  layout(gir: Gir, width: number, height: number): PositionedGlyph {
    const cx = width / 2;
    const cy = height / 2;
    return {
      elements: gir.nodes.map((n, i) => ({
        node_id: n.id,
        x: cx + (i * 40) - ((gir.nodes.length - 1) * 20),
        y: cy,
        shape: { Point: { radius: 8 } },
      })),
      connections: gir.edges.map((e, i) => ({
        edge_id: `e${i}`,
        x1: cx,
        y1: cy,
        x2: cx + 40,
        y2: cy,
        directed: false,
        dashed: false,
      })),
      width,
      height,
    };
  }

  loadCustomDefinitions(_ctxId: number, rulesJson: string): LoadResult {
    try {
      const rules = JSON.parse(rulesJson);
      return { loaded: Array.isArray(rules) ? rules.length : 0, errors: [] };
    } catch {
      return { loaded: 0, errors: ['Stub: invalid JSON'] };
    }
  }

  applyOperation(operation: OperationName, operands: Gir[]): Gir {
    if (operands.length === 0) {
      return makeGir('point', 'empty');
    }
    const base = operands[0];
    return {
      ...base,
      metadata: { ...base.metadata, generated_by: `stub:${operation}` },
    };
  }

  composeGir(a: Gir, b: Gir, operation: OperationName): Gir {
    return {
      ul_gir: '1.0',
      root: a.root,
      nodes: [...a.nodes, ...b.nodes.map(n => ({ ...n, id: `b_${n.id}` }))],
      edges: [...a.edges, ...b.edges, { source: a.root, target: `b_${b.root}`, type: 'connects' as const }],
      metadata: { generated_by: `stub:compose:${operation}` },
    };
  }

  detectOperations(gir: Gir): string[] {
    const ops: string[] = [];
    if (gir.nodes.length > 1) ops.push('predicate');
    if (gir.edges.some(e => e.type === 'modified_by')) ops.push('modify_entity');
    if (gir.edges.some(e => e.type === 'contains')) ops.push('embed');
    return ops;
  }

  analyzeStructure(gir: Gir): StructureReport {
    const primCounts: Record<string, number> = {};
    const sortDist: Record<string, number> = {};
    for (const n of gir.nodes) {
      primCounts[n.type] = (primCounts[n.type] ?? 0) + 1;
      sortDist[n.sort] = (sortDist[n.sort] ?? 0) + 1;
    }
    return {
      node_count: gir.nodes.length,
      edge_count: gir.edges.length,
      primitive_counts: primCounts,
      sort_distribution: sortDist,
      detected_operations: this.detectOperations(gir),
      depth: 1,
      breadth: gir.nodes.length,
      complexity_score: gir.nodes.length + gir.edges.length,
      symmetry_group: 'none',
      part_of_speech: gir.nodes.length === 1 ? 'noun' : 'verb',
      node_symmetries: {},
    };
  }

  compareGir(a: Gir, b: Gir, level: ErlangenLevel): EquivalenceResult {
    const sameRoot = a.nodes[0]?.type === b.nodes[0]?.type;
    return {
      level,
      score: sameRoot ? 0.8 : 0.2,
      equivalent: sameRoot,
      dimensions: { topology: sameRoot ? 1 : 0, types: sameRoot ? 1 : 0, sorts: sameRoot ? 1 : 0, shapes: 0, metrics: 0 },
    };
  }

  getHints(attempt: Gir, target: Gir): Hint[] {
    const hints: Hint[] = [];
    if (attempt.nodes.length !== target.nodes.length) {
      hints.push({ severity: 'info', category: 'structure', message: `Expected ${target.nodes.length} node(s), got ${attempt.nodes.length}` });
    }
    if (attempt.nodes[0]?.type !== target.nodes[0]?.type) {
      hints.push({ severity: 'warning', category: 'type', message: `Root type mismatch: expected ${target.nodes[0]?.type}, got ${attempt.nodes[0]?.type}` });
    }
    if (hints.length === 0) {
      hints.push({ severity: 'info', category: 'general', message: 'Structure looks correct — WASM needed for full analysis' });
    }
    return hints;
  }

  getNextPuzzle(proficiency: Record<string, number>): Puzzle {
    const avgProf = Object.values(proficiency);
    const avg = avgProf.length > 0 ? avgProf.reduce((a, b) => a + b, 0) / avgProf.length : 0;
    const difficulty = Math.min(5, Math.floor(avg * 5) + 1);
    return {
      id: `stub-puzzle-${difficulty}`,
      difficulty,
      level: difficulty,
      required_operations: ['predicate'],
      description: `Stub puzzle (difficulty ${difficulty})`,
      target_gir_json: JSON.stringify(makeGir('point', 'existence')),
    };
  }

  queryLexicon(query: string): LexiconEntry[] {
    const entries = STUB_LEXICON.filter(e =>
      e.name.includes(query.toLowerCase()) || e.labels.some(l => l.includes(query.toLowerCase()))
    );
    return entries;
  }

  lookupLexiconEntry(name: string): LexiconEntry | null {
    return STUB_LEXICON.find(e => e.name === name.toLowerCase()) ?? null;
  }
}

// Minimal lexicon for the 5 primitives
const STUB_LEXICON: LexiconEntry[] = [
  { id: 1, level: 1, name: 'point', tier: 'forced', symbol: '●', sigma_ul: 'G1/S1', labels: ['existence', 'point'] },
  { id: 2, level: 1, name: 'line', tier: 'forced', symbol: '─', sigma_ul: 'G2/S2', labels: ['relation', 'line'] },
  { id: 3, level: 1, name: 'angle', tier: 'forced', symbol: '∠', sigma_ul: 'G3/S3', labels: ['quality', 'angle'] },
  { id: 4, level: 1, name: 'curve', tier: 'forced', symbol: '∼', sigma_ul: 'G4/S4', labels: ['process', 'curve'] },
  { id: 5, level: 1, name: 'enclosure', tier: 'forced', symbol: '○', sigma_ul: 'G5/S5', labels: ['concept', 'enclosure', 'circle'] },
];

// ---------------------------------------------------------------------------
// ULWasmEngine — wraps @ul-forge/core when available
// ---------------------------------------------------------------------------

type ULForgeCore = {
  initialize(wasmUrl?: string | URL): Promise<void>;
  parse(input: string): Gir;
  validate(gir: Gir, checkGeometry?: boolean): ValidationResult;
  render(gir: Gir, width?: number, height?: number): string;
  renderPreview(gir: Gir): string;
  deparse(gir: Gir): string;
  parseAndRender(input: string, width?: number, height?: number): string;
  parseValidateRender(input: string): { gir: Gir; validation: ValidationResult; svg: string | null };
  createContext(config?: GameConfig): number;
  evaluate(ctxId: number, gir: Gir): EvaluationResult;
  scoreComposition(ctxId: number, gir: Gir, targetJson: string): ScoreResult;
  evaluateJaneAttempt(ctxId: number, attempt: Gir, expected: Gir): JaneResult;
  validateSequence(ctxId: number, glyphs: Gir[]): SequenceResult;
  getAnimationSequence(gir: Gir, width: number, height: number): AnimationSequence;
  layout(gir: Gir, width: number, height: number): PositionedGlyph;
  loadCustomDefinitions(ctxId: number, rulesJson: string): LoadResult;
  applyOperation(operation: OperationName, operands: Gir[]): Gir;
  composeGir(a: Gir, b: Gir, operation: OperationName): Gir;
  detectOperations(gir: Gir): string[];
  analyzeStructure(gir: Gir): StructureReport;
  compareGir(a: Gir, b: Gir, level: ErlangenLevel): EquivalenceResult;
  getHints(attempt: Gir, target: Gir): Hint[];
  getNextPuzzle(proficiency: Record<string, number>): Puzzle;
  queryLexicon(query: string): LexiconEntry[];
  lookupLexiconEntry(name: string): LexiconEntry | null;
  clearCaches(): void;
  _resetForTesting(): void;
};

export class ULWasmEngine implements IULEngine {
  readonly isWasm = true;
  readonly version: string;
  private core: ULForgeCore;

  constructor(core: ULForgeCore, version = '0.1.0') {
    this.core = core;
    this.version = version;
  }

  parse(input: string): Gir { return this.core.parse(input); }
  validate(gir: Gir, checkGeometry = false): ValidationResult { return this.core.validate(gir, checkGeometry); }
  render(gir: Gir, width = 256, height = 256): string { return this.core.render(gir, width, height); }
  renderPreview(gir: Gir): string { return this.core.renderPreview(gir); }
  deparse(gir: Gir): string { return this.core.deparse(gir); }
  parseAndRender(input: string, width = 256, height = 256): string { return this.core.parseAndRender(input, width, height); }
  parseValidateRender(input: string) { return this.core.parseValidateRender(input); }
  createContext(config: GameConfig = {}): number { return this.core.createContext(config); }
  evaluate(ctxId: number, gir: Gir): EvaluationResult { return this.core.evaluate(ctxId, gir); }
  scoreComposition(ctxId: number, gir: Gir, targetJson: string): ScoreResult { return this.core.scoreComposition(ctxId, gir, targetJson); }
  evaluateJaneAttempt(ctxId: number, attempt: Gir, expected: Gir): JaneResult { return this.core.evaluateJaneAttempt(ctxId, attempt, expected); }
  validateSequence(ctxId: number, glyphs: Gir[]): SequenceResult { return this.core.validateSequence(ctxId, glyphs); }
  getAnimationSequence(gir: Gir, width: number, height: number): AnimationSequence { return this.core.getAnimationSequence(gir, width, height); }
  layout(gir: Gir, width: number, height: number): PositionedGlyph { return this.core.layout(gir, width, height); }
  loadCustomDefinitions(ctxId: number, rulesJson: string): LoadResult { return this.core.loadCustomDefinitions(ctxId, rulesJson); }
  applyOperation(operation: OperationName, operands: Gir[]): Gir { return this.core.applyOperation(operation, operands); }
  composeGir(a: Gir, b: Gir, operation: OperationName): Gir { return this.core.composeGir(a, b, operation); }
  detectOperations(gir: Gir): string[] { return this.core.detectOperations(gir); }
  analyzeStructure(gir: Gir): StructureReport { return this.core.analyzeStructure(gir); }
  compareGir(a: Gir, b: Gir, level: ErlangenLevel): EquivalenceResult { return this.core.compareGir(a, b, level); }
  getHints(attempt: Gir, target: Gir): Hint[] { return this.core.getHints(attempt, target); }
  getNextPuzzle(proficiency: Record<string, number>): Puzzle { return this.core.getNextPuzzle(proficiency); }
  queryLexicon(query: string): LexiconEntry[] { return this.core.queryLexicon(query); }
  lookupLexiconEntry(name: string): LexiconEntry | null { return this.core.lookupLexiconEntry(name); }
}

// ---------------------------------------------------------------------------
// ULEngineRegistry — singleton, manages engine lifecycle
// ---------------------------------------------------------------------------

export type ULEngineEvent = 'engine:ready' | 'engine:error' | 'engine:switched';
type EngineListener = (event: { type: ULEngineEvent; engine: IULEngine; error?: Error }) => void;

class ULEngineRegistry {
  private static instance: ULEngineRegistry;
  private engine: IULEngine = new ULStubEngine();
  private listeners: EngineListener[] = [];
  private _initError: Error | null = null;

  private constructor() {}

  static getInstance(): ULEngineRegistry {
    if (!ULEngineRegistry.instance) {
      ULEngineRegistry.instance = new ULEngineRegistry();
    }
    return ULEngineRegistry.instance;
  }

  /** For testing: reset singleton state */
  static resetForTesting(): void {
    ULEngineRegistry.instance = undefined as unknown as ULEngineRegistry;
  }

  getEngine(): IULEngine {
    return this.engine;
  }

  setEngine(engine: IULEngine): void {
    const prev = this.engine;
    this.engine = engine;
    this._initError = null;
    if (prev.isWasm !== engine.isWasm) {
      console.info(`[UL] Engine switched: ${prev.version} → ${engine.version} (WASM: ${engine.isWasm})`);
    }
    this.emit({ type: 'engine:switched', engine });
  }

  get isWasmActive(): boolean {
    return this.engine.isWasm;
  }

  get engineVersion(): string {
    return this.engine.version;
  }

  get initError(): Error | null {
    return this._initError;
  }

  /**
   * Attempt to load @ul-forge/core WASM. Falls back to stub on any failure.
   * Safe to call multiple times — no-ops if WASM already loaded.
   */
  async tryLoadWasm(wasmUrl?: string | URL): Promise<boolean> {
    if (this.engine.isWasm) return true;

    try {
      // Dynamic import — only resolves if @ul-forge/core is installed
      const core = await import('@ul-forge/core') as unknown as ULForgeCore;
      await core.initialize(wasmUrl);
      // Smoke test: parse a point to verify the module works
      const testGir = core.parse('point(existence)');
      if (!testGir || !testGir.nodes || testGir.nodes.length === 0) {
        throw new Error('WASM smoke test failed: parse returned invalid GIR');
      }
      this.setEngine(new ULWasmEngine(core));
      this.emit({ type: 'engine:ready', engine: this.engine });
      return true;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this._initError = error;
      console.warn(`[UL] WASM not available, using stub engine: ${error.message}`);
      this.emit({ type: 'engine:error', engine: this.engine, error });
      return false;
    }
  }

  on(listener: EngineListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(event: { type: ULEngineEvent; engine: IULEngine; error?: Error }): void {
    for (const listener of this.listeners) {
      try { listener(event); } catch { /* swallow listener errors */ }
    }
  }
}

export { ULEngineRegistry };

/** Convenience accessor for the current UL engine */
export function getULEngine(): IULEngine {
  return ULEngineRegistry.getInstance().getEngine();
}

export default ULEngineRegistry;
