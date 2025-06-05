// FusionTech.ts - Feature module for Fusion Tech (Type II)
import type { TechLevel } from '../../TechLevel';

export const FusionTech: TechLevel = {
  id: 'fusion',
  name: 'Fusion Tech',
  type: 'Type II',
  era: 'Early',
  sphere: 'Astrospheric',
  age: 'Astral Age',
  description: 'Civilizations harness fusion energy and begin stellar engineering. Interstellar travel is possible. Societies may be post-scarcity, with advanced AI and synthetic life.',
  gameplayUnlocks: [
    'Fusion reactors',
    'Starships',
    'Terraforming and stellar engineering',
    'Synthetic biology',
    'Advanced AI'
  ],
  advancementTriggers: [
    'Dyson sphere construction',
    'Interstellar colonization'
  ],
  regressionTriggers: [
    'Stellar disasters',
    'Rogue AI'
  ],
  risks: [
    'Star lifting accidents',
    'Existential threats',
    'Resource depletion',
    'Societal collapse due to overreliance on automation'
  ],
  relatedArtifacts: [
    'timeline_fusion.artifact',
    'zone_fusion_reactor.artifact',
    'tech_level_fusion_unlocks.artifact',
    'tech_level_fusion_triggers.artifact',
    'tech_level_fusion_risks.artifact',
    'tech_level_fusion_lore.artifact',
    'tech_level_fusion_modding.artifact',
    'tech_level_fusion_testplan.artifact'
  ]
};
