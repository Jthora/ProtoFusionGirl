// WorldEditPermissions.test.ts
// Unit tests for WorldEditPermissions
import { WorldEditPermissions } from './WorldEditPermissions';
describe('WorldEditPermissions', () => {
  // TODO: Test canEditArea with mixed permissions (area partially allowed, partially denied)
  // TODO: Test invalid mode handling (setMode to an invalid value and check fallback)
  let perms: WorldEditPermissions;
  beforeEach(() => { perms = new WorldEditPermissions(); });
  it('allows edit in open mode', () => {
    perms.setMode('open');
    expect(perms.canEdit('user', 0, 0)).toBe(true);
  });
  it('restricts edit in owner mode', () => {
    perms.setMode('owner', 'owner1');
    expect(perms.canEdit('owner1', 0, 0)).toBe(true);
    expect(perms.canEdit('other', 0, 0)).toBe(false);
  });
  it('checks region permissions', () => {
    perms.setMode('region');
    perms.addProtectedRegion(0,0,1,1,['userA']);
    expect(perms.canEdit('userA', 0, 0)).toBe(true);
    expect(perms.canEdit('userB', 0, 0)).toBe(false);
    expect(perms.canEdit('userB', 2, 2)).toBe(true);
  });
  it('supports mod hooks', () => {
    perms.setMode('modded');
    perms.addModHook(() => false);
    expect(perms.canEdit('any', 0, 0)).toBe(false);
  });
  it('respects the first mod hook that returns a boolean', () => {
    const perms = new WorldEditPermissions();
    perms.setMode('modded');
    perms.addModHook(() => undefined);
    perms.addModHook(() => false);
    expect(perms.canEdit('user', 0, 0)).toBe(false);
  });
  it('can batch check area', () => {
    perms.setMode('open');
    expect(perms.canEditArea('user', 0, 0, 1, 1)).toBe(true);
  });
  it('handles overlapping protected regions with different permissions', () => {
    const perms = new WorldEditPermissions();
    perms.setMode('region');
    perms.addProtectedRegion(0,0,2,2,['userA']);
    perms.addProtectedRegion(1,1,3,3,['userB']);
    // (1,1) is in both regions, only userA or userB should be allowed depending on region logic
    expect(perms.canEdit('userA', 1, 1)).toBe(true);
    expect(perms.canEdit('userB', 1, 1)).toBe(true);
    expect(perms.canEdit('userC', 1, 1)).toBe(false);
  });
  it('canEditArea returns false if any tile is not allowed', () => {
    const perms = new WorldEditPermissions();
    perms.setMode('region');
    perms.addProtectedRegion(0,0,0,0,['userA']);
    // (0,0) allowed, (0,1) not explicitly allowed
    expect(perms.canEditArea('userA', 0, 0, 0, 1)).toBe(false);
  });
  it('falls back to allow if setMode is called with invalid value', () => {
    const perms = new WorldEditPermissions();
    // @ts-expect-error: intentionally passing invalid mode
    perms.setMode('invalid');
    expect(perms.canEdit('user', 0, 0)).toBe(true);
  });
});
