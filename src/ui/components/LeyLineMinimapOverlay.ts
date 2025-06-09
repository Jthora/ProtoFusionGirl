// DEPRECATED: LeyLineMinimapOverlay is now obsolete. All ley line minimap overlay logic is unified in Minimap.ts.
// This file is retained for reference and will be removed in a future cleanup.
// See copilot_leyline_tilemap_traversal_integration_2025-06-07.artifact for migration details.

// LeyLineMinimapOverlay.ts
// Minimap overlay for ley line visualization (player & dev/debug)

import Phaser from 'phaser';
import { LeyLineVisualization } from '../../world/leyline/visualization/LeyLineVisualization';
import { LeyLine } from '../../world/leyline/types';

export class LeyLineMinimapOverlay {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private scale: number;
  private visible: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, scale: number = 0.1) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.scale = scale;
    this.graphics = scene.add.graphics();
    this.graphics.setScrollFactor(0).setDepth(2000);
    this.graphics.setPosition(x, y);
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    this.graphics.setVisible(visible);
  }

  render(leyLines: LeyLine[], eventOverlays: any[] = []) {
    if (!this.visible) return;
    this.graphics.clear();
    this.graphics.lineStyle(2, 0x00ffff, 0.7);
    const renderData = LeyLineVisualization.getRenderData(leyLines, eventOverlays);
    // Draw ley line segments
    for (const line of renderData.lines) {
      this.graphics.strokeLineShape(new Phaser.Geom.Line(
        line.from.x * this.scale,
        line.from.y * this.scale,
        line.to.x * this.scale,
        line.to.y * this.scale
      ));
    }
    // Draw nodes
    for (const node of renderData.nodes) {
      this.graphics.fillStyle(node.state === 'active' ? 0x00ffcc : 0x888888, 1);
      this.graphics.fillCircle(node.position.x * this.scale, node.position.y * this.scale, 4);
    }
    // Draw overlays (event highlights)
    for (const overlay of renderData.overlays) {
      if (overlay.affectedTiles) {
        this.graphics.fillStyle(overlay.color === 'cyan' ? 0x00ffff : overlay.color === 'red' ? 0xff4444 : 0xffff00, 0.3);
        for (const tile of overlay.affectedTiles) {
          this.graphics.fillRect(tile.x * 32 * this.scale, tile.y * 32 * this.scale, 32 * this.scale, 32 * this.scale);
        }
      }
    }
  }
}
