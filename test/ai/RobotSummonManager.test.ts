// RobotSummonManager.test.ts
// Tests for robot summoning system (tasks 5231-5233)

import { EventBus } from '../../src/core/EventBus';
import { RobotSummonManager, SummonableRobot } from '../../src/ai/RobotSummonManager';

function createTestSetup() {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('ROBOT_SUMMONED', (e) => events.push(e));
  const mgr = new RobotSummonManager(eventBus);
  return { eventBus, mgr, events };
}

const testRobot: SummonableRobot = {
  id: 'terra',
  type: 'hero_robot',
  name: 'Terra',
  cooldownMs: 5000,
};

describe('RobotSummonManager', () => {
  it('befriends and summons a robot', () => {
    const { mgr, events } = createTestSetup();
    mgr.befriend(testRobot);
    const result = mgr.summon('terra', 100, 200);
    expect(result).toBe(true);
    expect(events.length).toBe(1);
    expect(events[0].data.robotId).toBe('terra');
    expect(events[0].data.x).toBe(100);
  });

  it('cannot summon unregistered robot', () => {
    const { mgr } = createTestSetup();
    expect(mgr.summon('unknown', 0, 0)).toBe(false);
  });

  it('respects cooldown', () => {
    const { mgr } = createTestSetup();
    mgr.befriend(testRobot);
    mgr.summon('terra', 0, 0);
    expect(mgr.summon('terra', 0, 0)).toBe(false); // on cooldown
    expect(mgr.getCooldown('terra')).toBeGreaterThan(0);
  });

  it('cooldown decreases with update', () => {
    const { mgr } = createTestSetup();
    mgr.befriend(testRobot);
    mgr.summon('terra', 0, 0);
    mgr.update(3000);
    expect(mgr.getCooldown('terra')).toBeLessThanOrEqual(2000);
    mgr.update(3000);
    expect(mgr.getCooldown('terra')).toBe(0);
  });

  it('can summon again after cooldown expires', () => {
    const { mgr, events } = createTestSetup();
    mgr.befriend(testRobot);
    mgr.summon('terra', 0, 0);
    mgr.update(5000);
    const result = mgr.summon('terra', 50, 50);
    expect(result).toBe(true);
    expect(events.length).toBe(2);
  });

  it('tracks befriended robots', () => {
    const { mgr } = createTestSetup();
    expect(mgr.isBefriended('terra')).toBe(false);
    mgr.befriend(testRobot);
    expect(mgr.isBefriended('terra')).toBe(true);
    expect(mgr.getBefriended()).toHaveLength(1);
  });

  it('destroy clears state', () => {
    const { mgr } = createTestSetup();
    mgr.befriend(testRobot);
    mgr.destroy();
    expect(mgr.isBefriended('terra')).toBe(false);
  });
});
