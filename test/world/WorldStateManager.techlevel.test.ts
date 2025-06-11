// WorldStateManager.techlevel.test.ts
// Tests for artifact-driven Holo Tech progression, unlocks, and regression

import { WorldStateManager } from '../../src/world/WorldStateManager';

describe('Tech Level Progression (Artifact-Driven)', () => {
  let manager: WorldStateManager;
  let initialState: any;
  let eventBus: any;

  beforeEach(() => {
    initialState = {
      version: 1,
      leyLines: [],
      rifts: [],
      players: [],
      economy: {},
      events: [],
      meta: {},
      techLevelState: undefined
    };
    eventBus = { publish: jest.fn() };
    manager = new WorldStateManager(initialState, eventBus);
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
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'NARRATIVE_EVENT',
        data: { eventId: 'holo_tech_unlocked' }
      })
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
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'NARRATIVE_EVENT',
        data: { eventId: 'holo_tech_regressed' }
      })
    );
  });
});
