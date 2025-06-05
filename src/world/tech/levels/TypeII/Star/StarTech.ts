// StarTech.ts - Feature module for Star Tech (Type II)
import type { TechLevel } from '../../TechLevel';

export const StarTech: TechLevel = {
  id: 'star',
  name: 'Star Tech',
  type: 'Type II',
  era: 'Mid',
  sphere: 'Astrospheric',
  age: 'Stellar Age',
  description: 'Civilizations master stellar engineering, building megastructures and manipulating stars. Societies operate on a stellar scale.',
  gameplayUnlocks: [
    'Stellar megastructures',
    'Star lifting',
    'Stellar-scale energy networks',
    'Advanced interstellar logistics'
  ],
  advancementTriggers: [
    'Dyson swarm completion',
    'Stellar-scale AI'
  ],
  regressionTriggers: [
    'Stellar collapse',
    'AI rebellion'
  ],
  risks: [
    'Stellar instability',
    'Megastructure failure',
    'AI existential risk'
  ],
  relatedArtifacts: [
    'timeline_star.artifact',
    'zone_stellar_megastructure.artifact',
    'tech_level_star_unlocks.artifact',
    'tech_level_star_triggers.artifact',
    'tech_level_star_risks.artifact',
    'tech_level_star_lore.artifact',
    'tech_level_star_modding.artifact',
    'tech_level_star_testplan.artifact'
  ]
};
