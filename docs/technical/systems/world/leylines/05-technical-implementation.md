# Technical Implementation Guide

## Project: ProtoFusionGirl
**Date**: July 20, 2025  
**Document**: Technical Implementation  
**Status**: Architecture Design

---

## 🏗️ **System Architecture**

### **Core Components**
```typescript
// Main terrain system interface
interface TerrainSystem {
  initialize(): Promise<void>;
  getTerrainAt(lat: number, lon: number, radius: number): Promise<TerrainData>;
  streamChunksAround(playerPos: PlayerPosition): Promise<TerrainChunk[]>;
  cleanup(): void;
}

// Terrain data structure
interface TerrainData {
  elevation: number;
  slope: number;
  aspect: number;
  biome: BiomeType;
  features: Feature[];
  walkable: boolean;
  materials: MaterialType[];
}

// Chunk structure for streaming
interface TerrainChunk {
  id: string;
  bounds: GeoBounds;
  resolution: number;
  tiles: TerrainTile[];
  loadedAt: number;
  priority: number;
}
```

### **Class Hierarchy**
```
TerrainSystem (Abstract)
├── PreprocessedTerrainSystem
├── StreamingTerrainSystem  
└── HybridTerrainSystem

TerrainDataSource (Abstract)
├── GEBCODataSource
├── SRTMDataSource
├── OpenElevationAPISource
└── ProceduralDataSource

ChunkManager
├── ChunkCache
├── ChunkLoader
└── ChunkEviction
```

---

## 💾 **Data Structures & Storage**

### **Optimized Tile Format**
```typescript
// Compact tile representation (16 bytes per tile)
class CompactTerrainTile {
  constructor(
    public x: number,          // 4 bytes - world X coordinate  
    public y: number,          // 4 bytes - world Y coordinate
    public elevation: number,  // 2 bytes - elevation (int16, ±32km range)
    public slope: number,      // 1 byte - slope angle (0-90 degrees)
    public biome: number,      // 1 byte - biome enum
    public features: number,   // 1 byte - feature bitfield
    public materials: number,  // 1 byte - material bitfield
    public walkable: boolean,  // 1 bit
    public reserved: number    // 7 bits - future use
  ) {}
  
  // Pack into binary format for storage/transmission
  pack(): ArrayBuffer {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    
    view.setFloat32(0, this.x);
    view.setFloat32(4, this.y);
    view.setInt16(8, this.elevation);
    view.setUint8(10, this.slope);
    view.setUint8(11, this.biome);
    view.setUint8(12, this.features);
    view.setUint8(13, this.materials);
    view.setUint8(14, this.walkable ? 1 : 0);
    view.setUint8(15, this.reserved);
    
    return buffer;
  }
  
  // Unpack from binary format
  static unpack(buffer: ArrayBuffer): CompactTerrainTile {
    const view = new DataView(buffer);
    
    return new CompactTerrainTile(
      view.getFloat32(0),   // x
      view.getFloat32(4),   // y
      view.getInt16(8),     // elevation
      view.getUint8(10),    // slope
      view.getUint8(11),    // biome
      view.getUint8(12),    // features
      view.getUint8(13),    // materials
      view.getUint8(14) === 1, // walkable
      view.getUint8(15)     // reserved
    );
  }
}
```

### **Spatial Indexing**
```typescript
class SpatialIndex {
  private quadTree: QuadTree<TerrainChunk>;
  private tileMap = new Map<string, TerrainTile>();
  
  constructor(bounds: GeoBounds) {
    this.quadTree = new QuadTree(bounds, 10); // max 10 items per node
  }
  
  insert(chunk: TerrainChunk): void {
    this.quadTree.insert({
      bounds: chunk.bounds,
      data: chunk
    });
    
    // Index individual tiles for fast lookup
    for (const tile of chunk.tiles) {
      const key = `${tile.x},${tile.y}`;
      this.tileMap.set(key, tile);
    }
  }
  
  query(bounds: GeoBounds): TerrainChunk[] {
    return this.quadTree.query(bounds).map(item => item.data);
  }
  
  getTileAt(x: number, y: number): TerrainTile | null {
    const key = `${Math.floor(x)},${Math.floor(y)}`;
    return this.tileMap.get(key) || null;
  }
}
```

### **Memory-Mapped Storage**
```typescript
class TerrainStorage {
  private readonly CHUNK_SIZE = 1000; // 1km chunks
  private readonly TILE_SIZE = 16;    // bytes per tile
  private storage: ArrayBuffer[];
  
  constructor(private maxMemory: number = 100 * 1024 * 1024) { // 100MB default
    this.storage = [];
  }
  
  async storeChunk(chunk: TerrainChunk): Promise<void> {
    // Calculate memory needed
    const memoryNeeded = chunk.tiles.length * this.TILE_SIZE;
    
    // Ensure we have space
    await this.ensureSpace(memoryNeeded);
    
    // Pack tiles into binary format
    const buffer = new ArrayBuffer(memoryNeeded);
    const uint8View = new Uint8Array(buffer);
    
    for (let i = 0; i < chunk.tiles.length; i++) {
      const tileBuffer = chunk.tiles[i].pack();
      const offset = i * this.TILE_SIZE;
      uint8View.set(new Uint8Array(tileBuffer), offset);
    }
    
    // Store with metadata
    this.storage.push(buffer);
    this.updateIndex(chunk.id, this.storage.length - 1);
  }
  
  private async ensureSpace(needed: number): Promise<void> {
    let currentUsage = this.getCurrentMemoryUsage();
    
    while (currentUsage + needed > this.maxMemory) {
      await this.evictOldestChunk();
      currentUsage = this.getCurrentMemoryUsage();
    }
  }
}
```

---

## 🚀 **Performance Optimizations**

### **Level-of-Detail (LoD) System**
```typescript
class LevelOfDetailManager {
  private readonly LOD_DISTANCES = [100, 500, 2000, 10000]; // meters
  private readonly LOD_RESOLUTIONS = [1, 5, 25, 100];       // meters per tile
  
  calculateLOD(distanceFromPlayer: number): number {
    for (let i = 0; i < this.LOD_DISTANCES.length; i++) {
      if (distanceFromPlayer <= this.LOD_DISTANCES[i]) {
        return i;
      }
    }
    return this.LOD_DISTANCES.length - 1; // Furthest LOD
  }
  
  getRequiredResolution(lod: number): number {
    return this.LOD_RESOLUTIONS[lod] || this.LOD_RESOLUTIONS[0];
  }
  
  shouldUpdateLOD(
    chunk: TerrainChunk, 
    playerDistance: number
  ): boolean {
    const currentLOD = this.calculateLODFromResolution(chunk.resolution);
    const requiredLOD = this.calculateLOD(playerDistance);
    
    return currentLOD !== requiredLOD;
  }
}
```

### **Async Chunk Loading with Priority Queue**
```typescript
class PriorityChunkLoader {
  private loadingQueue = new PriorityQueue<ChunkLoadRequest>();
  private activeLoads = new Map<string, Promise<TerrainChunk>>();
  private readonly MAX_CONCURRENT = 3;
  
  async requestChunk(
    chunkId: string, 
    priority: number,
    bounds: GeoBounds
  ): Promise<TerrainChunk> {
    
    // Check if already loading
    if (this.activeLoads.has(chunkId)) {
      return this.activeLoads.get(chunkId)!;
    }
    
    // Create load request
    const request: ChunkLoadRequest = {
      chunkId,
      priority,
      bounds,
      requestTime: Date.now()
    };
    
    // Queue for loading
    this.loadingQueue.enqueue(request);
    
    // Process queue
    this.processQueue();
    
    // Return promise that resolves when chunk is loaded
    return new Promise((resolve, reject) => {
      this.addLoadListener(chunkId, resolve, reject);
    });
  }
  
  private async processQueue(): Promise<void> {
    while (
      this.activeLoads.size < this.MAX_CONCURRENT && 
      !this.loadingQueue.isEmpty()
    ) {
      const request = this.loadingQueue.dequeue()!;
      const loadPromise = this.loadChunk(request);
      
      this.activeLoads.set(request.chunkId, loadPromise);
      
      // Remove from active when complete
      loadPromise.finally(() => {
        this.activeLoads.delete(request.chunkId);
        this.processQueue(); // Continue processing
      });
    }
  }
}
```

### **Terrain Interpolation**
```typescript
class TerrainInterpolator {
  // Bilinear interpolation for smooth terrain
  static bilinearInterpolate(
    x: number, y: number,
    x1: number, y1: number, v11: number,
    x2: number, y1: number, v21: number,
    x1: number, y2: number, v12: number,
    x2: number, y2: number, v22: number
  ): number {
    
    const fx1 = ((x2 - x) / (x2 - x1)) * v11 + ((x - x1) / (x2 - x1)) * v21;
    const fx2 = ((x2 - x) / (x2 - x1)) * v12 + ((x - x1) / (x2 - x1)) * v22;
    
    return ((y2 - y) / (y2 - y1)) * fx1 + ((y - y1) / (y2 - y1)) * fx2;
  }
  
  // Smooth elevation transitions between chunks
  static smoothChunkBoundaries(
    chunk1: TerrainChunk,
    chunk2: TerrainChunk,
    blendWidth: number = 10 // meters
  ): void {
    
    const boundary = this.findSharedBoundary(chunk1, chunk2);
    if (!boundary) return;
    
    // Create blend zone
    for (const tile of [...chunk1.tiles, ...chunk2.tiles]) {
      const distanceToBoundary = this.distanceToLine(tile.position, boundary);
      
      if (distanceToBoundary <= blendWidth) {
        const blendFactor = distanceToBoundary / blendWidth;
        const neighborElevation = this.getNeighborElevation(tile, boundary);
        
        // Blend elevations
        tile.elevation = this.lerp(
          tile.elevation,
          neighborElevation,
          1 - blendFactor
        );
      }
    }
  }
}
```

---

## 🔧 **Integration Points**

### **Phaser Integration**
```typescript
class PhaserTerrainRenderer {
  private terrainLayer: Phaser.GameObjects.Graphics;
  private tileTextures = new Map<BiomeType, Phaser.Textures.Texture>();
  
  constructor(private scene: Phaser.Scene) {
    this.terrainLayer = scene.add.graphics();
    this.loadTileTextures();
  }
  
  renderChunk(chunk: TerrainChunk, camera: Phaser.Cameras.Scene2D.Camera): void {
    this.terrainLayer.clear();
    
    for (const tile of chunk.tiles) {
      // Frustum culling
      if (!this.isInCameraView(tile, camera)) continue;
      
      // Get appropriate texture for biome
      const texture = this.tileTextures.get(tile.biome);
      if (!texture) continue;
      
      // Calculate screen position
      const screenPos = this.worldToScreen(tile.worldPosition, camera);
      
      // Apply height-based shading
      const heightShade = this.calculateHeightShading(tile.elevation);
      
      // Render tile
      this.terrainLayer.fillStyle(heightShade);
      this.terrainLayer.fillRect(
        screenPos.x, screenPos.y,
        tile.size, tile.size
      );
    }
  }
  
  private calculateHeightShading(elevation: number): number {
    // Convert elevation to brightness
    const seaLevel = 0;
    const maxElevation = 8848; // Mount Everest
    const minElevation = -11034; // Mariana Trench
    
    let brightness: number;
    if (elevation >= seaLevel) {
      brightness = 0.5 + (elevation / maxElevation) * 0.5;
    } else {
      brightness = 0.5 + (elevation / minElevation) * 0.5;
    }
    
    brightness = Math.max(0.1, Math.min(1.0, brightness));
    const color = Math.floor(brightness * 255);
    
    return Phaser.Display.Color.GetColor32(color, color, color, 255);
  }
}
```

### **Player Movement Integration**
```typescript
class TerrainAwareMovement {
  constructor(
    private terrainSystem: TerrainSystem,
    private player: Phaser.Physics.Arcade.Sprite
  ) {}
  
  async updatePlayerPosition(): Promise<void> {
    const playerLat = this.screenToLatitude(this.player.y);
    const playerLon = this.screenToLongitude(this.player.x);
    
    // Get terrain data at player position
    const terrainData = await this.terrainSystem.getTerrainAt(
      playerLat, playerLon, 5 // 5 meter radius
    );
    
    if (terrainData) {
      // Adjust player elevation to match terrain
      const terrainElevation = terrainData.elevation;
      this.player.z = terrainElevation; // If using 3D
      
      // Apply terrain-based movement penalties
      this.applyTerrainEffects(terrainData);
      
      // Check for water/impassable terrain
      if (!terrainData.walkable) {
        this.handleImpassableTerrain(terrainData);
      }
    }
  }
  
  private applyTerrainEffects(terrain: TerrainData): void {
    const baseMoveSpeed = 200; // pixels per second
    let moveSpeedMultiplier = 1.0;
    
    // Adjust speed based on slope
    if (terrain.slope > 30) {
      moveSpeedMultiplier *= 0.7; // Steep terrain is slower
    }
    
    // Adjust speed based on biome
    switch (terrain.biome) {
      case BiomeType.Desert:
        moveSpeedMultiplier *= 0.8; // Sand is harder to walk on
        break;
      case BiomeType.Swamp:
        moveSpeedMultiplier *= 0.5; // Very slow movement
        break;
      case BiomeType.Snow:
        moveSpeedMultiplier *= 0.6; // Snow slows movement
        break;
    }
    
    // Apply speed adjustment
    this.player.setMaxVelocity(baseMoveSpeed * moveSpeedMultiplier);
  }
}
```

---

## 🧪 **Testing Framework**

### **Unit Tests**
```typescript
describe('TerrainSystem', () => {
  let terrainSystem: TerrainSystem;
  
  beforeEach(() => {
    terrainSystem = new HybridTerrainSystem();
  });
  
  test('should calculate correct tile coordinates', () => {
    const lat = 40.7128; // New York
    const lon = -74.0060;
    
    const tile = terrainSystem.getTileAt(lat, lon);
    
    expect(tile.x).toBeCloseTo(584394, 0); // UTM coordinates
    expect(tile.y).toBeCloseTo(4507527, 0);
  });
  
  test('should interpolate elevation correctly', () => {
    const elevation = terrainSystem.interpolateElevation(
      40.7128, -74.0060, // Position
      [
        { lat: 40.71, lon: -74.01, elevation: 10 },
        { lat: 40.72, lon: -74.00, elevation: 20 },
        { lat: 40.71, lon: -74.00, elevation: 15 },
        { lat: 40.72, lon: -74.01, elevation: 25 }
      ]
    );
    
    expect(elevation).toBeCloseTo(17.5, 1);
  });
});
```

### **Performance Benchmarks**
```typescript
class TerrainPerformanceBenchmark {
  async runBenchmarks(): Promise<BenchmarkResults> {
    const results: BenchmarkResults = {};
    
    // Test chunk loading performance
    results.chunkLoading = await this.benchmarkChunkLoading();
    
    // Test terrain lookup performance
    results.terrainLookup = await this.benchmarkTerrainLookup();
    
    // Test memory usage
    results.memoryUsage = await this.benchmarkMemoryUsage();
    
    return results;
  }
  
  private async benchmarkChunkLoading(): Promise<number> {
    const startTime = performance.now();
    
    for (let i = 0; i < 100; i++) {
      await this.terrainSystem.loadChunk(
        Math.random() * 180 - 90,  // Random latitude
        Math.random() * 360 - 180  // Random longitude
      );
    }
    
    const endTime = performance.now();
    return (endTime - startTime) / 100; // Average time per chunk
  }
}
```

---

**Next Steps**: Select specific implementation approach and begin developing the core terrain system components based on chosen strategy.
