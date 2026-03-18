import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { WorldStateManager } from '../world/WorldStateManager';
import { UIManager } from '../core/UIManager';
import { UILayoutManager } from '../ui/layout/UILayoutManager';
import { LeyLineVisualization } from '../world/leyline/visualization/LeyLineVisualization';

export class LeyLineSceneIntegration {
  private scene: Phaser.Scene;
  private eventBus: EventBus;
  private worldStateManager: WorldStateManager;
  private uiManager: UIManager;
  private overlay: Phaser.GameObjects.Graphics;
  private eventHistory: any[] = [];

  constructor(config: {
    scene: Phaser.Scene;
    eventBus: EventBus;
    worldStateManager: WorldStateManager;
    uiManager: UIManager;
    uiLayoutManager: UILayoutManager;
  }) {
    this.scene = config.scene;
    this.eventBus = config.eventBus;
    this.worldStateManager = config.worldStateManager;
    this.uiManager = config.uiManager;

    // Create overlay graphics
    this.overlay = this.scene.add.graphics();
    this.overlay.setDepth(1000);

    // Register with layout manager
    config.uiLayoutManager.registerComponent('leyLineOverlay', this.overlay, 'overlays', 'debug');
    config.uiLayoutManager.hideComponent('leyLineOverlay');

    // Wire events
    this.eventBus.on('LEYLINE_SURGE', (event: any) => {
      this.eventHistory.push(event.data);
      this.refreshOverlay();
      this.showFeedback(event.data);
    });
    this.eventBus.on('LEYLINE_DISRUPTION', (event: any) => {
      this.eventHistory.push(event.data);
      this.refreshOverlay();
      this.showFeedback(event.data);
    });
    this.eventBus.on('LEYLINE_INSTABILITY', (event: any) => {
      if (event.data.leyLineId) {
        this.triggerVisualEffect(event.data.leyLineId, event.data.nodeId, event.data.severity);
      }
    });
    this.eventBus.on('LEYLINE_SURGE', (event: any) => {
      this.triggerVisualEffect(event.data.leyLineId, undefined, 'moderate');
    });
    this.eventBus.on('LEYLINE_DISRUPTION', (event: any) => {
      this.triggerVisualEffect(event.data.leyLineId, undefined, 'major');
    });
    this.eventBus.on('RIFT_FORMED', (event: any) => {
      if (event.data.leyLineId) {
        this.triggerVisualEffect(event.data.leyLineId, event.data.nodeId, 'major', true);
      }
    });

    // D key: toggle ley line overlay
    this.scene.input.keyboard?.on('keydown-D', () => {
      config.uiLayoutManager.toggleComponent('leyLineOverlay');
      this.uiManager.minimap?.toggleLeyLineOverlayVisible();
    });

    // Initial overlay draw
    this.refreshOverlay();
  }

  refreshOverlay(): void {
    this.overlay.clear();
    const leyLines = this.worldStateManager.getState().leyLines;
    const overlays = LeyLineVisualization.generateEventOverlays(this.eventHistory.slice(-5));
    const renderData = LeyLineVisualization.getRenderData(leyLines, overlays);

    this.overlay.lineStyle(3, 0x00ffff, 0.5);
    for (const line of renderData.lines) {
      this.overlay.strokeLineShape(new Phaser.Geom.Line(line.from.x, line.from.y, line.to.x, line.to.y));
    }
    for (const node of renderData.nodes) {
      this.overlay.fillStyle(node.state === 'active' ? 0x00ffcc : 0x888888, 1);
      this.overlay.fillCircle(node.position.x, node.position.y, 8);
    }
    for (const ov of renderData.overlays) {
      if (ov.affectedTiles) {
        this.overlay.fillStyle(ov.color === 'cyan' ? 0x00ffff : ov.color === 'red' ? 0xff4444 : 0xffff00, 0.4);
        for (const tile of ov.affectedTiles) {
          this.overlay.fillRect(tile.x * 32, tile.y * 32, 32, 32);
        }
      }
    }
    this.uiManager.setLeyLineMinimapData(leyLines, overlays);
    this.uiManager.minimap?.updateMinimap();
  }

  private showFeedback(eventData: any): void {
    const msg = eventData.narrativeContext || eventData.lore || eventData.eventType;
    const text = this.scene.add.text(this.scene.scale.width / 2, 40, msg, {
      font: '20px Arial', color: '#00ffff', backgroundColor: '#222', padding: { x: 8, y: 4 }
    }).setOrigin(0.5, 0).setDepth(2000);
    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      y: 0,
      duration: 2000,
      onComplete: () => text.destroy()
    });
  }

  private triggerVisualEffect(leyLineId: string, nodeId?: string, severity?: string, isRift?: boolean): void {
    const color = isRift ? 0xaa00ff : severity === 'major' ? 0xff4444 : severity === 'moderate' ? 0xffff00 : 0x00ff88;
    this.overlay.lineStyle(6, color, 0.7);

    if (nodeId) {
      const leyLine = this.worldStateManager.getState().leyLines.find((l: any) => l.id === leyLineId);
      const node = leyLine?.nodes.find((n: any) => n.id === nodeId);
      if (node) {
        this.overlay.strokeCircle(node.position.x, node.position.y, 32);
        this.scene.tweens.add({ targets: this.overlay, alpha: 0, duration: 900, onComplete: () => this.overlay.clear() });
      }
    } else {
      const leyLine = this.worldStateManager.getState().leyLines.find((l: any) => l.id === leyLineId);
      if (leyLine) {
        for (let i = 1; i < leyLine.nodes.length; i++) {
          const a = leyLine.nodes[i - 1].position;
          const b = leyLine.nodes[i].position;
          this.overlay.strokeLineShape(new Phaser.Geom.Line(a.x, a.y, b.x, b.y));
        }
        this.scene.tweens.add({ targets: this.overlay, alpha: 0, duration: 900, onComplete: () => this.overlay.clear() });
      }
    }
  }
}
