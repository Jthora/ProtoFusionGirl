import Phaser from 'phaser';
import { TilemapManager } from '../../world/tilemap/TilemapManager';

/**
 * Minimap UI component with toroidal world logic.
 * Renders player, enemies, and loaded chunks, wrapping seamlessly at the world seam.
 */
export class Minimap extends Phaser.GameObjects.Container {
  private tilemapManager: TilemapManager;
  private player: Phaser.GameObjects.Sprite;
  private getEnemies: () => { x: number, y: number }[];
  private width: number;
  private height: number;
  private minimapBg: Phaser.GameObjects.Graphics;
  private playerDot: Phaser.GameObjects.Graphics;
  private enemyDots: Phaser.GameObjects.Graphics[] = [];
  private chunkDots: Phaser.GameObjects.Graphics[] = [];
  private anchorDots: Phaser.GameObjects.Graphics[] = [];

  constructor(
    scene: Phaser.Scene,
    tilemapManager: TilemapManager,
    player: Phaser.GameObjects.Sprite,
    getEnemies: () => { x: number, y: number }[],
    width = 200,
    height = 60
  ) {
    super(scene);
    this.tilemapManager = tilemapManager;
    this.player = player;
    this.getEnemies = getEnemies;
    this.width = width;
    this.height = height;
    this.minimapBg = scene.add.graphics();
    this.playerDot = scene.add.graphics();
    this.add([this.minimapBg, this.playerDot]);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(1000);
    this.setPosition(10, 10); // Top-left corner
  }

  /**
   * Customizes the minimap appearance and adds seam-edge rendering for toroidal wrap.
   * - Player and enemies near the seam are drawn on both edges for seamlessness.
   * - Adds a border and chunk grid overlay for clarity.
   */
  updateMinimap() {
    const w = this.width, h = this.height;
    const worldW = TilemapManager.WORLD_WIDTH;
    const worldH = TilemapManager.WORLD_HEIGHT;
    // Clear previous
    this.minimapBg.clear();
    this.playerDot.clear();
    this.enemyDots.forEach(dot => dot.destroy());
    this.enemyDots = [];
    this.chunkDots.forEach(dot => dot.destroy());
    this.chunkDots = [];
    // Draw background and border
    this.minimapBg.fillStyle(0x222244, 0.7);
    this.minimapBg.fillRect(0, 0, w, h);
    this.minimapBg.lineStyle(2, 0xffffff, 0.8);
    this.minimapBg.strokeRect(0, 0, w, h);
    // Draw chunk grid overlay (optional, for clarity)
    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    const numChunks = Math.ceil(worldW / (chunkSize * 16));
    for (let i = 0; i < numChunks; i++) {
      const x = (i * chunkSize * 16) / worldW * w;
      this.minimapBg.lineStyle(1, 0x444488, 0.3);
      this.minimapBg.beginPath();
      this.minimapBg.moveTo(x, 0);
      this.minimapBg.lineTo(x, h);
      this.minimapBg.strokePath();
    }
    // Draw loaded chunks
    const loadedChunks = this.tilemapManager.chunkManager.getLoadedChunks?.() || [];
    if (Array.isArray(loadedChunks)) {
      for (const chunk of loadedChunks) {
        const chunkX = TilemapManager.wrapX(chunk.x * chunk.size) / worldW * w;
        const chunkY = chunk.y / worldH * h;
        const dot = this.scene.add.graphics();
        dot.fillStyle(0x8888ff, 0.5);
        dot.fillRect(chunkX, chunkY, 4, 4);
        this.add(dot);
        this.chunkDots.push(dot);
      }
    }
    // Draw player (with seam-edge rendering)
    const px = TilemapManager.wrapX(this.player.x) / worldW * w;
    const py = this.player.y / worldH * h;
    this.playerDot.fillStyle(0x00ff00, 1);
    this.playerDot.fillCircle(px, py, 4);
    // If player is near left/right edge, also draw on opposite edge
    if (px < 8) this.playerDot.fillCircle(px + w, py, 4);
    if (px > w - 8) this.playerDot.fillCircle(px - w, py, 4);
    // Draw enemies (with seam-edge rendering)
    for (const enemy of this.getEnemies()) {
      const ex = TilemapManager.wrapX(enemy.x) / worldW * w;
      const ey = enemy.y / worldH * h;
      const dot = this.scene.add.graphics();
      dot.fillStyle(0xff4444, 1);
      dot.fillCircle(ex, ey, 3);
      // If enemy is near left/right edge, also draw on opposite edge
      if (ex < 8) dot.fillCircle(ex + w, ey, 3);
      if (ex > w - 8) dot.fillCircle(ex - w, ey, 3);
      this.add(dot);
      this.enemyDots.push(dot);
    }
  }

  /**
   * Draws warp anchor markers on the minimap for all anchors in storage.
   * Call this after updateMinimap() in the main scene update loop.
   * @param anchors Array of { x, y, datakey } for anchor locations
   */
  drawWarpAnchors(anchors: { x: number, y: number, datakey: string }[]) {
    // Remove old anchor markers
    this.anchorDots.forEach(dot => dot.destroy());
    this.anchorDots = [];
    const w = this.width, h = this.height;
    const worldW = TilemapManager.WORLD_WIDTH;
    const worldH = TilemapManager.WORLD_HEIGHT;
    for (const anchor of anchors) {
      const ax = TilemapManager.wrapX(anchor.x) / worldW * w;
      const ay = anchor.y / worldH * h;
      const dot = this.scene.add.graphics();
      dot.fillStyle(0x00ffff, 1);
      dot.fillCircle(ax, ay, 5);
      // Draw on both edges if near seam
      if (ax < 8) dot.fillCircle(ax + w, ay, 5);
      if (ax > w - 8) dot.fillCircle(ax - w, ay, 5);
      // Add datakey tooltip on hover
      dot.setInteractive(new Phaser.Geom.Circle(ax, ay, 8), Phaser.Geom.Circle.Contains)
        .on('pointerover', () => {
          const tooltip = this.scene.add.text(ax + 10, ay - 10, anchor.datakey.slice(0, 16) + '...', { color: '#00ffff', fontSize: '12px', backgroundColor: '#222244' });
          dot.once('pointerout', () => tooltip.destroy());
        });
      this.add(dot);
      this.anchorDots.push(dot);
    }
  }
}
