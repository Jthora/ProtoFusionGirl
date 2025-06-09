import Phaser from 'phaser';
import { TilemapManager } from '../../world/tilemap/TilemapManager';
import { LeyLineVisualization } from '../../world/leyline/visualization/LeyLineVisualization';
import { LeyLine } from '../../world/leyline/types';
import { EventBus } from '../../core/EventBus';
import { GameEvent } from '../../core/EventTypes';

/**
 * Minimap UI component with toroidal world logic.
 * Renders player, enemies, and loaded chunks, wrapping seamlessly at the world seam.
 */
export class Minimap extends Phaser.GameObjects.Container {
  private tilemapManager: TilemapManager;
  private player: Phaser.GameObjects.Sprite;
  private getEnemies: () => { x: number, y: number }[];
  public width: number;
  public height: number;
  private minimapBg: Phaser.GameObjects.Graphics;
  private playerDot: Phaser.GameObjects.Graphics;
  private enemyDots: Phaser.GameObjects.Graphics[] = [];
  private chunkDots: Phaser.GameObjects.Graphics[] = [];
  private anchorDots: Phaser.GameObjects.Graphics[] = [];
  private leyLineOverlay: Phaser.GameObjects.Graphics;
  private leyLines: LeyLine[] = [];
  private leyLineEventOverlays: any[] = [];
  private leyLineOverlayVisible: boolean = true;
  private overlayAnimationTime: number = 0;

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
    this.leyLineOverlay = scene.add.graphics();
    this.add([this.minimapBg, this.playerDot, this.leyLineOverlay]);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(1000);
    this.setPosition(10, 10); // Top-left corner
  }

  /**
   * Minimap overlay logic for ley line instability events
   * Called by UIManager when instability/surge/disruption/rift events occur
   */
  setLeyLineData(leyLines: LeyLine[], eventOverlays: any[] = []) {
    this.leyLines = leyLines;
    this.leyLineEventOverlays = eventOverlays;
    // Overlay: highlight unstable ley lines, surges, disruptions, rifts
    eventOverlays.forEach(overlay => {
      if (overlay.type === 'LEYLINE_INSTABILITY') {
        // Flash or highlight ley line in yellow
        this.flashLeyLine(overlay.leyLineId, 0xffff00);
      } else if (overlay.type === 'LEYLINE_SURGE') {
        // Highlight ley line in blue or with energy effect
        this.flashLeyLine(overlay.leyLineId, 0x00ccff);
      } else if (overlay.type === 'LEYLINE_DISRUPTION') {
        // Highlight ley line in red, block travel indicator
        this.flashLeyLine(overlay.leyLineId, 0xff4444);
      } else if (overlay.type === 'RIFT_FORMED') {
        // Show rift icon/effect at ley line/node location, flash region
        this.flashLeyLine(overlay.leyLineId, 0xaa00ff);
      }
    });
  }

  /**
   * Flash/highlight a ley line on the minimap for feedback.
   */
  private flashLeyLine(leyLineId: string, color: number) {
    // Find ley line and draw a flashing overlay (simple implementation)
    const leyLine = this.leyLines.find(l => l.id === leyLineId);
    if (!leyLine) return;
    // Draw overlay for each node
    leyLine.nodes.forEach(node => {
      const flash = this.scene.add.rectangle(
        node.position.x / 8, // scale to minimap
        node.position.y / 8,
        10, 10,
        color, 0.7
      ).setOrigin(0.5).setDepth(1002);
      this.add(flash);
      this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 900,
        onComplete: () => flash.destroy()
      });
    });
  }

  toggleLeyLineOverlayVisible() {
    this.leyLineOverlayVisible = !this.leyLineOverlayVisible;
    this.leyLineOverlay.setVisible(this.leyLineOverlayVisible);
  }

  /**
   * Customizes the minimap appearance and adds seam-edge rendering for toroidal wrap.
   * - Player and enemies near the seam are drawn on both edges for seamlessness.
   * - Adds a border and chunk grid overlay for clarity.
   */
  updateMinimap(delta: number = 0) {
    const w = this.width, h = this.height;
    const worldW = TilemapManager.WORLD_WIDTH;
    const worldH = TilemapManager.WORLD_HEIGHT;
    // Animate overlays if delta provided
    if (delta) this.overlayAnimationTime += delta;
    // Clear previous
    this.minimapBg.clear();
    this.playerDot.clear();
    this.enemyDots.forEach(dot => dot.destroy());
    this.enemyDots = [];
    this.chunkDots.forEach(dot => dot.destroy());
    this.chunkDots = [];
    this.leyLineOverlay.clear();
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
    // Draw ley line overlays (after background, before player/enemies)
    this.leyLineOverlay.clear();
    this.leyLineOverlay.setVisible(this.leyLineOverlayVisible);
    if (this.leyLineOverlayVisible && this.leyLines.length > 0) {
      const renderData = LeyLineVisualization.getRenderData(this.leyLines, this.leyLineEventOverlays);
      // Draw ley line segments
      this.leyLineOverlay.lineStyle(2, 0x00ffff, 0.7);
      for (const line of renderData.lines) {
        this.leyLineOverlay.strokeLineShape(new Phaser.Geom.Line(
          line.from.x / TilemapManager.WORLD_WIDTH * this.width,
          line.from.y / TilemapManager.WORLD_HEIGHT * this.height,
          line.to.x / TilemapManager.WORLD_WIDTH * this.width,
          line.to.y / TilemapManager.WORLD_HEIGHT * this.height
        ));
      }
      // Draw ley line nodes
      for (const node of renderData.nodes) {
        this.leyLineOverlay.fillStyle(node.state === 'active' ? 0x00ffcc : 0x888888, 1);
        this.leyLineOverlay.fillCircle(
          node.position.x / TilemapManager.WORLD_WIDTH * this.width,
          node.position.y / TilemapManager.WORLD_HEIGHT * this.height,
          3
        );
      }
      // Draw overlays (event highlights, animated)
      for (const overlay of renderData.overlays) {
        if (overlay.affectedTiles) {
          // Animate alpha for surges/disruptions
          let alpha = 0.3;
          if (overlay.type === 'LEYLINE_SURGE') {
            alpha = 0.3 + 0.2 * Math.abs(Math.sin(this.overlayAnimationTime / 400));
          } else if (overlay.type === 'LEYLINE_DISRUPTION') {
            alpha = 0.3 + 0.2 * Math.abs(Math.cos(this.overlayAnimationTime / 400));
          }
          const color = overlay.color === 'cyan' ? 0x00ffff : overlay.color === 'red' ? 0xff4444 : 0xffff00;
          this.leyLineOverlay.fillStyle(color, alpha);
          for (const tile of overlay.affectedTiles) {
            this.leyLineOverlay.fillRect(
              tile.x * 32 / TilemapManager.WORLD_WIDTH * this.width,
              tile.y * 32 / TilemapManager.WORLD_HEIGHT * this.height,
              32 / TilemapManager.WORLD_WIDTH * this.width,
              32 / TilemapManager.WORLD_HEIGHT * this.height
            );
          }
        }
      }
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

  /**
   * Attach the unified EventBus and listen for minimap update events.
   * This should be called once after instantiation.
   */
  attachEventBus(eventBus: EventBus) {
    eventBus.on('MINIMAP_LEYLINE_UPDATE', (event: GameEvent<'MINIMAP_LEYLINE_UPDATE'>) => {
      this.setLeyLineData(event.data.leyLines, event.data.eventOverlays);
    });
    eventBus.on('MINIMAP_OVERLAY_TOGGLE', (event: GameEvent<'MINIMAP_OVERLAY_TOGGLE'>) => {
      if (typeof event.data.visible === 'boolean') {
        this.leyLineOverlayVisible = event.data.visible;
        this.leyLineOverlay.setVisible(this.leyLineOverlayVisible);
      } else {
        this.toggleLeyLineOverlayVisible();
      }
    });
  }
}
