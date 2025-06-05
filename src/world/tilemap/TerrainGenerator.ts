// TerrainGenerator.ts
// Provides advanced terrain generation logic (surface height, biomes, noise, etc.)
import { TileType } from './TileSpriteFactory';

export class TerrainGenerator {
  static getSurfaceY(chunkX: number, chunkY: number, x: number): number {
    // Example: combine chunk and local x for more variety
    const base = 16;
    // Simple pseudo-random height variation (replace with noise for more realism)
    return base + Math.floor(Math.sin(chunkX * 0.5 + chunkY * 0.3 + x * 0.1) * 2);
  }

  static getTileType(worldY: number, surfaceY: number): TileType {
    if (worldY === surfaceY) return 'grass';
    if (worldY < surfaceY) return 'air';
    if (worldY < surfaceY + 3) return 'dirt';
    return 'stone';
  }
}
