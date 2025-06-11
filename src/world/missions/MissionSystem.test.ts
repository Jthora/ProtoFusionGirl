// MissionSystem.test.ts
// Basic test for event-driven MissionSystem integration with WorldStateManager and EventBus
// See: artifacts/test_system_traceability_2025-06-08.artifact
import { WorldStateManager, WorldState, PlayerState } from '../WorldStateManager';
import { EventBus } from '../../core/EventBus';
import { GameEvent } from '../../core/EventTypes';
import { MissionSystem, Mission } from './MissionSystem';

describe('MissionSystem Integration', () => {
  let eventBus: EventBus;
  let missionSystem: MissionSystem;
  let player: PlayerState;
  let worldStateManager: WorldStateManager;
  let events: GameEvent[] = [];

  beforeEach(() => {
    eventBus = new EventBus();
    player = {
      id: 'p1',
      name: 'Jane',
      position: { x: 0, y: 0 },
      inventory: {},
      progression: [],
      stats: {}
    };
    const initialState: WorldState = {
      version: 1,
      leyLines: [],
      rifts: [],
      players: [player],
      economy: { resources: {}, marketPrices: {}, scarcity: {} },
      events: [],
      meta: { online: true, aiAgents: [], mods: [] }
    };
    worldStateManager = new WorldStateManager(initialState, eventBus);
    missionSystem = new MissionSystem(worldStateManager, eventBus, player.id);
    eventBus.on('MISSION_COMPLETED', (e: GameEvent<'MISSION_COMPLETED'>) => events.push(e));
  });

  it('should progress and complete a mission via events', () => {
    const mission: Mission = {
      id: 'm1',
      title: 'Defeat 2 Slimes',
      description: 'Defeat 2 slime enemies.',
      objectives: [
        { id: 'o1', type: 'defeat', target: 'slime', count: 2, progress: 0, completed: false }
      ],
      status: 'active'
    };
    missionSystem.startMission(mission);
    // Simulate defeating two slimes
    eventBus.emit({
      type: 'ENEMY_DEFEATED',
      data: { enemyId: 'slime1' }
    });
    eventBus.emit({
      type: 'ENEMY_DEFEATED',
      data: { enemyId: 'slime2' }
    });
    // Check that the mission is completed
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('MISSION_COMPLETED');
    const updatedPlayer = worldStateManager.getState().players[0] as any;
    expect(updatedPlayer.missions[0].status).toBe('completed');
    expect(updatedPlayer.missions[0].objectives[0].completed).toBe(true);
  });

  it('should handle environmental_outcome (fire/collapse) mission', () => {
    const mission: Mission = {
      id: 'm2',
      title: 'Escape the Fire',
      description: 'Escape before the fire collapses the lab.',
      objectives: [
        { id: 'o1', type: 'location', target: 'lab_exit', count: 1, progress: 0, completed: false }
      ],
      status: 'active'
    };
    missionSystem.startMission(mission);
    // Simulate environmental event (e.g., fire collapse)
    missionSystem['handleMissionOutcome'](mission, 'environmental_outcome');
    expect(mission.outcome).toBe('environmental_outcome');
  });

  it('should handle diplomatic_resolution and recruitment outcomes', () => {
    const mission: Mission = {
      id: 'm3',
      title: 'Negotiate Peace',
      description: 'Convince the enemy to join you.',
      objectives: [
        { id: 'o1', type: 'interact', target: 'enemy_leader', count: 1, progress: 0, completed: false }
      ],
      status: 'active'
    };
    missionSystem.startMission(mission);
    missionSystem['handleMissionOutcome'](mission, 'diplomatic_resolution');
    expect(mission.outcome).toBe('diplomatic_resolution');
    missionSystem['handleMissionOutcome'](mission, 'recruitment');
    expect(mission.outcome).toBe('recruitment');
  });

  it('should handle betrayal_ally_switch outcome', () => {
    const mission: Mission = {
      id: 'm4',
      title: 'Betrayal!',
      description: 'An ally betrays you.',
      objectives: [
        { id: 'o1', type: 'defeat', target: 'traitor', count: 1, progress: 0, completed: false }
      ],
      status: 'active'
    };
    missionSystem.startMission(mission);
    missionSystem['handleMissionOutcome'](mission, 'betrayal_ally_switch');
    expect(mission.outcome).toBe('betrayal_ally_switch');
  });
});
