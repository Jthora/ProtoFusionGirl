// GuidanceEngine.ts
// Contextual guidance generation system for ASI Control Interface
// Analyzes Jane's situation and generates appropriate guidance suggestions

import { EventBus } from '../../core/EventBus';
import {
  GuidanceEngineConfig,
  GuidanceContext,
  GuidanceSuggestion,
  JaneState,
  Vector2,
} from '../types';
import { TrustManager } from './TrustManager';
import { ThreatDetector } from './ThreatDetector';

export class GuidanceEngine {
  private eventBus: EventBus;
  private trustManager: TrustManager;
  private threatDetector: ThreatDetector;
  private config: GuidanceEngineConfig;
  private activeSuggestions: GuidanceSuggestion[] = [];
  private contextUpdateTimer: NodeJS.Timeout | null = null;
  private suggestionIdCounter = 0;
  private subscriptions: Array<() => void> = [];

  constructor(config: GuidanceEngineConfig) {
    this.eventBus = config.eventBus;
    this.trustManager = config.trustManager;
    this.threatDetector = config.threatDetector;
    this.config = config;

    this.setupEventHandlers();
    this.startContextUpdateTimer();
  }

  private setupEventHandlers(): void {
    // Listen for game state changes that might require new guidance
    this.subscriptions.push(this.eventBus.on('JANE_MOVED', (event: any) => {
      this.handleJaneMovement(event.data);
    }));

  this.subscriptions.push(this.eventBus.on('COMBAT_STARTED', (event: any) => {
      this.handleCombatStart(event.data);
  }));

  this.subscriptions.push(this.eventBus.on('THREAT_DETECTED', (event: any) => {
      this.handleThreatDetected(event.data);
  }));

  this.subscriptions.push(this.eventBus.on('MISSION_STARTED', (event: any) => {
      this.handleMissionStart(event.data);
  }));

  this.subscriptions.push(this.eventBus.on('TRUST_CHANGED', (event: any) => {
      this.handleTrustChanged(event.data);
  }));

    // Listen for guidance selection
  this.subscriptions.push(this.eventBus.on('GUIDANCE_SELECTED', (event: any) => {
      this.handleGuidanceSelection(event.data);
  }));
  }

  private startContextUpdateTimer(): void {
    if (this.contextUpdateTimer) {
      clearInterval(this.contextUpdateTimer);
    }
    
    this.contextUpdateTimer = setInterval(() => {
      this.updateContext();
    }, this.config.contextUpdateInterval || 2000);
  }

  public getActiveSuggestions(): GuidanceSuggestion[] {
    return [...this.activeSuggestions];
  }

  public generateSuggestions(context: GuidanceContext): GuidanceSuggestion[] {
    const suggestions: GuidanceSuggestion[] = [];
    
    // Generate threat-based suggestions
    suggestions.push(...this.generateThreatSuggestions(context));
    
    // Generate movement suggestions
    suggestions.push(...this.generateMovementSuggestions(context));
    
    // Generate combat suggestions
    suggestions.push(...this.generateCombatSuggestions(context));
    
    // Generate magic suggestions
    suggestions.push(...this.generateMagicSuggestions(context));
    
    // Generate social suggestions
    suggestions.push(...this.generateSocialSuggestions(context));
    
    // Generate environmental suggestions
    suggestions.push(...this.generateEnvironmentalSuggestions(context));
    
    // Filter and prioritize suggestions
    const filteredSuggestions = this.filterSuggestions(suggestions, context);
    const prioritizedSuggestions = this.prioritizeSuggestions(filteredSuggestions, context);
    
    return prioritizedSuggestions.slice(0, this.config.maxSuggestions || 5);
  }

  public handleGuidanceSelection(suggestionId: string): void {
    const suggestion = this.activeSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    // Remove selected suggestion from active list
    this.activeSuggestions = this.activeSuggestions.filter(s => s.id !== suggestionId);

    // Emit guidance given event
    this.eventBus.emit({
      type: 'ASI_GUIDANCE_GIVEN',
      data: {
        suggestion,
        context: this.getCurrentContext()
      }
    });

    // Optionally simulate Jane's response (dev/testing only). In production, GameScene handles arrival/timeout.
    if (this.config.simulateResponses) {
      this.simulateJaneResponse(suggestion);
    }
  }

  public updateContext(): void {
    const context = this.getCurrentContext();
    const newSuggestions = this.generateSuggestions(context);
    
    // Update active suggestions
    this.activeSuggestions = newSuggestions;
  }

  private getCurrentContext(): GuidanceContext {
    const janeState = this.getJaneState();
    const nearbyThreats = this.threatDetector.getThreatsInRadius(janeState.position, 300);
    
    return {
      janeState,
      nearbyThreats,
      availableActions: this.getAvailableActions(janeState),
      environmentalFactors: this.getEnvironmentalFactors(janeState.position),
      socialContext: this.getSocialContext(janeState.position),
      missionContext: this.getMissionContext()
    };
  }

  private generateThreatSuggestions(context: GuidanceContext): GuidanceSuggestion[] {
    const suggestions: GuidanceSuggestion[] = [];
    
    context.nearbyThreats.forEach(threat => {
      if (!threat.janeAware) {
        // ASI can see threats Jane cannot - high priority suggestions
        suggestions.push({
          id: this.generateSuggestionId(),
          type: 'movement',
          title: `Avoid ${threat.type} threat`,
          description: `${threat.description} - move to safety`,
          urgency: threat.severity === 'critical' ? 'critical' : 'high',
          confidence: 85,
          expectedOutcome: 'Avoid potential danger',
          trustImpact: 3,
          position: this.calculateSafePosition(context.janeState.position, threat.position),
          targetId: threat.id
        });
      }
      
      if (threat.severity === 'critical' && threat.timeToImpact < 3000) {
        // Immediate danger - emergency suggestions
        suggestions.push({
          id: this.generateSuggestionId(),
          type: 'combat',
          title: 'Emergency evasion',
          description: 'Immediate danger detected - take evasive action',
          urgency: 'critical',
          confidence: 95,
          expectedOutcome: 'Avoid imminent danger',
          trustImpact: 5,
          position: this.calculateSafePosition(context.janeState.position, threat.position)
        });
      }
    });
    
    return suggestions;
  }

  private generateMovementSuggestions(context: GuidanceContext): GuidanceSuggestion[] {
    const suggestions: GuidanceSuggestion[] = [];
    
    // Suggest optimal paths
    const optimalPath = this.calculateOptimalPath(context);
    if (optimalPath) {
      suggestions.push({
        id: this.generateSuggestionId(),
        type: 'movement',
        title: 'Optimal path',
        description: 'Take the most efficient route',
        urgency: 'medium',
        confidence: 70,
        expectedOutcome: 'Reach destination efficiently',
        trustImpact: 1,
        position: optimalPath
      });
    }
    
    // Suggest exploration opportunities
    const explorationTarget = this.findExplorationTarget(context);
    if (explorationTarget) {
      suggestions.push({
        id: this.generateSuggestionId(),
        type: 'movement',
        title: 'Explore area',
        description: 'Interesting area detected for exploration',
        urgency: 'low',
        confidence: 60,
        expectedOutcome: 'Discover new resources or information',
        trustImpact: 2,
        position: explorationTarget
      });
    }
    
    return suggestions;
  }

  private generateCombatSuggestions(context: GuidanceContext): GuidanceSuggestion[] {
    const suggestions: GuidanceSuggestion[] = [];
    
    if (context.janeState.isInCombat) {
      // Combat positioning suggestions
      const tacticalPosition = this.calculateTacticalPosition(context);
      if (tacticalPosition) {
        suggestions.push({
          id: this.generateSuggestionId(),
          type: 'combat',
          title: 'Tactical positioning',
          description: 'Move to advantageous position',
          urgency: 'high',
          confidence: 80,
          expectedOutcome: 'Gain combat advantage',
          trustImpact: 3,
          position: tacticalPosition
        });
      }
      
      // Combat ability suggestions
      const recommendedAbility = this.getRecommendedCombatAbility(context);
      if (recommendedAbility) {
        suggestions.push({
          id: this.generateSuggestionId(),
          type: 'combat',
          title: `Use ${recommendedAbility.name}`,
          description: `${recommendedAbility.description}`,
          urgency: 'medium',
          confidence: 75,
          expectedOutcome: recommendedAbility.expectedOutcome,
          trustImpact: 2
        });
      }
    }
    
    return suggestions;
  }

  private generateMagicSuggestions(context: GuidanceContext): GuidanceSuggestion[] {
    const suggestions: GuidanceSuggestion[] = [];
    const trustLevel = this.trustManager.getTrustLevel();
    
    // Only suggest magic if trust is sufficient
    if (trustLevel >= 30) {
      // Environmental magic suggestions
      const environmentalMagic = this.getEnvironmentalMagicOptions(context);
      environmentalMagic.forEach(magic => {
        if (trustLevel >= magic.trustRequirement) {
          suggestions.push({
            id: this.generateSuggestionId(),
            type: 'magic',
            title: `Cast ${magic.name}`,
            description: magic.description,
            urgency: 'medium',
            confidence: 65,
            expectedOutcome: magic.expectedOutcome,
            trustImpact: 4,
            position: magic.targetPosition
          });
        }
      });
    }
    
    return suggestions;
  }

  private generateSocialSuggestions(context: GuidanceContext): GuidanceSuggestion[] {
    const suggestions: GuidanceSuggestion[] = [];
    
    // Analyze social opportunities
    context.socialContext.nearbyNPCs.forEach(npc => {
      if (npc.relationship > 0 && !npc.janeAware) {
        suggestions.push({
          id: this.generateSuggestionId(),
          type: 'social',
          title: `Interact with ${npc.name}`,
          description: `${npc.name} seems friendly and helpful`,
          urgency: 'low',
          confidence: 60,
          expectedOutcome: 'Gain information or assistance',
          trustImpact: 1,
          targetId: npc.id
        });
      }
      
      if (npc.relationship < -50 && npc.janeAware) {
        suggestions.push({
          id: this.generateSuggestionId(),
          type: 'social',
          title: `Avoid ${npc.name}`,
          description: `${npc.name} appears hostile`,
          urgency: 'medium',
          confidence: 80,
          expectedOutcome: 'Avoid confrontation',
          trustImpact: 2,
          targetId: npc.id
        });
      }
    });
    
    return suggestions;
  }

  private generateEnvironmentalSuggestions(context: GuidanceContext): GuidanceSuggestion[] {
    const suggestions: GuidanceSuggestion[] = [];
    
    // Analyze environmental opportunities
    context.environmentalFactors.forEach(factor => {
      if (factor.accessible && !factor.janeAware) {
        let suggestion: GuidanceSuggestion | null = null;
        
        switch (factor.type) {
          case 'leyline':
            suggestion = {
              id: this.generateSuggestionId(),
              type: 'environmental',
              title: 'Interact with leyline',
              description: 'Leyline energy detected - potential for power boost',
              urgency: 'low',
              confidence: 70,
              expectedOutcome: 'Gain energy or magical enhancement',
              trustImpact: 3,
              position: factor.position
            };
            break;
          case 'resource':
            suggestion = {
              id: this.generateSuggestionId(),
              type: 'environmental',
              title: 'Collect resources',
              description: 'Valuable resources detected in area',
              urgency: 'low',
              confidence: 65,
              expectedOutcome: 'Obtain useful materials',
              trustImpact: 1,
              position: factor.position
            };
            break;
          case 'passage':
            suggestion = {
              id: this.generateSuggestionId(),
              type: 'environmental',
              title: 'Use hidden passage',
              description: 'Secret passage detected - shortcut available',
              urgency: 'low',
              confidence: 85,
              expectedOutcome: 'Access new area or shortcut',
              trustImpact: 4,
              position: factor.position
            };
            break;
        }
        
        if (suggestion) {
          suggestions.push(suggestion);
        }
      }
    });
    
    return suggestions;
  }

  private filterSuggestions(suggestions: GuidanceSuggestion[], context: GuidanceContext): GuidanceSuggestion[] {
    const trustLevel = this.trustManager.getTrustLevel();
    
    return suggestions.filter(suggestion => {
      // Filter out suggestions that require higher trust
      const requiredTrust = this.getRequiredTrust(suggestion);
      if (trustLevel < requiredTrust) return false;
      
      // Filter out conflicting suggestions
      if (this.hasConflictingAction(suggestion, context)) return false;
      
      // Filter out suggestions Jane is unlikely to follow
      const receptivity = this.trustManager.getGuidanceReceptivity();
      if (suggestion.confidence * receptivity < 40) return false;
      
      return true;
    });
  }

  private prioritizeSuggestions(suggestions: GuidanceSuggestion[], context: GuidanceContext): GuidanceSuggestion[] {
    // Consider context factors for prioritization
    const threatCount = context.nearbyThreats.length;
    const urgencyMultiplier = threatCount > 0 ? 1.2 : 1.0;
    
    return suggestions.sort((a, b) => {
      // Sort by urgency first (apply context multiplier)
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aUrgency = (urgencyOrder[a.urgency] || 1) * urgencyMultiplier;
      const bUrgency = (urgencyOrder[b.urgency] || 1) * urgencyMultiplier;
      const urgencyDiff = bUrgency - aUrgency;
      if (urgencyDiff !== 0) return urgencyDiff;
      
      // Then by confidence
      const confidenceDiff = b.confidence - a.confidence;
      if (confidenceDiff !== 0) return confidenceDiff;
      
      // Finally by trust impact
      return b.trustImpact - a.trustImpact;
    });
  }

  private simulateJaneResponse(suggestion: GuidanceSuggestion): void {
    const receptivity = this.trustManager.getGuidanceReceptivity();
    const followProbability = (suggestion.confidence / 100) * receptivity;
    
    const responseDelay = Math.random() * 2000 + 500; // 0.5-2.5 seconds
    
    setTimeout(() => {
      const followed = Math.random() < followProbability;
      
      this.eventBus.emit({
        type: 'JANE_RESPONSE',
        data: {
          guidanceId: suggestion.id,
          followed,
          responseTime: responseDelay,
          trustChange: followed ? suggestion.trustImpact : -Math.abs(suggestion.trustImpact) * 0.5
        }
      });
    }, responseDelay);
  }

  // Event handlers
  private handleJaneMovement(movementData: any): void {
    // Update guidance context based on Jane's movement
    console.log(`Jane moved to position: ${movementData.x}, ${movementData.y}`);
    this.updateContext();
  }

  private handleCombatStart(combatData: any): void {
    // Generate immediate combat suggestions
    console.log('Combat started:', combatData);
    const context = this.getCurrentContext();
    const combatSuggestions = this.generateCombatSuggestions(context);
    this.activeSuggestions.push(...combatSuggestions);
  }

  private handleThreatDetected(threatData: any): void {
    // Generate immediate threat response suggestions
    console.log('Threat detected:', threatData);
    const context = this.getCurrentContext();
    const threatSuggestions = this.generateThreatSuggestions(context);
    this.activeSuggestions.push(...threatSuggestions);
  }

  private handleMissionStart(missionData: any): void {
    // Generate mission-specific suggestions
    const context = this.getCurrentContext();
    const missionSuggestions = this.generateMissionSuggestions(context, missionData);
    this.activeSuggestions.push(...missionSuggestions);
  }

  private handleTrustChanged(_trustData: any): void {
    // Update suggestions based on new trust level
    this.updateContext();
  }

  // Helper methods (placeholders for actual implementation)
  private getJaneState(): JaneState {
    // Get Jane's current state from PlayerManager
    return {
      position: { x: 0, y: 0 },
      health: 100,
      maxHealth: 100,
      psi: 50,
      maxPsi: 100,
      emotionalState: {
        confidence: 70,
        stress: 30,
        curiosity: 80,
        trust: this.trustManager.getTrustLevel(),
        fear: 20
      },
      isMoving: false,
      isInCombat: false,
      currentAction: null,
      trustLevel: this.trustManager.getTrustLevel(),
      asiControlled: true
    };
  }

  private getAvailableActions(janeState: JaneState): string[] {
    // Return available actions based on Jane's state
    const actions = ['move', 'wait', 'observe'];
    
    if (janeState.health < 50) actions.push('heal');
    if (janeState.isInCombat) actions.push('fight', 'flee');
    if (janeState.psi > 20) actions.push('cast_magic');
    
    return actions;
  }

  private getEnvironmentalFactors(position: Vector2): any[] {
    // Get environmental factors around the given position
    // This would integrate with the scene's environmental systems
    return [
      { type: 'leyline', position, strength: 0.5, accessible: true, janeAware: false },
      { type: 'platform', position: { x: position.x + 50, y: position.y }, strength: 1.0, accessible: true, janeAware: true }
    ];
  }

  private getSocialContext(_position: Vector2): any {
  // position currently unused in placeholder implementation
    // Get social context around the given position
    return {
      nearbyNPCs: [],
      relationships: [],
      reputation: []
    };
  }

  private getMissionContext(): any {
    return undefined;
  }

  private calculateSafePosition(janePos: Vector2, threatPos: Vector2): Vector2 {
    const direction = { x: janePos.x - threatPos.x, y: janePos.y - threatPos.y };
    const distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    const normalizedDirection = { x: direction.x / distance, y: direction.y / distance };
    
    return {
      x: janePos.x + normalizedDirection.x * 100,
      y: janePos.y + normalizedDirection.y * 100
    };
  }

  private calculateOptimalPath(_context: GuidanceContext): Vector2 | null {
    return null;
  }

  private findExplorationTarget(_context: GuidanceContext): Vector2 | null {
    return null;
  }

  private calculateTacticalPosition(_context: GuidanceContext): Vector2 | null {
    return null;
  }

  private getRecommendedCombatAbility(_context: GuidanceContext): any {
    return null;
  }

  private getEnvironmentalMagicOptions(_context: GuidanceContext): any[] {
    return [];
  }

  private generateMissionSuggestions(_context: GuidanceContext, _missionData: any): GuidanceSuggestion[] {
    return [];
  }

  private getRequiredTrust(suggestion: GuidanceSuggestion): number {
    switch (suggestion.type) {
      case 'movement': return 20;
      case 'combat': return 40;
      case 'magic': return 50;
      case 'social': return 30;
      case 'environmental': return 35;
      default: return 25;
    }
  }

  private hasConflictingAction(_suggestion: GuidanceSuggestion, _context: GuidanceContext): boolean {
    return false;
  }

  private generateSuggestionId(): string {
    return `suggestion_${++this.suggestionIdCounter}`;
  }

  public destroy(): void {
    if (this.contextUpdateTimer) {
      clearInterval(this.contextUpdateTimer);
      this.contextUpdateTimer = null;
    }
    
    this.activeSuggestions = [];
    // Unsubscribe event handlers
    this.subscriptions.forEach(unsub => {
      try { unsub(); } catch {}
    });
    this.subscriptions = [];
  }
}
