// UIManager.ts
// Manages all UI components (minimap, overlays, panels, lore terminal, feedback modal, etc.)
// Artifact reference: agent_optimized_ui_ux_2025-06-05.artifact

import { Minimap } from '../ui/components/Minimap';
import { LoreTerminal } from '../ui/components/LoreTerminal';
import { FeedbackModal } from '../ui/components/FeedbackModal';
import { ASIOverlay } from '../ui/components/ASIOverlay';
import { TimelinePanel } from '../ui/components/TimelinePanel';

export class UIManager {
  minimap: Minimap | undefined;
  loreTerminal: LoreTerminal | undefined;
  feedbackModal: FeedbackModal | undefined;
  asiOverlay: ASIOverlay | undefined;
  timelinePanel: TimelinePanel | undefined;
  scene: any;

  constructor(scene, tilemapManager, playerSprite, enemies, enemySprites, loreEntries) {
    this.scene = scene;
    // Minimap
    this.minimap = new Minimap(
      scene,
      tilemapManager,
      playerSprite,
      () => enemies.filter(e => e.isAlive).map(e => {
        const sprite = enemySprites.get(e);
        return sprite ? { x: sprite.x, y: sprite.y } : { x: e.x, y: e.y };
      })
    );
    scene.add.existing(this.minimap);

    // Lore Terminal
    this.loreTerminal = new LoreTerminal({
      scene,
      x: 500,
      y: 300,
      texture: 'terminal',
      scale: 1.2,
      loreEntries,
      onShowEntry: (entry: string) => {
        scene.add.text(
          this.loreTerminal.sprite.x,
          this.loreTerminal.sprite.y - 80,
          entry,
          { color: '#ffffcc', fontSize: '16px', backgroundColor: '#333366', padding: { x: 10, y: 6 }, wordWrap: { width: 320 } }
        ).setOrigin(0.5, 1).setDepth(1000).setScrollFactor(0);
      }
    });
    scene.physics.add.overlap(
      playerSprite,
      this.loreTerminal.sprite,
      () => this.loreTerminal.handlePlayerOverlap(),
      undefined,
      scene
    );
    scene.input.keyboard?.on('keydown-E', () => {
      this.loreTerminal.handleInteract();
    });

    // Timeline Panel
    this.timelinePanel = new TimelinePanel(scene, tilemapManager, 320, 240);
    this.timelinePanel.setVisible(false);
    scene.input.keyboard?.on('keydown-T', () => {
      if (this.timelinePanel) {
        this.timelinePanel.setVisible(!this.timelinePanel.visible);
      }
    });

    // Feedback Modal (created on demand)
    // ASI Overlay
    this.asiOverlay = new ASIOverlay({
      scene,
      width: scene.scale.width,
      height: scene.scale.height
    });
    this.asiOverlay.show();
  }

  showFeedback(message: string) {
    if (!this.feedbackModal) {
      this.feedbackModal = new FeedbackModal(this.scene, this.scene.scale.width / 2);
    }
    this.feedbackModal.show();
    this.scene.add.text(this.scene.scale.width / 2, 100, message, {
      fontSize: '20px', color: '#ff0', backgroundColor: '#222', padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setDepth(1002).setScrollFactor(0);
  }
}
