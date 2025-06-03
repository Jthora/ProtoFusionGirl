// Inventory: Player or container inventory (add/remove, stack, query, mod hooks)
import type { ItemInstance } from '../items/ItemInstance';

export class Inventory {
  private slots: ItemInstance[] = [];
  private maxSlots: number;

  constructor(maxSlots: number = 20) {
    this.maxSlots = maxSlots;
  }

  getItems(): ItemInstance[] {
    return this.slots;
  }

  addItem(item: ItemInstance): boolean {
    // Try to stack first
    for (const slot of this.slots) {
      if (slot.id === item.id && (!item.metadata || JSON.stringify(slot.metadata) === JSON.stringify(item.metadata))) {
        slot.quantity += item.quantity;
        return true;
      }
    }
    // Add to new slot if space
    if (this.slots.length < this.maxSlots) {
      this.slots.push({ ...item });
      return true;
    }
    return false;
  }

  removeItem(id: string, quantity: number): boolean {
    for (const slot of this.slots) {
      if (slot.id === id && slot.quantity >= quantity) {
        slot.quantity -= quantity;
        if (slot.quantity === 0) {
          this.slots = this.slots.filter(s => s !== slot);
        }
        return true;
      }
    }
    return false;
  }

  hasItem(id: string, quantity: number = 1): boolean {
    let count = 0;
    for (const slot of this.slots) {
      if (slot.id === id) count += slot.quantity;
      if (count >= quantity) return true;
    }
    return false;
  }

  clear() {
    this.slots = [];
  }

  toJSON(): any {
    return { slots: this.slots };
  }

  fromJSON(data: any) {
    if (data?.slots) {
      this.slots = data.slots;
    }
  }

  // Add slot limit getter/setter and inventory utility methods
  getMaxSlots(): number {
    return this.maxSlots;
  }
  setMaxSlots(n: number) {
    this.maxSlots = n;
    if (this.slots.length > n) {
      this.slots = this.slots.slice(0, n);
    }
  }
  findItem(id: string): ItemInstance | undefined {
    return this.slots.find(slot => slot.id === id);
  }
}
