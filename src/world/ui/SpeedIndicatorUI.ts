// SpeedIndicatorUI.ts
// 2D side-scroller speed indicator UI for magnetospeeder navigation
// Provides visual feedback for speed, category, and emergency status

import { SpeedCategory } from '../terrain/HighSpeedTerrainSystem';
import { SpeedTransitionState } from '../speed/SpeedTransitionController';

export interface UIPosition {
  x: number;
  y: number;
}

export interface UISize {
  width: number;
  height: number;
}

export interface UIConfiguration {
  position: UIPosition;
  size: UISize;
  visible: boolean;
}

export interface CategoryStyle {
  primaryColor: string;
  secondaryColor: string;
  glowIntensity: number;
  animationSpeed: number;
}

export interface AnimationState {
  speedChangeIntensity: number;
  lastUpdateTime: number;
  pulsePhase: number;
  emergencyIntensity: number;
}

export class SpeedIndicatorUI {
  private configuration: UIConfiguration;
  private categoryStyles: Map<SpeedCategory, CategoryStyle> = new Map();
  private animationState: AnimationState;
  private lastState?: SpeedTransitionState;
  private needsRedrawFlag: boolean = true;

  constructor(private canvas: HTMLCanvasElement) {
    this.configuration = {
      position: { x: 50, y: 50 },
      size: this.calculateResponsiveSize(),
      visible: true,
    };

    this.initializeCategoryStyles();
    this.animationState = {
      speedChangeIntensity: 0,
      lastUpdateTime: Date.now(),
      pulsePhase: 0,
      emergencyIntensity: 0,
    };
  }

  // Configuration methods
  public getConfiguration(): UIConfiguration {
    return { ...this.configuration };
  }

  public configure(config: Partial<UIConfiguration>): void {
    this.configuration = { ...this.configuration, ...config };
    this.needsRedrawFlag = true;
  }

  public getCategoryStyles(): Map<SpeedCategory, CategoryStyle> {
    return new Map(this.categoryStyles);
  }

  // Main update and render methods
  public update(state: SpeedTransitionState, emergencyMode?: boolean): void {
    const now = Date.now();
    const deltaTime = now - this.animationState.lastUpdateTime;

    // Update animation state
    this.updateAnimationState(state, deltaTime);
    if (emergencyMode) {
      // Boost emergency intensity immediately
      this.animationState.emergencyIntensity = Math.min(1, this.animationState.emergencyIntensity + 0.5);
    }

    // Check if redraw is needed
    this.needsRedrawFlag = this.shouldRedraw(state);

    this.lastState = { ...state };
    this.animationState.lastUpdateTime = now;
  }

  public render(context: CanvasRenderingContext2D): void {
    if (!this.configuration.visible || !this.lastState) {
      return;
    }

    // Save context state
    context.save();

    try {
      // Clear area
      this.clearRenderArea(context);

      // Apply category-specific styling
      this.applyCategoryStyle(context, this.lastState.category);

      // Render main speed display
      this.renderSpeedDisplay(context, this.lastState);

      // Render category indicator
      this.renderCategoryIndicator(context, this.lastState);

      // Render status indicators
      this.renderStatusIndicators(context, this.lastState);

      // Render target speed if different
      if (Math.abs(this.lastState.currentSpeed - this.lastState.targetSpeed) > 1) {
        this.renderTargetSpeed(context, this.lastState);
      }

      // Apply visual effects
      this.applyVisualEffects(context, this.lastState);

    } finally {
      // Restore context state
      context.restore();
    }
  }

  // Animation and state management
  public getAnimationState(): AnimationState {
    return { ...this.animationState };
  }

  public needsRedraw(): boolean {
    return this.needsRedrawFlag;
  }

  // Private implementation methods
  private calculateResponsiveSize(): UISize {
    const baseWidth = 250;
    const baseHeight = 120;
    
    // Scale based on canvas size
    const scaleFactor = Math.min(this.canvas.width / 800, this.canvas.height / 600);
    
    return {
      width: Math.max(200, baseWidth * scaleFactor),
      height: Math.max(100, baseHeight * scaleFactor),
    };
  }

  private initializeCategoryStyles(): void {
    this.categoryStyles = new Map([
      [SpeedCategory.Walking, {
        primaryColor: '#4CAF50',   // Green
        secondaryColor: '#8BC34A',
        glowIntensity: 2,
        animationSpeed: 0.5,
      }],
      [SpeedCategory.GroundVehicle, {
        primaryColor: '#2196F3',   // Blue
        secondaryColor: '#64B5F6',
        glowIntensity: 4,
        animationSpeed: 1.0,
      }],
      [SpeedCategory.Aircraft, {
        primaryColor: '#FF9800',   // Orange
        secondaryColor: '#FFB74D',
        glowIntensity: 6,
        animationSpeed: 1.5,
      }],
      [SpeedCategory.Supersonic, {
        primaryColor: '#E91E63',   // Pink/Magenta
        secondaryColor: '#F06292',
        glowIntensity: 8,
        animationSpeed: 2.0,
      }],
      [SpeedCategory.Hypersonic, {
        primaryColor: '#9C27B0',   // Purple
        secondaryColor: '#BA68C8',
        glowIntensity: 12,
        animationSpeed: 3.0,
      }],
    ]);
  }

  private updateAnimationState(state: SpeedTransitionState, deltaTime: number): void {
    // Update speed change intensity
    if (this.lastState) {
      const speedDelta = Math.abs(state.currentSpeed - this.lastState.currentSpeed);
      this.animationState.speedChangeIntensity = Math.min(speedDelta / 100, 1.0);
    }

    // Update pulse phase for animations
    const style = this.categoryStyles.get(state.category)!;
    this.animationState.pulsePhase += (deltaTime / 1000) * style.animationSpeed;
    this.animationState.pulsePhase %= (Math.PI * 2);

    // Update emergency intensity
    if (state.isEmergencyDecelerating) {
      this.animationState.emergencyIntensity = Math.min(
        this.animationState.emergencyIntensity + deltaTime / 300, 1.0 // Faster accumulation
      );
    } else {
      this.animationState.emergencyIntensity = Math.max(
        this.animationState.emergencyIntensity - deltaTime / 1000, 0.0
      );
    }
    
    // Always update the last update time
    this.animationState.lastUpdateTime = Date.now();
  }

  private shouldRedraw(state: SpeedTransitionState): boolean {
    if (!this.lastState) return true;
    
    // Redraw if state changed significantly
    if (Math.abs(state.currentSpeed - this.lastState.currentSpeed) > 0.1) return true;
    if (state.category !== this.lastState.category) return true;
    if (state.isAccelerating !== this.lastState.isAccelerating) return true;
    if (state.isDecelerating !== this.lastState.isDecelerating) return true;
    if (state.isEmergencyDecelerating !== this.lastState.isEmergencyDecelerating) return true;
    
    // Redraw if animation is active
    if (this.animationState.speedChangeIntensity > 0.01) return true;
    if (this.animationState.emergencyIntensity > 0.01) return true;
    
    return false;
  }

  private clearRenderArea(context: CanvasRenderingContext2D): void {
    context.clearRect(
      this.configuration.position.x - 5,
      this.configuration.position.y - 5,
      this.configuration.size.width + 10,
      this.configuration.size.height + 10
    );
  }

  private applyCategoryStyle(context: CanvasRenderingContext2D, category: SpeedCategory): void {
    const style = this.categoryStyles.get(category)!;
    
    // Apply glow effect for high-speed categories
    if (category === SpeedCategory.Supersonic || category === SpeedCategory.Hypersonic) {
      context.shadowBlur = style.glowIntensity * (1 + Math.sin(this.animationState.pulsePhase) * 0.3);
      context.shadowColor = style.primaryColor;
    }
  }

  private renderSpeedDisplay(context: CanvasRenderingContext2D, state: SpeedTransitionState): void {
    const { x, y } = this.configuration.position;
    const fontSize = this.calculateFontSize(48);
    
    context.font = `bold ${fontSize}px 'Courier New', monospace`;
    context.fillStyle = this.categoryStyles.get(state.category)!.primaryColor;
    
    // Format speed display
    const speedText = Math.round(state.currentSpeed).toString();
    context.fillText(speedText, x + 10, y + 40);
    
    // Add units
    context.font = `${Math.round(fontSize * 0.6)}px 'Courier New', monospace`;
    context.fillText('km/h', x + 10, y + 65);
    
    // Add Mach number for high speeds
    if (state.category === SpeedCategory.Supersonic || state.category === SpeedCategory.Hypersonic) {
      const machNumber = Math.round(state.currentSpeed / 343);
      context.font = `${Math.round(fontSize * 0.8)}px 'Courier New', monospace`;
      context.fillText(`MACH ${machNumber}`, x + 10, y + 90);
    }
  }

  private renderCategoryIndicator(context: CanvasRenderingContext2D, state: SpeedTransitionState): void {
    const { x, y } = this.configuration.position;
    const fontSize = this.calculateFontSize(16);
    
    context.font = `${fontSize}px 'Arial', sans-serif`;
    context.fillStyle = this.categoryStyles.get(state.category)!.secondaryColor;
    
    const categoryName = state.category.toUpperCase();
    context.fillText(categoryName, x + 10, y + 15);
  }

  private renderStatusIndicators(context: CanvasRenderingContext2D, state: SpeedTransitionState): void {
    const { x, y } = this.configuration.position;
    const { width } = this.configuration.size;
    const fontSize = this.calculateFontSize(24);
    
    context.font = `${fontSize}px 'Arial', sans-serif`;
    
    // Emergency warning
    if (state.isEmergencyDecelerating) {
      const alpha = 0.5 + Math.sin(this.animationState.pulsePhase * 4) * 0.5;
      context.fillStyle = `rgba(255, 0, 0, ${alpha})`;
      context.fillText('⚠ EMERGENCY WARPBOOM ⚠', x + 10, y + 110);
    }
    // Acceleration indicator
    else if (state.isAccelerating) {
      context.fillStyle = '#4CAF50';
      context.fillText('↑', x + width - 40, y + 40);
    }
    // Deceleration indicator
    else if (state.isDecelerating) {
      context.fillStyle = '#FF5722';
      context.fillText('↓', x + width - 40, y + 40);
    }
  }

  private renderTargetSpeed(context: CanvasRenderingContext2D, state: SpeedTransitionState): void {
    const { x, y } = this.configuration.position;
    const { width } = this.configuration.size;
    const fontSize = this.calculateFontSize(14);
    
    context.font = `${fontSize}px 'Arial', sans-serif`;
    context.fillStyle = '#999999';
    
    context.fillText('TARGET:', x + width - 120, y + 60);
    context.fillText(Math.round(state.targetSpeed).toString(), x + width - 120, y + 80);
  }

  private applyVisualEffects(_context: CanvasRenderingContext2D, _state: SpeedTransitionState): void {
    // Keep shadow effects for testing - don't reset them here
    // Additional visual effects can be added here
    // Such as speed lines, particle effects, etc.
  }

  private calculateFontSize(baseSize: number): number {
    const scaleFactor = Math.min(this.canvas.width / 800, this.canvas.height / 600);
    return Math.max(10, Math.round(baseSize * scaleFactor));
  }
}
