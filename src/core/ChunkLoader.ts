// DEPRECATED: See src/world/tilemap/ChunkLoader.ts for the actual implementation.
// This file is not used. For chunk loader design, see artifacts/phaser_chunk_loader_design_2025-06-08.artifact.

// ChunkLoader.ts
// Purpose: Modular chunk loader for dynamic tilemap management in Phaser
// Created: 2025-06-08

import Phaser from 'phaser';

export interface Chunk {
  x: number;
  y: number;
  data: any; // Replace with actual tile data type
  loaded: boolean;
}

export interface ChunkLoaderConfig {
  chunkSize: number;
  worldWidth: number;
  worldHeight: number;
  fetchChunkData: (x: number, y: number) => Promise<any>; // Async fetch for chunk data
}

export class ChunkLoader {
  private scene: Phaser.Scene;
  private config: ChunkLoaderConfig;
  private loadedChunks: Map<string, Chunk> = new Map();

  constructor(scene: Phaser.Scene, config: ChunkLoaderConfig) {
    this.scene = scene;
    this.config = config;
  }

  // Key for chunk map
  private chunkKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  // Load a chunk at (x, y)
  async loadChunk(x: number, y: number): Promise<Chunk> {
    const key = this.chunkKey(x, y);
    if (this.loadedChunks.has(key)) {
      return this.loadedChunks.get(key)!;
    }
    const data = await this.config.fetchChunkData(x, y);
    const chunk: Chunk = { x, y, data, loaded: true };
    this.loadedChunks.set(key, chunk);
    // TODO: Render chunk in Phaser scene
    return chunk;
  }

  // Unload a chunk at (x, y)
  unloadChunk(x: number, y: number): void {
    const key = this.chunkKey(x, y);
    if (this.loadedChunks.has(key)) {
      // TODO: Remove chunk from Phaser scene
      this.loadedChunks.delete(key);
    }
  }

  // Load all chunks in view
  async updateVisibleChunks(centerX: number, centerY: number, viewRadius: number): Promise<void> {
    // TODO: Calculate which chunks should be loaded based on player position
    // Load new chunks, unload out-of-view chunks
  }

  // For testing: get loaded chunk keys
  getLoadedChunkKeys(): string[] {
    return Array.from(this.loadedChunks.keys());
  }
}
