// ChunkManager: Handles chunk loading/unloading, streaming, and memory management for large worlds
import { TilemapManager } from './TilemapManager';

export class ChunkManager {
  private tilemapManager: TilemapManager;
  // Map key: `${chunkX},${chunkY}`
  private loadedChunks: Map<string, any> = new Map();
  chunkSize: number = 64; // Example: 64x64 tiles per chunk

  constructor(tilemapManager: TilemapManager) {
    this.tilemapManager = tilemapManager;
  }

  // Utility: Generate chunk key from coordinates
  static getChunkKey(chunkX: number, chunkY: number, chunkSize: number): string {
    const wrappedChunkX = TilemapManager.wrapChunkX(chunkX, chunkSize);
    return `${wrappedChunkX},${chunkY}`;
  }

  // Event hooks for chunk lifecycle (can be set by TilemapManager or mods)
  onChunkLoaded?: (chunkX: number, chunkY: number, chunk: any) => void;
  onChunkUnloaded?: (chunkX: number, chunkY: number, chunk: any) => void;
  onChunkReplaced?: (chunkX: number, chunkY: number, newChunk: any, oldChunk: any) => void;

  // Loads or generates a chunk and adds it to loadedChunks
  loadChunk(chunkX: number, chunkY: number) {
    const key = ChunkManager.getChunkKey(chunkX, chunkY, this.chunkSize);
    if (this.loadedChunks.has(key)) return this.loadedChunks.get(key);
    let chunk = this.tilemapManager.persistence?.loadChunk?.(TilemapManager.wrapChunkX(chunkX, this.chunkSize), chunkY);
    if (!chunk) {
      chunk = this.tilemapManager.worldGen?.generateChunk?.(TilemapManager.wrapChunkX(chunkX, this.chunkSize), chunkY);
    }
    if (chunk) {
      this.loadedChunks.set(key, chunk);
      if (this.onChunkLoaded) this.onChunkLoaded(chunkX, chunkY, chunk);
    }
    return chunk;
  }

  // Unloads a chunk, saving if necessary
  unloadChunk(chunkX: number, chunkY: number) {
    const key = ChunkManager.getChunkKey(chunkX, chunkY, this.chunkSize);
    const chunk = this.loadedChunks.get(key);
    if (chunk && chunk.dirty && this.tilemapManager.persistence?.saveChunk) {
      this.tilemapManager.persistence.saveChunk(TilemapManager.wrapChunkX(chunkX, this.chunkSize), chunkY, chunk);
    }
    this.loadedChunks.delete(key);
    if (this.onChunkUnloaded && chunk) this.onChunkUnloaded(chunkX, chunkY, chunk);
  }

  // Returns chunk data if loaded
  getChunk(chunkX: number, chunkY: number) {
    return this.loadedChunks.get(`${chunkX},${chunkY}`);
  }

  // Returns all loaded chunk keys
  getLoadedChunkKeys(): string[] {
    return Array.from(this.loadedChunks.keys());
  }

  // Returns a plain object of all loaded chunks (for persistence)
  getLoadedChunks(): Record<string, any> {
    return Object.fromEntries(this.loadedChunks.entries());
  }

  // Loads chunks from a plain object (for persistence)
  setLoadedChunks(chunks: Record<string, any>) {
    this.loadedChunks = new Map(Object.entries(chunks));
  }

  // For memory management: unload distant chunks
  unloadDistantChunks(centerX: number, centerY: number, radius: number) {
    for (const key of this.loadedChunks.keys()) {
      const [x, y] = key.split(',').map(Number);
      // Use toroidalChunkDistanceX for edge-aware chunk unloading
      const dx = TilemapManager.toroidalChunkDistanceX(x, centerX, this.chunkSize);
      if (dx > radius || Math.abs(y - centerY) > radius) {
        this.unloadChunk(x, y);
      }
    }
  }

  // Replaces the chunk at (chunkX, chunkY) with newChunk in the loadedChunks map.
  // Triggers downstream updates (tilemap, minimap, etc.)
  replaceChunk(chunkX: number, chunkY: number, newChunk: any) {
    const key = ChunkManager.getChunkKey(chunkX, chunkY, this.chunkSize);
    const oldChunk = this.loadedChunks.get(key);
    this.loadedChunks.set(key, newChunk);
    if (this.onChunkReplaced) this.onChunkReplaced(chunkX, chunkY, newChunk, oldChunk);
    if (this.tilemapManager.onChunkReplaced) {
      this.tilemapManager.onChunkReplaced(TilemapManager.wrapChunkX(chunkX, this.chunkSize), chunkY, newChunk, oldChunk);
    }
  }
}
