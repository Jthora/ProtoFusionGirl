// Automated tests for Universal Language (UL) runtime engine
// Covers encoding, decoding, validation, animation mapping, and event integration

import { encodeULExpression, decodeULExpression, validateULSequence, getAnimationSequence, streamULFeedback, triggerULAnimationEvents } from '../ulEngine';

describe('UL Engine', () => {
  it('encodes a valid sequence to ULExpression', () => {
    const expr = encodeULExpression(['spin', 'arm_wave']);
    expect(expr.valid).toBe(true);
    expect(expr.predicates).toEqual(['circle(c)', 'wave(w)']);
  });

  it('decodes a ULExpression to primitives', () => {
    const sequence = decodeULExpression({ predicates: ['triangle(t)', 'circle(c)'], valid: true });
    expect(sequence).toEqual(['step_sequence_triangle', 'spin']);
  });

  it('validates repetition limit', () => {
    const result = validateULSequence(['spin', 'spin', 'spin', 'spin']);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('EXCEEDS_REPETITION_LIMIT');
  });

  it('maps ULExpression to animation sequence', () => {
    const expr = encodeULExpression(['spin', 'arm_wave']);
    const anims = getAnimationSequence(expr);
    expect(anims).toEqual(['spin_360', 'wave_arm']);
  });

  it('streams feedback for a valid sequence', () => {
    const feedback = streamULFeedback(['spin', 'arm_wave']);
    expect(feedback[0].valid).toBe(true);
    expect(feedback[1].valid).toBe(true);
  });

  it('streams feedback for an invalid sequence', () => {
    const feedback = streamULFeedback(['spin', 'spin', 'spin', 'spin']);
    expect(feedback[3].valid).toBe(false);
    expect(feedback[3].hint).toBe('EXCEEDS_REPETITION_LIMIT');
  });

  it('emits animation and feedback events via EventBus', () => {
    const events: any[] = [];
    const mockBus = { emit: (event: any) => events.push(event) };
    const expr = encodeULExpression(['spin', 'arm_wave']);
    triggerULAnimationEvents(expr, mockBus, { playerId: 'test', feedback: true });
    expect(events.find(e => e.type === 'UL_ANIMATION')).toBeTruthy();
    expect(events.find(e => e.type === 'UL_FEEDBACK')).toBeTruthy();
  });
});
