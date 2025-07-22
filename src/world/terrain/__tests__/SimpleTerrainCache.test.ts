// SimpleTerrainCache.test.ts
// Unit tests for terrain cache

import { SimpleTerrainCache } from '../SimpleTerrainCache';
import { TerrainData, BiomeType, MaterialType } from '../types';

describe('SimpleTerrainCache', () => {
  let cache: SimpleTerrainCache;

  beforeEach(() => {
    cache = new SimpleTerrainCache(3, 60000); // Very small cache for testing
  });

  it('should maintain size limits', () => {
    const sampleTerrain: TerrainData = {
      elevation: 100,
      slope: 5,
      aspect: 90,
      biome: BiomeType.Plains,
      walkable: true,
      materials: [MaterialType.Organic],
      features: []
    };

    console.log('Max size:', 3);
    
    // Add more items than cache can hold (using unique keys)
    for (let i = 0; i < 5; i++) {
      const uniqueKey = `unique_key_${i}_${Date.now()}_${Math.random()}`;
      cache.set(uniqueKey, sampleTerrain);
      const currentStats = cache.getDetailedStats();
      console.log(`After adding ${i + 1} items: size=${currentStats.size}, evictions=${currentStats.evictions}`);
    }

    const stats = cache.getStats();
    console.log('Final cache stats:', stats);
    
    expect(stats.size).toBeLessThanOrEqual(3);
  });

  it('should store and retrieve items', () => {
    const sampleTerrain: TerrainData = {
      elevation: 100,
      slope: 5,
      aspect: 90,
      biome: BiomeType.Plains,
      walkable: true,
      materials: [MaterialType.Organic],
      features: []
    };

    cache.set('test', sampleTerrain);
    const retrieved = cache.get('test');
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.elevation).toBe(100);
  });
});
