// SpeedIndicatorUI.test.ts
// TDD tests for magnetospeeder speed indicator UI component
// Provides visual feedback for current speed, category, and status

import { SpeedIndicatorUI } from '../SpeedIndicatorUI';
import { SpeedCategory } from '../../terrain/HighSpeedTerrainSystem';
import { SpeedTransitionState } from '../../speed/SpeedTransitionController';

// Mock DOM elements for testing
const mockCanvas = {
  getContext: jest.fn(() => ({
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 50 })),
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    // Mock properties as getter/setter pairs
    _fillStyle: '#000000',
    get fillStyle() { return this._fillStyle; },
    set fillStyle(value) { this._fillStyle = value; this.fillStyleSetter(value); },
    fillStyleSetter: jest.fn(),
    _font: '10px Arial',
    get font() { return this._font; },
    set font(value) { this._font = value; this.fontSetter(value); },
    fontSetter: jest.fn(),
    _shadowBlur: 0,
    get shadowBlur() { return this._shadowBlur; },
    set shadowBlur(value) { this._shadowBlur = value; this.shadowBlurSetter(value); },
    shadowBlurSetter: jest.fn(),
    _shadowColor: 'transparent',
    get shadowColor() { return this._shadowColor; },
    set shadowColor(value) { this._shadowColor = value; this.shadowColorSetter(value); },
    shadowColorSetter: jest.fn(),
  })),
  width: 800,
  height: 600,
} as any;

describe('SpeedIndicatorUI', () => {
  let speedIndicator: SpeedIndicatorUI;
  let mockContext: any;

  beforeEach(() => {
    mockContext = mockCanvas.getContext();
    speedIndicator = new SpeedIndicatorUI(mockCanvas);
  });

  describe('Initialization and Setup', () => {
    it('should initialize with default values', () => {
      const config = speedIndicator.getConfiguration();
      
      expect(config.position.x).toBe(50); // Top-left position
      expect(config.position.y).toBe(50);
      expect(config.size.width).toBeGreaterThan(200);
      expect(config.size.height).toBeGreaterThan(100);
      expect(config.visible).toBe(true);
    });

    it('should provide speed category styling information', () => {
      const styles = speedIndicator.getCategoryStyles();
      
      // Should have styles for all speed categories
      expect(styles.has(SpeedCategory.Walking)).toBe(true);
      expect(styles.has(SpeedCategory.GroundVehicle)).toBe(true);
      expect(styles.has(SpeedCategory.Aircraft)).toBe(true);
      expect(styles.has(SpeedCategory.Supersonic)).toBe(true);
      expect(styles.has(SpeedCategory.Hypersonic)).toBe(true);

      // Each style should have color and visual properties
      for (const [, style] of styles) {
        expect(style.primaryColor).toBeDefined();
        expect(style.secondaryColor).toBeDefined();
        expect(style.glowIntensity).toBeGreaterThan(0);
        expect(style.animationSpeed).toBeGreaterThan(0);
      }
    });

    it('should configure UI position and size', () => {
      speedIndicator.configure({
        position: { x: 100, y: 200 },
        size: { width: 300, height: 150 },
        visible: false,
      });

      const config = speedIndicator.getConfiguration();
      expect(config.position.x).toBe(100);
      expect(config.position.y).toBe(200);
      expect(config.size.width).toBe(300);
      expect(config.size.height).toBe(150);
      expect(config.visible).toBe(false);
    });
  });

  describe('Speed Display Rendering', () => {
    it('should render current speed with proper formatting', () => {
      const state: SpeedTransitionState = {
        currentSpeed: 125.67,
        targetSpeed: 150,
        category: SpeedCategory.GroundVehicle,
        isAccelerating: true,
        isDecelerating: false,
        isEmergencyDecelerating: false,
        velocityX: 35,
        position: 1000,
      };

      speedIndicator.update(state);
      speedIndicator.render(mockContext);

      // Should render speed with proper formatting
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringContaining('126'), // Rounded speed
        expect.any(Number),
        expect.any(Number)
      );
      
      // Should include units
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringContaining('km/h'),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should display speed category with appropriate styling', () => {
      const state: SpeedTransitionState = {
        currentSpeed: 1500,
        targetSpeed: 2000,
        category: SpeedCategory.Aircraft,
        isAccelerating: true,
        isDecelerating: false,
        isEmergencyDecelerating: false,
        velocityX: 417,
        position: 5000,
      };

      speedIndicator.update(state);
      speedIndicator.render(mockContext);

      // Should display category name
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringContaining('AIRCRAFT'),
        expect.any(Number),
        expect.any(Number)
      );

      // Should use category-specific colors
      expect(mockContext.fillStyleSetter).toHaveBeenCalled();
    });

    it('should show Mach number for supersonic speeds', () => {
      const state: SpeedTransitionState = {
        currentSpeed: 10290, // Mach 3
        targetSpeed: 15000,
        category: SpeedCategory.Supersonic,
        isAccelerating: true,
        isDecelerating: false,
        isEmergencyDecelerating: false,
        velocityX: 2858,
        position: 25000,
      };

      speedIndicator.update(state);
      speedIndicator.render(mockContext);

      // Should display Mach number
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringMatching(/MACH\s+3/),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should display hypersonic speeds with special formatting', () => {
      const state: SpeedTransitionState = {
        currentSpeed: 171500, // Mach 500
        targetSpeed: 343000,
        category: SpeedCategory.Hypersonic,
        isAccelerating: true,
        isDecelerating: false,
        isEmergencyDecelerating: false,
        velocityX: 47639,
        position: 100000,
      };

      speedIndicator.update(state);
      speedIndicator.render(mockContext);

      // Should display large Mach numbers
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringMatching(/MACH\s+500/),
        expect.any(Number),
        expect.any(Number)
      );

      // Should use special hypersonic styling
      expect(mockContext.fillStyleSetter).toHaveBeenCalled();
    });
  });

  describe('Status Indicators', () => {
    it('should show acceleration indicator when accelerating', () => {
      const state: SpeedTransitionState = {
        currentSpeed: 75,
        targetSpeed: 150,
        category: SpeedCategory.GroundVehicle,
        isAccelerating: true,
        isDecelerating: false,
        isEmergencyDecelerating: false,
        velocityX: 21,
        position: 2000,
      };

      speedIndicator.update(state);
      speedIndicator.render(mockContext);

      // Should render acceleration indicator (arrow up or similar)
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringMatching(/↑|▲|\+/),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should show deceleration indicator when decelerating', () => {
      const state: SpeedTransitionState = {
        currentSpeed: 150,
        targetSpeed: 75,
        category: SpeedCategory.GroundVehicle,
        isAccelerating: false,
        isDecelerating: true,
        isEmergencyDecelerating: false,
        velocityX: 21,
        position: 3000,
      };

      speedIndicator.update(state);
      speedIndicator.render(mockContext);

      // Should render deceleration indicator (arrow down or similar)
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringMatching(/↓|▼|\-/),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should show emergency warning during WarpBoom deceleration', () => {
      const state: SpeedTransitionState = {
        currentSpeed: 50000,
        targetSpeed: 500,
        category: SpeedCategory.Hypersonic,
        isAccelerating: false,
        isDecelerating: true,
        isEmergencyDecelerating: true,
        velocityX: 13889,
        position: 75000,
      };

      speedIndicator.update(state);
      speedIndicator.render(mockContext);

      // Should render emergency warning
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringMatching(/EMERGENCY|WARPBOOM|WARNING/i),
        expect.any(Number),
        expect.any(Number)
      );

      // Should use emergency colors (red/orange)
      expect(mockContext.fillStyleSetter).toHaveBeenCalled();
    });

    it('should display target speed when different from current', () => {
      const state: SpeedTransitionState = {
        currentSpeed: 800,
        targetSpeed: 1500,
        category: SpeedCategory.Aircraft,
        isAccelerating: true,
        isDecelerating: false,
        isEmergencyDecelerating: false,
        velocityX: 222,
        position: 10000,
      };

      speedIndicator.update(state);
      speedIndicator.render(mockContext);

      // Should display target speed
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringContaining('1500'),
        expect.any(Number),
        expect.any(Number)
      );

      // Should indicate it's a target
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringMatching(/TARGET|→|GOAL/i),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('Visual Effects and Animation', () => {
    it('should animate speed transitions smoothly', async () => {
      const state1: SpeedTransitionState = {
        currentSpeed: 100,
        targetSpeed: 100,
        category: SpeedCategory.GroundVehicle,
        isAccelerating: false,
        isDecelerating: false,
        isEmergencyDecelerating: false,
        velocityX: 28,
        position: 5000,
      };

      const state2: SpeedTransitionState = {
        ...state1,
        currentSpeed: 150,
        isAccelerating: true,
      };

      // First update
      speedIndicator.update(state1);
      const animation1 = speedIndicator.getAnimationState();

      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      // Second update  
      speedIndicator.update(state2);
      const animation2 = speedIndicator.getAnimationState();

      // Animation state should change
      expect(animation2.speedChangeIntensity).toBeGreaterThan(animation1.speedChangeIntensity);
      expect(animation2.lastUpdateTime).toBeGreaterThan(animation1.lastUpdateTime);
    });

    it('should apply glow effects for high-speed categories', () => {
      const supersonicState: SpeedTransitionState = {
        currentSpeed: 5000,
        targetSpeed: 5000,
        category: SpeedCategory.Supersonic,
        isAccelerating: false,
        isDecelerating: false,
        isEmergencyDecelerating: false,
        velocityX: 1389,
        position: 15000,
      };

      speedIndicator.update(supersonicState);
      speedIndicator.render(mockContext);

      // Should apply shadow/glow effects
      expect(mockContext.shadowBlur).toBeGreaterThan(0);
      expect(mockContext.shadowColor).toBeDefined();
    });

    it('should pulse during emergency deceleration', async () => {
      const emergencyState: SpeedTransitionState = {
        currentSpeed: 100000,
        targetSpeed: 1000,
        category: SpeedCategory.Hypersonic,
        isAccelerating: false,
        isDecelerating: true,
        isEmergencyDecelerating: true,
        velocityX: 27778,
        position: 200000,
      };

      speedIndicator.update(emergencyState);
      
      // Wait to allow animation accumulation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate multiple animation frames with time gaps
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 10));
        speedIndicator.render(mockContext);
        speedIndicator.update(emergencyState);
      }

      // Should show pulsing animation (alpha/scale changes)
      const animationState = speedIndicator.getAnimationState();
      expect(animationState.pulsePhase).toBeGreaterThan(0);
      expect(animationState.emergencyIntensity).toBeGreaterThan(0.5);
    });
  });

  describe('Responsive Design', () => {
    it('should scale UI elements based on canvas size', () => {
      // Test with small canvas
      const smallCanvas = { ...mockCanvas, width: 400, height: 300 };
      const smallSpeedIndicator = new SpeedIndicatorUI(smallCanvas);
      
      const smallConfig = smallSpeedIndicator.getConfiguration();
      
      // Test with large canvas
      const largeCanvas = { ...mockCanvas, width: 1600, height: 1200 };
      const largeSpeedIndicator = new SpeedIndicatorUI(largeCanvas);
      
      const largeConfig = largeSpeedIndicator.getConfiguration();

      // Large canvas should have larger UI elements
      expect(largeConfig.size.width).toBeGreaterThan(smallConfig.size.width);
      expect(largeConfig.size.height).toBeGreaterThan(smallConfig.size.height);
    });

    it('should adjust font sizes for readability', () => {
      const state: SpeedTransitionState = {
        currentSpeed: 2500,
        targetSpeed: 3000,
        category: SpeedCategory.Aircraft,
        isAccelerating: true,
        isDecelerating: false,
        isEmergencyDecelerating: false,
        velocityX: 694,
        position: 12000,
      };

      speedIndicator.update(state);
      speedIndicator.render(mockContext);

      // Should set appropriate font sizes
      expect(mockContext.fontSetter).toHaveBeenCalled();
      
      // Different elements should use different font sizes
      const fontCalls = mockContext.fontSetter.mock.calls;
      const uniqueFonts = new Set(fontCalls.map((call: any) => call[0]));
      expect(uniqueFonts.size).toBeGreaterThanOrEqual(2); // At least 2 different font sizes
    });
  });

  describe('Performance and Updates', () => {
    it('should update efficiently at 60 FPS', () => {
      const state: SpeedTransitionState = {
        currentSpeed: 1000,
        targetSpeed: 2000,
        category: SpeedCategory.Aircraft,
        isAccelerating: true,
        isDecelerating: false,
        isEmergencyDecelerating: false,
        velocityX: 278,
        position: 8000,
      };

      const iterations = 60;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        speedIndicator.update(state);
        speedIndicator.render(mockContext);
      }

      const updateTime = Date.now() - startTime;

      // Should complete 60 updates/renders quickly
      expect(updateTime).toBeLessThan(100); // <100ms for 60 frames
    });

    it('should only render when state changes or animation is active', () => {
      const staticState: SpeedTransitionState = {
        currentSpeed: 50,
        targetSpeed: 50,
        category: SpeedCategory.Walking,
        isAccelerating: false,
        isDecelerating: false,
        isEmergencyDecelerating: false,
        velocityX: 14,
        position: 1000,
      };

      // Clear mock calls
      mockContext.fillText.mockClear();
      
      // Update with same state multiple times
      speedIndicator.update(staticState);
      speedIndicator.render(mockContext);
      
      speedIndicator.update(staticState);
      speedIndicator.render(mockContext);

      // Should optimize rendering for static states
      expect(speedIndicator.needsRedraw()).toBe(false);
    });

    it('should handle extreme speed values without errors', () => {
      const extremeState: SpeedTransitionState = {
        currentSpeed: 343000, // Mach 1000
        targetSpeed: 343000,
        category: SpeedCategory.Hypersonic,
        isAccelerating: false,
        isDecelerating: false,
        isEmergencyDecelerating: false,
        velocityX: 95278,
        position: 1000000,
      };

      expect(() => {
        speedIndicator.update(extremeState);
        speedIndicator.render(mockContext);
      }).not.toThrow();

      // Should handle large numbers gracefully
      expect(mockContext.fillText).toHaveBeenCalledWith(
        expect.stringMatching(/MACH\s+1000/),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });
});
