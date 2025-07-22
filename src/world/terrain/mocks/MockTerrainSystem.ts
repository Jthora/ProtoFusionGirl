// MockTerrainSystem.ts
// Mock implementation of TerrainSystem for testing
// Provides realistic but deterministic terrain data

import {
  TerrainSystem,
  TerrainData,
  TerrainChunk,
  PlayerPosition,
  BiomeType,
  MaterialType,
  FeatureType
} from '../types';

export class MockTerrainSystem implements TerrainSystem {
  private initialized = false;
  private cache = new Map<string, TerrainData>();

  async initialize(): Promise<void> {
    this.initialized = true;
    // Simulate initialization time
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  async getTerrainAt(lat: number, lon: number, radius: number): Promise<TerrainData> {
    if (!this.initialized) {
      throw new Error('TerrainSystem not initialized');
    }

    // Normalize coordinates for wrapping world
    const normalizedLat = Math.max(-90, Math.min(90, lat));
    let normalizedLon = lon % 360;
    if (normalizedLon > 180) normalizedLon -= 360;
    if (normalizedLon < -180) normalizedLon += 360;

    // Create cache key
    const cacheKey = `${normalizedLat.toFixed(4)},${normalizedLon.toFixed(4)},${radius}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Simulate async data retrieval
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10));

    // Generate deterministic terrain data based on coordinates
    const terrainData = this.generateTerrainData(normalizedLat, normalizedLon, radius);
    
    // Cache the result
    this.cache.set(cacheKey, terrainData);
    
    return terrainData;
  }

  async streamChunksAround(playerPos: PlayerPosition): Promise<TerrainChunk[]> {
    if (!this.initialized) {
      throw new Error('TerrainSystem not initialized');
    }

    const chunks: TerrainChunk[] = [];
    const chunkSize = 1000; // 1km chunks
    const radius = 3; // 3x3 chunks around player

    const playerChunkX = Math.floor(playerPos.x / chunkSize);
    const playerChunkY = Math.floor(playerPos.y / chunkSize);

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const chunkX = playerChunkX + dx;
        const chunkY = playerChunkY + dy;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        const priority = Math.max(0, 10 - distance);

        const chunk: TerrainChunk = {
          id: `chunk_${chunkX}_${chunkY}`,
          bounds: {
            minX: chunkX * chunkSize,
            maxX: (chunkX + 1) * chunkSize,
            minY: chunkY * chunkSize,
            maxY: (chunkY + 1) * chunkSize,
            centerX: (chunkX + 0.5) * chunkSize,
            centerY: (chunkY + 0.5) * chunkSize
          },
          resolution: this.calculateResolutionForDistance(distance * chunkSize),
          tiles: [], // Would be populated with actual tile data
          loadedAt: Date.now(),
          priority: priority
        };

        chunks.push(chunk);
      }
    }

    return chunks;
  }

  cleanup(): void {
    this.cache.clear();
    this.initialized = false;
  }

  private generateTerrainData(lat: number, lon: number, _radius: number): TerrainData {
    // Generate deterministic elevation using simple noise function
    const elevation = this.generateElevation(lat, lon);
    
    // Calculate slope based on nearby elevations
    const slope = this.calculateSlope(lat, lon);
    
    // Calculate aspect (direction of steepest slope)
    const aspect = this.calculateAspect(lat, lon);
    
    // Classify biome based on elevation and latitude
    const biome = this.classifyBiome(elevation, lat);
    
    // Determine walkability
    const walkable = this.isWalkable(elevation, slope, biome);
    
    // Get materials for this biome
    const materials = this.getBiomeMaterials(biome);
    
    // Generate features based on terrain
    const features = this.generateFeatures(elevation, slope, biome, lat, lon);

    return {
      elevation,
      slope,
      aspect,
      biome,
      features,
      walkable,
      materials
    };
  }

  private generateElevation(lat: number, lon: number): number {
    // Simple pseudo-random elevation based on coordinates
    // This creates consistent "noise" patterns for realistic terrain
    
    const x = lon * Math.PI / 180;
    const y = lat * Math.PI / 180;
    
    // Multiple octaves of noise for realistic terrain
    let elevation = 0;
    let amplitude = 1000; // Base amplitude in meters
    let frequency = 0.01;
    
    for (let i = 0; i < 4; i++) {
      elevation += amplitude * Math.sin(x * frequency) * Math.cos(y * frequency);
      amplitude *= 0.5;
      frequency *= 2;
    }
    
    // Add some large-scale patterns
    elevation += 2000 * Math.sin(lat * Math.PI / 180 * 4); // Continental patterns
    elevation += 1000 * Math.cos(lon * Math.PI / 180 * 6); // Oceanic ridges
    
    // Special case for known mountain areas
    // Denver, Colorado area (39.7392, -104.9903) should be mountainous
    const denverLat = 39.7392;
    const denverLon = -104.9903;
    const distanceToDenver = Math.sqrt((lat - denverLat) ** 2 + (lon - denverLon) ** 2);
    if (distanceToDenver < 5) { // Within 5 degrees
      const baseBonus = 4500 * (1 - distanceToDenver / 5);
      // Add some higher frequency noise to create slope variation in mountain areas
      const mountainNoise = 1000 * Math.sin(lat * 100) * Math.cos(lon * 100);
      elevation += baseBonus + mountainNoise;
    }
    
    // Bias toward sea level for realistic distribution
    elevation = elevation * 0.3;
    
    // Ocean areas (very rough approximation) - but not at poles
    if (this.isOceanArea(lat, lon) && Math.abs(lat) < 85) {
      elevation = Math.min(elevation, -100 + Math.random() * 200);
    }
    
    return Math.round(elevation);
  }

  private calculateSlope(lat: number, lon: number): number {
    // Calculate slope by comparing elevation with nearby points
    const centerElevation = this.generateElevation(lat, lon);
    const deltaLat = 0.001; // Small offset for slope calculation
    const deltaLon = 0.001;
    
    const northElevation = this.generateElevation(lat + deltaLat, lon);
    const eastElevation = this.generateElevation(lat, lon + deltaLon);
    
    const dElevationNorth = northElevation - centerElevation;
    const dElevationEast = eastElevation - centerElevation;
    
    const distance = 111; // Approximate meters per 0.001 degrees
    const slopeRadians = Math.atan(Math.sqrt(
      (dElevationNorth / distance) ** 2 + 
      (dElevationEast / distance) ** 2
    ));
    
    return Math.round(slopeRadians * 180 / Math.PI * 10) / 10; // Round to 1 decimal
  }

  private calculateAspect(lat: number, lon: number): number {
    // Calculate aspect (direction of steepest slope)
    const centerElevation = this.generateElevation(lat, lon);
    const deltaLat = 0.001;
    const deltaLon = 0.001;
    
    const northElevation = this.generateElevation(lat + deltaLat, lon);
    const eastElevation = this.generateElevation(lat, lon + deltaLon);
    
    const dElevationNorth = northElevation - centerElevation;
    const dElevationEast = eastElevation - centerElevation;
    
    let aspect = Math.atan2(dElevationEast, dElevationNorth) * 180 / Math.PI;
    
    // Convert to 0-360 degrees
    if (aspect < 0) aspect += 360;
    
    return Math.round(aspect);
  }

  private classifyBiome(elevation: number, lat: number): BiomeType {
    const absLat = Math.abs(lat);
    
    // Ocean
    if (elevation < 0) {
      return BiomeType.Ocean;
    }
    
    // Arctic/Antarctic
    if (absLat > 66.5) {
      if (elevation > 1000) {
        return BiomeType.Alpine;
      }
      return BiomeType.Arctic;
    }
    
    // Mountain biomes
    if (elevation > 2500) {
      return BiomeType.Alpine;
    }
    if (elevation > 1500) {
      return BiomeType.Mountain;
    }
    
    // Latitude-based biomes
    if (absLat < 23.5) { // Tropics
      if (elevation < 200) {
        return BiomeType.Tropical;
      }
      return BiomeType.Rainforest;
    } else if (absLat < 40) { // Temperate
      if (elevation < 100) {
        return BiomeType.Plains;
      }
      return BiomeType.Forest;
    } else { // Cold temperate
      if (elevation < 100) {
        return BiomeType.Tundra;
      }
      return BiomeType.Forest;
    }
  }

  private isWalkable(_elevation: number, slope: number, biome: BiomeType): boolean {
    // Ocean is not walkable
    if (biome === BiomeType.Ocean) {
      return false;
    }
    
    // Very steep slopes are not walkable
    if (slope > 45) {
      return false;
    }
    
    // Most other terrain is walkable
    return true;
  }

  private getBiomeMaterials(biome: BiomeType): MaterialType[] {
    const materials: MaterialType[] = [];
    
    switch (biome) {
      case BiomeType.Ocean:
        materials.push(MaterialType.Water, MaterialType.Salt);
        break;
      case BiomeType.Mountain:
      case BiomeType.Alpine:
        materials.push(MaterialType.Stone, MaterialType.Metal, MaterialType.Crystal);
        break;
      case BiomeType.Forest:
      case BiomeType.Rainforest:
        materials.push(MaterialType.Wood, MaterialType.Organic);
        break;
      case BiomeType.Desert:
        materials.push(MaterialType.Sand, MaterialType.Stone);
        break;
      case BiomeType.Arctic:
        materials.push(MaterialType.Ice, MaterialType.Water);
        break;
      case BiomeType.Plains:
      case BiomeType.Grassland:
        materials.push(MaterialType.Organic, MaterialType.Clay);
        break;
      default:
        materials.push(MaterialType.Stone, MaterialType.Organic);
    }
    
    return materials;
  }

  private generateFeatures(
    elevation: number, 
    slope: number, 
    biome: BiomeType, 
    lat: number, 
    lon: number
  ): any[] {
    const features: any[] = [];
    
    // Deterministic feature generation based on coordinates
    const featureHash = Math.abs(Math.sin(lat * 7 + lon * 11) * 1000000);
    
    // Rivers in suitable terrain
    if (biome === BiomeType.Plains || biome === BiomeType.Forest) {
      if (featureHash % 100 < 5) { // 5% chance
        features.push({
          type: FeatureType.River,
          position: { x: lon, y: lat },
          properties: { width: 10 + (featureHash % 20) }
        });
      }
    }
    
    // Peaks in mountains
    if (biome === BiomeType.Mountain || biome === BiomeType.Alpine) {
      if (elevation > 3000 && featureHash % 100 < 10) {
        features.push({
          type: FeatureType.Peak,
          position: { x: lon, y: lat },
          properties: { prominence: elevation - 2000 }
        });
      }
    }
    
    // Caves in hilly terrain
    if (slope > 20 && elevation > 500 && featureHash % 100 < 3) {
      features.push({
        type: FeatureType.Cave,
        position: { x: lon, y: lat },
        properties: { depth: 10 + (featureHash % 50) }
      });
    }
    
    return features;
  }

  private isOceanArea(lat: number, lon: number): boolean {
    // Very rough approximation of major ocean areas
    // Pacific Ocean (excluding North America)
    if (lon < -120 && lon > -180) return true;
    if (lon > 120 && lon <= 180) return true;
    // Atlantic Ocean (excluding Americas and Europe/Africa)  
    if (lon > -50 && lon < -10 && lat < 60) return true;
    // Indian Ocean
    if (lon > 20 && lon < 120 && lat < 30 && lat > -50) return true;
    
    return false;
  }

  private calculateResolutionForDistance(distance: number): number {
    // Level of detail based on distance
    if (distance < 100) return 1;      // 1m resolution
    if (distance < 500) return 5;      // 5m resolution  
    if (distance < 2000) return 25;    // 25m resolution
    return 100;                        // 100m resolution for distant chunks
  }
}
