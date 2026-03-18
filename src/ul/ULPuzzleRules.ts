// ULPuzzleRules.ts
// Canonical puzzle rules for P3 UL puzzles.
// Each rule maps element combinations (from cosmicRules) to game effects.

import { PuzzleRule } from './ULPuzzleManager';

/** Earth + Water = Curve → Repair (heals damaged robots/structures) */
export const REPAIR_RULE: PuzzleRule = {
  id: 'repair',
  name: 'Repair',
  baseElement: 'Earth',
  modifierElement: 'Water',
  resultSymbol: 'curve',
  effect: 'repair',
  description: 'Combines Earth stability with Water flow to mend damaged entities.',
};

/** Fire + Air = Angle → Banish (seals dimensional rifts) */
export const BANISH_RULE: PuzzleRule = {
  id: 'banish',
  name: 'Banishment',
  baseElement: 'Fire',
  modifierElement: 'Air',
  resultSymbol: 'angle',
  effect: 'seal_rift',
  description: 'Focuses Fire energy through Air to banish rift entities and seal breaches.',
};

/** Water + Air = Circle → Shield (creates protective barrier) */
export const SHIELD_RULE: PuzzleRule = {
  id: 'shield',
  name: 'Shield',
  baseElement: 'Water',
  modifierElement: 'Air',
  resultSymbol: 'circle',
  effect: 'shield',
  description: 'Weaves Water and Air into a circular ward of protection.',
};

/** All canonical P3 puzzle rules */
export const ALL_PUZZLE_RULES: PuzzleRule[] = [
  REPAIR_RULE,
  BANISH_RULE,
  SHIELD_RULE,
];
