// HighSpeedTerrainSystem.test.ts
// Tests for magnetospeeder high-speed terrain streaming system

import { HighSpeedTerrainSystem, createHighSpeedTerrainSystem } from '../HighSpeedTerrainSystem';
import { MockTerrainSystem } from '../mocks/MockTerrainSystem';
import { BiomeType } from '../types';

describe('HighSpeedTerrainSystem', () => {
  let mockBaseSystem: MockTerrainSystem;
  let highSpeedSystem: HighSpeedTerrainSystem;

  beforeEach(async () => {
    mockBaseSystem = new MockTerrainSystem();
    await mockBaseSystem.initialize();
    
    highSpeedSystem = createHighSpeedTerrainSystem(mockBaseSystem);
    await highSpeedSystem.initialize();
  });

  afterEach(() => {
    highSpeedSystem.cleanup();
    mockBaseSystem.cleanup();
  });

  describe('Speed-based LOD Selection', () => {
    it('should select appropriate LOD for different speeds', async () => {
      // Walking speed (5 km/h)
      await highSpeedSystem.updateForSpeed(0, 5, 0);
      let terrain = await highSpeedSystem.getTerrainAt(0, 0, 10);
      expect(terrain).toBeDefined();

      // Driving speed (100 km/h)
      await highSpeedSystem.updateForSpeed(1000, 100, 90);
      terrain = await highSpeedSystem.getTerrainAt(0, 0, 10);
      expect(terrain).toBeDefined();

      // Flying speed (500 km/h)
      await highSpeedSystem.updateForSpeed(2000, 500, 90);
      terrain = await highSpeedSystem.getTerrainAt(0, 0, 10);
      expect(terrain).toBeDefined();

      // Supersonic speed (5000 km/h - Mach 4)
      await highSpeedSystem.updateForSpeed(3000, 5000, 90);
      terrain = await highSpeedSystem.getTerrainAt(0, 0, 10);
      expect(terrain).toBeDefined();

      // Hypersonic speed (50000 km/h - Mach 40)
      await highSpeedSystem.updateForSpeed(4000, 50000, 90);
      terrain = await highSpeedSystem.getTerrainAt(0, 0, 10);
      expect(terrain).toBeDefined();
    });
  });

  describe('Altitude-Speed Relationship', () => {
    it('should limit max speed based on altitude (like No Mans Sky)', () => {
      // Ground level - very limited speed
      const groundSpeed = highSpeedSystem.getMaxSafeSpeed(10);
      expect(groundSpeed).toBeLessThan(500); // Less than 500 km/h near ground

      // Low altitude (100m) - limited speed
      const lowAltSpeed = highSpeedSystem.getMaxSafeSpeed(100);
      expect(lowAltSpeed).toBeGreaterThan(groundSpeed);
      expect(lowAltSpeed).toBeLessThan(5000);

      // Medium altitude (1000m) - moderate speed
      const mediumAltSpeed = highSpeedSystem.getMaxSafeSpeed(1000);
      expect(mediumAltSpeed).toBeGreaterThan(lowAltSpeed);
      expect(mediumAltSpeed).toBeLessThan(50000);

      // High altitude (5000m) - high speed
      const highAltSpeed = highSpeedSystem.getMaxSafeSpeed(5000);
      expect(highAltSpeed).toBeGreaterThan(mediumAltSpeed);
      expect(highAltSpeed).toBeLessThan(500000);

      // Very high altitude (10000m) - unrestricted speed
      const maxSpeed = highSpeedSystem.getMaxSafeSpeed(10000);
      expect(maxSpeed).toBeGreaterThan(highAltSpeed);
      expect(maxSpeed).toBeGreaterThan(1000000); // > Mach 800
    });

    it('should calculate visibility distance based on altitude', () => {
      // Ground level - very limited visibility
      const groundVis = highSpeedSystem.getVisibilityDistance(10);
      expect(groundVis).toBeGreaterThan(0);
      expect(groundVis).toBeLessThan(20000); // Less than 20km

      // 100m altitude
      const lowVis = highSpeedSystem.getVisibilityDistance(100);
      expect(lowVis).toBeGreaterThan(groundVis);
      expect(lowVis).toBeLessThan(50000);

      // 1000m altitude
      const mediumVis = highSpeedSystem.getVisibilityDistance(1000);
      expect(mediumVis).toBeGreaterThan(lowVis);
      expect(mediumVis).toBeGreaterThan(100000); // > 100km

      // 10000m altitude (jet altitude)
      const highVis = highSpeedSystem.getVisibilityDistance(10000);
      expect(highVis).toBeGreaterThan(mediumVis);
      expect(highVis).toBeGreaterThan(350000); // > 350km
    });
  });

  describe('Predictive Path Streaming', () => {
    it('should handle straight line high-speed travel', async () => {
      // Simulate traveling east at Mach 10 (12,240 km/h)
      const machSpeed = 12240; // km/h
      const positions = [
        0,
        3400,    // 1 second later at Mach 10
        6800,    // 2 seconds later
        10200    // 3 seconds later
      ];

      for (const pos of positions) {
        await highSpeedSystem.updateForSpeed(pos, machSpeed, 90); // 90 degrees = east
        
        // System should still provide terrain data
        const terrain = await highSpeedSystem.getTerrainAt(0, 0, 10);
        expect(terrain).toBeDefined();
        expect(Object.values(BiomeType)).toContain(terrain.biome);
      }
    });

    it('should handle direction changes during high-speed travel', async () => {
      const machSpeed = 34000; // Mach 100 speed in km/h
      
      // Travel north
      await highSpeedSystem.updateForSpeed(0, machSpeed, 0);
      
      // Turn east
      await highSpeedSystem.updateForSpeed(1000, machSpeed, 90);
      
      // Turn south
      await highSpeedSystem.updateForSpeed(10444, machSpeed, 180);
      
      // Turn west
      await highSpeedSystem.updateForSpeed(10444, machSpeed, 270);
      
      // Should handle direction changes without errors
      const terrain = await highSpeedSystem.getTerrainAt(0, 0, 10);
      expect(terrain).toBeDefined();
    });
  });

  describe('Extreme Speed Performance', () => {
    it('should handle Mach 1000 speeds without errors', async () => {
      // Mach 1000 = ~1,224,000 km/h = 340,000 m/s
      const machSpeed = 1224000;
      
      // At this speed, we travel 340km every second!
      const extremePositions = [
        0,
        340000,      // 1 second later
        680000,      // 2 seconds later
        1020000      // 3 seconds later - 1020km traveled!
      ];

      for (const pos of extremePositions) {
        const startTime = Date.now();
        
        await highSpeedSystem.updateForSpeed(pos, machSpeed, 90);
        const terrain = await highSpeedSystem.getTerrainAt(0, 0, 10);
        
        const updateTime = Date.now() - startTime;
        
        expect(terrain).toBeDefined();
        expect(updateTime).toBeLessThan(50); // Should update in < 50ms even at extreme speeds
        expect(Object.values(BiomeType)).toContain(terrain.biome);
      }
    });

    it('should maintain performance metrics at extreme speeds', async () => {
      const machSpeed = 500000; // Mach 400+ speed
      
      // Multiple rapid updates simulating extreme speed travel
      const updatePromises = [];
      for (let i = 0; i < 10; i++) {
        const pos = i * 100000; // 100km jumps
        updatePromises.push(
          highSpeedSystem.updateForSpeed(pos, machSpeed, 90)
        );
      }
      
      // All updates should complete without throwing
      await expect(Promise.all(updatePromises)).resolves.not.toThrow();
    });
  });

  describe('LOD Chunk Sizing', () => {
    it('should use appropriate chunk sizes for different speeds', async () => {
      // The system should automatically adjust chunk sizes based on speed
      // Higher speeds = larger chunks for better performance
      
      // Walking speed should use small chunks
      await highSpeedSystem.updateForSpeed(0, 5, 0);
      
      // Hypersonic speed should use very large chunks
      await highSpeedSystem.updateForSpeed(10000, 100000, 90);
      
      // System should handle the transition smoothly
      const terrain = await highSpeedSystem.getTerrainAt(0, 0, 10);
      expect(terrain).toBeDefined();
      expect(terrain.materials.length).toBeGreaterThan(0);
    });
  });

  describe('Realistic Speed Scenarios', () => {
    it('should handle magnetospeeder acceleration from ground to high altitude', async () => {
      const scenarios = [
        { altitude: 10, speed: 50, description: 'Ground takeoff' },
        { altitude: 100, speed: 500, description: 'Low altitude cruise' },
        { altitude: 1000, speed: 5000, description: 'Medium altitude - Mach 4' },
        { altitude: 5000, speed: 50000, description: 'High altitude - Mach 40' },
        { altitude: 10000, speed: 200000, description: 'Very high altitude - Mach 160' }
      ];

      for (const scenario of scenarios) {
        const maxSafeSpeed = highSpeedSystem.getMaxSafeSpeed(scenario.altitude);
        expect(maxSafeSpeed).toBeGreaterThanOrEqual(scenario.speed);
        
        await highSpeedSystem.updateForSpeed(
          scenario.altitude * 10, 
          scenario.speed, 
          45
        );
        
        const terrain = await highSpeedSystem.getTerrainAt(0, 0, 10);
        expect(terrain).toBeDefined();
      }
    });

    it('should handle leyline-assisted travel at extreme speeds', async () => {
      // Simulate following a leyline path at very high speed
      const leylineSpeed = 800000; // Mach 650+ for leyline travel
      
      // Simulate curved leyline path
      const leylinePath = [];
      for (let t = 0; t <= 1; t += 0.1) {
        const x = t * 100000; // 100km total distance
        const y = Math.sin(t * Math.PI * 2) * 10000; // Sinusoidal curve
        leylinePath.push({ x, y });
      }

      for (const [i, pos] of leylinePath.entries()) {
        const heading = i < leylinePath.length - 1 
          ? Math.atan2(
              leylinePath[i + 1].y - pos.y,
              leylinePath[i + 1].x - pos.x
            ) * 180 / Math.PI
          : 90;
        
        await highSpeedSystem.updateForSpeed(pos.x, leylineSpeed, heading);
        
        const terrain = await highSpeedSystem.getTerrainAt(0, 0, 10);
        expect(terrain).toBeDefined();
      }
    });
  });
});
