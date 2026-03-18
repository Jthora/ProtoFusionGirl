# Chunked Streaming with Level-of-Detail Approach

## Project: ProtoFusionGirl
**Date**: July 20, 2025  
**Approach**: Option 2 - Dynamic Streaming  
**Complexity**: High  
**Recommended**: 🔶 **Best for Scalability**

---

## 🎯 **Concept Overview**

Dynamically stream terrain data in chunks based on player position, using multiple levels-of-detail (LoD) to balance quality with performance. This approach provides unlimited world exploration with efficient memory usage.

## 🏗️ **Architecture**

### **Data Flow**
```
Global Terrain APIs → Chunk Cache → Level-of-Detail Engine → Game Renderer
     (Remote)         (Browser)        (Dynamic)            (1m tiles)
```

### **Level-of-Detail System**
```typescript
interface LoDLevel {
  distance: number;      // Distance from player (meters)
  resolution: number;    // Meters per sample
  chunkSize: number;     // Chunk dimensions (meters)
  priority: number;      // Loading priority
}

const LOD_LEVELS: LoDLevel[] = [
  { distance: 0,     resolution: 1,    chunkSize: 100,   priority: 1 },  // Ultra detail
  { distance: 100,   resolution: 10,   chunkSize: 500,   priority: 2 },  // High detail  
  { distance: 1000,  resolution: 100,  chunkSize: 2000,  priority: 3 },  // Medium detail
  { distance: 10000, resolution: 1000, chunkSize: 10000, priority: 4 },  // Low detail
];
```

## 🔧 **Implementation Details**

### **Chunk Manager**
```typescript
class PlanetaryChunkManager {
  private chunkCache = new Map<string, TerrainChunk>();
  private loadingQueue = new PriorityQueue<ChunkRequest>();
  private readonly MAX_CACHE_SIZE = 100; // chunks
  
  constructor(
    private terrainService: GlobalTerrainService,
    private player: PlayerPosition
  ) {}
  
  async update(): Promise<void> {
    // Calculate required chunks based on player position
    const requiredChunks = this.calculateRequiredChunks(
      this.player.latitude,
      this.player.longitude
    );
    
    // Queue missing chunks for loading
    for (const chunkId of requiredChunks) {
      if (!this.chunkCache.has(chunkId) && !this.isLoading(chunkId)) {
        const request = this.createChunkRequest(chunkId);
        this.loadingQueue.enqueue(request);
      }
    }
    
    // Process loading queue
    await this.processLoadingQueue();
    
    // Clean up distant chunks
    this.evictDistantChunks();
  }
  
  private calculateRequiredChunks(lat: number, lon: number): string[] {
    const chunks: string[] = [];
    
    for (const lod of LOD_LEVELS) {
      const radius = lod.distance + lod.chunkSize;
      const chunkIds = this.getChunksInRadius(lat, lon, radius, lod);
      chunks.push(...chunkIds);
    }
    
    return [...new Set(chunks)]; // Remove duplicates
  }
  
  private getChunksInRadius(
    centerLat: number, 
    centerLon: number, 
    radius: number, 
    lod: LoDLevel
  ): string[] {
    const chunks: string[] = [];
    const chunkSizeInDegrees = this.metersTodegrees(lod.chunkSize);
    
    // Calculate bounding box
    const latMin = centerLat - this.metersToLatitude(radius);
    const latMax = centerLat + this.metersToLatitude(radius);
    const lonMin = centerLon - this.metersToLongitude(radius, centerLat);
    const lonMax = centerLon + this.metersToLongitude(radius, centerLat);
    
    // Generate chunk grid
    for (let lat = latMin; lat <= latMax; lat += chunkSizeInDegrees) {
      for (let lon = lonMin; lon <= lonMax; lon += chunkSizeInDegrees) {
        const chunkId = this.generateChunkId(lat, lon, lod.resolution);
        chunks.push(chunkId);
      }
    }
    
    return chunks;
  }
  
  private async processLoadingQueue(): Promise<void> {
    const maxConcurrent = 3;
    const loading: Promise<void>[] = [];
    
    while (loading.length < maxConcurrent && !this.loadingQueue.isEmpty()) {
      const request = this.loadingQueue.dequeue()!;
      loading.push(this.loadChunk(request));
    }
    
    if (loading.length > 0) {
      await Promise.allSettled(loading);
    }
  }
  
  private async loadChunk(request: ChunkRequest): Promise<void> {
    try {
      console.log(`Loading chunk: ${request.chunkId}`);
      
      const chunkData = await this.terrainService.getChunkData(
        request.bounds,
        request.resolution
      );
      
      const chunk: TerrainChunk = {
        id: request.chunkId,
        bounds: request.bounds,
        resolution: request.resolution,
        data: chunkData,
        loadedAt: Date.now()
      };
      
      this.chunkCache.set(request.chunkId, chunk);
      
      // Trigger terrain update event
      this.onChunkLoaded(chunk);
      
    } catch (error) {
      console.error(`Failed to load chunk ${request.chunkId}:`, error);
      // Could implement retry logic here
    }
  }
  
  private evictDistantChunks(): void {
    if (this.chunkCache.size <= this.MAX_CACHE_SIZE) return;
    
    const playerPos = { lat: this.player.latitude, lon: this.player.longitude };
    
    // Sort chunks by distance from player
    const sortedChunks = Array.from(this.chunkCache.entries())
      .map(([id, chunk]) => ({
        id,
        chunk,
        distance: this.calculateDistance(playerPos, chunk.bounds.center)
      }))
      .sort((a, b) => b.distance - a.distance);
    
    // Remove furthest chunks
    const toRemove = sortedChunks.slice(this.MAX_CACHE_SIZE);
    for (const { id } of toRemove) {
      this.chunkCache.delete(id);
      this.onChunkEvicted(id);
    }
  }
  
  getTerrainAt(lat: number, lon: number): TerrainData | null {
    // Find best available chunk for this position
    const availableChunks = Array.from(this.chunkCache.values())
      .filter(chunk => this.isPositionInChunk(lat, lon, chunk))
      .sort((a, b) => a.resolution - b.resolution); // Prefer higher resolution
    
    if (availableChunks.length === 0) return null;
    
    const chunk = availableChunks[0];
    return this.interpolateTerrainFromChunk(lat, lon, chunk);
  }
}
```

### **Global Terrain Service**
```typescript
class GlobalTerrainService {
  private readonly GEBCO_API = 'https://www.gebco.net/data_and_products/gebco_web_services/';
  private readonly ELEVATION_API = 'https://api.open-elevation.com/api/v1/lookup';
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  async getChunkData(
    bounds: ChunkBounds, 
    resolution: number
  ): Promise<TerrainData[]> {
    
    // Check local cache first
    const cacheKey = this.generateCacheKey(bounds, resolution);
    const cached = await this.getFromCache(cacheKey);
    if (cached) return cached;
    
    // Generate sample points for this chunk
    const samplePoints = this.generateSampleGrid(bounds, resolution);
    
    // Fetch elevation data
    const elevationData = await this.batchElevationLookup(samplePoints);
    
    // Enhance with biome and feature data
    const terrainData = await this.enhanceWithBiomeData(elevationData);
    
    // Cache the result
    await this.saveToCache(cacheKey, terrainData);
    
    return terrainData;
  }
  
  private async batchElevationLookup(
    points: Array<{lat: number, lon: number}>
  ): Promise<ElevationData[]> {
    
    const batchSize = 100; // API limit
    const results: ElevationData[] = [];
    
    for (let i = 0; i < points.length; i += batchSize) {
      const batch = points.slice(i, i + batchSize);
      
      try {
        const response = await fetch(this.ELEVATION_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locations: batch })
        });
        
        const data = await response.json();
        results.push(...data.results);
        
        // Rate limiting
        await this.delay(100);
        
      } catch (error) {
        console.warn(`Batch elevation lookup failed:`, error);
        // Fill with estimated values
        results.push(...this.estimateElevations(batch));
      }
    }
    
    return results;
  }
  
  private generateSampleGrid(
    bounds: ChunkBounds, 
    resolution: number
  ): Array<{lat: number, lon: number}> {
    
    const points: Array<{lat: number, lon: number}> = [];
    const latStep = this.metersToLatitude(resolution);
    const lonStep = this.metersToLongitude(resolution, bounds.center.lat);
    
    for (let lat = bounds.south; lat <= bounds.north; lat += latStep) {
      for (let lon = bounds.west; lon <= bounds.east; lon += lonStep) {
        points.push({ lat, lon });
      }
    }
    
    return points;
  }
}
```

## 📊 **Memory Management**

### **Chunk Size Optimization**
```typescript
interface ChunkMetrics {
  lodLevel: number;
  chunkSize: number;    // meters
  resolution: number;   // meters per sample
  sampleCount: number;  // total samples in chunk
  memoryUsage: number;  // bytes
}

const CHUNK_METRICS: ChunkMetrics[] = [
  { lodLevel: 0, chunkSize: 100,   resolution: 1,    sampleCount: 10000,  memoryUsage: 160000 },  // 160KB
  { lodLevel: 1, chunkSize: 500,   resolution: 10,   sampleCount: 2500,   memoryUsage: 40000 },   // 40KB
  { lodLevel: 2, chunkSize: 2000,  resolution: 100,  sampleCount: 400,    memoryUsage: 6400 },    // 6.4KB
  { lodLevel: 3, chunkSize: 10000, resolution: 1000, sampleCount: 100,    memoryUsage: 1600 },    // 1.6KB
];

// Total memory for typical view distance (10km radius):
// LoD 0: ~25 chunks × 160KB = 4MB
// LoD 1: ~16 chunks × 40KB = 640KB  
// LoD 2: ~4 chunks × 6.4KB = 25.6KB
// LoD 3: ~1 chunk × 1.6KB = 1.6KB
// Total: ~4.7MB for full detail
```

## ✅ **Advantages**

1. **Unlimited Exploration**: Can traverse entire planet
2. **Memory Efficient**: Only loads what's needed
3. **Adaptive Quality**: Detail scales with distance
4. **Real-time Updates**: Can incorporate live data
5. **Flexible Resolution**: Adjustable quality settings
6. **Future-proof**: Supports new data sources

## ❌ **Disadvantages**

1. **Complex Implementation**: Significant development effort
2. **Network Dependencies**: Requires reliable internet
3. **Loading Delays**: Terrain may not be immediately available
4. **API Costs**: External data services may charge fees
5. **Cache Management**: Complex eviction strategies
6. **Quality Variance**: Dependent on external data quality

## 🎯 **Best Use Cases**

- **Open World Exploration**: Unlimited travel distance
- **Live World Events**: Real-time geological changes
- **Scientific Accuracy**: Always up-to-date terrain data
- **Multiplayer Worlds**: Shared, consistent terrain

## 🚀 **Implementation Timeline**

### **Month 1**: Core Architecture
- Implement chunk management system
- Set up terrain data APIs
- Basic LoD switching

### **Month 2**: Optimization
- Memory management
- Cache strategies
- Performance tuning

### **Month 3**: Quality & Features**
- Biome integration
- Feature detection
- Error handling

### **Month 4**: Polish & Testing**
- Stress testing
- Quality assurance
- Documentation

---

**Next Steps**: If this approach is selected, begin with the chunk management architecture and a single LoD level for prototyping.
