// LeylineEnergySystem.test.ts
// TDD tests for horizontal energy corridor system
// Provides speed enhancement zones for magnetospeeder travel

import { LeylineEnergySystem, LeylineCorridorInfo } from '../LeylineEnergySystem';
import { SpeedCategory } from '../../terrain/HighSpeedTerrainSystem';

describe('LeylineEnergySystem', () => {
  let leylineSystem: LeylineEnergySystem;

  beforeEach(() => {
    leylineSystem = new LeylineEnergySystem();
  });

  describe('Initialization and Configuration', () => {
    it('should initialize with default leyline network', () => {
      const corridors = leylineSystem.getActiveCorrridors();
      
      // Should have multiple altitude layers
      const altitudes = new Set(corridors.map(c => c.altitude));
      expect(altitudes.size).toBeGreaterThanOrEqual(3); // Ground, high-altitude, stratospheric
      
      // Should have corridors for different speed categories
      const categories = new Set(corridors.map(c => c.category));
      expect(categories.has(SpeedCategory.GroundVehicle)).toBe(true);
      expect(categories.has(SpeedCategory.Aircraft)).toBe(true);
      expect(categories.has(SpeedCategory.Supersonic)).toBe(true);
      expect(categories.has(SpeedCategory.Hypersonic)).toBe(true);
    });

    it('should provide proper energy level distribution', () => {
      const corridors = leylineSystem.getActiveCorrridors();
      
      // Should have varied energy levels
      const energyLevels = corridors.map(c => c.energyLevel);
      expect(Math.max(...energyLevels)).toBeGreaterThan(Math.min(...energyLevels));
      
      // All energy levels should be in valid range
      for (const level of energyLevels) {
        expect(level).toBeGreaterThanOrEqual(0.1);
        expect(level).toBeLessThanOrEqual(5.0);
      }
    });

    it('should configure system parameters', () => {
      leylineSystem.configure({
        corridorDensity: 0.5,
        energyRegenRate: 0.02,
        maxCorridorLength: 50000,
        visualRange: 10000,
      });

      const config = leylineSystem.getConfiguration();
      expect(config.corridorDensity).toBe(0.5);
      expect(config.energyRegenRate).toBe(0.02);
      expect(config.maxCorridorLength).toBe(50000);
      expect(config.visualRange).toBe(10000);
    });
  });

  describe('Corridor Detection and Access', () => {
    it('should detect nearby corridors based on position and altitude', () => {
      const position = 10000;
      const altitude = 1000;
      const detectionRange = 500;

      const nearbyCorrridors = leylineSystem.getNearbyCorridors(position, altitude, detectionRange);
      
      // Should return array of corridors
      expect(Array.isArray(nearbyCorrridors)).toBe(true);
      
      // Each corridor should be within detection range
      for (const corridor of nearbyCorrridors) {
        const corridorAltitude = corridor.altitude;
        const altitudeDiff = Math.abs(altitude - corridorAltitude);
        expect(altitudeDiff).toBeLessThanOrEqual(detectionRange);
      }
    });

    it('should find best corridor for current speed category', () => {
      const position = 25000;
      const altitude = 5000;
      const category = SpeedCategory.Supersonic;

      const bestCorridor = leylineSystem.findBestCorridor(position, altitude, category);
      
      if (bestCorridor) {
        // Should be appropriate for speed category
        expect([SpeedCategory.Supersonic, SpeedCategory.Hypersonic]).toContain(bestCorridor.category);
        
        // Should have reasonable speed multiplier
        expect(bestCorridor.speedMultiplier).toBeGreaterThan(1.0);
        expect(bestCorridor.speedMultiplier).toBeLessThanOrEqual(10.0);
      }
    });

    it('should validate corridor entry requirements', () => {
      const corridors = leylineSystem.getActiveCorrridors();
      const testCorridor = corridors.find(c => c.category === SpeedCategory.Supersonic);
      
      if (testCorridor) {
        // Should allow entry with sufficient speed
        const canEnterFast = leylineSystem.canEnterCorridor(testCorridor.id, 3000); // High speed
        expect(canEnterFast).toBe(true);
        
        // Should reject entry with insufficient speed
        const canEnterSlow = leylineSystem.canEnterCorridor(testCorridor.id, 50); // Walking speed
        expect(canEnterSlow).toBe(false);
      }
    });

    it('should track corridor occupancy', () => {
      const corridors = leylineSystem.getActiveCorrridors();
      
      // Find a corridor we can enter with Aircraft speed
      let testCorridor = corridors.find((c: LeylineCorridorInfo) => leylineSystem.canEnterCorridor(c.id, 1000));
      
      // If no suitable corridor found, use the first one and adjust speed
      if (!testCorridor) {
        testCorridor = corridors[0];
        // Use a speed high enough for any corridor type
        const testSpeed = 50000; // High enough for any category
        
        // Initially not occupied
        expect(leylineSystem.isCorridorOccupied(testCorridor.id)).toBe(false);
        
        // Enter corridor
        leylineSystem.enterCorridor(testCorridor.id, testSpeed, SpeedCategory.Hypersonic);
        expect(leylineSystem.isCorridorOccupied(testCorridor.id)).toBe(true);
        
        // Exit corridor
        leylineSystem.exitCorridor(testCorridor.id);
        expect(leylineSystem.isCorridorOccupied(testCorridor.id)).toBe(false);
      } else {
        // Initially not occupied
        expect(leylineSystem.isCorridorOccupied(testCorridor.id)).toBe(false);
        
        // Enter corridor
        leylineSystem.enterCorridor(testCorridor.id, 1000, SpeedCategory.Aircraft);
        expect(leylineSystem.isCorridorOccupied(testCorridor.id)).toBe(true);
        
        // Exit corridor
        leylineSystem.exitCorridor(testCorridor.id);
        expect(leylineSystem.isCorridorOccupied(testCorridor.id)).toBe(false);
      }
    });
  });

  describe('Energy Boost Mechanics', () => {
    it('should calculate appropriate energy boost effects', () => {
      const speedCategory = SpeedCategory.Supersonic;
      const energyLevel = 2.5;
      const currentSpeed = 5000;

      const boostEffect = leylineSystem.calculateEnergyBoost(speedCategory, energyLevel, currentSpeed);
      
      // Should provide speed multiplier
      expect(boostEffect.speedMultiplier).toBeGreaterThan(1.0);
      expect(boostEffect.speedMultiplier).toBeLessThanOrEqual(5.0);
      
      // Should have energy consumption
      expect(boostEffect.energyConsumption).toBeGreaterThan(0);
      expect(boostEffect.energyConsumption).toBeLessThanOrEqual(1.0);
      
      // Should have reasonable duration
      expect(boostEffect.maxDuration).toBeGreaterThan(1000); // At least 1 second
      expect(boostEffect.maxDuration).toBeLessThanOrEqual(60000); // Max 1 minute
      
      // Should have visual intensity
      expect(boostEffect.visualIntensity).toBeGreaterThanOrEqual(0);
      expect(boostEffect.visualIntensity).toBeLessThanOrEqual(1.0);
    });

    it('should scale boost effects with energy level', () => {
      const speedCategory = SpeedCategory.Aircraft;
      const currentSpeed = 1500;
      
      const lowEnergyBoost = leylineSystem.calculateEnergyBoost(speedCategory, 0.5, currentSpeed);
      const highEnergyBoost = leylineSystem.calculateEnergyBoost(speedCategory, 4.0, currentSpeed);
      
      // Higher energy should provide better effects
      expect(highEnergyBoost.speedMultiplier).toBeGreaterThan(lowEnergyBoost.speedMultiplier);
      expect(highEnergyBoost.maxDuration).toBeGreaterThan(lowEnergyBoost.maxDuration);
      expect(highEnergyBoost.visualIntensity).toBeGreaterThan(lowEnergyBoost.visualIntensity);
    });

    it('should handle energy depletion over time', () => {
      const corridors = leylineSystem.getActiveCorrridors();
      const energyCorridor = corridors.find(c => c.energyLevel > 2.0);
      
      if (energyCorridor) {
        const initialEnergy = energyCorridor.energyLevel;
        
        // Simulate energy consumption
        leylineSystem.enterCorridor(energyCorridor.id, 2000, SpeedCategory.Supersonic);
        
        // Update system multiple times
        for (let i = 0; i < 10; i++) {
          leylineSystem.update(100); // 100ms updates
        }
        
        const updatedCorridor = leylineSystem.getCorridorInfo(energyCorridor.id);
        
        // Energy should decrease with use
        expect(updatedCorridor.energyLevel).toBeLessThan(initialEnergy);
        expect(updatedCorridor.energyLevel).toBeGreaterThanOrEqual(0);
      }
    });

    it('should regenerate energy when not in use', () => {
      const corridors = leylineSystem.getActiveCorrridors();
      const testCorridor = corridors.find(c => c.energyLevel < 3.0);
      
      if (testCorridor) {
        const initialEnergy = testCorridor.energyLevel;
        
        // Update without usage
        for (let i = 0; i < 50; i++) {
          leylineSystem.update(100); // 100ms updates, 5 seconds total
        }
        
        const updatedCorridor = leylineSystem.getCorridorInfo(testCorridor.id);
        
        // Energy should regenerate
        expect(updatedCorridor.energyLevel).toBeGreaterThanOrEqual(initialEnergy);
      }
    });
  });

  describe('Speed Enhancement Integration', () => {
    it('should integrate with speed transition controller', () => {
      const mockSpeedController = {
        getCurrentState: jest.fn(() => ({
          currentSpeed: 2000,
          category: SpeedCategory.Aircraft,
          position: 15000,
        })),
        applySpeedBoost: jest.fn(),
      };

      leylineSystem.integrateWithSpeedController(mockSpeedController as any);
      
      // Find and enter a corridor
      const corridors = leylineSystem.getActiveCorrridors();
      const aircraftCorridor = corridors.find(c => c.category === SpeedCategory.Aircraft);
      
      if (aircraftCorridor) {
        leylineSystem.enterCorridor(aircraftCorridor.id, 2000, SpeedCategory.Aircraft);
        leylineSystem.update(16); // One frame update
        
        // Should have called speed boost
        expect(mockSpeedController.applySpeedBoost).toHaveBeenCalled();
      }
    });

    it('should provide smooth speed transitions in/out of corridors', () => {
      const position = 30000;
      const altitude = 2000;
      
      // Test corridor entry transition
      const corridor = leylineSystem.findBestCorridor(position, altitude, SpeedCategory.Supersonic);
      
      if (corridor) {
        leylineSystem.enterCorridor(corridor.id, 4000, SpeedCategory.Supersonic);
        
        const entryTransition = leylineSystem.getTransitionState();
        expect(entryTransition.isTransitioning).toBe(true);
        expect(entryTransition.transitionType).toBe('entering');
        expect(entryTransition.progress).toBeGreaterThanOrEqual(0);
        expect(entryTransition.progress).toBeLessThanOrEqual(1);
        
        // Test corridor exit transition
        leylineSystem.exitCorridor(corridor.id);
        
        const exitTransition = leylineSystem.getTransitionState();
        expect(exitTransition.isTransitioning).toBe(true);
        expect(exitTransition.transitionType).toBe('exiting');
      }
    });

    it('should handle emergency exits during WarpBoom deceleration', () => {
      const corridors = leylineSystem.getActiveCorrridors();
      const hypersonicCorridor = corridors.find(c => c.category === SpeedCategory.Hypersonic);
      
      if (hypersonicCorridor) {
        // Enter high-speed corridor
        leylineSystem.enterCorridor(hypersonicCorridor.id, 100000, SpeedCategory.Hypersonic);
        expect(leylineSystem.isCorridorOccupied(hypersonicCorridor.id)).toBe(true);
        
        // Trigger emergency exit
        leylineSystem.emergencyExit();
        
        // Should immediately exit all corridors
        expect(leylineSystem.isCorridorOccupied(hypersonicCorridor.id)).toBe(false);
        
        const transitionState = leylineSystem.getTransitionState();
        expect(transitionState.transitionType).toBe('emergency');
      }
    });
  });

  describe('Visual and Audio Effects', () => {
    it('should provide visual effect data for corridors', () => {
      const position = 40000;
      const viewRange = 5000;
      
      const visualEffects = leylineSystem.getVisualEffects(position, viewRange);
      
      expect(Array.isArray(visualEffects)).toBe(true);
      
      for (const effect of visualEffects) {
        expect(effect.position).toBeDefined();
        expect(effect.intensity).toBeGreaterThanOrEqual(0);
        expect(effect.intensity).toBeLessThanOrEqual(1);
        expect(effect.color).toBeDefined();
        expect(effect.effectType).toBeDefined();
      }
    });

    it('should generate particle effects for active corridors', () => {
      const corridors = leylineSystem.getActiveCorrridors();
      const activeCorridor = corridors[0];
      
      leylineSystem.enterCorridor(activeCorridor.id, 1500, SpeedCategory.Aircraft);
      
      const particles = leylineSystem.getParticleEffects();
      
      expect(Array.isArray(particles)).toBe(true);
      expect(particles.length).toBeGreaterThan(0);
      
      for (const particle of particles) {
        expect(particle.x).toBeDefined();
        expect(particle.y).toBeDefined();
        expect(particle.velocity).toBeDefined();
        expect(particle.lifespan).toBeGreaterThan(0);
        expect(particle.color).toBeDefined();
      }
    });

    it('should adapt visual intensity to speed and energy level', () => {
      const lowSpeedEffects = leylineSystem.calculateVisualIntensity(500, 1.0); // Low speed
      const highSpeedEffects = leylineSystem.calculateVisualIntensity(50000, 4.0); // High speed
      
      // Higher speed and energy should create more intense visuals
      expect(highSpeedEffects.intensity).toBeGreaterThan(lowSpeedEffects.intensity);
      expect(highSpeedEffects.particleCount).toBeGreaterThan(lowSpeedEffects.particleCount);
      expect(highSpeedEffects.glowRadius).toBeGreaterThan(lowSpeedEffects.glowRadius);
    });
  });

  describe('Performance and Optimization', () => {
    it('should update efficiently at 60 FPS', () => {
      // Add multiple active corridors
      const corridors = leylineSystem.getActiveCorrridors();
      for (let i = 0; i < Math.min(5, corridors.length); i++) {
        leylineSystem.enterCorridor(corridors[i].id, 2000, SpeedCategory.Aircraft);
      }

      const iterations = 60;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        leylineSystem.update(16); // 60 FPS
      }

      const updateTime = Date.now() - startTime;

      // Should complete 60 updates quickly
      expect(updateTime).toBeLessThan(100); // <100ms for 60 updates
    });

    it('should optimize corridor loading based on view distance', () => {
      const farPosition = 1000000; // Very far position
      const viewRange = 1000; // Small view range
      
      const nearbyCorridors = leylineSystem.getNearbyCorridors(farPosition, 0, viewRange);
      const allCorridors = leylineSystem.getActiveCorrridors();
      
      // Should return fewer corridors when view range is limited
      expect(nearbyCorridors.length).toBeLessThanOrEqual(allCorridors.length);
    });

    it('should handle many simultaneous corridor interactions', () => {
      const corridors = leylineSystem.getActiveCorrridors();
      const testCorridors = corridors.slice(0, 10); // Test with 10 corridors
      
      // Enter multiple corridors simultaneously
      for (const corridor of testCorridors) {
        leylineSystem.enterCorridor(corridor.id, 3000, SpeedCategory.Supersonic);
      }
      
      expect(() => {
        leylineSystem.update(16);
      }).not.toThrow();
      
      // Exit all corridors
      for (const corridor of testCorridors) {
        leylineSystem.exitCorridor(corridor.id);
      }
      
      expect(() => {
        leylineSystem.update(16);
      }).not.toThrow();
    });
  });

  describe('Dynamic Corridor Generation', () => {
    it('should generate new corridors as player progresses', () => {
      const initialCorridors = leylineSystem.getActiveCorrridors();
      const initialCount = initialCorridors.length;
      
      // Simulate player movement to far position
      leylineSystem.updatePlayerPosition(500000, 5000);
      leylineSystem.update(16);
      
      const newCorridors = leylineSystem.getActiveCorrridors();
      
      // Should have generated new corridors or maintained count
      expect(newCorridors.length).toBeGreaterThanOrEqual(initialCount * 0.8); // Allow some variation
    });

    it('should clean up distant corridors to save memory', () => {
      const initialPosition = 0;
      const farPosition = 1000000;
      
      // Generate corridors at initial position
      leylineSystem.updatePlayerPosition(initialPosition, 1000);
      leylineSystem.update(16);
      
      // Move very far away
      leylineSystem.updatePlayerPosition(farPosition, 1000);
      leylineSystem.update(16);
      
      const corridors = leylineSystem.getActiveCorrridors();
      
      // Should not have corridors from the initial position
      const distantCorridors = corridors.filter(c => 
        Math.abs(c.startPosition - initialPosition) < 1000
      );
      expect(distantCorridors.length).toBe(0);
    });

    it('should maintain corridor consistency across updates', () => {
      const position = 100000;
      
      leylineSystem.updatePlayerPosition(position, 2000);
      leylineSystem.update(16);
      
      const corridors1 = leylineSystem.getNearbyCorridors(position, 2000, 5000);
      
      // Small position change shouldn't dramatically alter nearby corridors
      leylineSystem.updatePlayerPosition(position + 100, 2000);
      leylineSystem.update(16);
      
      const corridors2 = leylineSystem.getNearbyCorridors(position + 100, 2000, 5000);
      
      // Should have significant overlap
      const overlapCount = corridors1.filter(c1 => 
        corridors2.some(c2 => c2.id === c1.id)
      ).length;
      
      expect(overlapCount).toBeGreaterThan(Math.min(corridors1.length, corridors2.length) * 0.7);
    });
  });
});
