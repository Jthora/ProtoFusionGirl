// EmergentEventGenerator.test.ts
// Tests for emergent event generators (tasks 5321-5324)

import { EventBus } from '../../src/core/EventBus';
import { EmergentEventGenerator, WorldSnapshot } from '../../src/world/EmergentEventGenerator';

function createTestSetup(configOverrides?: any) {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('SURGE_GENERATED', (e) => events.push(e));
  eventBus.on('DISTRESS_SIGNAL', (e) => events.push(e));
  const gen = new EmergentEventGenerator(eventBus, configOverrides);
  return { eventBus, gen, events };
}

const stableSnapshot: WorldSnapshot = {
  nodeStabilities: [{ nodeId: 'node1', stability: 80 }],
  companionHealths: [{ id: 'terra', health: 100, maxHealth: 100, x: 0, y: 0 }],
  activeRiftCount: 0,
};

const unstableSnapshot: WorldSnapshot = {
  nodeStabilities: [{ nodeId: 'node3', stability: 15 }],
  companionHealths: [{ id: 'terra', health: 100, maxHealth: 100, x: 0, y: 0 }],
  activeRiftCount: 1,
};

const distressSnapshot: WorldSnapshot = {
  nodeStabilities: [{ nodeId: 'node1', stability: 50 }],
  companionHealths: [{ id: 'terra', health: 10, maxHealth: 100, x: 200, y: 300 }],
  activeRiftCount: 0,
};

describe('EmergentEventGenerator', () => {
  it('generates surge event for low stability node', () => {
    const { gen, events } = createTestSetup({ surgeCheckIntervalMs: 100 });
    gen.update(150, unstableSnapshot);
    const surges = events.filter(e => e.type === 'SURGE_GENERATED');
    expect(surges.length).toBeGreaterThan(0);
    expect(surges[0].data.nodeId).toBe('node3');
    expect(surges[0].data.intensity).toBe(85); // 100 - 15
  });

  it('does not generate surge for stable node', () => {
    const { gen, events } = createTestSetup({ surgeCheckIntervalMs: 100 });
    gen.update(150, stableSnapshot);
    expect(events.filter(e => e.type === 'SURGE_GENERATED')).toHaveLength(0);
  });

  it('generates distress signal for low health companion (P3.10)', () => {
    const { gen, events } = createTestSetup({ surgeCheckIntervalMs: 100 });
    gen.update(150, distressSnapshot);
    const distress = events.filter(e => e.type === 'DISTRESS_SIGNAL');
    expect(distress.length).toBeGreaterThan(0);
    expect(distress[0].data.sourceId).toBe('terra');
    expect(distress[0].data.reason).toBe('low_health');
  });

  it('does not generate distress for healthy companion', () => {
    const { gen, events } = createTestSetup({ surgeCheckIntervalMs: 100 });
    gen.update(150, stableSnapshot);
    expect(events.filter(e => e.type === 'DISTRESS_SIGNAL')).toHaveLength(0);
  });

  it('respects check interval timing', () => {
    const { gen, events } = createTestSetup({ surgeCheckIntervalMs: 5000 });
    gen.update(1000, unstableSnapshot); // not enough time
    expect(events).toHaveLength(0);
    gen.update(4500, unstableSnapshot); // now exceeds 5000ms total
    expect(events.length).toBeGreaterThan(0);
  });
});
