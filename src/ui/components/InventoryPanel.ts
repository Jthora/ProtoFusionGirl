// InventoryPanel: Simple UI for inventory (slots, drag/drop, use, equip)
import type { InventoryService } from '../../world/inventory/InventoryService';
import type { EquipmentService } from '../../world/equipment/EquipmentService';
import type { EquipmentSlot } from '../../world/equipment/EquipmentSlot';

export class InventoryPanel {
  private service: InventoryService;
  private x: number;
  private y: number;
  private equipmentService?: EquipmentService;
  private equipSlot?: EquipmentSlot;

  constructor(service: InventoryService, x: number = 20, y: number = 300) {
    this.service = service;
    this.x = x;
    this.y = y;
  }

  setEquipmentIntegration(equipmentService: EquipmentService, slot: EquipmentSlot) {
    this.equipmentService = equipmentService;
    this.equipSlot = slot;
  }

  render(scene: Phaser.Scene) {
    const items = this.service.getItems();
    let slotX = this.x;
    let slotY = this.y;
    const slotSize = 40;
    const margin = 8;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const def = this.service.getItemDefinition(item.id);
      const icon = def?.icon || '?';
      const txt = `${icon} x${item.quantity}`;
      const textObj = scene.add.text(slotX, slotY, txt, { font: '18px monospace', color: '#fff', backgroundColor: '#222' }).setDepth(1000);
      textObj.setInteractive().on('pointerdown', () => {
        if (this.equipmentService && this.equipSlot && def && def.type === 'weapon') {
          // Example: only allow equipping weapons to weapon slot
          this.service.equipFromInventory(item.id, this.equipSlot, this.equipmentService);
        } else {
          this.service.useItem(item.id);
        }
        // Optionally: re-render or show feedback
      });
      textObj.on('pointerover', () => {
        if (def?.description) {
          const tooltip = scene.add.text(slotX, slotY - 24, def.description, { font: '14px monospace', color: '#ff0', backgroundColor: '#333' }).setDepth(2000);
          textObj.once('pointerout', () => tooltip.destroy());
        }
      });
      slotX += slotSize + margin;
      if ((i + 1) % 5 === 0) {
        slotX = this.x;
        slotY += slotSize + margin;
      }
    }
  }
}
