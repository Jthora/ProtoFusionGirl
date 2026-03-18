// ULMasterySystem.test.ts — Tasks 7115, 7124
// Tests: mastery progression, independent attempts, ASI feedback improvement

import { EventBus } from '../../src/core/EventBus';
import { ULMasterySystem, MasteryLevel } from '../../src/ul/ULMasterySystem';

function createSetup() {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('UL_MASTERY_CHANGED', (e) => events.push(e));
  eventBus.on('JANE_UL_ATTEMPT', (e) => events.push(e));
  eventBus.on('ASI_FEEDBACK_GIVEN', (e) => events.push(e));
  const sys = new ULMasterySystem(eventBus);
  return { eventBus, sys, events };
}

describe('ULMasterySystem', () => {
  it('starts with no known symbols', () => {
    const { sys } = createSetup();
    expect(sys.getAllMastery()).toHaveLength(0);
    expect(sys.getKnownSymbols()).toHaveLength(0);
  });

  it('observation advances Unaware → Exposed (1 observation)', () => {
    const { sys } = createSetup();
    sys.recordObservation('heal');
    const m = sys.getMastery('heal')!;
    expect(m.level).toBe(MasteryLevel.Exposed);
    expect(m.observations).toBe(1);
  });

  it('3 observations advance to Familiar (P5.1)', () => {
    const { sys, events } = createSetup();
    sys.recordObservation('heal');
    sys.recordObservation('heal');
    sys.recordObservation('heal');
    const m = sys.getMastery('heal')!;
    expect(m.level).toBe(MasteryLevel.Familiar);
    expect(events.some(e => e.type === 'UL_MASTERY_CHANGED' && e.data.level === MasteryLevel.Familiar)).toBe(true);
  });

  it('Jane cannot attempt below Familiar level', () => {
    const { sys } = createSetup();
    sys.recordObservation('heal'); // Exposed only
    const result = sys.attemptSymbol('heal');
    expect(result).toBe(false);
  });

  it('Jane attempts known symbol after 3 observations (P5.2) — ~50% success', () => {
    const { sys } = createSetup();
    for (let i = 0; i < 3; i++) sys.recordObservation('heal');
    expect(sys.getMastery('heal')!.level).toBe(MasteryLevel.Familiar);

    // Fixed RNG: 0.3 < 0.5 → success
    const success = sys.attemptSymbol('heal', () => 0.3);
    expect(success).toBe(true);
  });

  it('~50% failure rate at Familiar', () => {
    const { sys } = createSetup();
    for (let i = 0; i < 3; i++) sys.recordObservation('heal');

    // Fixed RNG: 0.7 >= 0.5 → failure
    const success = sys.attemptSymbol('heal', () => 0.7);
    expect(success).toBe(false);
  });

  it('emits JANE_UL_ATTEMPT on attempt', () => {
    const { sys, events } = createSetup();
    for (let i = 0; i < 3; i++) sys.recordObservation('heal');
    sys.attemptSymbol('heal', () => 0.3);
    const attempt = events.find(e => e.type === 'JANE_UL_ATTEMPT');
    expect(attempt).toBeDefined();
    expect(attempt.data.symbol).toBe('heal');
    expect(attempt.data.success).toBe(true);
  });

  it('2 successes advance to Competent (0.75 success rate)', () => {
    const { sys } = createSetup();
    for (let i = 0; i < 3; i++) sys.recordObservation('heal');
    sys.attemptSymbol('heal', () => 0.1); // success 1
    sys.attemptSymbol('heal', () => 0.1); // success 2
    expect(sys.getMastery('heal')!.level).toBe(MasteryLevel.Competent);
    expect(sys.getSuccessRate(sys.getMastery('heal')!)).toBe(0.75);
  });

  it('5 successes advance to Mastered (0.95 success rate)', () => {
    const { sys } = createSetup();
    for (let i = 0; i < 3; i++) sys.recordObservation('heal');
    for (let i = 0; i < 5; i++) sys.attemptSymbol('heal', () => 0.1);
    expect(sys.getMastery('heal')!.level).toBe(MasteryLevel.Mastered);
    expect(sys.getSuccessRate(sys.getMastery('heal')!)).toBe(0.95);
  });

  it('positive feedback improves next attempt success rate (P5.3)', () => {
    const { sys, events } = createSetup();
    for (let i = 0; i < 3; i++) sys.recordObservation('heal');

    const rateBeforeFeedback = sys.getSuccessRate(sys.getMastery('heal')!);
    expect(rateBeforeFeedback).toBe(0.5);

    sys.applyFeedback(true);
    const rateAfterFeedback = sys.getSuccessRate(sys.getMastery('heal')!);
    expect(rateAfterFeedback).toBe(0.6); // 0.5 + 0.1

    expect(events.some(e => e.type === 'ASI_FEEDBACK_GIVEN' && e.data.positive === true)).toBe(true);
  });

  it('multiple feedbacks stack', () => {
    const { sys } = createSetup();
    for (let i = 0; i < 3; i++) sys.recordObservation('heal');

    sys.applyFeedback(true);
    sys.applyFeedback(true);
    sys.applyFeedback(true);
    const rate = sys.getSuccessRate(sys.getMastery('heal')!);
    expect(rate).toBe(0.8); // 0.5 + 3*0.1
  });

  it('success rate caps at 0.99', () => {
    const { sys } = createSetup();
    for (let i = 0; i < 3; i++) sys.recordObservation('heal');
    for (let i = 0; i < 10; i++) sys.applyFeedback(true);
    const rate = sys.getSuccessRate(sys.getMastery('heal')!);
    expect(rate).toBe(0.99);
  });

  it('negative feedback does not increase count', () => {
    const { sys } = createSetup();
    sys.applyFeedback(false);
    expect(sys.getFeedbackCount()).toBe(0);
    sys.applyFeedback(true);
    expect(sys.getFeedbackCount()).toBe(1);
  });

  it('getKnownSymbols returns only Familiar+ symbols', () => {
    const { sys } = createSetup();
    sys.recordObservation('heal'); // Exposed
    for (let i = 0; i < 3; i++) sys.recordObservation('shield');
    expect(sys.getKnownSymbols()).toEqual(['shield']);
  });
});
