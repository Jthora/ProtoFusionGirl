// ULObservationSystem.test.ts
// Tests for UL exposure/observation system (tasks 5421-5423)

import { EventBus } from '../../src/core/EventBus';
import { ULObservationSystem } from '../../src/ai/ULObservationSystem';

function createTestSetup(configOverrides?: any) {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('UL_EXPOSURE_INCREMENTED', (e) => events.push(e));
  const sys = new ULObservationSystem(eventBus, configOverrides);
  return { eventBus, sys, events };
}

describe('ULObservationSystem', () => {
  it('increments exposure counter on UL use (P3.11)', () => {
    const { sys, events } = createTestSetup();
    const recorded = sys.recordExposure('circle', 100);
    expect(recorded).toBe(true);
    expect(sys.getTotalExposure()).toBe(1);
    expect(events.length).toBe(1);
    expect(events[0].data.totalExposure).toBe(1);
    expect(events[0].data.symbolUsed).toBe('circle');
  });

  it('does not record exposure beyond range', () => {
    const { sys, events } = createTestSetup({ observationRange: 200 });
    const recorded = sys.recordExposure('square', 500);
    expect(recorded).toBe(false);
    expect(sys.getTotalExposure()).toBe(0);
    expect(events).toHaveLength(0);
  });

  it('tracks per-symbol exposure', () => {
    const { sys } = createTestSetup();
    sys.recordExposure('circle', 50);
    sys.recordExposure('circle', 50);
    sys.recordExposure('square', 50);
    expect(sys.getSymbolExposure('circle')).toBe(2);
    expect(sys.getSymbolExposure('square')).toBe(1);
    expect(sys.getSymbolExposure('triangle')).toBe(0);
  });

  it('returns learned symbols above threshold', () => {
    const { sys } = createTestSetup();
    sys.recordExposure('circle', 50);
    sys.recordExposure('circle', 50);
    sys.recordExposure('circle', 50);
    sys.recordExposure('square', 50);
    const learned = sys.getLearnedSymbols(3);
    expect(learned).toContain('circle');
    expect(learned).not.toContain('square');
  });

  it('cumulates total exposure across symbols', () => {
    const { sys } = createTestSetup();
    sys.recordExposure('circle', 50);
    sys.recordExposure('square', 50);
    sys.recordExposure('triangle', 50);
    expect(sys.getTotalExposure()).toBe(3);
  });

  it('destroy resets all state', () => {
    const { sys } = createTestSetup();
    sys.recordExposure('circle', 50);
    sys.destroy();
    expect(sys.getTotalExposure()).toBe(0);
    expect(sys.getSymbolExposure('circle')).toBe(0);
  });
});
