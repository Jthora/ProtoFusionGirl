// MedievalTech.ts - Feature module for Medieval Tech (Type 0)
import type { TechLevel } from '../../TechLevel';

export const MedievalTech: TechLevel = {
  id: 'medieval',
  name: 'Medieval Tech',
  type: 'Type 0',
  era: 'Mid',
  sphere: 'Lithospheric',
  age: 'Medieval Age',
  description: 'Societies develop advanced metallurgy, feudal systems, and organized religion. Castles, knights, and early science emerge.',
  gameplayUnlocks: [
    'Advanced weapons',
    'Fortifications',
    'Trade networks',
    'Feudal governance'
  ],
  advancementTriggers: [
    'Gunpowder discovery',
    'Printing press invention'
  ],
  regressionTriggers: [
    'Plague',
    'Peasant revolts',
    'Religious schism'
  ],
  risks: [
    'Feudal conflict',
    'Religious wars',
    'Technological stagnation'
  ],
  relatedArtifacts: [
    'timeline_medieval.artifact',
    'zone_castle.artifact',
    'tech_level_medieval_unlocks.artifact',
    'tech_level_medieval_triggers.artifact',
    'tech_level_medieval_risks.artifact',
    'tech_level_medieval_lore.artifact',
    'tech_level_medieval_modding.artifact',
    'tech_level_medieval_testplan.artifact'
  ]
};
