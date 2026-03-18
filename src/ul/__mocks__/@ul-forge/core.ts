// Jest manual mock for @ul-forge/core
// Provides deterministic responses for all 23 WASM functions.
// Used by tests to verify integration without the actual WASM binary.

const POINT_GIR = {
  ul_gir: '1.0',
  root: 'n1',
  nodes: [{ id: 'n1', type: 'point', sort: 'entity', label: 'existence' }],
  edges: [],
  metadata: { generated_by: 'mock' },
};

const LINE_GIR = {
  ul_gir: '1.0',
  root: 'n1',
  nodes: [{ id: 'n1', type: 'line', sort: 'relation', label: 'relation' }],
  edges: [],
  metadata: { generated_by: 'mock' },
};

let initialized = false;

export async function initialize(): Promise<void> {
  initialized = true;
}

export function _resetForTesting(): void {
  initialized = false;
}

export function clearCaches(): void {
  // no-op in mock
}

function ensureInit(): void {
  if (!initialized) throw new Error('WASM not initialized. Call initialize() first.');
}

// Core Pipeline
export function parse(input: string) {
  ensureInit();
  if (input.includes('line') || input.includes('─')) return JSON.parse(JSON.stringify(LINE_GIR));
  return JSON.parse(JSON.stringify(POINT_GIR));
}

export function validate(gir: { nodes?: unknown[] }, _checkGeometry = false) {
  ensureInit();
  const valid = gir?.nodes && Array.isArray(gir.nodes) && gir.nodes.length > 0;
  return {
    valid,
    errors: valid ? [] : ['No nodes in GIR'],
    warnings: [],
    layers: { schema: [], sort: [], invariant: [], geometry: [] },
  };
}

export function render(gir: { nodes?: Array<{ label?: string }> }, width = 256, height = 256): string {
  ensureInit();
  const label = gir?.nodes?.[0]?.label ?? 'unknown';
  return `<svg width="${width}" height="${height}"><text>${label}</text></svg>`;
}

export function renderPreview(gir: { nodes?: Array<{ label?: string }> }): string {
  return render(gir, 64, 64);
}

export function deparse(gir: { nodes?: Array<{ type?: string; label?: string }> }): string {
  ensureInit();
  const n = gir?.nodes?.[0];
  return n ? `${n.type}(${n.label ?? n.type})` : '';
}

export function parseAndRender(input: string, width = 256, height = 256): string {
  return render(parse(input), width, height);
}

export function parseValidateRender(input: string) {
  const gir = parse(input);
  const validation = validate(gir);
  return { gir, validation, svg: validation.valid ? render(gir) : null };
}

// Game Context
let nextCtx = 1;

export function createContext(_config = {}): number {
  ensureInit();
  return nextCtx++;
}

export function evaluate(_ctxId: number, gir: { nodes?: unknown[] }) {
  ensureInit();
  return {
    score: gir?.nodes?.length ? 0.85 : 0,
    grade: gir?.nodes?.length ? 'close' : 'unrelated',
    matched_rules: ['mock_rule'],
    violated_rules: [],
    feedback: ['Mock evaluation'],
  };
}

export function scoreComposition(_ctxId: number, _gir: unknown, _targetJson: string) {
  ensureInit();
  return {
    score: 0.75,
    grade: 'close',
    partial_credit: { structural_match: 0.8, sort_correctness: 0.9, operation_correctness: 0.5, sequence_order: 0.8 },
    feedback: ['Mock scoring'],
  };
}

export function evaluateJaneAttempt(_ctxId: number, _attempt: unknown, _expected: unknown) {
  ensureInit();
  return {
    score: 0.8,
    grade: 'close',
    improvements: ['Try adding an enclosure'],
    proficiency_delta: { point: 0.1 },
  };
}

export function validateSequence(_ctxId: number, glyphs: unknown[]) {
  ensureInit();
  return {
    valid: glyphs.length > 0,
    errors: glyphs.length === 0 ? ['Empty sequence'] : [],
    pair_scores: glyphs.slice(1).map(() => 0.9),
  };
}

export function getAnimationSequence(gir: { nodes?: Array<{ id: string }> }, _width: number, _height: number) {
  ensureInit();
  return {
    keyframes: (gir?.nodes ?? []).map((n, i) => ({
      node_id: n.id,
      timestamp_ms: i * 200,
      x: 100,
      y: 100,
      scale: 1,
      rotation: 0,
      opacity: 1,
      easing: 'linear',
    })),
    total_duration_ms: (gir?.nodes?.length ?? 0) * 200,
  };
}

export function layout(gir: { nodes?: Array<{ id: string }>; edges?: unknown[] }, width: number, height: number) {
  ensureInit();
  return {
    elements: (gir?.nodes ?? []).map((n, i) => ({
      node_id: n.id,
      x: width / 2 + i * 30,
      y: height / 2,
      shape: { Point: { radius: 8 } },
    })),
    connections: [],
    width,
    height,
  };
}

export function loadCustomDefinitions(_ctxId: number, rulesJson: string) {
  ensureInit();
  try {
    const rules = JSON.parse(rulesJson);
    return { loaded: Array.isArray(rules) ? rules.length : 1, errors: [] };
  } catch {
    return { loaded: 0, errors: ['Invalid JSON'] };
  }
}

// Algebraic Composer
export function applyOperation(operation: string, operands: unknown[]) {
  ensureInit();
  return {
    ...POINT_GIR,
    metadata: { generated_by: `mock:${operation}` },
  };
}

export function composeGir(a: { root: string; nodes: unknown[]; edges: unknown[] }, b: { root: string; nodes: unknown[]; edges: unknown[] }, operation: string) {
  ensureInit();
  return {
    ul_gir: '1.0',
    root: a.root,
    nodes: [...a.nodes, ...b.nodes],
    edges: [...a.edges, ...b.edges],
    metadata: { generated_by: `mock:compose:${operation}` },
  };
}

export function detectOperations(_gir: unknown): string[] {
  ensureInit();
  return ['predicate'];
}

// Analysis
export function analyzeStructure(gir: { nodes?: unknown[]; edges?: unknown[] }) {
  ensureInit();
  return {
    node_count: gir?.nodes?.length ?? 0,
    edge_count: gir?.edges?.length ?? 0,
    primitive_counts: { point: gir?.nodes?.length ?? 0 },
    sort_distribution: { entity: gir?.nodes?.length ?? 0 },
    detected_operations: [],
    depth: 1,
    breadth: gir?.nodes?.length ?? 0,
    complexity_score: (gir?.nodes?.length ?? 0) + (gir?.edges?.length ?? 0),
    symmetry_group: 'none',
    part_of_speech: 'noun',
    node_symmetries: {},
  };
}

export function compareGir(_a: unknown, _b: unknown, level: string) {
  ensureInit();
  return {
    level,
    score: 0.9,
    equivalent: true,
    dimensions: { topology: 1, types: 1, sorts: 1, shapes: 0, metrics: 0 },
  };
}

// Teaching
export function getHints(_attempt: unknown, _target: unknown) {
  ensureInit();
  return [{ severity: 'info', category: 'mock', message: 'Mock hint: looks good!' }];
}

export function getNextPuzzle(_proficiency: Record<string, number>) {
  ensureInit();
  return {
    id: 'mock-puzzle-1',
    difficulty: 1,
    level: 1,
    required_operations: ['predicate'],
    description: 'Mock puzzle: construct a point',
    target_gir_json: JSON.stringify(POINT_GIR),
  };
}

// Lexicon
export function queryLexicon(query: string) {
  ensureInit();
  const entries = [
    { id: 1, level: 1, name: 'point', tier: 'forced', symbol: '●', sigma_ul: 'G1/S1', labels: ['existence'] },
    { id: 2, level: 1, name: 'line', tier: 'forced', symbol: '─', sigma_ul: 'G2/S2', labels: ['relation'] },
    { id: 3, level: 1, name: 'angle', tier: 'forced', symbol: '∠', sigma_ul: 'G3/S3', labels: ['quality'] },
    { id: 4, level: 1, name: 'curve', tier: 'forced', symbol: '∼', sigma_ul: 'G4/S4', labels: ['process'] },
    { id: 5, level: 1, name: 'enclosure', tier: 'forced', symbol: '○', sigma_ul: 'G5/S5', labels: ['concept'] },
  ];
  return entries.filter(e => e.name.includes(query.toLowerCase()) || e.labels.some(l => l.includes(query.toLowerCase())));
}

export function lookupLexiconEntry(name: string) {
  ensureInit();
  const results = queryLexicon(name);
  return results.find(e => e.name === name.toLowerCase()) ?? null;
}
