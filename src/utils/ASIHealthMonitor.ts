/**
 * ProtoFusionGirl - ASI System Health Monitor
 * 
 * Advanced monitoring system for ASI Control Interface components including
 * Trust System, Command Center, Information Asymmetry, Universal Magic,
 * Ley Line System, and Multiverse State management.
 */

import { errorLogger, ErrorCategory } from './ErrorLogger';
import { createASIError, isASIError } from './ASIErrors';

export interface ASISystemMetrics {
  trustLevel: number;                    // 0-100
  commandCenterLoad: number;             // 0-100
  informationAsymmetryLevel: number;     // 0-100
  leyLineStability: number;              // 0-100
  multiverseCoherence: number;           // 0-100
  universalMagicResonance: number;       // 0-100
  systemHealthScore: number;             // 0-100
  lastUpdateTime: number;
}

export interface ASIPerformanceThresholds {
  trustLevel: { critical: 20, warning: 40, optimal: 70 };
  commandCenterLoad: { critical: 90, warning: 75, optimal: 50 };
  informationAsymmetryLevel: { critical: 80, warning: 60, optimal: 30 };
  leyLineStability: { critical: 30, warning: 50, optimal: 80 };
  multiverseCoherence: { critical: 25, warning: 45, optimal: 75 };
  universalMagicResonance: { critical: 20, warning: 40, optimal: 80 };
}

export class ASISystemHealthMonitor {
  private static instance: ASISystemHealthMonitor;
  private metrics: ASISystemMetrics;
  private thresholds: ASIPerformanceThresholds;
  private monitoring = false;
  private monitoringInterval: number | null = null;
  private healthHistory: ASISystemMetrics[] = [];
  private maxHistorySize = 100;

  private constructor() {
    this.metrics = this.initializeMetrics();
    this.thresholds = this.initializeThresholds();
    this.setupASIErrorMonitoring();
  }

  public static getInstance(): ASISystemHealthMonitor {
    if (!ASISystemHealthMonitor.instance) {
      ASISystemHealthMonitor.instance = new ASISystemHealthMonitor();
    }
    return ASISystemHealthMonitor.instance;
  }

  private initializeMetrics(): ASISystemMetrics {
    return {
      trustLevel: 100,                // Start with perfect trust
      commandCenterLoad: 10,          // Low initial load
      informationAsymmetryLevel: 0,   // Perfect information sync initially
      leyLineStability: 100,          // Stable ley lines
      multiverseCoherence: 100,       // Coherent multiverse state
      universalMagicResonance: 90,    // High magic resonance
      systemHealthScore: 100,         // Perfect initial health
      lastUpdateTime: Date.now()
    };
  }

  private initializeThresholds(): ASIPerformanceThresholds {
    return {
      trustLevel: { critical: 20, warning: 40, optimal: 70 },
      commandCenterLoad: { critical: 90, warning: 75, optimal: 50 },
      informationAsymmetryLevel: { critical: 80, warning: 60, optimal: 30 },
      leyLineStability: { critical: 30, warning: 50, optimal: 80 },
      multiverseCoherence: { critical: 25, warning: 45, optimal: 75 },
      universalMagicResonance: { critical: 20, warning: 40, optimal: 80 }
    };
  }

  public startMonitoring(intervalMs = 5000): void {
    if (this.monitoring) {
      console.warn('ASI monitoring already active');
      return;
    }

    console.log('🔍 Starting ASI System Health Monitoring...');
    this.monitoring = true;

    this.monitoringInterval = window.setInterval(() => {
      this.updateMetrics();
      this.analyzeSystemHealth();
      this.recordHealthHistory();
    }, intervalMs);

    // Initial metrics update
    this.updateMetrics();
    console.log('✅ ASI Health Monitoring active');
  }

  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.monitoring = false;
    console.log('🛑 ASI Health Monitoring stopped');
  }

  private setupASIErrorMonitoring(): void {
    // Listen for ASI-specific error events
    if (typeof window !== 'undefined') {
      window.addEventListener('ASI_ERROR_DETECTED', (event: any) => {
        this.handleASIError(event.detail?.error);
      });

      window.addEventListener('ASI_COMMUNICATION_RESET_REQUESTED', () => {
        this.handleCommunicationReset();
      });

      window.addEventListener('LEYLINE_STABILIZATION_REQUESTED', () => {
        this.handleLeyLineStabilization();
      });
    }
  }

  private updateMetrics(): void {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.metrics.lastUpdateTime;
    
    // Simulate natural metric fluctuations and decay over time
    this.updateTrustLevel(deltaTime);
    this.updateCommandCenterLoad(deltaTime);
    this.updateInformationAsymmetry(deltaTime);
    this.updateLeyLineStability(deltaTime);
    this.updateMultiverseCoherence(deltaTime);
    this.updateUniversalMagicResonance(deltaTime);
    
    // Calculate overall system health
    this.calculateSystemHealthScore();
    
    this.metrics.lastUpdateTime = currentTime;
  }

  private updateTrustLevel(deltaTime: number): void {
    // Trust slowly increases over time with good interactions
    const timeBasedGain = (deltaTime / 60000) * 0.5; // 0.5% per minute
    
    // Check for recent trust-affecting errors
    const recentTrustErrors = errorLogger.getErrorsByCategory(ErrorCategory.TRUST_SYSTEM)
      .filter(error => Date.now() - error.timestamp < 300000); // Last 5 minutes
    
    const trustPenalty = recentTrustErrors.length * 5;
    
    this.metrics.trustLevel = Math.max(0, Math.min(100, 
      this.metrics.trustLevel + timeBasedGain - trustPenalty
    ));
  }

  private updateCommandCenterLoad(deltaTime: number): void {
    // Command center load fluctuates based on activity
    const baseLoad = 10;
    const activityMultiplier = this.estimateGameActivity();
    
    // Load increases with game activity, decreases over time when idle
    const targetLoad = baseLoad + (activityMultiplier * 30);
    const loadAdjustment = (targetLoad - this.metrics.commandCenterLoad) * 0.1;
    
    this.metrics.commandCenterLoad = Math.max(0, Math.min(100,
      this.metrics.commandCenterLoad + loadAdjustment
    ));
  }

  private updateInformationAsymmetry(deltaTime: number): void {
    // Information asymmetry increases with rapid player actions
    const activityLevel = this.estimateGameActivity();
    const asymmetryIncrease = activityLevel * 2;
    
    // Natural decay towards synchronization
    const decay = (deltaTime / 30000) * 1; // 1% per 30 seconds
    
    this.metrics.informationAsymmetryLevel = Math.max(0, Math.min(100,
      this.metrics.informationAsymmetryLevel + asymmetryIncrease - decay
    ));
  }

  private updateLeyLineStability(deltaTime: number): void {
    // Ley line stability affected by magic usage and dimensional activity
    const magicUsage = this.estimateMagicUsage();
    const stabilityLoss = magicUsage * 0.5;
    
    // Natural restoration
    const restoration = (deltaTime / 45000) * 1; // 1% per 45 seconds
    
    this.metrics.leyLineStability = Math.max(0, Math.min(100,
      this.metrics.leyLineStability - stabilityLoss + restoration
    ));
  }

  private updateMultiverseCoherence(deltaTime: number): void {
    // Multiverse coherence affected by timeline manipulation and dimensional travel
    const dimensionalActivity = this.estimateDimensionalActivity();
    const coherenceLoss = dimensionalActivity * 1;
    
    // Slow natural stabilization
    const stabilization = (deltaTime / 60000) * 0.5; // 0.5% per minute
    
    this.metrics.multiverseCoherence = Math.max(0, Math.min(100,
      this.metrics.multiverseCoherence - coherenceLoss + stabilization
    ));
  }

  private updateUniversalMagicResonance(deltaTime: number): void {
    // Magic resonance affected by spell casting and ley line stability
    const resonanceInfluence = this.metrics.leyLineStability * 0.01;
    const targetResonance = 50 + (resonanceInfluence * 50);
    
    const resonanceAdjustment = (targetResonance - this.metrics.universalMagicResonance) * 0.05;
    
    this.metrics.universalMagicResonance = Math.max(0, Math.min(100,
      this.metrics.universalMagicResonance + resonanceAdjustment
    ));
  }

  private calculateSystemHealthScore(): void {
    const weights = {
      trustLevel: 0.25,
      commandCenterLoad: 0.15,        // Lower load is better, so invert
      informationAsymmetryLevel: 0.15, // Lower asymmetry is better, so invert
      leyLineStability: 0.20,
      multiverseCoherence: 0.15,
      universalMagicResonance: 0.10
    };

    const weightedScore = 
      (this.metrics.trustLevel * weights.trustLevel) +
      ((100 - this.metrics.commandCenterLoad) * weights.commandCenterLoad) +
      ((100 - this.metrics.informationAsymmetryLevel) * weights.informationAsymmetryLevel) +
      (this.metrics.leyLineStability * weights.leyLineStability) +
      (this.metrics.multiverseCoherence * weights.multiverseCoherence) +
      (this.metrics.universalMagicResonance * weights.universalMagicResonance);

    this.metrics.systemHealthScore = Math.round(weightedScore);
  }

  private analyzeSystemHealth(): void {
    const criticalIssues = this.identifyCriticalIssues();
    const warningIssues = this.identifyWarningIssues();

    if (criticalIssues.length > 0) {
      criticalIssues.forEach(issue => this.handleCriticalIssue(issue));
    }

    if (warningIssues.length > 0) {
      warningIssues.forEach(issue => this.handleWarningIssue(issue));
    }

    // Log health status periodically
    if (this.shouldLogHealthStatus()) {
      this.logHealthStatus();
    }
  }

  private identifyCriticalIssues(): string[] {
    const issues: string[] = [];

    if (this.metrics.trustLevel <= this.thresholds.trustLevel.critical) {
      issues.push('TRUST_LEVEL_CRITICAL');
    }
    if (this.metrics.commandCenterLoad >= this.thresholds.commandCenterLoad.critical) {
      issues.push('COMMAND_CENTER_OVERLOAD');
    }
    if (this.metrics.leyLineStability <= this.thresholds.leyLineStability.critical) {
      issues.push('LEYLINE_CRITICAL_INSTABILITY');
    }
    if (this.metrics.multiverseCoherence <= this.thresholds.multiverseCoherence.critical) {
      issues.push('MULTIVERSE_COHERENCE_CRITICAL');
    }

    return issues;
  }

  private identifyWarningIssues(): string[] {
    const issues: string[] = [];

    if (this.metrics.trustLevel <= this.thresholds.trustLevel.warning) {
      issues.push('TRUST_LEVEL_WARNING');
    }
    if (this.metrics.informationAsymmetryLevel >= this.thresholds.informationAsymmetryLevel.warning) {
      issues.push('INFORMATION_ASYMMETRY_WARNING');
    }
    if (this.metrics.universalMagicResonance <= this.thresholds.universalMagicResonance.warning) {
      issues.push('MAGIC_RESONANCE_LOW');
    }

    return issues;
  }

  private handleCriticalIssue(issue: string): void {
    switch (issue) {
      case 'TRUST_LEVEL_CRITICAL':
        errorLogger.logASIError(createASIError('TRUST_BREACH_DETECTED'), {
          trustLevel: this.metrics.trustLevel,
          multiverseCoherence: this.metrics.multiverseCoherence
        });
        break;
        
      case 'COMMAND_CENTER_OVERLOAD':
        errorLogger.logASIError(createASIError('COMMAND_CENTER_OFFLINE'), {
          trustLevel: this.metrics.trustLevel,
          multiverseCoherence: this.metrics.multiverseCoherence
        });
        break;
        
      case 'LEYLINE_CRITICAL_INSTABILITY':
        errorLogger.logASIError(createASIError('LEYLINE_RESONANCE_CASCADE'), {
          leyLineStability: this.metrics.leyLineStability
        });
        break;
        
      case 'MULTIVERSE_COHERENCE_CRITICAL':
        errorLogger.logASIError(createASIError('MULTIVERSE_COHERENCE_LOSS'), {
          multiverseCoherence: this.metrics.multiverseCoherence
        });
        break;
    }
  }

  private handleWarningIssue(issue: string): void {
    switch (issue) {
      case 'TRUST_LEVEL_WARNING':
        errorLogger.logASIError(createASIError('TRUST_ASYMMETRY_WARNING'), {
          trustLevel: this.metrics.trustLevel
        });
        break;
        
      case 'INFORMATION_ASYMMETRY_WARNING':
        errorLogger.logASIError(createASIError('INFORMATION_DESYNC'), {
          informationAsymmetryLevel: this.metrics.informationAsymmetryLevel
        });
        break;
        
      case 'MAGIC_RESONANCE_LOW':
        errorLogger.logASIError(createASIError('UNIVERSAL_MAGIC_INSTABILITY'), {
          trustLevel: this.metrics.trustLevel,
          multiverseCoherence: this.metrics.multiverseCoherence
        });
        break;
    }
  }

  private handleASIError(error: any): void {
    if (!isASIError(error)) return;

    // Adjust metrics based on error type
    switch (error.category) {
      case ErrorCategory.TRUST_SYSTEM:
        this.metrics.trustLevel = Math.max(0, this.metrics.trustLevel - 10);
        break;
      case ErrorCategory.COMMAND_CENTER:
        this.metrics.commandCenterLoad = Math.min(100, this.metrics.commandCenterLoad + 15);
        break;
      case ErrorCategory.LEYLINE_SYSTEM:
        this.metrics.leyLineStability = Math.max(0, this.metrics.leyLineStability - 15);
        break;
      case ErrorCategory.MULTIVERSE_STATE:
        this.metrics.multiverseCoherence = Math.max(0, this.metrics.multiverseCoherence - 20);
        break;
    }

    this.calculateSystemHealthScore();
  }

  private handleCommunicationReset(): void {
    console.log('🔄 ASI Communication Reset - Restoring connection...');
    // Simulate communication restoration
    setTimeout(() => {
      this.metrics.commandCenterLoad = Math.max(10, this.metrics.commandCenterLoad - 20);
      console.log('✅ ASI Communication restored');
    }, 2000);
  }

  private handleLeyLineStabilization(): void {
    console.log('⚡ Ley Line Stabilization - Restoring network stability...');
    // Simulate ley line stabilization
    setTimeout(() => {
      this.metrics.leyLineStability = Math.min(100, this.metrics.leyLineStability + 25);
      this.metrics.universalMagicResonance = Math.min(100, this.metrics.universalMagicResonance + 15);
      console.log('✅ Ley Line network stabilized');
    }, 3000);
  }

  private recordHealthHistory(): void {
    this.healthHistory.push({ ...this.metrics });
    
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory.shift();
    }
  }

  private shouldLogHealthStatus(): boolean {
    // Log health status every 30 seconds, or immediately if health is poor
    const timeSinceLastLog = Date.now() - (this.lastHealthLogTime || 0);
    return timeSinceLastLog > 30000 || this.metrics.systemHealthScore < 60;
  }

  private lastHealthLogTime = 0;

  private logHealthStatus(): void {
    const healthEmoji = this.getHealthEmoji();
    const statusColor = this.getHealthStatusColor();
    
    console.group(`${healthEmoji} ASI System Health: ${this.metrics.systemHealthScore}%`);
    console.log(`%c🤝 Trust Level: ${this.metrics.trustLevel}%`, statusColor);
    console.log(`%c⚙️ Command Center Load: ${this.metrics.commandCenterLoad}%`, statusColor);
    console.log(`%c📊 Information Asymmetry: ${this.metrics.informationAsymmetryLevel}%`, statusColor);
    console.log(`%c⚡ Ley Line Stability: ${this.metrics.leyLineStability}%`, statusColor);
    console.log(`%c🌌 Multiverse Coherence: ${this.metrics.multiverseCoherence}%`, statusColor);
    console.log(`%c✨ Magic Resonance: ${this.metrics.universalMagicResonance}%`, statusColor);
    console.groupEnd();
    
    this.lastHealthLogTime = Date.now();
  }

  private getHealthEmoji(): string {
    if (this.metrics.systemHealthScore >= 80) return '💚';
    if (this.metrics.systemHealthScore >= 60) return '💛';
    if (this.metrics.systemHealthScore >= 40) return '🧡';
    return '❤️';
  }

  private getHealthStatusColor(): string {
    if (this.metrics.systemHealthScore >= 80) return 'color: #4CAF50';
    if (this.metrics.systemHealthScore >= 60) return 'color: #FFC107';
    if (this.metrics.systemHealthScore >= 40) return 'color: #FF9800';
    return 'color: #F44336';
  }

  // Estimation methods for metric calculations
  private estimateGameActivity(): number {
    // Estimate activity based on recent errors and events
    const recentActivity = errorLogger.getAllErrors()
      .filter(error => Date.now() - error.timestamp < 60000) // Last minute
      .length;
    
    return Math.min(5, recentActivity) / 5; // Normalize to 0-1
  }

  private estimateMagicUsage(): number {
    // Estimate magic usage based on universal magic errors
    const magicErrors = errorLogger.getErrorsByCategory(ErrorCategory.UNIVERSAL_MAGIC)
      .filter(error => Date.now() - error.timestamp < 120000); // Last 2 minutes
    
    return Math.min(3, magicErrors.length) / 3; // Normalize to 0-1
  }

  private estimateDimensionalActivity(): number {
    // Estimate dimensional activity based on multiverse state changes
    const dimensionalErrors = errorLogger.getErrorsByCategory(ErrorCategory.MULTIVERSE_STATE)
      .filter(error => Date.now() - error.timestamp < 180000); // Last 3 minutes
    
    return Math.min(2, dimensionalErrors.length) / 2; // Normalize to 0-1
  }

  // Public API methods
  public getMetrics(): ASISystemMetrics {
    return { ...this.metrics };
  }

  public getHealthHistory(): ASISystemMetrics[] {
    return [...this.healthHistory];
  }

  public forceMetricsUpdate(): void {
    this.updateMetrics();
    this.analyzeSystemHealth();
  }

  public adjustTrustLevel(delta: number): void {
    this.metrics.trustLevel = Math.max(0, Math.min(100, this.metrics.trustLevel + delta));
    this.calculateSystemHealthScore();
  }

  public getTrustLevel(): number {
    return this.metrics.trustLevel;
  }

  public getSystemHealthScore(): number {
    return this.metrics.systemHealthScore;
  }
}

// Initialize the ASI health monitor
const asiHealthMonitor = ASISystemHealthMonitor.getInstance();
export { asiHealthMonitor };
