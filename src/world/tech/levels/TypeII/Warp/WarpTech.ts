// WarpTech.ts - Feature module for Warp Tech (Type II)
import type { TechLevel } from '../../TechLevel';

export const WarpTech: TechLevel = {
  id: 'warp',
  name: 'Warp Tech',
  type: 'Type II',
  era: 'Late',
  sphere: 'Subgalactic',
  age: 'Interstellar Age',
  description: 'Civilizations master faster-than-light travel and subgalactic navigation. Societies expand across the stars, encountering new risks and opportunities.',
  gameplayUnlocks: [
    'FTL travel',
    'Subgalactic navigation',
    'Wormhole engineering',
    'Exotic matter manipulation'
  ],
  advancementTriggers: [
    'Stable wormhole creation',
    'First contact with extragalactic life'
  ],
  regressionTriggers: [
    'Wormhole collapse',
    'FTL drive failure'
  ],
  risks: [
    'Catastrophic wormhole collapse',
    'Exotic matter contamination',
    'Unintended time dilation'
  ],
  relatedArtifacts: [
    'timeline_warp.artifact',
    'zone_wormhole.artifact',
    'tech_level_warp_unlocks.artifact',
    'tech_level_warp_triggers.artifact',
    'tech_level_warp_risks.artifact',
    'tech_level_warp_lore.artifact',
    'tech_level_warp_modding.artifact',
    'tech_level_warp_testplan.artifact'
  ]
};
