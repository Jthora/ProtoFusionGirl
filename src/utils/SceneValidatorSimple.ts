/**
 * ProtoFusionGirl - Simplified Scene Validation Utility
 * 
 * This utility helps detect and diagnose scene-related issues that can cause
 * grey screens and other scene transition problems.
 */

import { errorLogger, ErrorCategory, ErrorSeverity } from './ErrorLogger';

export class SceneValidator {
  private static instance: SceneValidator;
  
  private constructor() {}
  
  public static getInstance(): SceneValidator {
    if (!SceneValidator.instance) {
      SceneValidator.instance = new SceneValidator();
    }
    return SceneValidator.instance;
  }

  public validateGameConfiguration(): void {
    console.group('🔍 Scene Configuration Validation');
    
    // Check known scene configuration issues
    const issues = this.detectKnownIssues();
    
    if (issues.length > 0) {
      errorLogger.logError({
        id: 'SCENE_CONFIGURATION_ISSUES',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.CRITICAL,
        message: 'Critical Scene Configuration Issues Detected',
        details: issues.join('; '),
        solution: 'Fix scene configuration and naming mismatches in main.ts and scene files',
        timestamp: Date.now(),
        context: { issues }
      });
      
      // Log each issue separately for detailed tracking
      issues.forEach((issue, index) => {
        console.error(`🚨 Issue ${index + 1}: ${issue}`);
      });
    } else {
      console.log('✅ No known scene configuration issues detected');
    }
    
    console.groupEnd();
  }

  private detectKnownIssues(): string[] {
    const issues: string[] = [];
    
    // Only check for scene issues if we can actually validate them
    try {
      const sceneIssues = this.analyzeCurrentConfiguration();
      issues.push(...sceneIssues);
    } catch (error) {
      // Don't report configuration analysis failures as user-facing errors
      console.debug(`Configuration analysis failed: ${error}`);
    }
    
    return issues;
  }

  private analyzeCurrentConfiguration(): string[] {
    const issues: string[] = [];
    
    // Check if window.Phaser is available for inspection
    if (typeof window !== 'undefined' && (window as any).Phaser) {
      console.log('✅ Phaser is available for configuration analysis');
    } else {
      issues.push('Phaser not available in global scope for configuration analysis');
    }
    
    // Check DOM elements that might indicate scene state
    if (typeof document !== 'undefined') {
      const appElement = document.querySelector('#app');
      if (!appElement) {
        issues.push('App container element (#app) not found in DOM');
      } else {
        const canvas = appElement.querySelector('canvas');
        if (!canvas) {
          issues.push('Game canvas not found - game may not have initialized properly');
        } else {
          console.log('✅ Game canvas found in DOM');
        }
      }
    }
    
    return issues;
  }

  public checkCommonGreyScreenCauses(): void {
    console.group('🔍 Grey Screen Diagnostic Check');
    
    const commonCauses = [
      {
        issue: 'Scene Not Found',
        description: 'StartScene tries to start "GameScene" but it\'s not registered',
        solution: 'Add GameScene to scenes array in main.ts',
        severity: ErrorSeverity.CRITICAL
      },
      {
        issue: 'Missing Scene Content',
        description: 'Scene loads but has no visible content in create() method',
        solution: 'Add game objects and UI elements to scene create() method',
        severity: ErrorSeverity.HIGH
      },
      {
        issue: 'WebGL Context Issues',
        description: 'Browser cannot create WebGL context for rendering',
        solution: 'Check browser WebGL support and update graphics drivers',
        severity: ErrorSeverity.CRITICAL
      },
      {
        issue: 'Asset Loading Failure',
        description: 'Required assets fail to load causing empty scene',
        solution: 'Check network connection and asset file availability',
        severity: ErrorSeverity.HIGH
      },
      {
        issue: 'JavaScript Errors',
        description: 'Runtime errors prevent scene from rendering properly',
        solution: 'Check browser console for JavaScript errors and fix them',
        severity: ErrorSeverity.HIGH
      }
    ];
    
    commonCauses.forEach((cause, index) => {
      console.log(`${index + 1}. ${cause.issue}:`);
      console.log(`   Description: ${cause.description}`);
      console.log(`   Solution: ${cause.solution}`);
      console.log(`   Severity: ${cause.severity}`);
      console.log('');
    });
    
    // Log as structured error for tracking
    errorLogger.logError({
      id: 'GREY_SCREEN_COMMON_CAUSES',
      category: ErrorCategory.SCENE,
      severity: ErrorSeverity.INFO,
      message: 'Grey Screen Common Causes Checklist',
      details: `${commonCauses.length} common causes identified for grey screen issues`,
      solution: 'Review each cause systematically to identify the root issue',
      timestamp: Date.now(),
      context: { commonCauses }
    });
    
    console.groupEnd();
  }

  public logQuickFixes(): void {
    console.group('🔧 Quick Fixes for Common Issues');
    
    const quickFixes = [
      {
        problem: 'Grey screen on game start',
        fix: 'Ensure StartScene transitions to a scene that exists in main.ts',
        code: 'Update StartScene.ts line 51: this.scene.start("MinimalGameScene") instead of "GameScene"'
      },
      {
        problem: 'Scene exists but shows nothing',
        fix: 'Add content to scene create() method',
        code: 'this.add.text(400, 300, "Hello World", { fontSize: "32px" });'
      },
      {
        problem: 'WebGL context lost errors',
        fix: 'Add WebGL context restoration handling',
        code: 'canvas.addEventListener("webglcontextrestored", () => location.reload());'
      },
      {
        problem: 'Audio context blocked warning',
        fix: 'Enable audio after user interaction',
        code: 'this.sound.context.resume() in user input handler'
      }
    ];
    
    quickFixes.forEach((fix, index) => {
      console.log(`${index + 1}. ${fix.problem}:`);
      console.log(`   Fix: ${fix.fix}`);
      console.log(`   Code: ${fix.code}`);
      console.log('');
    });
    
    console.groupEnd();
  }

  public createTroubleshootingReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      dom: {
        readyState: document.readyState,
        hasAppElement: !!document.querySelector('#app'),
        hasCanvas: !!document.querySelector('canvas'),
        title: document.title
      },
      phaser: {
        available: typeof (window as any).Phaser !== 'undefined',
        version: typeof (window as any).Phaser !== 'undefined' ? (window as any).Phaser.VERSION : 'Not available'
      },
      knownIssues: this.detectKnownIssues(),
      recommendations: [
        'Check browser console for JavaScript errors',
        'Verify all scene names match between StartScene.ts and main.ts',
        'Ensure WebGL is supported and enabled',
        'Check network connection for asset loading',
        'Try refreshing the page',
        'Try in a different browser',
        'Disable browser extensions that might interfere'
      ]
    };
    
    return JSON.stringify(report, null, 2);
  }

  public runFullDiagnostics(): void {
    console.group('🚀 ProtoFusionGirl - Scene Diagnostics');
    
    this.validateGameConfiguration();
    this.checkCommonGreyScreenCauses();
    this.logQuickFixes();
    
    console.log('📋 For detailed report, run: sceneValidator.createTroubleshootingReport()');
    
    console.groupEnd();
  }
}

// Create singleton instance and run diagnostics
export const sceneValidator = SceneValidator.getInstance();

// Expose globally for debugging
(window as any).sceneValidator = sceneValidator;

// Auto-run diagnostics with proper timing
setTimeout(() => {
  // Check if game is actually ready before validating
  const gameCanvas = document.querySelector('canvas');
  const phaserGame = (window as any).game;
  
  if (gameCanvas && phaserGame) {
    console.log('✅ Game canvas found, running scene diagnostics...');
    sceneValidator.runFullDiagnostics();
  } else {
    console.log('⏳ Game not fully initialized yet, skipping premature validation');
    // Try again in a few seconds if needed
    setTimeout(() => {
      const retryCanvas = document.querySelector('canvas');
      const retryGame = (window as any).game;
      if (retryCanvas && retryGame) {
        console.log('✅ Game ready on retry, running scene diagnostics...');
        sceneValidator.runFullDiagnostics();
      } else {
        console.log('⚠️ Game still not ready after delay - manual diagnostics available');
      }
    }, 3000);
  }
}, 2000); // Run after game has had time to initialize
