# Implementation Guide for 2D Side-Scroller High-Speed Navigation

## Overview

This guide provides step-by-step implementation instructions for the magnetospeeder high-speed navigation system in a 2D side-scroller. The system handles speeds from 5 km/h to Mach 1000 with adaptive rendering, physics, and user interface systems.

## Project Structure Setup

### Directory Organization
```
src/
├── navigation/
│   ├── terrain/
│   │   ├── TerrainStreamer.ts          # Horizontal terrain streaming
│   │   ├── TerrainGenerator.ts         # Procedural 2D terrain
│   │   ├── TerrainCache.ts             # Memory management
│   │   └── TerrainCollision.ts         # Collision detection
│   ├── physics/
│   │   ├── AdaptivePhysics.ts          # Speed-based physics
│   │   ├── CollisionSystem.ts          # Multi-scale collision
│   │   ├── WarpBoomPhysics.ts          # Emergency deceleration
│   │   └── VelocityController.ts       # Speed management
│   ├── camera/
│   │   ├── DynamicCamera.ts            # Speed-adaptive camera
│   │   ├── ZoomController.ts           # Zoom management
│   │   └── CameraEffects.ts            # Visual effects
│   ├── ui/
│   │   ├── SpeedHUD.ts                 # Speed-adaptive interface
│   │   ├── NavigationDisplay.ts        # Navigation aids
│   │   ├── WarpBoomUI.ts               # Emergency controls
│   │   └── MinimapSystem.ts            # Multi-scale minimap
│   ├── leylines/
│   │   ├── LeylineSystem.ts            # Leyline mechanics
│   │   ├── LeylineDetection.ts         # Detection and visualization
│   │   ├── LeylinePhysics.ts           # Speed boost calculations
│   │   └── LeylineRenderer.ts          # Visual effects
│   └── core/
│       ├── NavigationManager.ts        # Main coordinator
│       ├── SpeedCategories.ts          # Speed classification
│       ├── PerformanceMonitor.ts       # Performance tracking
│       └── ConfigurationManager.ts     # Settings management
```

## Phase 1: Core Foundation

### Step 1: Speed Categories and Basic Structure

```typescript
// src/navigation/core/SpeedCategories.ts
export enum SpeedCategory {
  WALKING = "walking",           // 5-50 km/h
  GROUND_VEHICLE = "ground",     // 50-200 km/h
  AIRCRAFT = "aircraft",         // 200-2000 km/h
  SUPERSONIC = "supersonic",     // Mach 1-10 (343-3430 m/s)
  HYPERSONIC = "hypersonic"      // Mach 10-1000 (3430-343000 m/s)
}

export interface SpeedConfig {
  category: SpeedCategory;
  minSpeedKmh: number;
  maxSpeedKmh: number;
  physicsSubsteps: number;
  collisionMethod: CollisionMethod;
  cameraZoom: number;
  uiLayout: UILayout;
}

export class SpeedClassifier {
  private static readonly SPEED_CONFIGS: SpeedConfig[] = [
    {
      category: SpeedCategory.WALKING,
      minSpeedKmh: 0,
      maxSpeedKmh: 50,
      physicsSubsteps: 1,
      collisionMethod: CollisionMethod.PRECISE_PIXEL,
      cameraZoom: 1.0,
      uiLayout: UILayout.DETAILED
    },
    {
      category: SpeedCategory.GROUND_VEHICLE,
      minSpeedKmh: 50,
      maxSpeedKmh: 200,
      physicsSubsteps: 1,
      collisionMethod: CollisionMethod.BOUNDING_BOX,
      cameraZoom: 0.5,
      uiLayout: UILayout.AUTOMOTIVE
    },
    {
      category: SpeedCategory.AIRCRAFT,
      minSpeedKmh: 200,
      maxSpeedKmh: 2000,
      physicsSubsteps: 2,
      collisionMethod: CollisionMethod.SWEPT_VOLUME,
      cameraZoom: 0.1,
      uiLayout: UILayout.AVIATION
    },
    {
      category: SpeedCategory.SUPERSONIC,
      minSpeedKmh: 2000,
      maxSpeedKmh: 20000,
      physicsSubsteps: 10,
      collisionMethod: CollisionMethod.RAYCAST_TUNNEL,
      cameraZoom: 0.02,
      uiLayout: UILayout.MILITARY
    },
    {
      category: SpeedCategory.HYPERSONIC,
      minSpeedKmh: 20000,
      maxSpeedKmh: 343000,
      physicsSubsteps: 100,
      collisionMethod: CollisionMethod.PREDICTIVE_PATH,
      cameraZoom: 0.002,
      uiLayout: UILayout.ORBITAL
    }
  ];

  static classifySpeed(speedKmh: number): SpeedConfig {
    for (const config of this.SPEED_CONFIGS) {
      if (speedKmh >= config.minSpeedKmh && speedKmh < config.maxSpeedKmh) {
        return config;
      }
    }
    return this.SPEED_CONFIGS[this.SPEED_CONFIGS.length - 1]; // Default to hypersonic
  }
}
```

### Step 2: Navigation Manager Core

```typescript
// src/navigation/core/NavigationManager.ts
export class NavigationManager {
  private physicsEngine: AdaptivePhysicsEngine;
  private cameraController: DynamicCameraController;
  private terrainStreamer: TerrainStreamer;
  private uiController: SpeedAdaptiveUI;
  private leylineSystem: LeylineSystem;
  private warpBoomController: WarpBoomController;
  
  private currentSpeedConfig: SpeedConfig;
  private performanceMonitor: PerformanceMonitor;
  
  constructor() {
    this.physicsEngine = new AdaptivePhysicsEngine();
    this.cameraController = new DynamicCameraController();
    this.terrainStreamer = new TerrainStreamer();
    this.uiController = new SpeedAdaptiveUI();
    this.leylineSystem = new LeylineSystem();
    this.warpBoomController = new WarpBoomController();
    this.performanceMonitor = new PerformanceMonitor();
  }
  
  update(deltaTime: number, playerState: PlayerState): NavigationUpdate {
    const startTime = performance.now();
    
    // Classify current speed
    const speedKmh = this.calculateSpeedKmh(playerState.velocity);
    const newSpeedConfig = SpeedClassifier.classifySpeed(speedKmh);
    
    // Handle speed category transitions
    if (newSpeedConfig.category !== this.currentSpeedConfig?.category) {
      this.handleSpeedCategoryTransition(this.currentSpeedConfig, newSpeedConfig);
      this.currentSpeedConfig = newSpeedConfig;
    }
    
    // Update subsystems
    const physicsUpdate = this.physicsEngine.update(deltaTime, playerState, newSpeedConfig);
    const cameraUpdate = this.cameraController.update(deltaTime, playerState, newSpeedConfig);
    const terrainUpdate = this.terrainStreamer.update(playerState.position, playerState.velocity);
    const leylineUpdate = this.leylineSystem.update(playerState, newSpeedConfig);
    const uiUpdate = this.uiController.update(playerState, newSpeedConfig);
    
    // Check for emergency conditions
    const emergencyCheck = this.checkEmergencyConditions(playerState, terrainUpdate);
    
    const endTime = performance.now();
    this.performanceMonitor.recordFrame(endTime - startTime, speedKmh);
    
    return {
      physics: physicsUpdate,
      camera: cameraUpdate,
      terrain: terrainUpdate,
      leylines: leylineUpdate,
      ui: uiUpdate,
      emergency: emergencyCheck,
      performance: this.performanceMonitor.getCurrentStats()
    };
  }
  
  private handleSpeedCategoryTransition(
    oldConfig: SpeedConfig | undefined,
    newConfig: SpeedConfig
  ): void {
    console.log(`Speed category transition: ${oldConfig?.category || 'none'} → ${newConfig.category}`);
    
    // Notify subsystems of category change
    this.physicsEngine.onSpeedCategoryChange(newConfig);
    this.cameraController.onSpeedCategoryChange(newConfig);
    this.uiController.onSpeedCategoryChange(newConfig);
    this.terrainStreamer.onSpeedCategoryChange(newConfig);
  }
}
```

## Phase 2: Adaptive Physics System

### Step 3: Adaptive Physics Engine

```typescript
// src/navigation/physics/AdaptivePhysics.ts
export class AdaptivePhysicsEngine {
  private maxSafeDistancePerStep = 1.0; // 1 meter max per physics step
  private currentSubsteps = 1;
  
  update(
    deltaTime: number,
    playerState: PlayerState,
    speedConfig: SpeedConfig
  ): PhysicsUpdate {
    // Calculate required substeps based on speed
    const requiredSubsteps = this.calculateRequiredSubsteps(
      playerState.velocity,
      deltaTime,
      speedConfig
    );
    
    // Adaptive substep count with performance consideration
    this.currentSubsteps = Math.min(requiredSubsteps, speedConfig.physicsSubsteps);
    const substepDelta = deltaTime / this.currentSubsteps;
    
    let updatedPlayerState = { ...playerState };
    
    // Execute physics substeps
    for (let i = 0; i < this.currentSubsteps; i++) {
      updatedPlayerState = this.performPhysicsStep(
        updatedPlayerState,
        substepDelta,
        speedConfig
      );
    }
    
    return {
      newPlayerState: updatedPlayerState,
      substepsUsed: this.currentSubsteps,
      physicsLoad: this.currentSubsteps / speedConfig.physicsSubsteps
    };
  }
  
  private calculateRequiredSubsteps(
    velocity: Vector2D,
    deltaTime: number,
    speedConfig: SpeedConfig
  ): number {
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    const distanceThisFrame = speed * deltaTime;
    
    if (distanceThisFrame <= this.maxSafeDistancePerStep) {
      return 1;
    }
    
    const requiredSteps = Math.ceil(distanceThisFrame / this.maxSafeDistancePerStep);
    return Math.min(requiredSteps, speedConfig.physicsSubsteps * 2); // Cap at 2x normal
  }
  
  private performPhysicsStep(
    playerState: PlayerState,
    deltaTime: number,
    speedConfig: SpeedConfig
  ): PlayerState {
    // Apply forces
    const forces = this.calculateForces(playerState, speedConfig);
    
    // Update velocity
    const acceleration = {
      x: forces.x / playerState.mass,
      y: forces.y / playerState.mass
    };
    
    const newVelocity = {
      x: playerState.velocity.x + acceleration.x * deltaTime,
      y: playerState.velocity.y + acceleration.y * deltaTime
    };
    
    // Update position
    const newPosition = {
      x: playerState.position.x + newVelocity.x * deltaTime,
      y: playerState.position.y + newVelocity.y * deltaTime
    };
    
    // Apply constraints and collision detection
    const constrainedState = this.applyConstraints({
      ...playerState,
      position: newPosition,
      velocity: newVelocity
    }, speedConfig);
    
    return constrainedState;
  }
}
```

### Step 4: Multi-Scale Collision System

```typescript
// src/navigation/physics/CollisionSystem.ts
export class CollisionSystem {
  private collisionMethods: Map<CollisionMethod, CollisionDetector> = new Map();
  
  constructor() {
    this.collisionMethods.set(CollisionMethod.PRECISE_PIXEL, new PrecisePixelCollision());
    this.collisionMethods.set(CollisionMethod.BOUNDING_BOX, new BoundingBoxCollision());
    this.collisionMethods.set(CollisionMethod.SWEPT_VOLUME, new SweptVolumeCollision());
    this.collisionMethods.set(CollisionMethod.RAYCAST_TUNNEL, new RaycastTunnelCollision());
    this.collisionMethods.set(CollisionMethod.PREDICTIVE_PATH, new PredictivePathCollision());
  }
  
  checkCollision(
    playerState: PlayerState,
    terrainData: TerrainData,
    speedConfig: SpeedConfig,
    deltaTime: number
  ): CollisionResult {
    const detector = this.collisionMethods.get(speedConfig.collisionMethod);
    if (!detector) {
      throw new Error(`Collision method ${speedConfig.collisionMethod} not implemented`);
    }
    
    return detector.detectCollision(playerState, terrainData, deltaTime);
  }
}

// Implementation for hypersonic collision detection
class PredictivePathCollision implements CollisionDetector {
  detectCollision(
    playerState: PlayerState,
    terrainData: TerrainData,
    deltaTime: number
  ): CollisionResult {
    const predictionTime = 10.0; // 10 seconds ahead
    const sampleCount = 50; // 50 sample points
    
    const samples = this.generatePathSamples(
      playerState.position,
      playerState.velocity,
      predictionTime,
      sampleCount
    );
    
    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i];
      const terrainHeight = terrainData.getHeight(sample.x);
      
      if (sample.y <= terrainHeight + 5) { // 5m safety margin
        return {
          hasCollision: true,
          collisionPoint: sample,
          timeToCollision: (i / samples.length) * predictionTime,
          normal: { x: 0, y: 1 }, // Assume upward normal
          penetrationDepth: terrainHeight + 5 - sample.y
        };
      }
    }
    
    return { hasCollision: false };
  }
  
  private generatePathSamples(
    startPos: Vector2D,
    velocity: Vector2D,
    predictionTime: number,
    sampleCount: number
  ): Vector2D[] {
    const samples: Vector2D[] = [];
    
    for (let i = 0; i < sampleCount; i++) {
      const t = (i / (sampleCount - 1)) * predictionTime;
      samples.push({
        x: startPos.x + velocity.x * t,
        y: startPos.y + velocity.y * t
      });
    }
    
    return samples;
  }
}
```

## Phase 3: Dynamic Camera System

### Step 5: Speed-Adaptive Camera

```typescript
// src/navigation/camera/DynamicCamera.ts
export class DynamicCameraController {
  private currentZoom = 1.0;
  private targetZoom = 1.0;
  private lookAheadDistance = 0;
  private cameraPosition: Vector2D = { x: 0, y: 0 };
  private zoomTransitionManager = new ZoomTransitionManager();
  
  update(
    deltaTime: number,
    playerState: PlayerState,
    speedConfig: SpeedConfig
  ): CameraUpdate {
    // Calculate target zoom based on speed configuration
    this.targetZoom = speedConfig.cameraZoom;
    
    // Calculate look-ahead distance
    const speedMs = Math.sqrt(playerState.velocity.x ** 2 + playerState.velocity.y ** 2);
    this.lookAheadDistance = this.calculateLookAhead(speedMs);
    
    // Smooth zoom transition
    this.currentZoom = this.zoomTransitionManager.smoothTransition(
      this.currentZoom,
      this.targetZoom,
      deltaTime
    );
    
    // Update camera position with look-ahead
    this.updateCameraPosition(playerState);
    
    return {
      position: this.cameraPosition,
      zoom: this.currentZoom,
      lookAheadDistance: this.lookAheadDistance,
      viewBounds: this.calculateViewBounds()
    };
  }
  
  private calculateLookAhead(speedMs: number): number {
    const baseLookAhead = 20; // 20m minimum
    const speedLookAhead = speedMs * 3; // 3 seconds ahead
    const maxLookAhead = 10000; // 10km maximum
    
    return Math.min(baseLookAhead + speedLookAhead, maxLookAhead);
  }
  
  private updateCameraPosition(playerState: PlayerState): void {
    // Horizontal look-ahead based on velocity direction
    const velocityDirection = Math.sign(playerState.velocity.x);
    const lookAheadOffset = this.lookAheadDistance * velocityDirection;
    
    this.cameraPosition = {
      x: playerState.position.x + lookAheadOffset,
      y: playerState.position.y
    };
  }
  
  private calculateViewBounds(): ViewBounds {
    const baseWidth = 400; // 400m at zoom 1.0
    const baseHeight = 300; // 300m at zoom 1.0
    
    return {
      width: baseWidth / this.currentZoom,
      height: baseHeight / this.currentZoom,
      left: this.cameraPosition.x - (baseWidth / this.currentZoom) / 2,
      right: this.cameraPosition.x + (baseWidth / this.currentZoom) / 2,
      top: this.cameraPosition.y + (baseHeight / this.currentZoom) / 2,
      bottom: this.cameraPosition.y - (baseHeight / this.currentZoom) / 2
    };
  }
}
```

## Phase 4: Terrain Streaming System

### Step 6: Horizontal Terrain Streaming

```typescript
// src/navigation/terrain/TerrainStreamer.ts
export class TerrainStreamer {
  private chunks: Map<number, TerrainChunk> = new Map();
  private chunkSize = 1000; // 1km chunks
  private generator = new TerrainGenerator();
  private cache = new TerrainCache(100); // Cache 100 chunks
  
  update(
    playerPosition: Vector2D,
    playerVelocity: Vector2D
  ): TerrainUpdate {
    const currentChunk = Math.floor(playerPosition.x / this.chunkSize);
    const speedKmh = Math.sqrt(playerVelocity.x ** 2 + playerVelocity.y ** 2) * 3.6;
    
    // Calculate load radius based on speed
    const loadRadius = this.calculateLoadRadius(speedKmh);
    
    // Determine direction and prioritize loading
    const direction = Math.sign(playerVelocity.x);
    const startChunk = currentChunk - Math.floor(loadRadius * 0.3); // 30% behind
    const endChunk = currentChunk + Math.floor(loadRadius * 1.7);   // 170% ahead
    
    // Load required chunks
    const newChunks = this.loadChunkRange(startChunk, endChunk);
    
    // Unload distant chunks
    this.unloadDistantChunks(currentChunk, loadRadius * 2);
    
    return {
      activeChunks: Array.from(this.chunks.keys()),
      newChunksLoaded: newChunks,
      currentChunk: currentChunk,
      loadRadius: loadRadius
    };
  }
  
  private calculateLoadRadius(speedKmh: number): number {
    if (speedKmh < 200) return 5;      // 5 chunks (5km)
    if (speedKmh < 2000) return 20;    // 20 chunks (20km)
    if (speedKmh < 20000) return 100;  // 100 chunks (100km)
    return 500;                        // 500 chunks (500km) for hypersonic
  }
  
  private loadChunkRange(startChunk: number, endChunk: number): number[] {
    const newChunks: number[] = [];
    
    for (let chunkId = startChunk; chunkId <= endChunk; chunkId++) {
      if (!this.chunks.has(chunkId)) {
        const chunk = this.cache.get(chunkId) || this.generator.generateChunk(chunkId);
        this.chunks.set(chunkId, chunk);
        newChunks.push(chunkId);
      }
    }
    
    return newChunks;
  }
  
  getHeight(x: number): number {
    const chunkId = Math.floor(x / this.chunkSize);
    const chunk = this.chunks.get(chunkId);
    
    if (!chunk) {
      // Generate chunk on demand for immediate queries
      const newChunk = this.generator.generateChunk(chunkId);
      this.chunks.set(chunkId, newChunk);
      return newChunk.getHeight(x);
    }
    
    return chunk.getHeight(x);
  }
}
```

### Step 7: Procedural Terrain Generation

```typescript
// src/navigation/terrain/TerrainGenerator.ts
export class TerrainGenerator {
  private seed: number;
  private noiseGenerators: Map<string, NoiseGenerator> = new Map();
  
  constructor(seed: number = 12345) {
    this.seed = seed;
    this.initializeNoiseGenerators();
  }
  
  generateChunk(chunkId: number): TerrainChunk {
    const chunkStartX = chunkId * 1000; // 1km chunks
    const heightSamples: number[] = [];
    const sampleCount = 100; // 100 samples per chunk (10m resolution)
    
    for (let i = 0; i < sampleCount; i++) {
      const worldX = chunkStartX + (i * 10);
      const height = this.generateHeightAt(worldX);
      heightSamples.push(height);
    }
    
    return new TerrainChunk(chunkId, chunkStartX, heightSamples);
  }
  
  private generateHeightAt(x: number): number {
    // Multi-scale terrain generation
    const continentalScale = this.noiseGenerators.get('continental')!.noise(x / 50000) * 1000; // 0-1000m over 50km
    const regionalScale = this.noiseGenerators.get('regional')!.noise(x / 10000) * 500;        // 0-500m over 10km
    const localScale = this.noiseGenerators.get('local')!.noise(x / 1000) * 100;               // 0-100m over 1km
    const detailScale = this.noiseGenerators.get('detail')!.noise(x / 100) * 10;               // 0-10m over 100m
    
    return Math.max(0, continentalScale + regionalScale + localScale + detailScale);
  }
  
  private initializeNoiseGenerators(): void {
    this.noiseGenerators.set('continental', new SimplexNoise(this.seed));
    this.noiseGenerators.set('regional', new SimplexNoise(this.seed + 1));
    this.noiseGenerators.set('local', new SimplexNoise(this.seed + 2));
    this.noiseGenerators.set('detail', new SimplexNoise(this.seed + 3));
  }
}

export class TerrainChunk {
  constructor(
    public readonly id: number,
    public readonly startX: number,
    private heightSamples: number[]
  ) {}
  
  getHeight(worldX: number): number {
    const localX = worldX - this.startX;
    const sampleIndex = Math.floor(localX / 10); // 10m per sample
    
    if (sampleIndex < 0 || sampleIndex >= this.heightSamples.length) {
      return 0; // Default height outside chunk
    }
    
    // Linear interpolation between samples
    if (sampleIndex === this.heightSamples.length - 1) {
      return this.heightSamples[sampleIndex];
    }
    
    const fraction = (localX % 10) / 10;
    return this.heightSamples[sampleIndex] * (1 - fraction) + 
           this.heightSamples[sampleIndex + 1] * fraction;
  }
}
```

## Phase 5: User Interface System

### Step 8: Speed-Adaptive HUD

```typescript
// src/navigation/ui/SpeedHUD.ts
export class SpeedAdaptiveUI {
  private currentLayout: UILayout = UILayout.DETAILED;
  private speedometer: AdaptiveSpeedometer;
  private minimapSystem: MinimapSystem;
  private navigationDisplay: NavigationDisplay;
  
  constructor() {
    this.speedometer = new AdaptiveSpeedometer();
    this.minimapSystem = new MinimapSystem();
    this.navigationDisplay = new NavigationDisplay();
  }
  
  update(
    playerState: PlayerState,
    speedConfig: SpeedConfig
  ): UIUpdate {
    const speedKmh = Math.sqrt(playerState.velocity.x ** 2 + playerState.velocity.y ** 2) * 3.6;
    
    // Update layout if speed category changed
    if (speedConfig.uiLayout !== this.currentLayout) {
      this.transitionToLayout(speedConfig.uiLayout);
      this.currentLayout = speedConfig.uiLayout;
    }
    
    // Update individual UI components
    const speedometerUpdate = this.speedometer.update(speedKmh, speedConfig);
    const minimapUpdate = this.minimapSystem.update(playerState, speedConfig);
    const navigationUpdate = this.navigationDisplay.update(playerState, speedConfig);
    
    return {
      layout: this.currentLayout,
      speedometer: speedometerUpdate,
      minimap: minimapUpdate,
      navigation: navigationUpdate,
      visibility: this.calculateElementVisibility(speedConfig)
    };
  }
  
  private transitionToLayout(newLayout: UILayout): void {
    console.log(`UI Layout transition: ${this.currentLayout} → ${newLayout}`);
    
    // Animate layout changes
    switch (newLayout) {
      case UILayout.DETAILED:
        this.showDetailedElements();
        break;
      case UILayout.AUTOMOTIVE:
        this.showAutomotiveElements();
        break;
      case UILayout.AVIATION:
        this.showAviationElements();
        break;
      case UILayout.MILITARY:
        this.showMilitaryElements();
        break;
      case UILayout.ORBITAL:
        this.showOrbitalElements();
        break;
    }
  }
  
  private calculateElementVisibility(speedConfig: SpeedConfig): ElementVisibility {
    return {
      detailedInfo: speedConfig.category === SpeedCategory.WALKING,
      compass: [SpeedCategory.WALKING, SpeedCategory.GROUND_VEHICLE].includes(speedConfig.category),
      altimeter: speedConfig.category !== SpeedCategory.WALKING,
      machMeter: [SpeedCategory.SUPERSONIC, SpeedCategory.HYPERSONIC].includes(speedConfig.category),
      warpBoomControls: speedConfig.category === SpeedCategory.HYPERSONIC,
      emergencyOverlay: false // Only show during emergencies
    };
  }
}
```

## Phase 6: Testing and Validation

### Step 9: Performance Testing

```typescript
// src/navigation/core/PerformanceMonitor.ts
export class PerformanceMonitor {
  private frameTimeHistory: number[] = [];
  private speedHistory: number[] = [];
  private memoryUsageHistory: number[] = [];
  
  recordFrame(frameTime: number, speedKmh: number): void {
    this.frameTimeHistory.push(frameTime);
    this.speedHistory.push(speedKmh);
    this.memoryUsageHistory.push(this.getMemoryUsage());
    
    // Keep only last 300 frames (5 seconds at 60fps)
    if (this.frameTimeHistory.length > 300) {
      this.frameTimeHistory.shift();
      this.speedHistory.shift();
      this.memoryUsageHistory.shift();
    }
  }
  
  getCurrentStats(): PerformanceStats {
    if (this.frameTimeHistory.length === 0) {
      return this.getDefaultStats();
    }
    
    const avgFrameTime = this.average(this.frameTimeHistory);
    const maxFrameTime = Math.max(...this.frameTimeHistory);
    const currentFPS = 1000 / avgFrameTime;
    
    return {
      averageFPS: currentFPS,
      minimumFPS: 1000 / maxFrameTime,
      frameTimeMS: avgFrameTime,
      currentSpeed: this.speedHistory[this.speedHistory.length - 1] || 0,
      memoryUsageMB: this.memoryUsageHistory[this.memoryUsageHistory.length - 1] || 0,
      performanceRating: this.calculatePerformanceRating(currentFPS)
    };
  }
  
  private calculatePerformanceRating(fps: number): PerformanceRating {
    if (fps >= 58) return PerformanceRating.EXCELLENT;
    if (fps >= 45) return PerformanceRating.GOOD;
    if (fps >= 30) return PerformanceRating.ACCEPTABLE;
    return PerformanceRating.POOR;
  }
}
```

### Step 10: Integration Tests

```typescript
// tests/integration/NavigationSystem.test.ts
describe('Navigation System Integration', () => {
  let navigationManager: NavigationManager;
  let mockPlayerState: PlayerState;
  
  beforeEach(() => {
    navigationManager = new NavigationManager();
    mockPlayerState = {
      position: { x: 0, y: 100 },
      velocity: { x: 0, y: 0 },
      mass: 5000,
      heading: 0
    };
  });
  
  test('handles speed category transitions correctly', () => {
    // Start at walking speed
    mockPlayerState.velocity = { x: 10, y: 0 }; // ~36 km/h
    let update = navigationManager.update(0.016, mockPlayerState);
    expect(update.performance.speedCategory).toBe(SpeedCategory.WALKING);
    
    // Accelerate to ground vehicle speed
    mockPlayerState.velocity = { x: 30, y: 0 }; // ~108 km/h
    update = navigationManager.update(0.016, mockPlayerState);
    expect(update.performance.speedCategory).toBe(SpeedCategory.GROUND_VEHICLE);
    
    // Jump to hypersonic speed
    mockPlayerState.velocity = { x: 50000, y: 0 }; // ~180,000 km/h
    update = navigationManager.update(0.016, mockPlayerState);
    expect(update.performance.speedCategory).toBe(SpeedCategory.HYPERSONIC);
  });
  
  test('terrain streaming adapts to speed', () => {
    // Test walking speed terrain loading
    mockPlayerState.velocity = { x: 5, y: 0 };
    let update = navigationManager.update(0.016, mockPlayerState);
    expect(update.terrain.loadRadius).toBeLessThan(10);
    
    // Test hypersonic speed terrain loading
    mockPlayerState.velocity = { x: 50000, y: 0 };
    update = navigationManager.update(0.016, mockPlayerState);
    expect(update.terrain.loadRadius).toBeGreaterThan(100);
  });
  
  test('collision detection scales with speed', () => {
    const collisionSystem = new CollisionSystem();
    const terrainData = new MockTerrainData();
    
    // Walking speed - precise collision
    let speedConfig = SpeedClassifier.classifySpeed(30);
    expect(speedConfig.collisionMethod).toBe(CollisionMethod.PRECISE_PIXEL);
    
    // Hypersonic speed - predictive collision
    speedConfig = SpeedClassifier.classifySpeed(200000);
    expect(speedConfig.collisionMethod).toBe(CollisionMethod.PREDICTIVE_PATH);
  });
});
```

## Deployment Considerations

### Performance Optimization
1. **Terrain Streaming**: Implement aggressive culling at high speeds
2. **Physics Substeps**: Balance accuracy vs. performance based on speed
3. **Rendering LOD**: Use distance-based level of detail scaling
4. **Memory Management**: Cache frequently accessed terrain chunks

### Error Handling
1. **Physics Breakdown**: Emergency recovery for extreme speed failures
2. **Terrain Loading**: Graceful degradation when terrain can't load fast enough
3. **Camera Stability**: Prevent disorienting camera movements during transitions

### Configuration
1. **Performance Profiles**: Low/Medium/High settings for different hardware
2. **Accessibility Options**: UI scaling, color schemes, motion reduction
3. **Debug Tools**: Performance monitoring, collision visualization, terrain debugging

This implementation guide provides a complete foundation for building the 2D side-scroller high-speed navigation system with proper separation of concerns and scalable architecture.
