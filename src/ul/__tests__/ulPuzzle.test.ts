// src/ul/__tests__/ulPuzzle.test.ts
// Tests for artifact-driven puzzle template logic

import puzzleTemplates, { getPuzzleTemplateByTitle, validatePuzzleSequence } from '../puzzleTemplates';

describe('UL Puzzle Templates', () => {
  it('retrieves a puzzle template by title', () => {
    const template = getPuzzleTemplateByTitle('Diplomatic Dance-Off');
    expect(template).toBeDefined();
    expect(template?.type).toBe('social');
  });

  it('validates a correct sequence for Diplomatic Dance-Off', () => {
    const template = getPuzzleTemplateByTitle('Diplomatic Dance-Off');
    const result = validatePuzzleSequence(template!, ['arm_wave', 'spin']);
    expect(result.valid).toBe(true);
    expect(result.outcome).toContain('Alliance formed');
  });

  it('invalidates an incorrect sequence for Diplomatic Dance-Off', () => {
    const template = getPuzzleTemplateByTitle('Diplomatic Dance-Off');
    const result = validatePuzzleSequence(template!, ['spin']);
    expect(result.valid).toBe(false);
    expect(result.hint).toContain('rhythm');
  });
});
