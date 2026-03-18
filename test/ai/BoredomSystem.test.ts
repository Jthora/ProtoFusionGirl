// BoredomSystem.test.ts
// Tests for Jane boredom/wander behavior (tasks 5411-5413)

import { EventBus } from '../../src/core/EventBus';
import { BoredomSystem } from '../../src/ai/BoredomSystem';

function createTestSetup(configOverrides?: any) {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('JANE_BOREDOM_TRIGGERED', (e) => events.push(e));
  eventBus.on('JANE_WANDER_STARTED', (e) => events.push(e));
  const sys = new BoredomSystem(eventBus, configOverrides);
  return { eventBus, sys, events };
}

describe('BoredomSystem', () => {
  it('triggers boredom after idle threshold (P3.12)', () => {
    const { sys, events } = createTestSetup({ boredomThresholdMs: 1000 });
    const result = sys.update(1100, 100, 100);
    expect(result).not.toBeNull();
    expect(result!.wanderX).toBeDefined();
    expect(result!.wanderY).toBeDefined();
    expect(sys.isBored()).toBe(true);
    expect(events.some(e => e.type === 'JANE_BOREDOM_TRIGGERED')).toBe(true);
    expect(events.some(e => e.type === 'JANE_WANDER_STARTED')).toBe(true);
  });

  it('does not trigger before threshold', () => {
    const { sys, events } = createTestSetup({ boredomThresholdMs: 5000 });
    const result = sys.update(2000, 100, 100);
    expect(result).toBeNull();
    expect(sys.isBored()).toBe(false);
    expect(events).toHaveLength(0);
  });

  it('activity resets idle timer', () => {
    const { sys } = createTestSetup({ boredomThresholdMs: 3000 });
    sys.update(2000, 100, 100); // 2s idle
    sys.recordActivity(); // reset
    const result = sys.update(2000, 100, 100); // only 2s since activity
    expect(result).toBeNull();
    expect(sys.isBored()).toBe(false);
  });

  it('wander target is within radius', () => {
    const { sys } = createTestSetup({ boredomThresholdMs: 100, wanderRadius: 150 });
    const result = sys.update(200, 500, 500);
    expect(result).not.toBeNull();
    const dx = result!.wanderX - 500;
    const dy = result!.wanderY - 500;
    const dist = Math.sqrt(dx * dx + dy * dy);
    expect(dist).toBeLessThanOrEqual(150);
  });

  it('only triggers once per idle period', () => {
    const { sys, events } = createTestSetup({ boredomThresholdMs: 100 });
    sys.update(200, 100, 100);
    sys.update(200, 100, 100); // already bored, should not re-trigger
    expect(events.filter(e => e.type === 'JANE_BOREDOM_TRIGGERED')).toHaveLength(1);
  });

  it('tracks idle time', () => {
    const { sys } = createTestSetup();
    sys.update(5000, 0, 0);
    expect(sys.getIdleTime()).toBe(5000);
  });

  it('reset clears state', () => {
    const { sys } = createTestSetup({ boredomThresholdMs: 100 });
    sys.update(200, 0, 0);
    expect(sys.isBored()).toBe(true);
    sys.reset();
    expect(sys.isBored()).toBe(false);
    expect(sys.getIdleTime()).toBe(0);
  });
});
