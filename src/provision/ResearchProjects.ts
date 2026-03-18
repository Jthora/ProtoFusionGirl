import { ResearchProject } from './ProvisionManager';

/**
 * Three P2 research projects with timers and effects.
 */
export const ResearchProjects: ResearchProject[] = [
  {
    id: 'ley_amplifier',
    name: 'Ley Amplifier',
    durationMs: 30_000, // 30 seconds
    effect: 'Increases ley node stability recovery by 50%',
  },
  {
    id: 'psi_capacitor',
    name: 'Psi Capacitor',
    durationMs: 45_000, // 45 seconds
    effect: 'Increases Jane max psi by 25',
  },
  {
    id: 'shield_matrix',
    name: 'Shield Matrix',
    durationMs: 60_000, // 60 seconds
    effect: 'Reduces incoming damage by 20%',
  },
];
