// LeyLineEvents.integration.test.ts
// Integration tests for bidirectional ley line <-> world/tile event propagation
// References: copilot_leyline_tilemap_traversal_integration_2025-06-07.artifact

import { LeyLineEvents } from '../../src/world/leyline/events/LeyLineEvents';

// Mock MultiverseEventEngine
class MockMultiverseEventEngine {
  public triggered: any[] = [];
  public handlers: Record<string, (data: any) => void> = {};
  triggerWorldChange(branchId: string, changeId: string, data: any) {
    this.triggered.push({ branchId, changeId, data });
  }
  onNarrativeTrigger(_branchId: string, eventId: string, handler: (data: any) => void) {
    this.handlers[eventId] = handler;
  }
  simulateWorldEvent(eventId: string, data: any) {
    if (this.handlers[eventId]) this.handlers[eventId](data);
  }
}

describe('LeyLineEvents <-> World Event Integration', () => {
  let eventBus: any;
  let leyLineEvents: LeyLineEvents;
  let worldEngine: MockMultiverseEventEngine;
  const branchId = 'main';

  beforeEach(() => {
    eventBus = {
      handlers: {},
      subscribe(type: string, handler: any) {
        this.handlers[type] = handler;
      },
      publish(event: any) {
        if (this.handlers[event.type]) this.handlers[event.type](event);
      }
    };
    leyLineEvents = new LeyLineEvents(eventBus);
    worldEngine = new MockMultiverseEventEngine();
    leyLineEvents.integrateWithWorldEvents(worldEngine, branchId);
  });

  it('propagates ley line surge to world event (tile unlock)', () => {
    leyLineEvents.publish('SURGE', {
      leyLineId: 'ley1',
      affectedTiles: [{ x: 1, y: 2 }],
      narrativeContext: 'Ley surge reveals a hidden path.'
    });
    expect(worldEngine.triggered.length).toBe(1);
    expect(worldEngine.triggered[0].changeId).toBe('TILE_UNLOCK');
    expect(worldEngine.triggered[0].data.affectedTiles).toEqual([{ x: 1, y: 2 }]);
    expect(worldEngine.triggered[0].data.lore).toMatch(/hidden path/);
  });

  it('propagates ley line disruption to world event (tile block)', () => {
    leyLineEvents.publish('DISRUPTION', {
      leyLineId: 'ley2',
      affectedTiles: [{ x: 3, y: 4 }],
      narrativeContext: 'Disruption blocks the way.'
    });
    expect(worldEngine.triggered.length).toBe(1);
    expect(worldEngine.triggered[0].changeId).toBe('TILE_BLOCK');
    expect(worldEngine.triggered[0].data.affectedTiles).toEqual([{ x: 3, y: 4 }]);
    expect(worldEngine.triggered[0].data.lore).toMatch(/blocks the way/);
  });

  it('propagates world event to ley line disruption', () => {
    let disruptionFired = false;
    eventBus.subscribe('LEYLINE_DISRUPTION', (event: any) => {
      if (event.data.leyLineId === 'ley3') disruptionFired = true;
    });
    worldEngine.simulateWorldEvent('ENVIRONMENTAL_SHIFT', {
      affectedLeyLines: ['ley3'],
      affectedTiles: [{ x: 5, y: 6 }],
      lore: 'A storm disrupts the ley line.'
    });
    expect(disruptionFired).toBe(true);
  });
});
