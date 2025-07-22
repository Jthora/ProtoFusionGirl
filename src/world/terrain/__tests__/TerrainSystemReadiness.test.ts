// TerrainSystemReadiness.test.ts
// Verification that our TDD terrain system is ready for next iteration
// This test validates that all core components work together

import { MockTerrainSystem } from '../mocks/MockTerrainSystem';
import { HybridTerrainSystem } from '../HybridTerrainSystem';
import { SimpleCoordinateConverter } from '../SimpleCoordinateConverter';
import { SimpleBiomeClassifier } from '../SimpleBiomeClassifier';
import { SimpleTerrainCache } from '../SimpleTerrainCache';
import { BiomeType, MaterialType } from '../types';

describe('Terrain System Readiness', () => {
  describe('Mock System', () => {
    let mockSystem: MockTerrainSystem;

    beforeEach(async () => {
      mockSystem = new MockTerrainSystem();
      await mockSystem.initialize();
    });

    afterEach(() => {
      mockSystem.cleanup();
    });

    it('provides consistent and realistic terrain data', async () => {
      // Test multiple locations for consistency
      const locations = [
        [40.7128, -74.0060], // NYC
        [51.5074, -0.1278],  // London
        [35.6762, 139.6503], // Tokyo
        [-33.8688, 151.2093], // Sydney
      ];

      for (const [lat, lon] of locations) {
        const terrain = await mockSystem.getTerrainAt(lat, lon, 10);
        
        expect(terrain).toBeDefined();
        expect(typeof terrain.elevation).toBe('number');
        expect(typeof terrain.slope).toBe('number');
        expect(typeof terrain.walkable).toBe('boolean');
        expect(Object.values(BiomeType)).toContain(terrain.biome);
        expect(Array.isArray(terrain.materials)).toBe(true);
        expect(terrain.materials.length).toBeGreaterThan(0);
        
        // Same location should return same data (deterministic)
        const terrain2 = await mockSystem.getTerrainAt(lat, lon, 10);
        expect(terrain).toEqual(terrain2);
      }
    });
  });

  describe('Real System Components', () => {
    let hybridSystem: HybridTerrainSystem;
    let cache: SimpleTerrainCache;
    let converter: SimpleCoordinateConverter;
    let classifier: SimpleBiomeClassifier;

    beforeEach(async () => {
      cache = new SimpleTerrainCache(100, 60000);
      converter = new SimpleCoordinateConverter();
      classifier = new SimpleBiomeClassifier();
      hybridSystem = new HybridTerrainSystem(cache, converter, classifier);
      await hybridSystem.initialize();
    });

    afterEach(() => {
      hybridSystem.cleanup();
    });

    it('coordinates conversion works properly', () => {
      // Test coordinate conversion
      const tile = converter.latLonToTile(40.7128, -74.0060);
      expect(tile.x).toBeGreaterThan(0);
      expect(tile.y).toBeGreaterThan(0);
      
      const latLon = converter.tileToLatLon(tile.x, tile.y);
      expect(Math.abs(latLon.lat - 40.7128)).toBeLessThan(0.1);
      expect(Math.abs(latLon.lon - (-74.0060))).toBeLessThan(0.1);
    });

    it('biome classification provides appropriate materials', () => {
      const oceanBiome = classifier.classifyBiome(-100, 0);
      expect(oceanBiome).toBe(BiomeType.Ocean);
      
      const oceanMaterials = classifier.getBiomeMaterials(BiomeType.Ocean);
      expect(oceanMaterials).toContain(MaterialType.Water);
      expect(classifier.isBiomeWalkable(BiomeType.Ocean)).toBe(false);
      
      const plainsBiome = classifier.classifyBiome(100, 30);
      expect(classifier.isBiomeWalkable(plainsBiome)).toBe(true);
    });

    it('hybrid system provides realistic terrain', async () => {
      const terrain = await hybridSystem.getTerrainAt(40.7128, -74.0060, 10);
      
      expect(terrain).toBeDefined();
      expect(Object.values(BiomeType)).toContain(terrain.biome);
      expect(Array.isArray(terrain.materials)).toBe(true);
      expect(terrain.materials.length).toBeGreaterThan(0);
      
      for (const material of terrain.materials) {
        expect(Object.values(MaterialType)).toContain(material);
      }
    });

    it('cache maintains performance', async () => {
      // Make multiple requests to same location
      const lat = 40.7128, lon = -74.0060, radius = 10;
      
      const terrain1 = await hybridSystem.getTerrainAt(lat, lon, radius);
      const terrain2 = await hybridSystem.getTerrainAt(lat, lon, radius);
      
      // Should return same data (cached)
      expect(terrain1).toEqual(terrain2);
      
      const stats = cache.getStats();
      expect(stats.hits).toBeGreaterThan(0);
    });
  });

  describe('System Integration', () => {
    it('mock and real systems provide compatible data structures', async () => {
      const mockSystem = new MockTerrainSystem();
      await mockSystem.initialize();
      
      const cache = new SimpleTerrainCache(10, 60000);
      const converter = new SimpleCoordinateConverter();
      const classifier = new SimpleBiomeClassifier();
      const hybridSystem = new HybridTerrainSystem(cache, converter, classifier);
      await hybridSystem.initialize();
      
      const lat = 40.7128, lon = -74.0060, radius = 10;
      
      const mockTerrain = await mockSystem.getTerrainAt(lat, lon, radius);
      const hybridTerrain = await hybridSystem.getTerrainAt(lat, lon, radius);
      
      // Both should have same structure
      expect(typeof mockTerrain.elevation).toBe(typeof hybridTerrain.elevation);
      expect(typeof mockTerrain.slope).toBe(typeof hybridTerrain.slope);
      expect(typeof mockTerrain.walkable).toBe(typeof hybridTerrain.walkable);
      expect(Array.isArray(mockTerrain.materials)).toBe(Array.isArray(hybridTerrain.materials));
      expect(Array.isArray(mockTerrain.features)).toBe(Array.isArray(hybridTerrain.features));
      
      mockSystem.cleanup();
      hybridSystem.cleanup();
    });
  });
});
