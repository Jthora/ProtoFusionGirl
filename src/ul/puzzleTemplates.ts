// src/ul/puzzleTemplates.ts
// Auto-generated from artifacts/ul_puzzle_templates.artifact
// Provides canonical puzzle templates and validation logic for Universal Language (UL)

import grammarRules from './grammarRules';
import cosmicRules from './cosmicRules';

// Canonical puzzle templates (inlined from artifact for now)
export interface ULPuzzleTemplate {
  type: string;
  title: string;
  sequence_required: string[];
  ul_symbols: string[];
  formal_logic: string;
  model_validation: string;
  required_skills: string[];
  branching_outcomes: { success?: string; partial?: string; failure?: string }[];
  adaptive_hints: string[];
  example_instantiation: string;
  related_ul_symbols: string[];
  related_grammar_rules: string[];
  related_animations: string[];
  serialization_example: string;
}

// In a real system, this would be loaded from the artifact YAML/JSON
export const puzzleTemplates: ULPuzzleTemplate[] = [
  {
    type: 'social',
    title: 'Diplomatic Dance-Off',
    sequence_required: ['arm_wave', 'spin'],
    ul_symbols: ['wave', 'circle'],
    formal_logic: 'wave(w) ∧ circle(c)',
    model_validation: 'Valid if both predicates hold in the model; conjunction introduction.',
    required_skills: ['timing', 'pattern recognition'],
    branching_outcomes: [
      { success: 'Alliance formed; unlocks new trade routes.' },
      { partial: 'Respect gained, but no alliance.' },
      { failure: 'Diplomatic incident; future interactions harder.' },
    ],
    adaptive_hints: [
      'Watch the NPC\'s rhythm for clues.',
      'Try repeating the last move if you fail.'
    ],
    example_instantiation: "Player must match the NPC's dance sequence in a timed challenge.",
    related_ul_symbols: ['wave', 'circle'],
    related_grammar_rules: ['conjunction introduction', 'well-formed formula'],
    related_animations: ['wave_arm', 'spin_360'],
    serialization_example: '{\n  "type": "social",\n  "sequence": ["arm_wave", "spin"],\n  "symbols": ["wave", "circle"],\n  "logic": "wave(w) ∧ circle(c)",\n  "outcome": "success"\n}',
  },
  // ...add other templates as needed from artifact...
];

export function getPuzzleTemplateByTitle(title: string): ULPuzzleTemplate | undefined {
  return puzzleTemplates.find(t => t.title === title);
}

export function validatePuzzleSequence(template: ULPuzzleTemplate, sequence: string[]): { valid: boolean; outcome?: string; hint?: string } {
  // For now, use grammarRules and simple logic from artifact
  // Example: conjunction introduction (all required symbols must be present)
  const usedSymbols = sequence.map(primitive => {
    // Map primitive to symbol (reuse logic from ulEngine if needed)
    // For demo, just strip _anim/_wave/_turn etc.
    return primitive.replace(/_.*/, '');
  });
  const allPresent = template.ul_symbols.every(sym => usedSymbols.includes(sym));
  if (allPresent) {
    return { valid: true, outcome: template.branching_outcomes[0]?.success };
  } else {
    return { valid: false, hint: template.adaptive_hints[0] };
  }
}

export default {
  puzzleTemplates,
  getPuzzleTemplateByTitle,
  validatePuzzleSequence,
};
