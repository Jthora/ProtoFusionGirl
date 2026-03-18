// BoostSystem.test.ts
// Tests for speed boost system (tasks 5441-5444)

import { EventBus } from '../../src/core/EventBus';
import { BoostSystem } from '../../src/navigation/BoostSystem';

function createTestSetup(configOverrides?: any) {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('BOOST_ACTIVATED', (e) => events.push(e));
  eventBus.on('BOOST_COOLDOWN_STARTED', (e) => events.push(e));
  const sys = new BoostSystem(eventBus, configOverrides);
  return { eventBus, sys, events };
}

describe('BoostSystem', () => {
  it('activates boost and emits event (P3.15)', () => {
    const { sys, events } = createTestSetup({ durationMs: 2000, cooldownMs: 5000, energyCost: 10 });
    const result = sys.activate(50);
    expect(result).toBe(true);
    expect(sys.isBoosting()).toBe(true);
    expect(sys.getSpeedMultiplier()).toBe(2.0);
    expect(events.some(e => e.type === 'BOOST_ACTIVATED')).toBe(true);
  });

  it('boost expires after duration', () => {
    const { sys, events } = createTestSetup({ durationMs: 2000, cooldownMs: 5000, energyCost: 10 });
    sys.activate(50);
    sys.update(2100);
    expect(sys.isBoosting()).toBe(false);
    expect(sys.getSpeedMultiplier()).toBe(1.0);
    expect(events.some(e => e.type === 'BOOST_COOLDOWN_STARTED')).toBe(true);
  });

  it('cooldown prevents re-activation', () => {
    const { sys } = createTestSetup({ durationMs: 1000, cooldownMs: 5000, energyCost: 10 });
    sys.activate(50);
    sys.update(1100); // boost ends
    expect(sys.isOnCooldown()).toBe(true);
    expect(sys.activate(50)).toBe(false);
  });

  it('can activate again after cooldown', () => {
    const { sys, events } = createTestSetup({ durationMs: 1000, cooldownMs: 3000, energyCost: 10 });
    sys.activate(50);
    sys.update(1100); // boost ends, cooldown starts
    sys.update(3100); // cooldown expires
    expect(sys.isOnCooldown()).toBe(false);
    expect(sys.activate(50)).toBe(true);
    expect(events.filter(e => e.type === 'BOOST_ACTIVATED')).toHaveLength(2);
  });

  it('fails if insufficient energy', () => {
    const { sys } = createTestSetup({ energyCost: 20 });
    expect(sys.activate(10)).toBe(false);
    expect(sys.isBoosting()).toBe(false);
  });

  it('fails if already boosting', () => {
    const { sys } = createTestSetup({ durationMs: 5000, energyCost: 10 });
    sys.activate(50);
    expect(sys.activate(50)).toBe(false);
  });

  it('tracks cooldown remaining', () => {
    const { sys } = createTestSetup({ durationMs: 1000, cooldownMs: 5000, energyCost: 10 });
    sys.activate(50);
    sys.update(1100);
    expect(sys.getCooldownRemaining()).toBeGreaterThan(0);
    sys.update(5000);
    expect(sys.getCooldownRemaining()).toBe(0);
  });

  it('energy cost is accessible', () => {
    const { sys } = createTestSetup({ energyCost: 25 });
    expect(sys.getEnergyCost()).toBe(25);
  });

  it('destroy resets state', () => {
    const { sys } = createTestSetup({ durationMs: 5000, energyCost: 10 });
    sys.activate(50);
    sys.destroy();
    expect(sys.isBoosting()).toBe(false);
    expect(sys.isOnCooldown()).toBe(false);
  });
});
