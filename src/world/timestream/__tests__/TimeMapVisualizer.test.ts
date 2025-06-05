// __tests__/TimeMapVisualizer.test.ts
import { TimeMapVisualizer } from '../TimeMapVisualizer';
import { TimeMap } from '../types';

describe('TimeMapVisualizer', () => {
  it('registers and calls plugins', () => {
    const vis = new TimeMapVisualizer();
    let called = false;
    vis.registerPlugin(() => { called = true; });
    vis.render({ nodes: [], edges: [] });
    expect(called).toBe(true);
  });
});
