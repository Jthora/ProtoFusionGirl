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
import { ModalManager } from '../ui/layout/ModalManager';

// UIManager configuration to control which components are created/shown by default
export interface UIManagerOptions {
  /** Create the ASI overlay from UIManager (default: false to avoid duplication with GameScene-owned overlay). */
  createASIOverlay?: boolean;
  /** Create the Lore Terminal (default: false; only enable when actual lore entries are provided and desired). */
  createLoreTerminal?: boolean;
  /** If ASI overlay is created, show it immediately (default: false). */
  showASIOnStart?: boolean;
  /**
   * Create the legacy rectangular Minimap (default: false).
   * Leave false when SectorScanRadar is active — the radar supersedes the minimap.
   */
  createMinimap?: boolean;
}

// ── UIComponentRegistry ───────────────────────────────────────────────────────
// Lightweight registry that maps string keys → Phaser GameObjects (or any
// object with setVisible).  Provides a stable API for show/hide/toggle so
// callers never need to hold direct references.
export interface UIComponentEntry {
  instance: { setVisible(v: boolean): any };
  defaultVisible: boolean;
}

export class UIComponentRegistry {
  private map = new Map<string, UIComponentEntry>();

  register(name: string, instance: UIComponentEntry['instance'], defaultVisible = true): void {
    this.map.set(name, { instance, defaultVisible });
    instance.setVisible(defaultVisible);
  }

  show(name: string): void   { this.map.get(name)?.instance.setVisible(true); }
  hide(name: string): void   { this.map.get(name)?.instance.setVisible(false); }

  toggle(name: string): void {
    const entry = this.map.get(name);
    if (!entry) return;
    // Infer current visibility from the object if possible
    const obj = entry.instance as any;
    const cur = typeof obj.visible === 'boolean' ? obj.visible : true;
    obj.setVisible(!cur);
  }

  get<T>(name: string): T | undefined {
    return this.map.get(name)?.instance as T | undefined;
  }

  has(name: string): boolean {
    return this.map.has(name);
  }
}

export class UIManager {
  minimap: Minimap | undefined;
  loreTerminal: LoreTerminal | undefined;
  feedbackModal: FeedbackModal | undefined;
  asiOverlay: ASIOverlay | undefined;
  timelinePanel: TimelinePanel | undefined;
  scene: any;
  /** Centralised component registry — use show/hide/toggle/get instead of direct field access where possible. */
  readonly components = new UIComponentRegistry();
  private eventBus: EventBus;
  private lastLeyLines: LeyLine[] = [];
  private leyLineStabilizationModal?: LeyLineStabilizationModal;
  private options: UIManagerOptions;
  private modalManager: ModalManager;
  /**
   * Startup guard — ley line modals are suppressed until markStartupComplete() is called.
   * Prevents the LeyLineStabilizationModal from firing during world initialization
   * before the player has had a chance to see the game.
   */
  private _startupComplete = false;
  
  constructor(
    scene: Phaser.Scene,
    tilemapManager: any,
    playerSprite: Phaser.GameObjects.Sprite,
    enemies: any[],
    enemySprites: Map<any, Phaser.GameObjects.Sprite>,
    loreEntries: any[],
    eventBus: EventBus,
    options: UIManagerOptions = {}
  ) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.options = {
      createASIOverlay: false,
      createLoreTerminal: false,
      showASIOnStart: false,
      createMinimap: false,
      ...options,
    };
  // Centralized modal handling to avoid popup clutter
  this.modalManager = new ModalManager(scene);
    // Minimap — only created when explicitly requested (SectorScanRadar supersedes it by default)
    if (this.options.createMinimap) {
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
      this.components.register('minimap', this.minimap, true);
    }

    // Lore Terminal (opt-in to avoid clutter near spawn)
    if (this.options.createLoreTerminal && Array.isArray(loreEntries) && loreEntries.length > 0) {
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
    }

    // Timeline Panel — hidden by default; T-key toggles it
    this.timelinePanel = new TimelinePanel(scene, tilemapManager, 320, 240);
    this.components.register('timelinePanel', this.timelinePanel, false);
    scene.input.keyboard?.on('keydown-T', () => {
      this.components.toggle('timelinePanel');
    });

    // Feedback Modal (created on demand)
    // ASI Overlay (opt-in to avoid duplication with GameScene-owned overlay)
    if (this.options.createASIOverlay) {
      this.asiOverlay = new ASIOverlay({
        scene,
        width: scene.scale.width,
        height: scene.scale.height,
        eventBus: this.eventBus
      });
      if (this.options.showASIOnStart) {
        this.asiOverlay.show();
      } else {
        this.asiOverlay.hide();
      }
    }

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
      // Only show the interactive stabilization modal once the game is fully loaded.
      // Events fired during world initialization are silently discarded here.
      if (this._startupComplete) {
        this.showLeyLineStabilization(
          event.data,
          () => {
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
            this.eventBus.emit({
              type: 'LEYLINE_INSTABILITY',
              data: {
                ...event.data,
                severity: event.data.severity === 'minor' ? 'moderate' : event.data.severity === 'moderate' ? 'major' : 'major',
                data: { ...(event.data.data || {}), escalation: true }
              }
            });
          }
        );
      }
    });
  this.eventBus.on('LEYLINE_DISRUPTION', () => {
      // Play disruption audio cue
      if (this.scene.sound) {
        this.scene.sound.play('leyline_disruption', { volume: 0.8 });
      }
      // Show pop-up: "Ley Line Disruption: Fast travel disabled in this region."
      this.showFeedback('Ley Line Disruption: Fast travel disabled in this region.');
    });
  this.eventBus.on('RIFT_FORMED', () => {
      // Play rift audio cue
      if (this.scene.sound) {
        this.scene.sound.play('leyline_rift', { volume: 1.0 });
      }
      // Show pop-up: "A dimensional rift tears open—hostile entities pour forth."
      this.showFeedback('A dimensional rift tears open—hostile entities pour forth.');
    });
  }

  showFeedback(message: string) {
  // Route through ModalManager as a lightweight text modal (auto-closes)
  this.modalManager.showTextModal(message, { id: `toast:${message.slice(0, 24)}`, autoCloseMs: 1800 });
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
        // Ensure modal overlay is cleared even if container self-destroys
        this.modalManager.closeCurrent();
        this.leyLineStabilizationModal = undefined;
      },
      () => {
        onEscalate();
        this.modalManager.closeCurrent();
        this.leyLineStabilizationModal = undefined;
      }
    );
    // Queue and show via ModalManager to avoid stacking
    this.modalManager.showContainer(this.leyLineStabilizationModal, { id: `leyline:${event.leyLineId}` });
  }

  // ── Startup lifecycle ────────────────────────────────────────────────────
  /**
   * Call once the game world is fully initialized and the player is in control.
   * Unlocks ley-line stabilization modals and other interruptive UI that should
   * not appear during the initial world-generation phase.
   */
  markStartupComplete(): void {
    this._startupComplete = true;
  }

  // ── Component visibility shortcuts ───────────────────────────────────────
  /** Show a named component that was registered via UIComponentRegistry. */
  showComponent(name: string): void  { this.components.show(name); }
  /** Hide a named component that was registered via UIComponentRegistry. */
  hideComponent(name: string): void  { this.components.hide(name); }
  /** Toggle a named component's visibility. */
  toggleComponent(name: string): void { this.components.toggle(name); }
  /**
   * Register any Phaser-side UI object so the rest of the app can control it
   * by name (e.g. the SectorScanRadar DOM wrapper, custom overlays, etc.).
   */
  registerUIComponent(name: string, instance: { setVisible(v: boolean): any }, defaultVisible = true): void {
    this.components.register(name, instance, defaultVisible);
  }

  // Add this method for ModularGameLoop integration
  update(_dt: number, _context?: any) {
    // TODO: Implement UI updates, overlays, or feedback polling as needed
  }
}
