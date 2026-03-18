// ULMiscommunication.test.ts — Task 7133
// Tests: miscommunication outcomes, hostile aggression

import { EventBus } from '../../src/core/EventBus';
import { ULMiscommunication } from '../../src/ul/ULMiscommunication';

function createSetup() {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('UL_MISCOMMUNICATION', (e) => events.push(e));
  const sys = new ULMiscommunication(eventBus);
  return { eventBus, sys, events };
}

describe('ULMiscommunication', () => {
  it('returns a valid outcome for any combination', () => {
    const { sys } = createSetup();
    const result = sys.resolve('robot1', 'wrong_symbol', 'neutral', 'minor', () => 0.5);
    expect(result.outcome).toBeDefined();
    expect(result.targetId).toBe('robot1');
    expect(result.attemptedSymbol).toBe('wrong_symbol');
    expect(result.description.length).toBeGreaterThan(0);
  });

  it('hostile + major → aggression (P5.4)', () => {
    const { sys, events } = createSetup();
    // hostile_major table: ['aggression', 'aggression', 'backfire']
    // rng=0 → index 0 → aggression
    const result = sys.resolve('robot1', 'bad_symbol', 'hostile', 'major', () => 0);
    expect(result.outcome).toBe('aggression');

    // rng=0.5 → index 1 → aggression
    const result2 = sys.resolve('robot2', 'bad_symbol', 'hostile', 'major', () => 0.5);
    expect(result2.outcome).toBe('aggression');
  });

  it('hostile + minor can produce aggression', () => {
    const { sys } = createSetup();
    // hostile_minor table: ['aggression', 'confusion', 'flee']
    // rng=0 → index 0 → aggression
    const result = sys.resolve('robot1', 'bad_symbol', 'hostile', 'minor', () => 0);
    expect(result.outcome).toBe('aggression');
  });

  it('friendly + minor → partial_success or confusion (never aggression first)', () => {
    const { sys } = createSetup();
    // friendly_minor: ['partial_success', 'confusion', 'partial_success']
    const result = sys.resolve('npc1', 'wrong_mod', 'friendly', 'minor', () => 0);
    expect(result.outcome).toBe('partial_success');
  });

  it('emits UL_MISCOMMUNICATION event', () => {
    const { sys, events } = createSetup();
    sys.resolve('robot1', 'bad', 'neutral', 'major', () => 0);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('UL_MISCOMMUNICATION');
    expect(events[0].data.outcome).toBeDefined();
  });

  it('hostile + major rng=0.9 → backfire', () => {
    const { sys } = createSetup();
    // hostile_major: ['aggression', 'aggression', 'backfire']
    // rng=0.9 → index 2 → backfire
    const result = sys.resolve('robot1', 'bad', 'hostile', 'major', () => 0.9);
    expect(result.outcome).toBe('backfire');
  });

  it('neutral + minor → confusion or partial_success', () => {
    const { sys } = createSetup();
    // neutral_minor: ['confusion', 'partial_success', 'confusion']
    const result = sys.resolve('npc1', 'bad', 'neutral', 'minor', () => 0.4);
    expect(['confusion', 'partial_success']).toContain(result.outcome);
  });
});
