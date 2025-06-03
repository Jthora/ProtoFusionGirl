// EquipmentService: Service for equipment actions, UI hooks, and persistence
import { Equipment } from './Equipment';
import type { EquipmentRegistry } from './EquipmentRegistry';
import type { EquipmentSlot } from './EquipmentSlot';

export class EquipmentService {
  private equipment: Equipment;
  private registry: EquipmentRegistry;

  constructor(equipment: Equipment, registry: EquipmentRegistry) {
    this.equipment = equipment;
    this.registry = registry;
  }

  equipItem(id: string, slot: EquipmentSlot, metadata?: Record<string, any>): boolean {
    const def = this.registry.getEquipment(id);
    if (!def || def.slot !== slot) return false;
    return this.equipment.equip({ id, slot, metadata });
  }

  unequipItem(slot: EquipmentSlot): boolean {
    return this.equipment.unequip(slot);
  }

  getEquipped(slot: EquipmentSlot) {
    return this.equipment.getEquipped(slot);
  }

  getAllEquipped() {
    return this.equipment.getAllEquipped();
  }

  toJSON() {
    return this.equipment.toJSON();
  }

  fromJSON(data: any) {
    this.equipment.fromJSON(data);
  }

  canEquip(id: string, slot: EquipmentSlot): boolean {
    const def = this.registry.getEquipment(id);
    if (!def || def.slot !== slot) return false;
    // Optionally: add more rules (level, class, etc.)
    return true;
  }
}
