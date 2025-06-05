// Sample mission data for ProtoFusionGirl
// See copilot_mission_system_design_2025-06-04.artifact for structure
import { Mission } from './types';

export const sampleMissions: Mission[] = [
  {
    id: 'main_001',
    title: 'Awaken in the Rift',
    description: 'Find your way out of the anomaly and reach the base.',
    type: 'main',
    status: 'active',
    objectives: [
      {
        id: 'obj1',
        description: 'Exit the anomaly',
        type: 'location',
        target: 'anomaly_exit',
        status: 'incomplete',
      },
    ],
    rewards: [
      { type: 'xp', value: 100 },
      { type: 'item', value: 'starter_kit' },
    ],
    triggers: [
      { type: 'onStart', event: 'showIntroCinematic', params: {} },
    ],
    dependencies: [],
    version: 1,
  },
  {
    id: 'combat_001',
    title: 'Escape the Burning Lab',
    description: 'Survive the fire and escape the lab before it collapses.',
    type: 'main',
    status: 'active',
    objectives: [
      {
        id: 'obj1',
        description: 'Reach the exit before time runs out',
        type: 'location',
        target: 'lab_exit',
        status: 'incomplete',
      },
    ],
    rewards: [
      { type: 'xp', value: 200 },
      { type: 'item', value: 'fire_resistant_suit' },
    ],
    triggers: [
      { type: 'onStart', event: 'startFireTimer', params: { duration: 60 } },
      { type: 'onFail', event: 'collapseLab', params: {} },
    ],
    dependencies: [],
    version: 1,
    // Outcome: environmental_outcome (if timer runs out)
  },
  {
    id: 'diplomacy_001',
    title: 'Negotiate with the Outcasts',
    description: 'Convince the outcast leader to join your cause or avoid combat.',
    type: 'side',
    status: 'inactive',
    objectives: [
      {
        id: 'obj1',
        description: 'Speak to the outcast leader',
        type: 'interact',
        target: 'outcast_leader',
        status: 'incomplete',
      },
    ],
    rewards: [
      { type: 'xp', value: 150 },
      { type: 'faction', value: 'outcasts' },
    ],
    triggers: [
      { type: 'onObjectiveComplete', event: 'offerDiplomacy', params: {} },
    ],
    dependencies: [],
    version: 1,
    // Outcome: diplomatic_resolution or recruitment
  },
  {
    id: 'betrayal_001',
    title: 'The Traitor Revealed',
    description: 'Survive the ambush when an ally betrays you.',
    type: 'dynamic',
    status: 'inactive',
    objectives: [
      {
        id: 'obj1',
        description: 'Defeat the traitor',
        type: 'defeat',
        target: 'traitor_ally',
        status: 'incomplete',
      },
    ],
    rewards: [
      { type: 'xp', value: 300 },
      { type: 'item', value: 'betrayer_blade' },
    ],
    triggers: [
      { type: 'onStart', event: 'triggerBetrayal', params: {} },
    ],
    dependencies: [],
    version: 1,
    // Outcome: betrayal_ally_switch
  },
  // Add more as needed for testing all outcome types
];
// Modding: To add custom outcomes, extend this array and use the 'special_condition' or custom outcome type.
