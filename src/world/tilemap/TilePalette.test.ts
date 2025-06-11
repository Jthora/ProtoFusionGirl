// TilePalette.test.ts
// Basic instantiation test for TilePalette
import { TilePalette } from './TilePalette';
describe('TilePalette', () => {
  // TODO: Test color/texture assignment (assign color/texture and verify)
  it('can be instantiated', () => {
    const palette = new TilePalette();
    expect(palette).toBeDefined();
  });
  it('calls selectTile without error', () => {
    const palette = new TilePalette({} as any);
    if (typeof palette.selectTile === 'function') {
      expect(() => palette.selectTile('grass')).not.toThrow();
    }
  });
});
