// WorldStateManager.instability.test.ts
// Artifact-driven: Tests for ley line instability propagation and branch-aware state
// See: leyline_instability_event_api_reference_2025-06-08.artifact, leyline_instability_event_design_2025-06-08.artifact
// See: artifacts/test_system_traceability_2025-06-08.artifact
import { WorldStateManager, WorldState } from '../../src/world/WorldStateManager';
import { EventBus } from '../../src/core/EventBus';
import { LeyLineInstabilityEvent, LeyLineNode } from '../../src/world/leyline/types';
import { GameEvent } from '../../src/core/EventTypes';
import { LeyLineSystem } from '../../src/leyline/LeyLineSystem';

describe('WorldStateManager - Ley Line Instability Propagation', () => {
  let manager: WorldStateManager;
  let eventBus: EventBus;
  let leyLineSystem: LeyLineSystem;
  let events: LeyLineInstabilityEvent[] = [];

  beforeEach(() => {
    eventBus = new EventBus();
    events = [];
    const nodes: LeyLineNode[] = [
      makeLeyLineNode('A', 0, 0, 'active'),
      makeLeyLineNode('B', 1, 0, 'active')
    ];
    const worldState: WorldState = {
      version: 1,
      leyLines: [
        {
          id: 'ley1',
          nodes,
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
    eventBus.on('LEYLINE_INSTABILITY', (event: GameEvent<'LEYLINE_INSTABILITY'>) => {
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
    expect(events.length).toBe(0);
  });
});

describe('WorldStateManager - Edge Cases and Error Handling', () => {
  let manager: WorldStateManager;
  let eventBus: EventBus;
  let events: GameEvent[] = [];

  beforeEach(() => {
    eventBus = new EventBus();
    events = [];
    eventBus.on('STATE_UPDATED', (event) => events.push(event));
    eventBus.on('LEYLINE_INSTABILITY', (event) => events.push(event));
    eventBus.on('NARRATIVE_EVENT', (event) => events.push(event));
    eventBus.on('TECH_LEVEL_ADVANCED', (event) => events.push(event));
    eventBus.on('TECH_LEVEL_REGRESSED', (event) => events.push(event));
  });

  it('handles no ley lines gracefully', () => {
    const worldState: WorldState = {
      version: 1,
      leyLines: [],
      rifts: [],
      players: [],
      economy: { resources: {}, marketPrices: {}, scarcity: {} },
      events: [],
      meta: { online: true, aiAgents: [], mods: [] }
    };
    manager = new WorldStateManager(worldState, eventBus);
    expect(() => manager.handleLeyLineInstability({
      id: 'evt3',
      type: 'LEYLINE_INSTABILITY',
      leyLineId: 'missing',
      nodeId: 'none',
      severity: 'major',
      triggeredBy: 'simulation',
      timestamp: Date.now(),
      branchId: undefined,
      data: {}
    })).not.toThrow();
    expect(events.length).toBe(0);
  });

  it('handles corrupted ley line node (missing state)', () => {
    const corruptedNode: any = { id: 'C', position: { x: 2, y: 2 } };
    const worldState: WorldState = {
      version: 1,
      leyLines: [
        { id: 'ley2', nodes: [corruptedNode], status: 'stable', strength: 100 }
      ],
      rifts: [],
      players: [],
      economy: { resources: {}, marketPrices: {}, scarcity: {} },
      events: [],
      meta: { online: true, aiAgents: [], mods: [] }
    };
    manager = new WorldStateManager(worldState, eventBus);
    expect(manager.getState().leyLines[0].nodes[0].state).toBe('inactive');
  });

  it('emits STATE_UPDATED on updateState', () => {
    const worldState: WorldState = {
      version: 1,
      leyLines: [],
      rifts: [],
      players: [],
      economy: { resources: {}, marketPrices: {}, scarcity: {} },
      events: [],
      meta: { online: true, aiAgents: [], mods: [] }
    };
    manager = new WorldStateManager(worldState, eventBus);
    manager.updateState({ version: 2 });
    expect(events.some(e => e.type === 'STATE_UPDATED')).toBe(true);
  });

  it('throws on invalid world state patch', () => {
    const worldState: WorldState = {
      version: 1,
      leyLines: [],
      rifts: [],
      players: [],
      economy: { resources: {}, marketPrices: {}, scarcity: {} },
      events: [],
      meta: { online: true, aiAgents: [], mods: [] }
    };
    manager = new WorldStateManager(worldState, eventBus);
    expect(() => manager.updateState({ version: undefined as any })).toThrow();
  });

  it('handles world state load with legacy node active property', () => {
    const legacyJson = JSON.stringify({
      version: 1,
      leyLines: [
        { id: 'ley3', nodes: [{ id: 'D', position: { x: 3, y: 3 }, active: true }], status: 'stable', strength: 100 }
      ],
      rifts: [],
      players: [],
      economy: { resources: {}, marketPrices: {}, scarcity: {} },
      events: [],
      meta: { online: true, aiAgents: [], mods: [] }
    });
    const worldState: WorldState = {
      version: 1,
      leyLines: [],
      rifts: [],
      players: [],
      economy: { resources: {}, marketPrices: {}, scarcity: {} },
      events: [],
      meta: { online: true, aiAgents: [], mods: [] }
    };
    manager = new WorldStateManager(worldState, eventBus);
    manager.load(legacyJson);
    expect(manager.getState().leyLines[0].nodes[0].state).toBe('active');
  });

  // Add more edge/circular/catastrophic cases as needed per TestPlan
});
// Ensure all LeyLineNode.state values are 'active', 'inactive', or 'unstable'.
// Factory to guarantee type safety for LeyLineNode in tests
function makeLeyLineNode(id: string, x: number, y: number, state: 'active' | 'inactive' | 'unstable'): LeyLineNode {
  return { id, position: { x, y }, state };
}
