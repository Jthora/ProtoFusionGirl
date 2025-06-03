// WorldEditPermissions: Handles permissions for editing (multiplayer, modding, etc.)
export class WorldEditPermissions {
  // Permission model types
  private mode: 'open' | 'owner' | 'region' | 'modded' = 'open';
  private ownerId: string | null = null;
  private protectedRegions: Array<{x1: number, y1: number, x2: number, y2: number, allowed: string[]}> = [];
  private modHooks: Array<(userId: string, x: number, y: number) => boolean | undefined> = [];

  setMode(mode: 'open' | 'owner' | 'region' | 'modded', ownerId?: string) {
    this.mode = mode;
    if (ownerId) this.ownerId = ownerId;
  }

  addProtectedRegion(x1: number, y1: number, x2: number, y2: number, allowed: string[]) {
    this.protectedRegions.push({x1, y1, x2, y2, allowed});
  }

  addModHook(hook: (userId: string, x: number, y: number) => boolean | undefined) {
    this.modHooks.push(hook);
  }

  canEdit(userId: string, x: number, y: number): boolean {
    // Mod hooks have highest priority
    for (const hook of this.modHooks) {
      const result = hook(userId, x, y);
      if (typeof result === 'boolean') return result;
    }
    if (this.mode === 'open') return true;
    if (this.mode === 'owner') return userId === this.ownerId;
    if (this.mode === 'region') {
      for (const region of this.protectedRegions) {
        if (x >= region.x1 && x <= region.x2 && y >= region.y1 && y <= region.y2) {
          return region.allowed.includes(userId);
        }
      }
      return true; // Not in a protected region
    }
    if (this.mode === 'modded') {
      // Fallback: allow, but mods can override
      return true;
    }
    return true;
  }

  // Batch check for area edits
  canEditArea(userId: string, x1: number, y1: number, x2: number, y2: number): boolean {
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        if (!this.canEdit(userId, x, y)) return false;
      }
    }
    return true;
  }
}
