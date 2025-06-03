// ItemRegistry: Central registry for all item types (moddable, persistent)
export interface ItemDefinition {
  id: string;
  name: string;
  icon: string;
  type: 'material' | 'tool' | 'weapon' | 'armor' | 'consumable' | 'misc';
  stackSize: number;
  description?: string;
  // ...other metadata (rarity, effects, etc.)
}

// Add default items for demo and modding
export const DEFAULT_ITEMS: ItemDefinition[] = [
  {
    id: 'wood',
    name: 'Wood',
    icon: '🪵',
    type: 'material',
    stackSize: 99,
    description: 'Basic building material.'
  },
  {
    id: 'coal',
    name: 'Coal',
    icon: '⚫',
    type: 'material',
    stackSize: 99,
    description: 'Used for crafting torches and fuel.'
  },
  {
    id: 'plank',
    name: 'Plank',
    icon: '🟫',
    type: 'material',
    stackSize: 99,
    description: 'Processed wood for building.'
  },
  {
    id: 'torch',
    name: 'Torch',
    icon: '🔥',
    type: 'consumable',
    stackSize: 99,
    description: 'Provides light.'
  }
];

export class ItemRegistry {
  private items: Map<string, ItemDefinition> = new Map();
  private modItemSources: Record<string, string[]> = {};

  constructor() {
    // Register default items
    for (const item of DEFAULT_ITEMS) {
      this.registerItem(item);
    }
  }

  registerItem(item: ItemDefinition, modId?: string) {
    this.items.set(item.id, item);
    if (modId) {
      if (!this.modItemSources[modId]) this.modItemSources[modId] = [];
      this.modItemSources[modId].push(item.id);
    }
  }

  registerItemsFromMod(mod: { id: string, items: ItemDefinition[] }) {
    if (!mod.items) return;
    for (const item of mod.items) {
      this.registerItem(item, mod.id);
    }
  }

  getItem(id: string): ItemDefinition | undefined {
    return this.items.get(id);
  }

  getAllItems(): ItemDefinition[] {
    return Array.from(this.items.values());
  }

  toJSON(): any {
    return {
      items: Array.from(this.items.values()),
      modItemSources: this.modItemSources
    };
  }

  fromJSON(data: any) {
    if (data?.items) {
      this.items = new Map(data.items.map((i: ItemDefinition) => [i.id, i]));
    }
    if (data?.modItemSources) {
      this.modItemSources = data.modItemSources;
    }
  }
}
