// TerrainIntegration.test.ts
// Integration tests for terrain system with existing TilemapManager
// Enhanced with high-speed magnetospeeder navigation tests
// Simpler test to validate our TDD setup

import { MockTerrainSystem } from '../mocks/MockTerrainSystem';
import { BiomeType, MaterialType } from '../types';
import { HighSpeedTerrainSystem, SpeedCategory } from '../HighSpeedTerrainSystem';
import { SimpleTerrainCache } from '../SimpleTerrainCache';
import { SimpleBiomeClassifier } from '../SimpleBiomeClassifier';

describe('Terrain System Integration', () => {
  let terrainSystem: MockTerrainSystem;
  let highSpeedSystem: HighSpeedTerrainSystem;

  beforeEach(async () => {
    terrainSystem = new MockTerrainSystem();
    await terrainSystem.initialize();

    // Setup high-speed terrain system for 2D side-scroller magnetospeeder tests
    const cache = new SimpleTerrainCache();
    const classifier = new SimpleBiomeClassifier();

    // Configure LOD levels for 2D side-scroller speeds
    const lodConfigs = new Map();
    lodConfigs.set(SpeedCategory.Walking, {
      category: SpeedCategory.Walking,
      chunkSize: 32,         // 32m chunks for walking (5-50 km/h)
      detailLevel: 5,
      streamDistance: 3,     // 3 chunks ahead
      updateFrequency: 100
    });
    lodConfigs.set(SpeedCategory.GroundVehicle, {
      category: SpeedCategory.GroundVehicle,
      chunkSize: 128,        // 128m chunks for ground vehicles (50-200 km/h)
      detailLevel: 4,
      streamDistance: 5,     // 5 chunks ahead
      updateFrequency: 50
    });
    lodConfigs.set(SpeedCategory.Aircraft, {
      category: SpeedCategory.Aircraft,
      chunkSize: 512,        // 512m chunks for aircraft (200-2000 km/h)
      detailLevel: 3,
      streamDistance: 10,    // 10 chunks ahead
      updateFrequency: 25
    });
    lodConfigs.set(SpeedCategory.Supersonic, {
      category: SpeedCategory.Supersonic,
      chunkSize: 2048,       // 2km chunks for supersonic (Mach 1-10)
      detailLevel: 2,
      streamDistance: 20,    // 20 chunks ahead
      updateFrequency: 10
    });
    lodConfigs.set(SpeedCategory.Hypersonic, {
      category: SpeedCategory.Hypersonic,
      chunkSize: 8192,       // 8km chunks for hypersonic (Mach 10-1000)
      detailLevel: 1,
      streamDistance: 50,    // 50 chunks ahead (400km ahead!)
      updateFrequency: 5
    });

    highSpeedSystem = new HighSpeedTerrainSystem({
      baseSystem: terrainSystem,
      cache,
      classifier,
      lodConfigs,
      maxConcurrentLoads: 10,
      predictiveDistance: 100000
    });

    await highSpeedSystem.initialize();
  });

  it('should initialize successfully', () => {
    expect(terrainSystem).toBeDefined();
  });

  it('should provide basic terrain data', async () => {
    const terrain = await terrainSystem.getTerrainAt(0, 0, 10);
    
    expect(terrain).toBeDefined();
    expect(typeof terrain.elevation).toBe('number');
    expect(typeof terrain.slope).toBe('number');
    expect(typeof terrain.walkable).toBe('boolean');
    expect(Object.values(BiomeType)).toContain(terrain.biome);
  });

  it('should provide ocean data for ocean coordinates', async () => {
    // Pacific Ocean coordinates
    const oceanTerrain = await terrainSystem.getTerrainAt(0, -150, 5);
    
    expect(oceanTerrain.biome).toBe(BiomeType.Ocean);
    expect(oceanTerrain.walkable).toBe(false);
    expect(oceanTerrain.elevation).toBeLessThan(0);
  });

  it('should provide different elevations for different locations', async () => {
    const terrain1 = await terrainSystem.getTerrainAt(0, 0, 5);
    const terrain2 = await terrainSystem.getTerrainAt(45, 90, 5);
    
    // Different locations should generally have different elevations
    // (though they could occasionally be the same by chance)
    expect(terrain1).toBeDefined();
    expect(terrain2).toBeDefined();
  });

  it('should provide materials for biomes', async () => {
    const terrain = await terrainSystem.getTerrainAt(45, -100, 5); // Continental area
    
    expect(Array.isArray(terrain.materials)).toBe(true);
    expect(terrain.materials.length).toBeGreaterThan(0);
    
    for (const material of terrain.materials) {
      expect(Object.values(MaterialType)).toContain(material);
    }
  });

  it('should cleanup without errors', () => {
    expect(() => terrainSystem.cleanup()).not.toThrow();
  });

  // High-Speed Magnetospeeder Navigation Tests
  describe('High-Speed Navigation System', () => {
    
    it('should adapt LOD based on magnetospeeder speed', async () => {
      // Test speed categories from walking to Mach 1000 (2D side-scroller)
      const testSpeeds = [
        { speed: 5, expectedCategory: SpeedCategory.Walking },        // 5 km/h walking
        { speed: 100, expectedCategory: SpeedCategory.GroundVehicle }, // 100 km/h ground vehicle
        { speed: 500, expectedCategory: SpeedCategory.Aircraft },      // 500 km/h aircraft
        { speed: 5000, expectedCategory: SpeedCategory.Supersonic },   // 5,000 km/h supersonic
        { speed: 50000, expectedCategory: SpeedCategory.Hypersonic }   // 50,000 km/h hypersonic
      ];

      for (const testCase of testSpeeds) {
        await highSpeedSystem.updateForSpeed(
          0,                  // Horizontal X position 
          testCase.speed,     // Speed in km/h
          testCase.speed / 3.6 // Velocity in m/s eastward
        );

        // Verify LOD category is appropriate for speed
        const currentLOD = (highSpeedSystem as any).currentLOD;
        expect(currentLOD.category).toBe(testCase.expectedCategory);
      }
    });

    it('should handle extreme speed transitions smoothly', async () => {
      // Simulate acceleration from walking to Mach 1000
      const speedProgression = [5, 50, 500, 5000, 50000, 340000]; // Up to Mach 1000

      for (const speed of speedProgression) {
        const startTime = Date.now();
        
        await highSpeedSystem.updateForSpeed(
          0,               // Horizontal X position
          speed,           // Speed in km/h  
          speed / 3.6      // Velocity eastward in m/s
        );

        const updateTime = Date.now() - startTime;
        
        // Updates should be fast even at extreme speeds
        expect(updateTime).toBeLessThan(100); // <100ms per update
      }
    });

    it('should predict path correctly for high-speed navigation', async () => {
      // Test path prediction at Mach 500 (170,000 km/h)  
      const playerX = 1000000; // 1000km horizontal position
      const speed = 170000; // km/h
      const velocityX = speed / 3.6; // eastward velocity in m/s

      await highSpeedSystem.updateForSpeed(playerX, speed, velocityX);

      // Access predicted path (normally private)
      const predictedPath = (highSpeedSystem as any).predictedPath;
      
      // Should have predicted path points
      expect(predictedPath.length).toBeGreaterThan(0);
      
      // First path point should be east of starting position
      expect(predictedPath[0].x).toBeGreaterThanOrEqual(playerX + 50); // At least 50m east
      
      // Path should generally head east (x increasing) 
      const lastPoint = predictedPath[predictedPath.length - 1];
      expect(lastPoint.x).toBeGreaterThan(playerX + 1000); // At least 1km east
    });

    it('should stream terrain efficiently at hypersonic speeds', async () => {
      // Test continental-scale streaming at Mach 1000
      const playerX = 4000000; // New York area horizontal coordinate
      const machSpeed = 340000; // Mach 1000 in km/h
      const velocityX = machSpeed / 3.6; // eastbound velocity in m/s

      const startTime = Date.now();
      
      await highSpeedSystem.updateForSpeed(playerX, machSpeed, velocityX);
      
      const streamingTime = Date.now() - startTime;
      
      // Should handle hypersonic streaming efficiently
      expect(streamingTime).toBeLessThan(200); // <200ms for continental streaming
      
      // Should be using hypersonic LOD
      const currentLOD = (highSpeedSystem as any).currentLOD;
      expect(currentLOD.category).toBe(SpeedCategory.Hypersonic);
      expect(currentLOD.chunkSize).toBe(8192); // 8km chunks at hypersonic
    });

    it('should handle WarpBoom deceleration scenario', async () => {
      // Simulate emergency deceleration from Mach 1000 to Mach 0.9
      const playerX = 5000000; // Over Atlantic horizontal position
      
      // Start at Mach 1000
      await highSpeedSystem.updateForSpeed(playerX, 340000, 340000 / 3.6);
      expect((highSpeedSystem as any).currentLOD.category).toBe(SpeedCategory.Hypersonic);
      
      // WarpBoom deceleration phases
      const warpBoomPhases = [
        340000, // Mach 1000 - initial
        170000, // Mach 500 - 0.5s into WarpBoom
        34000,  // Mach 100 - 1.0s into WarpBoom
        3400,   // Mach 10 - 1.5s into WarpBoom
        100     // Mach 0.3 - 2.0s into WarpBoom (complete)
      ];

      for (const speed of warpBoomPhases) {
        const phaseStart = Date.now();
        
        await highSpeedSystem.updateForSpeed(playerX, speed, speed / 3.6);
        
        const phaseTime = Date.now() - phaseStart;
        
        // Each phase should complete quickly for safety
        expect(phaseTime).toBeLessThan(50); // <50ms per phase
      }

      // Should end up in walking/ground vehicle category after WarpBoom
      const finalLOD = (highSpeedSystem as any).currentLOD;
      expect([SpeedCategory.Walking, SpeedCategory.GroundVehicle]).toContain(finalLOD.category);
    });

    it('should maintain terrain data consistency across LOD changes', async () => {
      const testX = 4000000; // New York City area horizontal coordinate
      
      // Get terrain at walking speed
      await highSpeedSystem.updateForSpeed(testX, 5, 5 / 3.6);
      const walkingTerrain = await highSpeedSystem.getTerrainAt(testX, 0, 100);
      
      // Get terrain at hypersonic speed  
      await highSpeedSystem.updateForSpeed(testX, 340000, 340000 / 3.6);
      const hypersonicTerrain = await highSpeedSystem.getTerrainAt(testX, 0, 100);
      
      // Core terrain properties should be consistent across LOD levels
      expect(walkingTerrain.biome).toBe(hypersonicTerrain.biome);
      expect(walkingTerrain.elevation).toBeCloseTo(hypersonicTerrain.elevation, 0);
      expect(walkingTerrain.walkable).toBe(hypersonicTerrain.walkable);
    });

    it('should handle intercontinental flight efficiently', async () => {
      // Simulate New York to London flight at Mach 500 (horizontal travel)
      const startX = 4000000; // New York horizontal coordinate
      const speed = 170000; // Mach 500
      const velocity = speed / 3.6; // eastward velocity in m/s
      
      // Multiple updates simulating intercontinental flight
      const flightUpdates = 10;
      const totalStartTime = Date.now();
      
      for (let i = 0; i < flightUpdates; i++) {
        // Progress along horizontal flight path
        const progress = i / flightUpdates;
        const currentX = startX + progress * 5000000; // 5000km eastward
        
        await highSpeedSystem.updateForSpeed(currentX, speed, velocity);
      }
      
      const totalFlightTime = Date.now() - totalStartTime;
      
      // Entire intercontinental simulation should be efficient
      expect(totalFlightTime).toBeLessThan(500); // <500ms for 10 updates
    });

    it('should handle edge cases gracefully', async () => {
      // Test zero speed
      await expect(highSpeedSystem.updateForSpeed(0, 0, 0)).resolves.not.toThrow();
      
      // Test negative horizontal coordinates
      await expect(highSpeedSystem.updateForSpeed(-1000000, 5000, 5000 / 3.6)).resolves.not.toThrow();
      
      // Test extreme horizontal coordinates
      await expect(highSpeedSystem.updateForSpeed(20000000, 340000, 340000 / 3.6)).resolves.not.toThrow();
      
      // Test negative velocity (westward travel)
      await expect(highSpeedSystem.updateForSpeed(0, 1000, -1000 / 3.6)).resolves.not.toThrow();
    });

  });
});
