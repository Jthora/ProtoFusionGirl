import { TilemapManager } from './TilemapManager';

export interface WarpTile {
  x: number;
  y: number;
  code: string;
  state: any;
  metadata: any;
}

export interface WarpZone {
  originX: number;
  originY: number;
  width: number;
  height: number;
  tiles: WarpTile[][]; // 2D array: [y][x]
}

/**
 * Extracts a warp zone (rectangular region) from the tilemap, handling toroidal wrap.
 * @param tilemapManager TilemapManager instance
 * @param originX Top-left X (world coordinates)
 * @param originY Top-left Y (world coordinates)
 * @param width Width of the zone (in tiles)
 * @param height Height of the zone (in tiles)
 */
export function extractWarpZone(
  tilemapManager: TilemapManager,
  originX: number,
  originY: number,
  width: number,
  height: number
): WarpZone {
  const tiles: WarpTile[][] = [];
  for (let dy = 0; dy < height; dy++) {
    const row: WarpTile[] = [];
    for (let dx = 0; dx < width; dx++) {
      const x = TilemapManager.wrapX(originX + dx);
      const y = originY + dy; // No vertical wrap for now
      const tile = tilemapManager.editService.getTile(x, y);
      row.push({
        x,
        y,
        code: tile?.code || '',
        state: tile?.state || null,
        metadata: tile?.metadata || null
      });
    }
    tiles.push(row);
  }
  return { originX, originY, width, height, tiles };
}

/**
 * Serializes a warp zone to a JSON string (datablob).
 */
export function serializeWarpZone(zone: WarpZone): string {
  return JSON.stringify(zone);
}

/**
 * Deserializes a warp zone from a JSON string (datablob).
 */
export function deserializeWarpZone(blob: string): WarpZone {
  return JSON.parse(blob);
}

/**
 * Restores a warp zone into the tilemap (overwrites tiles in the region, with toroidal wrap).
 */
export function restoreWarpZone(
  tilemapManager: TilemapManager,
  zone: WarpZone
) {
  for (let dy = 0; dy < zone.height; dy++) {
    for (let dx = 0; dx < zone.width; dx++) {
      const tile = zone.tiles[dy][dx];
      const x = TilemapManager.wrapX(zone.originX + dx);
      const y = zone.originY + dy;
      tilemapManager.editService.setTile(x, y, tile.code, tile.state, tile.metadata);
    }
  }
}
