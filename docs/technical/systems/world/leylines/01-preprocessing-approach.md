# Pre-processed Ley Line Slices Approach

## Project: ProtoFusionGirl
**Date**: July 20, 2025  
**Approach**: Option 1 - Preprocessing  
**Complexity**: Low  
**Recommended**: ✅ **Best for MVP**

---

## 🎯 **Concept Overview**

Pre-process real-world terrain data into optimized ley line slices that can be efficiently delivered to web browsers. Each ley line becomes a lightweight data file containing essential terrain information.

## 🏗️ **Architecture**

### **Data Flow**
```
Raw Global Data → Preprocessing Tool → Optimized Ley Line Files → Game Client
    (25GB)              (Node.js)           (~200KB each)        (Browser)
```

### **File Structure**
```typescript
interface LeyLineTerrainData {
  metadata: {
    id: string;
    name: string;
    startCoord: [latitude: number, longitude: number];
    endCoord: [latitude: number, longitude: number];
    totalLength: number; // meters
    resolution: number;  // meters per sample
  };
  
  samples: TerrainSample[];
}

interface TerrainSample {
  distance: number;    // meters from start
  elevation: number;   // meters above sea level
  biome: BiomeType;    // terrain classification
  latitude: number;    // exact coordinates
  longitude: number;
  features?: string[]; // landmarks, cities, etc.
}
```

## 🔧 **Implementation Details**

### **Preprocessing Tool**
```typescript
class LeyLineTerrainProcessor {
  private readonly SAMPLE_RESOLUTION = 100; // meters between samples
  
  async generateLeyLineSlice(
    startLat: number, startLon: number,
    endLat: number, endLon: number,
    name: string
  ): Promise<LeyLineTerrainData> {
    
    console.log(`Processing ley line: ${name}`);
    
    const samples = this.calculateSamplePoints(
      startLat, startLon, endLat, endLon, this.SAMPLE_RESOLUTION
    );
    
    const terrainData: TerrainSample[] = [];
    
    for (const sample of samples) {
      const elevation = await this.getElevationAt(sample.lat, sample.lon);
      const biome = await this.getBiomeAt(sample.lat, sample.lon);
      const features = await this.getFeaturesAt(sample.lat, sample.lon);
      
      terrainData.push({
        distance: sample.distance,
        elevation,
        biome,
        latitude: sample.lat,
        longitude: sample.lon,
        features
      });
      
      // Progress indicator
      if (terrainData.length % 1000 === 0) {
        console.log(`Processed ${terrainData.length} samples...`);
      }
    }
    
    return {
      metadata: {
        id: this.generateId(startLat, startLon, endLat, endLon),
        name,
        startCoord: [startLat, startLon],
        endCoord: [endLat, endLon],
        totalLength: this.calculateDistance(startLat, startLon, endLat, endLon),
        resolution: this.SAMPLE_RESOLUTION
      },
      samples: terrainData
    };
  }
  
  private calculateSamplePoints(
    startLat: number, startLon: number,
    endLat: number, endLon: number,
    resolution: number
  ): Array<{lat: number, lon: number, distance: number}> {
    
    const totalDistance = this.calculateDistance(startLat, startLon, endLat, endLon);
    const numSamples = Math.ceil(totalDistance / resolution);
    const samples: Array<{lat: number, lon: number, distance: number}> = [];
    
    for (let i = 0; i <= numSamples; i++) {
      const ratio = i / numSamples;
      const lat = startLat + (endLat - startLat) * ratio;
      const lon = startLon + (endLon - startLon) * ratio;
      const distance = i * resolution;
      
      samples.push({ lat, lon, distance });
    }
    
    return samples;
  }
  
  private async getElevationAt(lat: number, lon: number): Promise<number> {
    // Use GEBCO or SRTM data
    return await this.elevationService.query(lat, lon);
  }
  
  private async getBiomeAt(lat: number, lon: number): Promise<BiomeType> {
    // Use climate data to determine biome
    return await this.biomeService.classify(lat, lon);
  }
}
```

### **Game Client Integration**
```typescript
class LeyLineTerrainManager {
  private loadedLeyLines = new Map<string, LeyLineTerrainData>();
  
  async loadLeyLine(leyLineId: string): Promise<LeyLineTerrainData> {
    if (this.loadedLeyLines.has(leyLineId)) {
      return this.loadedLeyLines.get(leyLineId)!;
    }
    
    const response = await fetch(`/data/leylines/${leyLineId}.json`);
    const leyLineData: LeyLineTerrainData = await response.json();
    
    this.loadedLeyLines.set(leyLineId, leyLineData);
    return leyLineData;
  }
  
  getTerrainAt(leyLineId: string, distance: number): TerrainSample | null {
    const leyLine = this.loadedLeyLines.get(leyLineId);
    if (!leyLine) return null;
    
    // Find closest sample
    const sample = leyLine.samples.find(s => 
      Math.abs(s.distance - distance) < leyLine.metadata.resolution / 2
    );
    
    return sample || null;
  }
  
  interpolateTerrainAt(leyLineId: string, distance: number): TerrainSample | null {
    const leyLine = this.loadedLeyLines.get(leyLineId);
    if (!leyLine) return null;
    
    // Find surrounding samples for interpolation
    const samples = leyLine.samples;
    const beforeIndex = samples.findIndex(s => s.distance > distance) - 1;
    const afterIndex = beforeIndex + 1;
    
    if (beforeIndex < 0 || afterIndex >= samples.length) return null;
    
    const before = samples[beforeIndex];
    const after = samples[afterIndex];
    const ratio = (distance - before.distance) / (after.distance - before.distance);
    
    return {
      distance,
      elevation: before.elevation + (after.elevation - before.elevation) * ratio,
      biome: ratio < 0.5 ? before.biome : after.biome,
      latitude: before.latitude + (after.latitude - before.latitude) * ratio,
      longitude: before.longitude + (after.longitude - before.longitude) * ratio,
      features: [...(before.features || []), ...(after.features || [])]
    };
  }
}
```

## 📊 **File Size Analysis**

### **Per Ley Line (Half-Earth: ~20,000km)**
```typescript
// Sample every 100 meters
const samplesPerLeyLine = 20_000_000 / 100; // 200,000 samples

interface CompactTerrainSample {
  distance: number;    // 4 bytes (float32)
  elevation: number;   // 2 bytes (int16, -32k to +32k meters)
  biome: number;       // 1 byte (enum)
  latitude: number;    // 4 bytes (float32)
  longitude: number;   // 4 bytes (float32)
  features: number;    // 1 byte (bitfield)
}
// = 16 bytes per sample

// Total per ley line: 200,000 × 16 = 3.2MB raw
// With compression (JSON.gz): ~800KB - 1.2MB
// With optimized binary format: ~400KB - 600KB
```

### **Compression Strategies**
```typescript
// Delta compression for coordinates
const compressedLeyLine = {
  metadata: leyLineData.metadata,
  elevationDeltas: Int16Array, // Delta-compressed elevations
  biomeRuns: Uint8Array,       // Run-length encoded biomes
  featureIndex: Map<number, string[]>, // Sparse feature storage
};

// Result: ~200KB per ley line after optimization
```

## ✅ **Advantages**

1. **Fastest Loading**: Pre-computed data loads instantly
2. **Predictable Performance**: Known file sizes and memory usage
3. **Offline Capable**: All data embedded in build
4. **Simple Implementation**: Straightforward data structures
5. **Quality Control**: Manual verification of terrain accuracy
6. **CDN Friendly**: Static files cacheable by CDN

## ❌ **Disadvantages**

1. **Storage Requirements**: Need space for all ley line files
2. **Update Complexity**: Requires rebuilding for terrain changes
3. **Limited Flexibility**: Fixed resolution and sample points
4. **Build Time**: Preprocessing can take hours for full dataset
5. **No Real-time Updates**: Cannot incorporate live geological data

## 🎯 **Best Use Cases**

- **MVP Development**: Get terrain system working quickly
- **Limited Bandwidth**: Predictable, small file sizes
- **Stable Terrain**: World doesn't change frequently
- **Quality Focus**: Want manually verified terrain accuracy

## 🚀 **Implementation Timeline**

### **Week 1**: Data Pipeline
- Set up GEBCO data access
- Build preprocessing tool
- Generate first test ley line

### **Week 2**: Game Integration
- Implement LeyLineTerrainManager
- Add terrain rendering
- Basic chunk streaming

### **Week 3**: Optimization
- Implement compression
- Add interpolation
- Performance testing

### **Week 4**: Multiple Ley Lines
- Process 3-5 major ley lines
- Implement ley line switching
- Quality assurance testing

---

**Next Steps**: If this approach is selected, begin with GEBCO data integration and build the preprocessing pipeline for a single test ley line.
