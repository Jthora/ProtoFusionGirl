// HighSpeedTerrainDebug.test.ts
// Debug test for high-speed terrain system

import { HighSpeedTerrainSystem, createHighSpeedTerrainSystem } from '../HighSpeedTerrainSystem';
import { MockTerrainSystem } from '../mocks/MockTerrainSystem';

describe('HighSpeedTerrainSystem Debug', () => {
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

  it('should handle simple updateForSpeed call', async () => {
    try {
      await highSpeedSystem.updateForSpeed({ x: 0, y: 0 }, 10, 0);
      expect(true).toBe(true); // If we get here, no error was thrown
    } catch (error) {
      console.error('Error in updateForSpeed:', error);
      throw error;
    }
  });

  it('should handle getMaxSafeSpeed call', () => {
    let speed;
    expect(() => {
      speed = highSpeedSystem.getMaxSafeSpeed(100);
    }).not.toThrow();
    
    expect(speed).toBeDefined();
  });

  it('should handle getVisibilityDistance call', () => {
    try {
      const distance = highSpeedSystem.getVisibilityDistance(100);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1000000); // Reasonable upper bound
    } catch (error) {
      console.error('Error in getVisibilityDistance:', error);
      throw error;
    }
  });
});
