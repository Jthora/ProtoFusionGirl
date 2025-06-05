import { TilemapManager } from './TilemapManager';
import { extractWarpZone, restoreWarpZone, serializeWarpZone, deserializeWarpZone } from './WarpZoneUtils';

describe('WarpZoneUtils toroidal seam edge cases', () => {
  let tilemapManager: TilemapManager;
  beforeEach(() => {
    tilemapManager = new TilemapManager();
    // Mock editService with a simple in-memory tile grid (full tile objects)
    const grid: Record<string, { code: string, state?: any, metadata?: any }> = {};
    tilemapManager.editService = {
      getTile: (x: number, y: number) => grid[`${x},${y}`] || { code: 'air', state: null, metadata: null },
      setTile: (x: number, y: number, code: string, state?: any, metadata?: any) => {
        grid[`${x},${y}`] = { code, state, metadata };
      }
    } as any;
  });

  it('should extract and restore a warp zone that crosses the world seam', () => {
    // Place a unique tile at the seam and just before/after
    const w = TilemapManager.WORLD_WIDTH;
    tilemapManager.editService.setTile(w - 1, 0, 'seam-right');
    tilemapManager.editService.setTile(0, 0, 'seam-left');
    tilemapManager.editService.setTile(1, 0, 'after-seam');
    // Extract a 3-tile-wide zone crossing the seam
    const zone = extractWarpZone(tilemapManager, w - 1, 0, 3, 1);
    expect(zone.tiles[0][0].code).toBe('seam-right');
    expect(zone.tiles[0][1].code).toBe('seam-left');
    expect(zone.tiles[0][2].code).toBe('after-seam');
    // Serialize/deserialize
    const blob = serializeWarpZone(zone);
    const zone2 = deserializeWarpZone(blob);
    // Overwrite with air, then restore
    tilemapManager.editService.setTile(w - 1, 0, 'air');
    tilemapManager.editService.setTile(0, 0, 'air');
    tilemapManager.editService.setTile(1, 0, 'air');
    restoreWarpZone(tilemapManager, zone2);
    expect(tilemapManager.editService.getTile(w - 1, 0).code).toBe('seam-right');
    expect(tilemapManager.editService.getTile(0, 0).code).toBe('seam-left');
    expect(tilemapManager.editService.getTile(1, 0).code).toBe('after-seam');
  });

  it('should extract and restore a warp zone at the seam with non-default tile metadata', () => {
    const w = TilemapManager.WORLD_WIDTH;
    tilemapManager.editService.setTile(w - 2, 0, 'meta-tile', { hp: 5 }, { custom: true });
    tilemapManager.editService.setTile(w - 1, 0, 'meta-tile', { hp: 10 }, { custom: false });
    tilemapManager.editService.setTile(0, 0, 'meta-tile', { hp: 15 }, { custom: 'edge' });
    // Extract zone
    const zone = extractWarpZone(tilemapManager, w - 2, 0, 3, 1);
    expect(zone.tiles[0][0].state).toEqual({ hp: 5 });
    expect(zone.tiles[0][2].metadata).toEqual({ custom: 'edge' });
    // Overwrite and restore
    tilemapManager.editService.setTile(w - 2, 0, 'air');
    tilemapManager.editService.setTile(w - 1, 0, 'air');
    tilemapManager.editService.setTile(0, 0, 'air');
    restoreWarpZone(tilemapManager, zone);
    expect(tilemapManager.editService.getTile(w - 2, 0).state).toEqual({ hp: 5 });
    expect(tilemapManager.editService.getTile(0, 0).metadata).toEqual({ custom: 'edge' });
  });

  it('should serialize and deserialize a large warp zone crossing the seam', () => {
    const w = TilemapManager.WORLD_WIDTH;
    // Fill a 10x1 region crossing the seam
    for (let i = -5; i < 5; i++) {
      tilemapManager.editService.setTile((w + i) % w, 0, 'bulk', { i }, { tag: i });
    }
    const zone = extractWarpZone(tilemapManager, w - 5, 0, 10, 1);
    const blob = serializeWarpZone(zone);
    const zone2 = deserializeWarpZone(blob);
    // Overwrite and restore
    for (let i = -5; i < 5; i++) {
      tilemapManager.editService.setTile((w + i) % w, 0, 'air');
    }
    restoreWarpZone(tilemapManager, zone2);
    for (let i = -5; i < 5; i++) {
      expect(tilemapManager.editService.getTile((w + i) % w, 0).code).toBe('bulk');
      expect(tilemapManager.editService.getTile((w + i) % w, 0).state).toEqual({ i });
      expect(tilemapManager.editService.getTile((w + i) % w, 0).metadata).toEqual({ tag: i });
    }
  });
});
