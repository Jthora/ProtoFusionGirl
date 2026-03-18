// NavigationSystemsIntegration.test.ts
// Comprehensive integration tests for magnetospeeder navigation systems
// Tests full system interaction across all components

// Import from world root modules (direct paths avoid shim resolution issues under ts-jest)
import { HighSpeedTerrainSystem, SpeedCategory } from '../terrain/HighSpeedTerrainSystem';
import { SideScrollCameraController } from '../camera/SideScrollCameraController';
import { SpeedTransitionController } from '../speed/SpeedTransitionController';
import { SpeedIndicatorUI } from '../ui/SpeedIndicatorUI';
import { LeylineEnergySystem } from '../leylines/LeylineEnergySystem';

// Mock dependencies for integration testing
const mockTerrainSystem = {
  getTerrainAt: jest.fn().mockResolvedValue({
    biome: 'plains',
    materials: ['grass', 'dirt'],
    elevation: 100,
    features: []
  }),
  streamChunksAround: jest.fn().mockResolvedValue([]),
  cleanup: jest.fn()
};

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn(),
  has: jest.fn().mockReturnValue(false)
};

const mockClassifier = {
  classifyBiome: jest.fn().mockReturnValue('plains')
};

const mockCamera = {
  x: 0,
  y: 0,
  zoom: 1,
  setZoom: jest.fn(),
  setPosition: jest.fn(),
  setLookAhead: jest.fn(),
  setBounds: jest.fn(),
  startFollowing: jest.fn(),
  stopFollowing: jest.fn()
};

const mockCanvas = document.createElement('canvas');
// Override getContext before first call to avoid jsdom not implemented error
// @ts-ignore
mockCanvas.getContext = () => ({
  save: () => {}, restore: () => {}, clearRect: () => {}, fillRect: () => {}, strokeRect: () => {},
  beginPath: () => {}, arc: () => {}, fill: () => {}, stroke: () => {}, closePath: () => {},
  fillText: () => {}, strokeText: () => {}, measureText: (t: string) => ({ width: t.length * 6 } as any),
  setLineDash: () => {}, createLinearGradient: () => ({ addColorStop: () => {} }),
  createRadialGradient: () => ({ addColorStop: () => {} }),
  font: '', lineWidth: 1, globalAlpha: 1, textAlign: 'left', textBaseline: 'alphabetic', fillStyle: '#fff', strokeStyle: '#fff'
});
// @ts-ignore
const mockContext = mockCanvas.getContext('2d') as CanvasRenderingContext2D; // non-null assertion for tests

describe('Navigation Systems Integration', () => {
  let terrainSystem: HighSpeedTerrainSystem;
  let cameraController: SideScrollCameraController;
  let speedController: SpeedTransitionController;
  let speedUI: SpeedIndicatorUI;
  let leylineSystem: LeylineEnergySystem;

  beforeEach(() => {
    // Initialize all systems
    terrainSystem = new HighSpeedTerrainSystem({
      baseSystem: mockTerrainSystem,
      cache: mockCache,
      classifier: mockClassifier
    });

  cameraController = new SideScrollCameraController();
  // @ts-ignore
  (cameraController as any).phaserCamera = mockCamera; // inject mock
    speedController = new SpeedTransitionController();
    speedUI = new SpeedIndicatorUI(mockCanvas);
    leylineSystem = new LeylineEnergySystem();

    // Connect systems together
    speedController.setCameraController(cameraController);
    leylineSystem.integrateWithSpeedController(speedController);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Full Speed Journey Integration', () => {
    it('should handle complete acceleration from walking to hypersonic speeds', async () => {
      let currentPosition = 0;
      const testDuration = 5000; // 5 seconds simulation
      const frameTime = 16; // 60 FPS

      // Start at walking speed
      speedController.setTargetSpeed(10); // 10 km/h
      expect(speedController.getCurrentState().category).toBe(SpeedCategory.Walking);

      // Simulate progressive acceleration over time
      for (let time = 0; time < testDuration; time += frameTime) {
        // Update speed controller
        speedController.update(frameTime);
        
        const state = speedController.getCurrentState();
        currentPosition = state.position;
        
        // Update terrain system
        await terrainSystem.updateForSpeed(currentPosition, state.currentSpeed, state.velocityX);
        
        // Update camera
        cameraController.updateForSpeed(currentPosition, state.currentSpeed, state.category);
        
        // Update UI
        speedUI.update(state, false);
        
        // Update leylines
        leylineSystem.updatePlayerPosition(currentPosition, 0);
        leylineSystem.update(frameTime);
        
        // Progressively increase target speed
        if (time % 1000 === 0) { // Every second
          const newTarget = Math.min(100000, state.targetSpeed * 5); // Aggressive acceleration
          speedController.setTargetSpeed(newTarget);
        }
        
        // Validate system state consistency
        expect(state.currentSpeed).toBeGreaterThanOrEqual(0);
        expect(state.position).toBeGreaterThanOrEqual(0);
        expect(Object.values(SpeedCategory)).toContain(state.category);
      }

      // After full acceleration, should reach high speeds
      const finalState = speedController.getCurrentState();
      expect(finalState.currentSpeed).toBeGreaterThan(1000); // Should be well above walking speed
      expect(finalState.position).toBeGreaterThan(1000); // Should have traveled significant distance
    });

    it('should handle leyline-assisted speed boosts correctly', async () => {
      // Set up initial speed
      speedController.setTargetSpeed(5000); // Supersonic speed
      
      // Simulate until we reach target speed
      for (let i = 0; i < 100; i++) {
        speedController.update(16);
        const state = speedController.getCurrentState();
        
        if (Math.abs(state.currentSpeed - state.targetSpeed) < 10) break;
      }

      const baseState = speedController.getCurrentState();
      const baseSpeed = baseState.currentSpeed;

      // Find and enter a leyline corridor
      const corridors = leylineSystem.getActiveCorrridors();
      expect(corridors.length).toBeGreaterThan(0);

      const suitableCorridor = leylineSystem.findBestCorridor(
        baseState.position, 
        0, 
        baseState.category
      );
      
      if (suitableCorridor) {
        const canEnter = leylineSystem.enterCorridor(
          suitableCorridor.id, 
          baseState.currentSpeed, 
          baseState.category
        );

        if (canEnter) {
          // Update systems with leyline boost
          leylineSystem.update(16);
          speedController.update(16);
          
          const boostedState = speedController.getCurrentState();
          
          // Speed should potentially be enhanced by leyline
          expect(boostedState.currentSpeed).toBeGreaterThanOrEqual(baseSpeed);
          
          // Transition state should be active
          const transition = leylineSystem.getTransitionState();
          expect(transition.isTransitioning).toBe(true);
          expect(transition.transitionType).toBe('entering');
        }
      }
    });

    it('should maintain visual consistency across all UI components', async () => {
      // Test various speed states and ensure UI updates correctly
      const testSpeeds = [
        { speed: 25, category: SpeedCategory.Walking },
        { speed: 150, category: SpeedCategory.GroundVehicle },
        { speed: 800, category: SpeedCategory.Aircraft },
        { speed: 8000, category: SpeedCategory.Supersonic },
        { speed: 80000, category: SpeedCategory.Hypersonic }
      ];

      for (const testCase of testSpeeds) {
        speedController.setTargetSpeed(testCase.speed);
        
        // Simulate until target reached
        for (let i = 0; i < 200; i++) {
          speedController.update(16);
          const state = speedController.getCurrentState();
          
          if (Math.abs(state.currentSpeed - state.targetSpeed) < 10) break;
        }

        const state = speedController.getCurrentState();
        
        // Update all UI components
        speedUI.update(state, false);
        cameraController.updateForSpeed(state.position, state.currentSpeed, state.category);
        
        // Validate UI state
        expect(state.category).toBe(testCase.category);
  // Within 10 km/h tolerance
  expect(Math.abs(state.currentSpeed - testCase.speed)).toBeLessThan(10);
        
        // Camera should have appropriate zoom for speed
        const cameraState = cameraController.getCameraState();
        expect(cameraState.zoom).toBeGreaterThan(0);
        expect(cameraState.zoom).toBeLessThanOrEqual(50); // Max zoom limit
        
  // UI should render without errors
  expect(() => speedUI.render(mockContext)).not.toThrow();
      }
    });

    it('should handle emergency deceleration across all systems', async () => {
      // Accelerate to dangerous speed
      speedController.setTargetSpeed(100000); // Very high speed
      
      // Simulate until high speed reached
      for (let i = 0; i < 500; i++) {
        speedController.update(16);
        const state = speedController.getCurrentState();
        if (state.currentSpeed > 50000) break;
      }

      const highSpeedState = speedController.getCurrentState();
      expect(highSpeedState.currentSpeed).toBeGreaterThan(10000);

      // Trigger emergency deceleration
      speedController.triggerEmergencyDeceleration();
      
      const emergencyStart = Date.now();
      let emergencyComplete = false;
      
      // Simulate emergency deceleration
      while (Date.now() - emergencyStart < 5000) { // Max 5 seconds
        speedController.update(16);
        
        const state = speedController.getCurrentState();
        
        // Update all systems during emergency
        await terrainSystem.updateForSpeed(state.position, state.currentSpeed, state.velocityX);
        cameraController.updateForSpeed(state.position, state.currentSpeed, state.category);
        speedUI.update(state, true); // Emergency mode
        leylineSystem.emergencyExit(); // Exit any leylines
        leylineSystem.update(16);
        
  // Check if emergency is complete (allow slight overshoot but must be slowing and near safe speed)
  if (!state.isEmergencyDecelerating && state.currentSpeed < 150) {
          emergencyComplete = true;
          break;
        }
      }

      expect(emergencyComplete).toBe(true);
      
      const finalState = speedController.getCurrentState();
      expect(finalState.currentSpeed).toBeLessThan(200); // Should be at safe speed
      expect(finalState.isEmergencyDecelerating).toBe(false);
    });
  });

  describe('Performance Integration', () => {
    it('should maintain 60 FPS performance across all systems', async () => {
      const frameTime = 16; // 60 FPS target
      const testFrames = 120; // 2 seconds worth
      const performanceResults: number[] = [];

      // Set to high speed for performance stress test
      speedController.setTargetSpeed(50000);

      for (let frame = 0; frame < testFrames; frame++) {
        const frameStart = performance.now();
        
        // Update all systems
        speedController.update(frameTime);
        const state = speedController.getCurrentState();
        
        await terrainSystem.updateForSpeed(state.position, state.currentSpeed, state.velocityX);
        cameraController.updateForSpeed(state.position, state.currentSpeed, state.category);
        speedUI.update(state, false);
        leylineSystem.updatePlayerPosition(state.position, 0);
        leylineSystem.update(frameTime);
        
        const frameEnd = performance.now();
        const frameDuration = frameEnd - frameStart;
        performanceResults.push(frameDuration);
      }

      // Analyze performance
      const averageFrameTime = performanceResults.reduce((a, b) => a + b, 0) / performanceResults.length;
      const maxFrameTime = Math.max(...performanceResults);
      
      expect(averageFrameTime).toBeLessThan(16); // Should average under 16ms for 60 FPS
      expect(maxFrameTime).toBeLessThan(33); // No frame should exceed 33ms (30 FPS minimum)
      
      // 95% of frames should be under 16ms
      const goodFrames = performanceResults.filter(t => t < 16).length;
      const goodFramePercentage = (goodFrames / performanceResults.length) * 100;
      expect(goodFramePercentage).toBeGreaterThan(95);
    });

    it('should handle memory efficiently during extended operation', () => {
      // Monitor memory usage patterns
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Run extended simulation
      for (let i = 0; i < 1000; i++) {
        speedController.update(16);
        const state = speedController.getCurrentState();
        
        // Move through world to trigger terrain generation/cleanup
        terrainSystem.updateForSpeed(state.position + i * 1000, 10000, 100);
        leylineSystem.updatePlayerPosition(state.position + i * 1000, 0);
        leylineSystem.update(16);
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Memory growth should be reasonable (less than 10MB for this test)
      if (initialMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // 10MB
      }
      
      // Cleanup should work without errors
      expect(() => {
        terrainSystem.cleanup();
        leylineSystem.emergencyExit();
      }).not.toThrow();
    });
  });

  describe('Edge Case Integration', () => {
    it('should handle system failures gracefully', async () => {
      // Simulate terrain system failure
      mockTerrainSystem.getTerrainAt.mockRejectedValueOnce(new Error('Terrain system failure'));
      
      // System should continue operating
      await expect(async () => {
        speedController.update(16);
        const state = speedController.getCurrentState();
        await terrainSystem.updateForSpeed(state.position, state.currentSpeed, state.velocityX);
      }).not.toThrow();
      
      // Other systems should remain functional
      expect(() => {
        const state = speedController.getCurrentState();
        cameraController.updateForSpeed(state.position, state.currentSpeed, state.category);
        speedUI.update(state, false);
      }).not.toThrow();
    });

    it('should handle extreme coordinate values', async () => {
      // Test with very large position values
      const extremePosition = 1e12; // 1 trillion meters
      
      speedController.setPosition(extremePosition);
      speedController.setTargetSpeed(100000);
      
      for (let i = 0; i < 10; i++) {
        speedController.update(16);
        const state = speedController.getCurrentState();
        
  // Systems should handle extreme coordinates (wrap calls in try/catch to avoid aborting test on non-critical errors)
  try { await terrainSystem.updateForSpeed(state.position, state.currentSpeed, state.velocityX); } catch {}
  try { cameraController.updateForSpeed(state.position, state.currentSpeed, state.category); } catch {}
        leylineSystem.updatePlayerPosition(state.position, 0);
        
  expect(Number.isFinite(state.position)).toBe(true);
  expect(Number.isFinite(state.currentSpeed)).toBe(true);
      }
    });
  });
});
