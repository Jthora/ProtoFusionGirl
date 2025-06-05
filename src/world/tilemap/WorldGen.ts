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
      width: TilemapManager.WORLD_WIDTH,
      height: TilemapManager.WORLD_HEIGHT,
      chunks: {} as Record<string, any>
    };
    // Optionally: generate spawn chunk(s) immediately
    this.generateChunk(0, 0, world);
    return world;
  }

  /**
   * Regenerate the world using a new seed (e.g., after a reality warp).
   * Optionally, only regenerate affected chunks/tiles for performance.
   * @param seed The new world seed
   * @param options Optional: { center: {x, y}, radius: number, partial: boolean }
   */
  regenerateWorldFromSeed(seed: string, options?: { center?: { x: number, y: number }, radius?: number, partial?: boolean }) {
    if (options?.partial && options.center && options.radius) {
      // Partial regeneration: only update chunks within radius of center
      const chunkSize = this.tilemapManager.chunkManager.chunkSize;
      const centerChunkX = Math.floor(options.center.x / chunkSize);
      const centerChunkY = Math.floor(options.center.y / chunkSize);
      const chunkRadius = Math.ceil(options.radius / chunkSize);
      for (let dx = -chunkRadius; dx <= chunkRadius; dx++) {
        for (let dy = -chunkRadius; dy <= chunkRadius; dy++) {
          const chunkX = centerChunkX + dx;
          const chunkY = centerChunkY + dy;
          // Regenerate and replace chunk
          const newChunk = this.generateChunk(chunkX, chunkY, undefined);
          this.tilemapManager.chunkManager.replaceChunk(chunkX, chunkY, newChunk);
        }
      }
      // Optionally: update minimap, physics, and UI
      return;
    }
    // Fallback: full regeneration
    return this.generateFromSeed(seed);
  }

  // Generate chunk data for given coordinates (returns a chunk object)
  generateChunk(chunkX: number, chunkY: number, worldMeta?: any) {
    // Wrap chunkX for horizontal world looping
    const worldWidthChunks = Math.ceil(TilemapManager.WORLD_WIDTH / this.tilemapManager.chunkManager.chunkSize);
    const wrappedChunkX = ((chunkX % worldWidthChunks) + worldWidthChunks) % worldWidthChunks;
    // Allow mods to override or inject worldgen
    for (const hook of this.modWorldGenHooks) {
      const result = hook(chunkX, chunkY, worldMeta);
      if (result) return result;
    }
    // Use a seeded PRNG for deterministic generation
    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    const tiles: string[][] = [];
    // --- Improved World Generation ---
    // Default terrain height (surfaceY) can be varied for more interesting terrain
    const baseSurfaceY = 16; // Default ground height
    // Simple pseudo-random height variation per chunk (replace with noise for more realism)
    const surfaceY = baseSurfaceY + Math.floor(Math.sin(chunkX * 0.5 + chunkY * 0.3) * 2);
    for (let x = 0; x < chunkSize; x++) {
      tiles[x] = [];
      for (let y = 0; y < chunkSize; y++) {
        const worldY = chunkY * chunkSize + y;
        // --- Terrain logic ---
        if (worldY === surfaceY) {
          tiles[x][y] = 'grass'; // Surface
        } else if (worldY < surfaceY) {
          tiles[x][y] = 'air'; // Above ground
        } else if (worldY < surfaceY + 3) {
          tiles[x][y] = 'dirt'; // Shallow dirt
        } else {
          tiles[x][y] = 'stone'; // Deeper underground
        }
      }
    }
    const chunk = { x: wrappedChunkX, y: chunkY, tiles, dirty: false };
    // Optionally: store in worldMeta if provided
    if (worldMeta) {
      worldMeta.chunks[`${wrappedChunkX},${chunkY}`] = chunk;
    }
    return chunk;
  }
}
