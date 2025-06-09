// ASIOverlay.ts
// Artifact-driven: Modular overlay for ASI (player) actions and context
// Reference: artifacts/agent_optimized_ui_ux_2025-06-05.artifact

import Phaser from 'phaser';
import { EventBus } from '../../core/EventBus';

export interface ASIOverlayConfig {
  scene: Phaser.Scene;
  width: number;
  height: number;
}

export class ASIOverlay {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private panels: Record<string, Phaser.GameObjects.GameObject> = {};
  private stateText: Phaser.GameObjects.Text | null = null;
  private consentButton: Phaser.GameObjects.Text | null = null;
  private asiControlled: boolean = false;
  private onConsentCallback: (() => void) | null = null;
  private eventBus: EventBus;

  constructor(config: ASIOverlayConfig & { eventBus: EventBus }) {
    this.scene = config.scene;
    this.eventBus = config.eventBus;
    this.container = this.scene.add.container(0, 0).setDepth(2000);
    this.createBasePanels(config.width, config.height);
    // Subscribe to ASI/Jane state changes
    this.eventBus.on('JANE_ASI_OVERRIDE', (event: any) => {
      this.setASIState(event.data.enabled);
    });
  }

  // Suppress unused variable warnings
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private createBasePanels(width: number, _height: number) {
    // Example: Add a context-aware ASI action panel
    const bg = this.scene.add.rectangle(width - 220, 80, 200, 160, 0x003366, 0.85).setOrigin(0.5, 0).setDepth(2001);
    const label = this.scene.add.text(width - 220, 90, 'ASI State', { fontSize: '18px', color: '#fff' }).setOrigin(0.5, 0);
    this.stateText = this.scene.add.text(width - 220, 120, '', { fontSize: '16px', color: '#fff' }).setOrigin(0.5, 0);
    this.consentButton = this.scene.add.text(width - 220, 160, 'Grant ASI Control', { fontSize: '14px', color: '#00ffcc', backgroundColor: '#222', padding: { left: 8, right: 8, top: 4, bottom: 4 } })
      .setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        // Emit event for ASI consent/override
        this.eventBus.emit({ type: 'JANE_ASI_OVERRIDE', data: { enabled: !this.asiControlled } } as any);
      });
    this.container.add([bg, label, this.stateText, this.consentButton]);
    this.panels['asiActions'] = bg;
    // Add more panels as needed (e.g., Universal Magic, mission planning, etc.)
  }

  setASIState(isControlled: boolean) {
    this.asiControlled = isControlled;
    if (this.stateText) {
      this.stateText.setText(isControlled ? 'ASI is controlling Jane' : 'Jane is in control');
    }
    if (this.consentButton) {
      this.consentButton.setText(isControlled ? 'Revoke ASI Control' : 'Grant ASI Control');
    }
  }

  onConsent(callback: () => void) {
    this.onConsentCallback = callback;
  }

  showPanel(panel: string) {
    // Only operate on panels that are Phaser GameObjects with setVisible
    Object.values(this.panels).forEach(p => {
      if ((p as any).setVisible) (p as any).setVisible(false);
    });
    if (this.panels[panel] && (this.panels[panel] as any).setVisible) {
      (this.panels[panel] as any).setVisible(true);
    }
  }

  hide() {
    this.container.setVisible(false);
  }

  show() {
    this.container.setVisible(true);
  }
}
