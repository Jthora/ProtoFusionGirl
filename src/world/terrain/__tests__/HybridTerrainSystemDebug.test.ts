// HybridTerrainSystemDebug.test.ts
// Debug test to understand cache key generation

import { HybridTerrainSystem } from '../HybridTerrainSystem';
import { SimpleTerrainCache } from '../SimpleTerrainCache';
import { SimpleCoordinateConverter } from '../SimpleCoordinateConverter';
import { SimpleBiomeClassifier } from '../SimpleBiomeClassifier';

describe('HybridTerrainSystem Cache Debug', () => {
  let terrainSystem: HybridTerrainSystem;
  let cache: SimpleTerrainCache;

  beforeEach(async () => {
    cache = new SimpleTerrainCache(3, 60000); // Very small cache
    const coordinateConverter = new SimpleCoordinateConverter();
    const biomeClassifier = new SimpleBiomeClassifier();
    
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

  it('should generate unique cache keys and respect size limits', async () => {
    console.log('Starting cache test with max size:', 3);
    
    // Test coordinates that should generate unique cache keys
    const coords = [
      [10.1234, 20.5678],
      [30.9876, 40.1111],
      [50.5555, 60.8888],
      [70.2222, 80.7777],
      [85.3333, 100.4444]
    ];
    
    for (let i = 0; i < coords.length; i++) {
      const [lat, lon] = coords[i];
      const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)},10`;
      console.log(`Adding coord ${i + 1}: (${lat}, ${lon}) -> cache key: ${cacheKey}`);
      
      await terrainSystem.getTerrainAt(lat, lon, 10);
      
      const stats = cache.getDetailedStats();
      console.log(`  After request ${i + 1}: size=${stats.size}, evictions=${stats.evictions}`);
    }
    
    const finalStats = cache.getStats();
    console.log('Final cache stats:', finalStats);
    
    expect(finalStats.size).toBeLessThanOrEqual(3);
  });
});
