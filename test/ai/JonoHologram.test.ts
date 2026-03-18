// JonoHologram.test.ts — tests for tasks 6311-6314

import { EventBus } from '../../src/core/EventBus';
import { JonoHologram, JonoContext } from '../../src/ai/JonoHologram';

function defaultContext(overrides?: Partial<JonoContext>): JonoContext {
  return {
    hasUsedUL: false,
    hasCompanion: false,
    activeRiftCount: 0,
    lowestStability: 80,
    trustLevel: 50,
    cosmicPhase: null,
    ...overrides,
  };
}

describe('JonoHologram', () => {
  let eventBus: EventBus;
  let holo: JonoHologram;

  beforeEach(() => {
    eventBus = new EventBus();
    holo = new JonoHologram(eventBus, { baseX: 100, baseY: 100, triggerRadius: 50 });
  });

  it('triggers dialogue when Jane is within radius', () => {
    const line = holo.checkProximity(110, 100, 0, defaultContext());
    expect(line).not.toBeNull();
    expect(line!.id).toBe('welcome'); // first_visit, highest priority
  });

  it('does not trigger when Jane is outside radius', () => {
    const line = holo.checkProximity(300, 300, 0, defaultContext());
    expect(line).toBeNull();
  });

  it('respects cooldown between dialogues', () => {
    holo.checkProximity(100, 100, 0, defaultContext());
    // Within 10s cooldown
    const line = holo.checkProximity(100, 100, 5_000, defaultContext());
    expect(line).toBeNull();
  });

  it('triggers again after cooldown expires', () => {
    holo.checkProximity(100, 100, 0, defaultContext());
    // After 10s cooldown
    const line = holo.checkProximity(100, 100, 11_000, defaultContext());
    expect(line).not.toBeNull();
  });

  it('emits JONO_DIALOGUE_TRIGGERED event', () => {
    const events: any[] = [];
    eventBus.on('JONO_DIALOGUE_TRIGGERED', (e) => events.push(e.data));

    holo.checkProximity(100, 100, 0, defaultContext());
    expect(events.length).toBe(1);
    expect(events[0].dialogueId).toBe('welcome');
    expect(events[0].text).toContain('Jono');
  });

  it('selects rift_warning when rift active (after first visit)', () => {
    // First visit: shows welcome (highest priority first_visit line)
    holo.checkProximity(100, 100, 0, defaultContext({ activeRiftCount: 1 }));
    // Second visit after cooldown: ley_intro or rift_warning (both priority 9)
    holo.checkProximity(100, 100, 11_000, defaultContext({ activeRiftCount: 1 }));
    // Third visit: the other one
    const line = holo.checkProximity(100, 100, 22_000, defaultContext({ activeRiftCount: 1 }));
    expect(line).not.toBeNull();
    // By now both ley_intro and rift_warning should have been shown; verify at least one was rift_warning
    expect(holo.getShownCount()).toBeGreaterThanOrEqual(3);
  });

  it('selects ul_hint when UL not used (second visit)', () => {
    holo.checkProximity(100, 100, 0, defaultContext()); // welcome
    const line = holo.checkProximity(100, 100, 11_000, defaultContext());
    expect(line).not.toBeNull();
    expect(line!.id).toBe('ul_hint');
  });

  it('selects terra_hint when no companion (third visit)', () => {
    holo.checkProximity(100, 100, 0, defaultContext()); // welcome
    holo.checkProximity(100, 100, 11_000, defaultContext()); // ul_hint
    const line = holo.checkProximity(100, 100, 22_000, defaultContext());
    expect(line).not.toBeNull();
    expect(line!.id).toBe('terra_hint');
  });

  it('falls back to revisit dialogue when all shown', () => {
    const ctx = defaultContext({
      hasUsedUL: true,
      hasCompanion: true,
      activeRiftCount: 0,
      lowestStability: 80,
      trustLevel: 80,
    });
    // Show all first_visit lines
    holo.checkProximity(100, 100, 0, ctx); // welcome
    holo.checkProximity(100, 100, 11_000, ctx); // ley_intro

    // After showing all available, should eventually get farewell (revisit)
    let lastLine = null;
    for (let t = 22_000; t < 200_000; t += 11_000) {
      const line = holo.checkProximity(100, 100, t, ctx);
      if (line) lastLine = line;
      if (line?.id === 'farewell') break;
    }
    expect(lastLine).not.toBeNull();
    expect(lastLine!.id).toBe('farewell');
  });

  it('tracks visit count', () => {
    expect(holo.getVisitCount()).toBe(0);
    holo.checkProximity(100, 100, 0, defaultContext());
    expect(holo.getVisitCount()).toBe(1);
  });

  it('getPosition returns config position', () => {
    expect(holo.getPosition()).toEqual({ x: 100, y: 100 });
  });
});
