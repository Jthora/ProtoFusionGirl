// PsiNetLog.test.ts — Task 7422
// Tests: ASI behavior logging

import { EventBus } from '../../src/core/EventBus';
import { PsiNetLog } from '../../src/world/PsiNetLog';

function createSetup() {
  const eventBus = new EventBus();
  const events: any[] = [];
  eventBus.on('PSINET_ACTION_LOGGED', (e) => events.push(e));
  const log = new PsiNetLog(eventBus);
  return { eventBus, log, events };
}

describe('PsiNetLog', () => {
  it('starts with no entries', () => {
    const { log } = createSetup();
    expect(log.getAll()).toHaveLength(0);
  });

  it('logs an action and emits event', () => {
    const { log, events } = createSetup();
    log.log('Placed waypoint', 'guidance', { note: 'Guided Jane to rift' });
    expect(log.getAll()).toHaveLength(1);
    expect(events).toHaveLength(1);
    expect(events[0].data.action).toBe('Placed waypoint');
    expect(events[0].data.category).toBe('guidance');
  });

  it('getByCategory filters correctly', () => {
    const { log } = createSetup();
    log.log('Guided', 'guidance');
    log.log('Watched', 'observation');
    log.log('Healed', 'intervention');
    log.log('Did nothing', 'negligence');

    expect(log.getByCategory('guidance')).toHaveLength(1);
    expect(log.getByCategory('observation')).toHaveLength(1);
    expect(log.getByCategory('negligence')).toHaveLength(1);
  });

  it('getRecent returns last N entries', () => {
    const { log } = createSetup();
    log.log('A', 'guidance');
    log.log('B', 'observation');
    log.log('C', 'intervention');

    const recent = log.getRecent(2);
    expect(recent).toHaveLength(2);
    expect(recent[0].action).toBe('B');
    expect(recent[1].action).toBe('C');
  });

  it('getNegligenceCount tracks negligence entries', () => {
    const { log } = createSetup();
    expect(log.getNegligenceCount()).toBe(0);
    log.log('idle', 'negligence');
    log.log('idle again', 'negligence');
    expect(log.getNegligenceCount()).toBe(2);
  });
});
