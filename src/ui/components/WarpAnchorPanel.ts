import Phaser from 'phaser';
import { TilemapManager } from '../../world/tilemap/TilemapManager';
import { WarpZone, extractWarpZone } from '../../world/tilemap/WarpZoneUtils';
import { saveWarpZoneToStorage, restoreWarpZoneFromDatakey } from '../../world/tilemap/WorldGenWarp';
import { UniversalLanguagePuzzleModal } from './UniversalLanguagePuzzleModal';

/**
 * WarpAnchorPanel: UI for creating, listing, and restoring warp anchors (reality warping).
 * - Allows player to create a warp anchor at their current position.
 * - Lists saved anchors and allows restoring them.
 * - Integrates with minimap for anchor visualization.
 */
export class WarpAnchorPanel extends Phaser.GameObjects.Container {
  private tilemapManager: TilemapManager;
  private player: Phaser.GameObjects.Sprite;
  private storage: Record<string, string>;
  private anchors: { datakey: string, zone: WarpZone, name: string, created: number }[] = [];
  private width: number;
  private height: number;
  private panelBg: Phaser.GameObjects.Graphics;
  private anchorButtons: Phaser.GameObjects.Text[] = [];

  constructor(
    scene: Phaser.Scene,
    tilemapManager: TilemapManager,
    player: Phaser.GameObjects.Sprite,
    storage: Record<string, string>,
    width = 220,
    height = 180
  ) {
    super(scene);
    this.tilemapManager = tilemapManager;
    this.player = player;
    this.storage = storage;
    this.width = width;
    this.height = height;
    this.panelBg = scene.add.graphics();
    this.add(this.panelBg);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(1001);
    this.setPosition(10, 80); // Below minimap
    this.loadAnchorsFromStorage();
    this.drawPanel();
  }

  private loadAnchorsFromStorage() {
    const anchorsJson = localStorage.getItem('warpAnchors');
    if (anchorsJson) {
      try {
        this.anchors = JSON.parse(anchorsJson);
      } catch {
        this.anchors = [];
      }
    }
  }

  private saveAnchorsToStorage() {
    localStorage.setItem('warpAnchors', JSON.stringify(this.anchors));
  }

  private drawPanel() {
    this.panelBg.clear();
    this.panelBg.fillStyle(0x222244, 0.85);
    this.panelBg.fillRect(0, 0, this.width, this.height);
    this.panelBg.lineStyle(2, 0xffffff, 0.8);
    this.panelBg.strokeRect(0, 0, this.width, this.height);
    // Title
    const title = this.scene.add.text(10, 8, 'Warp Anchors', { color: '#fff', fontSize: '16px' });
    this.add(title);
    // Create anchor button
    const createBtn = this.scene.add.text(10, 32, '[Create Anchor]', { color: '#00ffcc', fontSize: '14px' })
      .setInteractive()
      .on('pointerdown', () => this.createAnchor());
    this.add(createBtn);
    // Import anchor button
    const importBtn = this.scene.add.text(120, 32, '[Import Anchor]', { color: '#00ccff', fontSize: '14px' })
      .setInteractive()
      .on('pointerdown', () => this.importAnchor());
    this.add(importBtn);
    // List anchors
    let y = 60;
    this.anchorButtons.forEach(btn => btn.destroy());
    this.anchorButtons = [];
    for (const [i, anchor] of this.anchors.entries()) {
      const label = `${anchor.name || anchor.datakey.slice(0, 8)} (${new Date(anchor.created).toLocaleTimeString()})`;
      const btn = this.scene.add.text(10, y, label, { color: '#ffcc00', fontSize: '13px' })
        .setInteractive()
        .on('pointerdown', () => this.restoreAnchor(anchor.datakey));
      this.add(btn);
      this.anchorButtons.push(btn);
      // Export button
      const exportBtn = this.scene.add.text(160, y, '[Export]', { color: '#00ff99', fontSize: '12px' })
        .setInteractive()
        .on('pointerdown', () => this.exportAnchor(i));
      this.add(exportBtn);
      // Delete button
      const delBtn = this.scene.add.text(200, y, '[X]', { color: '#ff4444', fontSize: '12px' })
        .setInteractive()
        .on('pointerdown', () => this.deleteAnchor(i));
      this.add(delBtn);
      y += 22;
    }
  }

  // Universal Language Puzzle Modal (real integration)
  private showUniversalLanguagePuzzle(action: 'create' | 'restore'): Promise<boolean> {
    return new Promise((resolve) => {
      const modal = new UniversalLanguagePuzzleModal(this.scene, (success: boolean) => {
        resolve(success);
      });
      this.scene.add.existing(modal);
    });
  }

  private async createAnchor() {
    const passed = await this.showUniversalLanguagePuzzle('create');
    if (!passed) {
      alert('Universal Language puzzle failed. Anchor not created.');
      return;
    }
    const name = prompt('Name this warp anchor:', 'Anchor ' + (this.anchors.length + 1)) || '';
    const zoneWidth = 96, zoneHeight = 48;
    const originX = Math.floor(this.player.x) - Math.floor(zoneWidth / 2);
    const originY = Math.floor(this.player.y) - Math.floor(zoneHeight / 2);
    const zone = extractWarpZone(this.tilemapManager, originX, originY, zoneWidth, zoneHeight);
    const datakey = await saveWarpZoneToStorage(zone, this.storage);
    this.anchors.push({ datakey, zone, name, created: Date.now() });
    this.saveAnchorsToStorage();
    this.drawPanel();
  }

  private async restoreAnchor(datakey: string) {
    const passed = await this.showUniversalLanguagePuzzle('restore');
    if (!passed) {
      alert('Universal Language puzzle failed. Anchor not restored.');
      return;
    }
    // Visual effect: screen flash and distortion
    this.playWarpVisualEffect();
    // Sound effect: play warp sound
    this.playWarpSound();
    await restoreWarpZoneFromDatakey(this.tilemapManager, datakey, this.storage);
  }

  private playWarpVisualEffect() {
    // Simple white flash overlay
    const flash = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0xffffff,
      0.7
    ).setScrollFactor(0).setDepth(2000);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy()
    });
    // Optional: add a slight camera shake
    this.scene.cameras.main.shake(250, 0.01);
  }

  private playWarpSound() {
    // Play a warp/teleport sound if loaded in the scene
    if (this.scene.sound && this.scene.sound.get('warp')) {
      this.scene.sound.play('warp');
    }
  }

  private exportAnchor(index: number) {
    const anchor = this.anchors[index];
    const datablob = JSON.stringify(anchor.zone);
    navigator.clipboard.writeText(datablob);
    alert('Warp anchor copied to clipboard!');
  }

  private async importAnchor() {
    const datablob = prompt('Paste warp anchor datablob:');
    if (!datablob) return;
    try {
      const zone = JSON.parse(datablob);
      const name = prompt('Name this imported anchor:', 'Imported Anchor') || '';
      const datakey = await saveWarpZoneToStorage(zone, this.storage);
      this.anchors.push({ datakey, zone, name, created: Date.now() });
      this.saveAnchorsToStorage();
      this.drawPanel();
    } catch {
      alert('Invalid warp anchor datablob!');
    }
  }

  private deleteAnchor(index: number) {
    if (confirm('Delete this warp anchor?')) {
      this.anchors.splice(index, 1);
      this.saveAnchorsToStorage();
      this.drawPanel();
    }
  }
}
