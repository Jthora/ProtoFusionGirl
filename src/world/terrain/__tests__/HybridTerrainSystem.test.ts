// HybridTerrainSystem.test.ts
// Integration tests for the real HybridTerrainSystem implementation
// Tests integration with existing TilemapManager and components

import { HybridTerrainSystem } from '../HybridTerrainSystem';
import { SimpleTerrainCache } from '../SimpleTerrainCache';
import { SimpleCoordinateConverter } from '../SimpleCoordinateConverter';
import { SimpleBiomeClassifier } from '../SimpleBiomeClassifier';
import { BiomeType, MaterialType } from '../types';

describe('HybridTerrainSystem Implementation', () => {
  let terrainSystem: HybridTerrainSystem;
  let cache: SimpleTerrainCache;
  let coordinateConverter: SimpleCoordinateConverter;
  let biomeClassifier: SimpleBiomeClassifier;

  beforeEach(async () => {
    cache = new SimpleTerrainCache(100, 5 * 60 * 1000); // 5 minutes TTL
    coordinateConverter = new SimpleCoordinateConverter();
    biomeClassifier = new SimpleBiomeClassifier();
    
    terrainSystem = new HybridTerrainSystem(
      cache,
      coordinateConverter,
      biomeClassifier
    );
    
    await terrainSystem.initialize();
  });

  afterEach(() => {
    terrainSystem.cleanup();
  });

  it('should initialize without errors', () => {
    expect(terrainSystem).toBeDefined();
  });

  it('should provide terrain data with all required properties', async () => {
    const terrain = await terrainSystem.getTerrainAt(40.7128, -74.0060, 10); // NYC
    
    expect(terrain).toBeDefined();
    expect(typeof terrain.elevation).toBe('number');
    expect(typeof terrain.slope).toBe('number');
    expect(typeof terrain.aspect).toBe('number');
    expect(Object.values(BiomeType)).toContain(terrain.biome);
    expect(typeof terrain.walkable).toBe('boolean');
    expect(Array.isArray(terrain.materials)).toBe(true);
    expect(Array.isArray(terrain.features)).toBe(true);
  });

  it('should cache terrain data for repeated requests', async () => {
    const lat = 45.0, lon = -75.0, radius = 5;
    
    // First request
    const terrain1 = await terrainSystem.getTerrainAt(lat, lon, radius);
    const stats1 = cache.getStats();
    
    // Second request (should hit cache)
    const terrain2 = await terrainSystem.getTerrainAt(lat, lon, radius);
    const stats2 = cache.getStats();
    
    expect(terrain1).toEqual(terrain2);
    expect(stats2.hits).toBeGreaterThan(stats1.hits);
  });

  it('should stream terrain chunks around player position', async () => {
    const playerPos = { x: 1000, y: 2000 };
    const chunks = await terrainSystem.streamChunksAround(playerPos);
    
    expect(Array.isArray(chunks)).toBe(true);
    expect(chunks.length).toBeGreaterThan(0);
    
    // Check chunk structure
    for (const chunk of chunks) {
      expect(typeof chunk.id).toBe('string');
      expect(chunk.bounds).toBeDefined();
      expect(chunk.bounds.minX).toBeLessThan(chunk.bounds.maxX);
      expect(chunk.bounds.minY).toBeLessThan(chunk.bounds.maxY);
      expect(chunk.resolution).toBeGreaterThan(0);
      expect(chunk.loadedAt).toBeGreaterThan(0);
      expect(chunk.priority).toBeGreaterThanOrEqual(0);
    }
  });

  it('should handle coordinate conversion correctly', () => {
    const lat = 40.7128, lon = -74.0060;
    
    // Convert to tile coordinates and back
    const tile = coordinateConverter.latLonToTile(lat, lon);
    const latLon = coordinateConverter.tileToLatLon(tile.x, tile.y);
    
    // Should be approximately the same (allowing for rounding)
    expect(Math.abs(latLon.lat - lat)).toBeLessThan(0.01);
    expect(Math.abs(latLon.lon - lon)).toBeLessThan(0.01);
  });

  it('should classify biomes appropriately', () => {
    // Test various elevation and latitude combinations
    
    // Ocean
    const oceanBiome = biomeClassifier.classifyBiome(-100, 0);
    expect(oceanBiome).toBe(BiomeType.Ocean);
    
    // Mountain
    const mountainBiome = biomeClassifier.classifyBiome(3000, 45);
    expect(mountainBiome).toBe(BiomeType.Mountain);
    
    // Arctic
    const arcticBiome = biomeClassifier.classifyBiome(100, 75);
    expect(arcticBiome).toBe(BiomeType.Arctic);
    
    // Desert (hot, low precipitation)
    const desertBiome = biomeClassifier.classifyBiome(200, 25, 35, 100);
    expect(desertBiome).toBe(BiomeType.Desert);
  });

  it('should provide appropriate materials for biomes', () => {
    const mountainMaterials = biomeClassifier.getBiomeMaterials(BiomeType.Mountain);
    expect(mountainMaterials).toContain(MaterialType.Stone);
    expect(mountainMaterials).toContain(MaterialType.Metal);
    
    const forestMaterials = biomeClassifier.getBiomeMaterials(BiomeType.Forest);
    expect(forestMaterials).toContain(MaterialType.Wood);
    expect(forestMaterials).toContain(MaterialType.Organic);
    
    const oceanMaterials = biomeClassifier.getBiomeMaterials(BiomeType.Ocean);
    expect(oceanMaterials).toContain(MaterialType.Water);
  });

  it('should determine walkability correctly', () => {
    expect(biomeClassifier.isBiomeWalkable(BiomeType.Ocean)).toBe(false);
    expect(biomeClassifier.isBiomeWalkable(BiomeType.Plains)).toBe(true);
    expect(biomeClassifier.isBiomeWalkable(BiomeType.Mountain)).toBe(true);
    expect(biomeClassifier.isBiomeWalkable(BiomeType.Desert)).toBe(true);
  });

  it('should handle coordinate wrapping', () => {
    const coords1 = coordinateConverter.wrapCoordinates(0, 1000);
    const coords2 = coordinateConverter.wrapCoordinates(40075017, 1000); // Exact Earth circumference
    
    expect(coords1.x).toBe(coords2.x); // Should wrap to same x coordinate
  });

  it('should provide Level of Detail based on distance', async () => {
    const playerPos = { x: 0, y: 0 };
    const chunks = await terrainSystem.streamChunksAround(playerPos);
    
    // Find closest and furthest chunks
    const distances = chunks.map(chunk => {
      const dx = chunk.bounds.centerX - playerPos.x;
      const dy = chunk.bounds.centerY - playerPos.y;
      return Math.sqrt(dx * dx + dy * dy);
    });
    
    const minDistance = Math.min(...distances);
    const maxDistance = Math.max(...distances);
    
    const closestChunk = chunks.find(chunk => {
      const dx = chunk.bounds.centerX - playerPos.x;
      const dy = chunk.bounds.centerY - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return Math.abs(distance - minDistance) < 0.1;
    });
    
    const furthestChunk = chunks.find(chunk => {
      const dx = chunk.bounds.centerX - playerPos.x;
      const dy = chunk.bounds.centerY - playerPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return Math.abs(distance - maxDistance) < 0.1;
    });
    
    if (closestChunk && furthestChunk) {
      // Closest chunk should have better resolution (lower value = higher detail)
      expect(closestChunk.resolution).toBeLessThanOrEqual(furthestChunk.resolution);
      // Closest chunk should have higher priority
      expect(closestChunk.priority).toBeGreaterThanOrEqual(furthestChunk.priority);
    }
  });

  it('should handle extreme coordinates gracefully', async () => {
    // Test extreme latitude/longitude values
    const extremeCoords = [
      [90, 180],   // North Pole, Eastern edge
      [-90, -180], // South Pole, Western edge
      [0, 0],      // Equator, Prime Meridian
      [45, 0],     // Mid-latitude, Prime Meridian
    ];
    
    for (const [lat, lon] of extremeCoords) {
      const terrain = await terrainSystem.getTerrainAt(lat, lon, 10);
      expect(terrain).toBeDefined();
      expect(Object.values(BiomeType)).toContain(terrain.biome);
    }
  });

  it('should maintain cache size limits', async () => {
    const smallCache = new SimpleTerrainCache(5, 60000); // Very small cache
    const smallTerrainSystem = new HybridTerrainSystem(
      smallCache,
      coordinateConverter,
      biomeClassifier
    );
    
    await smallTerrainSystem.initialize();
    
    // Make more requests than cache can hold with well-separated coordinates
    for (let i = 0; i < 10; i++) {
      // Use widely separated coordinates to ensure different cache keys
      const lat = i * 10; // 0, 10, 20, 30, ... 90
      const lon = i * 20; // 0, 20, 40, 60, ... 180
      await smallTerrainSystem.getTerrainAt(lat, lon, 10);
    }
    
    const stats = smallCache.getStats();
    expect(stats.size).toBeLessThanOrEqual(5);
    
    smallTerrainSystem.cleanup();
  });
});
