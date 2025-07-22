// HybridTerrainSystem.ts
// Real implementation of the Hybrid Terrain System
// Combines real-world elevation data with procedural enhancement

import {
  TerrainSystem,
  TerrainData,
  TerrainChunk,
  PlayerPosition,
  BiomeType,
  FeatureType,
  TerrainDataSource,
  TerrainCache,
  CoordinateConverter,
  BiomeClassifier
} from './types';
import { TilemapManager } from '../tilemap/TilemapManager';

export class HybridTerrainSystem implements TerrainSystem {
  private initialized = false;
  private dataSources: TerrainDataSource[] = [];
  private cache: TerrainCache;
  private coordinateConverter: CoordinateConverter;
  private biomeClassifier: BiomeClassifier;
  private tilemapManager?: TilemapManager;

  constructor(
    cache: TerrainCache,
    coordinateConverter: CoordinateConverter,
    biomeClassifier: BiomeClassifier,
    tilemapManager?: TilemapManager
  ) {
    this.cache = cache;
    this.coordinateConverter = coordinateConverter;
    this.biomeClassifier = biomeClassifier;
    this.tilemapManager = tilemapManager;
  }

  async initialize(): Promise<void> {
    // Initialize data sources
    // For now, start with mock data - will be replaced with real sources
    console.log('HybridTerrainSystem: Initializing...');
    
    // TODO: Initialize GEBCO data source
    // TODO: Initialize SRTM data source for high detail areas
    // TODO: Initialize procedural data source for enhancement
    
    this.initialized = true;
    console.log('HybridTerrainSystem: Initialized successfully');
  }

  async getTerrainAt(lat: number, lon: number, radius: number): Promise<TerrainData> {
    if (!this.initialized) {
      throw new Error('HybridTerrainSystem not initialized');
    }

    // Convert to world coordinates if using TilemapManager
    // Note: coords will be used for tile-based lookups in future enhancement
    // const coords = this.coordinateConverter.latLonToTile(lat, lon);

    // Generate cache key
    const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)},${radius}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Get base elevation from data sources
    const elevation = await this.getElevationFromSources(lat, lon);
    
    // Calculate terrain properties
    const slope = await this.calculateSlope(lat, lon);
    const aspect = await this.calculateAspect(lat, lon);
    
    // Classify biome
    const biome = this.biomeClassifier.classifyBiome(elevation, lat);
    
    // Determine walkability
    const walkable = this.biomeClassifier.isBiomeWalkable(biome) && slope < 45;
    
    // Get materials
    const materials = this.biomeClassifier.getBiomeMaterials(biome);
    
    // Generate features
    const features = await this.generateFeatures(elevation, slope, biome, lat, lon);

    const terrainData: TerrainData = {
      elevation,
      slope,
      aspect,
      biome,
      features,
      walkable,
      materials
    };

    // Cache the result
    this.cache.set(cacheKey, terrainData);

    return terrainData;
  }

  async streamChunksAround(playerPos: PlayerPosition): Promise<TerrainChunk[]> {
    if (!this.initialized) {
      throw new Error('HybridTerrainSystem not initialized');
    }

    const chunks: TerrainChunk[] = [];
    const chunkSize = 1000; // 1km chunks
    const radius = 2; // 2 chunks in each direction

    // Convert player position to lat/lon if needed
    // Note: Will be used for geographic-based chunk generation in future enhancement
    // const { lat, lon } = this.coordinateConverter.tileToLatLon(playerPos.x, playerPos.y);

    // Calculate chunk coordinates
    const centerChunkX = Math.floor(playerPos.x / chunkSize);
    const centerChunkY = Math.floor(playerPos.y / chunkSize);

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const chunkX = centerChunkX + dx;
        const chunkY = centerChunkY + dy;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        const priority = Math.max(0, 10 - distance);

        // Calculate LoD based on distance
        const resolution = this.calculateLoDResolution(distance * chunkSize);

        const chunk: TerrainChunk = {
          id: `terrain_chunk_${chunkX}_${chunkY}`,
          bounds: {
            minX: chunkX * chunkSize,
            maxX: (chunkX + 1) * chunkSize,
            minY: chunkY * chunkSize,
            maxY: (chunkY + 1) * chunkSize,
            centerX: (chunkX + 0.5) * chunkSize,
            centerY: (chunkY + 0.5) * chunkSize
          },
          resolution,
          tiles: [], // Will be populated when chunk is loaded
          loadedAt: Date.now(),
          priority
        };

        chunks.push(chunk);
      }
    }

    return chunks;
  }

  cleanup(): void {
    this.cache.clear();
    this.dataSources = [];
    this.initialized = false;
  }

  // Add data source to the system
  addDataSource(dataSource: TerrainDataSource): void {
    this.dataSources.push(dataSource);
    // Sort by priority (higher resolution = higher priority for local queries)
    this.dataSources.sort((a, b) => a.getResolution() - b.getResolution());
  }

  // Integration with existing TilemapManager
  integrateWithTilemapManager(tilemapManager: TilemapManager): void {
    this.tilemapManager = tilemapManager;
    
    // Register as a hook for chunk generation enhancement
    if (tilemapManager.worldGen) {
      const originalGenerateChunk = tilemapManager.worldGen.generateChunk.bind(tilemapManager.worldGen);
      
      tilemapManager.worldGen.generateChunk = async (chunkX: number, chunkY: number, worldMeta?: any) => {
        // Generate base chunk
        const baseChunk = originalGenerateChunk(chunkX, chunkY, worldMeta);
        
        // Enhance with terrain data
        return await this.enhanceChunkWithTerrain(baseChunk, chunkX, chunkY);
      };
    }
  }

  // Private helper methods
  private async getElevationFromSources(lat: number, lon: number): Promise<number> {
    // Try data sources in order of resolution (best first)
    for (const source of this.dataSources) {
      if (source.hasDataAt(lat, lon)) {
        return await source.getElevation(lat, lon);
      }
    }
    
    // Fallback to procedural generation
    return this.generateProceduralElevation(lat, lon);
  }

  private async calculateSlope(lat: number, lon: number): Promise<number> {
    const deltaLat = 0.001; // Small offset for slope calculation
    const deltaLon = 0.001;
    
    const centerElevation = await this.getElevationFromSources(lat, lon);
    const northElevation = await this.getElevationFromSources(lat + deltaLat, lon);
    const eastElevation = await this.getElevationFromSources(lat, lon + deltaLon);
    
    const dElevationNorth = northElevation - centerElevation;
    const dElevationEast = eastElevation - centerElevation;
    
    const distance = 111; // Approximate meters per 0.001 degrees
    const slopeRadians = Math.atan(Math.sqrt(
      (dElevationNorth / distance) ** 2 + 
      (dElevationEast / distance) ** 2
    ));
    
    return Math.round(slopeRadians * 180 / Math.PI * 10) / 10;
  }

  private async calculateAspect(lat: number, lon: number): Promise<number> {
    const deltaLat = 0.001;
    const deltaLon = 0.001;
    
    const centerElevation = await this.getElevationFromSources(lat, lon);
    const northElevation = await this.getElevationFromSources(lat + deltaLat, lon);
    const eastElevation = await this.getElevationFromSources(lat, lon + deltaLon);
    
    const dElevationNorth = northElevation - centerElevation;
    const dElevationEast = eastElevation - centerElevation;
    
    let aspect = Math.atan2(dElevationEast, dElevationNorth) * 180 / Math.PI;
    
    // Convert to 0-360 degrees
    if (aspect < 0) aspect += 360;
    
    return Math.round(aspect);
  }

  private async generateFeatures(
    elevation: number,
    _slope: number,
    biome: BiomeType,
    lat: number,
    lon: number
  ): Promise<any[]> {
    const features: any[] = [];
    
    // Simple deterministic feature generation
    const featureHash = Math.abs(Math.sin(lat * 7 + lon * 11) * 1000000);
    
    // Rivers in suitable terrain
    if (biome === BiomeType.Plains || biome === BiomeType.Forest) {
      if (featureHash % 100 < 5) {
        features.push({
          type: FeatureType.River,
          position: { x: lon, y: lat },
          properties: { width: 10 + (featureHash % 20) }
        });
      }
    }
    
    // Mountain peaks
    if (biome === BiomeType.Mountain && elevation > 3000) {
      if (featureHash % 100 < 15) {
        features.push({
          type: FeatureType.Peak,
          position: { x: lon, y: lat },
          properties: { prominence: elevation - 2000 }
        });
      }
    }
    
    return features;
  }

  private generateProceduralElevation(lat: number, lon: number): number {
    // Fallback procedural elevation generation
    const x = lon * Math.PI / 180;
    const y = lat * Math.PI / 180;
    
    let elevation = 0;
    let amplitude = 1000;
    let frequency = 0.01;
    
    for (let i = 0; i < 3; i++) {
      elevation += amplitude * Math.sin(x * frequency) * Math.cos(y * frequency);
      amplitude *= 0.5;
      frequency *= 2;
    }
    
    return Math.round(elevation * 0.3);
  }

  private calculateLoDResolution(distance: number): number {
    if (distance < 500) return 1;      // 1m resolution
    if (distance < 2000) return 5;     // 5m resolution
    if (distance < 5000) return 25;    // 25m resolution
    return 100;                        // 100m resolution
  }

  private async enhanceChunkWithTerrain(baseChunk: any, chunkX: number, chunkY: number): Promise<any> {
    // Enhance existing chunk generation with terrain awareness
    if (!this.tilemapManager || !baseChunk) {
      return baseChunk;
    }

    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    const tileSize = 16; // Assuming 16-unit tiles

    // Calculate world position for this chunk
    const worldX = chunkX * chunkSize * tileSize;
    const worldY = chunkY * chunkSize * tileSize;

    // Convert to lat/lon
    const { lat, lon } = this.coordinateConverter.tileToLatLon(worldX, worldY);

    // Get terrain data for chunk center
    const terrainData = await this.getTerrainAt(lat, lon, chunkSize * tileSize);

    // Modify chunk based on terrain data
    if (terrainData.biome === BiomeType.Ocean) {
      // Replace surface tiles with water
      for (let x = 0; x < baseChunk.tiles.length; x++) {
        for (let y = 0; y < baseChunk.tiles[x].length; y++) {
          if (baseChunk.tiles[x][y] === 'grass') {
            baseChunk.tiles[x][y] = 'water';
          }
        }
      }
    } else if (terrainData.biome === BiomeType.Desert) {
      // Replace grass with sand
      for (let x = 0; x < baseChunk.tiles.length; x++) {
        for (let y = 0; y < baseChunk.tiles[x].length; y++) {
          if (baseChunk.tiles[x][y] === 'grass') {
            baseChunk.tiles[x][y] = 'sand';
          }
        }
      }
    } else if (terrainData.biome === BiomeType.Mountain) {
      // Add more stone
      for (let x = 0; x < baseChunk.tiles.length; x++) {
        for (let y = 0; y < baseChunk.tiles[x].length; y++) {
          if (baseChunk.tiles[x][y] === 'dirt') {
            baseChunk.tiles[x][y] = 'stone';
          }
        }
      }
    }

    // Add terrain metadata to chunk
    baseChunk.terrain = {
      elevation: terrainData.elevation,
      biome: terrainData.biome,
      walkable: terrainData.walkable,
      materials: terrainData.materials
    };

    return baseChunk;
  }
}
