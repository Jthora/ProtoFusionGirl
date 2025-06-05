// __tests__/TimestreamManager.test.ts
import { TimestreamManager } from '../TimestreamManager';
import { Timeline } from '../types';

describe('TimestreamManager', () => {
  it('creates a new timestream', () => {
    const mgr = new TimestreamManager();
    const timeline: Timeline = {
      id: 'tl1',
      label: 'Root',
      events: [],
      parentTimestream: 'none',
    };
    const ts = mgr.createTimestream('Test', timeline);
    expect(ts.label).toBe('Test');
    expect(ts.rootTimeline).toBe(timeline);
  });

  it('branches a timeline', () => {
    const mgr = new TimestreamManager();
    const timeline: Timeline = {
      id: 'tl1',
      label: 'Root',
      events: [],
      parentTimestream: 'none',
    };
    const ts = mgr.createTimestream('Test', timeline);
    const branch = mgr.branchTimeline(ts.id, 'event1', 'Branch1');
    expect(branch).not.toBeNull();
    expect(ts.branches.length).toBe(1);
  });
});
