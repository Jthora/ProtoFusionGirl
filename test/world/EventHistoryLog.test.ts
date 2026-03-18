// EventHistoryLog.test.ts
// Tests for event history log (tasks 6111-6114)

import { EventBus } from '../../src/core/EventBus';
import { EventHistoryLog } from '../../src/world/EventHistoryLog';

function createSetup(max = 1000) {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('HISTORY_RECORDED', (e) => events.push(e));
  const log = new EventHistoryLog(eventBus, max);
  return { eventBus, log, events };
}

describe('EventHistoryLog', () => {
  it('records events with timestamps (P4.3)', () => {
    const { log } = createSetup();
    log.update(1000);
    log.record('COMBAT_START', 'initiated', { enemyCount: 3 });
    const entries = log.getAll();
    expect(entries).toHaveLength(1);
    expect(entries[0].timestamp).toBe(1000);
    expect(entries[0].type).toBe('COMBAT_START');
    expect(entries[0].outcome).toBe('initiated');
  });

  it('emits HISTORY_RECORDED event', () => {
    const { log, events } = createSetup();
    log.record('RIFT_SEALED', 'success');
    expect(events).toHaveLength(1);
    expect(events[0].data.entry.type).toBe('RIFT_SEALED');
  });

  it('caps at maxEntries with FIFO', () => {
    const { log } = createSetup(5);
    for (let i = 0; i < 8; i++) {
      log.record(`event_${i}`, 'ok');
    }
    expect(log.getLength()).toBe(5);
    // First 3 should have been dropped
    expect(log.getAll()[0].type).toBe('event_3');
  });

  it('getByType filters correctly', () => {
    const { log } = createSetup();
    log.record('COMBAT_START', 'a');
    log.record('RIFT_SEALED', 'b');
    log.record('COMBAT_START', 'c');
    expect(log.getByType('COMBAT_START')).toHaveLength(2);
    expect(log.getByType('RIFT_SEALED')).toHaveLength(1);
  });

  it('getRecent returns last N entries', () => {
    const { log } = createSetup();
    for (let i = 0; i < 10; i++) log.record(`e_${i}`, 'ok');
    const recent = log.getRecent(3);
    expect(recent).toHaveLength(3);
    expect(recent[0].type).toBe('e_7');
  });

  it('getDecisionPoints finds guidance/combat/puzzle events', () => {
    const { log } = createSetup();
    log.record('GUIDANCE_ACCEPTED', 'ok');
    log.record('JANE_MOVED', 'ok');
    log.record('COMBAT_START', 'initiated');
    log.record('JANE_REFUSED_GUIDANCE', 'reason');
    expect(log.getDecisionPoints()).toHaveLength(3);
  });

  it('tracks game time via update', () => {
    const { log } = createSetup();
    log.update(500);
    log.update(300);
    expect(log.getGameTime()).toBe(800);
    log.record('test', 'ok');
    expect(log.getAll()[0].timestamp).toBe(800);
  });

  it('destroy clears all state', () => {
    const { log } = createSetup();
    log.update(1000);
    log.record('test', 'ok');
    log.destroy();
    expect(log.getLength()).toBe(0);
    expect(log.getGameTime()).toBe(0);
  });
});
