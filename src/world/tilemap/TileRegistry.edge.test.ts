// Edge and error handling tests for TileRegistry
import { TileRegistry } from './TileRegistry';

describe('TileRegistry edge/error handling', () => {
  let registry: TileRegistry;
  beforeEach(() => {
    registry = new TileRegistry();
  });

  it('getTile returns undefined for non-existent id', () => {
    expect(registry.getTile('notfound')).toBeUndefined();
  });

  it('getAllTiles returns empty array if no tiles', () => {
    expect(registry.getAllTiles()).toEqual([]);
  });

  it('fromJSON does not throw on completely empty input', () => {
    expect(() => registry.fromJSON(undefined)).not.toThrow();
    expect(() => registry.fromJSON(null)).not.toThrow();
    expect(() => registry.fromJSON({})).not.toThrow();
  });

  it('fromJSON does not throw on missing tiles/modTileSources', () => {
    expect(() => registry.fromJSON({ tiles: undefined, modTileSources: undefined })).not.toThrow();
  });

  it('registerTile with no modId does not affect modTileSources', () => {
    registry.registerTile({ id: 'a', name: 'A', texture: 'a.png', solid: false, destructible: false });
    // @ts-ignore
    expect(Object.keys(registry['modTileSources']).length).toBe(0);
  });
});
