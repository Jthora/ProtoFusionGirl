// TileRegistry unit tests
import { TileRegistry, TileDefinition } from './TileRegistry';

describe('TileRegistry', () => {
  let registry: TileRegistry;
  const tileA: TileDefinition = {
    id: 'grass',
    name: 'Grass',
    texture: 'grass.png',
    solid: true,
    destructible: true
  };
  const tileB: TileDefinition = {
    id: 'stone',
    name: 'Stone',
    texture: 'stone.png',
    solid: true,
    destructible: false
  };

  beforeEach(() => {
    registry = new TileRegistry();
  });

  it('registers and retrieves a tile', () => {
    registry.registerTile(tileA);
    expect(registry.getTile('grass')).toEqual(tileA);
  });

  it('returns undefined for missing tile', () => {
    expect(registry.getTile('missing')).toBeUndefined();
  });

  it('registers multiple tiles and returns all', () => {
    registry.registerTile(tileA);
    registry.registerTile(tileB);
    const all = registry.getAllTiles();
    expect(all).toContain(tileA);
    expect(all).toContain(tileB);
    expect(all.length).toBe(2);
  });

  it('registers tiles from a mod and tracks mod source', () => {
    const mod = { id: 'testmod', tiles: [tileA, tileB] };
    registry.registerTilesFromMod(mod);
    expect(registry.getTile('grass')).toEqual(tileA);
    expect(registry.getTile('stone')).toEqual(tileB);
    // Check modTileSources
    // @ts-ignore
    expect(registry['modTileSources']['testmod']).toEqual(['grass', 'stone']);
  });

  it('serializes and deserializes registry state', () => {
    registry.registerTile(tileA, 'mod1');
    registry.registerTile(tileB, 'mod2');
    const json = registry.toJSON();
    const newRegistry = new TileRegistry();
    newRegistry.fromJSON(json);
    expect(newRegistry.getTile('grass')).toEqual(tileA);
    expect(newRegistry.getTile('stone')).toEqual(tileB);
    // @ts-ignore
    expect(newRegistry['modTileSources']).toEqual(registry['modTileSources']);
  });
});
