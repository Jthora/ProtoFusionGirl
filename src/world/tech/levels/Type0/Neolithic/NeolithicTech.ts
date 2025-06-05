// NeolithicTech.ts - Feature module for Neolithic Tech (Type 0)
import type { TechLevel } from '../../TechLevel';

export const NeolithicTech: TechLevel = {
  id: 'neolithic',
  name: 'Neolithic Tech',
  type: 'Type 0',
  era: 'Early',
  sphere: 'Lithospheric',
  age: 'Iron Age',
  description: 'Societies use stone, bone, and early metal tools. Agriculture and animal domestication begin. Tribal and clan structures dominate. Myth and magic are central to worldview.',
  gameplayUnlocks: [
    'Basic crafting',
    'Primitive weapons',
    'Simple shelters and villages'
  ],
  advancementTriggers: [
    'Discovery of bronze/iron',
    'Formation of city-states'
  ],
  regressionTriggers: [
    'Famine',
    'Plague',
    'War'
  ],
  risks: [
    'High mortality',
    'Superstition',
    'Limited technology'
  ],
  relatedArtifacts: [
    'timeline_neolithic.artifact',
    'zone_lithospheric.artifact',
    'tech_level_neolithic_unlocks.artifact',
    'tech_level_neolithic_triggers.artifact',
    'tech_level_neolithic_risks.artifact',
    'tech_level_neolithic_lore.artifact',
    'tech_level_neolithic_modding.artifact',
    'tech_level_neolithic_testplan.artifact'
  ]
};
