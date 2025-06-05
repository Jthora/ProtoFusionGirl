// TilemapManager.branch.test.ts
// Automated tests for branch/anchor management: creation, switching, pruning, merging
import { TilemapManager } from '../TilemapManager';

describe('TilemapManager Branch/Anchor Management', () => {
  let manager: TilemapManager;

  beforeEach(() => {
    manager = new TilemapManager();
    // Seed with some branches and deltas
    manager.recordTileDelta(1, 1, 'air', 'stone'); // main
    manager.switchBranch('branchA', false);
    manager.recordTileDelta(2, 2, 'air', 'dirt'); // branchA
    manager.switchBranch('branchB', false);
    manager.recordTileDelta(3, 3, 'air', 'sand'); // branchB
    manager.switchBranch('main', false);
  });

  it('should list all branches', () => {
    const branches = manager.getAllBranches();
    expect(branches.map(b => b.id).sort()).toEqual(['branchA', 'branchB', 'main'].sort());
  });

  it('should switch branches and apply deltas', () => {
    manager.switchBranch('branchA');
    expect(manager.getBranchDeltas('branchA').length).toBe(1);
    manager.switchBranch('branchB');
    expect(manager.getBranchDeltas('branchB').length).toBe(1);
  });

  it('should prune (delete) a branch', () => {
    manager.deleteBranch('branchA');
    const branches = manager.getAllBranches();
    expect(branches.find(b => b.id === 'branchA')).toBeUndefined();
    expect(manager.getBranchDeltas('branchA')).toEqual([]);
  });

  it('should merge a child branch into its parent', () => {
    // Add a parent branch with deltas
    manager.switchBranch('parent', false);
    manager.recordTileDelta(4, 4, 'air', 'grass');
    // Add a child branch
    manager.switchBranch('child', false);
    manager.recordTileDelta(5, 5, 'air', 'water');
    // Merge child into parent
    manager.mergeBranch('child', 'parent');
    expect(manager.getBranchDeltas('child')).toEqual([]);
    expect(manager.getBranchDeltas('parent').some(d => d.newTile === 'water')).toBe(true);
  });

  it('should not allow pruning main branch', () => {
    manager.deleteBranch('main');
    expect(manager.getAllBranches().find(b => b.id === 'main')).toBeDefined();
  });
});
