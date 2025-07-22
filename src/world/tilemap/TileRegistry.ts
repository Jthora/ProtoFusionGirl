// TileRegistry: Central registry for all tile types, metadata, and behaviors
export interface TileDefinition {
  id: string;
  name: string;
  texture: string;
  solid: boolean;
  destructible: boolean;
  // Visual properties
  color?: number;           // Primary hex color (e.g., 0x00ff00 for green)
  secondaryColor?: number;  // Secondary color for gradients or details
  brightness?: number;      // Brightness modifier (0.0 - 2.0, default 1.0)
  alpha?: number;          // Transparency (0.0 - 1.0, default 1.0)
  // ...other metadata (light, color, etc.)
}

export class TileRegistry {
  private tiles: Map<string, TileDefinition> = new Map();
  private modTileSources: Record<string, string[]> = {};

  constructor() {
    this.registerDefaultTiles();
  }

  private registerDefaultTiles() {
    // ProtoFusionGirl Color Palette - Inspired by sci-fi and nature themes
    const defaultTiles: TileDefinition[] = [
      {
        id: 'air',
        name: 'Air',
        texture: 'air',
        solid: false,
        destructible: false,
        color: 0x87CEEB,     // Sky blue
        alpha: 0.1
      },
      {
        id: 'grass',
        name: 'Grass',
        texture: 'grass',
        solid: true,
        destructible: true,
        color: 0x32CD32,     // Lime green
        secondaryColor: 0x228B22, // Forest green for depth
        brightness: 1.1
      },
      {
        id: 'dirt',
        name: 'Dirt',
        texture: 'dirt',
        solid: true,
        destructible: true,
        color: 0x8B4513,     // Saddle brown
        secondaryColor: 0x654321, // Darker brown
        brightness: 0.9
      },
      {
        id: 'stone',
        name: 'Stone',
        texture: 'stone',
        solid: true,
        destructible: true,
        color: 0x708090,     // Slate gray
        secondaryColor: 0x556B2F, // Dark olive green tint
        brightness: 0.8
      },
      {
        id: 'water',
        name: 'Water',
        texture: 'water',
        solid: false,
        destructible: false,
        color: 0x1E90FF,     // Dodger blue
        secondaryColor: 0x00CED1, // Dark turquoise
        alpha: 0.7,
        brightness: 1.2
      },
      {
        id: 'sand',
        name: 'Sand',
        texture: 'sand',
        solid: true,
        destructible: true,
        color: 0xF4A460,     // Sandy brown
        secondaryColor: 0xDDD79C, // Light sandy
        brightness: 1.1
      },
      {
        id: 'wood',
        name: 'Wood',
        texture: 'wood',
        solid: true,
        destructible: true,
        color: 0x8B4513,     // Saddle brown
        secondaryColor: 0xA0522D, // Sienna
        brightness: 0.95
      },
      {
        id: 'metal',
        name: 'Metal',
        texture: 'metal',
        solid: true,
        destructible: false,
        color: 0xC0C0C0,     // Silver
        secondaryColor: 0x778899, // Light slate gray
        brightness: 1.3
      },
      {
        id: 'crystal',
        name: 'Crystal',
        texture: 'crystal',
        solid: true,
        destructible: true,
        color: 0x9370DB,     // Medium purple
        secondaryColor: 0xDA70D6, // Orchid
        brightness: 1.4,
        alpha: 0.8
      },
      {
        id: 'lava',
        name: 'Lava',
        texture: 'lava',
        solid: false,
        destructible: false,
        color: 0xFF4500,     // Orange red
        secondaryColor: 0xFF6347, // Tomato
        brightness: 1.6
      },
      {
        id: 'ice',
        name: 'Ice',
        texture: 'ice',
        solid: true,
        destructible: true,
        color: 0xB0E0E6,     // Powder blue
        secondaryColor: 0xAFEEEE, // Pale turquoise
        brightness: 1.3,
        alpha: 0.9
      },
      {
        id: 'leyline_node',
        name: 'Ley Line Node',
        texture: 'leyline_node',
        solid: false,
        destructible: false,
        color: 0x00FFCC,     // Cyan
        secondaryColor: 0x40E0D0, // Turquoise
        brightness: 1.5,
        alpha: 0.8
      }
    ];

    defaultTiles.forEach(tile => this.registerTile(tile, 'core'));
    console.log(`🎨 Registered ${defaultTiles.length} default colored tiles`);
  }

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
