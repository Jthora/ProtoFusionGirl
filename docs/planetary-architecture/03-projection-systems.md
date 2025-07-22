# Map Projection Systems for Planetary Gaming

## Overview
This document analyzes map projection systems for converting spherical Earth coordinates to flat tile-based representations while preserving gaming performance and visual quality for ProtoFusionGirl's planetary-scale world.

## Gaming Requirements for Map Projections

### Critical Gaming Constraints
1. **Performance**: Sub-millisecond coordinate conversions for real-time gameplay
2. **Visual Continuity**: Minimal distortion in gameplay areas
3. **Ley Line Accuracy**: Great circles must render as meaningful curves
4. **Tile Alignment**: Must map cleanly to discrete tile grid
5. **Seamless Wrapping**: Support toroidal world mechanics
6. **Polar Playability**: Polar regions must be navigable

### Traditional vs Gaming Projection Requirements

| Traditional Cartography | Gaming Requirements |
|-------------------------|-------------------|
| Preserve area, distance, or angles | Preserve gameplay experience |
| Scientific accuracy | Visual believability |
| Static display | Real-time conversion |
| Professional use | Player accessibility |

## Projection Analysis for Gaming

### 1. Equirectangular Projection (Current System Compatible)

#### Mathematical Definition
```typescript
class EquirectangularProjection {
  static sphericalToFlat(coord: SphericalCoordinate): FlatCoordinate {
    const x = (coord.lon + 180) * (WORLD_WIDTH / 360);
    const y = (90 - coord.lat) * (WORLD_HEIGHT / 180);
    return { x, y };
  }
  
  static flatToSpherical(coord: FlatCoordinate): SphericalCoordinate {
    const lon = (coord.x * 360 / WORLD_WIDTH) - 180;
    const lat = 90 - (coord.y * 180 / WORLD_HEIGHT);
    return { lat, lon, alt: 0 };
  }
}
```

#### Gaming Advantages
- **Trivial Implementation**: Simple linear mapping
- **Perfect Compatibility**: Matches current flat coordinate system
- **No Conversion Overhead**: Direct mathematical relationship
- **Seamless Wrapping**: Natural horizontal wrapping at ±180°

#### Gaming Disadvantages
- **Severe Polar Distortion**: Polar regions extremely stretched
- **Distance Distortion**: Distances increasingly wrong toward poles
- **Area Distortion**: Polar tiles represent much smaller real areas
- **Ley Line Distortion**: Great circles become complex sinusoidal curves

#### Ley Line Rendering Example
```typescript
// Great circle rendered in equirectangular projection
function renderGreatCircleEquirectangular(
  start: SphericalCoordinate, 
  end: SphericalCoordinate,
  resolution: number = 100
): FlatCoordinate[] {
  const points: FlatCoordinate[] = [];
  
  for (let i = 0; i <= resolution; i++) {
    const t = i / resolution;
    
    // Interpolate along great circle (spherical)
    const bearing = greatCircleBearing(start, end);
    const distance = greatCircleDistance(start, end);
    const sphericalPoint = pointAlongGreatCircle(start, bearing, distance * t);
    
    // Project to flat coordinates
    const flatPoint = EquirectangularProjection.sphericalToFlat(sphericalPoint);
    
    // Handle antemeridian crossing
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      if (Math.abs(flatPoint.x - lastPoint.x) > WORLD_WIDTH / 2) {
        // Split line at antemeridian
        points.push({ x: flatPoint.x > lastPoint.x ? 0 : WORLD_WIDTH, y: flatPoint.y });
        points.push({ x: flatPoint.x > lastPoint.x ? WORLD_WIDTH : 0, y: flatPoint.y });
      }
    }
    
    points.push(flatPoint);
  }
  
  return points;
}
```

### 2. Web Mercator Projection (Gaming Industry Standard)

#### Mathematical Definition
```typescript
class WebMercatorProjection {
  private static readonly MAX_LATITUDE = 85.0511; // Web Mercator limit
  
  static sphericalToFlat(coord: SphericalCoordinate): FlatCoordinate {
    // Clamp latitude to avoid infinite projection
    const lat = Math.max(-this.MAX_LATITUDE, Math.min(this.MAX_LATITUDE, coord.lat));
    
    const x = (coord.lon + 180) * (WORLD_WIDTH / 360);
    const latRad = lat * Math.PI / 180;
    const mercatorY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = (1 - mercatorY / Math.PI) * (WORLD_HEIGHT / 2);
    
    return { x, y };
  }
  
  static flatToSpherical(coord: FlatCoordinate): SphericalCoordinate {
    const lon = (coord.x * 360 / WORLD_WIDTH) - 180;
    const mercatorY = (1 - 2 * coord.y / WORLD_HEIGHT) * Math.PI;
    const lat = (2 * Math.atan(Math.exp(mercatorY)) - Math.PI / 2) * 180 / Math.PI;
    
    return { lat, lon, alt: 0 };
  }
}
```

#### Gaming Advantages
- **Industry Standard**: Used by Google Maps, game engines
- **Familiar Look**: Players recognize the projection
- **Conformal**: Preserves angles and shapes locally
- **Good Mid-Latitude Performance**: Excellent for populated areas

#### Gaming Disadvantages
- **Polar Exclusion**: Cannot represent polar regions (±85° limit)
- **Severe Polar Distortion**: Area distortion approaches infinity at limits
- **Complex Inverse**: Logarithmic functions add computational overhead
- **Ley Line Complexity**: Great circles still curve significantly

### 3. Lambert Azimuthal Equal-Area (Gaming Optimized)

#### Mathematical Definition
```typescript
class LambertAzimuthalProjection {
  constructor(private centerLat: number, private centerLon: number) {}
  
  sphericalToFlat(coord: SphericalCoordinate): FlatCoordinate {
    const φ = coord.lat * Math.PI / 180;
    const λ = coord.lon * Math.PI / 180;
    const φ0 = this.centerLat * Math.PI / 180;
    const λ0 = this.centerLon * Math.PI / 180;
    
    const cosC = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ - λ0);
    const k = Math.sqrt(2 / (1 + cosC));
    
    const x = k * Math.cos(φ) * Math.sin(λ - λ0);
    const y = k * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ - λ0));
    
    // Scale and translate to tile coordinates
    const scale = WORLD_WIDTH / (4 * Math.PI); // Adjust scale factor
    return {
      x: WORLD_WIDTH / 2 + x * scale,
      y: WORLD_HEIGHT / 2 - y * scale
    };
  }
}
```

#### Gaming Advantages
- **Equal Area**: All regions have proportionally correct tile representation
- **Flexible Center**: Can center projection on gameplay area
- **Great Circle Simplicity**: Great circles through center are straight lines
- **Polar Inclusion**: Can represent entire sphere

#### Gaming Disadvantages
- **Complex Mathematics**: Trigonometric functions add overhead
- **Edge Distortion**: Severe distortion at projection edges
- **Non-Conformal**: Shapes distorted away from center
- **Multiple Projections Needed**: Requires switching projections for global coverage

### 4. Hybrid Multi-Projection System (Recommended for Gaming)

#### Concept
Use different projections for different zoom levels and regions:

```typescript
class HybridProjectionSystem {
  private equirectangular = new EquirectangularProjection();
  private mercator = new WebMercatorProjection();
  private polarProjections = new Map<string, LambertAzimuthalProjection>();
  
  constructor() {
    // Initialize polar projections
    this.polarProjections.set('north', new LambertAzimuthalProjection(90, 0));
    this.polarProjections.set('south', new LambertAzimuthalProjection(-90, 0));
  }
  
  sphericalToFlat(coord: SphericalCoordinate, context: ProjectionContext): FlatCoordinate {
    // Choose projection based on latitude and zoom level
    if (Math.abs(coord.lat) > 85) {
      // Use polar projection for extreme latitudes
      const polar = coord.lat > 0 ? 'north' : 'south';
      return this.polarProjections.get(polar)!.sphericalToFlat(coord);
    } else if (context.zoomLevel > 5) {
      // Use Mercator for detailed local views
      return this.mercator.sphericalToFlat(coord);
    } else {
      // Use equirectangular for global overview
      return this.equirectangular.sphericalToFlat(coord);
    }
  }
}
```

## Ley Line Rendering Strategies

### 1. Adaptive Sampling for Great Circles

```typescript
class AdaptiveGreatCircleRenderer {
  renderGreatCircle(
    circle: LeyLineCircle, 
    projection: ProjectionSystem,
    maxDeviation: number = 5 // pixels
  ): FlatCoordinate[] {
    const points: FlatCoordinate[] = [];
    
    // Start with endpoints
    const start = projection.sphericalToFlat(circle.pole1);
    const end = projection.sphericalToFlat(circle.pole2);
    
    // Recursively subdivide until smooth enough
    this.subdivideGreatCircleSegment(
      circle.pole1, circle.pole2, 
      start, end, 
      projection, maxDeviation, points
    );
    
    return points;
  }
  
  private subdivideGreatCircleSegment(
    sphericalStart: SphericalCoordinate,
    sphericalEnd: SphericalCoordinate,
    flatStart: FlatCoordinate,
    flatEnd: FlatCoordinate,
    projection: ProjectionSystem,
    maxDeviation: number,
    points: FlatCoordinate[]
  ): void {
    // Find midpoint on great circle
    const bearing = greatCircleBearing(sphericalStart, sphericalEnd);
    const distance = greatCircleDistance(sphericalStart, sphericalEnd);
    const midSpherical = pointAlongGreatCircle(sphericalStart, bearing, distance / 2);
    const midFlat = projection.sphericalToFlat(midSpherical);
    
    // Calculate expected midpoint on straight line
    const expectedMid = {
      x: (flatStart.x + flatEnd.x) / 2,
      y: (flatStart.y + flatEnd.y) / 2
    };
    
    // Check if deviation exceeds threshold
    const deviation = Math.sqrt(
      Math.pow(midFlat.x - expectedMid.x, 2) + 
      Math.pow(midFlat.y - expectedMid.y, 2)
    );
    
    if (deviation > maxDeviation) {
      // Subdivide further
      this.subdivideGreatCircleSegment(
        sphericalStart, midSpherical, 
        flatStart, midFlat, 
        projection, maxDeviation, points
      );
      this.subdivideGreatCircleSegment(
        midSpherical, sphericalEnd, 
        midFlat, flatEnd, 
        projection, maxDeviation, points
      );
    } else {
      // Segment is smooth enough
      points.push(flatStart);
      if (points[points.length - 1] !== flatEnd) {
        points.push(flatEnd);
      }
    }
  }
}
```

### 2. Precomputed Ley Line Lookup Tables

```typescript
class LeyLineLookupTable {
  private lookupTable = new Map<string, FlatCoordinate[]>();
  
  generateLookupTable(
    leyLines: LeyLineCircle[], 
    projection: ProjectionSystem,
    resolution: number = 1000
  ): void {
    for (const leyLine of leyLines) {
      const key = this.getLeyLineKey(leyLine);
      const points = this.renderGreatCircleHighRes(leyLine, projection, resolution);
      this.lookupTable.set(key, points);
    }
  }
  
  getLeyLineRenderPath(leyLine: LeyLineCircle): FlatCoordinate[] {
    const key = this.getLeyLineKey(leyLine);
    return this.lookupTable.get(key) || [];
  }
  
  private getLeyLineKey(leyLine: LeyLineCircle): string {
    return `${leyLine.pole1.lat},${leyLine.pole1.lon}_${leyLine.pole2.lat},${leyLine.pole2.lon}`;
  }
}
```

## Performance Optimization Strategies

### 1. Projection Caching
```typescript
class ProjectionCache {
  private cache = new Map<string, FlatCoordinate>();
  private maxCacheSize = 10000;
  
  getCachedProjection(coord: SphericalCoordinate, projectionType: string): FlatCoordinate | null {
    const key = `${coord.lat.toFixed(6)},${coord.lon.toFixed(6)},${projectionType}`;
    return this.cache.get(key) || null;
  }
  
  setCachedProjection(
    coord: SphericalCoordinate, 
    projectionType: string, 
    result: FlatCoordinate
  ): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entries (simple FIFO)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    const key = `${coord.lat.toFixed(6)},${coord.lon.toFixed(6)},${projectionType}`;
    this.cache.set(key, result);
  }
}
```

### 2. Fast Approximation for Real-Time Use
```typescript
class FastProjectionApproximation {
  // Fast equirectangular (no distortion correction)
  static fastEquirectangular(coord: SphericalCoordinate): FlatCoordinate {
    return {
      x: (coord.lon + 180) * (WORLD_WIDTH / 360),
      y: (90 - coord.lat) * (WORLD_HEIGHT / 180)
    };
  }
  
  // Fast Mercator (using lookup table for log operations)
  private static mercatorYLookup = this.generateMercatorLookup();
  
  static fastMercator(coord: SphericalCoordinate): FlatCoordinate {
    const clampedLat = Math.max(-85, Math.min(85, coord.lat));
    const latIndex = Math.round((clampedLat + 85) * 10); // 0.1 degree resolution
    const mercatorY = this.mercatorYLookup[latIndex];
    
    return {
      x: (coord.lon + 180) * (WORLD_WIDTH / 360),
      y: mercatorY
    };
  }
  
  private static generateMercatorLookup(): number[] {
    const lookup: number[] = [];
    for (let i = 0; i <= 1700; i++) { // -85 to 85 degrees in 0.1 increments
      const lat = (i * 0.1) - 85;
      const latRad = lat * Math.PI / 180;
      const mercatorY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
      const y = (1 - mercatorY / Math.PI) * (WORLD_HEIGHT / 2);
      lookup.push(y);
    }
    return lookup;
  }
}
```

## Integration with Current Tile System

### Tile Quantization Strategy
```typescript
class TileQuantization {
  static quantizeToTileGrid(
    coord: FlatCoordinate, 
    tileSize: number = 1
  ): FlatCoordinate {
    return {
      x: Math.round(coord.x / tileSize) * tileSize,
      y: Math.round(coord.y / tileSize) * tileSize
    };
  }
  
  static getContainingTile(coord: FlatCoordinate, tileSize: number = 1): TileCoordinate {
    return {
      tileX: Math.floor(coord.x / tileSize),
      tileY: Math.floor(coord.y / tileSize)
    };
  }
}
```

### Projection Transition Handling
```typescript
class ProjectionTransitionManager {
  private currentProjection: ProjectionSystem;
  private transitionZones = new Map<string, ProjectionBoundary>();
  
  smoothTransition(
    coord: SphericalCoordinate,
    fromProjection: ProjectionSystem,
    toProjection: ProjectionSystem,
    transitionFactor: number // 0-1
  ): FlatCoordinate {
    const fromFlat = fromProjection.sphericalToFlat(coord);
    const toFlat = toProjection.sphericalToFlat(coord);
    
    return {
      x: fromFlat.x * (1 - transitionFactor) + toFlat.x * transitionFactor,
      y: fromFlat.y * (1 - transitionFactor) + toFlat.y * transitionFactor
    };
  }
}
```

## Recommendation for ProtoFusionGirl

### Proposed Hybrid System
1. **Global Overview**: Equirectangular projection for compatibility
2. **Regional Detail**: Web Mercator for mid-latitudes (±60°)
3. **Polar Regions**: Lambert Azimuthal for polar exploration
4. **Ley Line Rendering**: Adaptive sampling with lookup tables
5. **Performance**: Caching and approximation for real-time use

### Implementation Priority
1. **Phase 1**: Enhance current equirectangular with better ley line rendering
2. **Phase 2**: Add Web Mercator for detailed views
3. **Phase 3**: Implement polar projections for complete coverage
4. **Phase 4**: Optimize with caching and lookup tables

### Performance Targets
- **Coordinate Conversion**: <10μs per operation
- **Ley Line Rendering**: <5ms for complete global ley line set
- **Memory Usage**: <50MB for projection caches and lookup tables
- **Visual Quality**: <2 pixel deviation for ley line curves at 1080p

## Next Steps

The next document will design the hybrid architecture that integrates these projection systems with the current tilemap infrastructure while maintaining performance and compatibility.
