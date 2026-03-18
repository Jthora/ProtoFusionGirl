// SpeedControlUI.ts
// UI component for displaying speed controls and hypersonic navigation help

import { EventBus } from '../../core/EventBus';
import { NavigationManager } from '../core/NavigationManager';

export class SpeedControlUI {
  private scene: Phaser.Scene;
  private eventBus: EventBus;
  private navigationManager: NavigationManager;
  
  // UI Elements
  private speedDisplay: Phaser.GameObjects.Text | null = null;
  private modeDisplay: Phaser.GameObjects.Text | null = null;
  private helpPanel: Phaser.GameObjects.Container | null = null;
  private helpText: Phaser.GameObjects.Text | null = null;
  private helpVisible: boolean = false;
  
  // Style configuration
  private readonly UI_STYLE = {
    fontSize: '16px',
    fontFamily: 'monospace',
    color: '#00ff88',
    backgroundColor: '#001122',
    padding: { x: 8, y: 4 },
    alpha: 0.9
  };

  private readonly HELP_STYLE = {
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#88ffcc',
    backgroundColor: '#001133',
    padding: { x: 16, y: 12 },
    alpha: 0.95
  };

  constructor(scene: Phaser.Scene, eventBus: EventBus, navigationManager: NavigationManager) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.navigationManager = navigationManager;
    
    this.createUI();
    this.setupEventListeners();
    this.setupInputHandlers();
  }

  private createUI(): void {
    const W = this.scene.scale.width;

    // Speed display — bottom-right, away from MissionHUD (top-left)
    this.speedDisplay = this.scene.add.text(W - 16, 20, 'Speed: 0 km/h', {
      ...this.UI_STYLE,
      fontSize: '15px'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

    // Mode display (below speed, same right-anchor)
    this.modeDisplay = this.scene.add.text(W - 16, 44, 'Normal', {
      ...this.UI_STYLE,
      fontSize: '12px',
      color: '#448866',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

    // Help panel (initially hidden)
    this.createHelpPanel();
  }

  private createHelpPanel(): void {
    const centerX = this.scene.cameras.main.width / 2;
    const centerY = this.scene.cameras.main.height / 2;

    // Create container for help panel
    this.helpPanel = this.scene.add.container(centerX, centerY).setDepth(2000).setScrollFactor(0);
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, 600, 400, 0x001133, 0.95);
    bg.setStrokeStyle(2, 0x00ff88);
    
    // Help text
    this.helpText = this.scene.add.text(0, -160, this.getHelpContent(), {
      ...this.HELP_STYLE,
      fontSize: '12px',
      align: 'left',
      wordWrap: { width: 560 }
    }).setOrigin(0.5, 0);

    // Title
    const title = this.scene.add.text(0, -180, '🚀 HYPERSONIC NAVIGATION CONTROLS', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#00ff88',
      align: 'center'
    }).setOrigin(0.5);

    // Close instruction
    const closeText = this.scene.add.text(0, 180, 'Press F1 to close', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffff88',
      align: 'center'
    }).setOrigin(0.5);

    this.helpPanel.add([bg, title, this.helpText, closeText]);
    this.helpPanel.setVisible(false);
  }

  private getHelpContent(): string {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎮 SPEED CONTROL SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 SPEED MODES:
• M - Toggle speed mode (Normal → Boost → Hypersonic)
• H - Toggle hypersonic mode directly

🚀 QUICK SPEED SELECTION (Number Keys):
• 0 - Emergency Stop (0 km/h)
• 1 - Walking Speed (50 km/h)  
• 2 - Ground Vehicle (200 km/h)
• 3 - Fast Ground (600 km/h)
• 4 - Aircraft Speed (1,200 km/h)
• 5 - Fast Aircraft (3,000 km/h)
• 6 - Supersonic (12,000 km/h - Mach 10)
• 7 - High Hypersonic (50,000 km/h)
• 8 - Extreme Hypersonic (150,000 km/h)
• 9 - Maximum Speed (343,000 km/h - Mach 1000)

⚡ FINE CONTROL:
• SHIFT - Hold to accelerate continuously
• CTRL - Hold to decelerate continuously
• ↑ Arrow - Small speed increase
• ↓ Arrow - Small speed decrease

🌍 TERRAIN STREAMING:
The system automatically adjusts terrain loading based on speed:
• Walking/Ground: 1x radius, detailed terrain
• Aircraft: 2x radius, medium detail
• Supersonic: 4x radius, optimized terrain
• Hypersonic: 6x radius, minimal detail for performance

⚠️ PERFORMANCE NOTES:
• Hypersonic mode prioritizes speed over visual detail
• Real-world terrain coordinates are used for geographic accuracy
• Camera automatically adjusts zoom for optimal visibility
• Physics substeps increase at high speeds for accuracy

🎯 CURRENT STATUS will be displayed in top-left corner

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }

  private setupEventListeners(): void {
    // Listen for speed updates
    this.eventBus.on('SPEED_UPDATE', (event: any) => {
      this.updateSpeedDisplay(event.data);
    });

    // Listen for speed mode changes
    this.eventBus.on('SPEED_MODE_CHANGED', (event: any) => {
      this.updateModeDisplay(event.data.mode);
    });

    // Listen for hypersonic mode toggle
    this.eventBus.on('HYPERSONIC_MODE_TOGGLED', (event: any) => {
      this.showHypersonicNotification(event.data.enabled);
    });

    // Listen for speed category changes
    this.eventBus.on('SPEED_CATEGORY_CHANGED', (event: any) => {
      this.showCategoryTransition(event.data);
    });

    // Listen for emergency stop
    this.eventBus.on('EMERGENCY_STOP', () => {
      this.showEmergencyStopNotification();
    });
  }

  private setupInputHandlers(): void {
    if (!this.scene.input || !this.scene.input.keyboard) return;

    try {
      const f1Key = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F1);
      f1Key.on('down', () => { this.toggleHelp(); });
    } catch {
      // keyboard unavailable in some environments — silently skip
    }
  }

  private updateSpeedDisplay(data: any): void {
    if (!this.speedDisplay) return;

    const speedKmh = Math.round(data.currentSpeedKmh);
    const targetSpeed = Math.round(data.targetSpeedKmh);
    
    let speedText = `Speed: ${speedKmh.toLocaleString()} km/h`;
    if (speedKmh !== targetSpeed) {
      speedText += ` → ${targetSpeed.toLocaleString()}`;
    }

    // Add Mach number for high speeds
    if (speedKmh >= 1200) {
      const machNumber = (speedKmh / 1235).toFixed(1); // Approximate Mach conversion
      speedText += ` (Mach ${machNumber})`;
    }

    this.speedDisplay.setText(speedText);

    // Color coding based on speed category
    if (speedKmh >= 12000) {
      this.speedDisplay.setColor('#ff4444'); // Red for hypersonic
    } else if (speedKmh >= 1200) {
      this.speedDisplay.setColor('#ff8844'); // Orange for supersonic
    } else if (speedKmh >= 200) {
      this.speedDisplay.setColor('#ffff44'); // Yellow for aircraft
    } else {
      this.speedDisplay.setColor('#00ff88'); // Green for ground speeds
    }
  }

  private updateModeDisplay(mode: string): void {
    if (!this.modeDisplay) return;

    const modeText = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    this.modeDisplay.setText(modeText);

    // Color coding for modes
    switch (mode) {
      case 'hypersonic':
        this.modeDisplay.setColor('#ff4444');
        break;
      case 'boost':
        this.modeDisplay.setColor('#ff8844');
        break;
      default:
        this.modeDisplay.setColor('#00ff88');
    }
  }

  private showHypersonicNotification(enabled: boolean): void {
    const message = enabled ? 
      '⚡ HYPERSONIC MODE ENABLED ⚡' : 
      '🛑 HYPERSONIC MODE DISABLED';
    
    this.showNotification(message, enabled ? '#ff4444' : '#00ff88', 2000);
  }

  private showCategoryTransition(data: any): void {
    const message = `Speed Category: ${data.from.toUpperCase()} → ${data.to.toUpperCase()}`;
    this.showNotification(message, '#ffff44', 1500);
  }

  private showEmergencyStopNotification(): void {
    this.showNotification('🛑 EMERGENCY STOP ACTIVATED 🛑', '#ff0000', 3000);
  }

  private showNotification(text: string, color: string, duration: number): void {
    const centerX = this.scene.cameras.main.width / 2;
    const notificationY = 100;

    const notification = this.scene.add.text(centerX, notificationY, text, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: color,
      backgroundColor: '#001122',
      padding: { x: 16, y: 8 },
      align: 'center'
    }).setOrigin(0.5).setDepth(1500).setScrollFactor(0);

    // Fade in
    notification.setAlpha(0);
    this.scene.tweens.add({
      targets: notification,
      alpha: 1,
      duration: 200,
      ease: 'Power2'
    });

    // Fade out and destroy
    this.scene.time.delayedCall(duration, () => {
      this.scene.tweens.add({
        targets: notification,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => notification.destroy()
      });
    });
  }

  private toggleHelp(): void {
    if (!this.helpPanel) return;

    this.helpVisible = !this.helpVisible;
    this.helpPanel.setVisible(this.helpVisible);

    if (this.helpVisible && this.helpText) {
      // Update help content with current status
      this.helpText.setText(this.navigationManager.getSpeedControlHelp());
    }
  }

  public showHelp(): void {
    if (!this.helpPanel) return;
    this.helpVisible = true;
    this.helpPanel.setVisible(true);
    
    if (this.helpText) {
      this.helpText.setText(this.navigationManager.getSpeedControlHelp());
    }
  }

  public hideHelp(): void {
    if (!this.helpPanel) return;
    this.helpVisible = false;
    this.helpPanel.setVisible(false);
  }

  public destroy(): void {
    this.speedDisplay?.destroy();
    this.modeDisplay?.destroy();
    this.helpPanel?.destroy();
  }
}
