// HoloTech.ts - Feature module for Holo Tech (Type I)
import type { TechLevel } from '../../TechLevel';

export const HoloTech: TechLevel = {
  id: 'holo',
  name: 'Holo Tech',
  type: 'Type I',
  era: 'Late',
  sphere: 'Magnetospheric',
  age: 'Holographic Age',
  description: 'Societies develop advanced holography, virtual environments, and immersive simulation. Reality and virtuality blend, transforming communication and creativity.',
  gameplayUnlocks: [
    'Holographic tech',
    'Advanced AI',
    'Virtual societies',
    'Immersive simulation'
  ],
  advancementTriggers: [
    'Full-sensory VR',
    'AI-driven creativity'
  ],
  regressionTriggers: [
    'Simulation collapse',
    'AI malfunction'
  ],
  risks: [
    'Loss of reality anchor',
    'AI existential risk',
    'Social fragmentation'
  ],
  relatedArtifacts: [
    'timeline_holo.artifact',
    'zone_holo_simulation.artifact',
    'tech_level_holo_unlocks.artifact',
    'tech_level_holo_triggers.artifact',
    'tech_level_holo_risks.artifact',
    'tech_level_holo_lore.artifact',
    'tech_level_holo_modding.artifact',
    'tech_level_holo_testplan.artifact'
  ]
};
