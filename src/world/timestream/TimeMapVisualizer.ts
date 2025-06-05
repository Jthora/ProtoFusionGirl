// TimeMapVisualizer.ts
// UI for displaying time maps, branches, and player position in timestream
import Phaser from 'phaser';
import { TimeMap } from './types';

export type TimeMapPlugin = (visualizer: TimeMapVisualizer, map: TimeMap) => void;

export class TimeMapVisualizer {
  private plugins: TimeMapPlugin[] = [];
  private overlayGroup?: Phaser.GameObjects.Group;

  render(map: TimeMap): void {
    // Call plugins for extensibility
    for (const plugin of this.plugins) {
      plugin(this, map);
    }
  }

  /**
   * Render the time map as an overlay in the given Phaser.Scene.
   * This draws nodes as circles and edges as lines, with labels.
   * Player position can be highlighted by passing a playerNodeId.
   */
  renderOverlay(scene: Phaser.Scene, map: TimeMap, playerNodeId?: string) {
    // Remove previous overlay if present
    if (this.overlayGroup) {
      this.overlayGroup.clear(true, true);
    }
    this.overlayGroup = scene.add.group();
    // Layout: simple horizontal tree (improve with better layout if needed)
    const nodeRadius = 18;
    const spacingX = 90;
    const spacingY = 70;
    const startX = 120;
    const startY = 120;
    // Assign positions to nodes (simple layout: root at top, branches below)
    const nodePositions: Record<string, { x: number, y: number }> = {};
    let level = 0;
    let nodesAtLevel = 1;
    let i = 0;
    for (const node of map.nodes) {
      const x = startX + (i % nodesAtLevel) * spacingX;
      const y = startY + level * spacingY;
      nodePositions[node.id] = { x, y };
      i++;
      if (i % nodesAtLevel === 0) {
        level++;
        nodesAtLevel++;
      }
    }
    // Draw edges
    for (const edge of map.edges) {
      const from = nodePositions[edge.from];
      const to = nodePositions[edge.to];
      if (from && to) {
        const line = scene.add.line(0, 0, from.x, from.y, to.x, to.y, 0x8888ff, 0.7).setLineWidth(2);
        this.overlayGroup.add(line);
      }
    }
    // Draw nodes
    for (const node of map.nodes) {
      const pos = nodePositions[node.id];
      if (!pos) continue;
      const color = node.id === playerNodeId ? 0x00ffcc : node.type === 'timestream' ? 0xffcc00 : node.type === 'timeline' ? 0x00ccff : 0xffffff;
      const circle = scene.add.circle(pos.x, pos.y, nodeRadius, color, 0.85).setStrokeStyle(2, 0x222244);
      this.overlayGroup.add(circle);
      const label = scene.add.text(pos.x, pos.y - nodeRadius - 12, node.ref?.label || node.id, { font: '14px monospace', color: '#fff', backgroundColor: '#222244' }).setOrigin(0.5, 1);
      this.overlayGroup.add(label);
    }
    // Add close button
    const closeBtn = scene.add.text(scene.scale.width - 60, 40, '[X]', { font: '20px monospace', color: '#ff4444', backgroundColor: '#222' })
      .setInteractive()
      .setDepth(2000)
      .on('pointerdown', () => {
        if (this.overlayGroup) this.overlayGroup.setVisible(false);
      });
    this.overlayGroup.add(closeBtn);
  }

  registerPlugin(plugin: TimeMapPlugin): void {
    this.plugins.push(plugin);
  }
}
