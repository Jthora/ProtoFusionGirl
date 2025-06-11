// src/ul/cosmicRules.ts
// Auto-generated from artifacts/ul_cosmic_rules.artifact
// Provides canonical cosmic force logic for Universal Language (UL)

export type CosmicForce =
  | 'Core'
  | 'Void'
  | 'Order'
  | 'Chaos'
  | 'Alpha'
  | 'Omega'
  | 'Omni'
  | 'Power'
  | 'Flux';

export const cosmicForces: CosmicForce[] = [
  'Core', 'Void', 'Order', 'Chaos', 'Alpha', 'Omega', 'Omni', 'Power', 'Flux'
];

export const modalityCycles = [
  ['Cardinal', 'Mutable', 'Fixed', 'Cardinal'],
  ['Mutable', 'Fixed', 'Cardinal', 'Mutable'],
  ['Fixed', 'Cardinal', 'Mutable', 'Fixed'],
];

export const elementalCycles = [
  ['Fire', 'Air', 'Water', 'Earth', 'Fire'],
  ['Air', 'Water', 'Earth', 'Fire', 'Air'],
  ['Water', 'Earth', 'Fire', 'Air', 'Water'],
  ['Earth', 'Fire', 'Air', 'Water', 'Earth'],
];

const beats: Record<string, string> = {
  Core: 'Chaos',
  Chaos: 'Void',
  Void: 'Order',
  Order: 'Core',
  Cardinal: 'Mutable',
  Mutable: 'Fixed',
  Fixed: 'Cardinal',
};

export function doesBeat(forceA: string, forceB: string): boolean {
  return beats[forceA] === forceB;
}

export const combinations: Record<string, string> = {
  'Fire+Air': 'Angle',
  'Water+Earth': 'Curve',
  'Earth+Air': 'Line',
  'Fire+Water': 'Wave',
  'Water+Air': 'Circle',
  'Earth+Fire': 'Point',
};

export function getCombination(elementA: string, elementB: string): string | undefined {
  const key1 = `${elementA}+${elementB}`;
  const key2 = `${elementB}+${elementA}`;
  return combinations[key1] || combinations[key2];
}

// Utility: get next in a cycle
type Cycle = string[];
/**
 * Returns the next value in a cycle, or the first if at the end, or undefined if not found.
 * This ensures no infinite loop or hang is possible.
 */
export function getNextInCycle(cycle: Cycle, value: string): string | undefined {
  const idx = cycle.indexOf(value);
  if (idx === -1) return undefined;
  // Wrap around to the start if at the end
  return cycle[(idx + 1) % cycle.length];
}

// Defensive: Ensure all functions are pure and cannot hang
/**
 * All exports are pure and synchronous. No function can hang or block.
 */
export default {
  cosmicForces,
  modalityCycles,
  elementalCycles,
  doesBeat,
  getCombination,
  getNextInCycle,
};
