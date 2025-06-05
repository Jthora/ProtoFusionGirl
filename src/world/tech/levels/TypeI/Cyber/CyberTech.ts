// CyberTech.ts - Feature module for Cyber Tech (Type I)
import type { TechLevel } from '../../TechLevel';

export const CyberTech: TechLevel = {
  id: 'cyber',
  name: 'Cyber Tech',
  type: 'Type I',
  era: 'Early',
  sphere: 'Electrospheric',
  age: 'Information Age',
  description: 'Digital computers, global communication, and automation. Societies are networked, with rapid information flow. AI, cybernetics, and virtual realities emerge.',
  gameplayUnlocks: [
    'Computers',
    'Internet',
    'Hacking',
    'Drones',
    'Robotics',
    'VR/AR'
  ],
  advancementTriggers: [
    'AI singularity',
    'Fusion power'
  ],
  regressionTriggers: [
    'Cyberwar',
    'Infrastructure collapse'
  ],
  risks: [
    'Surveillance',
    'Loss of privacy',
    'AI threats'
  ],
  relatedArtifacts: [
    'timeline_cyber.artifact',
    'zone_datacenter.artifact',
    'tech_level_cyber_unlocks.artifact',
    'tech_level_cyber_triggers.artifact',
    'tech_level_cyber_risks.artifact',
    'tech_level_cyber_lore.artifact',
    'tech_level_cyber_modding.artifact',
    'tech_level_cyber_testplan.artifact'
  ]
};
