import { NarrativeEngine } from '../../src/narrative/NarrativeEngine';
import { EventBus } from '../../src/core/EventBus';

describe('NarrativeEngine (data-driven)', () => {
  it('triggers narrative actions on matching event', () => {
    const eventBus = new EventBus();
    const log: string[] = [];
    // Patch console.log to capture output
    const origLog = console.log;
    console.log = (msg: string) => log.push(msg);
    new NarrativeEngine(eventBus);
    eventBus.emit({ type: 'game_start', data: {} });
    expect(log.some(l => l.includes('show_intro_cinematic'))).toBe(true);
    console.log = origLog;
  });
});
