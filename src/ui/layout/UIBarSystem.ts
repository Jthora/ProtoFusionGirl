// UIBarSystem.ts
// Manages essential UI elements in screen edge bars
// Keeps the center screen clear for gameplay

import Phaser from 'phaser';
import { UILayoutManager } from './UILayoutManager';

export class UIBarSystem extends Phaser.GameObjects.Container {
  private layoutManager: UILayoutManager;
  private topBar: Phaser.GameObjects.Container;
  private bottomBar: Phaser.GameObjects.Container;
  private leftBar: Phaser.GameObjects.Container;
  private rightBar: Phaser.GameObjects.Container;
  
  // UI Elements
  private healthBar?: Phaser.GameObjects.Graphics;
  private psiBar?: Phaser.GameObjects.Graphics;
  private minimapContainer?: Phaser.GameObjects.Container;
  private statusText?: Phaser.GameObjects.Text;
  private speedIndicator?: Phaser.GameObjects.Text;
  
  constructor(scene: Phaser.Scene, layoutManager: UILayoutManager) {
    super(scene, 0, 0);
    this.layoutManager = layoutManager;
    
    // Create bar containers
    this.topBar = scene.add.container(0, 0);
    this.bottomBar = scene.add.container(0, 0);
    this.leftBar = scene.add.container(0, 0);
    this.rightBar = scene.add.container(0, 0);
    
    // Add bars to this container
    this.add([this.topBar, this.bottomBar, this.leftBar, this.rightBar]);
    
    // Set proper depth for UI
    this.setDepth(2000);
    this.setScrollFactor(0);
    
    this.createUIElements();
    this.positionBars();
    
    // Register with layout manager
    layoutManager.registerComponent('uiBarSystem', this, 'overlays', 'essential');
  }

  private createUIElements() {
    const layout = this.layoutManager.getLayout();
    
    // Top Bar Elements - Health, PSI, Status
    this.createHealthBar();
    this.createPSIBar();
    this.createStatusText();
    
    // Bottom Bar Elements - Speed, Controls hint
    this.createSpeedIndicator();
    this.createControlsHint();
    
    // Right Bar Elements - Minimap (compact)
    this.createMinimap();
    
    // Left Bar Elements - Mission info (when available)
    this.createMissionInfo();
  }

  private createHealthBar() {
    const barWidth = 200;
    const barHeight = 20;
    
    // Background
    const healthBg = this.scene.add.graphics();
    healthBg.fillStyle(0x220000, 0.8);
    healthBg.fillRect(0, 0, barWidth, barHeight);
    
    // Health fill
    this.healthBar = this.scene.add.graphics();
    this.healthBar.fillStyle(0xff0000, 1.0);
    this.healthBar.fillRect(0, 0, barWidth, barHeight);
    
    // Health text
    const healthText = this.scene.add.text(barWidth / 2, barHeight / 2, 'Health: 100/100', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Add to top bar
    const healthContainer = this.scene.add.container(20, 20);
    healthContainer.add([healthBg, this.healthBar, healthText]);
    this.topBar.add(healthContainer);
  }

  private createPSIBar() {
    const barWidth = 200;
    const barHeight = 20;
    
    // Background
    const psiBg = this.scene.add.graphics();
    psiBg.fillStyle(0x000022, 0.8);
    psiBg.fillRect(0, 0, barWidth, barHeight);
    
    // PSI fill
    this.psiBar = this.scene.add.graphics();
    this.psiBar.fillStyle(0x0099ff, 1.0);
    this.psiBar.fillRect(0, 0, barWidth, barHeight);
    
    // PSI text
    const psiText = this.scene.add.text(barWidth / 2, barHeight / 2, 'PSI: 75/100', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Add to top bar
    const psiContainer = this.scene.add.container(240, 20);
    psiContainer.add([psiBg, this.psiBar, psiText]);
    this.topBar.add(psiContainer);
  }

  private createStatusText() {
    this.statusText = this.scene.add.text(0, 0, 'Exploring • Trust: 75%', {
      fontSize: '16px',
      color: '#00ffff',
      backgroundColor: '#000033',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    this.topBar.add(this.statusText);
  }

  private createSpeedIndicator() {
    this.speedIndicator = this.scene.add.text(20, 0, 'Speed: 1.0x', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#333300',
      padding: { x: 8, y: 4 }
    }).setOrigin(0, 0.5);
    
    this.bottomBar.add(this.speedIndicator);
  }

  private createControlsHint() {
    const controlsText = this.scene.add.text(0, 0, 
      'WASD: Move | SPACE: Attack | Q: ASI Toggle | C: Command Center | TAB: Guidance | E: Interact',
      {
        fontSize: '14px',
        color: '#cccccc',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5);
    
    this.bottomBar.add(controlsText);
  }

  private createMinimap() {
    // Simplified minimap container - will be populated by actual minimap
    this.minimapContainer = this.scene.add.container(0, 0);
    
    // Minimap background
    const minimapBg = this.scene.add.graphics();
    minimapBg.fillStyle(0x001122, 0.8);
    minimapBg.lineStyle(2, 0x0099ff, 1.0);
    minimapBg.fillRect(0, 0, 150, 150);
    minimapBg.strokeRect(0, 0, 150, 150);
    
    // Minimap title
    const minimapTitle = this.scene.add.text(75, -20, 'Minimap', {
      fontSize: '12px',
      color: '#0099ff'
    }).setOrigin(0.5);
    
    this.minimapContainer.add([minimapBg, minimapTitle]);
    this.rightBar.add(this.minimapContainer);
  }

  private createMissionInfo() {
    const missionInfo = this.scene.add.text(0, 0, 'No Active Mission', {
      fontSize: '14px',
      color: '#ffcc00',
      backgroundColor: '#333300',
      padding: { x: 8, y: 4 },
      wordWrap: { width: 180 }
    }).setOrigin(0, 0);
    
    this.leftBar.add(missionInfo);
  }

  private positionBars() {
    const layout = this.layoutManager.getLayout();
    
    // Position bar containers
    this.topBar.setPosition(layout.topBar.x, layout.topBar.y);
    this.bottomBar.setPosition(layout.bottomBar.x, layout.bottomBar.y);
    this.leftBar.setPosition(layout.leftPanel.x + 10, layout.leftPanel.y + 10);
    this.rightBar.setPosition(layout.rightPanel.x + 10, layout.rightPanel.y + 10);
    
    // Position status text in center of top bar
    if (this.statusText) {
      this.statusText.setPosition(layout.topBar.width / 2, layout.topBar.height / 2);
    }
    
    // Position controls hint in center of bottom bar
    const controlsHint = this.bottomBar.list[1] as Phaser.GameObjects.Text;
    if (controlsHint) {
      controlsHint.setPosition(layout.bottomBar.width / 2, layout.bottomBar.height / 2);
    }
  }

  public updateHealth(current: number, max: number) {
    if (this.healthBar) {
      const percentage = current / max;
      this.healthBar.clear();
      this.healthBar.fillStyle(0xff0000, 1.0);
      this.healthBar.fillRect(0, 0, 200 * percentage, 20);
      
      // Update text
      const healthText = this.topBar.list[0] as Phaser.GameObjects.Container;
      const textObj = healthText.list[2] as Phaser.GameObjects.Text;
      textObj.setText(`Health: ${current}/${max}`);
    }
  }

  public updatePSI(current: number, max: number) {
    if (this.psiBar) {
      const percentage = current / max;
      this.psiBar.clear();
      this.psiBar.fillStyle(0x0099ff, 1.0);
      this.psiBar.fillRect(0, 0, 200 * percentage, 20);
      
      // Update text
      const psiText = this.topBar.list[1] as Phaser.GameObjects.Container;
      const textObj = psiText.list[2] as Phaser.GameObjects.Text;
      textObj.setText(`PSI: ${current}/${max}`);
    }
  }

  public updateStatus(status: string) {
    if (this.statusText) {
      this.statusText.setText(status);
    }
  }

  public updateSpeed(speed: number) {
    if (this.speedIndicator) {
      this.speedIndicator.setText(`Speed: ${speed.toFixed(1)}x`);
    }
  }

  public getMinimapContainer(): Phaser.GameObjects.Container | undefined {
    return this.minimapContainer;
  }

  public onResize() {
    this.positionBars();
  }
}
