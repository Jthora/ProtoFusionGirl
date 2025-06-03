// TileRegistry: Central registry for all tile types, metadata, and behaviors
export interface TileDefinition {
  id: string;
  name: string;
  texture: string;
  solid: boolean;
  destructible: boolean;
  // ...other metadata (light, color, etc.)
}

export class TileRegistry {
  private tiles: Map<string, TileDefinition> = new Map();
  private modTileSources: Record<string, string[]> = {};

  registerTile(tile: TileDefinition, modId?: string) {
    this.tiles.set(tile.id, tile);
    if (modId) {
      if (!this.modTileSources[modId]) this.modTileSources[modId] = [];
      this.modTileSources[modId].push(tile.id);
    }
  }

  registerTilesFromMod(mod: { id: string, tiles: TileDefinition[] }) {
    if (!mod.tiles) return;
    for (const tile of mod.tiles) {
      this.registerTile(tile, mod.id);
    }
  }

  getTile(id: string): TileDefinition | undefined {
    return this.tiles.get(id);
  }

  getAllTiles(): TileDefinition[] {
    return Array.from(this.tiles.values());
  }

  toJSON(): any {
    return {
      tiles: Array.from(this.tiles.values()),
      modTileSources: this.modTileSources
    };
  }

  fromJSON(data: any) {
    if (data?.tiles) {
      this.tiles = new Map(data.tiles.map((t: TileDefinition) => [t.id, t]));
    }
    if (data?.modTileSources) {
      this.modTileSources = data.modTileSources;
    }
  }
  // ...methods for loading tile definitions from file, mod, etc.
}
