// RepairMigrationWizard: UI for repairing and migrating save data, branches, and anchors.
// Prototype for world state repair/migration (see copilot_world_state_tooling artifact).
import Phaser from 'phaser';
import { TilemapManager } from '../../world/tilemap/TilemapManager';
import { EventBus } from '../../core/EventBus';

export class RepairMigrationWizard extends Phaser.GameObjects.Container {
  private tilemapManager: TilemapManager;
  private width: number;
  private height: number;
  private branchId: string;
  private eventBus: EventBus;

  constructor(scene: Phaser.Scene, tilemapManager: TilemapManager, branchId: string, width = 400, height = 220, eventBus: EventBus) {
    super(scene);
    this.tilemapManager = tilemapManager;
    this.branchId = branchId;
    this.width = width;
    this.height = height;
    this.eventBus = eventBus;
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(1100);
    this.setPosition(200, 200);
    this.drawPanel();
  }

  private drawPanel() {
    this.removeAll(true);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2a1a1a, 0.96);
    bg.fillRect(0, 0, this.width, this.height);
    bg.lineStyle(2, 0xffcc00, 0.8);
    bg.strokeRect(0, 0, this.width, this.height);
    this.add(bg);
    const title = this.scene.add.text(10, 8, `Repair/Migrate Branch: ${this.branchId}`, { color: '#ffcc00', fontSize: '16px' });
    this.add(title);
    // --- Prototype: Show repair/migration options ---
    const repairBtn = this.scene.add.text(20, 50, '[Auto-Repair Common Issues]', { color: '#00ff99', fontSize: '14px' })
      .setInteractive()
      .on('pointerdown', () => this.autoRepair());
    this.add(repairBtn);
    const migrateBtn = this.scene.add.text(20, 90, '[Migrate to Latest Format]', { color: '#00ccff', fontSize: '14px' })
      .setInteractive()
      .on('pointerdown', () => this.migrateBranch());
    this.add(migrateBtn);
    const closeBtn = this.scene.add.text(20, 150, '[Close]', { color: '#ff4444', fontSize: '14px' })
      .setInteractive()
      .on('pointerdown', () => this.destroy());
    this.add(closeBtn);
  }

  private autoRepair() {
    // Emit event for auto-repair request
    this.eventBus.emit({ type: 'BRANCH_REPAIR_REQUESTED', data: { branchId: this.branchId } } as any);
    // TODO: Implement actual repair logic for corrupted or outdated save data.
  }

  private migrateBranch() {
    // Emit event for migration request
    this.eventBus.emit({ type: 'BRANCH_MIGRATION_REQUESTED', data: { branchId: this.branchId } } as any);
    // TODO: Implement actual migration logic via WorldStateManager
    // TODO: Add migration steps for schema/version upgrades.
  }
}
// TODO: Integrate with feedback/logging system for repair outcomes.
