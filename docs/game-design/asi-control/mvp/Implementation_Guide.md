# Implementation Guide for MVP ASI Interface

## Development Phases

### Phase 1: Foundation Setup (Week 1-2)

#### Week 1: Core Infrastructure

**Day 1-2: Project Setup**
```bash
# Create MVP development branch
git checkout -b mvp-asi-interface

# Set up development environment
npm install --save-dev @types/phaser

# Create MVP component structure
mkdir -p src/mvp/ui/components
mkdir -p src/mvp/systems
mkdir -p src/mvp/types
```

**Day 3-4: Basic UI Framework**
```typescript
// src/mvp/ui/components/CommandCenterUI.ts
import { EventBus } from '../../../core/EventBus';
import { PlayerManager } from '../../../core/PlayerManager';

interface CommandCenterUIConfig {
  scene: Phaser.Scene;
  width: number;
  height: number;
  eventBus: EventBus;
  playerManager: PlayerManager;
}

export class CommandCenterUI extends Phaser.GameObjects.Container {
  private mainPanel: Phaser.GameObjects.Rectangle;
  private statusPanel: Phaser.GameObjects.Rectangle;
  private guidancePanel: Phaser.GameObjects.Rectangle;
  private background: Phaser.GameObjects.Graphics;
  
  constructor(config: CommandCenterUIConfig) {
    super(config.scene, 0, 0);
    this.scene = config.scene;
    this.setupPanels(config.width, config.height);
    this.setupEventHandlers(config.eventBus);
    this.scene.add.existing(this);
  }
  
  private setupPanels(width: number, height: number): void {
    // Main game view (60% of screen)
    this.mainPanel = this.scene.add.rectangle(
      width * 0.3, height * 0.5, width * 0.6, height * 0.8, 0x001122, 0.8
    );
    this.add(this.mainPanel);
    
    // Status panel (20% of screen)
    this.statusPanel = this.scene.add.rectangle(
      width * 0.85, height * 0.25, width * 0.3, height * 0.4, 0x112200, 0.8
    );
    this.add(this.statusPanel);
    
    // Guidance panel (20% of screen)
    this.guidancePanel = this.scene.add.rectangle(
      width * 0.85, height * 0.75, width * 0.3, height * 0.4, 0x220011, 0.8
    );
    this.add(this.guidancePanel);
  }
  
  private setupEventHandlers(eventBus: EventBus): void {
    eventBus.on('ASI_GUIDANCE_GIVEN', this.handleGuidanceGiven.bind(this));
    eventBus.on('TRUST_CHANGED', this.handleTrustChanged.bind(this));
  }
  
  private handleGuidanceGiven(event: any): void {
    // Handle guidance visual feedback
  }
  
  private handleTrustChanged(event: any): void {
    // Update trust visualization
  }
}
```

**Day 5-7: Trust System Foundation**
```typescript
// src/mvp/systems/TrustManager.ts
import { EventBus } from '../../core/EventBus';

interface TrustState {
  currentLevel: number; // 0-100
  trend: 'increasing' | 'decreasing' | 'stable';
  lastChange: number;
  changeRate: number;
}

interface TrustEvent {
  type: 'guidance_followed' | 'guidance_ignored' | 'success' | 'failure';
  impact: number;
  timestamp: number;
  context: string;
}

export class TrustManager {
  private trustState: TrustState;
  private eventBus: EventBus;
  private eventHistory: TrustEvent[] = [];
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.trustState = {
      currentLevel: 50, // Start at neutral
      trend: 'stable',
      lastChange: 0,
      changeRate: 0
    };
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    this.eventBus.on('GUIDANCE_FOLLOWED', this.handleGuidanceFollowed.bind(this));
    this.eventBus.on('GUIDANCE_IGNORED', this.handleGuidanceIgnored.bind(this));
    this.eventBus.on('PLAYER_SUCCESS', this.handlePlayerSuccess.bind(this));
    this.eventBus.on('PLAYER_FAILURE', this.handlePlayerFailure.bind(this));
  }
  
  private handleGuidanceFollowed(event: any): void {
    this.adjustTrust(2, 'guidance_followed', event.context);
  }
  
  private handleGuidanceIgnored(event: any): void {
    this.adjustTrust(-1, 'guidance_ignored', event.context);
  }
  
  private handlePlayerSuccess(event: any): void {
    if (event.guidanceInfluenced) {
      this.adjustTrust(5, 'success', event.context);
    }
  }
  
  private handlePlayerFailure(event: any): void {
    if (event.guidanceInfluenced) {
      this.adjustTrust(-3, 'failure', event.context);
    }
  }
  
  private adjustTrust(change: number, type: string, context: string): void {
    const previousLevel = this.trustState.currentLevel;
    this.trustState.currentLevel = Math.max(0, Math.min(100, this.trustState.currentLevel + change));
    
    const trustEvent: TrustEvent = {
      type: type as any,
      impact: change,
      timestamp: Date.now(),
      context: context
    };
    
    this.eventHistory.push(trustEvent);
    this.updateTrend();
    
    // Emit trust change event
    this.eventBus.emit({
      type: 'TRUST_CHANGED',
      data: {
        previousLevel,
        currentLevel: this.trustState.currentLevel,
        change,
        trend: this.trustState.trend,
        event: trustEvent
      }
    });
  }
  
  private updateTrend(): void {
    const recentEvents = this.eventHistory.slice(-5);
    const totalChange = recentEvents.reduce((sum, event) => sum + event.impact, 0);
    
    if (totalChange > 0) {
      this.trustState.trend = 'increasing';
    } else if (totalChange < 0) {
      this.trustState.trend = 'decreasing';
    } else {
      this.trustState.trend = 'stable';
    }
  }
  
  public getTrustLevel(): number {
    return this.trustState.currentLevel;
  }
  
  public getTrustState(): TrustState {
    return { ...this.trustState };
  }
}
```

#### Week 2: Threat Detection System

**Day 8-10: Threat Detection Core**
```typescript
// src/mvp/systems/ThreatDetector.ts
import { EventBus } from '../../core/EventBus';

interface ThreatInfo {
  id: string;
  type: 'enemy' | 'environmental' | 'social';
  position: { x: number; y: number };
  severity: 'low' | 'medium' | 'high';
  timeToImpact: number;
  janeAware: boolean;
  description: string;
}

export class ThreatDetector {
  private scene: Phaser.Scene;
  private eventBus: EventBus;
  private detectionRadius: number = 300;
  private activeThreatS: Map<string, ThreatInfo> = new Map();
  private threatOverlays: Map<string, Phaser.GameObjects.Graphics> = new Map();
  
  constructor(scene: Phaser.Scene, eventBus: EventBus) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.setupDetectionLoop();
  }
  
  private setupDetectionLoop(): void {
    this.scene.time.addEvent({
      delay: 500, // Check every 500ms
      callback: this.scanForThreats.bind(this),
      loop: true
    });
  }
  
  private scanForThreats(): void {
    // Get Jane's position
    const playerManager = (this.scene as any).playerManager;
    if (!playerManager) return;
    
    const jane = playerManager.getJane();
    if (!jane || !jane.sprite) return;
    
    const janePosition = {
      x: jane.sprite.x,
      y: jane.sprite.y
    };
    
    // Scan for enemy threats
    this.detectEnemyThreats(janePosition);
    
    // Scan for environmental threats
    this.detectEnvironmentalThreats(janePosition);
    
    // Clean up expired threats
    this.cleanupExpiredThreats();
  }
  
  private detectEnemyThreats(janePosition: { x: number; y: number }): void {
    const enemies = (this.scene as any).enemyManager?.getAliveEnemies() || [];
    
    enemies.forEach((enemy: any) => {
      const distance = Phaser.Math.Distance.Between(
        janePosition.x, janePosition.y,
        enemy.x, enemy.y
      );
      
      if (distance <= this.detectionRadius) {
        const threatId = `enemy_${enemy.id}`;
        const janeAware = distance <= 150; // Jane notices enemies within 150 pixels
        
        const threat: ThreatInfo = {
          id: threatId,
          type: 'enemy',
          position: { x: enemy.x, y: enemy.y },
          severity: this.calculateThreatSeverity(enemy, distance),
          timeToImpact: this.calculateTimeToImpact(enemy, janePosition),
          janeAware,
          description: `${enemy.type} enemy approaching`
        };
        
        this.updateThreat(threat);
      }
    });
  }
  
  private detectEnvironmentalThreats(janePosition: { x: number; y: number }): void {
    // Check for environmental hazards like spikes, pits, unstable terrain
    // This is a simplified implementation
    const hazards = this.getEnvironmentalHazards();
    
    hazards.forEach((hazard: any) => {
      const distance = Phaser.Math.Distance.Between(
        janePosition.x, janePosition.y,
        hazard.x, hazard.y
      );
      
      if (distance <= this.detectionRadius) {
        const threatId = `env_${hazard.id}`;
        const janeAware = distance <= 100; // Jane notices environmental hazards closer
        
        const threat: ThreatInfo = {
          id: threatId,
          type: 'environmental',
          position: { x: hazard.x, y: hazard.y },
          severity: hazard.severity,
          timeToImpact: distance / 100, // Rough estimate
          janeAware,
          description: hazard.description
        };
        
        this.updateThreat(threat);
      }
    });
  }
  
  private updateThreat(threat: ThreatInfo): void {
    const existingThreat = this.activeThreatS.get(threat.id);
    
    if (!existingThreat) {
      // New threat detected
      this.activeThreatS.set(threat.id, threat);
      this.createThreatOverlay(threat);
      
      this.eventBus.emit({
        type: 'THREAT_DETECTED',
        data: threat
      });
    } else {
      // Update existing threat
      this.activeThreatS.set(threat.id, threat);
      this.updateThreatOverlay(threat);
    }
  }
  
  private createThreatOverlay(threat: ThreatInfo): void {
    const overlay = this.scene.add.graphics();
    
    // Color based on severity and Jane's awareness
    let color = 0xff0000; // Red for high severity
    let alpha = threat.janeAware ? 0.3 : 0.7; // More opaque if Jane is unaware
    
    if (threat.severity === 'medium') color = 0xffaa00; // Orange
    if (threat.severity === 'low') color = 0xffff00; // Yellow
    
    overlay.fillStyle(color, alpha);
    overlay.fillCircle(threat.position.x, threat.position.y, 30);
    
    // Add pulsing animation for ASI-only threats
    if (!threat.janeAware) {
      this.scene.tweens.add({
        targets: overlay,
        alpha: { from: 0.7, to: 0.3 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
    }
    
    this.threatOverlays.set(threat.id, overlay);
  }
  
  private updateThreatOverlay(threat: ThreatInfo): void {
    const overlay = this.threatOverlays.get(threat.id);
    if (overlay) {
      overlay.clear();
      
      let color = 0xff0000;
      let alpha = threat.janeAware ? 0.3 : 0.7;
      
      if (threat.severity === 'medium') color = 0xffaa00;
      if (threat.severity === 'low') color = 0xffff00;
      
      overlay.fillStyle(color, alpha);
      overlay.fillCircle(threat.position.x, threat.position.y, 30);
    }
  }
  
  private cleanupExpiredThreats(): void {
    const expiredThreats: string[] = [];
    
    this.activeThreatS.forEach((threat, id) => {
      if (threat.timeToImpact <= 0) {
        expiredThreats.push(id);
      }
    });
    
    expiredThreats.forEach(id => {
      this.activeThreatS.delete(id);
      const overlay = this.threatOverlays.get(id);
      if (overlay) {
        overlay.destroy();
        this.threatOverlays.delete(id);
      }
    });
  }
  
  private calculateThreatSeverity(enemy: any, distance: number): 'low' | 'medium' | 'high' {
    if (distance < 50) return 'high';
    if (distance < 150) return 'medium';
    return 'low';
  }
  
  private calculateTimeToImpact(enemy: any, janePosition: { x: number; y: number }): number {
    const distance = Phaser.Math.Distance.Between(
      janePosition.x, janePosition.y,
      enemy.x, enemy.y
    );
    const enemySpeed = enemy.speed || 50;
    return distance / enemySpeed;
  }
  
  private getEnvironmentalHazards(): any[] {
    // Simplified implementation - would integrate with actual level data
    return [
      { id: 'spike_1', x: 400, y: 300, severity: 'high', description: 'Deadly spikes' },
      { id: 'pit_1', x: 600, y: 350, severity: 'medium', description: 'Deep pit' }
    ];
  }
  
  public getActiveThreats(): ThreatInfo[] {
    return Array.from(this.activeThreatS.values());
  }
  
  public getThreatById(id: string): ThreatInfo | undefined {
    return this.activeThreatS.get(id);
  }
}
```

**Day 11-14: Trust Visualization**
```typescript
// src/mvp/ui/components/TrustMeter.ts
import { EventBus } from '../../../core/EventBus';

interface TrustMeterConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  eventBus: EventBus;
}

export class TrustMeter extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private trustBar: Phaser.GameObjects.Graphics;
  private trustText: Phaser.GameObjects.Text;
  private trendIndicator: Phaser.GameObjects.Graphics;
  private currentTrust: number = 50;
  private targetTrust: number = 50;
  private trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  
  constructor(config: TrustMeterConfig) {
    super(config.scene, config.x, config.y);
    
    this.setupVisuals(config.width, config.height);
    this.setupEventHandlers(config.eventBus);
    
    config.scene.add.existing(this);
  }
  
  private setupVisuals(width: number, height: number): void {
    // Background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x333333, 0.8);
    this.background.fillRoundedRect(0, 0, width, height, 5);
    this.add(this.background);
    
    // Trust bar
    this.trustBar = this.scene.add.graphics();
    this.add(this.trustBar);
    
    // Trust text
    this.trustText = this.scene.add.text(width / 2, height / 2, 'Trust: 50%', {
      fontSize: '14px',
      color: '#ffffff',
      align: 'center'
    });
    this.trustText.setOrigin(0.5, 0.5);
    this.add(this.trustText);
    
    // Trend indicator
    this.trendIndicator = this.scene.add.graphics();
    this.add(this.trendIndicator);
    
    this.updateVisuals(width, height);
  }
  
  private setupEventHandlers(eventBus: EventBus): void {
    eventBus.on('TRUST_CHANGED', this.handleTrustChanged.bind(this));
  }
  
  private handleTrustChanged(event: any): void {
    this.targetTrust = event.data.currentLevel;
    this.trend = event.data.trend;
    
    // Animate trust change
    this.scene.tweens.add({
      targets: this,
      currentTrust: this.targetTrust,
      duration: 500,
      ease: 'Power2',
      onUpdate: () => {
        this.updateVisuals(this.background.width, this.background.height);
      }
    });
  }
  
  private updateVisuals(width: number, height: number): void {
    // Clear and redraw trust bar
    this.trustBar.clear();
    
    // Color based on trust level
    let barColor = 0xff0000; // Red for low trust
    if (this.currentTrust > 33) barColor = 0xffaa00; // Orange for medium trust
    if (this.currentTrust > 66) barColor = 0x00ff00; // Green for high trust
    
    this.trustBar.fillStyle(barColor, 0.8);
    const barWidth = (width - 10) * (this.currentTrust / 100);
    this.trustBar.fillRoundedRect(5, 5, barWidth, height - 10, 3);
    
    // Update text
    this.trustText.setText(`Trust: ${Math.round(this.currentTrust)}%`);
    
    // Update trend indicator
    this.trendIndicator.clear();
    this.trendIndicator.lineStyle(2, 0xffffff, 0.8);
    
    const centerX = width - 20;
    const centerY = height / 2;
    
    if (this.trend === 'increasing') {
      this.trendIndicator.moveTo(centerX - 5, centerY + 5);
      this.trendIndicator.lineTo(centerX, centerY - 5);
      this.trendIndicator.lineTo(centerX + 5, centerY + 5);
    } else if (this.trend === 'decreasing') {
      this.trendIndicator.moveTo(centerX - 5, centerY - 5);
      this.trendIndicator.lineTo(centerX, centerY + 5);
      this.trendIndicator.lineTo(centerX + 5, centerY - 5);
    } else {
      this.trendIndicator.moveTo(centerX - 5, centerY);
      this.trendIndicator.lineTo(centerX + 5, centerY);
    }
    
    this.trendIndicator.strokePath();
  }
  
  public setTrust(level: number): void {
    this.currentTrust = Math.max(0, Math.min(100, level));
    this.updateVisuals(this.background.width, this.background.height);
  }
  
  public getTrust(): number {
    return this.currentTrust;
  }
}
```

### Phase 2: Guidance System (Week 3-4)

#### Week 3: Guidance Engine

**Day 15-17: Context Analysis System**
```typescript
// src/mvp/systems/GuidanceEngine.ts
import { EventBus } from '../../core/EventBus';
import { TrustManager } from './TrustManager';
import { ThreatDetector } from './ThreatDetector';

interface GuidanceContext {
  janePosition: { x: number; y: number };
  janeState: string;
  janeHealth: number;
  environmentalThreats: any[];
  availableActions: string[];
  trustLevel: number;
  recentEvents: any[];
}

interface GuidanceSuggestion {
  id: string;
  type: 'movement' | 'action' | 'social' | 'combat';
  priority: 'low' | 'medium' | 'high' | 'critical';
  text: string;
  action: string;
  confidence: number;
  expectedOutcome: string;
}

export class GuidanceEngine {
  private scene: Phaser.Scene;
  private eventBus: EventBus;
  private trustManager: TrustManager;
  private threatDetector: ThreatDetector;
  private activeSuggestions: Map<string, GuidanceSuggestion> = new Map();
  private suggestionHistory: any[] = [];
  
  constructor(scene: Phaser.Scene, eventBus: EventBus, trustManager: TrustManager, threatDetector: ThreatDetector) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.trustManager = trustManager;
    this.threatDetector = threatDetector;
    this.setupGuidanceLoop();
  }
  
  private setupGuidanceLoop(): void {
    this.scene.time.addEvent({
      delay: 1000, // Generate suggestions every second
      callback: this.generateSuggestions.bind(this),
      loop: true
    });
  }
  
  private generateSuggestions(): void {
    const context = this.analyzeContext();
    const suggestions = this.createSuggestions(context);
    
    // Clear old suggestions
    this.activeSuggestions.clear();
    
    // Add new suggestions
    suggestions.forEach(suggestion => {
      this.activeSuggestions.set(suggestion.id, suggestion);
    });
    
    // Emit suggestions update
    this.eventBus.emit({
      type: 'GUIDANCE_SUGGESTIONS_UPDATED',
      data: {
        suggestions: Array.from(this.activeSuggestions.values()),
        context
      }
    });
  }
  
  private analyzeContext(): GuidanceContext {
    const playerManager = (this.scene as any).playerManager;
    const jane = playerManager?.getJane();
    
    if (!jane || !jane.sprite) {
      return this.getDefaultContext();
    }
    
    return {
      janePosition: { x: jane.sprite.x, y: jane.sprite.y },
      janeState: jane.state || 'idle',
      janeHealth: jane.health || 100,
      environmentalThreats: this.threatDetector.getActiveThreats(),
      availableActions: this.getAvailableActions(jane),
      trustLevel: this.trustManager.getTrustLevel(),
      recentEvents: this.getRecentEvents()
    };
  }
  
  private createSuggestions(context: GuidanceContext): GuidanceSuggestion[] {
    const suggestions: GuidanceSuggestion[] = [];
    
    // Threat-based suggestions
    context.environmentalThreats.forEach(threat => {
      if (!threat.janeAware) {
        suggestions.push({
          id: `avoid_${threat.id}`,
          type: 'movement',
          priority: threat.severity === 'high' ? 'critical' : 'high',
          text: `Avoid ${threat.description}`,
          action: `move_away_from_${threat.id}`,
          confidence: 85,
          expectedOutcome: 'Jane avoids danger'
        });
      }
    });
    
    // Health-based suggestions
    if (context.janeHealth < 50) {
      suggestions.push({
        id: 'find_healing',
        type: 'action',
        priority: 'high',
        text: 'Look for healing items',
        action: 'search_for_health',
        confidence: 70,
        expectedOutcome: 'Jane recovers health'
      });
    }
    
    // Trust-based suggestions
    if (context.trustLevel < 30) {
      suggestions.push({
        id: 'build_trust',
        type: 'social',
        priority: 'medium',
        text: 'Take a moment to rest',
        action: 'rest_and_reflect',
        confidence: 60,
        expectedOutcome: 'Jane feels more confident'
      });
    }
    
    // Opportunity-based suggestions
    if (context.janeState === 'idle') {
      suggestions.push({
        id: 'explore_area',
        type: 'movement',
        priority: 'low',
        text: 'Explore the surrounding area',
        action: 'explore_nearby',
        confidence: 50,
        expectedOutcome: 'Jane discovers new areas'
      });
    }
    
    return suggestions.sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));
  }
  
  private getAvailableActions(jane: any): string[] {
    const actions = ['move', 'jump', 'interact'];
    
    if (jane.canAttack) actions.push('attack');
    if (jane.canUseItem) actions.push('use_item');
    if (jane.canTalk) actions.push('talk');
    
    return actions;
  }
  
  private getRecentEvents(): any[] {
    return this.suggestionHistory.slice(-5);
  }
  
  private getDefaultContext(): GuidanceContext {
    return {
      janePosition: { x: 0, y: 0 },
      janeState: 'unknown',
      janeHealth: 100,
      environmentalThreats: [],
      availableActions: [],
      trustLevel: 50,
      recentEvents: []
    };
  }
  
  private getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }
  
  public handleGuidanceSelection(suggestionId: string): void {
    const suggestion = this.activeSuggestions.get(suggestionId);
    if (!suggestion) return;
    
    // Record suggestion selection
    this.suggestionHistory.push({
      suggestion,
      timestamp: Date.now(),
      selected: true
    });
    
    // Emit guidance given event
    this.eventBus.emit({
      type: 'ASI_GUIDANCE_GIVEN',
      data: {
        suggestion,
        context: this.analyzeContext()
      }
    });
    
    // Remove suggestion from active list
    this.activeSuggestions.delete(suggestionId);
  }
  
  public getActiveSuggestions(): GuidanceSuggestion[] {
    return Array.from(this.activeSuggestions.values());
  }
}
```

**Day 18-21: Jane's Response System**
```typescript
// src/mvp/systems/JaneAI.ts
import { EventBus } from '../../core/EventBus';
import { TrustManager } from './TrustManager';

interface JanePersonality {
  independence: number; // 0-100, higher = more likely to act independently
  trustingness: number; // 0-100, higher = more likely to follow guidance
  emotionalState: 'calm' | 'stressed' | 'confident' | 'anxious';
  cautionLevel: number; // 0-100, higher = more cautious
}

interface JaneState {
  position: { x: number; y: number };
  health: number;
  energy: number;
  currentAction: string;
  recentGuidance: any[];
  personality: JanePersonality;
}

export class JaneAI {
  private scene: Phaser.Scene;
  private eventBus: EventBus;
  private trustManager: TrustManager;
  private janeState: JaneState;
  private decisionCooldown: number = 0;
  
  constructor(scene: Phaser.Scene, eventBus: EventBus, trustManager: TrustManager) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.trustManager = trustManager;
    this.initializeJaneState();
    this.setupEventHandlers();
  }
  
  private initializeJaneState(): void {
    this.janeState = {
      position: { x: 0, y: 0 },
      health: 100,
      energy: 100,
      currentAction: 'idle',
      recentGuidance: [],
      personality: {
        independence: 60,
        trustingness: 70,
        emotionalState: 'calm',
        cautionLevel: 50
      }
    };
  }
  
  private setupEventHandlers(): void {
    this.eventBus.on('ASI_GUIDANCE_GIVEN', this.handleGuidanceGiven.bind(this));
    this.eventBus.on('THREAT_DETECTED', this.handleThreatDetected.bind(this));
    this.eventBus.on('TRUST_CHANGED', this.handleTrustChanged.bind(this));
    
    // Update loop
    this.scene.time.addEvent({
      delay: 100,
      callback: this.update.bind(this),
      loop: true
    });
  }
  
  private update(): void {
    if (this.decisionCooldown > 0) {
      this.decisionCooldown -= 100;
      return;
    }
    
    // Update Jane's state
    this.updateJaneState();
    
    // Process pending guidance
    this.processGuidance();
    
    // Make autonomous decisions
    this.makeAutonomousDecisions();
  }
  
  private updateJaneState(): void {
    const playerManager = (this.scene as any).playerManager;
    const jane = playerManager?.getJane();
    
    if (jane && jane.sprite) {
      this.janeState.position.x = jane.sprite.x;
      this.janeState.position.y = jane.sprite.y;
      this.janeState.health = jane.health || 100;
    }
    
    // Update emotional state based on recent events
    this.updateEmotionalState();
  }
  
  private updateEmotionalState(): void {
    const trustLevel = this.trustManager.getTrustLevel();
    const recentFailures = this.janeState.recentGuidance.filter(g => g.outcome === 'failure').length;
    
    if (trustLevel > 75 && recentFailures === 0) {
      this.janeState.personality.emotionalState = 'confident';
    } else if (trustLevel < 25 || recentFailures > 2) {
      this.janeState.personality.emotionalState = 'anxious';
    } else if (this.janeState.health < 50) {
      this.janeState.personality.emotionalState = 'stressed';
    } else {
      this.janeState.personality.emotionalState = 'calm';
    }
  }
  
  private handleGuidanceGiven(event: any): void {
    const guidance = event.data.suggestion;
    const trustLevel = this.trustManager.getTrustLevel();
    
    // Calculate likelihood of following guidance
    const followChance = this.calculateFollowChance(guidance, trustLevel);
    
    if (Math.random() * 100 < followChance) {
      this.followGuidance(guidance);
    } else {
      this.ignoreGuidance(guidance);
    }
  }
  
  private calculateFollowChance(guidance: any, trustLevel: number): number {
    let baseChance = 50;
    
    // Trust factor
    baseChance += (trustLevel - 50) * 0.8;
    
    // Personality factors
    baseChance += (this.janeState.personality.trustingness - 50) * 0.6;
    baseChance -= (this.janeState.personality.independence - 50) * 0.4;
    
    // Guidance priority factor
    if (guidance.priority === 'critical') baseChance += 40;
    else if (guidance.priority === 'high') baseChance += 20;
    else if (guidance.priority === 'medium') baseChance += 10;
    
    // Emotional state factor
    switch (this.janeState.personality.emotionalState) {
      case 'confident': baseChance += 10; break;
      case 'anxious': baseChance += 15; break;
      case 'stressed': baseChance += 5; break;
    }
    
    return Math.max(0, Math.min(100, baseChance));
  }
  
  private followGuidance(guidance: any): void {
    // Record guidance following
    this.janeState.recentGuidance.push({
      guidance,
      timestamp: Date.now(),
      followed: true,
      outcome: 'pending'
    });
    
    // Execute the guidance action
    this.executeAction(guidance.action);
    
    // Emit guidance followed event
    this.eventBus.emit({
      type: 'GUIDANCE_FOLLOWED',
      data: {
        guidance,
        janeState: this.janeState,
        context: 'Jane chose to follow ASI guidance'
      }
    });
    
    // Set cooldown to prevent rapid decision changes
    this.decisionCooldown = 2000;
  }
  
  private ignoreGuidance(guidance: any): void {
    // Record guidance ignoring
    this.janeState.recentGuidance.push({
      guidance,
      timestamp: Date.now(),
      followed: false,
      outcome: 'ignored'
    });
    
    // Emit guidance ignored event
    this.eventBus.emit({
      type: 'GUIDANCE_IGNORED',
      data: {
        guidance,
        janeState: this.janeState,
        context: 'Jane chose to ignore ASI guidance'
      }
    });
    
    // Make alternative decision
    this.makeAlternativeDecision(guidance);
  }
  
  private executeAction(action: string): void {
    const playerManager = (this.scene as any).playerManager;
    const jane = playerManager?.getJane();
    
    if (!jane) return;
    
    // Simple action execution - would be more complex in full implementation
    switch (action) {
      case 'move_away_from_threat':
        this.moveAwayFromThreats();
        break;
      case 'search_for_health':
        this.searchForHealth();
        break;
      case 'rest_and_reflect':
        this.restAndReflect();
        break;
      case 'explore_nearby':
        this.exploreNearby();
        break;
      default:
        console.log(`Jane executing action: ${action}`);
    }
  }
  
  private moveAwayFromThreats(): void {
    // Simple threat avoidance behavior
    console.log('Jane is moving away from detected threats');
    this.janeState.currentAction = 'avoiding_threat';
  }
  
  private searchForHealth(): void {
    console.log('Jane is searching for healing items');
    this.janeState.currentAction = 'searching_health';
  }
  
  private restAndReflect(): void {
    console.log('Jane is taking a moment to rest and reflect');
    this.janeState.currentAction = 'resting';
    this.janeState.energy = Math.min(100, this.janeState.energy + 10);
  }
  
  private exploreNearby(): void {
    console.log('Jane is exploring the nearby area');
    this.janeState.currentAction = 'exploring';
  }
  
  private makeAlternativeDecision(ignoredGuidance: any): void {
    // Jane makes her own decision when ignoring guidance
    const alternatives = ['continue_current_action', 'move_randomly', 'wait_and_observe'];
    const choice = alternatives[Math.floor(Math.random() * alternatives.length)];
    
    this.executeAction(choice);
  }
  
  private makeAutonomousDecisions(): void {
    // Jane makes independent decisions when no guidance is active
    if (this.janeState.currentAction === 'idle') {
      const autonomousActions = ['explore', 'rest', 'observe_environment'];
      const action = autonomousActions[Math.floor(Math.random() * autonomousActions.length)];
      this.executeAction(action);
    }
  }
  
  private processGuidance(): void {
    // Process outcomes of recent guidance
    this.janeState.recentGuidance.forEach(guidance => {
      if (guidance.outcome === 'pending') {
        // Simulate guidance outcome
        const success = Math.random() > 0.3; // 70% success rate
        guidance.outcome = success ? 'success' : 'failure';
        
        // Emit outcome event
        this.eventBus.emit({
          type: success ? 'PLAYER_SUCCESS' : 'PLAYER_FAILURE',
          data: {
            guidance: guidance.guidance,
            guidanceInfluenced: true,
            context: `Guidance outcome: ${guidance.outcome}`
          }
        });
      }
    });
  }
  
  private handleThreatDetected(event: any): void {
    const threat = event.data;
    
    // Jane's natural response to threats
    if (threat.janeAware) {
      this.janeState.personality.emotionalState = 'stressed';
      this.janeState.personality.cautionLevel = Math.min(100, this.janeState.personality.cautionLevel + 10);
    }
  }
  
  private handleTrustChanged(event: any): void {
    const trustData = event.data;
    
    // Adjust personality based on trust changes
    if (trustData.trend === 'increasing') {
      this.janeState.personality.trustingness = Math.min(100, this.janeState.personality.trustingness + 2);
    } else if (trustData.trend === 'decreasing') {
      this.janeState.personality.trustingness = Math.max(0, this.janeState.personality.trustingness - 3);
      this.janeState.personality.independence = Math.min(100, this.janeState.personality.independence + 2);
    }
  }
  
  public getJaneState(): JaneState {
    return { ...this.janeState };
  }
}
```

#### Week 4: Guidance UI Implementation

**Day 22-24: Guidance Panel**
```typescript
// src/mvp/ui/components/GuidancePanel.ts
import { EventBus } from '../../../core/EventBus';

interface GuidancePanelConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  eventBus: EventBus;
}

interface GuidanceSuggestion {
  id: string;
  type: 'movement' | 'action' | 'social' | 'combat';
  priority: 'low' | 'medium' | 'high' | 'critical';
  text: string;
  action: string;
  confidence: number;
  expectedOutcome: string;
}

export class GuidancePanel extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private title: Phaser.GameObjects.Text;
  private suggestionButtons: Map<string, Phaser.GameObjects.Container> = new Map();
  private eventBus: EventBus;
  private panelWidth: number;
  private panelHeight: number;
  
  constructor(config: GuidancePanelConfig) {
    super(config.scene, config.x, config.y);
    
    this.eventBus = config.eventBus;
    this.panelWidth = config.width;
    this.panelHeight = config.height;
    
    this.setupVisuals();
    this.setupEventHandlers();
    
    config.scene.add.existing(this);
  }
  
  private setupVisuals(): void {
    // Background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x1a1a2e, 0.9);
    this.background.fillRoundedRect(0, 0, this.panelWidth, this.panelHeight, 8);
    this.background.lineStyle(2, 0x16213e, 1);
    this.background.strokeRoundedRect(0, 0, this.panelWidth, this.panelHeight, 8);
    this.add(this.background);
    
    // Title
    this.title = this.scene.add.text(this.panelWidth / 2, 20, 'ASI Guidance', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif'
    });
    this.title.setOrigin(0.5, 0);
    this.add(this.title);
  }
  
  private setupEventHandlers(): void {
    this.eventBus.on('GUIDANCE_SUGGESTIONS_UPDATED', this.handleSuggestionsUpdate.bind(this));
    this.eventBus.on('GUIDANCE_FOLLOWED', this.handleGuidanceFollowed.bind(this));
    this.eventBus.on('GUIDANCE_IGNORED', this.handleGuidanceIgnored.bind(this));
  }
  
  private handleSuggestionsUpdate(event: any): void {
    const suggestions = event.data.suggestions;
    this.updateSuggestions(suggestions);
  }
  
  private updateSuggestions(suggestions: GuidanceSuggestion[]): void {
    // Clear existing suggestions
    this.suggestionButtons.forEach(button => {
      button.destroy();
    });
    this.suggestionButtons.clear();
    
    // Add new suggestions (max 4)
    const maxSuggestions = 4;
    const visibleSuggestions = suggestions.slice(0, maxSuggestions);
    
    visibleSuggestions.forEach((suggestion, index) => {
      const button = this.createSuggestionButton(suggestion, index);
      this.suggestionButtons.set(suggestion.id, button);
      this.add(button);
    });
  }
  
  private createSuggestionButton(suggestion: GuidanceSuggestion, index: number): Phaser.GameObjects.Container {
    const buttonContainer = this.scene.add.container(0, 0);
    
    // Button dimensions
    const buttonWidth = this.panelWidth - 20;
    const buttonHeight = 60;
    const buttonY = 50 + (index * (buttonHeight + 10));
    
    // Button background
    const buttonBg = this.scene.add.graphics();
    this.styleButton(buttonBg, suggestion.priority, buttonWidth, buttonHeight);
    buttonBg.setPosition(10, buttonY);
    buttonContainer.add(buttonBg);
    
    // Suggestion text
    const suggestionText = this.scene.add.text(20, buttonY + 10, suggestion.text, {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      wordWrap: { width: buttonWidth - 60 }
    });
    buttonContainer.add(suggestionText);
    
    // Confidence indicator
    const confidenceText = this.scene.add.text(buttonWidth - 10, buttonY + 10, `${suggestion.confidence}%`, {
      fontSize: '10px',
      color: '#cccccc',
      fontFamily: 'Arial, sans-serif'
    });
    confidenceText.setOrigin(1, 0);
    buttonContainer.add(confidenceText);
    
    // Priority indicator
    const priorityIndicator = this.scene.add.graphics();
    this.drawPriorityIndicator(priorityIndicator, suggestion.priority);
    priorityIndicator.setPosition(buttonWidth - 35, buttonY + 5);
    buttonContainer.add(priorityIndicator);
    
    // Expected outcome
    const outcomeText = this.scene.add.text(20, buttonY + 35, suggestion.expectedOutcome, {
      fontSize: '10px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif',
      wordWrap: { width: buttonWidth - 60 }
    });
    buttonContainer.add(outcomeText);
    
    // Make button interactive
    const interactiveZone = this.scene.add.zone(10, buttonY, buttonWidth, buttonHeight);
    interactiveZone.setOrigin(0, 0);
    interactiveZone.setInteractive();
    
    interactiveZone.on('pointerdown', () => {
      this.handleSuggestionClick(suggestion);
    });
    
    interactiveZone.on('pointerover', () => {
      buttonBg.clear();
      this.styleButton(buttonBg, suggestion.priority, buttonWidth, buttonHeight, true);
    });
    
    interactiveZone.on('pointerout', () => {
      buttonBg.clear();
      this.styleButton(buttonBg, suggestion.priority, buttonWidth, buttonHeight, false);
    });
    
    buttonContainer.add(interactiveZone);
    
    return buttonContainer;
  }
  
  private styleButton(graphics: Phaser.GameObjects.Graphics, priority: string, width: number, height: number, hover: boolean = false): void {
    let borderColor = 0x444444;
    let fillColor = 0x2a2a2a;
    let alpha = 0.8;
    
    if (hover) {
      alpha = 1.0;
      fillColor = 0x333333;
    }
    
    switch (priority) {
      case 'critical':
        borderColor = 0xff4444;
        if (hover) fillColor = 0x442222;
        break;
      case 'high':
        borderColor = 0xffaa44;
        if (hover) fillColor = 0x442a22;
        break;
      case 'medium':
        borderColor = 0x44aaff;
        if (hover) fillColor = 0x222a44;
        break;
      case 'low':
        borderColor = 0x44ff44;
        if (hover) fillColor = 0x224422;
        break;
    }
    
    graphics.fillStyle(fillColor, alpha);
    graphics.fillRoundedRect(0, 0, width, height, 5);
    graphics.lineStyle(2, borderColor, alpha);
    graphics.strokeRoundedRect(0, 0, width, height, 5);
  }
  
  private drawPriorityIndicator(graphics: Phaser.GameObjects.Graphics, priority: string): void {
    let color = 0x666666;
    let size = 8;
    
    switch (priority) {
      case 'critical':
        color = 0xff4444;
        size = 12;
        break;
      case 'high':
        color = 0xffaa44;
        size = 10;
        break;
      case 'medium':
        color = 0x44aaff;
        size = 8;
        break;
      case 'low':
        color = 0x44ff44;
        size = 6;
        break;
    }
    
    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, size);
  }
  
  private handleSuggestionClick(suggestion: GuidanceSuggestion): void {
    // Emit guidance selection event
    this.eventBus.emit({
      type: 'GUIDANCE_SELECTED',
      data: {
        suggestion,
        timestamp: Date.now()
      }
    });
    
    // Visual feedback
    this.scene.tweens.add({
      targets: this.suggestionButtons.get(suggestion.id),
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
  }
  
  private handleGuidanceFollowed(event: any): void {
    // Show positive feedback
    this.showFeedback('Jane followed your guidance!', 0x44ff44);
  }
  
  private handleGuidanceIgnored(event: any): void {
    // Show neutral feedback
    this.showFeedback('Jane chose a different path', 0xffaa44);
  }
  
  private showFeedback(message: string, color: number): void {
    const feedback = this.scene.add.text(this.panelWidth / 2, this.panelHeight - 20, message, {
      fontSize: '12px',
      color: `#${color.toString(16)}`,
      fontFamily: 'Arial, sans-serif'
    });
    feedback.setOrigin(0.5, 1);
    
    this.add(feedback);
    
    // Fade out after 3 seconds
    this.scene.tweens.add({
      targets: feedback,
      alpha: 0,
      duration: 1000,
      delay: 2000,
      onComplete: () => {
        feedback.destroy();
      }
    });
  }
}
```

This implementation guide provides a solid foundation for the first two phases of MVP development. The remaining phases (Universal Magic integration and testing) would follow similar patterns with detailed implementation steps and code examples.

Continue with the remaining phases by creating similar detailed implementation guides for:
- Phase 3: Universal Magic System
- Phase 4: Testing & Analytics
- Integration guides for existing systems
- Performance optimization guides
- User testing protocols
