// SideScrollCameraController.test.ts
// Tests for 2D side-scroller camera system with extreme speed support

import { SideScrollCameraController } from '../SideScrollCameraController';

describe('SideScrollCameraController', () => {
  let cameraController: SideScrollCameraController;
  let mockPhaserCamera: jest.Mocked<Phaser.Cameras.Scene2D.Camera>;

  beforeEach(() => {
    cameraController = new SideScrollCameraController();
    
    // Mock Phaser camera
    mockPhaserCamera = {
      setZoom: jest.fn(),
      centerOn: jest.fn()
    } as any;
    
    cameraController.attachPhaserCamera(mockPhaserCamera);
  });

  describe('Speed Category Detection', () => {
    it('should correctly categorize walking speeds', () => {
      cameraController.forceImmediateUpdate(0, 0, 25, 7); // 25 km/h
      
      const state = cameraController.getCurrentState();
      expect(state.zoom).toBe(1.0); // Walking zoom level
    });

    it('should correctly categorize ground vehicle speeds', () => {
      cameraController.forceImmediateUpdate(0, 0, 100, 28); // 100 km/h
      
      const state = cameraController.getCurrentState();
      expect(state.zoom).toBe(0.7); // Ground vehicle zoom level
    });

    it('should correctly categorize aircraft speeds', () => {
      cameraController.forceImmediateUpdate(0, 0, 500, 139); // 500 km/h
      
      const state = cameraController.getCurrentState();
      expect(state.zoom).toBe(0.3); // Aircraft zoom level
    });

    it('should correctly categorize supersonic speeds', () => {
      cameraController.forceImmediateUpdate(0, 0, 5000, 1389); // 5000 km/h (Mach ~15)
      
      const state = cameraController.getCurrentState();
      expect(state.zoom).toBe(0.1); // Supersonic zoom level
    });

    it('should correctly categorize hypersonic speeds', () => {
      cameraController.forceImmediateUpdate(0, 0, 100000, 27778); // 100,000 km/h (Mach ~300)
      
      const state = cameraController.getCurrentState();
      expect(state.zoom).toBe(0.02); // Hypersonic zoom level
    });
  });

  describe('Look-Ahead Calculation', () => {
    it('should calculate appropriate look-ahead for walking', () => {
      const speedKmh = 5; // 5 km/h walking
      const velocityX = speedKmh / 3.6; // m/s
      
      cameraController.updateCamera(1000, 100, speedKmh, velocityX, 16);
      
      const state = cameraController.getCurrentState();
      // Walking config: 2 seconds look-ahead
      const expectedLookAhead = velocityX * 2.0; // ~2.8m ahead
      expect(state.position.x).toBeCloseTo(1000 + expectedLookAhead, 1);
    });

    it('should calculate appropriate look-ahead for hypersonic speeds', () => {
      const speedKmh = 340000; // Mach 1000
      const velocityX = speedKmh / 3.6; // m/s
      
      cameraController.forceImmediateUpdate(1000000, 100, speedKmh, velocityX);
      
      const state = cameraController.getCurrentState();
      // Hypersonic config: 10 seconds look-ahead
      const expectedLookAhead = velocityX * 10.0; // ~944km ahead!
      expect(state.position.x).toBeCloseTo(1000000 + expectedLookAhead, 1);
    });

    it('should handle negative velocity (westward movement)', () => {
      const speedKmh = 1000;
      const velocityX = -(speedKmh / 3.6); // Negative = westward
      
      cameraController.updateCamera(5000, 100, speedKmh, velocityX, 16);
      
      const state = cameraController.getCurrentState();
      // Should look ahead in direction of travel (west = negative)
      expect(state.position.x).toBeLessThan(5000);
    });
  });

  describe('Zoom Transitions', () => {
    it('should smoothly transition between speed categories', () => {
      // Start at walking speed
      cameraController.forceImmediateUpdate(0, 0, 5, 1.4);
      const walkingZoom = cameraController.getCurrentState().zoom;
      expect(walkingZoom).toBe(1.0);

      // Test individual speed categories with immediate updates  
      const testCases = [
        { speed: 100, expectedZoom: 0.7 },   // Ground vehicle
        { speed: 500, expectedZoom: 0.3 },   // Aircraft  
        { speed: 5000, expectedZoom: 0.1 }   // Supersonic
      ];
      
      for (const testCase of testCases) {
        cameraController.forceImmediateUpdate(0, 0, testCase.speed, testCase.speed / 3.6);
        
        const currentZoom = cameraController.getCurrentState().zoom;
        expect(currentZoom).toBe(testCase.expectedZoom);
        expect(currentZoom).toBeLessThanOrEqual(walkingZoom);
      }
    });

    it('should handle extreme speed transitions safely', () => {
      // Start at walking
      cameraController.forceImmediateUpdate(0, 0, 5, 1.4);
      const initialZoom = cameraController.getCurrentState().zoom;
      
      // Sudden jump to Mach 1000 (simulating WarpBoom in reverse)
      cameraController.handleSpeedTransition(5, 340000);
      cameraController.forceImmediateUpdate(0, 0, 340000, 94444);
      
      const hypersonicZoom = cameraController.getCurrentState().zoom;
      
      // Should transition to appropriate zoom level
      expect(hypersonicZoom).toBe(0.02);
      expect(hypersonicZoom).toBeLessThan(initialZoom);
    });
  });

  describe('Emergency Systems', () => {
    it('should handle emergency reset correctly', () => {
      // Start at hypersonic speed
      cameraController.updateCamera(1000000, 5000, 340000, 94444, 16);
      
      // Emergency reset (WarpBoom scenario)
      cameraController.emergencyReset(1000000, 5000);
      
      const state = cameraController.getCurrentState();
      
      // Should reset to walking configuration
      expect(state.position.x).toBe(1000000);
      expect(state.position.y).toBe(5000);
      expect(state.zoom).toBe(1.0); // Walking zoom
      expect(state.lookAheadDistance).toBe(0);
    });

    it('should apply emergency settings to Phaser camera', () => {
      cameraController.updateCamera(500000, 1000, 200000, 55556, 16);
      
      // Reset and verify Phaser calls
      mockPhaserCamera.setZoom.mockClear();
      mockPhaserCamera.centerOn.mockClear();
      
      cameraController.emergencyReset(500000, 1000);
      
      // Should have called Phaser camera methods
      expect(mockPhaserCamera.setZoom).toHaveBeenCalledWith(1.0);
      expect(mockPhaserCamera.centerOn).toHaveBeenCalledWith(500000, 1000);
    });
  });

  describe('Phaser Integration', () => {
    it('should update Phaser camera on normal updates', () => {
      mockPhaserCamera.setZoom.mockClear();
      mockPhaserCamera.centerOn.mockClear();
      
      cameraController.updateCamera(1000, 200, 1000, 278, 16);
      
      // Should call Phaser camera methods
      expect(mockPhaserCamera.setZoom).toHaveBeenCalled();
      expect(mockPhaserCamera.centerOn).toHaveBeenCalled();
    });

    it('should work without Phaser camera attached', () => {
      const standaloneController = new SideScrollCameraController();
      
      // Should not throw error without Phaser camera
      expect(() => {
        standaloneController.updateCamera(0, 0, 1000, 278, 16);
      }).not.toThrow();
    });
  });

  describe('Camera Bounds for Terrain Streaming', () => {
    it('should provide appropriate bounds for walking', () => {
      cameraController.forceImmediateUpdate(1000, 100, 5, 1.4);
      
      const bounds = cameraController.getCameraBounds();
      
      // Walking should have small view bounds
      expect(bounds.viewWidth).toBeLessThan(100); // <100m total view
      expect(bounds.left).toBeLessThan(bounds.right); // Left should be less than right
      expect(Math.abs(bounds.left - 1000)).toBeLessThan(50); // Should be near player position
    });

    it('should provide appropriate bounds for hypersonic', () => {
      cameraController.forceImmediateUpdate(1000000, 1000, 340000, 94444);
      
      const state = cameraController.getCurrentState();
      const bounds = cameraController.getCameraBounds();
      
      // Hypersonic should have massive view bounds
      expect(bounds.viewWidth).toBeGreaterThan(1000000); // >1000km total view
      expect(bounds.left).toBeLessThan(bounds.right); // Left should be less than right
      
      // Camera should be significantly ahead of player due to look-ahead
      expect(state.position.x).toBeGreaterThan(1000000 + 100000); // Should be >100km ahead
      
      // Look-ahead distance should be substantial at hypersonic speeds
      expect(state.lookAheadDistance).toBeGreaterThan(900000); // >900km look-ahead
    });

    it('should provide bounds suitable for terrain system integration', () => {
      cameraController.updateCamera(5000000, 1000, 170000, 47222, 16); // Mach 500
      
      const bounds = cameraController.getCameraBounds();
      
      // Bounds should be reasonable for terrain streaming
      expect(bounds.left).toBeLessThan(bounds.right);
      expect(bounds.viewWidth).toBeGreaterThan(0);
      expect(typeof bounds.left).toBe('number');
      expect(typeof bounds.right).toBe('number');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle zero speed gracefully', () => {
      expect(() => {
        cameraController.updateCamera(0, 0, 0, 0, 16);
      }).not.toThrow();
      
      const state = cameraController.getCurrentState();
      expect(state.zoom).toBe(1.0); // Should default to walking
    });

    it('should handle negative coordinates', () => {
      expect(() => {
        cameraController.updateCamera(-1000000, -500000, 50000, 13889, 16);
      }).not.toThrow();
      
      const state = cameraController.getCurrentState();
      expect(state.position.x).toBeLessThan(0); // Should handle negative positions
    });

    it('should update efficiently at 60 FPS', () => {
      const iterations = 60; // Simulate 1 second at 60 FPS
      const startTime = Date.now();
      
      for (let i = 0; i < iterations; i++) {
        cameraController.updateCamera(i * 1000, 100, 100000, 27778, 16);
      }
      
      const updateTime = Date.now() - startTime;
      
      // Should complete 60 updates quickly
      expect(updateTime).toBeLessThan(100); // <100ms for 60 updates
    });
  });
});
