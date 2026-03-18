// CommandCenterUI.ts
// Main interface component for ASI Control Interface
// Provides multi-panel dashboard with omniscient capabilities

import { EventBus } from '../../../core/EventBus';
import { CommandCenterUIConfig, PanelConfig, Vector2 } from '../../types';
import { ASI_COLORS, ASI_LAYOUT } from '../theme';
import { TrustManager } from '../../systems/TrustManager';
import { ThreatDetector } from '../../systems/ThreatDetector';
import { GuidanceEngine } from '../../systems/GuidanceEngine';
import { UIDepths } from '../../../ui/UIDepths';

export class CommandCenterUI extends Phaser.GameObjects.Container {
  private eventBus: EventBus;
  private trustManager: TrustManager;
  private _threatDetector: ThreatDetector;
  private guidanceEngine: GuidanceEngine;
  private subscriptions: Array<() => void> = [];
  
  // UI Components
  private mainPanel!: Phaser.GameObjects.Container;
  private statusPanel!: Phaser.GameObjects.Container;
  private guidancePanel!: Phaser.GameObjects.Container;
  private trustMeter!: Phaser.GameObjects.Container;
  private threatOverlay!: Phaser.GameObjects.Container;
  private opportunityOverlay!: Phaser.GameObjects.Container;
  private emotionalOverlay!: Phaser.GameObjects.Container;
  private magicPalette!: Phaser.GameObjects.Container;
  
  // UI Elements
  private background!: Phaser.GameObjects.Graphics;
  private panelBackgrounds: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private trustVisual!: Phaser.GameObjects.Graphics;
  private guidanceButtons!: Phaser.GameObjects.Group;
  private threatIndicators!: Phaser.GameObjects.Group;
  private threatIndicatorById: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private shieldChip?: Phaser.GameObjects.Text;
  
  // State
  private isActive = false;
  private currentMode: 'full' | 'minimal' = 'full';
  private overlaysVisible = { threat: true, opportunity: true, emotional: true };
  private panelConfigs: Map<string, PanelConfig> = new Map();
  private threatBadge!: Phaser.GameObjects.Text;
  private hoverCrosshair!: Phaser.GameObjects.Graphics;
  private trustText!: Phaser.GameObjects.Text;
  private closeButton!: Phaser.GameObjects.Text;

  constructor(config: CommandCenterUIConfig) {
    super(config.scene, 0, 0);
    this.eventBus = config.eventBus;
    this.trustManager = config.trustManager;
    this._threatDetector = config.threatDetector;
    this.guidanceEngine = config.guidanceEngine;
    
    this.setupPanelConfigs(config.width, config.height);
    this.createUIComponents();
    this.setupEventHandlers();
    this.setupInteractions();
    
    this.scene.add.existing(this);
    this.setDepth(UIDepths.DASHBOARD);
    this.createShieldChip();
    this.createCloseButton();
  }

  private setupPanelConfigs(width: number, height: number): void {
    // Main game panel (60% width, 80% height)
    this.panelConfigs.set('main', {
      x: 10,
      y: 10,
      width: width * 0.6,
      height: height * 0.8,
      backgroundColor: 0x001122,
      borderColor: 0x16213e,
      borderWidth: 2,
      borderRadius: 8,
      alpha: 0.9
    });
    
    // Status panel (upper right)
    this.panelConfigs.set('status', {
      x: width * 0.62,
      y: 10,
      width: width * 0.37,
      height: height * 0.35,
      backgroundColor: 0x112200,
      borderColor: 0x16213e,
      borderWidth: 2,
      borderRadius: 8,
      alpha: 0.9
    });
    
    // Guidance panel (lower right)
    this.panelConfigs.set('guidance', {
      x: width * 0.62,
      y: height * 0.37,
      width: width * 0.37,
      height: height * 0.43,
      backgroundColor: 0x220011,
      borderColor: 0x16213e,
      borderWidth: 2,
      borderRadius: 8,
      alpha: 0.9
    });
    
    // Trust meter (bottom)
    this.panelConfigs.set('trust', {
      x: 10,
      y: height * 0.82,
      width: width * 0.6,
      height: height * 0.08,
      backgroundColor: 0x001122,
      borderColor: 0x16213e,
      borderWidth: 2,
      borderRadius: 8,
      alpha: 0.9
    });
  }

  private createUIComponents(): void {
    // Create background
  this.background = this.scene.add.graphics();
  this.background.fillStyle(ASI_COLORS.primary, 0.3);
    this.background.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
    this.add(this.background);
    
    // Create main panel
    this.mainPanel = this.createPanel('main');
    this.add(this.mainPanel);
    
    // Create status panel
    this.statusPanel = this.createPanel('status');
    this.add(this.statusPanel);
    
    // Create guidance panel
    this.guidancePanel = this.createPanel('guidance');
    this.add(this.guidancePanel);
    
    // Create trust meter
    this.trustMeter = this.createPanel('trust');
    this.add(this.trustMeter);
    
    // Create threat overlay
  this.threatOverlay = this.scene.add.container(0, 0);
    this.add(this.threatOverlay);
  this.opportunityOverlay = this.scene.add.container(0, 0);
  this.add(this.opportunityOverlay);
  this.emotionalOverlay = this.scene.add.container(0, 0);
  this.add(this.emotionalOverlay);
    
    // Create magic palette
    this.magicPalette = this.scene.add.container(0, 0);
    this.add(this.magicPalette);
    
    // Create interactive elements
    this.guidanceButtons = this.scene.add.group();
    this.threatIndicators = this.scene.add.group();
  // Hover crosshair
  this.hoverCrosshair = this.scene.add.graphics();
  this.hoverCrosshair.lineStyle(1, ASI_COLORS.accent, 0.9);
  this.hoverCrosshair.strokeLineShape(new Phaser.Geom.Line(-6, 0, 6, 0));
  this.hoverCrosshair.strokeLineShape(new Phaser.Geom.Line(0, -6, 0, 6));
  this.hoverCrosshair.setVisible(false);
  this.add(this.hoverCrosshair);
    
    // Initialize content
    this.initializeStatusPanel();
    this.initializeGuidancePanel();
    this.initializeTrustMeter();
    this.initializeThreatOverlay();
    this.initializeMagicPalette();
  }

  private createPanel(panelId: string): Phaser.GameObjects.Container {
    const config = this.panelConfigs.get(panelId);
    if (!config) throw new Error(`Panel config not found: ${panelId}`);
    
    const panel = this.scene.add.container(config.x, config.y);
    
  // Create panel background
  const background = this.scene.add.graphics();
  background.fillStyle(config.backgroundColor ?? ASI_COLORS.secondary, config.alpha ?? 0.9);
  background.lineStyle(config.borderWidth ?? 2, config.borderColor ?? ASI_COLORS.accent, 1);
  background.fillRoundedRect(0, 0, config.width, config.height, config.borderRadius ?? ASI_LAYOUT.borderRadius);
  background.strokeRoundedRect(0, 0, config.width, config.height, config.borderRadius ?? ASI_LAYOUT.borderRadius);
    
    panel.add(background);
    this.panelBackgrounds.set(panelId, background);
    
    return panel;
  }

  private setupEventHandlers(): void {
    // Listen for trust changes
  this.subscriptions.push(this.eventBus.on('TRUST_CHANGED', (event: any) => {
      this.updateTrustVisual(event.data);
  }));

    // Shield Window status chip
  this.subscriptions.push(this.eventBus.on('SHIELD_WINDOW_STARTED', (event: any) => {
      const until = event.data?.cooldownUntil as number | undefined;
      this.updateShieldChip(true, until);
  }));
  this.subscriptions.push(this.eventBus.on('SHIELD_WINDOW_ENDED', (event: any) => {
      const until = event.data?.cooldownUntil as number | undefined;
      this.updateShieldChip(false, until);
  }));
    
    // Listen for threat detection
  this.subscriptions.push(this.eventBus.on('THREAT_DETECTED', (event: any) => {
      const threat = event?.data?.threat ?? event?.data;
      if (threat) this.addOrUpdateThreatIndicator(threat);
  }));
    
    // Listen for threat resolution
  this.subscriptions.push(this.eventBus.on('THREAT_RESOLVED', (event: any) => {
      const id = event?.data?.threatId ?? event?.threatId;
      this.removeThreatIndicator(id);
  }));
    
    // Listen for Jane's state changes
  this.subscriptions.push(this.eventBus.on('JANE_MOVED', (event: any) => {
      this.updateJanePosition(event.data);
  }));
    
    // Listen for guidance updates
  this.subscriptions.push(this.eventBus.on('ASI_GUIDANCE_GIVEN', (event: any) => {
      this.updateGuidanceDisplay(event.data);
  }));
  }

  private createShieldChip(): void {
    const config = this.panelConfigs.get('status')!;
    const x = config.x + config.width - 140;
    const y = config.y + 10;
    this.shieldChip = this.scene.add.text(x, y, 'Shield: Ready', {
      fontSize: '12px',
      color: '#00ffcc',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    this.shieldChip.setDepth(UIDepths.HUD_NOTIFICATION);
    this.add(this.shieldChip);
  }

  private createCloseButton(): void {
    const W = this.scene.scale.width;
    this.closeButton = this.scene.add.text(W - 16, 14, '✕', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ff4488',
      backgroundColor: '#220011',
      padding: { x: 8, y: 4 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    this.closeButton.on('pointerover', () => this.closeButton.setStyle({ color: '#ffffff', backgroundColor: '#440022' }));
    this.closeButton.on('pointerout',  () => this.closeButton.setStyle({ color: '#ff4488', backgroundColor: '#220011' }));
    this.closeButton.on('pointerdown', () => this.deactivate());

    this.add(this.closeButton);
  }

  private updateShieldChip(active: boolean, cooldownUntil?: number): void {
    if (!this.shieldChip) return;
    const trustLevel = this.trustManager.getTrustLevel();
    const now = Date.now();
    const onCooldown = cooldownUntil ? cooldownUntil > now : false;
    let text = active ? 'Shield: ACTIVE' : (onCooldown ? 'Shield: Cooldown' : 'Shield: Ready');
    if (trustLevel < 70) text += ' (Trust Low)';
    const color = active ? '#00ffff' : onCooldown ? '#ffaa00' : trustLevel >= 70 ? '#00ff88' : '#888888';
    this.shieldChip.setText(text);
    this.shieldChip.setColor(color);
  }

  private setupInteractions(): void {
    // Make panels interactive
    this.mainPanel.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, this.panelConfigs.get('main')!.width, this.panelConfigs.get('main')!.height),
      Phaser.Geom.Rectangle.Contains
    );
    
    this.mainPanel.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleMainPanelClick(pointer);
    });
    
    this.mainPanel.on('pointerover', (pointer: Phaser.Input.Pointer) => {
      this.handleMainPanelHover(pointer);
    });
    
    // ESC key to toggle interface
    this.scene.input.keyboard?.on('keydown-ESC', () => {
      this.toggleInterface();
    });
  }

  private initializeStatusPanel(): void {
    const config = this.panelConfigs.get('status')!;
    
    // Title
    const title = this.scene.add.text(config.width / 2, 20, 'ASI STATUS', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    title.setOrigin(0.5, 0);
    this.statusPanel.add(title);
    
    // Jane's vital signs
    const janeStatus = this.scene.add.text(20, 50, 'JANE STATUS:\nHealth: 100%\nPsi: 75%\nStress: 30%', {
      fontSize: '12px',
      color: '#00ff88',
      fontFamily: 'monospace'
    });
    this.statusPanel.add(janeStatus);
    
    // Environmental status
    const envStatus = this.scene.add.text(20, 120, 'ENVIRONMENT:\nThreats: 0\nOpportunities: 2\nLeyline: Stable', {
      fontSize: '12px',
      color: '#00aaff',
      fontFamily: 'monospace'
    });
    this.statusPanel.add(envStatus);
    
    // Mission status
    const missionStatus = this.scene.add.text(20, 190, 'MISSION:\nObjective: Explore\nProgress: 45%\nTime: 12:34', {
      fontSize: '12px',
      color: '#ffaa00',
      fontFamily: 'monospace'
    });
    this.statusPanel.add(missionStatus);
  }

  private initializeGuidancePanel(): void {
    const config = this.panelConfigs.get('guidance')!;
    
    // Title
    const title = this.scene.add.text(config.width / 2, 20, 'GUIDANCE SYSTEM', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    title.setOrigin(0.5, 0);
    this.guidancePanel.add(title);
    
    // Placeholder for guidance suggestions
    const placeholder = this.scene.add.text(20, 50, 'No active guidance\nsuggestions', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'monospace'
    });
    this.guidancePanel.add(placeholder);
    
    this.updateGuidanceDisplay();
  }

  private initializeTrustMeter(): void {
    // Trust meter background
    this.trustVisual = this.scene.add.graphics();
    this.trustVisual.setPosition(20, 20);
    this.trustMeter.add(this.trustVisual);
    
    // Trust label
    const trustLabel = this.scene.add.text(20, 5, 'TRUST LEVEL', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    this.trustMeter.add(trustLabel);
    
    this.updateTrustVisual({ currentLevel: 50, change: 0, trend: 'stable' });
  }

  private initializeThreatOverlay(): void {
    // Minimal HUD indicator shown when panel is active
    this.threatBadge = this.scene.add.text(12, this.scene.scale.height - 24, 'THREATS: 0', {
      fontSize: '12px', color: '#ff4444', fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(UIDepths.HUD_NOTIFICATION);
    this.threatOverlay.add(this.threatBadge);
  }

  private initializeMagicPalette(): void {
    // Create basic magic symbols
    const symbols = ['Fire', 'Water', 'Earth', 'Air', 'Energy'];
    const symbolSize = 40;
    const startX = 20;
    const startY = this.scene.scale.height - 100;
    
    symbols.forEach((symbol, index) => {
      const x = startX + (index * (symbolSize + 10));
      const y = startY;
      
      const symbolButton = this.scene.add.graphics();
      symbolButton.fillStyle(0xaa00ff, 0.8);
      symbolButton.fillCircle(x, y, symbolSize / 2);
      symbolButton.lineStyle(2, 0xff00aa, 1);
      symbolButton.strokeCircle(x, y, symbolSize / 2);
      
      const symbolText = this.scene.add.text(x, y, symbol.charAt(0), {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'monospace'
      });
      symbolText.setOrigin(0.5, 0.5);
      
      this.magicPalette.add(symbolButton);
      this.magicPalette.add(symbolText);
      
      // Make symbol interactive
      const hitArea = new Phaser.Geom.Circle(x, y, symbolSize / 2);
      symbolButton.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
      symbolButton.on('pointerdown', () => {
        this.handleMagicSymbolClick(symbol, { x, y });
      });
    });
  }

  private updateTrustVisual(trustData: any): void {
    if (!this.trustVisual) return;
    
    const config = this.panelConfigs.get('trust')!;
    const barWidth = config.width - 120;
    const barHeight = 20;
    const trustLevel = trustData.currentLevel || 50;
    
    this.trustVisual.clear();
    
    // Background
    this.trustVisual.fillStyle(0x333333, 0.8);
    this.trustVisual.fillRect(100, 10, barWidth, barHeight);
    
    // Trust level bar
    const trustColor = this.getTrustColor(trustLevel);
    this.trustVisual.fillStyle(trustColor, 0.9);
    this.trustVisual.fillRect(100, 10, (barWidth * trustLevel) / 100, barHeight);
    
    // Trust level text — update in-place to avoid recreating
    if (!this.trustText) {
      this.trustText = this.scene.add.text(100 + barWidth + 10, 20, '', {
        fontSize: '12px', color: '#ffffff', fontFamily: 'monospace',
      }).setOrigin(0, 0.5);
      this.trustMeter.add(this.trustText);
    }
    this.trustText.setText(`${Math.round(trustLevel)}%`);
    
    // Trend indicator
    const trendColor = trustData.trend === 'increasing' ? 0x00ff00 : 
                      trustData.trend === 'decreasing' ? 0xff0000 : 0xffff00;
    this.trustVisual.fillStyle(trendColor, 0.8);
    this.trustVisual.fillCircle(80, 20, 5);
  }

  private getTrustColor(trustLevel: number): number {
    if (trustLevel >= 80) return 0x00ff88;
    if (trustLevel >= 60) return 0x88ff00;
    if (trustLevel >= 40) return 0xffaa00;
    if (trustLevel >= 20) return 0xff6600;
    return 0xff4444;
  }

  private updateGuidanceDisplay(_guidanceData?: any): void {
    // Clear existing guidance buttons
    this.guidanceButtons.clear(true, true);
    
    const config = this.panelConfigs.get('guidance')!;
    const suggestions = this.guidanceEngine.getActiveSuggestions();
    
    if (suggestions.length === 0) {
      const placeholder = this.scene.add.text(20, 50, 'No active guidance\nsuggestions', {
        fontSize: '12px',
        color: '#888888',
        fontFamily: 'monospace'
      });
      this.guidancePanel.add(placeholder);
      return;
    }
    
    // Display top 5 suggestions
    suggestions.slice(0, 5).forEach((suggestion, index) => {
      const y = 50 + (index * 60);
      const buttonHeight = 50;
      
      // Create suggestion button
      const button = this.scene.add.graphics();
      const urgencyColor = this.getUrgencyColor(suggestion.urgency);
      button.fillStyle(urgencyColor, 0.3);
      button.lineStyle(2, urgencyColor, 0.8);
      button.fillRoundedRect(10, y, config.width - 20, buttonHeight, 5);
      button.strokeRoundedRect(10, y, config.width - 20, buttonHeight, 5);
      
      // Suggestion text
      const titleText = this.scene.add.text(20, y + 5, suggestion.title, {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'monospace',
        fontStyle: 'bold'
      });
      
      const descText = this.scene.add.text(20, y + 20, suggestion.description, {
        fontSize: '10px',
        color: '#cccccc',
        fontFamily: 'monospace',
        wordWrap: { width: config.width - 40 }
      });
      
      const confidenceText = this.scene.add.text(config.width - 20, y + 35, `${suggestion.confidence}%`, {
        fontSize: '10px',
        color: '#00aaff',
        fontFamily: 'monospace'
      });
      confidenceText.setOrigin(1, 0);
      
      // Make button interactive
      button.setInteractive(
        new Phaser.Geom.Rectangle(10, y, config.width - 20, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      button.on('pointerdown', () => {
        this.handleGuidanceSelection(suggestion.id);
      });
      
      button.on('pointerover', () => {
        button.clear();
        button.fillStyle(urgencyColor, 0.5);
        button.lineStyle(2, urgencyColor, 1);
        button.fillRoundedRect(10, y, config.width - 20, buttonHeight, 5);
        button.strokeRoundedRect(10, y, config.width - 20, buttonHeight, 5);
      });
      
      button.on('pointerout', () => {
        button.clear();
        button.fillStyle(urgencyColor, 0.3);
        button.lineStyle(2, urgencyColor, 0.8);
        button.fillRoundedRect(10, y, config.width - 20, buttonHeight, 5);
        button.strokeRoundedRect(10, y, config.width - 20, buttonHeight, 5);
      });
      
      this.guidancePanel.add(button);
      this.guidancePanel.add(titleText);
      this.guidancePanel.add(descText);
      this.guidancePanel.add(confidenceText);
      this.guidanceButtons.add(button);
    });
  }

  private getUrgencyColor(urgency: string): number {
    switch (urgency) {
      case 'critical': return ASI_COLORS.threatCritical;
      case 'high': return ASI_COLORS.threatHigh;
      case 'medium': return ASI_COLORS.threatMedium;
      case 'low': return ASI_COLORS.infoASIOnly;
      default: return 0x888888;
    }
  }

  private addOrUpdateThreatIndicator(threat: any): void {
    const id = threat?.id as string | undefined;
    if (!id) return;
    const color = this.getUrgencyColor(threat.severity);
    let indicator = this.threatIndicatorById.get(id);
    if (!indicator) {
      indicator = this.scene.add.graphics();
      this.threatOverlay.add(indicator);
      this.threatIndicators.add(indicator);
      this.threatIndicatorById.set(id, indicator);
      this.scene.tweens.add({ targets: indicator, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });
    }
    const x = threat.position?.x ?? 0;
    const y = threat.position?.y ?? 0;
    const baseRadius = 14;
    const outerRadius = 20;
    const tti = typeof threat.timeToImpact === 'number' ? threat.timeToImpact : -1;
    const maxTti = 5000; // 5s
    const progress = tti < 0 ? 1 : Math.max(0, Math.min(1, tti / maxTti));
    indicator.clear();
    indicator.fillStyle(color, 0.7);
    indicator.fillCircle(x, y, 8);
    indicator.lineStyle(2, color, 1);
    indicator.strokeCircle(x, y, baseRadius);
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * progress);
    indicator.lineStyle(3, color, 0.9);
    indicator.beginPath();
    indicator.arc(x, y, outerRadius, startAngle, endAngle, false);
    indicator.strokePath();
    this.updateThreatBadge();
  }

  private removeThreatIndicator(threatId?: string): void {
    if (!threatId) return;
    const indicator = this.threatIndicatorById.get(threatId);
    if (indicator) {
      indicator.destroy();
      this.threatIndicators.remove(indicator, true);
      this.threatIndicatorById.delete(threatId);
    }
    this.updateThreatBadge();
  }

  private handleMainPanelClick(pointer: Phaser.Input.Pointer): void {
    const worldPoint = { x: pointer.worldX, y: pointer.worldY } as Vector2;
    const suggestion = {
      id: 'click_guidance',
      type: 'movement' as const,
      title: 'Move to position',
      description: 'Move Jane to clicked location',
      urgency: 'medium' as const,
      confidence: 70,
      expectedOutcome: 'Jane moves to location',
      trustImpact: 1,
      position: worldPoint
    };
    this.eventBus.emit({ type: 'GUIDANCE_SELECTED', data: { suggestion, timestamp: Date.now() } });
    this.eventBus.emit({ type: 'ASI_GUIDANCE_GIVEN', data: { suggestion, context: { type: 'click', position: worldPoint } } });
  }

  private handleMainPanelHover(pointer: Phaser.Input.Pointer): void {
    // Show contextual information on hover
  this.mainPanel.getLocalPoint(pointer.x, pointer.y);
    // This would show threat information, environmental data, etc.
  }

  private handleGuidanceSelection(suggestionId: string): void {
    this.guidanceEngine.handleGuidanceSelection(suggestionId);
  }

  private handleMagicSymbolClick(symbol: string, position: Vector2): void {
    const trustLevel = this.trustManager.getTrustLevel();
    
    if (trustLevel < 30) {
      // Show "insufficient trust" feedback
      this.showFeedback('Insufficient trust for magic', 0xff4444);
      return;
    }
    
    // Emit magic cast event
    this.eventBus.emit({
      type: 'MAGIC_CAST',
      data: {
        symbolId: symbol,
        targetPosition: position,
        success: true,
        trustLevel
      }
    });
    
    this.showFeedback(`${symbol} magic cast!`, 0x00ff88);
  }

  private showFeedback(message: string, color: number): void {
    const feedback = this.scene.add.text(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      message,
      {
        fontSize: '24px',
        color: `#${color.toString(16).padStart(6, '0')}`,
        fontFamily: 'monospace',
        fontStyle: 'bold'
      }
    );
    
    feedback.setOrigin(0.5, 0.5);
    feedback.setDepth(2000);
    
    this.scene.tweens.add({
      targets: feedback,
      alpha: 0,
      y: feedback.y - 50,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        feedback.destroy();
      }
    });
  }

  private updateJanePosition(_positionData: any): void {
    // Update Jane's position indicator in the main panel
    // This would be implemented with the actual game view integration
  }

  private updateThreatBadge(): void {
    if (!this.threatBadge || !this._threatDetector) return;
    const count = this._threatDetector.getActiveThreats().length;
    this.threatBadge.setText(`THREATS: ${count}`);
  }

  public activate(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.setVisible(true);
    
    // Emit activation event
    this.eventBus.emit({
      type: 'COMMAND_CENTER_ACTIVATED',
      data: {
        timestamp: Date.now(),
        mode: this.currentMode
      }
    });
    
    // Animate in
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  }

  public deactivate(): void {
    if (!this.isActive) return;
    
    const activationTime = Date.now();
    
    // Animate out
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.setVisible(false);
        this.isActive = false;
        
        // Emit deactivation event
        this.eventBus.emit({
          type: 'COMMAND_CENTER_DEACTIVATED',
          data: {
            timestamp: Date.now(),
            duration: activationTime - Date.now()
          }
        });
      }
    });
  }

  public toggleInterface(): void {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  public setMode(mode: 'full' | 'minimal'): void {
    const previousMode = this.currentMode;
    this.currentMode = mode;
    
    if (mode === 'minimal') {
      // Hide less critical panels
      this.statusPanel.setVisible(false);
      this.magicPalette.setVisible(false);
      // Reduce overlay noise
      this.mainPanel.setAlpha(0.9);
      this.guidancePanel.setVisible(false);
    } else {
      // Show all panels
      this.statusPanel.setVisible(true);
      this.magicPalette.setVisible(true);
      this.guidancePanel.setVisible(true);
    }
    
    this.eventBus.emit({
      type: 'ASI_MODE_CHANGED',
      data: {
        previousMode,
        newMode: mode,
        timestamp: Date.now()
      }
    });
  }

  // Overlay visibility toggles for keyboard shortcuts or buttons
  public toggleThreatOverlay(): void {
    this.overlaysVisible.threat = !this.overlaysVisible.threat;
    this.threatOverlay.setVisible(this.overlaysVisible.threat);
  }
  public toggleOpportunityOverlay(): void {
    this.overlaysVisible.opportunity = !this.overlaysVisible.opportunity;
    this.opportunityOverlay.setVisible(this.overlaysVisible.opportunity);
  }
  public toggleEmotionalOverlay(): void {
    this.overlaysVisible.emotional = !this.overlaysVisible.emotional;
    this.emotionalOverlay.setVisible(this.overlaysVisible.emotional);
  }

  public destroy(): void {
    this.guidanceButtons.clear(true, true);
    this.threatIndicators.clear(true, true);
    this.panelBackgrounds.clear();
    // Unsubscribe event handlers
    this.subscriptions.forEach(unsub => {
      try { unsub(); } catch {}
    });
    this.subscriptions = [];
    
    super.destroy();
  }
}
