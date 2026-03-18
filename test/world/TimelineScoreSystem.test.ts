// TimelineScoreSystem.test.ts — Task 7413
// Tests: score reflects cumulative decisions (P5.6)

import { EventBus } from '../../src/core/EventBus';
import { TimelineScoreSystem } from '../../src/world/TimelineScoreSystem';

function createSetup() {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('TIMELINE_SCORE_UPDATED', (e) => events.push(e));
  const sys = new TimelineScoreSystem(eventBus);
  return { eventBus, sys, events };
}

describe('TimelineScoreSystem', () => {
  it('perfect run scores close to 100', () => {
    const { sys, events } = createSetup();
    const score = sys.calculate({
      averageStability: 100,
      allyCount: 2,
      riftsSealed: 4,
      activeRifts: 0,
      deathCount: 0,
      trustLevel: 100,
      masteredSymbols: 5,
    });
    expect(score.total).toBeGreaterThanOrEqual(90);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(events[0].data.total).toBe(score.total);
  });

  it('deaths reduce score (P5.6)', () => {
    const { sys } = createSetup();
    const noDeaths = sys.calculate({
      averageStability: 80, allyCount: 3, riftsSealed: 5,
      activeRifts: 0, deathCount: 0, trustLevel: 80, masteredSymbols: 3,
    });
    const withDeaths = sys.calculate({
      averageStability: 80, allyCount: 3, riftsSealed: 5,
      activeRifts: 0, deathCount: 3, trustLevel: 80, masteredSymbols: 3,
    });
    expect(withDeaths.total).toBeLessThan(noDeaths.total);
  });

  it('active rifts reduce score', () => {
    const { sys } = createSetup();
    const noRifts = sys.calculate({
      averageStability: 80, allyCount: 3, riftsSealed: 5,
      activeRifts: 0, deathCount: 0, trustLevel: 80, masteredSymbols: 3,
    });
    const withRifts = sys.calculate({
      averageStability: 80, allyCount: 3, riftsSealed: 5,
      activeRifts: 5, deathCount: 0, trustLevel: 80, masteredSymbols: 3,
    });
    expect(withRifts.total).toBeLessThan(noRifts.total);
  });

  it('more allies and trust increase score', () => {
    const { sys } = createSetup();
    const lowAlly = sys.calculate({
      averageStability: 50, allyCount: 0, riftsSealed: 0,
      activeRifts: 0, deathCount: 0, trustLevel: 0, masteredSymbols: 0,
    });
    const highAlly = sys.calculate({
      averageStability: 50, allyCount: 5, riftsSealed: 0,
      activeRifts: 0, deathCount: 0, trustLevel: 100, masteredSymbols: 0,
    });
    expect(highAlly.total).toBeGreaterThan(lowAlly.total);
  });

  it('score is always between 0 and 100', () => {
    const { sys } = createSetup();
    const min = sys.calculate({
      averageStability: 0, allyCount: 0, riftsSealed: 0,
      activeRifts: 10, deathCount: 10, trustLevel: 0, masteredSymbols: 0,
    });
    expect(min.total).toBeGreaterThanOrEqual(0);
    expect(min.total).toBeLessThanOrEqual(100);
  });

  it('emits TIMELINE_SCORE_UPDATED', () => {
    const { sys, events } = createSetup();
    sys.calculate({
      averageStability: 50, allyCount: 2, riftsSealed: 3,
      activeRifts: 1, deathCount: 1, trustLevel: 50, masteredSymbols: 1,
    });
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('TIMELINE_SCORE_UPDATED');
  });
});
