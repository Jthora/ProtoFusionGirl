// src/ul/symbolIndex.ts
// Universal Language symbol index — grounded in the real Σ_UL formal algebra
// Reference: https://github.com/Jthora/universal_language
//
// ARCHITECTURE:
//   Tier 1 (Geometrically Forced): The 5 UL primitives — Point, Line, Angle, Curve, Enclosure
//   Tier 2 (Structurally Distinguished): Canonical compositions of primitives (circle, spiral, wave, etc.)
//   Tier 3 (Conventional): Game-layer element/modality/cosmic mappings
//
// The game's original 11 symbols (point, line, circle, triangle, square, curve, angle, wave, spiral,
// zigzag, leap) are ALL valid geometric constructions in real UL. They were never wrong — they were
// just underdocumented. This index provides their proper geometric grounding.
//
// Jordan Traña (Jono Tho'ra) discovered Universal Language as a real mathematical structure.
// The game is literally about teaching it. The symbols are the proof-of-concept.

import { ULPrimitive, ULTier, ULConstructiveLevel } from './ulCanonicalTypes';

export interface ULSymbolIndexEntry {
  ul_symbol: string;
  /** The real UL primitive(s) this symbol is grounded in */
  ul_primitive: ULPrimitive | ULPrimitive[];
  /** Tier per the UL Lexicon 3-tier justification system */
  ul_tier: ULTier;
  /** Constructive level (min steps from void) */
  ul_level: ULConstructiveLevel;
  /** Geometric characterization from the real UL lexicon */
  geometric_description: string;
  meaning: string;
  geometric_property: string;
  formal_axiom: string;
  movement_primitive: string;
  animation_ref: string;
  example_equation: string;
  usage: string;
  /** Modality is a T3 conventional game-layer mapping (Cardinal/Fixed/Mutable) */
  modality: string;
  /** Element is a T3 conventional game-layer semantic coordinate */
  element: string;
  /** Cosmic force is a T3 conventional game-layer meaning-space label */
  cosmic_force: string;
  phonetic: string;
  glyph: string;
}

export const symbolIndex: ULSymbolIndexEntry[] = [
  // -------------------------------------------------------------------------
  // TIER 1 — Geometrically Forced (the 5 UL primitives)
  // These are the atomic alphabet of Universal Language. Not invented. Discovered.
  // -------------------------------------------------------------------------
  {
    ul_symbol: 'point',
    ul_primitive: ULPrimitive.Point,
    ul_tier: ULTier.T1_GeometricallyForced,
    ul_level: ULConstructiveLevel.AtomicCarriers,
    geometric_description: 'A single point: the minimum act of meaning. Asserts that something IS. Dependency rank 0 — presupposed by all other primitives, depending on nothing. Maximally symmetric (invariant under all rotations).',
    meaning: 'existence, core, instance, origin',
    geometric_property: 'zero-dimensional, P in R^n, measure zero',
    formal_axiom: 'point(x) iff x in R^n and measure(x)=0',
    movement_primitive: 'tap',
    animation_ref: 'point_tap',
    example_equation: 'P = (x, y)',
    usage: 'focus, start, anchor, assert existence',
    modality: 'Core',
    element: 'N/A',
    cosmic_force: 'Core',
    phonetic: 'pɔɪnt',
    glyph: '•',
  },
  {
    ul_symbol: 'line',
    ul_primitive: ULPrimitive.Line,
    ul_tier: ULTier.T1_GeometricallyForced,
    ul_level: ULConstructiveLevel.AtomicCarriers,
    geometric_description: 'Two points connected by a straight segment. The unique minimum structure connecting two existences. Introduces directionality. 1 degree of freedom. The geometric realization of predicate(e1, r, e2) — the foundation of every statement.',
    meaning: 'relation, link, order, connection, stability',
    geometric_property: 'one-dimensional, connects two points, direction vector d = P2 - P1',
    formal_axiom: 'line(x) iff exists P1,P2 in R^n: x = { (1-t)*P1 + t*P2 | t in (0,1) }',
    movement_primitive: 'step_line',
    animation_ref: 'line_walk',
    example_equation: 'L = { (1-t)*P1 + t*P2 | t in (0,1) }',
    usage: 'progression, connection, establish relation',
    modality: 'Fixed',
    element: 'Air',
    cosmic_force: 'Order',
    phonetic: 'laɪn',
    glyph: '―',
  },
  {
    ul_symbol: 'angle',
    ul_primitive: ULPrimitive.Angle,
    ul_tier: ULTier.T1_GeometricallyForced,
    ul_level: ULConstructiveLevel.AtomicCarriers,
    geometric_description: 'Two rays sharing a vertex. Requires two Lines meeting at a Point. The unique way to introduce Quality — the character of a relationship. Parameterized by theta, a continuous spectrum of quality.',
    meaning: 'quality, direction, divergence, focus, character',
    geometric_property: 'two rays sharing a vertex, measure theta',
    formal_axiom: 'angle(x) iff exists P,Q,R in R^2: x = angle(QPR), Q != P != R',
    movement_primitive: 'angle_pose',
    animation_ref: 'angle_pose_anim',
    example_equation: 'theta = arccos((PQ_vec . PR_vec) / (|PQ| * |PR|))',
    usage: 'focus, divergence, direction, qualify a relation',
    modality: 'Cardinal',
    element: 'Fire',
    cosmic_force: 'Power',
    phonetic: 'æŋɡəl',
    glyph: '∠',
  },
  {
    ul_symbol: 'curve',
    ul_primitive: ULPrimitive.Curve,
    ul_tier: ULTier.T1_GeometricallyForced,
    ul_level: ULConstructiveLevel.AtomicCarriers,
    geometric_description: 'A non-straight continuous path. A relation whose direction changes continuously along its length. Curvature kappa(s) parameterizes the rate of change. Requires 2D embedding. Introduces Process — becoming, change, transformation.',
    meaning: 'process, flow, adaptation, change, becoming',
    geometric_property: 'one-dimensional non-linear path: C(t) = (x(t), y(t)), curvature kappa != 0',
    formal_axiom: 'curve(x) iff exists f: R -> R^2 where x = { f(t) | t in (a,b) }, f twice differentiable, kappa != 0',
    movement_primitive: 'arm_curve',
    animation_ref: 'curve_arm_anim',
    example_equation: 'C(t) = (x(t), y(t)), kappa = |x_prime*y_double_prime - y_prime*x_double_prime| / (x_prime^2 + y_prime^2)^(3/2)',
    usage: 'transition, flow, adaptation, express process',
    modality: 'Mutable',
    element: 'Water',
    cosmic_force: 'Flux',
    phonetic: 'kɜːrv',
    glyph: '〰',
  },

  // -------------------------------------------------------------------------
  // TIER 1 — Enclosure variants (geometric shapes — T1 for triangle and circle
  //          by Erlangen symmetry argument; T2 for square)
  // -------------------------------------------------------------------------
  {
    ul_symbol: 'circle',
    ul_primitive: ULPrimitive.Enclosure,
    ul_tier: ULTier.T1_GeometricallyForced,
    ul_level: ULConstructiveLevel.Distinguished,
    geometric_description: 'A closed curve with constant curvature — all points equidistant from center. Maximum symmetry (SO(2), infinite rotation group). The unique maximum-symmetry enclosure. Signifies universality, completeness, the most general concept-class.',
    meaning: 'unity, closure, universality, completeness, the most general kind of',
    geometric_property: 'set of points equidistant from center (h,k): (x-h)^2 + (y-k)^2 = r^2',
    formal_axiom: 'circle(x) iff exists h,k,r: x = { (x,y) | (x-h)^2 + (y-k)^2 = r^2, r > 0 }',
    movement_primitive: 'spin',
    animation_ref: 'spin_360',
    example_equation: '(x-h)^2 + (y-k)^2 = r^2',
    usage: 'enclosure, ritual, closure, express universal concept',
    modality: 'Mutable',
    element: 'Water',
    cosmic_force: 'Void',
    phonetic: 'sɜːrkəl',
    glyph: '○',
  },
  {
    ul_symbol: 'triangle',
    ul_primitive: ULPrimitive.Enclosure,
    ul_tier: ULTier.T1_GeometricallyForced,
    ul_level: ULConstructiveLevel.Distinguished,
    geometric_description: 'The minimum polygon (3 sides — fewest sides that can enclose area). Symmetry D3. The unique minimum-complexity enclosure. Signifies the fundamental, atomic, irreducible — the simplest kind of concept.',
    meaning: 'change, transformation, fundamental structure, irreducibility',
    geometric_property: 'polygon with 3 vertices, 3 edges, interior angle sum = 180deg',
    formal_axiom: 'triangle(x) iff x is a set of 3 non-collinear points in R^2, forming a closed path',
    movement_primitive: 'step_sequence_triangle',
    animation_ref: 'triangle_footwork',
    example_equation: 'Triangle ABC: A, B, C in R^2',
    usage: 'hierarchy, transformation, fundamental structure',
    modality: 'Cardinal',
    element: 'Fire',
    cosmic_force: 'Alpha',
    phonetic: 'traɪæŋɡəl',
    glyph: '△',
  },
  {
    ul_symbol: 'square',
    ul_primitive: ULPrimitive.Enclosure,
    ul_tier: ULTier.T2_StructurallyDistinguished,
    ul_level: ULConstructiveLevel.Distinguished,
    geometric_description: 'The unique regular polygon that tessellates the Euclidean plane by itself with only translations. Symmetry D4. Signifies systematic ordered coverage — the structured, organized concept-class.',
    meaning: 'stability, order, protection, systematic structure',
    geometric_property: 'polygon with 4 equal sides and 4 right angles (90deg each)',
    formal_axiom: 'square(x) iff x is a set of 4 points in R^2 with equal sides and right angles',
    movement_primitive: 'box_step',
    animation_ref: 'box_step_anim',
    example_equation: 'ABCD: |AB|=|BC|=|CD|=|DA|, angle=90deg',
    usage: 'defense, structure, express ordered concept',
    modality: 'Fixed',
    element: 'Earth',
    cosmic_force: 'Order',
    phonetic: 'skwɛər',
    glyph: '□',
  },

  // -------------------------------------------------------------------------
  // TIER 2 — Structurally Distinguished (canonical curve variants)
  // -------------------------------------------------------------------------
  {
    ul_symbol: 'wave',
    ul_primitive: ULPrimitive.Curve,
    ul_tier: ULTier.T2_StructurallyDistinguished,
    ul_level: ULConstructiveLevel.Distinguished,
    geometric_description: 'A curve whose curvature alternates sign periodically. The simplest periodic function (single Fourier component, minimal harmonic content). The canonical oscillation — distinguished among all periodic curves.',
    meaning: 'rhythm, oscillation, signal, alternation',
    geometric_property: 'periodic curve: y = A*sin(omega*x + phi)',
    formal_axiom: 'wave(x) iff x is a function f: R -> R that is periodic with period T, minimal Fourier content',
    movement_primitive: 'arm_wave',
    animation_ref: 'wave_arm',
    example_equation: 'y = A * sin(omega * x + phi)',
    usage: 'signal, adaptation, express rhythm',
    modality: 'Mutable',
    element: 'Air',
    cosmic_force: 'Chaos',
    phonetic: 'weɪv',
    glyph: '~',
  },
  {
    ul_symbol: 'spiral',
    ul_primitive: ULPrimitive.Curve,
    ul_tier: ULTier.T2_StructurallyDistinguished,
    ul_level: ULConstructiveLevel.Distinguished,
    geometric_description: 'A curve whose distance from a center point monotonically increases. Simultaneously rotates (angular change) and expands (radial increase). The unique curve class that is periodic in angle and monotonic in radius. Signifies growth, development, evolution.',
    meaning: 'growth, evolution, energy, unfolding development',
    geometric_property: 'curve with monotonically increasing radius: r = a + b*theta',
    formal_axiom: 'spiral(x) iff x = { (r*cos(theta), r*sin(theta)) | r = a + b*theta, theta in R }',
    movement_primitive: 'spiral_turn',
    animation_ref: 'spiral_turn_anim',
    example_equation: 'r = a + b*theta',
    usage: 'healing, transformation, express growth',
    modality: 'Mutable',
    element: 'Air',
    cosmic_force: 'Flux',
    phonetic: 'spaɪrəl',
    glyph: '🌀',
  },

  // -------------------------------------------------------------------------
  // TIER 3 — Conventional (game-specific compound expressions)
  // These are valid UL constructions but are T3 design choices, not geometric necessities.
  // -------------------------------------------------------------------------
  {
    ul_symbol: 'zigzag',
    ul_primitive: [ULPrimitive.Line, ULPrimitive.Angle],
    ul_tier: ULTier.T3_Conventional,
    ul_level: ULConstructiveLevel.TwoPrimitive,
    geometric_description: 'A compound of Lines composed with alternating Angles — piecewise linear, alternating direction. Conventionally associated with agility and disruption in the game layer. Geometrically: a composition of directed relations with periodic angle inversions.',
    meaning: 'agility, unpredictability, disruption',
    geometric_property: 'piecewise linear with alternating direction angles',
    formal_axiom: 'zigzag(x) iff x is a sequence of line segments with alternating slopes',
    movement_primitive: 'zigzag_dash',
    animation_ref: 'zigzag_dash_anim',
    example_equation: 'y = (-1)^n * x + c_n',
    usage: 'evasion, disruption',
    modality: 'Mutable',
    element: 'Air',
    cosmic_force: 'Flux',
    phonetic: 'zɪɡzæɡ',
    glyph: '〽',
  },
  {
    ul_symbol: 'leap',
    ul_primitive: [ULPrimitive.Curve, ULPrimitive.Angle],
    ul_tier: ULTier.T3_Conventional,
    ul_level: ULConstructiveLevel.TwoPrimitive,
    geometric_description: 'A Curve (parabolic arc) expressing an Angle trajectory — directed aspiration reaching a peak and descending. Conventionally associated with breakthrough and courage. Geometrically: a process with a distinguished angular character (aspiration arc).',
    meaning: 'aspiration, breakthrough, courage, reaching beyond',
    geometric_property: 'parabolic arc: y = a*x^2 + b*x + c, a < 0',
    formal_axiom: 'leap(x) iff x is a parabolic trajectory in R^2 with negative leading coefficient',
    movement_primitive: 'high_leap',
    animation_ref: 'high_leap_anim',
    example_equation: 'y = a*x^2 + b*x + c',
    usage: 'escape, challenge, breakthrough',
    modality: 'Cardinal',
    element: 'Fire',
    cosmic_force: 'Power',
    phonetic: 'liːp',
    glyph: '⤴',
  },
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

/** Get all symbols grounded in a given UL primitive */
export function getSymbolsByPrimitive(primitive: ULPrimitive): ULSymbolIndexEntry[] {
  return symbolIndex.filter(e =>
    Array.isArray(e.ul_primitive)
      ? e.ul_primitive.includes(primitive)
      : e.ul_primitive === primitive
  );
}

/** Get the 5 canonical T1+T2 primitive-level symbols (the core alphabet) */
export function getPrimitiveSymbols(): ULSymbolIndexEntry[] {
  return symbolIndex.filter(e => e.ul_level === ULConstructiveLevel.AtomicCarriers);
}

export default {
  symbolIndex,
  getSymbolEntry,
  getSymbolByGlyph,
  getSymbolByPhonetic,
  getSymbolByMovementPrimitive,
  getSymbolsByPrimitive,
  getPrimitiveSymbols,
};
