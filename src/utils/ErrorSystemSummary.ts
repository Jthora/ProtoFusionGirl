/**
 * ProtoFusionGirl - Comprehensive Error System Summary
 * 
 * This utility provides an overview of all error detection and logging
 * capabilities implemented in the game.
 */

import { errorLogger } from './ErrorLogger';
import { STARTUP_ERRORS } from './StartupErrors';
import { runtimeMonitor } from './RuntimeMonitor';

export class ErrorSystemSummary {
  private static instance: ErrorSystemSummary;

  private constructor() {}

  public static getInstance(): ErrorSystemSummary {
    if (!ErrorSystemSummary.instance) {
      ErrorSystemSummary.instance = new ErrorSystemSummary();
    }
    return ErrorSystemSummary.instance;
  }

  public displayCapabilities(): void {
    console.group('🛡️ ProtoFusionGirl - Comprehensive Error Detection System');
    
    this.displayErrorCategories();
    this.displayMonitoringCapabilities();
    this.displayTroubleshootingTools();
    this.displayQuickCommands();
    
    console.groupEnd();
  }

  private displayErrorCategories(): void {
    console.group('📋 Error Categories Detected');
    
    const categories = [
      {
        name: 'STARTUP ERRORS',
        count: '15+',
        description: 'Game initialization and bootstrap issues',
        examples: ['Phaser initialization failed', 'DOM container not found', 'WebGL context lost']
      },
      {
        name: 'SCENE ERRORS',
        count: '10+',
        description: 'Scene management and transition issues',
        examples: ['Scene not found', 'Scene transition failed', 'Grey screen detection']
      },
      {
        name: 'ASSET ERRORS',
        count: '8+',
        description: 'Resource loading and availability issues',
        examples: ['Texture load failed', 'Asset timeout', 'UL symbol load failed']
      },
      {
        name: 'AUDIO ERRORS',
        count: '5+',
        description: 'Audio system and playback issues',
        examples: ['Audio context blocked', 'Web Audio not supported', 'Audio decode error']
      },
      {
        name: 'PHYSICS ERRORS',
        count: '4+',
        description: 'Physics engine and collision issues',
        examples: ['Physics engine failed', 'Collision detection error']
      },
      {
        name: 'UI ERRORS',
        count: '5+',
        description: 'User interface and input issues',
        examples: ['UI component render failed', 'Input handler failed']
      },
      {
        name: 'NETWORK ERRORS',
        count: '6+',
        description: 'Connectivity and API issues',
        examples: ['Network connection lost', 'API request failed']
      },
      {
        name: 'STORAGE ERRORS',
        count: '4+',
        description: 'Save/load and persistence issues',
        examples: ['Save game failed', 'Load game failed', 'Storage quota exceeded']
      },
      {
        name: 'PERFORMANCE ERRORS',
        count: '5+',
        description: 'Performance and optimization issues',
        examples: ['Low framerate detected', 'Memory leak detected']
      },
      {
        name: 'SECURITY ERRORS',
        count: '3+',
        description: 'Security policy and access issues',
        examples: ['Content Security Policy violation', 'Cross-origin request blocked']
      },
      {
        name: 'MOD ERRORS',
        count: '4+',
        description: 'Modding system and registry issues',
        examples: ['Mod load failed', 'Mod registry unavailable']
      },
      {
        name: 'ANALYTICS ERRORS',
        count: '2+',
        description: 'Analytics and tracking issues',
        examples: ['Analytics initialization failed', 'Tracking blocked']
      }
    ];

    categories.forEach(category => {
      console.log(`🔸 ${category.name} (${category.count} errors)`);
      console.log(`   ${category.description}`);
      console.log(`   Examples: ${category.examples.join(', ')}`);
      console.log('');
    });

    console.log(`📊 Total Error Definitions: ${Object.keys(STARTUP_ERRORS).length}+`);
    console.groupEnd();
  }

  private displayMonitoringCapabilities(): void {
    console.group('🔍 Real-Time Monitoring Capabilities');
    
    const capabilities = [
      {
        system: 'Startup Diagnostics',
        features: [
          'Browser compatibility checks',
          'Device capability assessment',
          'Network status monitoring',
          'Storage availability verification',
          'WebGL support validation'
        ]
      },
      {
        system: 'Scene Validation',
        features: [
          'Scene configuration verification',
          'Grey screen cause analysis',
          'Scene transition validation',
          'Common issue detection'
        ]
      },
      {
        system: 'Runtime Monitoring',
        features: [
          'JavaScript error tracking',
          'Promise rejection handling',
          'Resource loading monitoring',
          'FPS performance tracking',
          'Memory usage monitoring'
        ]
      },
      {
        system: 'Error Logging',
        features: [
          'Hierarchical error categorization',
          'Severity-based filtering',
          'Context-aware error details',
          'Solution recommendations',
          'Error history tracking'
        ]
      }
    ];

    capabilities.forEach(capability => {
      console.log(`🔧 ${capability.system}:`);
      capability.features.forEach(feature => {
        console.log(`   ✓ ${feature}`);
      });
      console.log('');
    });

    console.groupEnd();
  }

  private displayTroubleshootingTools(): void {
    console.group('🛠️ Troubleshooting Tools Available');
    
    const tools = [
      {
        command: 'errorLogger.exportErrorReport()',
        description: 'Generate comprehensive error report with context',
        usage: 'Copy and paste output for bug reports'
      },
      {
        command: 'window.sceneValidator.createTroubleshootingReport()',
        description: 'Generate scene-specific diagnostic report',
        usage: 'Debug scene transition and grey screen issues'
      },
      {
        command: 'runtimeMonitor.generatePerformanceReport()',
        description: 'Generate performance and system capability report',
        usage: 'Analyze performance issues and system compatibility'
      },
      {
        command: 'errorLogger.getAllErrors()',
        description: 'Get all detected errors with full details',
        usage: 'Review all issues found during session'
      },
      {
        command: 'errorLogger.getCriticalErrors()',
        description: 'Get only critical errors that prevent game functioning',
        usage: 'Focus on game-breaking issues first'
      }
    ];

    tools.forEach(tool => {
      console.log(`🔹 ${tool.command}`);
      console.log(`   ${tool.description}`);
      console.log(`   Usage: ${tool.usage}`);
      console.log('');
    });

    console.groupEnd();
  }

  private displayQuickCommands(): void {
    console.group('⚡ Quick Debug Commands');
    
    console.log('💡 Copy and paste these commands in the browser console:');
    console.log('');
    console.log('// View all detected errors');
    console.log('console.table(errorLogger.getAllErrors().map(e => ({');
    console.log('  id: e.id,');
    console.log('  category: e.category,');
    console.log('  severity: e.severity,');
    console.log('  message: e.message');
    console.log('})));');
    console.log('');
    console.log('// Check current performance');
    console.log('console.log("FPS:", runtimeMonitor.getCurrentFPS().toFixed(1));');
    console.log('console.log("Errors:", runtimeMonitor.getErrorCount());');
    console.log('');
    console.log('// Export all diagnostic data');
    console.log('console.log("ERROR REPORT:", errorLogger.exportErrorReport());');
    console.log('console.log("SCENE REPORT:", window.sceneValidator.createTroubleshootingReport());');
    console.log('console.log("PERFORMANCE REPORT:", runtimeMonitor.generatePerformanceReport());');
    
    console.groupEnd();
  }

  public getCurrentStatus(): any {
    return {
      timestamp: new Date().toISOString(),
      errorSystem: {
        totalErrorsDetected: errorLogger.getAllErrors().length,
        criticalErrors: errorLogger.getCriticalErrors().length,
        errorCategories: errorLogger.getAllErrors().reduce((acc, error) => {
          acc[error.category] = (acc[error.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      monitoring: {
        runtimeMonitorActive: runtimeMonitor.isActive(),
        currentFPS: runtimeMonitor.getCurrentFPS(),
        averageFPS: runtimeMonitor.getAverageFPS(),
        totalErrors: runtimeMonitor.getErrorCount()
      },
      system: {
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        language: navigator.language,
        platform: navigator.platform
      }
    };
  }

  public showWelcomeMessage(): void {
    console.log('');
    console.log('🎮 Welcome to ProtoFusionGirl!');
    console.log('');
    console.log('🛡️ Comprehensive error detection is now active.');
    console.log('   This system monitors 60+ types of startup, runtime, and performance issues.');
    console.log('');
    console.log('🔍 If you experience any issues:');
    console.log('   1. Check the browser console for detailed error information');
    console.log('   2. Run: errorLogger.exportErrorReport() for a full diagnostic report');
    console.log('   3. For grey screen issues, run: sceneValidator.createTroubleshootingReport()');
    console.log('');
    console.log('📊 Current Status:');
    const status = this.getCurrentStatus();
    console.log(`   Errors Detected: ${status.errorSystem.totalErrorsDetected}`);
    console.log(`   Critical Issues: ${status.errorSystem.criticalErrors}`);
    console.log(`   Runtime Monitor: ${status.monitoring.runtimeMonitorActive ? 'Active' : 'Inactive'}`);
    console.log('');
    console.log('🚀 Ready to play! Have fun!');
    console.log('');
  }
}

// Create singleton and expose globally
export const errorSystemSummary = ErrorSystemSummary.getInstance();
(window as any).errorSystemSummary = errorSystemSummary;

// Display capabilities after a short delay to let other systems initialize
setTimeout(() => {
  errorSystemSummary.displayCapabilities();
  errorSystemSummary.showWelcomeMessage();
}, 2000);
