// Equipment: Manages equipped items for a player
import type { EquipmentInstance } from './EquipmentInstance';
import type { EquipmentSlot } from './EquipmentSlot';

export class Equipment {
  private slots: Partial<Record<EquipmentSlot, EquipmentInstance>> = {};

  getEquipped(slot: EquipmentSlot): EquipmentInstance | undefined {
    return this.slots[slot];
  }

  equip(item: EquipmentInstance): boolean {
    this.slots[item.slot] = item;
    return true;
  }

  unequip(slot: EquipmentSlot): boolean {
    if (this.slots[slot]) {
      delete this.slots[slot];
      return true;
    }
    return false;
  }

  getAllEquipped(): EquipmentInstance[] {
    return Object.values(this.slots).filter(Boolean) as EquipmentInstance[];
  }

  toJSON(): any {
    return { slots: this.slots };
  }

  fromJSON(data: any) {
    if (data?.slots) {
      this.slots = data.slots;
    }
  }

  // Add utility to check if a slot is occupied
  isEquipped(slot: EquipmentSlot): boolean {
    return !!this.slots[slot];
  }
}
