# Coordinate Transformation Layer

## Overview
This document provides the detailed technical specification for implementing the coordinate transformation layer that bridges spherical and flat coordinate systems in ProtoFusionGirl's hybrid architecture.

## Core Transformation Architecture

### Universal Coordinate Interface

The foundation of the transformation layer is a universal coordinate system that maintains both representations simultaneously:

```typescript
interface CoordinateTransformationLayer {
  // Core transformation methods
  transform(input: AnyCoordinate, targetSystem: CoordinateSystemType): AnyCoordinate;
  batch(inputs: AnyCoordinate[], targetSystem: CoordinateSystemType): AnyCoordinate[];
  
  // Performance optimization
  cache: TransformationCache;
  precision: PrecisionLevel;
  
  // System management
  setProjection(projection: ProjectionSystem): void;
  setPerformanceMode(mode: PerformanceMode): void;
}

type AnyCoordinate = SphericalCoordinate | FlatCoordinate | UniversalCoordinate;
type CoordinateSystemType = 'spherical' | 'flat' | 'universal';
type PrecisionLevel = 'gaming' | 'scientific' | 'approximate';
type PerformanceMode = 'realtime' | 'quality' | 'balanced';
```

### Transformation Context System

Different game situations require different transformation strategies:

```typescript
interface TransformationContext {
  purpose: TransformationPurpose;
  precision: PrecisionLevel;
  cachePolicy: CachePolicy;
  performanceBudget: number; // microseconds
}

type TransformationPurpose = 
  | 'rendering'           // Visual display, can use approximations
  | 'physics'            // Collision detection, needs accuracy
  | 'leyline-calculation' // Ley line math, requires precision
  | 'chunk-loading'      // Chunk management, optimized for speed
  | 'save-load'          // Persistence, needs exact conversion
  | 'minimap'            // UI display, visual quality priority
  | 'pathfinding';       // Navigation, balanced accuracy/speed

class ContextualTransformationManager {
  private contextStrategies = new Map<TransformationPurpose, TransformationStrategy>();
  
  constructor() {
    this.initializeStrategies();
  }
  
  transform(
    input: AnyCoordinate, 
    target: CoordinateSystemType, 
    context: TransformationContext
  ): AnyCoordinate {
    const strategy = this.contextStrategies.get(context.purpose);
    if (!strategy) {
      throw new Error(`No strategy for purpose: ${context.purpose}`);
    }
    
    return strategy.transform(input, target, context);
  }
  
  private initializeStrategies(): void {
    this.contextStrategies.set('rendering', new RenderingTransformationStrategy());
    this.contextStrategies.set('physics', new PhysicsTransformationStrategy());
    this.contextStrategies.set('leyline-calculation', new PrecisionTransformationStrategy());
    this.contextStrategies.set('chunk-loading', new FastTransformationStrategy());
    this.contextStrategies.set('save-load', new ExactTransformationStrategy());
    this.contextStrategies.set('minimap', new VisualTransformationStrategy());
    this.contextStrategies.set('pathfinding', new BalancedTransformationStrategy());
  }
}
```

## Transformation Strategies

### 1. Fast Transformation Strategy (Chunk Loading, Real-time)

Optimized for speed with acceptable approximations:

```typescript
class FastTransformationStrategy implements TransformationStrategy {
  private lookupTables: TransformationLookupTables;
  private approximationCache: Map<string, AnyCoordinate>;
  
  constructor() {
    this.lookupTables = new TransformationLookupTables();
    this.approximationCache = new Map();
    this.generateLookupTables();
  }
  
  transform(
    input: AnyCoordinate, 
    target: CoordinateSystemType, 
    context: TransformationContext
  ): AnyCoordinate {
    // Use lookup tables for common conversions
    const lookupResult = this.tryLookupTable(input, target);
    if (lookupResult) return lookupResult;
    
    // Use fast approximations
    if (target === 'flat' && input.type === 'spherical') {
      return this.fastSphericalToFlat(input as SphericalCoordinate);
    } else if (target === 'spherical' && input.type === 'flat') {
      return this.fastFlatToSpherical(input as FlatCoordinate);
    }
    
    // Fallback to precise calculation
    return this.preciseTransform(input, target);
  }
  
  private fastSphericalToFlat(coord: SphericalCoordinate): FlatCoordinate {
    // Simple equirectangular projection (no trigonometry)
    return {
      x: (coord.lon + 180) * (WORLD_WIDTH / 360),
      y: (90 - coord.lat) * (WORLD_HEIGHT / 180)
    };
  }
  
  private fastFlatToSpherical(coord: FlatCoordinate): SphericalCoordinate {
    // Inverse equirectangular (linear operations only)
    return {
      lat: 90 - (coord.y * 180 / WORLD_HEIGHT),
      lon: (coord.x * 360 / WORLD_WIDTH) - 180,
      alt: 0
    };
  }
  
  private generateLookupTables(): void {
    // Pre-compute common coordinate conversions
    const resolution = 0.1; // 0.1 degree resolution
    
    for (let lat = -90; lat <= 90; lat += resolution) {
      for (let lon = -180; lon <= 180; lon += resolution) {
        const spherical: SphericalCoordinate = { lat, lon, alt: 0 };
        const flat = this.preciseSphericalToFlat(spherical);
        
        const key = `${lat.toFixed(1)},${lon.toFixed(1)}`;
        this.lookupTables.sphericalToFlat.set(key, flat);
        
        const reverseKey = `${Math.round(flat.x)},${Math.round(flat.y)}`;
        this.lookupTables.flatToSpherical.set(reverseKey, spherical);
      }
    }
  }
}
```

### 2. Precision Transformation Strategy (Ley Line Calculations)

High-accuracy transformations for critical calculations:

```typescript
class PrecisionTransformationStrategy implements TransformationStrategy {
  private highPrecisionCache: Map<string, AnyCoordinate>;
  
  transform(
    input: AnyCoordinate, 
    target: CoordinateSystemType, 
    context: TransformationContext
  ): AnyCoordinate {
    // Always use double precision
    const key = this.getCacheKey(input, target, 'high-precision');
    
    const cached = this.highPrecisionCache.get(key);
    if (cached) return cached;
    
    const result = this.preciseTransform(input, target);
    this.highPrecisionCache.set(key, result);
    
    return result;
  }
  
  private preciseTransform(input: AnyCoordinate, target: CoordinateSystemType): AnyCoordinate {
    if (target === 'flat' && input.type === 'spherical') {
      return this.preciseSphericalToFlat(input as SphericalCoordinate);
    } else if (target === 'spherical' && input.type === 'flat') {
      return this.preciseFlatToSpherical(input as FlatCoordinate);
    }
    
    throw new Error(`Unsupported transformation: ${input.type} -> ${target}`);
  }
  
  private preciseSphericalToFlat(coord: SphericalCoordinate): FlatCoordinate {
    // Use high-precision projection with ellipsoid correction
    const ellipsoid = WGS84_ELLIPSOID;
    
    // Convert to radians
    const latRad = coord.lat * Math.PI / 180;
    const lonRad = coord.lon * Math.PI / 180;
    
    // Apply ellipsoid corrections
    const e2 = ellipsoid.eccentricitySquared;
    const sinLat = Math.sin(latRad);
    const N = ellipsoid.semiMajorAxis / Math.sqrt(1 - e2 * sinLat * sinLat);
    
    // Cartesian coordinates
    const X = (N + coord.alt) * Math.cos(latRad) * Math.cos(lonRad);
    const Y = (N + coord.alt) * Math.cos(latRad) * Math.sin(lonRad);
    const Z = (N * (1 - e2) + coord.alt) * Math.sin(latRad);
    
    // Project to flat using conformal projection
    return this.conformalProjection({ X, Y, Z });
  }
  
  private conformalProjection(cartesian: CartesianCoordinate): FlatCoordinate {
    // Implement Lambert Conformal Conic projection for minimal distortion
    const centerLat = 0; // Equatorial center
    const standardParallel1 = 30;
    const standardParallel2 = 60;
    
    // ... complex projection mathematics ...
    // (Simplified for brevity - full implementation would include
    //  complete Lambert Conformal Conic mathematics)
    
    return { x: 0, y: 0 }; // Placeholder
  }
}
```

### 3. Visual Transformation Strategy (Rendering, Minimap)

Optimized for visual quality with perceptual accuracy:

```typescript
class VisualTransformationStrategy implements TransformationStrategy {
  private visualCache: Map<string, AnyCoordinate>;
  private antiAliasingEnabled = true;
  
  transform(
    input: AnyCoordinate, 
    target: CoordinateSystemType, 
    context: TransformationContext
  ): AnyCoordinate {
    // Apply visual enhancement transformations
    const baseResult = this.baseTransform(input, target);
    
    if (context.purpose === 'minimap') {
      return this.enhanceForMinimap(baseResult, context);
    } else if (context.purpose === 'rendering') {
      return this.enhanceForRendering(baseResult, context);
    }
    
    return baseResult;
  }
  
  private enhanceForMinimap(coord: AnyCoordinate, context: TransformationContext): AnyCoordinate {
    // Apply visual corrections for minimap display
    if (coord.type === 'flat') {
      const flatCoord = coord as FlatCoordinate;
      
      // Apply minimap-specific corrections
      return {
        ...flatCoord,
        x: this.applyMinimapDistortionCorrection(flatCoord.x, flatCoord.y, 'x'),
        y: this.applyMinimapDistortionCorrection(flatCoord.x, flatCoord.y, 'y')
      };
    }
    
    return coord;
  }
  
  private applyMinimapDistortionCorrection(x: number, y: number, axis: 'x' | 'y'): number {
    // Correct for visual distortion in minimap projection
    const normalizedY = y / WORLD_HEIGHT;
    const latitudeApprox = 90 - (normalizedY * 180);
    
    if (axis === 'x') {
      // Longitude compression near poles
      const compressionFactor = Math.cos(latitudeApprox * Math.PI / 180);
      return x * compressionFactor;
    } else {
      // Y-axis remains unchanged for equirectangular
      return y;
    }
  }
}
```

## Caching System Architecture

### Multi-Level Caching Strategy

```typescript
class TransformationCache {
  private l1Cache: Map<string, AnyCoordinate>; // Hot cache - 1000 entries
  private l2Cache: Map<string, AnyCoordinate>; // Warm cache - 10000 entries
  private l3Cache: Map<string, AnyCoordinate>; // Cold cache - 100000 entries
  
  private cacheStats: CacheStatistics;
  
  constructor() {
    this.l1Cache = new Map();
    this.l2Cache = new Map();
    this.l3Cache = new Map();
    this.cacheStats = new CacheStatistics();
  }
  
  get(key: string, context: TransformationContext): AnyCoordinate | null {
    // Check L1 cache first (fastest)
    if (this.l1Cache.has(key)) {
      this.cacheStats.recordHit('l1');
      return this.l1Cache.get(key)!;
    }
    
    // Check L2 cache
    if (this.l2Cache.has(key)) {
      this.cacheStats.recordHit('l2');
      const value = this.l2Cache.get(key)!;
      this.promoteToL1(key, value);
      return value;
    }
    
    // Check L3 cache
    if (this.l3Cache.has(key)) {
      this.cacheStats.recordHit('l3');
      const value = this.l3Cache.get(key)!;
      this.promoteToL2(key, value);
      return value;
    }
    
    this.cacheStats.recordMiss();
    return null;
  }
  
  set(key: string, value: AnyCoordinate, context: TransformationContext): void {
    const priority = this.calculateCachePriority(context);
    
    if (priority === 'high') {
      this.setL1(key, value);
    } else if (priority === 'medium') {
      this.setL2(key, value);
    } else {
      this.setL3(key, value);
    }
  }
  
  private calculateCachePriority(context: TransformationContext): 'high' | 'medium' | 'low' {
    if (context.purpose === 'rendering' || context.purpose === 'physics') {
      return 'high'; // Real-time operations need fast cache
    } else if (context.purpose === 'leyline-calculation') {
      return 'medium'; // Important but less frequent
    } else {
      return 'low'; // Chunk loading, save/load can use slower cache
    }
  }
  
  private promoteToL1(key: string, value: AnyCoordinate): void {
    if (this.l1Cache.size >= 1000) {
      // Evict least recently used
      const firstKey = this.l1Cache.keys().next().value;
      const evicted = this.l1Cache.get(firstKey)!;
      this.l1Cache.delete(firstKey);
      this.l2Cache.set(firstKey, evicted);
    }
    
    this.l1Cache.set(key, value);
  }
}
```

### Cache Key Generation

```typescript
class CacheKeyGenerator {
  static generateKey(
    input: AnyCoordinate, 
    target: CoordinateSystemType, 
    context: TransformationContext
  ): string {
    const inputStr = this.serializeCoordinate(input);
    const precision = this.getPrecisionString(context.precision);
    const purpose = context.purpose;
    
    return `${inputStr}|${target}|${precision}|${purpose}`;
  }
  
  private static serializeCoordinate(coord: AnyCoordinate): string {
    if (coord.type === 'spherical') {
      const s = coord as SphericalCoordinate;
      return `s:${s.lat.toFixed(6)},${s.lon.toFixed(6)},${s.alt.toFixed(1)}`;
    } else if (coord.type === 'flat') {
      const f = coord as FlatCoordinate;
      return `f:${Math.round(f.x)},${Math.round(f.y)}`;
    } else {
      // Universal coordinate
      const u = coord as UniversalCoordinate;
      return this.serializeCoordinate(u.spherical) + '|' + this.serializeCoordinate(u.flat);
    }
  }
  
  private static getPrecisionString(precision: PrecisionLevel): string {
    switch (precision) {
      case 'gaming': return 'g';
      case 'scientific': return 's';
      case 'approximate': return 'a';
      default: return 'u';
    }
  }
}
```

## Performance Monitoring and Optimization

### Transformation Performance Monitor

```typescript
class TransformationPerformanceMonitor {
  private metrics: Map<string, PerformanceMetric>;
  private frameBudget: number = 16; // 16ms for 60 FPS
  private currentFrameUsage: number = 0;
  
  startTransformation(
    operation: string, 
    context: TransformationContext
  ): PerformanceHandle {
    const handle = {
      operation,
      startTime: performance.now(),
      context
    };
    
    return handle;
  }
  
  endTransformation(handle: PerformanceHandle): void {
    const endTime = performance.now();
    const duration = endTime - handle.startTime;
    
    this.recordMetric(handle.operation, duration, handle.context);
    this.currentFrameUsage += duration;
    
    // Check if we're exceeding frame budget
    if (this.currentFrameUsage > this.frameBudget * 0.1) { // 10% of frame budget
      this.triggerOptimization(handle.context);
    }
  }
  
  private triggerOptimization(context: TransformationContext): void {
    // Automatically adjust performance settings
    if (context.precision === 'scientific') {
      context.precision = 'gaming'; // Reduce precision
    }
    
    if (context.purpose === 'rendering') {
      // Switch to faster approximation mode
      context.performanceBudget = Math.max(1, context.performanceBudget * 0.5);
    }
  }
  
  resetFrameMetrics(): void {
    this.currentFrameUsage = 0;
  }
  
  getPerformanceReport(): PerformanceReport {
    return {
      averageTransformationTime: this.calculateAverageTime(),
      cacheHitRate: this.calculateCacheHitRate(),
      frameBudgetUsage: this.currentFrameUsage / this.frameBudget,
      optimizationSuggestions: this.generateOptimizationSuggestions()
    };
  }
}
```

### Adaptive Performance Tuning

```typescript
class AdaptivePerformanceTuner {
  private performanceHistory: PerformanceDataPoint[] = [];
  private currentSettings: PerformanceSettings;
  
  constructor() {
    this.currentSettings = {
      cacheSize: 10000,
      precisionLevel: 'gaming',
      approximationThreshold: 0.001,
      batchSize: 100
    };
  }
  
  tune(): void {
    const recentPerformance = this.getRecentPerformance();
    
    if (recentPerformance.averageTime > 10) { // 10μs threshold
      this.optimizeForSpeed();
    } else if (recentPerformance.averageTime < 1) { // 1μs threshold
      this.optimizeForQuality();
    }
  }
  
  private optimizeForSpeed(): void {
    // Increase cache size
    this.currentSettings.cacheSize = Math.min(50000, this.currentSettings.cacheSize * 1.5);
    
    // Reduce precision if possible
    if (this.currentSettings.precisionLevel === 'scientific') {
      this.currentSettings.precisionLevel = 'gaming';
    }
    
    // Increase approximation threshold
    this.currentSettings.approximationThreshold *= 1.2;
  }
  
  private optimizeForQuality(): void {
    // We have performance headroom, can improve quality
    if (this.currentSettings.precisionLevel === 'gaming') {
      this.currentSettings.precisionLevel = 'scientific';
    }
    
    // Reduce approximation threshold for better accuracy
    this.currentSettings.approximationThreshold *= 0.8;
  }
}
```

## Error Handling and Validation

### Coordinate Validation

```typescript
class CoordinateValidator {
  static validate(coord: AnyCoordinate): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (coord.type === 'spherical') {
      const s = coord as SphericalCoordinate;
      
      if (s.lat < -90 || s.lat > 90) {
        errors.push(`Invalid latitude: ${s.lat}. Must be between -90 and 90.`);
      }
      
      if (s.lon < -180 || s.lon > 180) {
        warnings.push(`Longitude ${s.lon} will be normalized to ±180 range.`);
      }
      
      if (s.alt < -10000) {
        warnings.push(`Very low altitude: ${s.alt}m. Below typical underground limits.`);
      }
      
      if (s.alt > 100000) {
        warnings.push(`Very high altitude: ${s.alt}m. Above typical gameplay range.`);
      }
    } else if (coord.type === 'flat') {
      const f = coord as FlatCoordinate;
      
      if (f.x < 0 || f.x >= WORLD_WIDTH) {
        errors.push(`Flat X coordinate ${f.x} outside world bounds [0, ${WORLD_WIDTH}].`);
      }
      
      if (f.y < 0 || f.y >= WORLD_HEIGHT) {
        errors.push(`Flat Y coordinate ${f.y} outside world bounds [0, ${WORLD_HEIGHT}].`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  static sanitize(coord: AnyCoordinate): AnyCoordinate {
    if (coord.type === 'spherical') {
      const s = coord as SphericalCoordinate;
      return {
        ...s,
        lat: Math.max(-90, Math.min(90, s.lat)),
        lon: ((s.lon + 180) % 360) - 180, // Normalize longitude
        alt: Math.max(-EARTH_RADIUS, s.alt) // Prevent coordinates inside Earth
      };
    } else if (coord.type === 'flat') {
      const f = coord as FlatCoordinate;
      return {
        ...f,
        x: ((f.x % WORLD_WIDTH) + WORLD_WIDTH) % WORLD_WIDTH, // Wrap X
        y: Math.max(0, Math.min(WORLD_HEIGHT - 1, f.y)) // Clamp Y
      };
    }
    
    return coord;
  }
}
```

### Transformation Error Recovery

```typescript
class TransformationErrorRecovery {
  static recoverFromError(
    error: TransformationError, 
    input: AnyCoordinate, 
    context: TransformationContext
  ): AnyCoordinate {
    switch (error.type) {
      case 'precision-loss':
        return this.handlePrecisionLoss(input, context);
      case 'out-of-bounds':
        return this.handleOutOfBounds(input, context);
      case 'projection-singularity':
        return this.handleProjectionSingularity(input, context);
      default:
        throw new Error(`Unrecoverable transformation error: ${error.message}`);
    }
  }
  
  private static handlePrecisionLoss(
    input: AnyCoordinate, 
    context: TransformationContext
  ): AnyCoordinate {
    // Retry with higher precision
    const highPrecisionContext = {
      ...context,
      precision: 'scientific' as PrecisionLevel
    };
    
    return new PrecisionTransformationStrategy().transform(input, 'universal', highPrecisionContext);
  }
  
  private static handleOutOfBounds(
    input: AnyCoordinate, 
    context: TransformationContext
  ): AnyCoordinate {
    // Sanitize and retry
    const sanitized = CoordinateValidator.sanitize(input);
    return new FastTransformationStrategy().transform(sanitized, 'universal', context);
  }
  
  private static handleProjectionSingularity(
    input: AnyCoordinate, 
    context: TransformationContext
  ): AnyCoordinate {
    // Switch to a different projection that handles singularities better
    if (input.type === 'spherical') {
      const s = input as SphericalCoordinate;
      
      if (Math.abs(s.lat) > 85) {
        // Use polar projection for high latitudes
        return new PolarProjectionStrategy().transform(input, 'flat', context);
      }
    }
    
    throw new Error('Cannot resolve projection singularity');
  }
}
```

## Integration Points

### TilemapManager Integration

```typescript
// Enhanced TilemapManager with coordinate transformation layer
class SphericalTilemapManager extends TilemapManager {
  private transformationLayer: CoordinateTransformationLayer;
  
  constructor() {
    super();
    this.transformationLayer = new CoordinateTransformationLayer();
  }
  
  // Override existing methods to support both coordinate systems
  static wrapX(x: number): number {
    // Preserve existing flat coordinate wrapping
    return super.wrapX(x);
  }
  
  static wrapSpherical(coord: SphericalCoordinate): SphericalCoordinate {
    // New spherical coordinate wrapping
    return CoordinateValidator.sanitize(coord) as SphericalCoordinate;
  }
  
  // New unified coordinate methods
  getUniversalCoordinate(input: AnyCoordinate): UniversalCoordinate {
    const context: TransformationContext = {
      purpose: 'chunk-loading',
      precision: 'gaming',
      cachePolicy: 'aggressive',
      performanceBudget: 10 // 10μs budget
    };
    
    return this.transformationLayer.transform(input, 'universal', context) as UniversalCoordinate;
  }
  
  distance(coord1: AnyCoordinate, coord2: AnyCoordinate, useSpherical = true): number {
    if (useSpherical) {
      const universal1 = this.getUniversalCoordinate(coord1);
      const universal2 = this.getUniversalCoordinate(coord2);
      return greatCircleDistance(universal1.spherical, universal2.spherical);
    } else {
      // Use existing flat distance calculation
      const flat1 = coord1.type === 'flat' ? coord1 as FlatCoordinate : 
                   this.transformationLayer.transform(coord1, 'flat', {
                     purpose: 'physics', precision: 'gaming', cachePolicy: 'normal', performanceBudget: 5
                   }) as FlatCoordinate;
      const flat2 = coord2.type === 'flat' ? coord2 as FlatCoordinate :
                   this.transformationLayer.transform(coord2, 'flat', {
                     purpose: 'physics', precision: 'gaming', cachePolicy: 'normal', performanceBudget: 5
                   }) as FlatCoordinate;
      
      return TilemapManager.toroidalDistanceX(flat1.x, flat2.x);
    }
  }
}
```

## Testing and Validation

### Coordinate Transformation Test Suite

```typescript
class TransformationTestSuite {
  runFullTestSuite(): TestResults {
    const results: TestResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
    
    this.testRoundTripAccuracy(results);
    this.testPerformanceBenchmarks(results);
    this.testEdgeCases(results);
    this.testCacheEffectiveness(results);
    
    return results;
  }
  
  private testRoundTripAccuracy(results: TestResults): void {
    // Test that spherical->flat->spherical maintains accuracy
    const testCoords: SphericalCoordinate[] = [
      { lat: 0, lon: 0, alt: 0 },       // Equator/Prime Meridian
      { lat: 90, lon: 0, alt: 0 },      // North Pole
      { lat: -90, lon: 0, alt: 0 },     // South Pole
      { lat: 45, lon: 180, alt: 0 },    // Mid-latitude/Antemeridian
      { lat: -45, lon: -180, alt: 0 },  // Mid-latitude/Antemeridian
      { lat: 23.5, lon: 0, alt: 0 },    // Tropic of Cancer
      { lat: -23.5, lon: 0, alt: 0 }    // Tropic of Capricorn
    ];
    
    const transformationLayer = new CoordinateTransformationLayer();
    const context: TransformationContext = {
      purpose: 'leyline-calculation',
      precision: 'scientific',
      cachePolicy: 'disabled',
      performanceBudget: 1000
    };
    
    for (const original of testCoords) {
      const flat = transformationLayer.transform(original, 'flat', context) as FlatCoordinate;
      const roundTrip = transformationLayer.transform(flat, 'spherical', context) as SphericalCoordinate;
      
      const latError = Math.abs(original.lat - roundTrip.lat);
      const lonError = Math.abs(original.lon - roundTrip.lon);
      
      if (latError > 0.000001 || lonError > 0.000001) { // 1μ° tolerance
        results.failed++;
        results.errors.push(`Round-trip error: ${JSON.stringify(original)} -> ${JSON.stringify(roundTrip)}`);
      } else {
        results.passed++;
      }
    }
  }
  
  private testPerformanceBenchmarks(results: TestResults): void {
    const transformationLayer = new CoordinateTransformationLayer();
    const testCoord: SphericalCoordinate = { lat: 45, lon: 90, alt: 0 };
    const context: TransformationContext = {
      purpose: 'rendering',
      precision: 'gaming',
      cachePolicy: 'aggressive',
      performanceBudget: 10
    };
    
    // Warm up
    for (let i = 0; i < 1000; i++) {
      transformationLayer.transform(testCoord, 'flat', context);
    }
    
    // Benchmark
    const iterations = 10000;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      transformationLayer.transform(testCoord, 'flat', context);
    }
    
    const endTime = performance.now();
    const averageTime = (endTime - startTime) / iterations;
    
    if (averageTime > 0.010) { // 10μs threshold
      results.failed++;
      results.errors.push(`Performance test failed: ${averageTime.toFixed(6)}ms average (>10μs)`);
    } else {
      results.passed++;
    }
  }
}
```

## Next Steps

The next document will focus on implementing planetary ley line circles using the coordinate transformation layer established here, including the mathematical algorithms for great circle calculations and intersection detection.
