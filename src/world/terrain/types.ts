// types.ts
// TypeScript interfaces for the Planetary Scale Terrain System
// Following TDD principles - these types are defined by test requirements

export interface PlayerPosition {
  x: number;
  y: number;
}

export interface GeoBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  centerX: number;
  centerY: number;
}

export interface TerrainTile {
  x: number;
  y: number;
  elevation: number;
  biome: BiomeType;
  slope: number;
  aspect: number;
  walkable: boolean;
  materials: MaterialType[];
  features: Feature[];
}

export interface TerrainData {
  elevation: number;      // Elevation in meters (sea level = 0)
  slope: number;          // Slope angle in degrees (0-90)
  aspect: number;         // Aspect in degrees (0-360, 0=North)
  biome: BiomeType;       // Biome classification
  features: Feature[];    // Terrain features (caves, rivers, etc.)
  walkable: boolean;      // Whether this terrain is traversable
  materials: MaterialType[]; // Available materials for crafting
}

export interface TerrainChunk {
  id: string;             // Unique chunk identifier
  bounds: GeoBounds;      // Geographic bounds of the chunk
  resolution: number;     // Meters per tile
  tiles: TerrainTile[];   // Terrain tiles in this chunk
  loadedAt: number;       // Timestamp when chunk was loaded
  priority: number;       // Loading priority (higher = more important)
}

export interface Feature {
  type: FeatureType;
  position: { x: number; y: number };
  properties: Record<string, any>;
}

export enum BiomeType {
  Ocean = 'ocean',
  Coastal = 'coastal',
  Plains = 'plains',
  Forest = 'forest',
  Mountain = 'mountain',
  Desert = 'desert',
  Arctic = 'arctic',
  Tropical = 'tropical',
  Swamp = 'swamp',
  Alpine = 'alpine',
  Tundra = 'tundra',
  Grassland = 'grassland',
  Rainforest = 'rainforest',
  Savanna = 'savanna',
  Urban = 'urban'
}

export enum MaterialType {
  Stone = 'stone',
  Metal = 'metal',
  Wood = 'wood',
  Water = 'water',
  Sand = 'sand',
  Ice = 'ice',
  Clay = 'clay',
  Salt = 'salt',
  Coal = 'coal',
  Oil = 'oil',
  Crystal = 'crystal',
  Organic = 'organic'
}

export enum FeatureType {
  River = 'river',
  Lake = 'lake',
  Cave = 'cave',
  Cliff = 'cliff',
  Valley = 'valley',
  Peak = 'peak',
  Crater = 'crater',
  Volcano = 'volcano',
  Glacier = 'glacier',
  Geyser = 'geyser',
  Oasis = 'oasis',
  Ruins = 'ruins'
}

export interface TerrainSystem {
  /**
   * Initialize the terrain system (load base data, setup caches, etc.)
   */
  initialize(): Promise<void>;

  /**
   * Get detailed terrain data for a specific location
   * @param lat Latitude in degrees
   * @param lon Longitude in degrees  
   * @param radius Radius in meters for data collection
   * @returns Promise resolving to terrain data
   */
  getTerrainAt(lat: number, lon: number, radius: number): Promise<TerrainData>;

  /**
   * Stream terrain chunks around a player position
   * @param playerPos Player's current position
   * @returns Promise resolving to array of terrain chunks
   */
  streamChunksAround(playerPos: PlayerPosition): Promise<TerrainChunk[]>;

  /**
   * Cleanup system resources
   */
  cleanup(): void;
}

export interface TerrainDataSource {
  /**
   * Get elevation data for coordinates
   */
  getElevation(lat: number, lon: number): Promise<number>;

  /**
   * Check if data is available for coordinates
   */
  hasDataAt(lat: number, lon: number): boolean;

  /**
   * Get the resolution of this data source in meters
   */
  getResolution(): number;

  /**
   * Get the geographic coverage of this data source
   */
  getCoverage(): GeoBounds;
}

export interface TerrainCache {
  /**
   * Get cached terrain data
   */
  get(key: string): TerrainData | undefined;

  /**
   * Set terrain data in cache
   */
  set(key: string, data: TerrainData): void;

  /**
   * Check if data is cached
   */
  has(key: string): boolean;

  /**
   * Clear cache
   */
  clear(): void;

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
}

export interface LevelOfDetail {
  /**
   * Calculate appropriate LoD level for distance from player
   */
  calculateLOD(distanceFromPlayer: number): number;

  /**
   * Get required resolution for LoD level
   */
  getRequiredResolution(lod: number): number;

  /**
   * Check if chunk needs LoD update
   */
  shouldUpdateLOD(chunk: TerrainChunk, playerDistance: number): boolean;
}

export interface CoordinateConverter {
  /**
   * Convert latitude/longitude to world tile coordinates
   */
  latLonToTile(lat: number, lon: number): { x: number; y: number };

  /**
   * Convert world tile coordinates to latitude/longitude
   */
  tileToLatLon(x: number, y: number): { lat: number; lon: number };

  /**
   * Wrap coordinates for toroidal world
   */
  wrapCoordinates(x: number, y: number): { x: number; y: number };
}

export interface BiomeClassifier {
  /**
   * Classify biome based on elevation, climate, and location
   */
  classifyBiome(
    elevation: number,
    lat: number,
    temperature?: number,
    precipitation?: number
  ): BiomeType;

  /**
   * Get materials available in a biome
   */
  getBiomeMaterials(biome: BiomeType): MaterialType[];

  /**
   * Check if biome is walkable by default
   */
  isBiomeWalkable(biome: BiomeType): boolean;
}

// Configuration interfaces
export interface TerrainSystemConfig {
  dataSources: TerrainDataSourceConfig[];
  cache: TerrainCacheConfig;
  levelOfDetail: LevelOfDetailConfig;
  coordinates: CoordinateSystemConfig;
}

export interface TerrainDataSourceConfig {
  type: 'gebco' | 'srtm' | 'aster' | 'procedural';
  resolution: number;
  coverage: 'global' | 'regional' | 'local';
  priority: number;
  url?: string;
  dataPath?: string;
}

export interface TerrainCacheConfig {
  maxSize: number;        // Maximum cache size in MB
  ttl: number;           // Time to live in milliseconds
  strategy: 'lru' | 'lfu' | 'fifo';
}

export interface LevelOfDetailConfig {
  distances: number[];    // Distance thresholds in meters
  resolutions: number[];  // Corresponding resolutions in meters
  chunkSizes: number[];   // Chunk sizes for each LoD level
}

export interface CoordinateSystemConfig {
  worldWidth: number;     // World width in meters
  worldHeight: number;    // World height in meters
  origin: { lat: number; lon: number }; // Origin point for coordinate system
  projection: 'mercator' | 'equirectangular' | 'custom';
}
