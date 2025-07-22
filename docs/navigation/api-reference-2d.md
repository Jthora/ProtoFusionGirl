# API Reference for 2D Side-Scroller High-Speed Navigation

## Overview

This API reference provides comprehensive documentation for the magnetospeeder high-speed navigation system in a 2D side-scroller environment. The system handles speeds from walking pace to Mach 1000 with adaptive physics, rendering, and user interface components.

## Core Interfaces

### Basic Types

```typescript
interface Vector2D {
  x: number;  // Horizontal position/velocity (meters or m/s)
  y: number;  // Vertical position/velocity (altitude or m/s)
}

interface PlayerState {
  position: Vector2D;       // World position in meters
  velocity: Vector2D;       // Velocity in m/s
  mass: number;            // Mass in kg
  heading: number;         // Direction in degrees (0 = east, 90 = north)
  altitude: number;        // Current altitude above sea level
  energy: number;          // Current energy level (0.0-1.0)
}

interface TerrainData {
  getHeight(x: number): number;
  getTerrainType(x: number, y: number): TerrainType;
  getSlope(x: number): number;
  isPassable(x: number, y: number): boolean;
}

enum SpeedCategory {
  WALKING = "walking",
  GROUND_VEHICLE = "ground",
  AIRCRAFT = "aircraft", 
  SUPERSONIC = "supersonic",
  HYPERSONIC = "hypersonic"
}

enum CollisionMethod {
  PRECISE_PIXEL = "precise_pixel",
  BOUNDING_BOX = "bounding_box",
  SWEPT_VOLUME = "swept_volume",
  RAYCAST_TUNNEL = "raycast_tunnel",
  PREDICTIVE_PATH = "predictive_path"
}
```

## NavigationManager

### Core Navigation Controller

```typescript
class NavigationManager {
  constructor(config?: NavigationConfig);
  
  /**
   * Main update loop for navigation system
   * @param deltaTime Time since last update in seconds
   * @param playerState Current player state
   * @returns Complete navigation update result
   */
  update(deltaTime: number, playerState: PlayerState): NavigationUpdate;
  
  /**
   * Get current speed category classification
   * @param velocity Current velocity vector
   * @returns Speed category and configuration
   */
  getSpeedCategory(velocity: Vector2D): SpeedConfig;
  
  /**
   * Force speed category change (for testing)
   * @param category Target speed category
   */
  setSpeedCategory(category: SpeedCategory): void;
  
  /**
   * Get performance statistics
   * @returns Current performance metrics
   */
  getPerformanceStats(): PerformanceStats;
  
  /**
   * Emergency stop - trigger WarpBoom deceleration
   * @param targetPosition Optional target landing position
   * @returns WarpBoom execution result
   */
  emergencyStop(targetPosition?: Vector2D): Promise<WarpBoomResult>;
}

interface NavigationUpdate {
  physics: PhysicsUpdate;
  camera: CameraUpdate;
  terrain: TerrainUpdate;
  leylines: LeylineUpdate;
  ui: UIUpdate;
  emergency: EmergencyStatus;
  performance: PerformanceStats;
}

interface NavigationConfig {
  maxSpeed: number;                    // Maximum speed in m/s
  enableLeylines: boolean;             // Enable leyline system
  enableWarpBoom: boolean;             // Enable emergency deceleration
  performanceProfile: PerformanceProfile;
  debugMode: boolean;
}
```

## Physics System

### AdaptivePhysicsEngine

```typescript
class AdaptivePhysicsEngine {
  constructor(config?: PhysicsConfig);
  
  /**
   * Update physics simulation
   * @param deltaTime Time step in seconds
   * @param playerState Current player state
   * @param speedConfig Current speed configuration
   * @returns Physics update result
   */
  update(
    deltaTime: number,
    playerState: PlayerState,
    speedConfig: SpeedConfig
  ): PhysicsUpdate;
  
  /**
   * Calculate required physics substeps for accurate simulation
   * @param velocity Current velocity
   * @param deltaTime Time step
   * @returns Number of substeps needed
   */
  calculateRequiredSubsteps(velocity: Vector2D, deltaTime: number): number;
  
  /**
   * Apply forces to player state
   * @param playerState Current state
   * @param forces Applied forces
   * @param deltaTime Time step
   * @returns Updated player state
   */
  applyForces(
    playerState: PlayerState,
    forces: Vector2D,
    deltaTime: number
  ): PlayerState;
  
  /**
   * Handle speed category transition
   * @param newConfig New speed configuration
   */
  onSpeedCategoryChange(newConfig: SpeedConfig): void;
}

interface PhysicsUpdate {
  newPlayerState: PlayerState;
  substepsUsed: number;
  physicsLoad: number;              // 0.0-1.0 CPU usage ratio
  collisionResult?: CollisionResult;
  constraintsApplied: ConstraintType[];
}

interface PhysicsConfig {
  maxSubsteps: number;              // Maximum physics substeps per frame
  maxSafeDistancePerStep: number;   // Maximum distance per physics step
  gravityEnabled: boolean;
  airResistanceEnabled: boolean;
}
```

### CollisionSystem

```typescript
class CollisionSystem {
  constructor();
  
  /**
   * Check for collisions using appropriate method for current speed
   * @param playerState Current player state
   * @param terrainData Terrain collision data
   * @param speedConfig Current speed configuration
   * @param deltaTime Time step
   * @returns Collision detection result
   */
  checkCollision(
    playerState: PlayerState,
    terrainData: TerrainData,
    speedConfig: SpeedConfig,
    deltaTime: number
  ): CollisionResult;
  
  /**
   * Predict collision along trajectory
   * @param position Start position
   * @param velocity Velocity vector
   * @param predictionTime Time to predict ahead
   * @param terrainData Terrain data
   * @returns Collision prediction
   */
  predictCollision(
    position: Vector2D,
    velocity: Vector2D,
    predictionTime: number,
    terrainData: TerrainData
  ): CollisionPrediction;
}

interface CollisionResult {
  hasCollision: boolean;
  collisionPoint?: Vector2D;
  timeToCollision?: number;
  normal?: Vector2D;
  penetrationDepth?: number;
  surfaceType?: TerrainType;
}

interface CollisionPrediction {
  willCollide: boolean;
  collisionPoint?: Vector2D;
  timeToCollision?: number;
  confidence: number;               // 0.0-1.0 prediction confidence
}
```

## Camera System

### DynamicCameraController

```typescript
class DynamicCameraController {
  constructor(config?: CameraConfig);
  
  /**
   * Update camera for current frame
   * @param deltaTime Time since last update
   * @param playerState Current player state
   * @param speedConfig Current speed configuration
   * @returns Camera update result
   */
  update(
    deltaTime: number,
    playerState: PlayerState,
    speedConfig: SpeedConfig
  ): CameraUpdate;
  
  /**
   * Get current camera view bounds
   * @returns View bounds in world coordinates
   */
  getViewBounds(): ViewBounds;
  
  /**
   * Set camera zoom level
   * @param zoom Target zoom level
   * @param transitionTime Transition duration in seconds
   */
  setZoom(zoom: number, transitionTime?: number): void;
  
  /**
   * Enable/disable look-ahead camera positioning
   * @param enabled Whether look-ahead is enabled
   */
  setLookAheadEnabled(enabled: boolean): void;
  
  /**
   * Handle speed category change
   * @param newConfig New speed configuration
   */
  onSpeedCategoryChange(newConfig: SpeedConfig): void;
}

interface CameraUpdate {
  position: Vector2D;
  zoom: number;
  lookAheadDistance: number;
  viewBounds: ViewBounds;
  transitionActive: boolean;
}

interface ViewBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

interface CameraConfig {
  maxZoomOut: number;               // Maximum zoom out level
  maxLookAhead: number;             // Maximum look-ahead distance
  transitionSpeed: number;          // Zoom transition speed
  smoothingFactor: number;          // Position smoothing (0.0-1.0)
}
```

## Terrain System

### TerrainStreamer

```typescript
class TerrainStreamer {
  constructor(config?: TerrainConfig);
  
  /**
   * Update terrain streaming for current player state
   * @param playerPosition Current player position
   * @param playerVelocity Current player velocity
   * @returns Terrain update result
   */
  update(playerPosition: Vector2D, playerVelocity: Vector2D): TerrainUpdate;
  
  /**
   * Get terrain height at specific position
   * @param x Horizontal position
   * @returns Height at position
   */
  getHeight(x: number): number;
  
  /**
   * Get terrain type at specific position
   * @param x Horizontal position
   * @param y Vertical position
   * @returns Terrain type
   */
  getTerrainType(x: number, y: number): TerrainType;
  
  /**
   * Preload terrain chunks in direction of travel
   * @param position Current position
   * @param direction Travel direction
   * @param distance Distance to preload
   */
  preloadTerrain(position: Vector2D, direction: Vector2D, distance: number): void;
  
  /**
   * Get currently loaded chunk IDs
   * @returns Array of chunk IDs
   */
  getLoadedChunks(): number[];
  
  /**
   * Handle speed category change
   * @param newConfig New speed configuration
   */
  onSpeedCategoryChange(newConfig: SpeedConfig): void;
}

interface TerrainUpdate {
  activeChunks: number[];
  newChunksLoaded: number[];
  chunksUnloaded: number[];
  currentChunk: number;
  loadRadius: number;
  memoryUsageMB: number;
}

interface TerrainConfig {
  chunkSize: number;                // Size of terrain chunks in meters
  maxCachedChunks: number;          // Maximum chunks to keep in memory
  generateOnDemand: boolean;        // Generate chunks on demand vs preload
  detailLevel: TerrainDetailLevel;
}

enum TerrainType {
  ROCK = "rock",
  SOIL = "soil",
  VEGETATION = "vegetation",
  WATER = "water",
  SAND = "sand",
  ICE = "ice",
  LAVA = "lava"
}
```

### TerrainGenerator

```typescript
class TerrainGenerator {
  constructor(seed?: number);
  
  /**
   * Generate terrain chunk
   * @param chunkId Unique chunk identifier
   * @returns Generated terrain chunk
   */
  generateChunk(chunkId: number): TerrainChunk;
  
  /**
   * Generate height at specific position
   * @param x Horizontal position
   * @returns Generated height
   */
  generateHeightAt(x: number): number;
  
  /**
   * Set generation parameters
   * @param params Generation parameters
   */
  setParameters(params: GenerationParameters): void;
}

interface TerrainChunk {
  readonly id: number;
  readonly startX: number;
  readonly endX: number;
  
  getHeight(x: number): number;
  getTerrainType(x: number, y: number): TerrainType;
  getSlope(x: number): number;
  getBounds(): { min: Vector2D; max: Vector2D };
}

interface GenerationParameters {
  continentalScale: number;         // Large-scale height variation
  regionalScale: number;            // Medium-scale height variation
  localScale: number;               // Small-scale height variation
  detailScale: number;              // Fine detail variation
  seaLevel: number;                 // Sea level height
}
```

## Leyline System

### LeylineSystem

```typescript
class LeylineSystem {
  constructor(config?: LeylineConfig);
  
  /**
   * Update leyline system
   * @param playerState Current player state
   * @param speedConfig Current speed configuration
   * @returns Leyline update result
   */
  update(playerState: PlayerState, speedConfig: SpeedConfig): LeylineUpdate;
  
  /**
   * Detect nearby leylines
   * @param position Player position
   * @param detectionRange Detection range in meters
   * @returns Array of detected leylines
   */
  detectNearbyLeylines(position: Vector2D, detectionRange: number): DetectedLeyline[];
  
  /**
   * Calculate speed boost from leyline
   * @param baseSpeed Base speed without leyline
   * @param leyline Leyline providing boost
   * @param alignmentFactor Alignment with leyline (0.0-1.0)
   * @returns Boosted speed
   */
  calculateSpeedBoost(
    baseSpeed: number,
    leyline: Leyline,
    alignmentFactor: number
  ): number;
  
  /**
   * Check if player can access leyline
   * @param playerSpeed Current player speed
   * @param leyline Target leyline
   * @returns Whether leyline is accessible
   */
  canAccessLeyline(playerSpeed: number, leyline: Leyline): boolean;
}

interface Leyline {
  id: string;
  type: LeylineType;
  altitude: number;                 // Altitude in meters
  direction: "east" | "west";       // Primary direction
  strength: number;                 // 0.0-1.0 energy density
  width: number;                    // Width in meters
  speedBonus: number;               // Speed multiplier (1.0-10.0)
  stability: LeylineStability;
  requirements: LeylineRequirements;
}

interface DetectedLeyline {
  leyline: Leyline;
  distance: number;                 // Distance to leyline
  alignment: number;                // Alignment factor (0.0-1.0)
  accessLevel: AccessLevel;
}

interface LeylineUpdate {
  nearbyLeylines: DetectedLeyline[];
  currentLeyline?: Leyline;
  speedBoost: number;
  energyEfficiency: number;
  visualEffects: LeylineVisualEffect[];
}

enum LeylineType {
  SURFACE = "surface",
  ATMOSPHERIC = "atmospheric",
  UNDERGROUND = "underground"
}

enum LeylineStability {
  STABLE = "stable",
  UNSTABLE = "unstable",
  FLUCTUATING = "fluctuating"
}
```

## User Interface System

### SpeedAdaptiveUI

```typescript
class SpeedAdaptiveUI {
  constructor(config?: UIConfig);
  
  /**
   * Update UI for current frame
   * @param playerState Current player state
   * @param speedConfig Current speed configuration
   * @returns UI update result
   */
  update(playerState: PlayerState, speedConfig: SpeedConfig): UIUpdate;
  
  /**
   * Show/hide UI elements
   * @param elements Elements to show/hide
   * @param visible Whether elements should be visible
   */
  setElementVisibility(elements: UIElement[], visible: boolean): void;
  
  /**
   * Set UI scale factor
   * @param scale Scale factor (0.5-2.0)
   */
  setUIScale(scale: number): void;
  
  /**
   * Handle speed category change
   * @param newConfig New speed configuration
   */
  onSpeedCategoryChange(newConfig: SpeedConfig): void;
}

interface UIUpdate {
  layout: UILayout;
  speedometer: SpeedometerUpdate;
  minimap: MinimapUpdate;
  navigation: NavigationUpdate;
  visibility: ElementVisibility;
  warnings: Warning[];
}

interface SpeedometerUpdate {
  currentSpeed: number;
  speedCategory: SpeedCategory;
  format: SpeedDisplayFormat;
  range: { min: number; max: number };
  warningZones: SpeedWarningZone[];
}

interface MinimapUpdate {
  zoom: number;
  range: number;                    // Visible range in meters
  playerPosition: Vector2D;
  layers: MinimapLayer[];
  landmarks: MinimapLandmark[];
}

enum UILayout {
  DETAILED = "detailed",
  AUTOMOTIVE = "automotive",
  AVIATION = "aviation",
  MILITARY = "military",
  ORBITAL = "orbital"
}

enum UIElement {
  SPEEDOMETER = "speedometer",
  COMPASS = "compass",
  ALTIMETER = "altimeter",
  MINIMAP = "minimap",
  WARNINGS = "warnings",
  WARPBOOM_CONTROLS = "warpboom_controls"
}
```

## WarpBoom System

### WarpBoomController

```typescript
class WarpBoomController {
  constructor(config?: WarpBoomConfig);
  
  /**
   * Execute emergency deceleration
   * @param currentVelocity Current velocity vector
   * @param targetPosition Optional target landing position
   * @returns WarpBoom execution result
   */
  executeWarpBoom(
    currentVelocity: Vector2D,
    targetPosition?: Vector2D
  ): Promise<WarpBoomResult>;
  
  /**
   * Check if WarpBoom can be triggered
   * @param playerState Current player state
   * @returns Whether WarpBoom is available
   */
  canTriggerWarpBoom(playerState: PlayerState): boolean;
  
  /**
   * Calculate WarpBoom energy requirements
   * @param fromVelocity Initial velocity
   * @param toVelocity Target velocity
   * @returns Energy calculation result
   */
  calculateEnergyRequirements(
    fromVelocity: Vector2D,
    toVelocity: Vector2D
  ): EnergyCalculation;
  
  /**
   * Find optimal landing zone
   * @param currentPosition Current position
   * @param currentVelocity Current velocity
   * @param terrainData Terrain data
   * @returns Landing zone recommendations
   */
  findOptimalLandingZone(
    currentPosition: Vector2D,
    currentVelocity: Vector2D,
    terrainData: TerrainData
  ): LandingZoneResult;
  
  /**
   * Arm/disarm WarpBoom system
   * @param armed Whether system should be armed
   */
  setArmed(armed: boolean): void;
}

interface WarpBoomResult {
  success: boolean;
  finalPosition: Vector2D;
  finalVelocity: Vector2D;
  energyDissipated: number;
  decelerationTime: number;
  shockwaveRadius: number;
  damageAssessment: DamageAssessment;
}

interface EnergyCalculation {
  totalEnergyDissipated: number;    // Joules
  equivalentTNT: number;            // kg TNT equivalent
  shockwaveRadius: number;          // meters
  thermalEnergy: number;            // Joules of heat generated
}

interface LandingZoneResult {
  primaryZone: LandingZone;
  alternateZones: LandingZone[];
  totalDecelerationTime: number;
  riskAssessment: RiskAssessment;
}

interface WarpBoomConfig {
  enableAutoTrigger: boolean;
  minimumSpeed: number;             // Minimum speed for WarpBoom (m/s)
  maxDecelerationTime: number;      // Maximum deceleration time (seconds)
  safetyMargin: number;             // Safety margin for collision avoidance
}
```

## Performance Monitoring

### PerformanceMonitor

```typescript
class PerformanceMonitor {
  constructor();
  
  /**
   * Record frame performance data
   * @param frameTime Frame time in milliseconds
   * @param speedKmh Current speed in km/h
   */
  recordFrame(frameTime: number, speedKmh: number): void;
  
  /**
   * Get current performance statistics
   * @returns Performance metrics
   */
  getCurrentStats(): PerformanceStats;
  
  /**
   * Get performance history
   * @param frameCount Number of recent frames to include
   * @returns Performance history data
   */
  getPerformanceHistory(frameCount: number): PerformanceHistory;
  
  /**
   * Set performance targets
   * @param targets Target performance metrics
   */
  setPerformanceTargets(targets: PerformanceTargets): void;
}

interface PerformanceStats {
  averageFPS: number;
  minimumFPS: number;
  frameTimeMS: number;
  currentSpeed: number;
  memoryUsageMB: number;
  physicsLoad: number;              // 0.0-1.0
  renderingLoad: number;            // 0.0-1.0
  performanceRating: PerformanceRating;
}

interface PerformanceHistory {
  frameCount: number;
  frames: FrameData[];
  trends: PerformanceTrends;
}

interface FrameData {
  timestamp: number;
  frameTime: number;
  speed: number;
  memoryUsage: number;
}

enum PerformanceRating {
  EXCELLENT = "excellent",
  GOOD = "good",
  ACCEPTABLE = "acceptable",
  POOR = "poor"
}
```

## Utility Functions

### Speed Conversion Utilities

```typescript
/**
 * Convert between different speed units
 */
namespace SpeedConversion {
  export function kmhToMs(kmh: number): number;
  export function msToKmh(ms: number): number;
  export function msToMach(ms: number): number;
  export function machToMs(mach: number): number;
  export function calculateMachNumber(speedMs: number, altitude: number): number;
}

/**
 * Distance and position utilities
 */
namespace PositionUtils {
  export function distance(a: Vector2D, b: Vector2D): number;
  export function normalize(vector: Vector2D): Vector2D;
  export function dot(a: Vector2D, b: Vector2D): number;
  export function lerp(a: Vector2D, b: Vector2D, t: number): Vector2D;
}

/**
 * Physics calculation utilities
 */
namespace PhysicsUtils {
  export function calculateKineticEnergy(mass: number, velocity: Vector2D): number;
  export function calculateGForce(acceleration: Vector2D): number;
  export function calculateTerminalVelocity(mass: number, dragCoefficient: number): number;
}
```

## Events and Callbacks

### Event System

```typescript
interface NavigationEvents {
  onSpeedCategoryChange(oldCategory: SpeedCategory, newCategory: SpeedCategory): void;
  onCollisionDetected(collision: CollisionResult): void;
  onLeylineEntered(leyline: Leyline): void;
  onLeylineExited(leyline: Leyline): void;
  onWarpBoomTriggered(result: WarpBoomResult): void;
  onEmergencyStop(): void;
  onPerformanceThresholdCrossed(rating: PerformanceRating): void;
}

/**
 * Event subscription management
 */
class NavigationEventManager {
  subscribe<K extends keyof NavigationEvents>(
    event: K,
    callback: NavigationEvents[K]
  ): void;
  
  unsubscribe<K extends keyof NavigationEvents>(
    event: K,
    callback: NavigationEvents[K]
  ): void;
  
  emit<K extends keyof NavigationEvents>(
    event: K,
    ...args: Parameters<NavigationEvents[K]>
  ): void;
}
```

This API reference provides comprehensive documentation for implementing and integrating the 2D side-scroller high-speed navigation system, with clear interfaces and examples for all major components.
