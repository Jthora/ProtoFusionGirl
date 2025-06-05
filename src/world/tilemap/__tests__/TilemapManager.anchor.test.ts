// TilemapManager.anchor.test.ts
// Automated tests for anchor creation, restoration, and branch/anchor coordination
import { TilemapManager } from '../TilemapManager';

describe('TilemapManager Anchor Integration', () => {
  let manager: TilemapManager;

  beforeEach(() => {
    manager = new TilemapManager();
    // Simulate main branch edits
    manager.recordTileDelta(1, 1, 'air', 'stone');
    // Simulate anchor creation (new branch)
    manager.switchBranch('anchorA', false);
    manager.recordTileDelta(2, 2, 'air', 'dirt');
    // Simulate another anchor/branch
    manager.switchBranch('anchorB', false);
    manager.recordTileDelta(3, 3, 'air', 'sand');
    manager.switchBranch('main', false);
  });

  it('should create a new branch for each anchor', () => {
    const branches = manager.getAllBranches();
    expect(branches.map(b => b.id)).toEqual(expect.arrayContaining(['main', 'anchorA', 'anchorB']));
  });

  it('should restore anchor/branch and apply correct deltas', () => {
    // Simulate restoring anchorA
    manager.switchBranch('anchorA');
    const deltas = manager.getBranchDeltas('anchorA');
    expect(deltas.length).toBe(1);
    expect(deltas[0].newTile).toBe('dirt');
    // Simulate restoring anchorB
    manager.switchBranch('anchorB');
    const deltasB = manager.getBranchDeltas('anchorB');
    expect(deltasB.length).toBe(1);
    expect(deltasB[0].newTile).toBe('sand');
  });

  it('should coordinate anchor and branch switching', () => {
    // Simulate anchor restore triggers branch switch
    manager.switchBranch('anchorA');
    expect(manager.getCurrentBranch()).toBe('anchorA');
    manager.switchBranch('anchorB');
    expect(manager.getCurrentBranch()).toBe('anchorB');
  });
});
