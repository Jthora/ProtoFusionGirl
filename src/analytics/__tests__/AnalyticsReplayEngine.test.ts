import { AnalyticsReplayEngine } from '../AnalyticsReplayEngine';

describe('AnalyticsReplayEngine', () => {
  it('should log and export events per branch', () => {
    const engine = new AnalyticsReplayEngine();
    engine.logEvent('A', 'move', { x: 1, y: 2 });
    engine.logEvent('A', 'edit', { tile: 'grass' });
    engine.logEvent('B', 'move', { x: 3, y: 4 });
    const logA = engine.exportBranchLog('A');
    const logB = engine.exportBranchLog('B');
    expect(logA.length).toBe(2);
    expect(logB.length).toBe(1);
    expect(logA[0].type).toBe('move');
    expect(logB[0].data.x).toBe(3);
  });

  it('should import logs and respect opt-in', () => {
    const engine = new AnalyticsReplayEngine();
    engine.setOptIn(false);
    engine.logEvent('A', 'move', { x: 1 });
    expect(engine.exportBranchLog('A').length).toBe(0);
    engine.setOptIn(true);
    engine.importBranchLog('A', [{ id: 'e1', type: 'move', data: { x: 2 }, branchId: 'A', timestamp: Date.now() }]);
    expect(engine.exportBranchLog('A').length).toBe(1);
  });
});
