// InventoryManager.ts
// Manages player inventory, items, crafting, and trading

export interface Item {
  id: string;
  name: string;
  type: string;
  quantity: number;
  // ...other item fields
}

export class InventoryManager {
  private items: Map<string, Item> = new Map();

  // Event hooks for inventory UI/world integration
  private inventoryChangedCallbacks: Array<(items: Item[]) => void> = [];

  onInventoryChanged(callback: (items: Item[]) => void) {
    this.inventoryChangedCallbacks.push(callback);
  }

  private emitInventoryChanged() {
    this.inventoryChangedCallbacks.forEach(cb => cb(Array.from(this.items.values())));
  }

  addItem(item: Item) {
    const existing = this.items.get(item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.set(item.id, { ...item });
    }
    this.emitInventoryChanged();
  }

  removeItem(id: string, quantity: number = 1) {
    const item = this.items.get(id);
    if (item) {
      item.quantity -= quantity;
      if (item.quantity <= 0) this.items.delete(id);
      this.emitInventoryChanged();
    }
  }

  getItem(id: string): Item | undefined {
    return this.items.get(id);
  }

  // Extension point: modding hook
  static globalInstance: InventoryManager | null = null;

  static registerGlobalInstance(instance: InventoryManager) {
    InventoryManager.globalInstance = instance;
  }

  static spawnTestItem(scene: Phaser.Scene, onPickup: () => void): Phaser.GameObjects.Sprite {
    const sprite = scene.add.sprite(500, 300, 'player', 0).setTint(0xffcc00).setScale(0.6);
    sprite.setInteractive();
    sprite.on('pointerdown', () => {
      onPickup();
      sprite.destroy();
    });
    return sprite;
  }

  static isPlayerNearItem(playerSprite: Phaser.GameObjects.Sprite, itemSprite: Phaser.GameObjects.Sprite): boolean {
    const dist = Phaser.Math.Distance.Between(playerSprite.x, playerSprite.y, itemSprite.x, itemSprite.y);
    return dist < 48;
  }

  // ...stub: crafting, trading, inventory UI hooks
}

// Artifact: copilot_context_anchor_index_2025-06-05.artifact - InventoryManager extension points added

// ...stub: global InventoryManager instance, modding hooks
