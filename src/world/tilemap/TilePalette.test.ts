// TilePalette.test.ts
// Basic instantiation test for TilePalette
import { TilePalette } from './TilePalette';
import { TileRegistry } from './TileRegistry';

describe('TilePalette', () => {
  let mockRegistry: TileRegistry;

  beforeEach(() => {
    mockRegistry = new TileRegistry();
  });

  // TODO: Test color/texture assignment (assign color/texture and verify)
  it('can be instantiated', () => {
    const palette = new TilePalette(mockRegistry);
    expect(palette).toBeDefined();
  });
  it('calls selectTile without error', () => {
    const palette = new TilePalette(mockRegistry);
    if (typeof palette.selectTile === 'function') {
      expect(() => palette.selectTile('grass')).not.toThrow();
    }
  });
});
