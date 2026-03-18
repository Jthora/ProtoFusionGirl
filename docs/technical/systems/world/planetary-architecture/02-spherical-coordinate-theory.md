# Spherical Coordinate Theory

## Overview
This document establishes the mathematical foundations for implementing spherical coordinates in ProtoFusionGirl's planetary-scale system, focusing on practical gaming applications while maintaining mathematical accuracy.

## Coordinate System Fundamentals

### Spherical Coordinate Systems

#### Geographic Coordinate System (Primary)
**Definition**: Earth's standard latitude/longitude system
- **Latitude (φ)**: -90° to +90° (South to North)
- **Longitude (λ)**: -180° to +180° (West to East)  
- **Altitude (h)**: Height above sea level in meters

**Mathematical Representation**:
```typescript
interface SphericalCoordinate {
  lat: number;  // Latitude in degrees [-90, 90]
  lon: number;  // Longitude in degrees [-180, 180]
  alt: number;  // Altitude in meters above sea level
}
```

#### Cartesian Coordinate Conversion
**Sphere to Cartesian**:
```typescript
function sphericalToCartesian(coord: SphericalCoordinate, earthRadius: number = 6371000): Vector3 {
  const φ = coord.lat * Math.PI / 180;  // Latitude in radians
  const λ = coord.lon * Math.PI / 180;  // Longitude in radians
  const r = earthRadius + coord.alt;    // Distance from Earth center
  
  return {
    x: r * Math.cos(φ) * Math.cos(λ),
    y: r * Math.cos(φ) * Math.sin(λ),
    z: r * Math.sin(φ)
  };
}
```

**Cartesian to Sphere**:
```typescript
function cartesianToSpherical(point: Vector3, earthRadius: number = 6371000): SphericalCoordinate {
  const r = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
  const φ = Math.asin(point.z / r);              // Latitude
  const λ = Math.atan2(point.y, point.x);        // Longitude
  
  return {
    lat: φ * 180 / Math.PI,
    lon: λ * 180 / Math.PI,
    alt: r - earthRadius
  };
}
```

## Great Circle Mathematics

### Great Circle Definition
A **great circle** is any circle on a sphere whose center coincides with the sphere's center. For Earth, great circles represent the shortest distance between any two points.

### Great Circle Equations

#### Distance Between Two Points
**Haversine Formula** (accurate for all distances):
```typescript
function greatCircleDistance(p1: SphericalCoordinate, p2: SphericalCoordinate): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = p1.lat * Math.PI / 180;
  const φ2 = p2.lat * Math.PI / 180;
  const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
  const Δλ = (p2.lon - p1.lon) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}
```

#### Bearing Between Two Points
```typescript
function greatCircleBearing(p1: SphericalCoordinate, p2: SphericalCoordinate): number {
  const φ1 = p1.lat * Math.PI / 180;
  const φ2 = p2.lat * Math.PI / 180;
  const Δλ = (p2.lon - p1.lon) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return (θ * 180 / Math.PI + 360) % 360; // Bearing in degrees
}
```

#### Point Along Great Circle
```typescript
function pointAlongGreatCircle(
  start: SphericalCoordinate, 
  bearing: number, 
  distance: number
): SphericalCoordinate {
  const R = 6371000;
  const φ1 = start.lat * Math.PI / 180;
  const λ1 = start.lon * Math.PI / 180;
  const θ = bearing * Math.PI / 180;
  const δ = distance / R; // Angular distance

  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + 
                       Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
                              Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));

  return {
    lat: φ2 * 180 / Math.PI,
    lon: ((λ2 * 180 / Math.PI) + 540) % 360 - 180, // Normalize longitude
    alt: start.alt
  };
}
```

## Ley Line Circle Mathematics

### Ley Line as Great Circles

#### Defining a Ley Line Circle
A ley line circle is defined by two antipodal points (poles) on the sphere:
```typescript
interface LeyLineCircle {
  pole1: SphericalCoordinate;  // First pole
  pole2: SphericalCoordinate;  // Opposite pole  
  energy: number;              // Energy level 0-100
  type: 'meridional' | 'equatorial' | 'oblique';
}
```

#### Standard Earth Ley Line Circles

**Equatorial Ley Line**:
```typescript
const equatorialLeyLine: LeyLineCircle = {
  pole1: { lat: 0, lon: 0, alt: 0 },
  pole2: { lat: 0, lon: 180, alt: 0 },
  energy: 100,
  type: 'equatorial'
};
```

**Meridional Ley Lines** (12 major meridians):
```typescript
function generateMeridionalLeyLines(): LeyLineCircle[] {
  const meridians: LeyLineCircle[] = [];
  
  for (let i = 0; i < 12; i++) {
    const longitude = i * 30; // Every 30 degrees
    meridians.push({
      pole1: { lat: 90, lon: longitude, alt: 0 },    // North pole
      pole2: { lat: -90, lon: longitude, alt: 0 },   // South pole
      energy: 85 + Math.random() * 15,               // Variable energy
      type: 'meridional'
    });
  }
  
  return meridians;
}
```

**Oblique Ley Lines** (diagonal circles):
```typescript
function generateObliqueLeyLines(): LeyLineCircle[] {
  // Example: Ley line connecting opposite points at 45° latitude
  return [{
    pole1: { lat: 45, lon: 0, alt: 0 },
    pole2: { lat: -45, lon: 180, alt: 0 },
    energy: 70,
    type: 'oblique'
  }];
}
```

### Great Circle Intersections

#### Intersection Mathematics
Two great circles always intersect at exactly two antipodal points:
```typescript
function greatCircleIntersection(
  circle1: LeyLineCircle, 
  circle2: LeyLineCircle
): SphericalCoordinate[] {
  
  // Convert poles to unit vectors
  const p1 = sphericalToCartesian(circle1.pole1, 1);
  const q1 = sphericalToCartesian(circle1.pole2, 1);
  const p2 = sphericalToCartesian(circle2.pole1, 1);
  const q2 = sphericalToCartesian(circle2.pole2, 1);
  
  // Great circle normal vectors
  const n1 = crossProduct(p1, q1);
  const n2 = crossProduct(p2, q2);
  
  // Intersection points are perpendicular to both normals
  const intersection1 = crossProduct(n1, n2);
  const intersection2 = scaleVector(intersection1, -1);
  
  // Normalize and convert back to spherical
  const norm1 = normalizeVector(intersection1);
  const norm2 = normalizeVector(intersection2);
  
  return [
    cartesianToSpherical(norm1, 1),
    cartesianToSpherical(norm2, 1)
  ];
}
```

#### Ley Line Node Generation
```typescript
function generateLeyLineIntersectionNodes(leyLines: LeyLineCircle[]): LeyLineNode[] {
  const nodes: LeyLineNode[] = [];
  
  for (let i = 0; i < leyLines.length; i++) {
    for (let j = i + 1; j < leyLines.length; j++) {
      const intersections = greatCircleIntersection(leyLines[i], leyLines[j]);
      
      intersections.forEach((point, index) => {
        nodes.push({
          id: `intersection_${i}_${j}_${index}`,
          position: point,
          energy: (leyLines[i].energy + leyLines[j].energy) / 2,
          connectedLeyLines: [leyLines[i], leyLines[j]],
          type: 'intersection'
        });
      });
    }
  }
  
  return nodes;
}
```

## Earth Geometry Constants

### Physical Constants
```typescript
const EARTH_CONSTANTS = {
  // WGS84 Ellipsoid parameters
  EQUATORIAL_RADIUS: 6378137.0,      // meters (a)
  POLAR_RADIUS: 6356752.314245,      // meters (b)
  FLATTENING: 1/298.257223563,       // f = (a-b)/a
  ECCENTRICITY_SQUARED: 0.00669437999014, // e² = 2f - f²
  
  // Simplified sphere (for gaming)
  MEAN_RADIUS: 6371000,              // meters
  CIRCUMFERENCE: 40075017,           // meters (equatorial)
  
  // Gaming-specific
  METERS_PER_TILE: 1,                // 1 meter per tile
  WORLD_WIDTH_TILES: 40075017,       // Current system
  WORLD_HEIGHT_TILES: 965400         // ±300 miles vertical range
};
```

### Coordinate Validation
```typescript
function isValidSphericalCoordinate(coord: SphericalCoordinate): boolean {
  return coord.lat >= -90 && coord.lat <= 90 &&
         coord.lon >= -180 && coord.lon <= 180 &&
         coord.alt >= -EARTH_CONSTANTS.MEAN_RADIUS; // Allow underground
}

function normalizeSphericalCoordinate(coord: SphericalCoordinate): SphericalCoordinate {
  return {
    lat: Math.max(-90, Math.min(90, coord.lat)),
    lon: ((coord.lon + 180) % 360) - 180, // Wrap longitude
    alt: coord.alt
  };
}
```

## Performance Optimization Strategies

### Precomputed Values
```typescript
class SphericalMathCache {
  private sinLatCache = new Map<number, number>();
  private cosLatCache = new Map<number, number>();
  
  getSinLat(lat: number): number {
    if (!this.sinLatCache.has(lat)) {
      this.sinLatCache.set(lat, Math.sin(lat * Math.PI / 180));
    }
    return this.sinLatCache.get(lat)!;
  }
  
  getCosLat(lat: number): number {
    if (!this.cosLatCache.has(lat)) {
      this.cosLatCache.set(lat, Math.cos(lat * Math.PI / 180));
    }
    return this.cosLatCache.get(lat)!;
  }
}
```

### Approximation Strategies
For real-time gaming, certain approximations can improve performance:

#### Fast Distance Approximation (for short distances)
```typescript
function fastSphericalDistance(p1: SphericalCoordinate, p2: SphericalCoordinate): number {
  const R = 6371000;
  const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
  const Δλ = (p2.lon - p1.lon) * Math.PI / 180;
  const φ_avg = (p1.lat + p2.lat) / 2 * Math.PI / 180;
  
  const x = Δλ * Math.cos(φ_avg);
  const y = Δφ;
  
  return R * Math.sqrt(x * x + y * y);
}
```

## Integration with Current System

### Coordinate Conversion Layer
```typescript
class CoordinateConverter {
  static sphericalToFlat(coord: SphericalCoordinate): FlatCoordinate {
    // Convert spherical to current flat coordinate system
    const x = (coord.lon + 180) * (EARTH_CONSTANTS.WORLD_WIDTH_TILES / 360);
    const y = (90 - coord.lat) * (EARTH_CONSTANTS.WORLD_HEIGHT_TILES / 180);
    
    return { x: Math.round(x), y: Math.round(y) };
  }
  
  static flatToSpherical(coord: FlatCoordinate): SphericalCoordinate {
    // Convert current flat coordinates to spherical
    const lon = (coord.x * 360 / EARTH_CONSTANTS.WORLD_WIDTH_TILES) - 180;
    const lat = 90 - (coord.y * 180 / EARTH_CONSTANTS.WORLD_HEIGHT_TILES);
    
    return { lat, lon, alt: 0 };
  }
}
```

## Error Handling and Edge Cases

### Pole Handling
```typescript
function handlePolarRegion(coord: SphericalCoordinate): SphericalCoordinate {
  // At poles, longitude becomes undefined
  if (Math.abs(coord.lat) > 89.9) {
    return {
      lat: coord.lat > 0 ? 90 : -90,
      lon: 0, // Arbitrary longitude at pole
      alt: coord.alt
    };
  }
  return coord;
}
```

### Antemeridian Crossing
```typescript
function handleAntemeridianCrossing(path: SphericalCoordinate[]): SphericalCoordinate[] {
  // Handle paths that cross the 180° longitude line
  const correctedPath: SphericalCoordinate[] = [];
  
  for (let i = 0; i < path.length; i++) {
    const point = { ...path[i] };
    
    if (i > 0) {
      const prevLon = correctedPath[i-1].lon;
      const lonDiff = point.lon - prevLon;
      
      // If longitude jump > 180°, we crossed the antemeridian
      if (lonDiff > 180) {
        point.lon -= 360;
      } else if (lonDiff < -180) {
        point.lon += 360;
      }
    }
    
    correctedPath.push(point);
  }
  
  return correctedPath;
}
```

## Next Steps

With these mathematical foundations established, the next document will explore map projection systems for converting between spherical and flat coordinate systems while preserving the gaming experience.

Key areas for further development:
1. **Map Projections**: Choose optimal projections for different game contexts
2. **Performance Benchmarking**: Measure coordinate conversion overhead
3. **Numerical Precision**: Handle floating-point precision issues at scale
4. **Cache Strategies**: Optimize repeated calculations
