import { TerrainSystem, BiomeType, TerrainData, TerrainChunk } from './types';
import { LeylineSliceMapper, LeylineSliceConfig } from './LeylineSliceMapper';

export class ElevationSliceTerrainSystem implements TerrainSystem {
  private mapper: LeylineSliceMapper;
  private elevationFn: (lat: number, lon: number) => Promise<number>;

  constructor(config: LeylineSliceConfig, elevationFn: (lat: number, lon: number) => Promise<number>) {
    this.mapper = new LeylineSliceMapper(config);
    this.elevationFn = elevationFn;
  }

  async initialize(): Promise<void> {}
  cleanup(): void {}

  async getElevationAtX(x: number): Promise<number> {
    const { latitude, longitude } = this.mapper.xToGeo(x);
    return this.elevationFn(latitude, longitude);
  }

  getBiomeAtX(x: number): BiomeType {
    const { latitude } = this.mapper.xToGeo(x);
    if (Math.abs(latitude) > 66) return 'polar';
    if (Math.abs(latitude) < 23) return 'tropical';
    return 'temperate';
  }

  async getSurfaceYAtX(x: number): Promise<number> {
    const elevation = await this.getElevationAtX(x);
    const seaLevel = 0;
    const baseSurfaceY = 16;
    const offset = Math.floor((elevation - seaLevel) / 100);
    return baseSurfaceY + offset;
  }

  // Compatibility methods for existing TerrainSystem test interface; map X to lat/lon along slice
  async getTerrainAt(lat: number, lon: number, _radius: number): Promise<TerrainData> {
    // Use provided lat/lon directly with elevationFn
    const elevation = await this.elevationFn(lat, lon);
  const biome: BiomeType = Math.abs(lat) > 66 ? (BiomeType.Arctic as any) : (Math.abs(lat) < 23 ? (BiomeType.Tropical as any) : (BiomeType.Plains as any));
    // Very rough slope/aspect approximations
    const slope = 5;
    const aspect = 0;
  const walkable = biome !== (BiomeType.Ocean as any) && biome !== (BiomeType.Arctic as any);
  const materials = biome === (BiomeType.Tropical as any) ? ['sand'] : biome === (BiomeType.Arctic as any) ? ['ice'] : ['dirt', 'stone'];
  return { elevation, slope, aspect, biome: biome as any, features: [], walkable, materials: materials as any };
  }

  async streamChunksAround(playerPos: { x: number; y: number }): Promise<TerrainChunk[]> {
    const chunkSize = 1000;
    const radius = 1;
    const chunks: TerrainChunk[] = [] as any;
    const centerChunkX = Math.floor(playerPos.x / chunkSize);
    const centerChunkY = Math.floor(playerPos.y / chunkSize);
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const chunkX = centerChunkX + dx;
        const chunkY = centerChunkY + dy;
        const bounds = { minX: chunkX * chunkSize, maxX: (chunkX + 1) * chunkSize, minY: chunkY * chunkSize, maxY: (chunkY + 1) * chunkSize, centerX: (chunkX + 0.5) * chunkSize, centerY: (chunkY + 0.5) * chunkSize } as any;
        chunks.push({ id: `slice_${chunkX}_${chunkY}`, bounds, resolution: 100, tiles: [], loadedAt: Date.now(), priority: 1 } as any);
      }
    }
    return chunks;
  }
}
