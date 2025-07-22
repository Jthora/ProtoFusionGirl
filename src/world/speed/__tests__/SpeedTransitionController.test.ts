// SpeedTransitionController.test.ts
// TDD tests for magnetospeeder speed transition system
// Handles smooth acceleration/deceleration between speed categories

import { SpeedTransitionController } from '../SpeedTransitionController';
import { SpeedCategory } from '../../terrain/HighSpeedTerrainSystem';
import { SideScrollCameraController } from '../../camera/SideScrollCameraController';

// Mock the camera controller for testing
jest.mock('../../camera/SideScrollCameraController');

describe('SpeedTransitionController', () => {
  let speedController: SpeedTransitionController;
  let mockCameraController: jest.Mocked<SideScrollCameraController>;

  beforeEach(() => {
    mockCameraController = new SideScrollCameraController() as jest.Mocked<SideScrollCameraController>;
    speedController = new SpeedTransitionController(mockCameraController);
  });

  describe('Initialization and Basic State', () => {
    it('should initialize with walking speed', () => {
      const state = speedController.getCurrentState();
      
      expect(state.currentSpeed).toBe(5); // Walking speed
      expect(state.targetSpeed).toBe(5);
      expect(state.category).toBe(SpeedCategory.Walking);
      expect(state.isAccelerating).toBe(false);
      expect(state.isDecelerating).toBe(false);
    });

    it('should provide valid acceleration curves for all speed categories', () => {
      const curves = speedController.getAccelerationCurves();
      
      // Should have curves for all speed categories
      expect(curves.has(SpeedCategory.Walking)).toBe(true);
      expect(curves.has(SpeedCategory.GroundVehicle)).toBe(true);
      expect(curves.has(SpeedCategory.Aircraft)).toBe(true);
      expect(curves.has(SpeedCategory.Supersonic)).toBe(true);
      expect(curves.has(SpeedCategory.Hypersonic)).toBe(true);

      // Each curve should have realistic acceleration values
      for (const [, curve] of curves) {
        expect(curve.maxAcceleration).toBeGreaterThan(0);
        expect(curve.maxDeceleration).toBeGreaterThan(0);
        expect(curve.smoothingFactor).toBeGreaterThan(0);
        expect(curve.smoothingFactor).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Speed Target Setting', () => {
    it('should set target speed within same category', () => {
      speedController.setTargetSpeed(25); // Still walking category
      
      const state = speedController.getCurrentState();
      expect(state.targetSpeed).toBe(25);
      expect(state.category).toBe(SpeedCategory.Walking);
      expect(state.isAccelerating).toBe(true);
    });

    it('should handle target speed change to different category', () => {
      speedController.setTargetSpeed(150); // Ground vehicle category
      
      const state = speedController.getCurrentState();
      expect(state.targetSpeed).toBe(150);
      expect(state.isAccelerating).toBe(true);
    });

    it('should handle deceleration requests', () => {
      // First accelerate to supersonic
      speedController.setTargetSpeed(5000);
      speedController.update(100, 100); // Force some progress
      
      // Then decelerate
      speedController.setTargetSpeed(50);
      
      const state = speedController.getCurrentState();
      expect(state.targetSpeed).toBe(50);
      expect(state.isDecelerating).toBe(true);
    });

    it('should clamp target speeds to valid ranges', () => {
      // Test negative speed (should clamp to minimum)
      speedController.setTargetSpeed(-100);
      expect(speedController.getCurrentState().targetSpeed).toBe(5); // Min walking speed

      // Test extreme speed (should clamp to max hypersonic)
      speedController.setTargetSpeed(500000); // Beyond Mach 1000
      expect(speedController.getCurrentState().targetSpeed).toBe(343000); // Mach 1000
    });
  });

  describe('Speed Category Transitions', () => {
    it('should transition through all speed categories during acceleration', () => {
      const categoryHistory: SpeedCategory[] = [];
      
      // Set up callback to track category changes
      speedController.onCategoryChange((_oldCategory: SpeedCategory, newCategory: SpeedCategory) => {
        categoryHistory.push(newCategory);
      });

      // Accelerate to hypersonic
      speedController.setTargetSpeed(100000);
      
      // Simulate multiple update cycles
      for (let i = 0; i < 100; i++) {
        speedController.update(16, 100 * i); // 16ms updates, progressing position
        
        // Break early if we reach target
        if (Math.abs(speedController.getCurrentState().currentSpeed - 100000) < 100) {
          break;
        }
      }

      // Should have progressed through categories
      expect(categoryHistory).toContain(SpeedCategory.GroundVehicle);
      expect(categoryHistory).toContain(SpeedCategory.Aircraft);
      expect(categoryHistory).toContain(SpeedCategory.Supersonic);
      expect(categoryHistory).toContain(SpeedCategory.Hypersonic);
    });

    it('should notify camera controller on category changes', () => {
      speedController.setTargetSpeed(1000); // Aircraft category
      
      // Update until category change occurs
      for (let i = 0; i < 50; i++) {
        speedController.update(16, i * 100);
        
        if (speedController.getCurrentState().category === SpeedCategory.Aircraft) {
          break;
        }
      }

      // Camera should have been updated
      expect(mockCameraController.handleSpeedTransition).toHaveBeenCalled();
    });
  });

  describe('Acceleration Physics', () => {
    it('should apply realistic acceleration curves', () => {
      speedController.setTargetSpeed(100); // Ground vehicle
      
      const initialSpeed = speedController.getCurrentState().currentSpeed;
      
      // Update for one frame
      speedController.update(16, 0);
      
      const newSpeed = speedController.getCurrentState().currentSpeed;
      
      // Should have accelerated but not instantaneously
      expect(newSpeed).toBeGreaterThan(initialSpeed);
      expect(newSpeed).toBeLessThan(100); // Shouldn't reach target instantly
      
      // Acceleration should be reasonable (not too fast, not too slow)
      const acceleration = (newSpeed - initialSpeed) / (16 / 1000); // m/s²
      expect(acceleration).toBeGreaterThan(0.1); // At least 0.1 m/s²
      expect(acceleration).toBeLessThan(50); // Not more than 50 m/s² (5G)
    });

    it('should handle smooth deceleration', () => {
      // First accelerate to supersonic
      speedController.setTargetSpeed(5000);
      
      // Force to target speed for testing
      for (let i = 0; i < 100; i++) {
        speedController.update(16, i * 1000);
        if (Math.abs(speedController.getCurrentState().currentSpeed - 5000) < 10) break;
      }

      const highSpeed = speedController.getCurrentState().currentSpeed;
      
      // Now decelerate
      speedController.setTargetSpeed(50);
      speedController.update(16, 10000);
      
      const deceleratedSpeed = speedController.getCurrentState().currentSpeed;
      
      // Should have decelerated
      expect(deceleratedSpeed).toBeLessThan(highSpeed);
      
      // Deceleration should be reasonable
      const deceleration = (highSpeed - deceleratedSpeed) / (16 / 1000);
      expect(deceleration).toBeGreaterThan(10); // Significant deceleration
      expect(deceleration).toBeLessThan(1000); // But not too extreme
    });
  });

  describe('WarpBoom Emergency System', () => {
    it('should trigger emergency deceleration at dangerous speeds', () => {
      // Accelerate to dangerous hypersonic speed
      speedController.setTargetSpeed(200000); // Mach ~600
      
      // Force to hypersonic speed
      for (let i = 0; i < 100; i++) {
        speedController.update(16, i * 5000);
        if (speedController.getCurrentState().currentSpeed > 150000) break;
      }

      const emergencyCallback = jest.fn();
      speedController.onEmergencyDeceleration(emergencyCallback);

      // Trigger emergency (simulate obstacle detection)
      speedController.triggerWarpBoom();

      const state = speedController.getCurrentState();
      
      // Should be in emergency deceleration
      expect(state.isEmergencyDecelerating).toBe(true);
      expect(state.targetSpeed).toBeLessThan(1000); // Emergency target speed
      expect(emergencyCallback).toHaveBeenCalled();
    });

    it('should complete WarpBoom deceleration in under 3 seconds', () => {
      // Start at Mach 1000
      speedController.setTargetSpeed(343000);
      
      // Force to max speed
      while (speedController.getCurrentState().currentSpeed < 300000) {
        speedController.update(16, Math.random() * 100000);
      }

      // Trigger WarpBoom
      speedController.triggerWarpBoom();
      
      const startTime = Date.now();
      const startSpeed = speedController.getCurrentState().currentSpeed;
      
      // Simulate WarpBoom deceleration
      let frameCount = 0;
      while (speedController.getCurrentState().currentSpeed > 500 && frameCount < 200) {
        speedController.update(16, frameCount * 1000);
        frameCount++;
      }

      const endTime = Date.now();
      const endSpeed = speedController.getCurrentState().currentSpeed;
      
      // Should complete in reasonable time
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(3000); // <3 seconds
      
      // Should have decelerated significantly
      expect(endSpeed).toBeLessThan(startSpeed * 0.1); // <10% of original speed
    });

    it('should notify camera of emergency deceleration', () => {
      speedController.setTargetSpeed(343000);
      
      // Get to hypersonic
      while (speedController.getCurrentState().currentSpeed < 100000) {
        speedController.update(16, Math.random() * 50000);
      }

      // Trigger emergency
      speedController.triggerWarpBoom();

      // Camera should be notified of emergency
      expect(mockCameraController.emergencyReset).toHaveBeenCalled();
    });
  });

  describe('Position and Velocity Integration', () => {
    it('should calculate velocity from speed and update position', () => {
      const initialPosition = 1000;
      speedController.setTargetSpeed(100); // ~28 m/s
      
      // Update with position tracking
      speedController.update(16, initialPosition);
      speedController.update(16, initialPosition + 100);
      
      const state = speedController.getCurrentState();
      
      // Should have calculated velocity
      expect(state.velocityX).toBeGreaterThan(0);
      expect(state.velocityX).toBeLessThan(50); // Reasonable velocity in m/s
    });

    it('should handle position updates correctly', () => {
      const positions = [1000, 1100, 1250, 1450, 1700];
      
      for (let i = 1; i < positions.length; i++) {
        speedController.update(16, positions[i]);
      }

      const state = speedController.getCurrentState();
      
      // Should track position
      expect(state.position).toBe(1700);
      
      // Velocity should reflect position changes
      expect(state.velocityX).toBeGreaterThan(0);
    });

    it('should handle negative velocity (westward movement)', () => {
      const positions = [2000, 1900, 1750, 1550, 1300];
      
      for (let i = 1; i < positions.length; i++) {
        speedController.update(16, positions[i]);
      }

      const state = speedController.getCurrentState();
      
      // Should handle westward movement
      expect(state.velocityX).toBeLessThan(0); // Negative = westward
      expect(state.position).toBe(1300);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid speed changes without instability', () => {
      const speedChanges = [100, 5, 1000, 50, 10000, 25, 100000];
      
      for (const speed of speedChanges) {
        speedController.setTargetSpeed(speed);
        speedController.update(16, Math.random() * 10000);
        
        const state = speedController.getCurrentState();
        
        // Should remain stable
        expect(state.currentSpeed).toBeGreaterThanOrEqual(5);
        expect(state.currentSpeed).toBeLessThanOrEqual(343000);
        expect(Number.isFinite(state.currentSpeed)).toBe(true);
      }
    });

    it('should update efficiently at 60 FPS', () => {
      const iterations = 60;
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        speedController.setTargetSpeed(Math.random() * 10000);
        speedController.update(16, i * 100);
      }
      
      const updateTime = Date.now() - startTime;
      
      // Should complete 60 updates quickly
      expect(updateTime).toBeLessThan(50); // <50ms for 60 updates
    });

    it('should handle zero and near-zero speeds gracefully', () => {
      speedController.setTargetSpeed(0.1);
      
      expect(() => {
        speedController.update(16, 1000);
      }).not.toThrow();
      
      const state = speedController.getCurrentState();
      expect(state.currentSpeed).toBeGreaterThanOrEqual(5); // Should clamp to minimum
    });

    it('should maintain consistent state across updates', () => {
      speedController.setTargetSpeed(5000);
      
      for (let i = 0; i < 10; i++) {
        const stateBefore = speedController.getCurrentState();
        speedController.update(16, i * 500);
        const stateAfter = speedController.getCurrentState();
        
        // Speed should only increase or stay same (monotonic)
        expect(stateAfter.currentSpeed).toBeGreaterThanOrEqual(stateBefore.currentSpeed);
        
        // State should be valid
        expect(Number.isFinite(stateAfter.currentSpeed)).toBe(true);
        expect(Number.isFinite(stateAfter.velocityX)).toBe(true);
      }
    });
  });
});
