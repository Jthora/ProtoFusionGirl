/**
 * ProtoFusionGirl - Runtime Error Monitoring System
 * 
 * This system monitors the game for runtime errors and provides detailed
 * diagnostic information to help resolve issues during gameplay.
 */

import { errorLogger, ErrorCategory, ErrorSeverity } from './ErrorLogger';

export class RuntimeMonitor {
  private static instance: RuntimeMonitor;
  private performanceMonitor: PerformanceObserver | null = null;
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private fpsHistory: number[] = [];
  private errorCount = 0;
  private isMonitoring = false;

  private constructor() {
    this.setupRuntimeMonitoring();
  }

  public static getInstance(): RuntimeMonitor {
    if (!RuntimeMonitor.instance) {
      RuntimeMonitor.instance = new RuntimeMonitor();
    }
    return RuntimeMonitor.instance;
  }

  private setupRuntimeMonitoring(): void {
    console.log('🔍 Setting up runtime error monitoring...');

    // Monitor JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleJavaScriptError(event);
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event);
    });

    // Monitor resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        this.handleResourceError(event);
      }
    }, true);

    // Setup performance monitoring if available
    this.setupPerformanceMonitoring();

    // Monitor FPS
    this.startFPSMonitoring();

    this.isMonitoring = true;
    console.log('✅ Runtime monitoring active');
  }

  private handleJavaScriptError(event: ErrorEvent): void {
    this.errorCount++;
    
    errorLogger.logError({
      id: 'RUNTIME_JAVASCRIPT_ERROR',
      category: ErrorCategory.STARTUP,
      severity: ErrorSeverity.HIGH,
      message: 'Runtime JavaScript Error',
      details: `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
      solution: 'Check the error details and fix the JavaScript code issue',
      timestamp: Date.now(),
      context: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        errorCount: this.errorCount
      }
    });

    // Specific error pattern detection
    if (event.message.includes('Scene')) {
      this.handleSceneRelatedError(event);
    }

    if (event.message.includes('WebGL')) {
      this.handleWebGLError(event);
    }

    if (event.message.includes('Audio')) {
      this.handleAudioError(event);
    }
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    errorLogger.logError({
      id: 'RUNTIME_PROMISE_REJECTION',
      category: ErrorCategory.STARTUP,
      severity: ErrorSeverity.MEDIUM,
      message: 'Unhandled Promise Rejection',
      details: `${event.reason}`,
      solution: 'Add proper error handling to async operations',
      timestamp: Date.now(),
      context: {
        reason: event.reason,
        promise: event.promise
      }
    });
  }

  private handleResourceError(event: Event): void {
    const target = event.target as HTMLElement;
    const resourceType = target.tagName.toLowerCase();
    const src = (target as any).src || (target as any).href || 'unknown';

    errorLogger.logError({
      id: 'RUNTIME_RESOURCE_ERROR',
      category: ErrorCategory.ASSET,
      severity: ErrorSeverity.MEDIUM,
      message: `Resource Loading Error: ${resourceType}`,
      details: `Failed to load ${resourceType} from ${src}`,
      solution: 'Check if the resource exists and is accessible',
      timestamp: Date.now(),
      context: {
        resourceType,
        src,
        element: target
      }
    });
  }

  private handleSceneRelatedError(event: ErrorEvent): void {
    errorLogger.logError({
      id: 'RUNTIME_SCENE_ERROR',
      category: ErrorCategory.SCENE,
      severity: ErrorSeverity.HIGH,
      message: 'Scene-Related Runtime Error',
      details: `Scene error: ${event.message}`,
      solution: 'Check scene configuration and ensure all referenced scenes exist',
      timestamp: Date.now(),
      context: {
        originalError: event.message,
        possibleCauses: [
          'Scene not found in configuration',
          'Scene transition error',
          'Scene initialization failure',
          'Missing scene assets'
        ]
      }
    });
  }

  private handleWebGLError(event: ErrorEvent): void {
    errorLogger.logError({
      id: 'RUNTIME_WEBGL_ERROR',
      category: ErrorCategory.STARTUP,
      severity: ErrorSeverity.CRITICAL,
      message: 'WebGL Runtime Error',
      details: `WebGL error: ${event.message}`,
      solution: 'Check WebGL support and graphics drivers. Consider falling back to Canvas renderer.',
      timestamp: Date.now(),
      context: {
        originalError: event.message,
        webglSupport: this.checkWebGLSupport()
      }
    });
  }

  private handleAudioError(event: ErrorEvent): void {
    errorLogger.logError({
      id: 'RUNTIME_AUDIO_ERROR',
      category: ErrorCategory.AUDIO,
      severity: ErrorSeverity.MEDIUM,
      message: 'Audio Runtime Error',
      details: `Audio error: ${event.message}`,
      solution: 'Check audio file formats and browser audio support',
      timestamp: Date.now(),
      context: {
        originalError: event.message,
        audioContext: this.checkAudioContext()
      }
    });
  }

  private setupPerformanceMonitoring(): void {
    try {
      if ('PerformanceObserver' in window) {
        this.performanceMonitor = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name === 'measure' && entry.duration > 16.67) { // > 60fps threshold
              errorLogger.logError({
                id: 'PERFORMANCE_SLOW_OPERATION',
                category: ErrorCategory.PERFORMANCE,
                severity: ErrorSeverity.MEDIUM,
                message: 'Slow Performance Detected',
                details: `Operation "${entry.name}" took ${entry.duration.toFixed(2)}ms`,
                solution: 'Optimize the slow operation to improve performance',
                timestamp: Date.now(),
                context: { entry }
              });
            }
          });
        });

        this.performanceMonitor.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
        console.log('✅ Performance monitoring enabled');
      }
    } catch (error) {
      console.warn('⚠️ Performance monitoring not available:', error);
    }
  }

  private startFPSMonitoring(): void {
    const measureFPS = () => {
      const now = performance.now();
      const delta = now - this.lastFrameTime;
      this.lastFrameTime = now;
      
      const fps = 1000 / delta;
      this.fpsHistory.push(fps);
      
      // Keep only last 60 frames
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      
      // Check for performance issues every 60 frames
      if (this.frameCount % 60 === 0) {
        this.checkPerformanceMetrics();
      }
      
      this.frameCount++;
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  private checkPerformanceMetrics(): void {
    if (this.fpsHistory.length < 30) return;

    const avgFPS = this.fpsHistory.reduce((a, b) => a + b) / this.fpsHistory.length;
    const minFPS = Math.min(...this.fpsHistory);

    if (avgFPS < 30) {
      errorLogger.logError({
        id: 'PERFORMANCE_LOW_FPS',
        category: ErrorCategory.PERFORMANCE,
        severity: avgFPS < 15 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
        message: 'Low Frame Rate Detected',
        details: `Average FPS: ${avgFPS.toFixed(1)}, Minimum FPS: ${minFPS.toFixed(1)}`,
        solution: 'Close other applications, reduce graphics settings, or check for performance bottlenecks',
        timestamp: Date.now(),
        context: {
          avgFPS: avgFPS.toFixed(1),
          minFPS: minFPS.toFixed(1),
          frameCount: this.frameCount,
          memoryUsage: this.getMemoryUsage()
        }
      });
    }
  }

  private checkWebGLSupport(): any {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return { supported: false };

      const webglContext = gl as WebGLRenderingContext;
      return {
        supported: true,
        version: webglContext.getParameter(webglContext.VERSION),
        vendor: webglContext.getParameter(webglContext.VENDOR),
        renderer: webglContext.getParameter(webglContext.RENDERER),
        maxTextureSize: webglContext.getParameter(webglContext.MAX_TEXTURE_SIZE),
        extensions: webglContext.getSupportedExtensions()
      };
    } catch (error) {
      return { supported: false, error: String(error) };
    }
  }

  private checkAudioContext(): any {
    try {
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        return { supported: false };
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContextClass();
      
      const result = {
        supported: true,
        state: context.state,
        sampleRate: context.sampleRate,
        maxChannelCount: context.destination.maxChannelCount
      };

      context.close();
      return result;
    } catch (error) {
      return { supported: false, error: String(error) };
    }
  }

  private getMemoryUsage(): any {
    const memory = (performance as any).memory;
    if (!memory) return { supported: false };

    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
    };
  }

  public getCurrentFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    return this.fpsHistory[this.fpsHistory.length - 1];
  }

  public getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 0;
    return this.fpsHistory.reduce((a, b) => a + b) / this.fpsHistory.length;
  }

  public getErrorCount(): number {
    return this.errorCount;
  }

  public isActive(): boolean {
    return this.isMonitoring;
  }

  public generatePerformanceReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      monitoring: {
        active: this.isMonitoring,
        frameCount: this.frameCount,
        errorCount: this.errorCount
      },
      performance: {
        currentFPS: this.getCurrentFPS().toFixed(1),
        averageFPS: this.getAverageFPS().toFixed(1),
        minFPS: this.fpsHistory.length > 0 ? Math.min(...this.fpsHistory).toFixed(1) : 0,
        maxFPS: this.fpsHistory.length > 0 ? Math.max(...this.fpsHistory).toFixed(1) : 0
      },
      memory: this.getMemoryUsage(),
      webgl: this.checkWebGLSupport(),
      audio: this.checkAudioContext(),
      browser: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as any).deviceMemory
      }
    };

    return JSON.stringify(report, null, 2);
  }

  public stop(): void {
    if (this.performanceMonitor) {
      this.performanceMonitor.disconnect();
      this.performanceMonitor = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Runtime monitoring stopped');
  }
}

// Create singleton instance
export const runtimeMonitor = RuntimeMonitor.getInstance();

// Expose globally for debugging
(window as any).runtimeMonitor = runtimeMonitor;
