// NavigationManager.test.ts
// Test suite for NavigationManager central coordinator
// Validates integration between all navigation systems

import { NavigationManager, NavigationManagerConfig } from '../../../src/navigation/core/NavigationManager';
import { SpeedCategory } from '../../../src/navigation/core/SpeedCategories';
import { EventBus } from '../../../src/core/EventBus';

// Mock implementations for testing
class MockPlayerManager {
  private mockJane: any = {
    playerController: {
      sprite: {
        x: 100,
        y: 200,
        body: {
          velocity: { x: 0, y: 0 },
          acceleration: { x: 0, y: 0 },
          touching: { down: true },
          setVelocity: jest.fn()
        }
      }
    },
    health: 100
  };

  getJane() {
    return this.mockJane;
  }

  setMockVelocity(x: number, y: number) {
    this.mockJane.playerController.sprite.body.velocity = { x, y };
  }

  setMockPosition(x: number, y: number) {
    this.mockJane.playerController.sprite.x = x;
    this.mockJane.playerController.sprite.y = y;
  }
}

class MockUIManager {
  minimap = {
    setScale: jest.fn()
  };
}

class MockScene {
  cameras = {
    main: {
      zoom: 1.0,
      setZoom: jest.fn(),
      setLerp: jest.fn(),
      centerOn: jest.fn(),
      shake: jest.fn()
    }
  };

  sound = {
    play: jest.fn()
  };
}

describe('NavigationManager', () => {
  let navigationManager: NavigationManager;
  let mockEventBus: EventBus;
  let mockPlayerManager: MockPlayerManager;
  let mockUIManager: MockUIManager;
  let mockScene: MockScene;

  beforeEach(() => {
    mockEventBus = new EventBus();
    mockPlayerManager = new MockPlayerManager();
    mockUIManager = new MockUIManager();
    mockScene = new MockScene();

    const config: NavigationManagerConfig = {
      eventBus: mockEventBus,
      playerManager: mockPlayerManager as any,
      uiManager: mockUIManager as any,
      scene: mockScene as any
    };

    navigationManager = new NavigationManager(config);
  });

  describe('Speed Classification', () => {
    test('should correctly classify walking speed', () => {
      mockPlayerManager.setMockVelocity(5, 0); // 5 pixels/sec ≈ 18 km/h
      
      const update = navigationManager.update(0.016);
      
      expect(update.speedConfig.category).toBe(SpeedCategory.WALKING);
      expect(update.speedKmh).toBeCloseTo(18, 0);
    });

    test('should correctly classify ground vehicle speed', () => {
      mockPlayerManager.setMockVelocity(30, 0); // 30 pixels/sec ≈ 108 km/h
      
      const update = navigationManager.update(0.016);
      
      expect(update.speedConfig.category).toBe(SpeedCategory.GROUND_VEHICLE);
      expect(update.speedKmh).toBeCloseTo(108, 0);
    });

    test('should correctly classify aircraft speed', () => {
      mockPlayerManager.setMockVelocity(200, 0); // 200 pixels/sec ≈ 720 km/h
      
      const update = navigationManager.update(0.016);
      
      expect(update.speedConfig.category).toBe(SpeedCategory.AIRCRAFT);
      expect(update.speedKmh).toBeCloseTo(720, 0);
    });

    test('should correctly classify supersonic speed', () => {
      mockPlayerManager.setMockVelocity(1000, 0); // 1000 pixels/sec ≈ 3600 km/h
      
      const update = navigationManager.update(0.016);
      
      expect(update.speedConfig.category).toBe(SpeedCategory.SUPERSONIC);
      expect(update.speedKmh).toBeCloseTo(3600, 0);
    });

    test('should correctly classify hypersonic speed', () => {
      mockPlayerManager.setMockVelocity(10000, 0); // 10000 pixels/sec ≈ 36000 km/h
      
      const update = navigationManager.update(0.016);
      
      expect(update.speedConfig.category).toBe(SpeedCategory.HYPERSONIC);
      expect(update.speedKmh).toBeCloseTo(36000, 0);
    });
  });

  describe('Speed Category Transitions', () => {
    test('should detect speed category transitions', () => {
      // Start at walking speed
      mockPlayerManager.setMockVelocity(5, 0);
      let update = navigationManager.update(0.016);
      expect(update.categoryTransition).toBeUndefined();
      expect(update.speedConfig.category).toBe(SpeedCategory.WALKING);

      // Transition to ground vehicle speed
      mockPlayerManager.setMockVelocity(30, 0);
      update = navigationManager.update(0.016);
      expect(update.categoryTransition).toBeDefined();
      expect(update.categoryTransition?.from).toBe(SpeedCategory.WALKING);
      expect(update.categoryTransition?.to).toBe(SpeedCategory.GROUND_VEHICLE);
    });

    test('should emit speed transition events', () => {
      const eventSpy = jest.fn();
      mockEventBus.on('SPEED_CATEGORY_TRANSITION', eventSpy);

      // Start at walking speed
      mockPlayerManager.setMockVelocity(5, 0);
      navigationManager.update(0.016);

      // Transition to aircraft speed
      mockPlayerManager.setMockVelocity(200, 0);
      navigationManager.update(0.016);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            from: SpeedCategory.WALKING,
            to: SpeedCategory.AIRCRAFT
          })
        })
      );
    });

    test('should emit supersonic entry event', () => {
      const eventSpy = jest.fn();
      mockEventBus.on('SUPERSONIC_ENTRY', eventSpy);

      // Start at aircraft speed
      mockPlayerManager.setMockVelocity(200, 0);
      navigationManager.update(0.016);

      // Transition to supersonic
      mockPlayerManager.setMockVelocity(1000, 0);
      navigationManager.update(0.016);

      expect(eventSpy).toHaveBeenCalled();
    });

    test('should emit hypersonic entry event', () => {
      const eventSpy = jest.fn();
      mockEventBus.on('HYPERSONIC_ENTRY', eventSpy);

      // Start at supersonic speed
      mockPlayerManager.setMockVelocity(1000, 0);
      navigationManager.update(0.016);

      // Transition to hypersonic
      mockPlayerManager.setMockVelocity(10000, 0);
      navigationManager.update(0.016);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            warpBoomArmed: true
          })
        })
      );
    });
  });

  describe('Camera System Integration', () => {
    test('should adjust camera zoom based on speed', () => {
      // Start at walking speed (zoom 1.0)
      mockPlayerManager.setMockVelocity(5, 0);
      navigationManager.update(0.016);

      // Transition to aircraft speed (zoom 0.1)
      mockPlayerManager.setMockVelocity(200, 0);
      
      // Run multiple updates to allow zoom interpolation
      for (let i = 0; i < 100; i++) {
        navigationManager.update(0.016);
      }

      expect(mockScene.cameras.main.setZoom).toHaveBeenCalled();
    });

    test('should implement look-ahead positioning for high speeds', () => {
      // Set supersonic speed with positive velocity
      mockPlayerManager.setMockVelocity(1000, 0);
      mockPlayerManager.setMockPosition(500, 300);
      
      navigationManager.update(0.016);

      expect(mockScene.cameras.main.centerOn).toHaveBeenCalled();
      expect(mockScene.cameras.main.setLerp).toHaveBeenCalledWith(0.1, 0.1);
    });
  });

  describe('UI System Integration', () => {
    test('should emit navigation UI update events', () => {
      const eventSpy = jest.fn();
      mockEventBus.on('NAVIGATION_UI_UPDATE', eventSpy);

      mockPlayerManager.setMockVelocity(30, 0);
      navigationManager.update(0.016);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            speedKmh: expect.any(Number),
            speedConfig: expect.any(Object),
            playerState: expect.any(Object),
            machNumber: expect.any(Number)
          })
        })
      );
    });
  });

  describe('Physics System Integration', () => {
    test('should emit physics update events with speed configuration', () => {
      const eventSpy = jest.fn();
      mockEventBus.on('NAVIGATION_PHYSICS_UPDATE', eventSpy);

      mockPlayerManager.setMockVelocity(200, 0);
      navigationManager.update(0.016);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            speedConfig: expect.any(Object),
            physicsSubsteps: 2, // Aircraft category uses 2 substeps
            collisionMethod: 'swept_volume',
            deltaTime: 0.016
          })
        })
      );
    });
  });

  describe('Emergency Systems', () => {
    test('should handle emergency deceleration requests', () => {
      const warpBoomSpy = jest.fn();
      mockEventBus.on('WARP_BOOM_ACTIVATED', warpBoomSpy);

      // Trigger emergency deceleration
      mockEventBus.emit({
        type: 'EMERGENCY_DECELERATION_REQUEST',
        data: { reason: 'obstacle_detected' }
      });

      expect(warpBoomSpy).toHaveBeenCalled();
      expect(mockScene.cameras.main.shake).toHaveBeenCalledWith(500, 0.02);
      expect(mockScene.sound.play).toHaveBeenCalledWith('warp_boom_deceleration', { volume: 1.0 });
    });
  });

  describe('Leyline Integration', () => {
    test('should handle leyline entry events', () => {
      const boostSpy = jest.fn();
      mockEventBus.on('LEYLINE_SPEED_BOOST_ACTIVE', boostSpy);

      mockEventBus.emit({
        type: 'LEYLINE_ENTERED',
        data: { leylineId: 'test-leyline' }
      });

      expect(boostSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            boostMultiplier: 1.5
          })
        })
      );
    });

    test('should handle leyline exit events', () => {
      const boostEndSpy = jest.fn();
      mockEventBus.on('LEYLINE_SPEED_BOOST_INACTIVE', boostEndSpy);

      mockEventBus.emit({
        type: 'LEYLINE_EXITED',
        data: { leylineId: 'test-leyline' }
      });

      expect(boostEndSpy).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    test('should track frame performance metrics', () => {
      const update = navigationManager.update(0.016);

      expect(update.performance).toBeDefined();
      expect(update.performance.frameTime).toBeGreaterThan(0);
      expect(update.performance.fps).toBeGreaterThan(0);
    });

    test('should maintain frame time history', () => {
      // Run multiple updates
      for (let i = 0; i < 10; i++) {
        navigationManager.update(0.016);
      }

      const update = navigationManager.update(0.016);
      expect(update.performance.fps).toBeGreaterThan(0);
    });
  });

  describe('Speed State Queries', () => {
    test('should return current speed configuration', () => {
      mockPlayerManager.setMockVelocity(200, 0);
      navigationManager.update(0.016);

      const speedConfig = navigationManager.getCurrentSpeedConfig();
      expect(speedConfig.category).toBe(SpeedCategory.AIRCRAFT);
    });

    test('should return current speed category', () => {
      mockPlayerManager.setMockVelocity(1000, 0);
      navigationManager.update(0.016);

      const category = navigationManager.getCurrentSpeedCategory();
      expect(category).toBe(SpeedCategory.SUPERSONIC);
    });

    test('should correctly identify extreme speeds', () => {
      // Test supersonic speed
      mockPlayerManager.setMockVelocity(1000, 0);
      navigationManager.update(0.016);
      expect(navigationManager.isExtremeSpeed()).toBe(true);

      // Test hypersonic speed
      mockPlayerManager.setMockVelocity(10000, 0);
      navigationManager.update(0.016);
      expect(navigationManager.isExtremeSpeed()).toBe(true);

      // Test normal speed
      mockPlayerManager.setMockVelocity(30, 0);
      navigationManager.update(0.016);
      expect(navigationManager.isExtremeSpeed()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing Jane gracefully', () => {
      const config: NavigationManagerConfig = {
        eventBus: mockEventBus,
        playerManager: { getJane: () => null } as any,
        uiManager: mockUIManager as any,
        scene: mockScene as any
      };

      const manager = new NavigationManager(config);
      
      expect(() => {
        manager.update(0.016);
      }).not.toThrow();
    });

    test('should handle missing player controller gracefully', () => {
      const mockPlayerManagerNoController = {
        getJane: () => ({ health: 100 })
      };

      const config: NavigationManagerConfig = {
        eventBus: mockEventBus,
        playerManager: mockPlayerManagerNoController as any,
        uiManager: mockUIManager as any,
        scene: mockScene as any
      };

      const manager = new NavigationManager(config);
      
      expect(() => {
        manager.update(0.016);
      }).not.toThrow();
    });
  });
});
