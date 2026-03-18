// RefusalSystem.test.ts
// Tests for Jane's guidance refusal system (tasks 5431-5434)

import { EventBus } from '../../src/core/EventBus';
import { RefusalSystem, GuidanceContext } from '../../src/ai/RefusalSystem';

function createTestSetup(configOverrides?: any) {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('JANE_REFUSED_GUIDANCE', (e) => events.push(e));
  const sys = new RefusalSystem(eventBus, configOverrides);
  return { eventBus, sys, events };
}

describe('RefusalSystem', () => {
  it('refuses when low health and enemies present (P3.13)', () => {
    const { sys, events } = createTestSetup();
    const ctx: GuidanceContext = {
      targetX: 100, targetY: 100,
      janeHealth: 15, janeMaxHealth: 100, // 15% health
      nearbyEnemyCount: 3,
      nearestRiftDistance: null,
      guidanceType: 'waypoint',
    };
    const result = sys.evaluate(ctx);
    expect(result.refused).toBe(true);
    expect(result.reason).toBe('too_dangerous_low_health');
    expect(events.length).toBe(1);
  });

  it('refuses when near rift', () => {
    const { sys } = createTestSetup();
    const ctx: GuidanceContext = {
      targetX: 100, targetY: 100,
      janeHealth: 80, janeMaxHealth: 100,
      nearbyEnemyCount: 0,
      nearestRiftDistance: 50, // within default 100 range
      guidanceType: 'waypoint',
    };
    const result = sys.evaluate(ctx);
    expect(result.refused).toBe(true);
    expect(result.reason).toBe('rift_proximity');
  });

  it('refuses when too many enemies', () => {
    const { sys } = createTestSetup();
    const ctx: GuidanceContext = {
      targetX: 100, targetY: 100,
      janeHealth: 80, janeMaxHealth: 100,
      nearbyEnemyCount: 5, // matches default threshold
      nearestRiftDistance: null,
      guidanceType: 'waypoint',
    };
    const result = sys.evaluate(ctx);
    expect(result.refused).toBe(true);
    expect(result.reason).toBe('too_many_enemies');
  });

  it('accepts safe guidance', () => {
    const { sys, events } = createTestSetup();
    const ctx: GuidanceContext = {
      targetX: 100, targetY: 100,
      janeHealth: 80, janeMaxHealth: 100,
      nearbyEnemyCount: 1,
      nearestRiftDistance: 500,
      guidanceType: 'waypoint',
    };
    const result = sys.evaluate(ctx);
    expect(result.refused).toBe(false);
    expect(result.reason).toBeNull();
    expect(events).toHaveLength(0);
  });

  it('low health without enemies is not refused', () => {
    const { sys } = createTestSetup();
    const ctx: GuidanceContext = {
      targetX: 100, targetY: 100,
      janeHealth: 10, janeMaxHealth: 100,
      nearbyEnemyCount: 0,
      nearestRiftDistance: null,
      guidanceType: 'waypoint',
    };
    const result = sys.evaluate(ctx);
    expect(result.refused).toBe(false);
  });

  it('provides dialogue for refusal reasons', () => {
    const { sys } = createTestSetup();
    expect(sys.getDialogue('too_dangerous_low_health')).toContain('hurt');
    expect(sys.getDialogue('rift_proximity')).toContain('rift');
    expect(sys.getDialogue('too_many_enemies')).toContain('death trap');
    expect(sys.getDialogue('unknown_reason')).toContain("doesn't feel right");
  });
});
