// SideScrollCameraController.ts
// 2D side-scroller camera system for magnetospeeder extreme speed travel
// Handles dynamic zoom from walking (5 km/h) to hypersonic (Mach 1000)

import { SpeedCategory } from '../terrain/HighSpeedTerrainSystem';

export interface CameraPosition {
  x: number;
  y: number;
}

export interface CameraState {
  position: CameraPosition;
  zoom: number;
  lookAheadDistance: number;
  altitudeOffset: number;
}

export interface CameraConfig {
  category: SpeedCategory;
  baseZoom: number;        // Base zoom level (1.0 = normal, 0.1 = 10x zoom out)
  viewDistance: number;    // How far ahead to see horizontally (meters)
  lookAheadTime: number;   // How far ahead to look (seconds)
  smoothingFactor: number; // Camera movement smoothing (0-1)
  altitudeAwareness: number; // How much to adjust for altitude (0-1)
}

export class SideScrollCameraController {
  private currentState: CameraState;
  private targetState: CameraState;
  private cameraConfigs: Map<SpeedCategory, CameraConfig> = new Map();
  private phaserCamera?: Phaser.Cameras.Scene2D.Camera;
  
  constructor(camera?: any) {
    this.currentState = {
      position: { x: 0, y: 0 },
      zoom: 1.0,
      lookAheadDistance: 0,
      altitudeOffset: 0
    };
    
    this.targetState = { ...this.currentState };
    
    this.initializeCameraConfigs();
    if (camera && typeof camera.setZoom === 'function') {
      // Treat passed object as a phaser-like camera
      // @ts-ignore
      this.phaserCamera = camera;
    }
  }

  private initializeCameraConfigs(): void {
    this.cameraConfigs = new Map([
      // Walking (5-50 km/h) - Close-up detail view
      [SpeedCategory.Walking, {
        category: SpeedCategory.Walking,
        baseZoom: 1.0,           // Normal zoom
        viewDistance: 200,       // 200m view distance
        lookAheadTime: 2.0,      // 2 seconds ahead
        smoothingFactor: 0.9,    // Smooth following
        altitudeAwareness: 1.0   // Full altitude awareness
      }],
      
      // Ground Vehicle (50-200 km/h) - Medium zoom out
      [SpeedCategory.GroundVehicle, {
        category: SpeedCategory.GroundVehicle,
        baseZoom: 0.7,           // Slight zoom out
        viewDistance: 800,       // 800m view distance
        lookAheadTime: 3.0,      // 3 seconds ahead
        smoothingFactor: 0.8,    // Good following
        altitudeAwareness: 0.8   // Good altitude awareness
      }],
      
      // Aircraft (200-2000 km/h) - Significant zoom out
      [SpeedCategory.Aircraft, {
        category: SpeedCategory.Aircraft,
        baseZoom: 0.3,           // 3x zoom out
        viewDistance: 3000,      // 3km view distance
        lookAheadTime: 4.0,      // 4 seconds ahead
        smoothingFactor: 0.7,    // Responsive following
        altitudeAwareness: 0.6   // Moderate altitude awareness
      }],
      
      // Supersonic (Mach 1-10) - Major zoom out
      [SpeedCategory.Supersonic, {
        category: SpeedCategory.Supersonic,
        baseZoom: 0.1,           // 10x zoom out
        viewDistance: 20000,     // 20km view distance
        lookAheadTime: 5.0,      // 5 seconds ahead
        smoothingFactor: 0.6,    // Predictive following
        altitudeAwareness: 0.4   // Reduced altitude awareness
      }],
      
      // Hypersonic (Mach 10-1000) - Extreme zoom out
      [SpeedCategory.Hypersonic, {
        category: SpeedCategory.Hypersonic,
        baseZoom: 0.02,          // 50x zoom out
        viewDistance: 200000,    // 200km view distance
        lookAheadTime: 10.0,     // 10 seconds ahead
        smoothingFactor: 0.5,    // Highly predictive
        altitudeAwareness: 0.2   // Minimal altitude awareness
      }]
    ]);
  }

  /**
   * Attach to Phaser camera for integration with game engine
   */
  attachPhaserCamera(camera: Phaser.Cameras.Scene2D.Camera): void {
    this.phaserCamera = camera;
  }

  /**
   * Update camera based on player position, speed, and velocity
   */
  updateCamera(
    playerX: number,
    playerY: number,
    speedKmh: number,
    velocityX: number, // m/s, positive = eastward
    deltaTime: number = 16 // ms
  ): void {
    // Determine appropriate camera configuration
    const speedCategory = this.determineSpeedCategory(speedKmh);
    const config = this.cameraConfigs.get(speedCategory)!;
    
    // Calculate target camera state
    this.calculateTargetState(playerX, playerY, velocityX, config);
    
    // Smooth transition to target state
    this.smoothTransition(deltaTime, config.smoothingFactor);
    
    // Apply to Phaser camera if attached
    this.applyToPhaser();
  }

  private determineSpeedCategory(speedKmh: number): SpeedCategory {
    if (speedKmh < 50) return SpeedCategory.Walking;
    if (speedKmh < 200) return SpeedCategory.GroundVehicle;
    if (speedKmh < 2000) return SpeedCategory.Aircraft;
    if (speedKmh < 20000) return SpeedCategory.Supersonic;
    return SpeedCategory.Hypersonic;
  }

  private calculateTargetState(
    playerX: number,
    playerY: number,
    velocityX: number,
    config: CameraConfig
  ): void {
    // Calculate look-ahead distance based on velocity and time
    const lookAheadDistance = Math.abs(velocityX) * config.lookAheadTime;
    
    // Target position: player position + look-ahead
    this.targetState.position.x = playerX + (velocityX > 0 ? lookAheadDistance : -lookAheadDistance);
    
    // Altitude following with awareness factor
    this.targetState.position.y = playerY + (config.altitudeAwareness * 50); // Basic altitude offset
    
    // Set target zoom and look-ahead
    this.targetState.zoom = config.baseZoom;
    this.targetState.lookAheadDistance = lookAheadDistance;
  }

  private smoothTransition(deltaTime: number, smoothingFactor: number): void {
    const alpha = Math.min(1.0, (deltaTime / 1000) * (1 - smoothingFactor) * 10);
    
    // Smooth position transition
    this.currentState.position.x += (this.targetState.position.x - this.currentState.position.x) * alpha;
    this.currentState.position.y += (this.targetState.position.y - this.currentState.position.y) * alpha;
    
    // Smooth zoom transition (critical for motion sickness prevention)
    this.currentState.zoom += (this.targetState.zoom - this.currentState.zoom) * alpha * 0.5; // Slower zoom changes
    
    // Update other properties
    this.currentState.lookAheadDistance = this.targetState.lookAheadDistance;
  }

  private applyToPhaser(): void {
    if (!this.phaserCamera) return;
    
    // Apply zoom
    this.phaserCamera.setZoom(this.currentState.zoom);
    
    // Apply camera position (Phaser uses center-based positioning)
    if (typeof (this.phaserCamera as any).centerOn === 'function') {
      (this.phaserCamera as any).centerOn(this.currentState.position.x, this.currentState.position.y);
    } else {
      (this.phaserCamera as any).x = this.currentState.position.x;
      (this.phaserCamera as any).y = this.currentState.position.y;
    }
  }

  /**
   * Emergency camera reset for WarpBoom deceleration
   */
  emergencyReset(playerX: number, playerY: number): void {
    // Immediately reset to safe walking camera
    const walkingConfig = this.cameraConfigs.get(SpeedCategory.Walking)!;
    
    this.currentState.position.x = playerX;
    this.currentState.position.y = playerY;
    this.currentState.zoom = walkingConfig.baseZoom;
    this.currentState.lookAheadDistance = 0;
    
    this.targetState = { ...this.currentState };
    
    this.applyToPhaser();
  }

  /**
   * Get current camera state for debugging/UI
   */
  getCurrentState(): CameraState {
    return { ...this.currentState };
  }

  /**
   * Force immediate update without smoothing (useful for testing)
   */
  forceImmediateUpdate(
    playerX: number,
    playerY: number,
    speedKmh: number,
    velocityX: number
  ): void {
    // Determine appropriate camera configuration
    const speedCategory = this.determineSpeedCategory(speedKmh);
    const config = this.cameraConfigs.get(speedCategory)!;
    
    // Calculate target camera state
    this.calculateTargetState(playerX, playerY, velocityX, config);
    
    // Apply immediately without smoothing
    this.currentState = { ...this.targetState };
    
    // Apply to Phaser camera if attached
    this.applyToPhaser();
  }

  /**
   * Handle emergency zoom adjustments during extreme speed changes
   */
  handleSpeedTransition(oldSpeedKmh: number, newSpeedKmh: number): void {
    const oldCategory = this.determineSpeedCategory(oldSpeedKmh);
    const newCategory = this.determineSpeedCategory(newSpeedKmh);
    
    // If major speed category change, adjust smoothing for safety
    if (oldCategory !== newCategory) {
      console.log(`Camera transition: ${oldCategory} -> ${newCategory} (${oldSpeedKmh} -> ${newSpeedKmh} km/h)`);
      
      // For extreme transitions (e.g., WarpBoom), use faster smoothing
      const speedDifference = Math.abs(newSpeedKmh - oldSpeedKmh);
      if (speedDifference > 50000) { // >50,000 km/h change
        // Emergency transition - faster smoothing to prevent disorientation
        const newConfig = this.cameraConfigs.get(newCategory)!;
        this.targetState.zoom = newConfig.baseZoom;
      }
    }
  }

  /**
   * Get recommended camera bounds for terrain streaming
   */
  getCameraBounds(): { left: number; right: number; viewWidth: number } {
    const viewWidth = this.currentState.lookAheadDistance * 2; // Look ahead + behind
    const left = this.currentState.position.x - viewWidth / 2;
    const right = this.currentState.position.x + viewWidth / 2;
    
    return { left, right, viewWidth };
  }

  // Legacy wrapper used by integration tests (simplified signature)
  updateForSpeed(positionX: number, speedKmh: number, category?: SpeedCategory) {
    // category param retained for backward compatibility / future logic
    this.updateCamera(positionX, 0, speedKmh, (speedKmh * 1000 / 3600));
  }

  // Alias for test expectations
  getCameraState() { return this.getCurrentState(); }
}
