// tech_level_progression.test.ts
// Automated tests for tech level progression, Holo Tech unlocks, and regression (artifact-driven)
import { WorldStateManager } from '../src/world/WorldStateManager';

describe('Tech Level Progression Flow', () => {
  let manager: WorldStateManager;
  beforeEach(() => {
    manager = new WorldStateManager({
      version: 1,
      leyLines: [],
      rifts: [],
      players: [],
      economy: { resources: {}, marketPrices: {}, scarcity: {} },
      events: [],
      meta: { online: true, aiAgents: [], mods: [] },
      techLevelState: { playerTechLevel: 'neolithic', factionTechLevel: 'neolithic', unlocks: [] }
    }, { publish: jest.fn() } as any);
  });

  it('should advance to Holo Tech and unlock features', () => {
    manager.advanceTechLevel('holo');
    expect(manager.getCurrentTechLevel()).toBe('holo');
    expect(manager.isHoloTechUnlocked()).toBe(true);
    expect(manager.getState().techLevelState?.unlocks).toEqual(
      expect.arrayContaining([
        'Holo Gear',
        'Simulation Missions',
        'Reality Manipulation',
        'zone_holo_simulation',
        'skill:holo_shield'
      ])
    );
  });

  it('should regress from Holo Tech and remove unlocks', () => {
    manager.advanceTechLevel('holo');
    manager.regressTechLevel('cyber');
    expect(manager.getCurrentTechLevel()).toBe('cyber');
    expect(manager.isHoloTechUnlocked()).toBe(false);
    expect(manager.getState().techLevelState?.unlocks).not.toEqual(
      expect.arrayContaining([
        'Holo Gear',
        'Simulation Missions',
        'Reality Manipulation',
        'zone_holo_simulation',
        'skill:holo_shield'
      ])
    );
  });
});
