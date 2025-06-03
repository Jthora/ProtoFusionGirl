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

  // Loads or generates a chunk and adds it to loadedChunks
  loadChunk(chunkX: number, chunkY: number) {
    const key = `${chunkX},${chunkY}`;
    if (this.loadedChunks.has(key)) return this.loadedChunks.get(key);
    // Try to load from persistence
    let chunk = this.tilemapManager.persistence?.loadChunk?.(chunkX, chunkY);
    if (!chunk) {
      // If not found, generate procedurally
      chunk = this.tilemapManager.worldGen?.generateChunk?.(chunkX, chunkY);
    }
    if (chunk) {
      this.loadedChunks.set(key, chunk);
    }
    return chunk;
  }

  // Unloads a chunk, saving if necessary
  unloadChunk(chunkX: number, chunkY: number) {
    const key = `${chunkX},${chunkY}`;
    const chunk = this.loadedChunks.get(key);
    if (chunk && chunk.dirty && this.tilemapManager.persistence?.saveChunk) {
      this.tilemapManager.persistence.saveChunk(chunkX, chunkY, chunk);
    }
    this.loadedChunks.delete(key);
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
      if (Math.abs(x - centerX) > radius || Math.abs(y - centerY) > radius) {
        this.unloadChunk(x, y);
      }
    }
  }
}
