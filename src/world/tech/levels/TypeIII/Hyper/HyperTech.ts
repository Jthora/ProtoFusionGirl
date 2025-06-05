// HyperTech.ts - Feature module for Hyper Tech (Type III)
import type { TechLevel } from '../../TechLevel';

export const HyperTech: TechLevel = {
  id: 'hyper',
  name: 'Hyper Tech',
  type: 'Type III',
  era: 'Mid',
  sphere: 'Supergalactic',
  age: 'Hyper Age',
  description: 'Civilizations manipulate the structure of spacetime and energy on a hypergalactic scale. Hypernetworks and reality engineering become possible.',
  gameplayUnlocks: [
    'Hypernetworks',
    'Reality engineering',
    'Hypergalactic travel'
  ],
  advancementTriggers: [
    'Hypernetwork completion',
    'Reality anchor stabilization'
  ],
  regressionTriggers: [
    'Hypernetwork collapse',
    'Reality destabilization'
  ],
  risks: [
    'Reality collapse',
    'Hypergalactic war',
    'Existential paradoxes'
  ],
  relatedArtifacts: [
    'timeline_hyper.artifact',
    'zone_hypernetwork.artifact',
    'tech_level_hyper_unlocks.artifact',
    'tech_level_hyper_triggers.artifact',
    'tech_level_hyper_risks.artifact',
    'tech_level_hyper_lore.artifact',
    'tech_level_hyper_modding.artifact',
    'tech_level_hyper_testplan.artifact'
  ]
};
