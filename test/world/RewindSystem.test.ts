// RewindSystem.test.ts — tests for tasks 6121-6125

import { EventBus } from '../../src/core/EventBus';
import { EventHistoryLog } from '../../src/world/EventHistoryLog';
import { RewindSystem } from '../../src/world/RewindSystem';

function createSetup() {
  const eventBus = new EventBus();
  const historyLog = new EventHistoryLog(eventBus);
  const rewind = new RewindSystem(eventBus, historyLog);
  return { eventBus, historyLog, rewind };
}

describe('RewindSystem', () => {
  it('captures a snapshot with deep-cloned state', () => {
    const { rewind } = createSetup();
    const state = { hp: 100, pos: { x: 10, y: 20 } };
    const id = rewind.captureSnapshot(state);
    expect(id).toMatch(/^snap_/);

    // Mutating original should not affect snapshot
    state.hp = 0;
    const snap = rewind.getSnapshot(id);
    expect(snap).toBeDefined();
    expect(snap!.state).toEqual({ hp: 100, pos: { x: 10, y: 20 } });
  });

  it('enforces FIFO cap on snapshots', () => {
    const { rewind } = createSetup();
    for (let i = 0; i < 55; i++) {
      rewind.captureSnapshot({ i });
    }
    expect(rewind.getSnapshotCount()).toBe(50);
  });

  it('records decision points with associated snapshots', () => {
    const { historyLog, rewind } = createSetup();
    historyLog.update(1000);
    rewind.recordDecisionPoint('COMBAT_START', 'initiated', { hp: 80 });

    const points = rewind.getRewindPoints();
    expect(points.length).toBe(1);
    expect(points[0].entry.type).toBe('COMBAT_START');
    expect(points[0].snapshotId).toMatch(/^snap_/);
  });

  it('rewindTo returns snapshot and emits REWIND_STARTED', () => {
    const { eventBus, rewind } = createSetup();
    const events: any[] = [];
    eventBus.on('REWIND_STARTED', (e) => events.push(e.data));

    const snapId = rewind.captureSnapshot({ hp: 50 });
    const snapshot = rewind.rewindTo(snapId);

    expect(snapshot).not.toBeNull();
    expect(snapshot!.state).toEqual({ hp: 50 });
    expect(rewind.getIsRewinding()).toBe(true);
    expect(events.length).toBe(1);
    expect(events[0].snapshotId).toBe(snapId);
  });

  it('rewindTo returns null for unknown snapshot', () => {
    const { rewind } = createSetup();
    expect(rewind.rewindTo('nonexistent')).toBeNull();
    expect(rewind.getIsRewinding()).toBe(false);
  });

  it('resumeFromRewind completes the rewind cycle', () => {
    const { eventBus, rewind } = createSetup();
    const events: any[] = [];
    eventBus.on('REWIND_COMPLETED', (e) => events.push(e.data));

    const snapId = rewind.captureSnapshot({ hp: 50 });
    rewind.rewindTo(snapId);
    expect(rewind.getIsRewinding()).toBe(true);

    const result = rewind.resumeFromRewind(snapId);
    expect(result).toBe(true);
    expect(rewind.getIsRewinding()).toBe(false);
    expect(events.length).toBe(1);
    expect(events[0].snapshotId).toBe(snapId);
  });

  it('resumeFromRewind fails if not currently rewinding', () => {
    const { rewind } = createSetup();
    const snapId = rewind.captureSnapshot({ hp: 100 });
    expect(rewind.resumeFromRewind(snapId)).toBe(false);
  });

  it('getSnapshot returns deep copy', () => {
    const { rewind } = createSetup();
    const id = rewind.captureSnapshot({ items: [1, 2, 3] });
    const a = rewind.getSnapshot(id);
    const b = rewind.getSnapshot(id);
    expect(a).toEqual(b);
    expect(a).not.toBe(b); // different objects
  });
});
