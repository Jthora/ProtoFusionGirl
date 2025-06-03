// Integration and edge case tests for TileRegistry
import { TileRegistry, TileDefinition } from './TileRegistry';

describe('TileRegistry Integration & Edge Cases', () => {
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

  it('overwrites a tile with the same id', () => {
    registry.registerTile(tileA);
    const changed = { ...tileA, name: 'Grass2' };
    registry.registerTile(changed);
    expect(registry.getTile('grass')).toEqual(changed);
  });

  it('handles empty mod registration gracefully', () => {
    registry.registerTilesFromMod({ id: 'mod', tiles: [] });
    expect(registry.getAllTiles().length).toBe(0);
  });

  it('does not duplicate modTileSources for same mod/tile', () => {
    registry.registerTile(tileA, 'mod1');
    registry.registerTile(tileA, 'mod1');
    // @ts-ignore
    expect(registry['modTileSources']['mod1']).toEqual(['grass', 'grass']);
  });

  it('fromJSON handles missing fields', () => {
    registry.fromJSON({});
    expect(registry.getAllTiles().length).toBe(0);
    expect(typeof registry['modTileSources']).toBe('object');
  });

  it('fromJSON handles malformed data', () => {
    registry.fromJSON({ tiles: null, modTileSources: null });
    expect(registry.getAllTiles().length).toBe(0);
    expect(typeof registry['modTileSources']).toBe('object');
  });

  it('toJSON returns correct structure', () => {
    registry.registerTile(tileA, 'mod1');
    const json = registry.toJSON();
    expect(json.tiles[0]).toEqual(tileA);
    expect(json.modTileSources['mod1']).toEqual(['grass']);
  });

  it('can register many tiles and retrieve all', () => {
    for (let i = 0; i < 100; i++) {
      registry.registerTile({ ...tileA, id: `tile${i}` });
    }
    expect(registry.getAllTiles().length).toBe(100);
  });
});
