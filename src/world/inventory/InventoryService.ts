// InventoryService: Service for inventory actions, UI hooks, and persistence
import { Inventory } from './Inventory';
import type { ItemRegistry } from '../items/ItemRegistry';
import type { EquipmentService } from '../equipment/EquipmentService';
import type { EquipmentSlot } from '../equipment/EquipmentSlot';

export class InventoryService {
  private inventory: Inventory;
  private itemRegistry: ItemRegistry;

  constructor(inventory: Inventory, itemRegistry: ItemRegistry) {
    this.inventory = inventory;
    this.itemRegistry = itemRegistry;
  }

  addItem(id: string, quantity: number = 1, metadata?: Record<string, any>): boolean {
    return this.inventory.addItem({ id, quantity, metadata });
  }

  removeItem(id: string, quantity: number = 1): boolean {
    return this.inventory.removeItem(id, quantity);
  }

  hasItem(id: string, quantity: number = 1): boolean {
    return this.inventory.hasItem(id, quantity);
  }

  getItems() {
    return this.inventory.getItems();
  }

  getItemDefinition(id: string) {
    return this.itemRegistry.getItem(id);
  }

  clear() {
    this.inventory.clear();
  }

  toJSON() {
    return this.inventory.toJSON();
  }

  fromJSON(data: any) {
    this.inventory.fromJSON(data);
  }

  // Add item use and equip stubs for future gameplay
  useItem(id: string): boolean {
    // TODO: Implement item use logic (heal, place, etc.)
    return this.removeItem(id, 1);
  }
  equipItem(_id: string): boolean {
    // TODO: Implement equipment logic (weapons, armor)
    return false;
  }

  /**
   * Equip an item from inventory if possible.
   */
  equipFromInventory(id: string, slot: EquipmentSlot, equipmentService: EquipmentService): boolean {
    if (!this.hasItem(id, 1)) return false;
    if (!equipmentService.canEquip(id, slot)) return false;
    if (equipmentService.equipItem(id, slot)) {
      this.removeItem(id, 1);
      return true;
    }
    return false;
  }
}
