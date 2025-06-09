// TimelinePanel.ts
// Simple prototype UI for timeline/branch navigation in ProtoFusionGirl
// Shows a list/tree of branches, allows switching, and displays parent/child relationships
import Phaser from 'phaser';
import { TilemapManager } from '../../world/tilemap/TilemapManager';
import { EventBus } from '../../core/EventBus';

interface BranchInfo {
  id: string;
  parentId?: string;
  label: string;
  created: number;
}

export class TimelinePanel extends Phaser.GameObjects.Container {
  private tilemapManager: TilemapManager;
  private branches: BranchInfo[] = [];
  public width: number;
  public height: number;
  private branchButtons: Phaser.GameObjects.Text[] = [];
  private eventBus?: EventBus;

  constructor(scene: Phaser.Scene, tilemapManager: TilemapManager, width = 320, height = 240, eventBus?: EventBus) {
    super(scene);
    this.tilemapManager = tilemapManager;
    this.width = width;
    this.height = height;
    this.eventBus = eventBus;
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(1002);
    this.setPosition(250, 80); // Right of anchor panel
    this.refreshBranches();
    this.drawPanel();
    // --- Listen for branchSwitch events from anchor panel or other sources ---
    scene.events.on('branchSwitch', (branchId: string) => {
      this.switchBranch(branchId);
      this.refreshBranches();
      this.drawPanel();
    });
    // TODO: Listen for unified branch events from eventBus for real-time updates
    // if (this.eventBus) this.eventBus.on('BRANCH_UPDATED', ...)
  }

  private refreshBranches() {
    // Prototype: get all branch IDs and info from tilemapManager (stub)
    // In a real system, fetch from TimestreamManager or similar
    if ((this.tilemapManager as any).getAllBranches) {
      this.branches = (this.tilemapManager as any).getAllBranches();
    } else {
      // Fallback: show only main branch
      this.branches = [{ id: 'main', label: 'Main Timeline', created: Date.now() }];
    }
  }

  private drawPanel() {
    this.removeAll(true);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x223344, 0.85);
    bg.fillRect(0, 0, this.width, this.height);
    bg.lineStyle(2, 0xffffff, 0.8);
    bg.strokeRect(0, 0, this.width, this.height);
    this.add(bg);
    const title = this.scene.add.text(10, 8, 'Timeline Navigation', { color: '#fff', fontSize: '16px' });
    this.add(title);
    let y = 40;
    this.branchButtons.forEach(btn => btn.destroy());
    this.branchButtons = [];
    for (const branch of this.branches) {
      const label = `${branch.label || branch.id} (${new Date(branch.created).toLocaleTimeString()})`;
      const isActive = branch.id === this.tilemapManager.getCurrentBranch();
      const btn = this.scene.add.text(10, y, label, { color: isActive ? '#00ffcc' : '#00ccff', fontSize: '14px' })
        .setInteractive()
        .on('pointerdown', () => this.switchBranch(branch.id));
      this.add(btn);
      this.branchButtons.push(btn);
      // Show parent/child info (prototype)
      if (branch.parentId) {
        const parentTxt = this.scene.add.text(180, y, `Parent: ${branch.parentId}`, { color: '#cccccc', fontSize: '12px' });
        this.add(parentTxt);
      }
      // --- Prune (delete) branch button ---
      if (branch.id !== 'main') {
        const pruneBtn = this.scene.add.text(270, y, '[Prune]', { color: '#ff4444', fontSize: '12px' })
          .setInteractive()
          .on('pointerdown', () => this.pruneBranch(branch.id));
        this.add(pruneBtn);
        // --- Merge branch button (merge into parent) ---
        if (branch.parentId) {
          const mergeBtn = this.scene.add.text(210, y, '[Merge]', { color: '#00ff99', fontSize: '12px' })
            .setInteractive()
            .on('pointerdown', () => this.mergeBranch(branch.id, branch.parentId!));
          this.add(mergeBtn);
        }
      }
      y += 28;
    }
  }

  private async switchBranch(branchId: string) {
    if (this.tilemapManager.switchBranch) {
      this.tilemapManager.switchBranch(branchId);
      // TODO: Emit event to eventBus for state sync (type-safe)
      // if (this.eventBus) this.eventBus.emit({ type: 'BRANCH_SWITCHED', data: { branchId } } as any);
      // UI feedback
      const toast = this.scene.add.text(10, this.height + 10, `Switched to branch: ${branchId}`, { color: '#00ffcc', fontSize: '12px' })
        .setDepth(2002).setScrollFactor(0).setAlpha(0.9).setInteractive();
      toast.on('pointerdown', () => { toast.destroy(); });
    }
  }

  // --- Branch Pruning ---
  private pruneBranch(branchId: string) {
    if (!confirm(`Delete branch ${branchId}? This cannot be undone.`)) return;
    if ((this.tilemapManager as any).deleteBranch) {
      (this.tilemapManager as any).deleteBranch(branchId);
      // TODO: Emit event to eventBus for state sync (type-safe)
      // if (this.eventBus) this.eventBus.emit({ type: 'BRANCH_PRUNED', data: { branchId } } as any);
      this.refreshBranches();
      this.drawPanel();
      const toast = this.scene.add.text(10, this.height + 40, `Pruned branch: ${branchId}`, { color: '#ff4444', fontSize: '12px' })
        .setDepth(2002).setScrollFactor(0).setAlpha(0.9).setInteractive();
      toast.on('pointerdown', () => { toast.destroy(); });
    }
  }

  // --- Branch Merging ---
  private mergeBranch(childId: string, parentId: string) {
    if (!confirm(`Merge branch ${childId} into ${parentId}? This cannot be undone.`)) return;
    if ((this.tilemapManager as any).mergeBranch) {
      (this.tilemapManager as any).mergeBranch(childId, parentId);
      // TODO: Emit event to eventBus for state sync (type-safe)
      // if (this.eventBus) this.eventBus.emit({ type: 'BRANCH_MERGED', data: { childId, parentId } } as any);
      this.refreshBranches();
      this.drawPanel();
      const toast = this.scene.add.text(10, this.height + 60, `Merged ${childId} into ${parentId}`, { color: '#00ff99', fontSize: '12px' })
        .setDepth(2002).setScrollFactor(0).setAlpha(0.9).setInteractive();
      toast.on('pointerdown', () => { toast.destroy(); });
    }
  }
}
