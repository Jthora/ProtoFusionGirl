// MultiverseExplorerPanel: Visualizes the multiverse tree, supports diff/merge, and repair/migration tools.
// Prototype for world state diffing, visualization, and debugging (see copilot_world_state_tooling artifact).
import Phaser from 'phaser';
import { TilemapManager } from '../../world/tilemap/TilemapManager';

export class MultiverseExplorerPanel extends Phaser.GameObjects.Container {
  private tilemapManager: TilemapManager;
  private width: number;
  private height: number;
  private branchNodes: Phaser.GameObjects.Graphics[] = [];
  private branchLabels: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene, tilemapManager: TilemapManager, width = 480, height = 320) {
    super(scene);
    this.tilemapManager = tilemapManager;
    this.width = width;
    this.height = height;
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(1003);
    this.setPosition(600, 80); // Example position
    this.drawPanel();
  }

  private drawPanel() {
    this.removeAll(true);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a2a, 0.92);
    bg.fillRect(0, 0, this.width, this.height);
    bg.lineStyle(2, 0xffffff, 0.7);
    bg.strokeRect(0, 0, this.width, this.height);
    this.add(bg);
    const title = this.scene.add.text(10, 8, 'Multiverse Explorer', { color: '#fff', fontSize: '18px' });
    this.add(title);
    // --- Visualize branches as a tree/graph ---
    const branches = this.tilemapManager.getAllBranches();
    const nodeYSpacing = 48;
    let y = 48;
    this.branchNodes = [];
    this.branchLabels = [];
    for (const branch of branches) {
      const node = this.scene.add.graphics();
      node.fillStyle(0x00ccff, 1);
      node.fillCircle(40, y + 12, 12);
      this.add(node);
      this.branchNodes.push(node);
      const label = this.scene.add.text(60, y, `${branch.label || branch.id}`, { color: '#00ffcc', fontSize: '15px' });
      this.add(label);
      this.branchLabels.push(label);
      // Draw parent/child lines (prototype, not a real graph layout)
      if (branch.parentId) {
        const parentIdx = branches.findIndex(b => b.id === branch.parentId);
        if (parentIdx >= 0) {
          const parentY = 48 + parentIdx * nodeYSpacing;
          const line = this.scene.add.graphics();
          line.lineStyle(2, 0xcccccc, 0.7);
          line.beginPath();
          line.moveTo(40, y + 12);
          line.lineTo(40, parentY + 12);
          line.strokePath();
          this.add(line);
        }
      }
      // --- Diff/Merge/Repair buttons (prototypes) ---
      const diffBtn = this.scene.add.text(220, y, '[Diff]', { color: '#ffcc00', fontSize: '13px' })
        .setInteractive()
        .on('pointerdown', () => this.diffBranch(branch.id));
      this.add(diffBtn);
      const mergeBtn = this.scene.add.text(280, y, '[Merge]', { color: '#00ff99', fontSize: '13px' })
        .setInteractive()
        .on('pointerdown', () => this.mergeBranch(branch.id));
      this.add(mergeBtn);
      const repairBtn = this.scene.add.text(350, y, '[Repair]', { color: '#ff4444', fontSize: '13px' })
        .setInteractive()
        .on('pointerdown', () => this.repairBranch(branch.id));
      this.add(repairBtn);
      y += nodeYSpacing;
    }
  }

  private diffBranch(branchId: string) {
    // TODO: Implement world state diffing UI/modal for this branch
    alert(`Diff for branch: ${branchId} (prototype)`);
  }

  private mergeBranch(branchId: string) {
    // TODO: Implement merge UI/modal (select target branch, show preview, etc.)
    alert(`Merge for branch: ${branchId} (prototype)`);
  }

  private repairBranch(branchId: string) {
    // TODO: Implement repair/migration wizard for this branch
    alert(`Repair/Migrate branch: ${branchId} (prototype)`);
  }
}
