// WorldGenV2.ts
// Improved procedural world/chunk generation using TerrainGenerator
import { TilemapManager } from './TilemapManager';
import { TerrainGenerator } from './TerrainGenerator';
import { TileType } from './TileSpriteFactory';

export class WorldGenV2 {
  private tilemapManager: TilemapManager;
  private modWorldGenHooks: Array<(chunkX: number, chunkY: number, worldMeta?: any) => any> = [];

  constructor(tilemapManager: TilemapManager) {
    this.tilemapManager = tilemapManager;
  }

  registerModWorldGenHook(hook: (chunkX: number, chunkY: number, worldMeta?: any) => any) {
    this.modWorldGenHooks.push(hook);
  }

  generateFromSeed(seed: string) {
    const world = {
      seed,
      width: 1024,
      height: 512,
      chunks: {} as Record<string, any>
    };
    this.generateChunk(0, 0, world);
    return world;
  }

  generateChunk(chunkX: number, chunkY: number, worldMeta?: any) {
    for (const hook of this.modWorldGenHooks) {
      const result = hook(chunkX, chunkY, worldMeta);
      if (result) return result;
    }
    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    const tiles: TileType[][] = [];
    for (let x = 0; x < chunkSize; x++) {
      tiles[x] = [];
      const surfaceY = TerrainGenerator.getSurfaceY(chunkX, chunkY, x);
      for (let y = 0; y < chunkSize; y++) {
        const worldY = chunkY * chunkSize + y;
        tiles[x][y] = TerrainGenerator.getTileType(worldY, surfaceY);
      }
    }
    const chunk = { x: chunkX, y: chunkY, tiles, dirty: false };
    if (worldMeta) {
      worldMeta.chunks[`${chunkX},${chunkY}`] = chunk;
    }
    return chunk;
  }
}
