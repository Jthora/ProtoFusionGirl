// NavigationManager.ts
// Central coordinator for magnetospeeder navigation system
// Integrates with existing ProtoFusionGirl architecture (EventBus, PlayerManager, UIManager, etc.)

import { EventBus } from '../../core/EventBus';
import { PlayerManager } from '../../core/PlayerManager';
import { UIManager } from '../../core/UIManager';
import { SpeedClassifier, SpeedConfig, SpeedCategory } from './SpeedCategories';
import { SpeedControlSystem } from '../controls/SpeedControlSystem';

export interface PlayerState {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  facing: 'left' | 'right';
  isGrounded: boolean;
  health: number;
}

export interface NavigationUpdate {
  speedConfig: SpeedConfig;
  speedKmh: number;
  categoryTransition?: {
    from: SpeedCategory;
    to: SpeedCategory;
  };
  performance: {
    frameTime: number;
    fps: number;
  };
}

export interface NavigationManagerConfig {
  eventBus: EventBus;
  playerManager: PlayerManager;
  uiManager: UIManager;
  scene: Phaser.Scene;
}

export class NavigationManager {
  private eventBus: EventBus;
  private playerManager: PlayerManager;
  private uiManager: UIManager;
  private scene: Phaser.Scene;
  
  private currentSpeedConfig: SpeedConfig;
  private frameStartTime: number = 0;
  private speedControlSystem: SpeedControlSystem;
  
  // Performance monitoring
  private frameTimes: number[] = [];
  private maxFrameTimeHistory = 60; // Track last 60 frames
  
  constructor(config: NavigationManagerConfig) {
    this.eventBus = config.eventBus;
    this.playerManager = config.playerManager;
    this.uiManager = config.uiManager;
    this.scene = config.scene;
    
    // Initialize with walking speed
    this.currentSpeedConfig = SpeedClassifier.classifySpeed(0);
    
    // Initialize speed control system
    this.speedControlSystem = new SpeedControlSystem(this.eventBus, this.scene, {
      enableHypersonic: true,
      maxSpeedKmh: 343000 // Mach 1000
    });
    
    this.setupEventListeners();
  }

  /**
   * Main update loop called every frame
   * Coordinates all navigation systems based on player speed
   */
  update(deltaTime: number): NavigationUpdate {
    this.frameStartTime = Date.now();
    
    // Update speed control system first
    this.speedControlSystem.update(deltaTime);
    
    // Get current player state
    const playerState = this.getCurrentPlayerState();
    
    // Get speed from speed control system
    const speedKmh = this.speedControlSystem.getCurrentSpeed();
    
    // Apply speed to player velocity (convert km/h to pixels/second)
    this.applySpeedToPlayer(playerState, speedKmh);
    
    // Classify speed and get configuration
    const newSpeedConfig = SpeedClassifier.classifySpeed(speedKmh);
    
    // Handle speed category transitions
    let categoryTransition: { from: SpeedCategory; to: SpeedCategory } | undefined;
    if (newSpeedConfig.category !== this.currentSpeedConfig.category) {
      categoryTransition = {
        from: this.currentSpeedConfig.category,
        to: newSpeedConfig.category
      };
      this.handleSpeedCategoryTransition(this.currentSpeedConfig, newSpeedConfig);
      this.currentSpeedConfig = newSpeedConfig;
    }
    
    // Update systems based on current speed configuration
    this.updateCameraSystem(playerState, newSpeedConfig);
    this.updateUISystem(playerState, newSpeedConfig, speedKmh);
    this.updatePhysicsSystem(playerState, newSpeedConfig, deltaTime);
    this.updateTerrainStreaming(playerState, speedKmh);
    
    // Calculate performance metrics
    const frameTime = Date.now() - this.frameStartTime;
    const performanceMetrics = this.updatePerformanceMetrics(frameTime);
    
    return {
      speedConfig: newSpeedConfig,
      speedKmh,
      categoryTransition,
      performance: performanceMetrics
    };
  }

  /**
   * Get current player state from PlayerManager
   */
  private getCurrentPlayerState(): PlayerState {
    const jane = this.playerManager.getJane();
    if (!jane) {
      // Default state if Jane not available
      return {
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        facing: 'right',
        isGrounded: true,
        health: 100
      };
    }

    // Extract state from Jane/PlayerController
    const playerController = (jane as any).playerController;
    if (playerController && playerController.sprite) {
      const sprite = playerController.sprite;
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      
      return {
        position: { x: sprite.x, y: sprite.y },
        velocity: { x: body?.velocity.x || 0, y: body?.velocity.y || 0 },
        acceleration: { x: body?.acceleration.x || 0, y: body?.acceleration.y || 0 },
        facing: (body?.velocity.x || 0) >= 0 ? 'right' : 'left',
        isGrounded: body?.touching.down || false,
        health: (jane as any).health || 100
      };
    }

    // Fallback default state
    return {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      facing: 'right',
      isGrounded: true,
      health: 100
    };
  }

  /**
   * Apply speed from SpeedControlSystem to player physics
   */
  private applySpeedToPlayer(playerState: PlayerState, speedKmh: number): void {
    const jane = this.playerManager.getJane();
    if (!jane || !(jane as any).playerController) return;

    const playerController = (jane as any).playerController;
    const sprite = playerController.sprite;
    if (!sprite || !sprite.body) return;

    // Convert km/h to pixels per second (assuming 1 pixel = 1 meter)
    const speedMeterPerSecond = speedKmh / 3.6;
    const speedPixelsPerSecond = speedMeterPerSecond;

    // Apply speed in the current facing direction
    const direction = playerState.facing === 'right' ? 1 : -1;
    
    // Update the player controller's move speed for this frame
    if (speedKmh > 0) {
      playerController.moveSpeed = speedPixelsPerSecond;
      // Apply velocity directly for high speeds
      if (speedKmh > 50) {
        sprite.setVelocityX(direction * speedPixelsPerSecond);
      }
    } else {
      sprite.setVelocityX(0);
    }
  }

  /**
   * Calculate speed in km/h from velocity vector
   */
  private calculateSpeedKmh(velocity: { x: number; y: number }): number {
    // Calculate magnitude of velocity vector (pixels per second)
    const speedPixelsPerSecond = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    // Convert to km/h (assuming 1 pixel = 1 meter for now)
    // This conversion factor may need adjustment based on game scale
    const speedMeterPerSecond = speedPixelsPerSecond;
    const speedKmh = speedMeterPerSecond * 3.6; // m/s to km/h conversion
    
    return speedKmh;
  }

  /**
   * Handle transitions between speed categories
   */
  private handleSpeedCategoryTransition(oldConfig: SpeedConfig, newConfig: SpeedConfig): void {
    console.log(`[NavigationManager] Speed category transition: ${oldConfig.category} → ${newConfig.category}`);
    
    // Emit transition event
    this.eventBus.emit({
      type: 'SPEED_CATEGORY_TRANSITION',
      data: {
        from: oldConfig.category,
        to: newConfig.category,
        oldConfig,
        newConfig
      }
    });

    // Handle specific transition logic
    if (newConfig.category === SpeedCategory.SUPERSONIC && oldConfig.category !== SpeedCategory.SUPERSONIC) {
      this.handleSupersonicEntry();
    } else if (oldConfig.category === SpeedCategory.SUPERSONIC && newConfig.category !== SpeedCategory.SUPERSONIC) {
      this.handleSupersonicExit();
    }

    if (newConfig.category === SpeedCategory.HYPERSONIC && oldConfig.category !== SpeedCategory.HYPERSONIC) {
      this.handleHypersonicEntry();
    } else if (oldConfig.category === SpeedCategory.HYPERSONIC && newConfig.category !== SpeedCategory.HYPERSONIC) {
      this.handleHypersonicExit();
    }
  }

  /**
   * Update camera system based on speed configuration
   */
  private updateCameraSystem(playerState: PlayerState, speedConfig: SpeedConfig): void {
    const camera = this.scene.cameras.main;
    if (!camera) return;

    // Interpolate camera zoom based on speed
    const targetZoom = speedConfig.cameraZoom;
    const currentZoom = camera.zoom;
    const zoomSpeed = 0.02; // Smooth zoom transition
    
    if (Math.abs(targetZoom - currentZoom) > 0.001) {
      const newZoom = currentZoom + (targetZoom - currentZoom) * zoomSpeed;
      camera.setZoom(newZoom);
    }

    // Look-ahead positioning for high speeds
    if (speedConfig.category === SpeedCategory.SUPERSONIC || speedConfig.category === SpeedCategory.HYPERSONIC) {
      const lookAheadDistance = Math.abs(playerState.velocity.x) * 0.5; // Look ahead based on velocity
      const targetX = playerState.position.x + (playerState.velocity.x > 0 ? lookAheadDistance : -lookAheadDistance);
      camera.setLerp(0.1, 0.1); // Smooth camera following
      camera.centerOn(targetX, playerState.position.y);
    } else {
      // Normal camera following for lower speeds
      camera.setLerp(0.05, 0.05);
      camera.centerOn(playerState.position.x, playerState.position.y);
    }
  }

  /**
   * Update UI system based on speed and player state
   */
  private updateUISystem(playerState: PlayerState, speedConfig: SpeedConfig, speedKmh: number): void {
    // Emit UI update event
    this.eventBus.emit({
      type: 'NAVIGATION_UI_UPDATE',
      data: {
        speedKmh,
        speedConfig,
        playerState,
        machNumber: speedKmh >= 1235 ? speedKmh / 1235 : 0 // Speed of sound ≈ 1235 km/h
      }
    });

    // Update minimap if available
    if (this.uiManager.minimap) {
      // Scale minimap based on speed category
      // Note: Minimap scaling would need to be implemented in the Minimap class
      // this.uiManager.minimap.setScale(this.getMinimapScale(speedConfig.category));
    }
  }

  /**
   * Update physics system based on speed configuration
   */
  private updatePhysicsSystem(_playerState: PlayerState, speedConfig: SpeedConfig, deltaTime: number): void {
    // Emit physics update event with speed-based parameters
    this.eventBus.emit({
      type: 'NAVIGATION_PHYSICS_UPDATE',
      data: {
        speedConfig,
        physicsSubsteps: speedConfig.physicsSubsteps,
        collisionMethod: speedConfig.collisionMethod,
        deltaTime
      }
    });
  }

  /**
   * Update terrain streaming system based on speed
   */
  private updateTerrainStreaming(playerState: PlayerState, speedKmh: number): void {
    // Get chunk loader from scene
    const chunkLoader = (this.scene as any).chunkLoader;
    if (chunkLoader && chunkLoader.updateLoadedChunks) {
      chunkLoader.updateLoadedChunks(playerState.position.x, playerState.position.y, speedKmh);
    }
  }

  /**
   * Handle entry into supersonic speeds
   */
  private handleSupersonicEntry(): void {
    console.log('[NavigationManager] Entering supersonic speed range');
    
    // Play supersonic entry effects
    if (this.scene.sound) {
      this.scene.sound.play('sonic_boom', { volume: 0.7 });
    }

    // Emit event for other systems
    this.eventBus.emit({
      type: 'SUPERSONIC_ENTRY',
      data: { timestamp: Date.now() }
    });
  }

  /**
   * Handle exit from supersonic speeds
   */
  private handleSupersonicExit(): void {
    console.log('[NavigationManager] Exiting supersonic speed range');
    
    this.eventBus.emit({
      type: 'SUPERSONIC_EXIT',
      data: { timestamp: Date.now() }
    });
  }

  /**
   * Handle entry into hypersonic speeds
   */
  private handleHypersonicEntry(): void {
    console.log('[NavigationManager] Entering hypersonic speed range - EXTREME CAUTION');
    
    // Emergency systems activation
    this.eventBus.emit({
      type: 'HYPERSONIC_ENTRY',
      data: { 
        timestamp: Date.now(),
        warpBoomArmed: true 
      }
    });
  }

  /**
   * Handle exit from hypersonic speeds
   */
  private handleHypersonicExit(): void {
    console.log('[NavigationManager] Exiting hypersonic speed range');
    
    this.eventBus.emit({
      type: 'HYPERSONIC_EXIT',
      data: { 
        timestamp: Date.now(),
        warpBoomDisarmed: true 
      }
    });
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(frameTime: number): { frameTime: number; fps: number } {
    // Ensure minimum frame time for realistic performance calculation
    const actualFrameTime = Math.max(frameTime, 0.01); // Minimum 0.01ms
    
    this.frameTimes.push(actualFrameTime);
    if (this.frameTimes.length > this.maxFrameTimeHistory) {
      this.frameTimes.shift();
    }

    const avgFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
    const fps = 1000 / avgFrameTime;

    return {
      frameTime: avgFrameTime,
      fps: Math.round(fps)
    };
  }

  /**
   * Setup event listeners for navigation system
   */
  private setupEventListeners(): void {
    // Listen for emergency deceleration requests
    this.eventBus.on('EMERGENCY_DECELERATION_REQUEST', (event: any) => {
      this.handleEmergencyDeceleration(event.data);
    });

    // Listen for leyline interaction events
    this.eventBus.on('LEYLINE_ENTERED', (event: any) => {
      this.handleLeylineEntry(event.data);
    });

    this.eventBus.on('LEYLINE_EXITED', (event: any) => {
      this.handleLeylineExit(event.data);
    });
  }

  /**
   * Handle emergency deceleration (WarpBoom system)
   */
  private handleEmergencyDeceleration(_data: any): void {
    console.log('[NavigationManager] Emergency deceleration activated');
    
    // Force immediate speed reduction
    const jane = this.playerManager.getJane();
    if (jane && (jane as any).playerController) {
      const playerController = (jane as any).playerController;
      const sprite = playerController.sprite;
      
      if (sprite && sprite.body) {
        const body = sprite.body as Phaser.Physics.Arcade.Body;
        
        // Emergency velocity reduction
        body.setVelocity(body.velocity.x * 0.1, body.velocity.y * 0.1);
        
        // Visual and audio feedback
        if (this.scene.sound) {
          this.scene.sound.play('warp_boom_deceleration', { volume: 1.0 });
        }
        
        // Screen shake effect
        this.scene.cameras.main.shake(500, 0.02);
      }
    }

    this.eventBus.emit({
      type: 'WARP_BOOM_ACTIVATED',
      data: { timestamp: Date.now() }
    });
  }

  /**
   * Handle leyline entry for speed boost
   */
  private handleLeylineEntry(_data: any): void {
    console.log('[NavigationManager] Entered leyline energy corridor');
    
    this.eventBus.emit({
      type: 'LEYLINE_SPEED_BOOST_ACTIVE',
      data: { boostMultiplier: 1.5, timestamp: Date.now() }
    });
  }

  /**
   * Handle leyline exit
   */
  private handleLeylineExit(_data: any): void {
    console.log('[NavigationManager] Exited leyline energy corridor');
    
    this.eventBus.emit({
      type: 'LEYLINE_SPEED_BOOST_INACTIVE',
      data: { timestamp: Date.now() }
    });
  }

  /**
   * Get current speed configuration
   */
  getCurrentSpeedConfig(): SpeedConfig {
    return this.currentSpeedConfig;
  }

  /**
   * Get current speed category
   */
  getCurrentSpeedCategory(): SpeedCategory {
    return this.currentSpeedConfig.category;
  }

  /**
   * Check if currently in extreme speed range (supersonic or hypersonic)
   */
  isExtremeSpeed(): boolean {
    return this.currentSpeedConfig.category === SpeedCategory.SUPERSONIC ||
           this.currentSpeedConfig.category === SpeedCategory.HYPERSONIC;
  }

  /**
   * Get the speed control system for external access
   */
  getSpeedControlSystem(): SpeedControlSystem {
    return this.speedControlSystem;
  }

  /**
   * Get current speed in km/h
   */
  getCurrentSpeed(): number {
    return this.speedControlSystem.getCurrentSpeed();
  }

  /**
   * Set target speed in km/h
   */
  setTargetSpeed(speedKmh: number): void {
    this.speedControlSystem.setTargetSpeed(speedKmh);
  }

  /**
   * Get speed control help text
   */
  getSpeedControlHelp(): string {
    return this.speedControlSystem.getSpeedModeHelp();
  }

  /**
   * Emergency stop - immediately set speed to 0
   */
  emergencyStop(): void {
    this.speedControlSystem.emergencyStop();
  }
}
