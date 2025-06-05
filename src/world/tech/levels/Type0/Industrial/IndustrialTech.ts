// IndustrialTech.ts - Feature module for Industrial Tech (Type 0)
import type { TechLevel } from '../../TechLevel';

export const IndustrialTech: TechLevel = {
  id: 'industrial',
  name: 'Industrial Tech',
  type: 'Type 0',
  era: 'Late',
  sphere: 'Atmospheric',
  age: 'Atomic Age',
  description: 'Societies develop mass production, mechanization, and early automation. Factories, railroads, and global trade networks emerge.',
  gameplayUnlocks: [
    'Factories',
    'Automation',
    'Advanced transport',
    'Global trade'
  ],
  advancementTriggers: [
    'Electricity harnessed',
    'Internal combustion engine',
    'Telegraph/telephone networks'
  ],
  regressionTriggers: [
    'Resource depletion',
    'Industrial accidents',
    'Revolution'
  ],
  risks: [
    'Pollution',
    'Labor unrest',
    'Global conflict'
  ],
  relatedArtifacts: [
    'timeline_industrial.artifact',
    'zone_factory.artifact',
    'tech_level_industrial_unlocks.artifact',
    'tech_level_industrial_triggers.artifact',
    'tech_level_industrial_risks.artifact',
    'tech_level_industrial_lore.artifact',
    'tech_level_industrial_modding.artifact',
    'tech_level_industrial_testplan.artifact'
  ]
};
