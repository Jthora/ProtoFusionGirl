/**
 * ProtoFusionGirl - ASI Integration Demo
 * 
 * This file demonstrates the enhanced ASI error handling system
 * and provides examples of how to integrate ASI-specific error
 * monitoring into game systems.
 */

import { errorLogger } from './ErrorLogger';
import { createASIError } from './ASIErrors';
import { asiHealthMonitor } from './ASIHealthMonitor';

export class ASIIntegrationDemo {
  private demoInterval: number | null = null;
  private isRunning = false;

  /**
   * Start the ASI integration demo
   */
  public startDemo(): void {
    if (this.isRunning) {
      console.warn('ASI Demo already running');
      return;
    }

    console.group('🤖 ASI Control Interface Integration Demo');
    console.log('This demo shows the enhanced error handling system for ASI components');
    console.log('Monitor the console for ASI system health updates and error responses');
    console.groupEnd();

    this.isRunning = true;
    this.runDemoSequence();
  }

  /**
   * Stop the demo
   */
  public stopDemo(): void {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 ASI Integration Demo stopped');
  }

  private async runDemoSequence(): Promise<void> {
    await this.delay(2000);
    this.demonstrateTrustSystemError();

    await this.delay(3000);
    this.demonstrateCommandCenterLoad();

    await this.delay(4000);
    this.demonstrateLeyLineInstability();

    await this.delay(5000);
    this.demonstrateUniversalMagicError();

    await this.delay(6000);
    this.demonstrateInformationAsymmetry();

    await this.delay(7000);
    this.demonstrateAutoRecovery();

    await this.delay(8000);
    this.demonstrateHealthScoring();

    await this.delay(3000);
    console.log('✅ ASI Integration Demo completed successfully!');
    this.isRunning = false;
  }

  private demonstrateTrustSystemError(): void {
    console.group('🤝 Demonstrating Trust System Error Handling');
    
    // Log a trust-related error
    errorLogger.logASIError(
      createASIError('TRUST_ASYMMETRY_WARNING'),
      {
        trustLevel: 35,
        commandCenterState: 'NORMAL',
        informationAsymmetryLevel: 45,
        multiverseCoherence: 85,
        playerFrustrationLevel: undefined // Will be calculated
      }
    );

    console.log('Trust level adjusted based on error conditions');
    asiHealthMonitor.adjustTrustLevel(-15);
    
    console.groupEnd();
  }

  private demonstrateCommandCenterLoad(): void {
    console.group('⚙️ Demonstrating Command Center Load Management');
    
    // Simulate high command center load
    errorLogger.logASIError(
      createASIError('COMMAND_QUEUE_OVERFLOW'),
      {
        trustLevel: asiHealthMonitor.getTrustLevel(),
        commandCenterState: 'OVERLOADED',
        multiverseCoherence: 80
      }
    );

    console.log('Command center load management activated');
    console.groupEnd();
  }

  private demonstrateLeyLineInstability(): void {
    console.group('⚡ Demonstrating Ley Line System Error Handling');
    
    // Simulate ley line network disruption
    errorLogger.logASIError(
      createASIError('LEYLINE_NETWORK_DISRUPTION'),
      {
        trustLevel: asiHealthMonitor.getTrustLevel(),
        leyLineStability: 25,
        activeSpells: ['Protection Ward', 'Energy Amplification'],
        multiverseCoherence: 70
      }
    );

    console.log('Ley line stabilization protocols initiated');
    console.groupEnd();
  }

  private demonstrateUniversalMagicError(): void {
    console.group('✨ Demonstrating Universal Magic System Error Handling');
    
    // Simulate magic system instability
    errorLogger.logASIError(
      createASIError('UNIVERSAL_MAGIC_INSTABILITY'),
      {
        trustLevel: asiHealthMonitor.getTrustLevel(),
        leyLineStability: 40,
        activeSpells: ['Complex Transmutation', 'Dimensional Portal'],
        multiverseCoherence: 65
      }
    );

    console.log('Universal Magic safe mode activated');
    console.groupEnd();
  }

  private demonstrateInformationAsymmetry(): void {
    console.group('📊 Demonstrating Information Asymmetry Error Handling');
    
    // Simulate information desynchronization
    errorLogger.logASIError(
      createASIError('INFORMATION_DESYNC'),
      {
        trustLevel: asiHealthMonitor.getTrustLevel(),
        informationAsymmetryLevel: 75,
        commandCenterState: 'SYNCING',
        multiverseCoherence: 60
      }
    );

    console.log('Information synchronization protocols engaged');
    console.groupEnd();
  }

  private async demonstrateAutoRecovery(): Promise<void> {
    console.group('🔄 Demonstrating Automatic Error Recovery');
    
    // Create a recoverable error
    const communicationError = createASIError('ASI_BANDWIDTH_EXCEEDED');
    errorLogger.logASIError(communicationError, {
      trustLevel: asiHealthMonitor.getTrustLevel(),
      commandCenterState: 'THROTTLED',
      multiverseCoherence: 75
    });

    console.log('Attempting automatic recovery...');
    
    // Simulate recovery attempt
    await this.delay(2000);
    const recoverySuccess = await errorLogger.attemptAutoRecovery(communicationError.id);
    
    if (recoverySuccess) {
      console.log('✅ Automatic recovery successful');
    } else {
      console.log('❌ Manual intervention required');
    }
    
    console.groupEnd();
  }

  private demonstrateHealthScoring(): void {
    console.group('💚 Demonstrating ASI System Health Scoring');
    
    const healthScore = asiHealthMonitor.getSystemHealthScore();
    const metrics = asiHealthMonitor.getMetrics();
    
    console.log(`Overall System Health: ${healthScore}%`);
    console.log('Detailed Metrics:', {
      trust: `${metrics.trustLevel}%`,
      commandLoad: `${metrics.commandCenterLoad}%`,
      infoAsymmetry: `${metrics.informationAsymmetryLevel}%`,
      leyLines: `${metrics.leyLineStability}%`,
      multiverse: `${metrics.multiverseCoherence}%`,
      magic: `${metrics.universalMagicResonance}%`
    });

    // Demonstrate emotional error response
    const frustrationLevel = errorLogger.assessPlayerFrustration();
    console.log(`Player Frustration Level: ${frustrationLevel}`);

    if (frustrationLevel !== 'CALM') {
      console.log('🆘 Generating emotional support response...');
      const sampleError = createASIError('TRUST_ASYMMETRY_WARNING');
      const emotionalResponse = errorLogger.generateEmotionalResponse(sampleError);
      console.log('Supportive Message:', emotionalResponse);
    }

    console.groupEnd();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Quick health check for ASI systems
   */
  public quickHealthCheck(): void {
    console.group('🏥 ASI Quick Health Check');
    
    const healthScore = asiHealthMonitor.getSystemHealthScore();
    const metrics = asiHealthMonitor.getMetrics();
    const frustration = errorLogger.assessPlayerFrustration();
    
    console.log(`System Health: ${healthScore}% ${this.getHealthEmoji(healthScore)}`);
    console.log(`Trust Level: ${metrics.trustLevel}%`);
    console.log(`Player Frustration: ${frustration}`);
    
    if (healthScore < 70) {
      console.warn('⚠️ System health below optimal - consider maintenance');
    }
    
    console.groupEnd();
  }

  private getHealthEmoji(score: number): string {
    if (score >= 80) return '💚';
    if (score >= 60) return '💛';
    if (score >= 40) return '🧡';
    return '❤️';
  }

  /**
   * Export comprehensive ASI status report
   */
  public exportASIStatusReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      systemHealth: asiHealthMonitor.getSystemHealthScore(),
      metrics: asiHealthMonitor.getMetrics(),
      errorSummary: {
        total: errorLogger.getAllErrors().length,
        critical: errorLogger.getCriticalErrors().length,
        asiSpecific: errorLogger.getASISystemErrors().length,
        byCategory: Object.values(['ASI_COMMUNICATION', 'TRUST_SYSTEM', 'COMMAND_CENTER', 'INFORMATION_ASYMMETRY', 'UNIVERSAL_MAGIC', 'LEYLINE_SYSTEM', 'MULTIVERSE_STATE']).reduce((acc, category) => {
          acc[category] = errorLogger.getErrorsByCategory(category as any).length;
          return acc;
        }, {} as Record<string, number>)
      },
      playerState: {
        frustrationLevel: errorLogger.assessPlayerFrustration()
      },
      recommendations: this.generateRecommendations()
    };

    return JSON.stringify(report, null, 2);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = asiHealthMonitor.getMetrics();
    
    if (metrics.trustLevel < 50) {
      recommendations.push('Focus on collaborative activities to rebuild trust with ASI');
    }
    
    if (metrics.commandCenterLoad > 80) {
      recommendations.push('Reduce concurrent ASI operations to prevent overload');
    }
    
    if (metrics.leyLineStability < 60) {
      recommendations.push('Avoid complex magical operations until ley line stability improves');
    }
    
    if (metrics.multiverseCoherence < 50) {
      recommendations.push('Minimize dimensional travel to allow multiverse stabilization');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All systems operating within normal parameters');
    }
    
    return recommendations;
  }
}

// Create and expose ASI demo instance
const asiDemo = new ASIIntegrationDemo();

// Expose globally for console access
(window as any).asiDemo = asiDemo;

// Auto-start demo in development mode
if (process.env.NODE_ENV === 'development') {
  // Wait for game initialization, then start demo
  setTimeout(() => {
    console.log('🤖 Starting ASI Integration Demo (Development Mode)');
    asiDemo.startDemo();
  }, 5000);
}

export { asiDemo };
