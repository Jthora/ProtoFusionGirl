// WorldStateManager.instability.test.ts
// Artifact-driven: Tests for ley line instability propagation and branch-aware state
// See: leyline_instability_event_api_reference_2025-06-08.artifact, leyline_instability_event_design_2025-06-08.artifact

import { WorldStateManager } from '../../src/world/WorldStateManager';
import { EventBus } from '../../src/world/EventBus';
import { LeyLineInstabilityEvent } from '../../src/world/leyline/types';
import { LeyLineSystem } from '../../src/leyline/LeyLineSystem';

describe('WorldStateManager - Ley Line Instability Propagation', () => {
  let manager: WorldStateManager;
  let eventBus: EventBus;
  let leyLineSystem: LeyLineSystem;
  let events: LeyLineInstabilityEvent[] = [];

  beforeEach(() => {
    eventBus = new EventBus();
    events = [];
    // Minimal world state with two connected nodes
    const worldState = {
      version: 1,
      leyLines: [
        {
          id: 'ley1',
          nodes: [
            { id: 'A', position: { x: 0, y: 0 }, state: 'active' },
            { id: 'B', position: { x: 1, y: 0 }, state: 'active' }
          ],
          status: 'stable',
          strength: 100
        }
      ],
      rifts: [],
      players: [],
      economy: { resources: {}, marketPrices: {}, scarcity: {} },
      events: [],
      meta: { online: true, aiAgents: [], mods: [] }
    };
    manager = new WorldStateManager(worldState, eventBus);
    leyLineSystem = manager.leyLineSystem;
    eventBus.subscribe('LEYLINE_INSTABILITY', (event: any) => {
      events.push(event.data);
    });
  });

  it('propagates instability to connected nodes on major event', () => {
    const event: LeyLineInstabilityEvent = {
      id: 'evt1',
      type: 'LEYLINE_INSTABILITY',
      leyLineId: 'ley1',
      nodeId: 'A',
      severity: 'major',
      triggeredBy: 'simulation',
      timestamp: Date.now(),
      branchId: 'branch1',
      data: {}
    };
    manager.handleLeyLineInstability(event);
    // Should emit an event for the neighbor node B
    expect(events.some(e => e.nodeId === 'B' && e.leyLineId === 'ley1')).toBe(true);
    // Should mark both nodes as unstable
    const nodes = leyLineSystem.nodes;
    expect(nodes.find(n => n.id === 'A')!.state).toBe('unstable');
    expect(nodes.find(n => n.id === 'B')!.state).toBe('unstable');
  });

  it('does not propagate instability for minor event', () => {
    const event: LeyLineInstabilityEvent = {
      id: 'evt2',
      type: 'LEYLINE_INSTABILITY',
      leyLineId: 'ley1',
      nodeId: 'A',
      severity: 'minor',
      triggeredBy: 'simulation',
      timestamp: Date.now(),
      branchId: 'branch1',
      data: {}
    };
    manager.handleLeyLineInstability(event);
    // Should not emit an event for the neighbor node
    expect(events.some(e => e.nodeId === 'B')).toBe(false);
    // Only node A should be unstable
    const nodes = leyLineSystem.nodes;
    expect(nodes.find(n => n.id === 'A')!.state).toBe('unstable');
    expect(nodes.find(n => n.id === 'B')!.state).toBe('active');
  });
});
