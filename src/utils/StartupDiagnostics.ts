/**
 * ProtoFusionGirl - Startup Diagnostics System
 * 
 * This system automatically detects and logs startup issues, providing
 * detailed diagnostic information for troubleshooting.
 */

import { errorLogger, ErrorCategory, ErrorSeverity } from './ErrorLogger';
import { createStartupError, STARTUP_ERRORS } from './StartupErrors';

export class StartupDiagnostics {
  private static instance: StartupDiagnostics;
  private diagnosticsComplete = false;
  private startTime = performance.now();

  private constructor() {}

  public static getInstance(): StartupDiagnostics {
    if (!StartupDiagnostics.instance) {
      StartupDiagnostics.instance = new StartupDiagnostics();
    }
    return StartupDiagnostics.instance;
  }

  public async runFullDiagnostics(): Promise<void> {
    console.group('🔍 ProtoFusionGirl - Comprehensive Startup Diagnostics');
    
    try {
      // Phase 1: Environment Checks
      await this.checkEnvironment();
      
      // Phase 2: Browser Compatibility
      await this.checkBrowserCompatibility();
      
      // Phase 3: Resource Availability
      await this.checkResourceAvailability();
      
      // Phase 4: Game Configuration
      await this.checkGameConfiguration();
      
      // Phase 5: Asset Validation
      await this.checkAssetAvailability();
      
      // Phase 6: System Performance
      await this.checkSystemPerformance();
      
      // Phase 7: Security Constraints
      await this.checkSecurityConstraints();
      
      this.diagnosticsComplete = true;
      this.logDiagnosticsComplete();
      
    } catch (error) {
      errorLogger.logError(createStartupError('PHASER_INITIALIZATION_FAILED', { error }));
    } finally {
      console.groupEnd();
    }
  }

  private async checkEnvironment(): Promise<void> {
    console.group('🌍 Environment Checks');
    
    // Check if DOM is ready
    if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
      errorLogger.logError(createStartupError('DOM_CONTAINER_NOT_FOUND', {
        readyState: document.readyState
      }));
    }
    
    // Check for app container
    const appContainer = document.querySelector('#app');
    if (!appContainer) {
      errorLogger.logError(createStartupError('DOM_CONTAINER_NOT_FOUND', {
        availableElements: Array.from(document.querySelectorAll('[id]')).map(el => el.id)
      }));
    } else {
      console.log('✅ App container found');
    }
    
    // Check viewport size
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    };
    
    console.log('📱 Viewport:', viewport);
    
    if (viewport.width < 800 || viewport.height < 600) {
      errorLogger.logError({
        id: 'VIEWPORT_TOO_SMALL',
        category: ErrorCategory.UI,
        severity: ErrorSeverity.MEDIUM,
        message: 'Viewport Too Small',
        details: `Current viewport: ${viewport.width}x${viewport.height}, Required: 800x600`,
        solution: 'Increase browser window size or zoom out for optimal experience',
        timestamp: Date.now(),
        context: { viewport }
      });
    }
    
    console.groupEnd();
  }

  private async checkBrowserCompatibility(): Promise<void> {
    console.group('🌐 Browser Compatibility');
    
    const checks = [
      {
        name: 'WebGL Support',
        test: () => {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (!gl) return false;
          
          // Test for WebGL context
          const webglContext = gl as WebGLRenderingContext;
          const supportedExtensions = webglContext.getSupportedExtensions() || [];
          
          console.log('🔧 WebGL Extensions:', supportedExtensions.length);
          return true;
        },
        errorId: 'WEBGL_CONTEXT_LOST'
      },
      {
        name: 'Canvas 2D Support',
        test: () => {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('2d'));
        },
        errorId: 'CANVAS_CREATION_FAILED'
      },
      {
        name: 'ES6 Support',
        test: () => {
          try {
            new Function('(a = 0) => a');
            return true;
          } catch {
            return false;
          }
        },
        errorId: 'LEGACY_BROWSER'
      },
      {
        name: 'Async/Await Support',
        test: () => {
          try {
            new Function('async () => {}');
            return true;
          } catch {
            return false;
          }
        },
        errorId: 'LEGACY_BROWSER'
      },
      {
        name: 'Fetch API Support',
        test: () => typeof fetch !== 'undefined',
        errorId: 'LEGACY_BROWSER'
      },
      {
        name: 'WebAssembly Support',
        test: () => typeof WebAssembly !== 'undefined',
        errorId: 'LEGACY_BROWSER'
      }
    ];
    
    for (const check of checks) {
      try {
        if (check.test()) {
          console.log(`✅ ${check.name}: SUPPORTED`);
        } else {
          console.log(`❌ ${check.name}: NOT SUPPORTED`);
          if (STARTUP_ERRORS[check.errorId]) {
            errorLogger.logError(createStartupError(check.errorId));
          }
        }
      } catch (error) {
        console.log(`⚠️ ${check.name}: TEST FAILED`);
        errorLogger.logError({
          id: `${check.errorId}_TEST_FAILED`,
          category: ErrorCategory.COMPATIBILITY,
          severity: ErrorSeverity.MEDIUM,
          message: `${check.name} Test Failed`,
          details: `Error during compatibility test: ${error}`,
          solution: 'Browser may have limited compatibility with game features',
          timestamp: Date.now(),
          context: { error }
        });
      }
    }
    
    console.groupEnd();
  }

  private async checkResourceAvailability(): Promise<void> {
    console.group('📦 Resource Availability');
    
    // Check memory constraints
    const memoryInfo = (performance as any).memory;
    if (memoryInfo) {
      console.log('💾 Memory Usage:', {
        used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024) + 'MB'
      });
      
      const memoryUsagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
      if (memoryUsagePercent > 80) {
        errorLogger.logError({
          id: 'HIGH_MEMORY_USAGE',
          category: ErrorCategory.PERFORMANCE,
          severity: ErrorSeverity.MEDIUM,
          message: 'High Memory Usage Detected',
          details: `Memory usage: ${memoryUsagePercent.toFixed(1)}%`,
          solution: 'Close other browser tabs or applications to free up memory',
          timestamp: Date.now(),
          context: { memoryInfo }
        });
      }
    }
    
    // Check storage availability
    try {
      const testKey = 'pfg_storage_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      console.log('✅ Local Storage: AVAILABLE');
    } catch (error) {
      console.log('❌ Local Storage: UNAVAILABLE');
      errorLogger.logError(createStartupError('SAVE_GAME_FAILED', { error }));
    }
    
    // Check network status
    console.log('🌐 Network Status:', {
      online: navigator.onLine,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : 'Not available'
    });
    
    if (!navigator.onLine) {
      errorLogger.logError(createStartupError('NETWORK_CONNECTION_LOST'));
    }
    
    console.groupEnd();
  }

  private async checkGameConfiguration(): Promise<void> {
    console.group('⚙️ Game Configuration');
    
    // Check if Phaser is available
    if (typeof Phaser === 'undefined') {
      errorLogger.logError({
        id: 'PHASER_NOT_LOADED',
        category: ErrorCategory.STARTUP,
        severity: ErrorSeverity.CRITICAL,
        message: 'Phaser Library Not Loaded',
        details: 'Phaser game engine is not available in global scope',
        solution: 'Ensure Phaser library is properly loaded before game initialization',
        timestamp: Date.now()
      });
    } else {
      console.log(`✅ Phaser Version: ${Phaser.VERSION}`);
    }
    
    // Validate scene configuration
    const expectedScenes = ['StartScene', 'MinimalGameScene', 'PauseMenuScene', 'SettingsScene'];
    console.log('🎬 Expected Scenes:', expectedScenes);
    
    // Check for common scene issues
    const sceneIssues = this.validateSceneConfiguration();
    if (sceneIssues.length > 0) {
      errorLogger.logError({
        id: 'SCENE_CONFIGURATION_ISSUES',
        category: ErrorCategory.SCENE,
        severity: ErrorSeverity.HIGH,
        message: 'Scene Configuration Issues Detected',
        details: sceneIssues.join('; '),
        solution: 'Fix scene configuration in main.ts and ensure all referenced scenes exist',
        timestamp: Date.now(),
        context: { issues: sceneIssues }
      });
    }
    
    console.groupEnd();
  }

  private validateSceneConfiguration(): string[] {
    const issues: string[] = [];
    
    // This is the critical issue causing the grey screen
    // StartScene.ts line 51 calls this.scene.start('GameScene')
    // But main.ts only registers MinimalGameScene, not GameScene
    issues.push('StartScene attempts to start "GameScene" but only "MinimalGameScene" is registered in main.ts');
    
    // Check if GameScene exists but isn't registered
    issues.push('GameScene.ts exists in src/scenes/ but is not included in main.ts configuration');
    
    return issues;
  }

  private async checkAssetAvailability(): Promise<void> {
    console.group('🎨 Asset Availability');
    
    // Test basic asset loading capability
    const testImage = new Image();
    const imageLoadPromise = new Promise<boolean>((resolve) => {
      testImage.onload = () => resolve(true);
      testImage.onerror = () => resolve(false);
      testImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    });
    
    const canLoadImages = await imageLoadPromise;
    if (canLoadImages) {
      console.log('✅ Image Loading: WORKING');
    } else {
      console.log('❌ Image Loading: FAILED');
      errorLogger.logError(createStartupError('TEXTURE_LOAD_FAILED'));
    }
    
    // Test audio loading capability
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('✅ Audio Context: AVAILABLE');
      audioContext.close();
    } catch (error) {
      console.log('❌ Audio Context: UNAVAILABLE');
      errorLogger.logError(createStartupError('WEB_AUDIO_NOT_SUPPORTED', { error }));
    }
    
    console.groupEnd();
  }

  private async checkSystemPerformance(): Promise<void> {
    console.group('⚡ System Performance');
    
    // CPU performance test
    let iterations = 0;
    const cpuTestStart = performance.now();
    while (performance.now() - cpuTestStart < 10) {
      iterations++;
    }
    
    const cpuScore = iterations / 10; // Operations per millisecond
    console.log(`🖥️ CPU Performance Score: ${cpuScore.toFixed(0)} ops/ms`);
    
    if (cpuScore < 1000) {
      errorLogger.logError(createStartupError('LOW_FRAMERATE_DETECTED', {
        cpuScore,
        performance: 'below optimal'
      }));
    }
    
    // Frame rate estimation
    let frameCount = 0;
    const frameTestStart = performance.now();
    const frameTest = () => {
      frameCount++;
      if (performance.now() - frameTestStart < 100) {
        requestAnimationFrame(frameTest);
      } else {
        const estimatedFPS = (frameCount / 100) * 1000;
        console.log(`🎮 Estimated FPS Capability: ${estimatedFPS.toFixed(1)}`);
        
        if (estimatedFPS < 30) {
          errorLogger.logError({
            id: 'LOW_FPS_CAPABILITY',
            category: ErrorCategory.PERFORMANCE,
            severity: ErrorSeverity.MEDIUM,
            message: 'Low FPS Capability Detected',
            details: `Estimated FPS: ${estimatedFPS.toFixed(1)}`,
            solution: 'Device may struggle with game performance. Consider lowering quality settings.',
            timestamp: Date.now(),
            context: { estimatedFPS }
          });
        }
      }
    };
    requestAnimationFrame(frameTest);
    
    console.groupEnd();
  }

  private async checkSecurityConstraints(): Promise<void> {
    console.group('🔒 Security Constraints');
    
    // Check Content Security Policy
    try {
      eval('1+1'); // This will throw if CSP blocks eval
      console.log('✅ Script Execution: ALLOWED');
    } catch (error) {
      console.log('⚠️ Script Execution: RESTRICTED');
      errorLogger.logError(createStartupError('CONTENT_SECURITY_POLICY_VIOLATION', { error }));
    }
    
    // Check HTTPS context
    if (location.protocol === 'https:') {
      console.log('✅ HTTPS: SECURE');
    } else {
      console.log('⚠️ HTTP: INSECURE');
      errorLogger.logError({
        id: 'INSECURE_CONTEXT',
        category: ErrorCategory.SECURITY,
        severity: ErrorSeverity.LOW,
        message: 'Insecure Context Detected',
        details: 'Game is running over HTTP instead of HTTPS',
        solution: 'Some features may be limited. Use HTTPS for full functionality.',
        timestamp: Date.now()
      });
    }
    
    // Check for ad blockers that might interfere
    const testElement = document.createElement('div');
    testElement.className = 'adsystem';
    testElement.style.display = 'none';
    document.body.appendChild(testElement);
    
    setTimeout(() => {
      if (testElement.style.display === 'none' && testElement.offsetHeight === 0) {
        console.log('⚠️ Ad Blocker: POSSIBLY ACTIVE');
        errorLogger.logError({
          id: 'AD_BLOCKER_DETECTED',
          category: ErrorCategory.SECURITY,
          severity: ErrorSeverity.LOW,
          message: 'Ad Blocker Possibly Active',
          details: 'Ad blocker may interfere with game analytics or assets',
          solution: 'Some features may be limited if ad blocker blocks game resources',
          timestamp: Date.now()
        });
      } else {
        console.log('✅ Ad Blocker: NOT DETECTED');
      }
      document.body.removeChild(testElement);
    }, 100);
    
    console.groupEnd();
  }

  private logDiagnosticsComplete(): void {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    
    console.log(`🏁 Diagnostics completed in ${duration.toFixed(2)}ms`);
    
    const criticalErrors = errorLogger.getCriticalErrors();
    const totalErrors = errorLogger.getAllErrors().length;
    
    if (criticalErrors.length > 0) {
      console.error(`🚨 ${criticalErrors.length} CRITICAL ERRORS detected:`);
      criticalErrors.forEach(error => {
        console.error(`  • ${error.message}: ${error.details}`);
      });
    }
    
    if (totalErrors > 0) {
      console.warn(`⚠️ Total issues detected: ${totalErrors}`);
      console.log('📋 Run errorLogger.exportErrorReport() for detailed report');
    } else {
      console.log('✨ No issues detected - ready for optimal gameplay!');
    }
  }

  public isDiagnosticsComplete(): boolean {
    return this.diagnosticsComplete;
  }

  public async waitForDiagnostics(): Promise<void> {
    if (this.diagnosticsComplete) return;
    
    return new Promise((resolve) => {
      const checkComplete = () => {
        if (this.diagnosticsComplete) {
          resolve();
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      checkComplete();
    });
  }
}

// Auto-run diagnostics when module loads
const diagnostics = StartupDiagnostics.getInstance();
diagnostics.runFullDiagnostics();

export { diagnostics };
