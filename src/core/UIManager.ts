// UIManager.ts
// Manages all UI components (minimap, overlays, panels, lore terminal, feedback modal, etc.)
// Artifact reference: agent_optimized_ui_ux_2025-06-05.artifact

import { Minimap } from '../ui/components/Minimap';
import { LoreTerminal } from '../ui/components/LoreTerminal';
import { FeedbackModal } from '../ui/components/FeedbackModal';
import { ASIOverlay } from '../ui/components/ASIOverlay';
import { TimelinePanel } from '../ui/components/TimelinePanel';
import { LeyLine } from '../world/leyline/types';
import { EventBus } from './EventBus';
import { LeyLineStabilizationModal } from '../ui/components/LeyLineStabilizationModal';

export class UIManager {
  minimap: Minimap | undefined;
  loreTerminal: LoreTerminal | undefined;
  feedbackModal: FeedbackModal | undefined;
  asiOverlay: ASIOverlay | undefined;
  timelinePanel: TimelinePanel | undefined;
  scene: any;
  private eventBus: EventBus;
  private lastLeyLines: LeyLine[] = [];
  private leyLineStabilizationModal?: LeyLineStabilizationModal;

  constructor(
    scene: Phaser.Scene,
    tilemapManager: any,
    playerSprite: Phaser.GameObjects.Sprite,
    enemies: any[],
    enemySprites: Map<any, Phaser.GameObjects.Sprite>,
    loreEntries: any[],
    eventBus: EventBus
  ) {
    this.scene = scene;
    this.eventBus = eventBus;
    // Minimap
    this.minimap = new Minimap(
      scene,
      tilemapManager,
      playerSprite,
      () => enemies.filter((e: any) => e.isAlive).map((e: any) => {
        const sprite = enemySprites.get(e);
        return sprite ? { x: sprite.x, y: sprite.y } : { x: e.x, y: e.y };
      })
    );
    scene.add.existing(this.minimap);
    this.minimap.attachEventBus(eventBus);

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
          this.loreTerminal!.sprite.x,
          this.loreTerminal!.sprite.y - 80,
          entry,
          { color: '#ffffcc', fontSize: '16px', backgroundColor: '#333366', padding: { x: 10, y: 6 }, wordWrap: { width: 320 } }
        ).setOrigin(0.5, 1).setDepth(1000).setScrollFactor(0);
      }
    });
    scene.physics.add.overlap(
      playerSprite,
      this.loreTerminal.sprite,
      () => this.loreTerminal!.handlePlayerOverlap(),
      undefined,
      scene
    );
    scene.input.keyboard?.on('keydown-E', () => {
      this.loreTerminal!.handleInteract();
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
      height: scene.scale.height,
      eventBus: this.eventBus
    });
    this.asiOverlay.show();

    // Listen for ley line instability events and show feedback (artifact-driven)
    // Artifact: leyline_instability_event_narrative_examples_2025-06-08.artifact
    this.eventBus.on('LEYLINE_INSTABILITY', (event) => {
      this.showFeedback('Warning—ley line instability detected!');
      // Play audio cue (if available)
      if (this.scene.sound) {
        this.scene.sound.play('leyline_warning', { volume: 0.7 });
      }
      // Minimap overlay for unstable ley lines
      if (this.lastLeyLines && event.data.leyLineId) {
        const overlays = [
          {
            type: 'LEYLINE_INSTABILITY',
            leyLineId: event.data.leyLineId,
            nodeId: event.data.nodeId,
            severity: event.data.severity,
            color: 'yellow',
            affectedTiles: event.data.data?.affectedTiles || [],
            timestamp: event.data.timestamp
          }
        ];
        this.setLeyLineMinimapData(this.lastLeyLines, overlays);
      }
      // Show stabilization modal for player interaction
      this.showLeyLineStabilization(
        event.data,
        () => {
          // On stabilize: emit LEYLINE_MANIPULATION event (status: 'stable')
          this.eventBus.emit({
            type: 'LEYLINE_MANIPULATION',
            data: {
              leyLineId: event.data.leyLineId,
              status: 'stable',
              narrativeContext: 'Ley line stabilized by player/AI.'
            }
          });
        },
        () => {
          // On escalate: emit LEYLINE_INSTABILITY event with increased severity (handled by LeyLineManager)
          this.eventBus.emit({
            type: 'LEYLINE_INSTABILITY',
            data: {
              ...event.data,
              severity: event.data.severity === 'minor' ? 'moderate' : event.data.severity === 'moderate' ? 'major' : 'major',
              data: {
                ...(event.data.data || {}),
                escalation: true
              }
            }
          });
        }
      );
    });
    this.eventBus.on('LEYLINE_DISRUPTION', (event) => {
      // Play disruption audio cue
      if (this.scene.sound) {
        this.scene.sound.play('leyline_disruption', { volume: 0.8 });
      }
      // Show pop-up: "Ley Line Disruption: Fast travel disabled in this region."
      this.showFeedback('Ley Line Disruption: Fast travel disabled in this region.');
    });
    this.eventBus.on('RIFT_FORMED', (event) => {
      // Play rift audio cue
      if (this.scene.sound) {
        this.scene.sound.play('leyline_rift', { volume: 1.0 });
      }
      // Show pop-up: "A dimensional rift tears open—hostile entities pour forth."
      this.showFeedback('A dimensional rift tears open—hostile entities pour forth.');
    });
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

  /**
   * Show detailed feedback for Universal Language (UL) events.
   * @param feedback UL feedback event data
   */
  showULFeedback(feedback: { valid: boolean; error?: string; ulExpression?: any }) {
    if (feedback.error) {
      this.showFeedback(`UL Error: ${feedback.error}`);
    } else if (feedback.valid) {
      this.showFeedback('UL sequence accepted!');
    }
  }

  setLeyLineMinimapData(leyLines: LeyLine[], eventOverlays: any[] = []): void {
    this.lastLeyLines = leyLines;
    if (this.minimap) {
      this.minimap.setLeyLineData(leyLines, eventOverlays);
    }
  }

  toggleLeyLineOverlayVisible(): void {
    this.minimap?.toggleLeyLineOverlayVisible();
  }

  /**
   * Show the ley line stabilization modal for player/AI interaction.
   * Artifact: leyline_instability_event_design_2025-06-08.artifact
   */
  showLeyLineStabilization(event: import('../world/leyline/types').LeyLineInstabilityEvent, onStabilize: () => void, onEscalate: () => void) {
    if (this.leyLineStabilizationModal) {
      this.leyLineStabilizationModal.destroy();
    }
    this.leyLineStabilizationModal = new LeyLineStabilizationModal(
      this.scene,
      event,
      () => {
        onStabilize();
        this.leyLineStabilizationModal?.destroy();
        this.leyLineStabilizationModal = undefined;
      },
      () => {
        onEscalate();
        this.leyLineStabilizationModal?.destroy();
        this.leyLineStabilizationModal = undefined;
      }
    );
    this.scene.add.existing(this.leyLineStabilizationModal);
  }

  // Add this method for ModularGameLoop integration
  update(dt: number, context?: any) {
    // TODO: Implement UI updates, overlays, or feedback polling as needed
  }
}
