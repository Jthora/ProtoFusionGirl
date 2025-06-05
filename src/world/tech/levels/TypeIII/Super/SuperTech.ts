// SuperTech.ts - Feature module for Super Tech (Type III)
import type { TechLevel } from '../../TechLevel';

export const SuperTech: TechLevel = {
  id: 'super',
  name: 'Super Tech',
  type: 'Type III',
  era: 'Early',
  sphere: 'Supergalactic',
  age: 'Intergalactic Age',
  description: 'Civilizations operate on a supergalactic scale, harnessing energy and resources from multiple galaxies. Intergalactic travel and communication are possible.',
  gameplayUnlocks: [
    'Intergalactic travel',
    'Supergalactic energy networks',
    'Galaxy-scale engineering'
  ],
  advancementTriggers: [
    'First intergalactic colony',
    'Supergalactic AI'
  ],
  regressionTriggers: [
    'Galactic collapse',
    'Supergalactic war'
  ],
  risks: [
    'Intergalactic conflict',
    'Resource exhaustion',
    'AI existential risk'
  ],
  relatedArtifacts: [
    'timeline_super.artifact',
    'zone_supergalactic.artifact',
    'tech_level_super_unlocks.artifact',
    'tech_level_super_triggers.artifact',
    'tech_level_super_risks.artifact',
    'tech_level_super_lore.artifact',
    'tech_level_super_modding.artifact',
    'tech_level_super_testplan.artifact'
  ]
};
