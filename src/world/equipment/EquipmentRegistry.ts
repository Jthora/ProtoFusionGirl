// EquipmentRegistry: Central registry for all equipment types (moddable, persistent)
import type { EquipmentSlot } from './EquipmentSlot';

export interface EquipmentDefinition {
  id: string;
  name: string;
  icon: string;
  slot: EquipmentSlot;
  stats: Partial<Record<'health' | 'attack' | 'defense' | 'speed', number>>;
  description?: string;
  // ...other metadata (rarity, effects, etc.)
}

// Add default equipment for demo and modding
export const DEFAULT_EQUIPMENT: EquipmentDefinition[] = [
  {
    id: 'starter_sword',
    name: 'Starter Sword',
    icon: '🗡️',
    slot: 'weapon',
    stats: { attack: 2 },
    description: 'A basic sword for new adventurers.'
  },
  {
    id: 'starter_helmet',
    name: 'Starter Helmet',
    icon: '🪖',
    slot: 'head',
    stats: { defense: 1 },
    description: 'A simple helmet for protection.'
  }
];

export class EquipmentRegistry {
  private equipment: Map<string, EquipmentDefinition> = new Map();
  private modEquipmentSources: Record<string, string[]> = {};

  constructor() {
    for (const equip of DEFAULT_EQUIPMENT) {
      this.registerEquipment(equip);
    }
  }

  registerEquipment(equip: EquipmentDefinition, modId?: string) {
    this.equipment.set(equip.id, equip);
    if (modId) {
      if (!this.modEquipmentSources[modId]) this.modEquipmentSources[modId] = [];
      this.modEquipmentSources[modId].push(equip.id);
    }
  }

  registerEquipmentFromMod(mod: { id: string, equipment: EquipmentDefinition[] }) {
    if (!mod.equipment) return;
    for (const equip of mod.equipment) {
      this.registerEquipment(equip, mod.id);
    }
  }

  getEquipment(id: string): EquipmentDefinition | undefined {
    return this.equipment.get(id);
  }

  getAllEquipment(): EquipmentDefinition[] {
    return Array.from(this.equipment.values());
  }

  toJSON(): any {
    return {
      equipment: Array.from(this.equipment.values()),
      modEquipmentSources: this.modEquipmentSources
    };
  }

  fromJSON(data: any) {
    if (data?.equipment) {
      this.equipment = new Map(data.equipment.map((e: EquipmentDefinition) => [e.id, e]));
    }
    if (data?.modEquipmentSources) {
      this.modEquipmentSources = data.modEquipmentSources;
    }
  }
}
