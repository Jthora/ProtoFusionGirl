// SpacerTech.ts - Feature module for Spacer Tech (Type I)
import type { TechLevel } from '../../TechLevel';

export const SpacerTech: TechLevel = {
  id: 'spacer',
  name: 'Spacer Tech',
  type: 'Type I',
  era: 'Mid',
  sphere: 'Electrospheric',
  age: 'Spacer Age',
  description: 'Societies expand into space, building orbital habitats and developing advanced life support. Space industry and off-world colonies emerge.',
  gameplayUnlocks: [
    'Space habitats',
    'Orbital industry',
    'Life support systems',
    'Off-world colonies'
  ],
  advancementTriggers: [
    'Permanent orbital settlement',
    'Self-sustaining space industry'
  ],
  regressionTriggers: [
    'Orbital disaster',
    'Supply chain collapse'
  ],
  risks: [
    'Habitat failure',
    'Space debris',
    'Isolation of colonies'
  ],
  relatedArtifacts: [
    'timeline_spacer.artifact',
    'zone_orbital_habitat.artifact',
    'tech_level_spacer_unlocks.artifact',
    'tech_level_spacer_triggers.artifact',
    'tech_level_spacer_risks.artifact',
    'tech_level_spacer_lore.artifact',
    'tech_level_spacer_modding.artifact',
    'tech_level_spacer_testplan.artifact'
  ]
};
