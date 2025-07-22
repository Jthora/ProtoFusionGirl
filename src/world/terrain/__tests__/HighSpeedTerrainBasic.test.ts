// HighSpeedTerrainBasic.test.ts
// Basic tests for high-speed terrain system

import { HighSpeedTerrainSystem, createHighSpeedTerrainSystem } from '../HighSpeedTerrainSystem';
import { MockTerrainSystem } from '../mocks/MockTerrainSystem';
import { BiomeType } from '../types';

describe('HighSpeedTerrainSystem Basic', () => {
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

  it('should initialize successfully', () => {
    expect(highSpeedSystem).toBeDefined();
  });

  it('should provide terrain data at slow speeds', async () => {
    await highSpeedSystem.updateForSpeed({ x: 0, y: 0 }, 10, 0);
    const terrain = await highSpeedSystem.getTerrainAt(0, 0, 10);
    
    expect(terrain).toBeDefined();
    expect(typeof terrain.elevation).toBe('number');
    expect(Object.values(BiomeType)).toContain(terrain.biome);
  });

  it('should handle basic speed updates', async () => {
    await highSpeedSystem.updateForSpeed({ x: 0, y: 0 }, 100, 90);
    await highSpeedSystem.updateForSpeed({ x: 1000, y: 0 }, 1000, 90);
    
    const terrain = await highSpeedSystem.getTerrainAt(0, 0, 10);
    expect(terrain).toBeDefined();
  });

  it('should calculate visibility distance', () => {
    const visibilityLow = highSpeedSystem.getVisibilityDistance(100);
    const visibilityHigh = highSpeedSystem.getVisibilityDistance(1000);
    
    expect(visibilityLow).toBeGreaterThan(0);
    expect(visibilityHigh).toBeGreaterThan(visibilityLow);
  });

  it('should calculate max safe speeds', () => {
    const speedLow = highSpeedSystem.getMaxSafeSpeed(100);
    const speedHigh = highSpeedSystem.getMaxSafeSpeed(1000);
    
    expect(speedLow).toBeGreaterThan(0);
    expect(speedHigh).toBeGreaterThan(speedLow);
  });
});
