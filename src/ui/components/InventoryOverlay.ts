// InventoryOverlay.ts
// Minimal inventory UI overlay for ProtoFusionGirl
import Phaser from 'phaser';
import { InventoryManager, Item } from '../../core/InventoryManager';

export class InventoryOverlay {
  private scene: Phaser.Scene;
  private inventoryManager: InventoryManager;
  private textObj: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, inventoryManager: InventoryManager) {
    this.scene = scene;
    this.inventoryManager = inventoryManager;
    this.textObj = this.scene.add.text(16, 16, '', { font: '18px monospace', color: '#fff', backgroundColor: '#222' })
      .setScrollFactor(0)
      .setDepth(1000);
    this.updateText();
    this.inventoryManager.onInventoryChanged(() => this.updateText());
  }

  private updateText() {
    const items = Array.from(this.inventoryManager['items'].values());
    if (items.length === 0) {
      this.textObj.setText('Inventory: (empty)');
    } else {
      this.textObj.setText('Inventory: ' + items.map(i => `${i.name} x${i.quantity}`).join(', '));
    }
  }

  destroy() {
    this.textObj.destroy();
  }
}
