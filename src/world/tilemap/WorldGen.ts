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
    // Enhanced Earth-based terrain generation using geographic coordinates
    // Convert chunk coordinates to approximate Earth longitude/latitude
    const earthLongitude = (wrappedChunkX * chunkSize * 16) / TilemapManager.WORLD_WIDTH * 360 - 180; // -180 to +180
    const earthLatitude = (chunkY * chunkSize * 16) / TilemapManager.WORLD_HEIGHT * 180 - 90; // -90 to +90
    
    // Simulate realistic terrain height based on Earth geography
    // Use multiple sine waves to simulate continental/oceanic patterns
    const continentalElevation = Math.sin(earthLongitude * 0.03) * Math.cos(earthLatitude * 0.02) * 8;
    const mountainRange = Math.sin(earthLongitude * 0.1) * Math.sin(earthLatitude * 0.15) * 6;
    const localVariation = Math.sin(chunkX * 0.5 + chunkY * 0.3) * 2;
    
    const surfaceY = baseSurfaceY + Math.floor(continentalElevation + mountainRange + localVariation);
    
    for (let x = 0; x < chunkSize; x++) {
      tiles[x] = [];
      for (let y = 0; y < chunkSize; y++) {
        const worldY = chunkY * chunkSize + y;
        
        // Determine biome based on latitude and terrain features
        let biome = 'temperate';
        if (Math.abs(earthLatitude) > 60) biome = 'polar';
        else if (Math.abs(earthLatitude) < 23.5) biome = 'tropical';
        else if (Math.abs(continentalElevation) < -4) biome = 'oceanic';
        else if (mountainRange > 3) biome = 'mountain';
        
        // --- Enhanced terrain logic with biomes ---
        if (worldY === surfaceY) {
          // Surface tile based on biome
          switch (biome) {
            case 'polar': tiles[x][y] = 'ice'; break;
            case 'tropical': tiles[x][y] = 'sand'; break;
            case 'oceanic': tiles[x][y] = 'water'; break;
            case 'mountain': tiles[x][y] = 'stone'; break;
            default: tiles[x][y] = 'grass';
          }
        } else if (worldY < surfaceY) {
          tiles[x][y] = 'air'; // Above ground
        } else if (worldY < surfaceY + 3) {
          // Subsurface based on biome
          if (biome === 'oceanic') tiles[x][y] = 'water';
          else if (biome === 'polar') tiles[x][y] = 'ice';
          else tiles[x][y] = 'dirt';
        } else {
          tiles[x][y] = 'stone'; // Deep underground
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
