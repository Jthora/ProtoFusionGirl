// Tests for WorldGenV2
// TODO: Test world generation with various seeds and parameters
// TODO: Test edge cases (invalid input, large/small worlds)
// TODO: Test registering multiple modWorldGenHooks and hook order
// TODO: Test generateChunk returns hook result if provided
// TODO: Test generateChunk falls back to default if no hook returns
// TODO: Test chunk size and tile array dimensions
// TODO: Test generateFromSeed produces deterministic output for same seed
// TODO: Test generateFromSeed with invalid/empty seed
// TODO: Test integration with TilemapManager and TerrainGenerator (mocked)
// TODO: Test worldMeta propagation to hooks

import { WorldGenV2 } from './WorldGenV2';

const minimalTilemapManager = {
  chunkManager: { chunkSize: 4 },
  editService: {},
  tileRegistry: {},
  persistence: {},
  worldGen: {},
  // Add any other required properties as needed for type compatibility
} as any;

describe('WorldGenV2', () => {
  it('should generate a world with default parameters', () => {
    const gen = new WorldGenV2(minimalTilemapManager);
    const world = gen.generateFromSeed('abc');
    expect(world.seed).toBe('abc');
    expect(world.width).toBeGreaterThan(0);
    expect(world.height).toBeGreaterThan(0);
    expect(world.chunks).toBeDefined();
  });

  it('should call modWorldGenHooks if registered', () => {
    const gen = new WorldGenV2(minimalTilemapManager);
    let called = false;
    gen.registerModWorldGenHook((x: number, y: number, meta: any) => { called = (x === 0 && y === 0 && meta !== undefined); return { custom: true }; });
    const result = gen.generateChunk(0, 0, {});
    expect(called).toBe(true);
    expect(result).toEqual({ custom: true });
  });

  it('should produce deterministic output for same seed', () => {
    const gen1 = new WorldGenV2(minimalTilemapManager);
    const gen2 = new WorldGenV2(minimalTilemapManager);
    const world1 = gen1.generateFromSeed('seed');
    const world2 = gen2.generateFromSeed('seed');
    expect(world1.seed).toBe(world2.seed);
    expect(world1.width).toBe(world2.width);
    expect(world1.height).toBe(world2.height);
  });

  it('should propagate worldMeta to modWorldGenHooks', () => {
    const gen = new WorldGenV2(minimalTilemapManager);
    let receivedMeta: any = null;
    gen.registerModWorldGenHook((_x: number, _y: number, meta: any) => { receivedMeta = meta; return { ok: true }; });
    gen.generateChunk(0, 0, { test: 123 });
    expect(receivedMeta).toEqual({ test: 123 });
  });

  it('should create tiles array with correct chunk size', () => {
    const gen = new WorldGenV2(minimalTilemapManager);
    // No hooks, so falls back to default
    const chunk = gen.generateChunk(0, 0, {});
    expect(Array.isArray(chunk.tiles)).toBe(true);
    expect(chunk.tiles.length).toBe(3);
  });
});
