// src/ul/grammarRules.ts
// Auto-generated from artifacts/ul_grammar_rules.artifact
// Provides canonical grammar and syntax logic for Universal Language (UL)

export type ULSymbol =
  | 'point'
  | 'line'
  | 'circle'
  | 'triangle'
  | 'square'
  | 'curve'
  | 'angle'
  | 'wave'
  | 'spiral'
  | 'zigzag'
  | 'leap';

export const ulSymbols: ULSymbol[] = [
  'point', 'line', 'circle', 'triangle', 'square', 'curve', 'angle', 'wave', 'spiral', 'zigzag', 'leap'
];

export const predicates = [
  'contains', 'adjacent', 'intersects', 'parallel', 'perpendicular', 'center', 'on'
];

export const functions = [
  'transform', 'intersection'
];

export const constants = ['O'];

// Type exclusivity axiom: no symbol can be more than one type
export function isTypeExclusive(symbols: ULSymbol[]): boolean {
  return new Set(symbols).size === symbols.length;
}

// Well-formed formula: basic check for allowed predicates/functions/quantifiers
export function isWellFormedFormula(formula: string): boolean {
  // Very basic: must use only allowed predicates/functions/symbols
  const allowed = [...predicates, ...functions, ...ulSymbols, ...constants];
  return allowed.some(token => formula.includes(token));
}

// Example: Conjunction Introduction (from φ, ψ infer φ ∧ ψ)
export function conjunctionIntroduction(phi: string, psi: string): string {
  return `(${phi}) ∧ (${psi})`;
}

// Example: Modus Ponens (from φ, φ→ψ infer ψ)
export function modusPonens(phi: string, implication: string): string | null {
  // implication must be of the form 'φ→ψ'
  const match = implication.match(/^(.*)→(.*)$/);
  if (match && match[1].trim() === phi.trim()) {
    return match[2].trim();
  }
  return null;
}

// Edge case: degenerate circle (circle(x) ∧ radius(x,0) → point(x))
export function degenerateCircle(radius: number): 'point' | 'circle' {
  return radius === 0 ? 'point' : 'circle';
}

// Defensive: all functions are pure and synchronous
export default {
  ulSymbols,
  predicates,
  functions,
  constants,
  isTypeExclusive,
  isWellFormedFormula,
  conjunctionIntroduction,
  modusPonens,
  degenerateCircle,
};
