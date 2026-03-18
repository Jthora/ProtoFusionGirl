// CompanionAI.test.ts
// Tests for CompanionAI and Terra (tasks 5211-5225)

import { EventBus } from '../../src/core/EventBus';
import { CompanionAI, CompanionConfig, DEFAULT_COMPANION_CONFIG } from '../../src/ai/CompanionAI';
import { Terra, TERRA_CONFIG } from '../../src/ai/Terra';

function makeConfig(overrides?: Partial<CompanionConfig>): CompanionConfig {
  return { id: 'test_companion', type: 'minion', ...DEFAULT_COMPANION_CONFIG, ...overrides };
}

describe('CompanionAI', () => {
  it('starts in idle state', () => {
    const eventBus = new EventBus();
    const ai = new CompanionAI(eventBus, makeConfig());
    expect(ai.getState()).toBe('idle');
  });

  it('transitions to follow state (P3.5)', () => {
    const eventBus = new EventBus();
    const events: any[] = [];
    eventBus.on('COMPANION_STATE_CHANGED', (e) => events.push(e));
    const ai = new CompanionAI(eventBus, makeConfig());
    ai.command('follow');
    expect(ai.getState()).toBe('follow');
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].data.newState).toBe('follow');
  });

  it('follows Jane maintaining distance', () => {
    const eventBus = new EventBus();
    const ai = new CompanionAI(eventBus, makeConfig());
    ai.setPosition(0, 0);
    ai.setState('follow');
    ai.update(1000, 200, 0); // Jane at 200,0
    const pos = ai.getPosition();
    expect(pos.x).toBeGreaterThan(0); // moved toward Jane
    expect(pos.x).toBeLessThan(200);  // didn't overshoot
  });

  it('activates shield (P3.6)', () => {
    const eventBus = new EventBus();
    const events: any[] = [];
    eventBus.on('COMPANION_SHIELD_ACTIVATED', (e) => events.push(e));
    const ai = new CompanionAI(eventBus, makeConfig({ shieldDuration: 2000, shieldCooldown: 5000 }));
    const result = ai.activateShield('player');
    expect(result).toBe(true);
    expect(ai.isShielding()).toBe(true);
    expect(ai.getState()).toBe('shield');
    expect(events.length).toBe(1);
  });

  it('shield expires after duration', () => {
    const eventBus = new EventBus();
    const ai = new CompanionAI(eventBus, makeConfig({ shieldDuration: 2000, shieldCooldown: 5000 }));
    ai.setState('follow');
    ai.activateShield('player');
    expect(ai.isShielding()).toBe(true);
    ai.update(2100, 0, 0); // exceed shield duration
    expect(ai.isShielding()).toBe(false);
    expect(ai.getState()).toBe('follow');
  });

  it('shield cooldown prevents re-activation', () => {
    const eventBus = new EventBus();
    const ai = new CompanionAI(eventBus, makeConfig({ shieldDuration: 1000, shieldCooldown: 5000 }));
    ai.activateShield('player');
    ai.update(1100, 0, 0); // shield ends
    const again = ai.activateShield('player');
    expect(again).toBe(false);
  });

  it('holds position (P3.7)', () => {
    const eventBus = new EventBus();
    const ai = new CompanionAI(eventBus, makeConfig());
    ai.setPosition(100, 100);
    ai.command('hold', 100, 100);
    expect(ai.getState()).toBe('hold_position');
    ai.update(500, 300, 300); // Jane moves away
    const pos = ai.getPosition();
    // Should stay near hold position, not follow Jane
    expect(Math.abs(pos.x - 100)).toBeLessThan(10);
  });

  it('auto-shield check triggers when enemy nearby', () => {
    const eventBus = new EventBus();
    const ai = new CompanionAI(eventBus, makeConfig({ shieldDuration: 2000 }));
    ai.setState('follow');
    const result = ai.autoShieldCheck(true, 'player');
    expect(result).toBe(true);
    expect(ai.isShielding()).toBe(true);
  });

  it('takes damage and heals', () => {
    const eventBus = new EventBus();
    const ai = new CompanionAI(eventBus, makeConfig());
    ai.takeDamage(30);
    expect(ai.getHealth()).toBe(70);
    ai.heal(20);
    expect(ai.getHealth()).toBe(90);
    expect(ai.isAlive()).toBe(true);
    ai.takeDamage(100);
    expect(ai.isAlive()).toBe(false);
  });
});

describe('Terra', () => {
  it('activates and spawns companion event', () => {
    const eventBus = new EventBus();
    const events: any[] = [];
    eventBus.on('COMPANION_SPAWNED', (e) => events.push(e));
    const terra = new Terra(eventBus);
    terra.activate(150, 200);
    expect(terra.isActivated()).toBe(true);
    expect(events.length).toBe(1);
    expect(events[0].data.companionType).toBe('terra');
  });

  it('auto-shields when enemy is near Jane', () => {
    const eventBus = new EventBus();
    const events: any[] = [];
    eventBus.on('COMPANION_SHIELD_ACTIVATED', (e) => events.push(e));
    const terra = new Terra(eventBus);
    terra.activate(100, 100);
    terra.update(100, 100, 100, [{ id: 'e1', x: 120, y: 100 }]); // enemy close to Jane
    expect(terra.isShielding()).toBe(true);
    expect(events.length).toBe(1);
  });

  it('does not auto-shield when no enemies nearby', () => {
    const eventBus = new EventBus();
    const terra = new Terra(eventBus);
    terra.activate(100, 100);
    terra.update(100, 100, 100, [{ id: 'e1', x: 9999, y: 9999 }]); // enemy far away
    expect(terra.isShielding()).toBe(false);
  });

  it('responds to defend-here command', () => {
    const eventBus = new EventBus();
    const terra = new Terra(eventBus);
    terra.activate(100, 100);
    terra.defendHere(300, 300);
    expect(terra.getState()).toBe('hold_position');
  });

  it('responds to follow command', () => {
    const eventBus = new EventBus();
    const terra = new Terra(eventBus);
    terra.activate(100, 100);
    terra.defendHere(300, 300);
    terra.follow();
    expect(terra.getState()).toBe('follow');
  });

  it('does nothing when not activated', () => {
    const eventBus = new EventBus();
    const terra = new Terra(eventBus);
    // Not activated, update should be no-op
    terra.update(100, 100, 100, [{ id: 'e1', x: 120, y: 100 }]);
    expect(terra.isShielding()).toBe(false);
  });
});
