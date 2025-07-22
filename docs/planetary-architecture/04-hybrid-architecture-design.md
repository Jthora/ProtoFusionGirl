# Hybrid Architecture Design

## Overview
This document outlines the comprehensive architecture for integrating spherical coordinate systems with ProtoFusionGirl's existing tilemap infrastructure, creating a hybrid system that maintains performance while enabling authentic planetary-scale ley line circles.

## Architecture Philosophy

### Core Design Principles
1. **Backward Compatibility**: Existing save files and mods continue to work
2. **Performance Preservation**: Maintain current Earth-scale performance characteristics
3. **Gradual Enhancement**: Layer spherical awareness onto existing systems
4. **Dual Coordinate Support**: Seamless conversion between flat and spherical coordinates
5. **Minimal Disruption**: Existing code requires minimal changes

### Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                 Game Logic Layer                            │
│  (ASI, Combat, Crafting - unchanged)                       │
├─────────────────────────────────────────────────────────────┤
│                Spherical Abstraction Layer                 │
│  (Coordinate Conversion, Ley Line Circles)                 │
├─────────────────────────────────────────────────────────────┤
│              Enhanced Tilemap Layer                        │
│  (TilemapManager, ChunkManager + Spherical Awareness)      │
├─────────────────────────────────────────────────────────────┤
│                Current Foundation                          │
│  (Existing Chunk System, World Generation)                 │
└─────────────────────────────────────────────────────────────┘
```

## Core Architecture Components

### 1. Coordinate System Manager

The foundation of the hybrid system is a coordinate manager that handles seamless conversion between coordinate systems:

```typescript
interface CoordinateSystem {
  readonly type: 'spherical' | 'flat';
  readonly projection?: ProjectionType;
}

interface UniversalCoordinate {
  spherical: SphericalCoordinate;
  flat: FlatCoordinate;
  system: CoordinateSystem;
}

class CoordinateSystemManager {
  private currentProjection: ProjectionSystem;
  private conversionCache: ProjectionCache;
  private performanceMode: 'precise' | 'fast' | 'cached';
  
  constructor() {
    this.currentProjection = new HybridProjectionSystem();
    this.conversionCache = new ProjectionCache();
    this.performanceMode = 'cached';
  }
  
  // Primary coordinate conversion methods
  toSpherical(coord: FlatCoordinate): SphericalCoordinate {
    const cached = this.conversionCache.getCachedInverse(coord, this.currentProjection.type);
    if (cached) return cached;
    
    const result = this.currentProjection.flatToSpherical(coord);
    this.conversionCache.setCachedInverse(coord, this.currentProjection.type, result);
    return result;
  }
  
  toFlat(coord: SphericalCoordinate): FlatCoordinate {
    const cached = this.conversionCache.getCachedProjection(coord, this.currentProjection.type);
    if (cached) return cached;
    
    const result = this.currentProjection.sphericalToFlat(coord);
    this.conversionCache.setCachedProjection(coord, this.currentProjection.type, result);
    return result;
  }
  
  // Universal coordinate that maintains both representations
  createUniversalCoordinate(
    input: SphericalCoordinate | FlatCoordinate,
    inputType: 'spherical' | 'flat'
  ): UniversalCoordinate {
    if (inputType === 'spherical') {
      const spherical = input as SphericalCoordinate;
      return {
        spherical,
        flat: this.toFlat(spherical),
        system: { type: 'spherical' }
      };
    } else {
      const flat = input as FlatCoordinate;
      return {
        spherical: this.toSpherical(flat),
        flat,
        system: { type: 'flat' }
      };
    }
  }
}
```

### 2. Enhanced TilemapManager

Extend the existing TilemapManager with spherical awareness while preserving all current functionality:

```typescript
class SphericalTilemapManager extends TilemapManager {
  private coordinateManager: CoordinateSystemManager;
  private leyLineCircleManager: PlanetaryLeyLineManager;
  
  constructor() {
    super(); // Initialize existing functionality
    this.coordinateManager = new CoordinateSystemManager();
    this.leyLineCircleManager = new PlanetaryLeyLineManager(this);
  }
  
  // Enhanced coordinate methods (backward compatible)
  static wrapX(x: number): number {
    // Preserve existing functionality exactly
    return super.wrapX(x);
  }
  
  static wrapSpherical(coord: SphericalCoordinate): SphericalCoordinate {
    // New spherical wrapping logic
    return {
      lat: Math.max(-90, Math.min(90, coord.lat)),
      lon: ((coord.lon + 180) % 360) - 180,
      alt: coord.alt
    };
  }
  
  // New spherical-aware methods
  getSphericalCoordinate(flatX: number, flatY: number): SphericalCoordinate {
    const flatCoord = { x: flatX, y: flatY };
    return this.coordinateManager.toSpherical(flatCoord);
  }
  
  getFlatCoordinate(sphericalCoord: SphericalCoordinate): FlatCoordinate {
    return this.coordinateManager.toFlat(sphericalCoord);
  }
  
  // Enhanced distance calculations
  static sphericalDistance(coord1: SphericalCoordinate, coord2: SphericalCoordinate): number {
    return greatCircleDistance(coord1, coord2);
  }
  
  static hybridDistance(
    coord1: UniversalCoordinate, 
    coord2: UniversalCoordinate,
    preferSpherical: boolean = true
  ): number {
    if (preferSpherical) {
      return this.sphericalDistance(coord1.spherical, coord2.spherical);
    } else {
      return this.toroidalDistanceX(coord1.flat.x, coord2.flat.x);
    }
  }
}
```

### 3. Spherical Chunk Management

Enhance the chunk system to handle spherical regions while maintaining compatibility:

```typescript
interface SphericalChunkAddress {
  flat: { chunkX: number; chunkY: number };
  spherical: { latBand: number; lonSegment: number };
  boundary: SphericalBoundingBox;
}

class SphericalChunkManager extends ChunkManager {
  private sphericalAddressing = new Map<string, SphericalChunkAddress>();
  private coordinateManager: CoordinateSystemManager;
  
  constructor(tilemapManager: SphericalTilemapManager) {
    super(tilemapManager);
    this.coordinateManager = tilemapManager.coordinateManager;
  }
  
  // Enhanced chunk loading with spherical awareness
  loadChunkBySpherical(coord: SphericalCoordinate): any {
    const flatCoord = this.coordinateManager.toFlat(coord);
    const chunkX = Math.floor(flatCoord.x / this.chunkSize);
    const chunkY = Math.floor(flatCoord.y / this.chunkSize);
    
    // Use existing flat chunk loading
    const chunk = this.loadChunk(chunkX, chunkY);
    
    // Add spherical metadata
    if (chunk && !this.sphericalAddressing.has(this.getChunkKey(chunkX, chunkY))) {
      this.addSphericalAddressing(chunkX, chunkY, chunk);
    }
    
    return chunk;
  }
  
  private addSphericalAddressing(chunkX: number, chunkY: number, chunk: any): void {
    const key = this.getChunkKey(chunkX, chunkY);
    
    // Calculate spherical bounds for this chunk
    const topLeft = this.coordinateManager.toSpherical({
      x: chunkX * this.chunkSize,
      y: chunkY * this.chunkSize
    });
    const bottomRight = this.coordinateManager.toSpherical({
      x: (chunkX + 1) * this.chunkSize,
      y: (chunkY + 1) * this.chunkSize
    });
    
    const sphericalAddress: SphericalChunkAddress = {
      flat: { chunkX, chunkY },
      spherical: {
        latBand: Math.floor(topLeft.lat / 10), // 10-degree bands
        lonSegment: Math.floor(topLeft.lon / 10) // 10-degree segments
      },
      boundary: {
        north: Math.max(topLeft.lat, bottomRight.lat),
        south: Math.min(topLeft.lat, bottomRight.lat),
        east: Math.max(topLeft.lon, bottomRight.lon),
        west: Math.min(topLeft.lon, bottomRight.lon)
      }
    };
    
    this.sphericalAddressing.set(key, sphericalAddress);
  }
  
  // Get chunks by spherical region
  getChunksInSphericalRegion(region: SphericalBoundingBox): any[] {
    const chunks: any[] = [];
    
    for (const [key, address] of this.sphericalAddressing.entries()) {
      if (this.sphericalRegionsOverlap(address.boundary, region)) {
        const [chunkX, chunkY] = key.split(',').map(Number);
        const chunk = this.getChunk(chunkX, chunkY);
        if (chunk) chunks.push(chunk);
      }
    }
    
    return chunks;
  }
  
  private sphericalRegionsOverlap(region1: SphericalBoundingBox, region2: SphericalBoundingBox): boolean {
    return !(region1.north < region2.south || 
             region1.south > region2.north ||
             region1.east < region2.west || 
             region1.west > region2.east);
  }
}
```

### 4. Planetary Ley Line Manager

Completely redesign the ley line system for spherical great circles:

```typescript
class PlanetaryLeyLineManager {
  private leyLineCircles: LeyLineCircle[] = [];
  private intersectionNodes: LeyLineIntersectionNode[] = [];
  private renderCache: LeyLineLookupTable;
  private tilemapManager: SphericalTilemapManager;
  
  constructor(tilemapManager: SphericalTilemapManager) {
    this.tilemapManager = tilemapManager;
    this.renderCache = new LeyLineLookupTable();
    this.initializePlanetaryLeyLines();
  }
  
  private initializePlanetaryLeyLines(): void {
    // Generate major Earth ley line circles
    this.leyLineCircles = [
      ...this.generateEquatorialLeyLines(),
      ...this.generateMeridionalLeyLines(),
      ...this.generateObliqueLeyLines()
    ];
    
    // Calculate all intersection points
    this.intersectionNodes = this.calculateAllIntersections();
    
    // Pre-render all ley line paths
    this.renderCache.generateLookupTable(
      this.leyLineCircles,
      this.tilemapManager.coordinateManager.currentProjection
    );
  }
  
  private generateEquatorialLeyLines(): LeyLineCircle[] {
    return [{
      id: 'equatorial-primary',
      pole1: { lat: 0, lon: 0, alt: 0 },
      pole2: { lat: 0, lon: 180, alt: 0 },
      energy: 100,
      type: 'equatorial',
      stability: 'stable'
    }];
  }
  
  private generateMeridionalLeyLines(): LeyLineCircle[] {
    const meridians: LeyLineCircle[] = [];
    
    // 12 major meridional ley lines (every 30 degrees)
    for (let i = 0; i < 12; i++) {
      const longitude = i * 30;
      meridians.push({
        id: `meridional-${i}`,
        pole1: { lat: 90, lon: longitude, alt: 0 },
        pole2: { lat: -90, lon: longitude, alt: 0 },
        energy: 85 + Math.random() * 15,
        type: 'meridional',
        stability: Math.random() > 0.3 ? 'stable' : 'fluctuating'
      });
    }
    
    return meridians;
  }
  
  private generateObliqueLeyLines(): LeyLineCircle[] {
    // Additional diagonal ley lines for complex energy network
    return [
      {
        id: 'oblique-45n',
        pole1: { lat: 45, lon: 0, alt: 0 },
        pole2: { lat: -45, lon: 180, alt: 0 },
        energy: 70,
        type: 'oblique',
        stability: 'fluctuating'
      },
      {
        id: 'oblique-45s',
        pole1: { lat: 45, lon: 90, alt: 0 },
        pole2: { lat: -45, lon: 270, alt: 0 },
        energy: 65,
        type: 'oblique',
        stability: 'unstable'
      }
    ];
  }
  
  // Get ley line strength at any spherical coordinate
  getLeyLineStrength(coord: SphericalCoordinate): number {
    let maxStrength = 0;
    
    for (const leyLine of this.leyLineCircles) {
      const distanceToCircle = this.distanceToGreatCircle(coord, leyLine);
      const influence = Math.max(0, 100 - distanceToCircle * 0.01); // 1 meter = 0.01 strength loss
      const adjustedInfluence = influence * (leyLine.energy / 100);
      
      maxStrength = Math.max(maxStrength, adjustedInfluence);
    }
    
    return Math.min(100, maxStrength);
  }
  
  private distanceToGreatCircle(point: SphericalCoordinate, circle: LeyLineCircle): number {
    // Calculate shortest distance from point to great circle
    const pointVector = sphericalToCartesian(point, 1);
    const pole1Vector = sphericalToCartesian(circle.pole1, 1);
    const pole2Vector = sphericalToCartesian(circle.pole2, 1);
    
    // Great circle normal vector
    const normal = crossProduct(pole1Vector, pole2Vector);
    const normalizedNormal = normalizeVector(normal);
    
    // Distance from point to plane containing great circle
    const dotProduct = dotProduct3D(pointVector, normalizedNormal);
    const angleFromCircle = Math.acos(Math.abs(dotProduct));
    
    return angleFromCircle * 6371000; // Convert to meters
  }
  
  // Get rendered path for ley line in current projection
  getLeyLineRenderPath(leyLineId: string): FlatCoordinate[] {
    const leyLine = this.leyLineCircles.find(l => l.id === leyLineId);
    if (!leyLine) return [];
    
    return this.renderCache.getLeyLineRenderPath(leyLine);
  }
  
  // Find nearest ley line intersection node
  getNearestIntersectionNode(coord: SphericalCoordinate): LeyLineIntersectionNode | null {
    let nearest: LeyLineIntersectionNode | null = null;
    let minDistance = Infinity;
    
    for (const node of this.intersectionNodes) {
      const distance = greatCircleDistance(coord, node.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = node;
      }
    }
    
    return nearest;
  }
  
  private calculateAllIntersections(): LeyLineIntersectionNode[] {
    const nodes: LeyLineIntersectionNode[] = [];
    
    for (let i = 0; i < this.leyLineCircles.length; i++) {
      for (let j = i + 1; j < this.leyLineCircles.length; j++) {
        const intersections = greatCircleIntersection(
          this.leyLineCircles[i], 
          this.leyLineCircles[j]
        );
        
        intersections.forEach((position, index) => {
          nodes.push({
            id: `intersection_${this.leyLineCircles[i].id}_${this.leyLineCircles[j].id}_${index}`,
            position,
            energy: (this.leyLineCircles[i].energy + this.leyLineCircles[j].energy) / 2,
            connectedLeyLines: [this.leyLineCircles[i].id, this.leyLineCircles[j].id],
            type: 'intersection',
            stability: this.calculateIntersectionStability(this.leyLineCircles[i], this.leyLineCircles[j])
          });
        });
      }
    }
    
    return nodes;
  }
  
  private calculateIntersectionStability(
    circle1: LeyLineCircle, 
    circle2: LeyLineCircle
  ): 'stable' | 'fluctuating' | 'unstable' {
    if (circle1.stability === 'stable' && circle2.stability === 'stable') {
      return 'stable';
    } else if (circle1.stability === 'unstable' || circle2.stability === 'unstable') {
      return 'unstable';
    } else {
      return 'fluctuating';
    }
  }
}
```

### 5. Enhanced Minimap with Spherical Projection

Update the minimap to render spherical ley line circles:

```typescript
class SphericalMinimap extends Minimap {
  private projectionSystem: ProjectionSystem;
  private leyLineRenderer: AdaptiveGreatCircleRenderer;
  
  constructor(
    scene: Phaser.Scene,
    tilemapManager: SphericalTilemapManager,
    player: Phaser.GameObjects.Sprite,
    getEnemies: () => { x: number, y: number }[],
    width = 200,
    height = 60
  ) {
    super(scene, tilemapManager, player, getEnemies, width, height);
    this.projectionSystem = new EquirectangularProjection(); // Start with simple projection
    this.leyLineRenderer = new AdaptiveGreatCircleRenderer();
  }
  
  // Override ley line rendering for spherical awareness
  protected renderLeyLines(): void {
    if (!this.leyLineOverlayVisible || this.leyLines.length === 0) return;
    
    this.leyLineOverlay.clear();
    this.leyLineOverlay.lineStyle(2, 0x00ffff, 0.7);
    
    // Render each ley line circle as a curve
    for (const leyLine of this.leyLines) {
      if (leyLine.type === 'circle') {
        const renderPath = this.leyLineRenderer.renderGreatCircle(
          leyLine as LeyLineCircle,
          this.projectionSystem,
          2 // 2 pixel max deviation
        );
        
        this.renderCurvedPath(renderPath);
      } else {
        // Fallback to existing linear ley line rendering
        super.renderLeyLineSegments(leyLine);
      }
    }
    
    // Render intersection nodes
    this.renderIntersectionNodes();
  }
  
  private renderCurvedPath(path: FlatCoordinate[]): void {
    if (path.length < 2) return;
    
    // Scale to minimap coordinates
    const scaledPath = path.map(point => ({
      x: (point.x / TilemapManager.WORLD_WIDTH) * this.width,
      y: (point.y / TilemapManager.WORLD_HEIGHT) * this.height
    }));
    
    // Draw smooth curve through points
    this.leyLineOverlay.beginPath();
    this.leyLineOverlay.moveTo(scaledPath[0].x, scaledPath[0].y);
    
    for (let i = 1; i < scaledPath.length; i++) {
      this.leyLineOverlay.lineTo(scaledPath[i].x, scaledPath[i].y);
    }
    
    this.leyLineOverlay.strokePath();
  }
  
  private renderIntersectionNodes(): void {
    const leyLineManager = (this.tilemapManager as SphericalTilemapManager).leyLineCircleManager;
    const intersectionNodes = leyLineManager.getAllIntersectionNodes();
    
    for (const node of intersectionNodes) {
      const flatCoord = this.tilemapManager.getFlatCoordinate(node.position);
      const minimapX = (flatCoord.x / TilemapManager.WORLD_WIDTH) * this.width;
      const minimapY = (flatCoord.y / TilemapManager.WORLD_HEIGHT) * this.height;
      
      // Different colors based on stability
      const color = node.stability === 'stable' ? 0x00ff00 : 
                   node.stability === 'fluctuating' ? 0xffff00 : 0xff0000;
      
      this.leyLineOverlay.fillStyle(color, 0.8);
      this.leyLineOverlay.fillCircle(minimapX, minimapY, 4);
    }
  }
}
```

## Performance Optimization Strategy

### 1. Lazy Initialization
```typescript
class LazySphericalInitialization {
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;
  
  async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeSphericalSystems();
    }
    
    return this.initializationPromise;
  }
  
  private async initializeSphericalSystems(): Promise<void> {
    // Initialize heavy spherical calculations in background
    await this.precomputeLeyLineIntersections();
    await this.generateProjectionLookupTables();
    await this.cacheCommonCoordinateConversions();
    
    this.initialized = true;
  }
}
```

### 2. Level-of-Detail Rendering
```typescript
class SphericalLevelOfDetail {
  getLeyLineDetail(zoomLevel: number, leyLine: LeyLineCircle): number {
    // Fewer points for distant/overview rendering
    if (zoomLevel < 3) return 50;   // Global view
    if (zoomLevel < 6) return 200;  // Regional view
    return 1000;                    // Detailed view
  }
  
  shouldRenderLeyLine(leyLine: LeyLineCircle, viewBounds: SphericalBoundingBox): boolean {
    // Cull ley lines outside view
    return this.leyLineIntersectsBounds(leyLine, viewBounds);
  }
}
```

### 3. Incremental Conversion
```typescript
class IncrementalCoordinateConverter {
  private conversionQueue: ConversionTask[] = [];
  private maxConversionsPerFrame = 100;
  
  queueConversion(
    coord: SphericalCoordinate | FlatCoordinate,
    type: 'to-spherical' | 'to-flat',
    callback: (result: any) => void
  ): void {
    this.conversionQueue.push({ coord, type, callback });
  }
  
  processConversions(frameTime: number): void {
    const startTime = performance.now();
    let processed = 0;
    
    while (this.conversionQueue.length > 0 && 
           processed < this.maxConversionsPerFrame &&
           performance.now() - startTime < 1) { // 1ms budget
      
      const task = this.conversionQueue.shift()!;
      this.processConversionTask(task);
      processed++;
    }
  }
}
```

## Migration Strategy

### Phase 1: Foundation (Weeks 1-2)
1. Implement `CoordinateSystemManager` 
2. Create `SphericalTilemapManager` extending existing manager
3. Add basic coordinate conversion without changing existing APIs

### Phase 2: Ley Line Integration (Weeks 3-4)
1. Implement `PlanetaryLeyLineManager`
2. Generate great circle ley line network
3. Calculate intersection nodes

### Phase 3: Rendering Enhancement (Weeks 5-6)
1. Update minimap with spherical projection
2. Implement adaptive ley line rendering
3. Add performance optimizations

### Phase 4: Data Integration (Weeks 7-8)
1. Integrate real Earth elevation data
2. Add geological information processing
3. Validate against authentic sources

## Compatibility Guarantees

### Existing API Preservation
```typescript
// All existing methods continue to work exactly as before
const currentX = TilemapManager.wrapX(playerX);                    // ✓ Unchanged
const distance = TilemapManager.toroidalDistanceX(x1, x2);        // ✓ Unchanged
const chunk = chunkManager.loadChunk(chunkX, chunkY);             // ✓ Unchanged

// New spherical methods added alongside
const sphericalCoord = manager.getSphericalCoordinate(x, y);      // ✓ New
const sphericalDistance = manager.sphericalDistance(c1, c2);      // ✓ New
```

### Save File Compatibility
```typescript
interface SaveFileVersion {
  version: number;
  coordinateSystem: 'flat' | 'hybrid';
  migrationRequired: boolean;
}

class SaveFileMigration {
  static migrateToHybrid(oldSave: any): any {
    // Convert flat coordinates to hybrid system
    const newSave = { ...oldSave };
    newSave.coordinateSystem = 'hybrid';
    
    // Player position
    if (oldSave.player?.position) {
      newSave.player.position = {
        flat: oldSave.player.position,
        spherical: CoordinateConverter.flatToSpherical(oldSave.player.position)
      };
    }
    
    return newSave;
  }
}
```

## Success Metrics

### Performance Targets
- **Coordinate Conversion**: <10μs average, <50μs 99th percentile
- **Ley Line Rendering**: <5ms for complete global set at 1080p
- **Memory Overhead**: <100MB additional for spherical systems
- **Frame Rate Impact**: <5% reduction in worst case

### Accuracy Targets
- **Great Circle Accuracy**: <1 meter deviation over 10,000km distance
- **Ley Line Rendering**: <2 pixel deviation at standard zoom levels
- **Intersection Calculation**: <10 meter accuracy for ley line intersections

### Compatibility Targets
- **Existing Save Files**: 100% compatibility with automatic migration
- **Mod Compatibility**: 95% of existing mods work without changes
- **API Stability**: Zero breaking changes to existing public APIs

## Next Steps

The next document will detail the specific coordinate transformation layer implementation, including the mathematical algorithms and performance optimizations needed to achieve these architectural goals.
