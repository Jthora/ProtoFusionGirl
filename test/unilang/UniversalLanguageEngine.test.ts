// UniversalLanguageEngine.test.ts
// Unit and integration tests for UniversalLanguageEngine

import { UniversalLanguageEngine, Puzzle } from '../../src/unilang/UniversalLanguageEngine';

describe('UniversalLanguageEngine', () => {
  let engine: UniversalLanguageEngine;

  beforeEach(() => {
    engine = new UniversalLanguageEngine();
  });

  it('can add a puzzle', () => {
    const puzzle: Puzzle = { id: 'p1', difficulty: 1, symbols: ['A', 'B'], solved: false };
    engine.addPuzzle(puzzle);
    expect(engine.puzzles).toContain(puzzle);
  });

  it('solves a puzzle with correct symbols', () => {
    const puzzle: Puzzle = { id: 'p2', difficulty: 2, symbols: ['X', 'Y'], solved: false };
    engine.addPuzzle(puzzle);
    const result = engine.solvePuzzle('p2', ['X', 'Y']);
    expect(result).toBe(true);
    expect(engine.puzzles.find(p => p.id === 'p2')?.solved).toBe(true);
  });

  it('does not solve a puzzle with incorrect symbols', () => {
    const puzzle: Puzzle = { id: 'p3', difficulty: 2, symbols: ['X', 'Y'], solved: false };
    engine.addPuzzle(puzzle);
    const result = engine.solvePuzzle('p3', ['Y', 'X']);
    expect(result).toBe(false);
    expect(engine.puzzles.find(p => p.id === 'p3')?.solved).toBe(false);
  });

  it('does not solve an already solved puzzle', () => {
    const puzzle: Puzzle = { id: 'p4', difficulty: 1, symbols: ['A'], solved: false };
    engine.addPuzzle(puzzle);
    engine.solvePuzzle('p4', ['A']);
    const result = engine.solvePuzzle('p4', ['A']);
    expect(result).toBe(false);
  });

  it('can call unlockPsionicAbility (stub)', () => {
    expect(() => engine.unlockPsionicAbility('telepathy')).not.toThrow();
  });
});
