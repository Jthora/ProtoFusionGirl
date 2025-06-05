// LeyLineSystem.test.ts
// Integration test for LeyLineSystem, WorldStateManager, and EventBus

import { WorldStateManager, WorldState } from '../WorldStateManager';
import { EventBus } from '../EventBus';
import { LeyLineSystem } from './LeyLineSystem';

describe('LeyLineSystem Integration', () => {
  let worldState: WorldState;
  let manager: WorldStateManager;
  let eventBus: EventBus;
  let leyLineSystem: LeyLineSystem;
  let eventFired = false;

  beforeEach(() => {
    worldState = {
      version: 1,
      leyLines: [
        {
          id: 'ley1',
          nodes: [
            { id: 'n1', position: { x: 0, y: 0 }, type: 'node', active: false },
            { id: 'n2', position: { x: 1, y: 0 }, type: 'anchor', active: false }
          ],
          energy: 100
        }
      ],
      rifts: [],
      players: [],
      economy: { resources: {}, marketPrices: {}, scarcity: {} },
      events: [],
      meta: { online: true, aiAgents: [], mods: [] }
    };
    eventBus = new EventBus();
    manager = new WorldStateManager(worldState, eventBus);
    leyLineSystem = new LeyLineSystem(manager, eventBus);
    eventFired = false;
    eventBus.subscribe('LEYLINE_ACTIVATED', () => { eventFired = true; });
  });

  it('activates a ley line and emits event', () => {
    leyLineSystem.activateLeyLine('ley1', 'testUser');
    const state = manager.getState();
    expect(state.leyLines[0].nodes.every(n => n.active)).toBe(true);
    expect(eventFired).toBe(true);
  });

  it('does not emit event if ley line already active', () => {
    // Activate once
    leyLineSystem.activateLeyLine('ley1', 'testUser');
    eventFired = false;
    // Try to activate again
    leyLineSystem.activateLeyLine('ley1', 'testUser');
    expect(eventFired).toBe(false);
  });
});
