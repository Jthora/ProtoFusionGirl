// CosmicCalendar.test.ts
// Tests for 12-phase cosmic calendar (tasks 6211-6214, 7231-7233)

import { EventBus } from '../../src/core/EventBus';
import { CosmicCalendar, PHASE_ORDER, PHASE_WEIGHTS, SECONDS_PER_DAY } from '../../src/world/CosmicCalendar';

function createSetup(secondsPerDay = 10) {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('COSMIC_DAY_CHANGED', (e) => events.push(e));
  eventBus.on('COSMIC_PHASE_CHANGED', (e) => events.push(e));
  const cal = new CosmicCalendar(eventBus, secondsPerDay);
  return { eventBus, cal, events };
}

describe('CosmicCalendar', () => {
  it('starts at day 0, Fire phase', () => {
    const { cal } = createSetup();
    expect(cal.getDay()).toBe(0);
    expect(cal.getPhase()).toBe('Fire');
  });

  it('advances day when enough time passes', () => {
    const { cal, events } = createSetup(10); // 10 sec per day
    cal.update(10_000); // 10 seconds = 1 day
    expect(cal.getDay()).toBe(1);
    expect(events.some(e => e.type === 'COSMIC_DAY_CHANGED')).toBe(true);
  });

  it('cycles through 12 phases and wraps (P5.9)', () => {
    const { cal } = createSetup(10);
    expect(cal.getPhase()).toBe('Fire');    // day 0
    cal.update(10_000); // day 1
    expect(cal.getPhase()).toBe('Earth');
    cal.update(10_000); // day 2
    expect(cal.getPhase()).toBe('Air');
    cal.update(10_000); // day 3
    expect(cal.getPhase()).toBe('Water');
    cal.update(10_000); // day 4
    expect(cal.getPhase()).toBe('Lightning');
    cal.update(10_000); // day 5
    expect(cal.getPhase()).toBe('Ice');
    cal.update(10_000); // day 6
    expect(cal.getPhase()).toBe('Void');
    cal.update(10_000); // day 7
    expect(cal.getPhase()).toBe('Light');
    cal.update(10_000); // day 8
    expect(cal.getPhase()).toBe('Shadow');
    cal.update(10_000); // day 9
    expect(cal.getPhase()).toBe('Growth');
    cal.update(10_000); // day 10
    expect(cal.getPhase()).toBe('Decay');
    cal.update(10_000); // day 11
    expect(cal.getPhase()).toBe('Harmony');
    cal.update(10_000); // day 12
    expect(cal.getPhase()).toBe('Fire'); // wraps
  });

  it('emits COSMIC_PHASE_CHANGED when phase changes', () => {
    const { cal, events } = createSetup(10);
    cal.update(10_000); // Fire→Earth
    const phaseEvent = events.find(e => e.type === 'COSMIC_PHASE_CHANGED');
    expect(phaseEvent).toBeDefined();
    expect(phaseEvent.data.previousPhase).toBe('Fire');
    expect(phaseEvent.data.newPhase).toBe('Earth');
  });

  it('does not emit phase change within same phase', () => {
    const { cal, events } = createSetup(10);
    cal.update(5_000); // half day, still day 0
    expect(events.filter(e => e.type === 'COSMIC_PHASE_CHANGED')).toHaveLength(0);
  });

  it('getWeight returns phase-specific event weights', () => {
    const { cal } = createSetup(10);
    // Day 0 = Fire phase
    expect(cal.getWeight('combat')).toBe(PHASE_WEIGHTS.Fire.combat);
    expect(cal.getWeight('diplomacy')).toBe(PHASE_WEIGHTS.Fire.diplomacy);
    // Unknown event type → 1.0
    expect(cal.getWeight('unknown_type')).toBe(1.0);
  });

  it('phase weights shift event generation (P4.2)', () => {
    const { cal } = createSetup(10);
    // Fire: combat 1.5, diplomacy 0.7
    expect(cal.getWeight('combat')).toBeGreaterThan(1.0);
    expect(cal.getWeight('diplomacy')).toBeLessThan(1.0);

    cal.update(10_000); // Earth: combat 0.8, diplomacy 1.3
    expect(cal.getWeight('combat')).toBeLessThan(1.0);
    expect(cal.getWeight('diplomacy')).toBeGreaterThan(1.0);
  });

  it('getPhaseWeights returns all weights for current phase', () => {
    const { cal } = createSetup();
    const weights = cal.getPhaseWeights();
    expect(weights).toHaveProperty('combat');
    expect(weights).toHaveProperty('surge');
    expect(weights).toHaveProperty('diplomacy');
  });

  it('destroy resets state', () => {
    const { cal } = createSetup(10);
    cal.update(30_000); // advance 3 days
    cal.destroy();
    expect(cal.getDay()).toBe(0);
    expect(cal.getElapsedSeconds()).toBe(0);
  });
});
