// ThreatDetector.ts
// Environmental threat detection system for ASI Control Interface
// Detects and tracks threats that ASI can see but Jane may not be aware of

import { EventBus } from '../../core/EventBus';
import { ThreatInfo, Vector2, ThreatDetectorConfig } from '../types';

export class ThreatDetector {
  private eventBus: EventBus;
  private scene: Phaser.Scene;
  private config: ThreatDetectorConfig;
  private activeThreats: Map<string, ThreatInfo> = new Map();
  private updateTimer: NodeJS.Timeout | null = null;
  private threatIdCounter = 0;
  private subscriptions: Array<() => void> = [];

  constructor(config: ThreatDetectorConfig) {
    this.eventBus = config.eventBus;
    this.scene = config.scene;
    this.config = config;

    this.setupEventHandlers();
    this.startUpdateTimer();
  }

  private setupEventHandlers(): void {
    // Listen for enemy movements and actions
    this.subscriptions.push(this.eventBus.on('ENEMY_ATTACKED', (event: any) => {
      this.handleEnemyAction(event.data);
    }));

  this.subscriptions.push(this.eventBus.on('CHARACTER_MOVED', (event: any) => {
      this.updateThreatProximity(event.data);
  }));

  this.subscriptions.push(this.eventBus.on('COMBAT_STARTED', (event: any) => {
      this.handleCombatStart(event.data);
  }));

    // Listen for environmental changes
  this.subscriptions.push(this.eventBus.on('LEYLINE_INSTABILITY', (event: any) => {
      this.handleLeylineInstability(event.data);
  }));

  this.subscriptions.push(this.eventBus.on('RIFT_FORMED', (event: any) => {
      this.handleRiftFormation(event.data);
  }));
  }

  private startUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    this.updateTimer = setInterval(() => {
      this.updateThreats();
    }, this.config.updateInterval || 1000);
  }

  public getActiveThreats(): ThreatInfo[] {
    return Array.from(this.activeThreats.values());
  }

  public getThreatsInRadius(position: Vector2, radius: number): ThreatInfo[] {
    return this.getActiveThreats().filter(threat => {
      const distance = Math.sqrt(
        Math.pow(threat.position.x - position.x, 2) + 
        Math.pow(threat.position.y - position.y, 2)
      );
      return distance <= radius;
    });
  }

  public updateThreat(threat: ThreatInfo): void {
    const existingThreat = this.activeThreats.get(threat.id);
    
    if (existingThreat) {
      // Update existing threat
      this.activeThreats.set(threat.id, { ...existingThreat, ...threat });
    } else {
      // Add new threat
      this.activeThreats.set(threat.id, threat);
      this.eventBus.emit({
        type: 'THREAT_DETECTED',
        data: { threat }
      });
    }
  }

  public removeThreat(threatId: string): void {
    if (this.activeThreats.has(threatId)) {
      this.activeThreats.delete(threatId);
      this.eventBus.emit({
        type: 'THREAT_RESOLVED',
        data: { threatId, resolution: 'handled' }
      });
    }
  }

  private updateThreats(): void {
    const currentTime = Date.now();
    const janePosition = this.getJanePosition();
    
    // Update environmental threats
    this.scanEnvironmentalThreats(janePosition);
    
    // Update enemy threats
    this.scanEnemyThreats(janePosition);
    
    // Update social threats
    this.scanSocialThreats(janePosition);
    
    // Update time-to-impact for existing threats
    this.updateThreatTimings(currentTime);
    
    // Remove expired threats
    this.removeExpiredThreats(currentTime);
  }

  private scanEnvironmentalThreats(janePosition: Vector2): void {
    // Scan for hazards, unstable terrain, etc.
    // This would integrate with the scene's physics and environmental systems
    
    // Example: Check for leyline instabilities
    if (this.scene.registry && this.scene.registry.get('leylines')) {
      const leylines = this.scene.registry.get('leylines');
      if (leylines && Array.isArray(leylines)) {
        leylines.forEach((leyline: any) => {
          if (leyline.unstable && this.calculateDistance(this.getJanePosition(), { x: leyline.x, y: leyline.y }) < 100) {
            this.registerEnvironmentalThreat(leyline.x, leyline.y, 'medium', 'Unstable leyline detected nearby');
          }
        });
      }
    }
    
    // Example: Check for environmental hazards
    this.scanForHazards(janePosition);
  }

  private scanEnemyThreats(janePosition: Vector2): void {
    // Scan for enemies within detection radius
    const enemies = this.getEnemiesInRadius(janePosition, this.config.detectionRadius);
    
    enemies.forEach(enemy => {
      const distance = this.calculateDistance(janePosition, enemy.position);
      const threatLevel = this.calculateEnemyThreatLevel(enemy, distance);
      
      if (threatLevel > 0) {
        const threatId = enemy.id ? `enemy_${enemy.id}` : this.generateThreatId();
        const threat: ThreatInfo = {
          id: threatId,
          type: 'enemy',
          position: enemy.position,
          severity: this.getSeverityFromLevel(threatLevel),
          timeToImpact: this.calculateTimeToImpact(distance, enemy.speed || 100),
          janeAware: this.isJaneAwareOfThreat(enemy, janePosition),
          description: `${enemy.type || 'Enemy'} approaching`,
          suggestedAction: this.getSuggestedActionForEnemy(enemy, distance)
        };
        
        this.updateThreat(threat);
      }
    });
  }

  private scanSocialThreats(janePosition: Vector2): void {
    // Scan for social threats (hostile NPCs, reputation issues, etc.)
    const npcs = this.getNPCsInRadius(janePosition, this.config.detectionRadius);
    
    npcs.forEach(npc => {
      if (npc.hostility && npc.hostility > 0.5) {
        const threatId = `social_${npc.id}`;
        const threat: ThreatInfo = {
          id: threatId,
          type: 'social',
          position: npc.position,
          severity: npc.hostility > 0.8 ? 'high' : 'medium',
          timeToImpact: -1, // Social threats don't have specific timing
          janeAware: npc.obvious || false,
          description: `Hostile NPC: ${npc.name}`,
          suggestedAction: 'Avoid or prepare for confrontation'
        };
        
        this.updateThreat(threat);
      }
    });
  }

  private scanForHazards(janePosition: Vector2): void {
    // Scan for environmental hazards
    // This would integrate with the scene's tilemap and physics systems
    
    // Example hazards to detect:
    // - Unstable platforms
    // - Energy barriers
    // - Toxic areas
    // - Gravity anomalies
    
    // Placeholder implementation
    const hazards = this.getEnvironmentalHazards(janePosition);
    
    hazards.forEach(hazard => {
      const threatId = `hazard_${hazard.id}`;
      const threat: ThreatInfo = {
        id: threatId,
        type: 'environmental',
        position: hazard.position,
        severity: hazard.severity,
        timeToImpact: hazard.timeToActivate || -1,
        janeAware: hazard.visible || false,
        description: hazard.description,
        suggestedAction: hazard.avoidanceAction || 'Avoid area'
      };
      
      this.updateThreat(threat);
    });
  }

  private handleEnemyAction(actionData: any): void {
    // React to enemy actions by updating threat levels
    const threatId = `enemy_${actionData.enemyId}`;
    const existingThreat = this.activeThreats.get(threatId);
    
    if (existingThreat) {
      existingThreat.severity = 'high';
      existingThreat.timeToImpact = 2000; // 2 seconds
      this.updateThreat(existingThreat);
    }
  }

  private handleCombatStart(combatData: any): void {
    // Mark combat participants as high-priority threats
    combatData.enemies?.forEach((enemy: any) => {
      const threatId = `combat_${enemy.id}`;
      const threat: ThreatInfo = {
        id: threatId,
        type: 'enemy',
        position: enemy.position,
        severity: 'critical',
        timeToImpact: 0,
        janeAware: true,
        description: `Combat: ${enemy.name}`,
        suggestedAction: 'Engage or retreat'
      };
      
      this.updateThreat(threat);
    });
  }

  private handleLeylineInstability(instabilityData: any): void {
    const threatId = `leyline_${instabilityData.leyLineId}`;
    const threat: ThreatInfo = {
      id: threatId,
      type: 'environmental',
      position: instabilityData.position,
      severity: instabilityData.severity === 'major' ? 'critical' : 'medium',
      timeToImpact: instabilityData.timeToCollapse || -1,
      janeAware: false, // ASI can detect leyline instability before Jane
      description: 'Leyline instability detected',
      suggestedAction: 'Avoid area or stabilize leyline'
    };
    
    this.updateThreat(threat);
  }

  private handleRiftFormation(riftData: any): void {
    const threatId = `rift_${riftData.leyLineId}`;
    const threat: ThreatInfo = {
      id: threatId,
      type: 'temporal',
      position: riftData.position,
      severity: 'critical',
      timeToImpact: 0,
      janeAware: true, // Rifts are usually visible
      description: 'Dimensional rift formed',
      suggestedAction: 'Investigate or seal rift'
    };
    
    this.updateThreat(threat);
  }

  private updateThreatProximity(movementData: any): void {
    // Update threat priorities based on Jane's movement
    const janePosition = { x: movementData.x, y: movementData.y };
    
    this.activeThreats.forEach((threat, threatId) => {
      const distance = Math.sqrt(
        Math.pow(threat.position.x - janePosition.x, 2) + 
        Math.pow(threat.position.y - janePosition.y, 2)
      );
      
      // Update threat urgency based on proximity
      const defaultSpeed = this.getThreatTypeSpeed(threat.type);
      threat.timeToImpact = this.calculateTimeToImpact(distance, defaultSpeed);
      
      // Update threat in the active threats map
      this.activeThreats.set(threatId, threat);
      
      // Emit threat update if time to impact changed significantly
      if (threat.timeToImpact < 3000 && !threat.janeAware) {
        this.eventBus.emit({
          type: 'THREAT_DETECTED',
          data: { threat }
        });
      }
    });
  }

  private updateThreatTimings(_currentTime: number): void {
    this.activeThreats.forEach((threat, _id) => {
      if (threat.timeToImpact > 0) {
        threat.timeToImpact -= 1000; // Reduce by update interval
        if (threat.timeToImpact <= 0) {
          // Threat is now imminent
          threat.severity = 'critical';
          this.updateThreat(threat);
        }
      }
    });
  }

  private removeExpiredThreats(_currentTime: number): void {
    const expiredThreats: string[] = [];
    
    this.activeThreats.forEach((threat, id) => {
      // Remove threats that are too far away or resolved
      const janePosition = this.getJanePosition();
      const distance = this.calculateDistance(janePosition, threat.position);
      
      if (distance > this.config.detectionRadius * 2) {
        expiredThreats.push(id);
      }
    });
    
    expiredThreats.forEach(id => this.removeThreat(id));
  }

  // Helper methods
  private getJanePosition(): Vector2 {
    // Get Jane's current position from PlayerManager or scene
    // This is a placeholder - would need actual integration
    if (this.scene.registry && this.scene.registry.get('janePosition')) {
      return this.scene.registry.get('janePosition');
    }
    return { x: 0, y: 0 };
  }

  private getEnemiesInRadius(position: Vector2, radius: number): any[] {
    // Get enemies from scene within radius
    const enemies = this.scene.registry.get('enemies') || [];
    return enemies.filter((enemy: any) => {
      const distance = Math.sqrt(
        Math.pow(enemy.x - position.x, 2) + Math.pow(enemy.y - position.y, 2)
      );
      return distance <= radius;
    });
  }

  private getNPCsInRadius(position: Vector2, radius: number): any[] {
    // Get NPCs from scene within radius
    const npcs = this.scene.registry.get('npcs') || [];
    return npcs.filter((npc: any) => {
      const distance = Math.sqrt(
        Math.pow(npc.x - position.x, 2) + Math.pow(npc.y - position.y, 2)
      );
      return distance <= radius;
    });
  }

  private getEnvironmentalHazards(position: Vector2): any[] {
    // Get environmental hazards from scene
    const hazards = this.scene.registry.get('hazards') || [];
    return hazards.filter((hazard: any) => {
      // Check if hazard affects the given position
      const distance = Math.sqrt(
        Math.pow(hazard.x - position.x, 2) + Math.pow(hazard.y - position.y, 2)
      );
      return distance <= (hazard.radius || 100);
    });
  }

  private calculateDistance(pos1: Vector2, pos2: Vector2): number {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }

  private calculateEnemyThreatLevel(enemy: any, distance: number): number {
    // Calculate threat level based on enemy stats and distance
    let threatLevel = enemy.power || 1;
    
    // Reduce threat based on distance
    if (distance > 200) threatLevel *= 0.5;
    if (distance > 400) threatLevel *= 0.3;
    
    return threatLevel;
  }

  private calculateTimeToImpact(distance: number, speed: number): number {
    // Calculate time in milliseconds for threat to reach Jane
    return distance > 0 ? (distance / speed) * 1000 : 0;
  }
  
  private getThreatTypeSpeed(threatType: string): number {
    // Return default speeds for different threat types
    switch (threatType) {
      case 'enemy': return 100;
      case 'environmental': return 50;
      case 'social': return 80;
      case 'temporal': return 200;
      default: return 100;
    }
  }

  private getSeverityFromLevel(threatLevel: number): 'low' | 'medium' | 'high' | 'critical' {
    if (threatLevel < 0.3) return 'low';
    if (threatLevel < 0.6) return 'medium';
    if (threatLevel < 0.9) return 'high';
    return 'critical';
  }

  private isJaneAwareOfThreat(threat: any, janePosition: Vector2): boolean {
    // Determine if Jane can see/detect the threat
    // This would involve line-of-sight checks and Jane's awareness stats
    const distance = this.calculateDistance(janePosition, threat.position);
    
    // Simple proximity-based awareness
    return distance < 150; // Jane is aware of threats within 150 units
  }

  private getSuggestedActionForEnemy(enemy: any, distance: number): string {
    // Generate contextual suggestions based on enemy type and distance
    const enemyType = enemy.type || 'unknown';
    const threat = enemy.threatLevel || 'medium';
    
    if (distance < 100) return `Immediate evasion from ${enemyType} (${threat} threat)`;
    if (distance < 200) return `Prepare for ${enemyType} encounter or retreat`;
    return `Monitor ${enemyType} and maintain distance`;
  }

  private generateThreatId(): string {
    return `threat_${++this.threatIdCounter}`;
  }
  
  private registerEnvironmentalThreat(x: number, y: number, severity: 'low' | 'medium' | 'high' | 'critical', description: string): void {
    const threatId = this.generateThreatId();
    const threat: ThreatInfo = {
      id: threatId,
      type: 'environmental',
      position: { x, y },
      severity,
      timeToImpact: 5000, // Environmental threats are usually persistent
      janeAware: false,
      description,
      suggestedAction: 'Avoid or neutralize environmental hazard'
    };
    
    this.updateThreat(threat);
  }

  public destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    
    this.activeThreats.clear();
    // Unsubscribe event handlers
    this.subscriptions.forEach(unsub => {
      try { unsub(); } catch {}
    });
    this.subscriptions = [];
  }
}
