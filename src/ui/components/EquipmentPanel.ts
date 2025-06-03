// EquipmentPanel: UI for equipping/unequipping items, showing equipped gear and stat changes
import type { EquipmentService } from '../../world/equipment/EquipmentService';
import type { PlayerStats } from '../../world/player/PlayerStats';
import type { EquipmentSlot } from '../../world/equipment/EquipmentSlot';

export class EquipmentPanel {
  private service: EquipmentService;
  private stats: PlayerStats;
  private x: number;
  private y: number;

  constructor(service: EquipmentService, stats: PlayerStats, x: number = 400, y: number = 300) {
    this.service = service;
    this.stats = stats;
    this.x = x;
    this.y = y;
  }

  render(scene: Phaser.Scene) {
    const equipped = this.service.getAllEquipped();
    let slotY = this.y;
    for (const eq of equipped) {
      const def = this.service['registry'].getEquipment(eq.id);
      const txt = `${def?.icon || '?'} ${def?.name || eq.id}`;
      const textObj = scene.add.text(this.x, slotY, txt, { font: '18px monospace', color: '#fff', backgroundColor: '#222' }).setDepth(1000);
      textObj.setInteractive().on('pointerdown', () => {
        this.service.unequipItem(eq.slot);
        // Optionally: re-render or show feedback
      });
      textObj.on('pointerover', () => {
        if (def?.description) {
          const tooltip = scene.add.text(this.x, slotY - 24, def.description, { font: '14px monospace', color: '#ff0', backgroundColor: '#333' }).setDepth(2000);
          textObj.once('pointerout', () => tooltip.destroy());
        }
      });
      slotY += 36;
    }
    // Show stats
    const stats = this.stats.getStats();
    let statsY = slotY + 16;
    for (const k of Object.keys(stats)) {
      scene.add.text(this.x, statsY, `${k}: ${(stats as any)[k]}`, { font: '16px monospace', color: '#ff0' }).setDepth(1000);
      statsY += 22;
    }
    // Show empty slots for equipping
    const allSlots: EquipmentSlot[] = ['head', 'body', 'legs', 'feet', 'weapon', 'shield', 'accessory'];
    for (const slot of allSlots) {
      if (!this.service.getEquipped(slot)) {
        const slotLabel = scene.add.text(this.x + 180, this.y + allSlots.indexOf(slot) * 36, `[${slot}]`, { font: '16px monospace', color: '#888' }).setDepth(1000);
        slotLabel.setInteractive().on('pointerdown', () => {
          // Optionally: open inventory to equip
        });
      }
    }
  }
}
