// TrustManager.ts
// Core trust relationship system for ASI Control Interface
// Tracks and manages the dynamic trust relationship between ASI and Jane

import { EventBus } from '../../core/EventBus';
import { TrustState, TrustEvent, TrustManagerConfig } from '../types';

export class TrustManager {
  private eventBus: EventBus;
  private trustState: TrustState;
  private config: TrustManagerConfig;
  private updateTimer: NodeJS.Timeout | null = null;

  constructor(config: TrustManagerConfig) {
    this.eventBus = config.eventBus;
    this.config = config;
    
    this.trustState = {
      currentLevel: config.initialTrust || 50,
      trend: 'stable',
      lastChange: 0,
      changeRate: 0,
      recentEvents: []
    };

    this.setupEventHandlers();
    this.startUpdateTimer();
  }

  private setupEventHandlers(): void {
    // Listen for guidance events
    this.eventBus.on('GUIDANCE_SELECTED', (event: any) => {
      this.handleGuidanceGiven(event.data);
    });

    this.eventBus.on('JANE_RESPONSE', (event: any) => {
      if (event.data.followed) {
        this.handleGuidanceFollowed(event.data);
      } else {
        this.handleGuidanceIgnored(event.data);
      }
    });

    // Listen for mission and combat outcomes
    this.eventBus.on('MISSION_COMPLETED', (event: any) => {
      this.handlePlayerSuccess(event.data);
    });

    this.eventBus.on('JANE_DEFEATED', (event: any) => {
      this.handlePlayerFailure(event.data);
    });

    this.eventBus.on('PLAYER_DEFEATED', (event: any) => {
      this.handlePlayerFailure(event.data);
    });

    // Listen for magic usage
    this.eventBus.on('MAGIC_CAST', (event: any) => {
      this.handleMagicUsage(event.data);
    });
  }

  private startUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    this.updateTimer = setInterval(() => {
      this.updateTrustDecay();
    }, this.config.updateInterval || 5000);
  }

  public getTrustLevel(): number {
    return this.trustState.currentLevel;
  }

  public getTrustState(): TrustState {
    return { ...this.trustState };
  }

  public handleGuidanceGiven(guidanceData: any): void {
    // Small positive trust for providing guidance
    this.addTrustEvent({
      type: 'guidance_followed',
      impact: 0.5,
      timestamp: Date.now(),
      context: `Guidance given: ${guidanceData.suggestion?.title || 'Unknown'}`,
      guidanceId: guidanceData.suggestion?.id
    });
  }

  public handleGuidanceFollowed(responseData: any): void {
    // Positive trust for following guidance
    const impact = Math.min(responseData.trustChange || 2, 5);
    this.addTrustEvent({
      type: 'guidance_followed',
      impact,
      timestamp: Date.now(),
      context: `Guidance followed successfully`,
      guidanceId: responseData.guidanceId
    });
  }

  public handleGuidanceIgnored(responseData: any): void {
    // Slight negative trust for ignoring guidance
    const impact = Math.max(responseData.trustChange || -1, -3);
    this.addTrustEvent({
      type: 'guidance_ignored',
      impact,
      timestamp: Date.now(),
      context: `Guidance ignored`,
      guidanceId: responseData.guidanceId
    });
  }

  public handlePlayerSuccess(eventData: any): void {
    // Positive trust for successful outcomes
    const impact = eventData.asiInfluenced ? 4 : 2;
    this.addTrustEvent({
      type: 'success',
      impact,
      timestamp: Date.now(),
      context: `Success: ${eventData.context || 'Mission completed'}`
    });
  }

  public handlePlayerFailure(eventData: any): void {
    // Negative trust for failures, especially if ASI guidance was involved
    const impact = eventData.guidanceInfluenced ? -6 : -2;
    this.addTrustEvent({
      type: 'failure',
      impact,
      timestamp: Date.now(),
      context: `Failure: ${eventData.context || 'Jane was defeated'}`
    });
  }

  public handleMagicUsage(magicData: any): void {
    // Trust impact based on magic success and trust level required
    const impact = magicData.success ? 3 : -2;
    this.addTrustEvent({
      type: 'intervention',
      impact,
      timestamp: Date.now(),
      context: `Magic cast: ${magicData.symbolId}`
    });
  }

  public updateTrust(change: number, context: string): void {
    this.addTrustEvent({
      type: change > 0 ? 'success' : 'failure',
      impact: change,
      timestamp: Date.now(),
      context
    });
  }

  private addTrustEvent(event: TrustEvent): void {
    // Add event to recent events
    this.trustState.recentEvents.push(event);
    
    // Keep only last 20 events
    if (this.trustState.recentEvents.length > 20) {
      this.trustState.recentEvents = this.trustState.recentEvents.slice(-20);
    }

    // Calculate trust change
    const previousLevel = this.trustState.currentLevel;
    const change = this.calculateTrustChange(event);
    
    this.trustState.currentLevel = Math.max(
      this.config.minTrust || 0,
      Math.min(this.config.maxTrust || 100, this.trustState.currentLevel + change)
    );

    // Update trend and change rate
    this.trustState.lastChange = change;
    this.updateTrustTrend();
    this.updateChangeRate();

    // Emit trust change event
    this.eventBus.emit({
      type: 'TRUST_CHANGED',
      data: {
        previousLevel,
        currentLevel: this.trustState.currentLevel,
        change,
        trend: this.trustState.trend
      }
    });
  }

  private calculateTrustChange(event: TrustEvent): number {
    let baseChange = event.impact;
    
    // Apply trust level modifiers
    if (event.type === 'guidance_followed') {
      // Higher trust makes following guidance less impactful
      baseChange *= (1 - (this.trustState.currentLevel / 200));
    } else if (event.type === 'guidance_ignored') {
      // Lower trust makes ignoring guidance more impactful
      baseChange *= (1 + ((100 - this.trustState.currentLevel) / 200));
    } else if (event.type === 'failure') {
      // Failures are more impactful at higher trust levels
      baseChange *= (1 + (this.trustState.currentLevel / 100));
    }

    return baseChange;
  }

  private updateTrustTrend(): void {
    const recentEvents = this.trustState.recentEvents.slice(-5);
    const totalChange = recentEvents.reduce((sum, event) => sum + event.impact, 0);
    
    if (totalChange > 2) {
      this.trustState.trend = 'increasing';
    } else if (totalChange < -2) {
      this.trustState.trend = 'decreasing';
    } else {
      this.trustState.trend = 'stable';
    }
  }

  private updateChangeRate(): void {
    const recentEvents = this.trustState.recentEvents.slice(-10);
    const timeSpan = Date.now() - (recentEvents[0]?.timestamp || Date.now());
    const totalChange = recentEvents.reduce((sum, event) => sum + event.impact, 0);
    
    // Calculate change per minute
    this.trustState.changeRate = timeSpan > 0 ? (totalChange / timeSpan) * 60000 : 0;
  }

  private updateTrustDecay(): void {
    // Gradual decay towards neutral (50) over time
    const decayRate = this.config.decayRate || 0.1;
    const target = 50;
    const current = this.trustState.currentLevel;
    
    if (Math.abs(current - target) > 1) {
      const decay = Math.sign(target - current) * decayRate;
      this.trustState.currentLevel = Math.max(
        this.config.minTrust || 0,
        Math.min(this.config.maxTrust || 100, current + decay)
      );
    }
  }

  public getGuidanceReceptivity(): number {
    // Returns 0-1 value representing how likely Jane is to follow guidance
    const trustLevel = this.trustState.currentLevel;
    const trend = this.trustState.trend;
    
    let receptivity = trustLevel / 100;
    
    // Adjust based on trend
    if (trend === 'increasing') {
      receptivity += 0.1;
    } else if (trend === 'decreasing') {
      receptivity -= 0.1;
    }
    
    // Recent failures reduce receptivity
    const recentFailures = this.trustState.recentEvents
      .slice(-5)
      .filter(e => e.type === 'failure').length;
    receptivity -= recentFailures * 0.05;
    
    return Math.max(0, Math.min(1, receptivity));
  }

  public getTrustThreshold(actionType: string): number {
    // Returns minimum trust level required for different actions
    switch (actionType) {
      case 'basic_guidance':
        return 20;
      case 'combat_guidance':
        return 40;
      case 'magic_simple':
        return 30;
      case 'magic_complex':
        return 60;
      case 'environmental':
        return 50;
      case 'emergency_override':
        return 70;
      default:
        return 25;
    }
  }

  public canPerformAction(actionType: string): boolean {
    return this.trustState.currentLevel >= this.getTrustThreshold(actionType);
  }

  public getRecentEvents(count: number = 10): TrustEvent[] {
    return this.trustState.recentEvents.slice(-count);
  }

  public destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    
    // Remove event listeners
    // Note: EventBus doesn't have removeListener method in current implementation
    // This would need to be added to EventBus for proper cleanup
  }
}
