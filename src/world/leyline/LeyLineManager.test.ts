// LeyLineManager.test.ts
// Integration test for LeyLineManager, WorldStateManager, and EventBus

import { WorldStateManager, WorldState } from '../WorldStateManager';
import { EventBus } from '../EventBus';
import { LeyLineManager } from './LeyLineManager';

describe('LeyLineManager Integration', () => {
  let worldState: WorldState;
  let manager: WorldStateManager;
  let eventBus: EventBus;
  let leyLineManager: LeyLineManager;
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
    leyLineManager = new LeyLineManager(manager.getState().leyLines, manager, eventBus);
    eventFired = false;
    eventBus.subscribe('LEYLINE_ACTIVATED', () => { eventFired = true; });
  });

  it('activates a ley line and emits event', () => {
    leyLineManager.activateLeyLine('ley1', 'testUser');
    const state = manager.getState();
    expect(state.leyLines[0].nodes.every(n => n.active)).toBe(true);
    expect(eventFired).toBe(true);
  });

  it('does not emit event if ley line already active', () => {
    // Activate once
    leyLineManager.activateLeyLine('ley1', 'testUser');
    eventFired = false;
    // Try to activate again
    leyLineManager.activateLeyLine('ley1', 'testUser');
    expect(eventFired).toBe(false);
  });
});
