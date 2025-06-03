// WorldGen: Procedural world/chunk generation (noise, biomes, etc.)
import { TilemapManager } from './TilemapManager';

export class WorldGen {
  private tilemapManager: TilemapManager;
  private modWorldGenHooks: Array<(chunkX: number, chunkY: number, worldMeta?: any) => any> = [];

  constructor(tilemapManager: TilemapManager) {
    this.tilemapManager = tilemapManager;
  }

  /**
   * Allow mods to register worldgen hooks.
   */
  registerModWorldGenHook(hook: (chunkX: number, chunkY: number, worldMeta?: any) => any) {
    this.modWorldGenHooks.push(hook);
  }

  // Generate a new world using a seed (returns a world metadata object)
  generateFromSeed(seed: string) {
    // Example: store seed and world size, generate initial chunks
    const world = {
      seed,
      width: 1024, // Example: 1024 tiles wide
      height: 512, // Example: 512 tiles tall
      chunks: {} as Record<string, any>
    };
    // Optionally: generate spawn chunk(s) immediately
    this.generateChunk(0, 0, world);
    return world;
  }

  // Generate chunk data for given coordinates (returns a chunk object)
  generateChunk(chunkX: number, chunkY: number, worldMeta?: any) {
    // Allow mods to override or inject worldgen
    for (const hook of this.modWorldGenHooks) {
      const result = hook(chunkX, chunkY, worldMeta);
      if (result) return result;
    }
    // Use a seeded PRNG for deterministic generation
    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    const tiles: string[][] = [];
    for (let x = 0; x < chunkSize; x++) {
      tiles[x] = [];
      for (let y = 0; y < chunkSize; y++) {
        // Simple terrain: surface at y = 16, dirt below, air above
        const worldY = chunkY * chunkSize + y;
        if (worldY === 16) {
          tiles[x][y] = 'grass';
        } else if (worldY < 16) {
          tiles[x][y] = 'air';
        } else {
          tiles[x][y] = 'dirt';
        }
      }
    }
    const chunk = { x: chunkX, y: chunkY, tiles, dirty: false };
    // Optionally: store in worldMeta if provided
    if (worldMeta) {
      worldMeta.chunks[`${chunkX},${chunkY}`] = chunk;
    }
    return chunk;
  }
}
