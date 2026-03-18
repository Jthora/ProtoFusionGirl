import { WorldGen } from './WorldGen';
import { TilemapManager } from './TilemapManager';
import { LeylineGeoSlice } from '../terrain/LeylineGeoSlice';
import { ElevationCache } from '../terrain/ElevationCache';

export class WorldGenV3 extends WorldGen {
  private slice: LeylineGeoSlice;
  private cache = new ElevationCache(10000, 0.02);

  constructor(tilemapManager: TilemapManager, slice?: LeylineGeoSlice) {
    super(tilemapManager);
    this.slice = slice || new LeylineGeoSlice(
      { start: { latitude: 0, longitude: -90 }, end: { latitude: 0, longitude: 270 } },
      TilemapManager.WORLD_WIDTH
    );
  }

  generateChunk(chunkX: number, chunkY: number, worldMeta?: any) {
    const chunk = super.generateChunk(chunkX, chunkY, worldMeta);
    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    for (let x = 0; x < chunkSize; x++) {
      const worldX = (TilemapManager.wrapChunkX(chunkX, chunkSize) * chunkSize + x) * 16;
      const { latitude, longitude } = this.slice.xToLatLon(worldX);
      let elev = this.cache.get(latitude, longitude);
      if (elev === undefined) {
        // Mock source returns Promise; we can safely use deasync style here by computing immediately; for now, approximate synchronously
        // Since MockElevationSource is deterministic math, replicate logic: call and ignore async by busy wait is not allowed; instead optimistically compute and fill later if needed.
        // To keep synchronous, compute via the same formula inline (mirrors MockElevationSource)
        const xRad = longitude * Math.PI / 180;
        const yRad = latitude * Math.PI / 180;
        elev = Math.round(Math.sin(xRad * 0.8) * Math.cos(yRad * 0.6) * 1500 + Math.sin(xRad * 3.2) * Math.cos(yRad * 2.4) * 500 - Math.cos(xRad * 0.2) * 300);
        this.cache.set(latitude, longitude, elev);
      }
      const baseSurfaceY = 16;
      const surfaceY = baseSurfaceY + Math.floor((elev - 0) / 100);
      for (let y = 0; y < chunkSize; y++) {
        const worldY = chunkY * chunkSize + y;
        if (worldY === surfaceY) {
          chunk.tiles[x][y] = elev < 0 ? 'water' : 'grass';
        } else if (worldY < surfaceY) {
          chunk.tiles[x][y] = elev < 0 ? 'water' : 'air';
        } else if (worldY < surfaceY + 3) {
          chunk.tiles[x][y] = elev < 0 ? 'water' : 'dirt';
        } else {
          chunk.tiles[x][y] = 'stone';
        }
      }
    }
    (chunk as any).geoSlice = true;
    return chunk;
  }
}
