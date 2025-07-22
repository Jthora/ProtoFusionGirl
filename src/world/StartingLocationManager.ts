// StartingLocationManager.ts
// Handles selecting and setting up the optimal starting location for the player
// Integrates with leylines, terrain generation, and chunk loading

import { LeyLineManager } from './leyline/LeyLineManager';
import { TilemapManager } from './tilemap/TilemapManager';
import { ChunkLoader } from './tilemap/ChunkLoader';
import { WorldStateManager } from './WorldStateManager';
import { EventBus } from '../core/EventBus';

export interface StartingLocation {
  x: number;
  y: number;
  surfaceY: number;
  leyLineId?: string;
  nodeId?: string;
  biome: string;
  description: string;
}

export class StartingLocationManager {
  private leyLineManager: LeyLineManager;
  private tilemapManager: TilemapManager;
  private eventBus: EventBus;

  constructor(
    leyLineManager: LeyLineManager,
    tilemapManager: TilemapManager,
    _worldStateManager: WorldStateManager,
    eventBus: EventBus
  ) {
    this.leyLineManager = leyLineManager;
    this.tilemapManager = tilemapManager;
    this.eventBus = eventBus;
    // _worldStateManager is reserved for future use
  }

  /**
   * Generate leylines and choose an optimal starting location
   */
  generateStartingLocation(seed: string): StartingLocation {
    console.log('🗺️ Generating starting location with seed:', seed);

    // 1. Generate leyline network first
    this.leyLineManager.generateProcedural(seed, 8); // 8 nodes for good coverage
    const leyLines = this.leyLineManager.getLeyLines();
    
    if (leyLines.length === 0) {
      console.warn('⚠️ No leylines generated, using default location');
      return this.getDefaultStartingLocation();
    }

    // 2. Find a good starting node (prefer central, active nodes)
    const startingNode = this.selectOptimalStartingNode(leyLines);
    
    if (!startingNode.node) {
      console.warn('⚠️ No suitable leyline node found, using default location');
      return this.getDefaultStartingLocation();
    }

    // 3. Calculate surface height at this location
    const surfaceY = this.calculateSurfaceHeight(startingNode.node.position.x, startingNode.node.position.y);
    
    // 4. Determine biome
    const biome = this.determineBiome(startingNode.node.position.x, startingNode.node.position.y);

    console.log(`✅ Selected starting location: ${startingNode.node.position.x}, ${surfaceY} (${biome} biome)`);

    return {
      x: startingNode.node.position.x,
      y: surfaceY - 32, // Position player above surface
      surfaceY: surfaceY,
      leyLineId: startingNode.leyLineId || undefined,
      nodeId: startingNode.node.id,
      biome: biome,
      description: `${biome} region near ${startingNode.node.name || 'leyline nexus'}`
    };
  }

  /**
   * Set up the game world at the specified starting location
   */
  setupWorldAtLocation(location: StartingLocation, chunkLoader: ChunkLoader): void {
    console.log(`🌍 Setting up world at location: ${location.x}, ${location.y}`);

    // 1. Pre-generate starting chunks
    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    const tileSize = 16;
    const startChunkX = Math.floor(location.x / (chunkSize * tileSize));
    const startChunkY = Math.floor(location.surfaceY / (chunkSize * tileSize));

    console.log(`📦 Pre-generating chunks around (${startChunkX}, ${startChunkY})`);

    // Generate a 3x3 grid of chunks around starting position
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const chunkX = startChunkX + dx;
        const chunkY = startChunkY + dy;
        
        // Force chunk generation and loading
        this.tilemapManager.chunkManager.loadChunk(chunkX, chunkY);
        
        console.log(`✅ Generated chunk (${chunkX}, ${chunkY})`);
      }
    }

    // 2. Load visual chunks through ChunkLoader
    chunkLoader.updateLoadedChunks(location.x, location.surfaceY);

    // 3. Emit starting location event
    this.eventBus.emit({
      type: 'STARTING_LOCATION_SET',
      data: {
        location: location,
        timestamp: Date.now()
      }
    });

    console.log('🎯 Starting location setup complete!');
  }

  private selectOptimalStartingNode(leyLines: any[]): { leyLineId: string, node: any } | { leyLineId: null, node: null } {
    let bestNode = null;
    let bestLeyLineId = null;
    let bestScore = -1;

    for (const leyLine of leyLines) {
      for (const node of leyLine.nodes) {
        const score = this.scoreStartingNode(node, leyLine);
        if (score > bestScore) {
          bestScore = score;
          bestNode = node;
          bestLeyLineId = leyLine.id;
        }
      }
    }

    return bestNode ? { leyLineId: bestLeyLineId, node: bestNode } : { leyLineId: null, node: null };
  }

  private scoreStartingNode(node: any, leyLine: any): number {
    let score = 0;

    // Prefer active nodes
    if (node.state === 'active') score += 50;

    // Prefer nodes with moderate connectivity (not isolated, not overcrowded)
    const connectionCount = leyLine.nodes.length;
    if (connectionCount >= 3 && connectionCount <= 6) score += 30;

    // Prefer nodes not at extreme coordinates (avoid world edges)
    const worldWidth = TilemapManager.WORLD_WIDTH;
    const worldHeight = TilemapManager.WORLD_HEIGHT;
    const distanceFromCenter = Math.abs(node.position.x - worldWidth / 2) + Math.abs(node.position.y - worldHeight / 2);
    const normalizedDistance = distanceFromCenter / (worldWidth + worldHeight);
    score += (1 - normalizedDistance) * 20; // Higher score for more central locations

    // Prefer nodes with interesting names/types
    if (node.name && (node.name.includes('nexus') || node.name.includes('confluence'))) score += 10;

    // Add some randomness for variety
    score += Math.random() * 10;

    return score;
  }

  private calculateSurfaceHeight(worldX: number, worldY: number): number {
    // Replicate the same terrain height calculation used in WorldGen
    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    const chunkX = Math.floor(worldX / (chunkSize * 16));
    const chunkY = Math.floor(worldY / (chunkSize * 16));

    const baseSurfaceY = 16;
    const worldWidthChunks = Math.ceil(TilemapManager.WORLD_WIDTH / chunkSize);
    const wrappedChunkX = ((chunkX % worldWidthChunks) + worldWidthChunks) % worldWidthChunks;
    
    const earthLongitude = (wrappedChunkX * chunkSize * 16) / TilemapManager.WORLD_WIDTH * 360 - 180;
    const earthLatitude = (chunkY * chunkSize * 16) / TilemapManager.WORLD_HEIGHT * 180 - 90;
    
    const continentalElevation = Math.sin(earthLongitude * 0.03) * Math.cos(earthLatitude * 0.02) * 8;
    const mountainRange = Math.sin(earthLongitude * 0.1) * Math.sin(earthLatitude * 0.15) * 6;
    const localVariation = Math.sin(chunkX * 0.5 + chunkY * 0.3) * 2;
    
    return (baseSurfaceY + Math.floor(continentalElevation + mountainRange + localVariation)) * 16; // Convert to world coordinates
  }

  private determineBiome(worldX: number, worldY: number): string {
    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    const chunkX = Math.floor(worldX / (chunkSize * 16));
    const chunkY = Math.floor(worldY / (chunkSize * 16));

    const worldWidthChunks = Math.ceil(TilemapManager.WORLD_WIDTH / chunkSize);
    const wrappedChunkX = ((chunkX % worldWidthChunks) + worldWidthChunks) % worldWidthChunks;
    
    const earthLatitude = (chunkY * chunkSize * 16) / TilemapManager.WORLD_HEIGHT * 180 - 90;
    const earthLongitude = (wrappedChunkX * chunkSize * 16) / TilemapManager.WORLD_WIDTH * 360 - 180;
    
    const continentalElevation = Math.sin(earthLongitude * 0.03) * Math.cos(earthLatitude * 0.02) * 8;
    const mountainRange = Math.sin(earthLongitude * 0.1) * Math.sin(earthLatitude * 0.15) * 6;

    if (Math.abs(earthLatitude) > 60) return 'polar';
    if (Math.abs(earthLatitude) < 23.5) return 'tropical';
    if (Math.abs(continentalElevation) < -4) return 'oceanic';
    if (mountainRange > 3) return 'mountain';
    return 'temperate';
  }

  private getDefaultStartingLocation(): StartingLocation {
    return {
      x: 400,
      y: 200,
      surfaceY: 256, // 16 tiles * 16 pixels = 256
      biome: 'temperate',
      description: 'Default starting area'
    };
  }
}
