// UltraTech.ts - Feature module for Ultra Tech (Type III)
import type { TechLevel } from '../../TechLevel';

export const UltraTech: TechLevel = {
  id: 'ultra',
  name: 'Ultra Tech',
  type: 'Type III',
  era: 'Late',
  sphere: 'Cosmospheric',
  age: 'Cosmic Age',
  description: 'Civilizations operate on a cosmic scale, manipulating the structure of the universe itself. Ultra Tech societies transcend galactic boundaries and approach the limits of physical law.',
  gameplayUnlocks: [
    'Cosmic engineering',
    'Universe-scale computation',
    'Transcendence technologies'
  ],
  advancementTriggers: [
    'Cosmic structure manipulation',
    'Transcendence event'
  ],
  regressionTriggers: [
    'Cosmic catastrophe',
    'Transcendence failure'
  ],
  risks: [
    'Universal instability',
    'Existential paradoxes',
    'Loss of identity'
  ],
  relatedArtifacts: [
    'timeline_ultra.artifact',
    'zone_cosmic_engineering.artifact',
    'tech_level_ultra_unlocks.artifact',
    'tech_level_ultra_triggers.artifact',
    'tech_level_ultra_risks.artifact',
    'tech_level_ultra_lore.artifact',
    'tech_level_ultra_modding.artifact',
    'tech_level_ultra_testplan.artifact'
  ]
};
