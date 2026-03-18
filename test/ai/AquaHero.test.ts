// AquaHero.test.ts — Task 7224
// Tests: discover, repair, heal ally, auto-heal, join squad

import { EventBus } from '../../src/core/EventBus';
import { AquaHero } from '../../src/ai/AquaHero';

function createSetup() {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('COMPANION_SPAWNED', (e) => events.push(e));
  eventBus.on('JANE_STATE_CHANGED', (e) => events.push(e));
  const aqua = new AquaHero(eventBus, { healAmount: 10, healCooldownMs: 1000 });
  return { eventBus, aqua, events };
}

describe('AquaHero', () => {
  it('starts undiscovered and unrepaired', () => {
    const { aqua } = createSetup();
    expect(aqua.isDiscovered()).toBe(false);
    expect(aqua.isRepaired()).toBe(false);
  });

  it('discover emits COMPANION_SPAWNED (P5.8)', () => {
    const { aqua, events } = createSetup();
    aqua.discover();
    expect(aqua.isDiscovered()).toBe(true);
    expect(events.some(e => e.type === 'COMPANION_SPAWNED' && e.data.companionId === 'aqua')).toBe(true);
  });

  it('cannot repair before discovery', () => {
    const { aqua } = createSetup();
    expect(aqua.repair()).toBe(false);
    expect(aqua.isRepaired()).toBe(false);
  });

  it('repair after discovery activates companion', () => {
    const { aqua } = createSetup();
    aqua.discover();
    expect(aqua.repair()).toBe(true);
    expect(aqua.isRepaired()).toBe(true);
  });

  it('healAlly heals when ally HP below threshold', () => {
    const { aqua } = createSetup();
    aqua.discover();
    aqua.repair();
    const healed = aqua.healAlly(30, 100); // 0.3 < 0.6 threshold
    expect(healed).toBe(10); // healAmount
  });

  it('healAlly does not heal when ally HP above threshold', () => {
    const { aqua } = createSetup();
    aqua.discover();
    aqua.repair();
    const healed = aqua.healAlly(80, 100); // 0.8 >= 0.6
    expect(healed).toBe(0);
  });

  it('heal respects cooldown', () => {
    const { aqua } = createSetup();
    aqua.discover();
    aqua.repair();
    aqua.healAlly(30, 100); // first heal
    const second = aqua.healAlly(30, 100); // should be on cooldown
    expect(second).toBe(0);
  });

  it('cooldown expires after update', () => {
    const { aqua } = createSetup();
    aqua.discover();
    aqua.repair();
    aqua.healAlly(30, 100);
    aqua.update(1001, 0, 0); // advance past 1000ms cooldown
    const healed = aqua.healAlly(30, 100);
    expect(healed).toBe(10);
  });

  it('cannot heal when not repaired', () => {
    const { aqua } = createSetup();
    aqua.discover();
    // not repaired
    const healed = aqua.healAlly(30, 100);
    expect(healed).toBe(0);
  });

  it('autoHealCheck delegates to healAlly', () => {
    const { aqua } = createSetup();
    aqua.discover();
    aqua.repair();
    const healed = aqua.autoHealCheck(20, 100);
    expect(healed).toBe(10);
  });

  it('discoveryNodeId defaults to ley_nexus', () => {
    const { aqua } = createSetup();
    expect(aqua.getDiscoveryNodeId()).toBe('ley_nexus');
  });
});
