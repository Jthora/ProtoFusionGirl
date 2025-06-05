// Automated tests for MultiverseEventEngine edge cases: conflicting events, quest fail/success in different branches.
import { MultiverseEventEngine } from '../MultiverseEventEngine';
import { WorldPersistence } from '../../tilemap/WorldPersistence';
import { EventBus } from '../../../core/EventBus';

describe('MultiverseEventEngine edge cases', () => {
  let engine: MultiverseEventEngine;
  let persistence: WorldPersistence;
  let eventBus: EventBus;

  beforeEach(() => {
    // Mock WorldPersistence with minimal API
    persistence = {
      getBranch: (id: string) => ({ id, deltas: [], seed: 'seed', parent: undefined, children: [] })
    } as any;
    eventBus = new EventBus();
    engine = new MultiverseEventEngine(persistence, eventBus);
  });

  it('should track quest state per branch', () => {
    engine.setQuestState('A', { id: 'quest1', status: 'active', branchId: 'A' });
    engine.setQuestState('B', { id: 'quest1', status: 'completed', branchId: 'B' });
    expect(engine.getQuestState('A', 'quest1')!.status).toBe('active');
    expect(engine.getQuestState('B', 'quest1')!.status).toBe('completed');
  });

  it('should merge quest states, preferring target branch', () => {
    engine.setQuestState('A', { id: 'quest1', status: 'active', branchId: 'A' });
    engine.setQuestState('B', { id: 'quest1', status: 'completed', branchId: 'B' });
    engine.mergeBranchEvents('A', 'B');
    // Target branch keeps its own quest state
    expect(engine.getQuestState('A', 'quest1')!.status).toBe('active');
  });

  it('should propagate events to branches', () => {
    engine.propagateEventToBranch('event1', { foo: 42 }, 'A');
    expect(engine.getBranchEventState('A').events['event1'].foo).toBe(42);
  });

  it('should trigger and listen for narrative events', (done) => {
    engine.onNarrativeTrigger('A', 'storyEvent', (data) => {
      expect(data.branchId).toBe('A');
      expect(data.payload).toBe('test');
      done();
    });
    engine.triggerWorldChange('A', 'storyEvent', { payload: 'test' });
  });
});
