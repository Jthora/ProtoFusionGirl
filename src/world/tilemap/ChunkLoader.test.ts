// ChunkLoader.test.ts
// Tests for ChunkLoader (src/world/tilemap/ChunkLoader.ts)

import Phaser from 'phaser';
import { ChunkLoader } from './ChunkLoader';

describe('ChunkLoader', () => {
  let scene: Phaser.Scene;
  let tilemapManager: any;
  let groundGroup: any;

  beforeEach(() => {
    // Mock Phaser.Scene
    scene = { add: { group: jest.fn(() => ({ add: jest.fn(), clear: jest.fn() })) }, physics: { add: { existing: jest.fn() } } } as any;
    // Mock TilemapManager and chunkManager
    tilemapManager = {
      chunkManager: {
        chunkSize: 2,
        loadChunk: jest.fn((x, y) => ({ tiles: [["grass", "dirt"], ["stone", "air"]] })),
        unloadChunk: jest.fn()
      },
      wrapX: (x: number) => x,
      wrapChunkX: (x: number, size: number) => x
    };
    // Mock ground group
    groundGroup = { add: jest.fn(), children: { iterate: jest.fn() } };
  });

  it('loads and unloads chunks based on player position', () => {
    const loader = new ChunkLoader(scene, tilemapManager, groundGroup, 1);
    loader.updateLoadedChunks(0, 0);
    expect(tilemapManager.chunkManager.loadChunk).toHaveBeenCalled();
    // Simulate moving player far away to trigger unload
    loader.updateLoadedChunks(100, 100);
    expect(tilemapManager.chunkManager.unloadChunk).toHaveBeenCalled();
  });
});
