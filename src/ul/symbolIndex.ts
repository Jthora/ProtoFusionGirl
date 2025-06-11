// src/ul/symbolIndex.ts
// Auto-generated from artifacts/ul_symbol_index.artifact
// Provides canonical symbol index and lookup utilities for Universal Language (UL)

export interface ULSymbolIndexEntry {
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

export const symbolIndex: ULSymbolIndexEntry[] = [
  { ul_symbol: 'point', meaning: 'core, instance, origin', geometric_property: 'zero-dimensional, P ∈ ℝⁿ, μ(P)=0', formal_axiom: 'point(x) ↔ x ∈ ℝⁿ ∧ μ(x)=0', movement_primitive: 'tap', animation_ref: 'point_tap', example_equation: 'P = (x, y)', usage: 'focus, start, anchor', modality: 'Core', element: 'N/A', cosmic_force: 'Core', phonetic: 'pɔɪnt', glyph: '•' },
  { ul_symbol: 'line', meaning: 'link, order, stability', geometric_property: 'one-dimensional, connects two points, direction vector d = P₂ - P₁', formal_axiom: 'line(x) ↔ ∃P₁,P₂ ∈ ℝⁿ, x = { (1-t)P₁ + tP₂ | t ∈ (0,1) }', movement_primitive: 'step_line', animation_ref: 'line_walk', example_equation: 'L = { (1-t)P₁ + tP₂ | t ∈ (0,1) }', usage: 'progression, connection', modality: 'Fixed', element: 'Air', cosmic_force: 'Order', phonetic: 'laɪn', glyph: '―' },
  { ul_symbol: 'circle', meaning: 'unity, closure, grouping', geometric_property: 'set of points equidistant from center (h,k), (x-h)²+(y-k)²=r²', formal_axiom: 'circle(x) ↔ ∃h,k,r, x = { (x,y) | (x-h)²+(y-k)²=r², r>0 }', movement_primitive: 'spin', animation_ref: 'spin_360', example_equation: '(x-h)²+(y-k)²=r²', usage: 'enclosure, ritual, closure', modality: 'Mutable', element: 'Water', cosmic_force: 'Void', phonetic: 'sɜːrkəl', glyph: '○' },
  { ul_symbol: 'triangle', meaning: 'change, transformation, stability', geometric_property: 'polygon with 3 vertices, 3 edges, sum of angles = 180°', formal_axiom: 'triangle(x) ↔ x is a set of 3 points in ℝ², forming a closed path', movement_primitive: 'step_sequence_triangle', animation_ref: 'triangle_footwork', example_equation: 'ΔABC: A,B,C ∈ ℝ²', usage: 'hierarchy, transformation', modality: 'Cardinal', element: 'Fire', cosmic_force: 'Alpha', phonetic: 'traɪæŋɡəl', glyph: '△' },
  { ul_symbol: 'square', meaning: 'stability, order, protection', geometric_property: 'polygon with 4 equal sides, 4 right angles', formal_axiom: 'square(x) ↔ x is a set of 4 points in ℝ², equal sides, right angles', movement_primitive: 'box_step', animation_ref: 'box_step_anim', example_equation: 'ABCD: |AB|=|BC|=|CD|=|DA|, ∠=90°', usage: 'defense, structure', modality: 'Fixed', element: 'Earth', cosmic_force: 'Order', phonetic: 'skwɛər', glyph: '□' },
  { ul_symbol: 'curve', meaning: 'flow, adaptation, change', geometric_property: 'one-dimensional, non-linear, parametric: C(t) = (x(t), y(t)), t ∈ (a, b)', formal_axiom: 'curve(x) ↔ ∃f: ℝ→ℝ², x = { f(t) | t ∈ (a, b) }, f twice differentiable, curvature κ ≠ 0', movement_primitive: 'arm_curve', animation_ref: 'curve_arm_anim', example_equation: 'C(t) = (x(t), y(t)), κ = |x\'y\'' - y\'x\''|/(x\'^2 + y\'^2)^{3/2}', usage: 'transition, flow, adaptation', modality: 'Mutable', element: 'Water', cosmic_force: 'Flux', phonetic: 'kɜːrv', glyph: '〰' },
  { ul_symbol: 'angle', meaning: 'direction, divergence, focus', geometric_property: 'two lines sharing a vertex, measure θ', formal_axiom: 'angle(x) ↔ ∃P, Q, R ∈ ℝ², x = ∠QPR, Q ≠ P ≠ R', movement_primitive: 'angle_pose', animation_ref: 'angle_pose_anim', example_equation: 'θ = arccos((\vec{PQ}·\vec{PR})/(|PQ||PR|))', usage: 'focus, divergence, direction', modality: 'Cardinal', element: 'Fire', cosmic_force: 'Power', phonetic: 'æŋɡəl', glyph: '∠' },
  { ul_symbol: 'wave', meaning: 'rhythm, oscillation, signal', geometric_property: 'periodic curve, y = A sin(ωx + φ)', formal_axiom: 'wave(x) ↔ x is a function f: ℝ→ℝ, periodic', movement_primitive: 'arm_wave', animation_ref: 'wave_arm', example_equation: 'y = A sin(ωx + φ)', usage: 'signal, adaptation', modality: 'Mutable', element: 'Air', cosmic_force: 'Chaos', phonetic: 'weɪv', glyph: '~' },
  { ul_symbol: 'spiral', meaning: 'growth, evolution, energy', geometric_property: 'curve with increasing radius, r = a + bθ', formal_axiom: 'spiral(x) ↔ x = { (r cos θ, r sin θ) | r = a + bθ, θ ∈ ℝ }', movement_primitive: 'spiral_turn', animation_ref: 'spiral_turn_anim', example_equation: 'r = a + bθ', usage: 'healing, transformation', modality: 'Mutable', element: 'Air', cosmic_force: 'Flux', phonetic: 'spaɪrəl', glyph: '🌀' },
  { ul_symbol: 'zigzag', meaning: 'agility, unpredictability, disruption', geometric_property: 'piecewise linear, alternating direction', formal_axiom: 'zigzag(x) ↔ x is a sequence of line segments with alternating slopes', movement_primitive: 'zigzag_dash', animation_ref: 'zigzag_dash_anim', example_equation: 'y = (-1)^n x + c_n', usage: 'evasion, disruption', modality: 'Mutable', element: 'Air', cosmic_force: 'Flux', phonetic: 'zɪɡzæɡ', glyph: '〽' },
  { ul_symbol: 'leap', meaning: 'aspiration, breakthrough, courage', geometric_property: 'parabolic arc, y = ax² + bx + c', formal_axiom: 'leap(x) ↔ x is a parabolic trajectory in ℝ²', movement_primitive: 'high_leap', animation_ref: 'high_leap_anim', example_equation: 'y = ax² + bx + c', usage: 'escape, challenge', modality: 'Cardinal', element: 'Fire', cosmic_force: 'Power', phonetic: 'liːp', glyph: '⤴' },
];

export function getSymbolEntry(symbol: string): ULSymbolIndexEntry | undefined {
  return symbolIndex.find(e => e.ul_symbol === symbol);
}

export function getSymbolByGlyph(glyph: string): ULSymbolIndexEntry | undefined {
  return symbolIndex.find(e => e.glyph === glyph);
}

export function getSymbolByPhonetic(phonetic: string): ULSymbolIndexEntry | undefined {
  return symbolIndex.find(e => e.phonetic === phonetic);
}

export function getSymbolByMovementPrimitive(primitive: string): ULSymbolIndexEntry | undefined {
  return symbolIndex.find(e => e.movement_primitive === primitive);
}

export default {
  symbolIndex,
  getSymbolEntry,
  getSymbolByGlyph,
  getSymbolByPhonetic,
  getSymbolByMovementPrimitive,
};
