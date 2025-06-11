import { ChunkManager } from './ChunkManager';

class MockTilemapManager {
  static wrapChunkX(chunkX: number, _chunkSize: number) {
    const worldWidthChunks = 1000;
    return ((chunkX % worldWidthChunks) + worldWidthChunks) % worldWidthChunks;
  }
}

describe('ChunkManager', () => {
  it('should load and unload chunks', () => {
    const tilemapManager = Object.assign(new MockTilemapManager(), {
      persistence: { loadChunk: () => ({ loaded: true }) },
      worldGen: { generateChunk: () => ({ generated: true }) },
      chunkManager: { chunkSize: 2 },
    });
    const manager = new ChunkManager(tilemapManager as any);
    const chunk = manager.loadChunk(1, 2);
    expect(chunk).toBeDefined();
    manager.unloadChunk(1, 2);
    // Should not throw
  });

  it('should call onChunkLoaded hook', () => {
    const tilemapManager = Object.assign(new MockTilemapManager(), {
      persistence: { loadChunk: () => ({ loaded: true }) },
      worldGen: { generateChunk: () => ({ generated: true }) },
      chunkManager: { chunkSize: 2 },
    });
    const manager = new ChunkManager(tilemapManager as any);
    let called = false;
    manager.onChunkLoaded = () => { called = true; };
    manager.loadChunk(1, 2);
    expect(called).toBe(true);
  });

  it('should generate chunk key correctly', () => {
    const key = ChunkManager.getChunkKey(5, 3, 4);
    expect(typeof key).toBe('string');
    expect(key).toMatch(/\d+,3/);
  });

  it('should remove chunk from loadedChunks on unload', () => {
    const tilemapManager = Object.assign(new MockTilemapManager(), {
      persistence: { loadChunk: () => ({ loaded: true }) },
      worldGen: { generateChunk: () => ({ generated: true }) },
      chunkManager: { chunkSize: 2 },
    });
    const manager = new ChunkManager(tilemapManager as any);
    manager.loadChunk(1, 2);
    manager.unloadChunk(1, 2);
    const key = ChunkManager.getChunkKey(1, 2, 2);
    expect((manager as any).loadedChunks.has(key)).toBe(false);
  });

  it('should return undefined if no persistence or worldGen available', () => {
    const tilemapManager = Object.assign(new MockTilemapManager(), { chunkManager: { chunkSize: 2 } });
    const manager = new ChunkManager(tilemapManager as any);
    const chunk = manager.loadChunk(1, 2);
    expect(chunk).toBeUndefined();
  });
});
