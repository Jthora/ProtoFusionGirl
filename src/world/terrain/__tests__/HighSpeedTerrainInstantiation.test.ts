// HighSpeedTerrainInstantiation.test.ts
// Test just the instantiation of the high-speed system

import { MockTerrainSystem } from '../mocks/MockTerrainSystem';

describe('HighSpeedTerrainSystem Instantiation', () => {
  let mockBaseSystem: MockTerrainSystem;

  beforeEach(async () => {
    mockBaseSystem = new MockTerrainSystem();
    await mockBaseSystem.initialize();
  });

  afterEach(() => {
    mockBaseSystem.cleanup();
  });

  it('should import the module successfully', () => {
    expect(() => {
      const { createHighSpeedTerrainSystem } = require('../HighSpeedTerrainSystem');
      expect(createHighSpeedTerrainSystem).toBeDefined();
    }).not.toThrow();
  });

  it('should create the factory function successfully', () => {
    const { createHighSpeedTerrainSystem } = require('../HighSpeedTerrainSystem');
    expect(() => {
      const system = createHighSpeedTerrainSystem(mockBaseSystem);
      expect(system).toBeDefined();
    }).not.toThrow();
  });
});
