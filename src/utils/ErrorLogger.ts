/**
 * ProtoFusionGirl - Comprehensive Error Logging System
 * 
 * This system provides detailed error tracking and diagnostics for game startup,
 * initialization, and runtime issues with hierarchical error categorization.
 */

export enum ErrorCategory {
  STARTUP = 'STARTUP',
  SCENE = 'SCENE',
  ASSET = 'ASSET',
  AUDIO = 'AUDIO',
  PHYSICS = 'PHYSICS',
  UI = 'UI',
  NETWORK = 'NETWORK',
  STORAGE = 'STORAGE',
  PERFORMANCE = 'PERFORMANCE',
  COMPATIBILITY = 'COMPATIBILITY',
  SECURITY = 'SECURITY',
  MOD = 'MOD',
  ANALYTICS = 'ANALYTICS',
  // ASI Control Interface Integration Categories
  ASI_COMMUNICATION = 'ASI_COMMUNICATION',
  TRUST_SYSTEM = 'TRUST_SYSTEM',
  COMMAND_CENTER = 'COMMAND_CENTER',
  INFORMATION_ASYMMETRY = 'INFORMATION_ASYMMETRY',
  UNIVERSAL_MAGIC = 'UNIVERSAL_MAGIC',
  LEYLINE_SYSTEM = 'LEYLINE_SYSTEM',
  MULTIVERSE_STATE = 'MULTIVERSE_STATE',
  PROCEDURAL_GENERATION = 'PROCEDURAL_GENERATION'
}

export enum ErrorSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO'
}

export interface GameError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  details: string;
  solution: string;
  timestamp: number;
  context?: any;
  subErrors?: GameError[];
  // ASI Integration Extensions
  asiContext?: ASIErrorContext;
  recoveryAttempts?: number;
  autoRecoverable?: boolean;
  playerImpact?: PlayerImpactLevel;
}

// ASI-specific error context for advanced diagnostics
export interface ASIErrorContext {
  trustLevel?: number;
  commandCenterState?: string;
  informationAsymmetryLevel?: number;
  activeSpells?: string[];
  leyLineStability?: number;
  multiverseCoherence?: number;
  playerFrustrationLevel?: FrustrationLevel;
}

export enum PlayerImpactLevel {
  NONE = 'NONE',           // Background error, no player impact
  MINOR = 'MINOR',         // Slight UI delay or cosmetic issue
  MODERATE = 'MODERATE',   // Feature temporarily unavailable
  MAJOR = 'MAJOR',         // Core gameplay affected
  CRITICAL = 'CRITICAL'    // Game unplayable
}

export enum FrustrationLevel {
  CALM = 'CALM',
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private errors: Map<string, GameError> = new Map();
  private errorHistory: GameError[] = [];
  private maxHistorySize = 1000;
  private logLevel: ErrorSeverity = ErrorSeverity.INFO;

  private constructor() {
    this.setupGlobalErrorHandlers();
    this.logStartupDiagnostics();
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private setupGlobalErrorHandlers(): void {
    // Catch unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        id: 'JS_UNHANDLED_ERROR',
        category: ErrorCategory.STARTUP,
        severity: ErrorSeverity.CRITICAL,
        message: 'Unhandled JavaScript Error',
        details: `${event.error?.message || event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
        solution: 'Check browser console for full stack trace. This may indicate a critical bug in the game code.',
        timestamp: Date.now(),
        context: { event }
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        id: 'JS_UNHANDLED_PROMISE_REJECTION',
        category: ErrorCategory.STARTUP,
        severity: ErrorSeverity.HIGH,
        message: 'Unhandled Promise Rejection',
        details: `${event.reason}`,
        solution: 'This indicates an async operation failed without proper error handling.',
        timestamp: Date.now(),
        context: { event }
      });
    });
  }

  private logStartupDiagnostics(): void {
    console.group('🚀 ProtoFusionGirl - Startup Diagnostics');
    
    // Browser Compatibility Checks
    this.checkBrowserCompatibility();
    
    // Device Capabilities
    this.checkDeviceCapabilities();
    
    // Network Status
    this.checkNetworkStatus();
    
    // Storage Availability
    this.checkStorageAvailability();
    
    console.groupEnd();
  }

  private checkBrowserCompatibility(): void {
    const checks = [
      {
        id: 'WEBGL_SUPPORT',
        test: () => {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        },
        message: 'WebGL Support Check',
        errorDetails: 'WebGL is not supported by this browser',
        solution: 'Please use a modern browser that supports WebGL (Chrome, Firefox, Safari, Edge)'
      },
      {
        id: 'WEB_AUDIO_SUPPORT',
        test: () => !!(window.AudioContext || (window as any).webkitAudioContext),
        message: 'Web Audio API Support Check',
        errorDetails: 'Web Audio API is not supported',
        solution: 'Audio features will be limited. Consider upgrading your browser.'
      },
      {
        id: 'LOCAL_STORAGE_SUPPORT',
        test: () => {
          try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
          } catch {
            return false;
          }
        },
        message: 'Local Storage Support Check',
        errorDetails: 'Local Storage is not available',
        solution: 'Game progress cannot be saved. Check if cookies/storage are enabled.'
      },
      {
        id: 'ES6_SUPPORT',
        test: () => {
          try {
            new Function('() => {}');
            return true;
          } catch {
            return false;
          }
        },
        message: 'ES6 Arrow Functions Support Check',
        errorDetails: 'ES6 features are not supported',
        solution: 'Please update to a modern browser version.'
      },
      {
        id: 'GAMEPAD_API_SUPPORT',
        test: () => !!(navigator.getGamepads),
        message: 'Gamepad API Support Check',
        errorDetails: 'Gamepad API is not supported',
        solution: 'Controller support will be unavailable.'
      }
    ];

    checks.forEach(check => {
      if (!check.test()) {
        this.logError({
          id: check.id,
          category: ErrorCategory.COMPATIBILITY,
          severity: check.id === 'WEBGL_SUPPORT' ? ErrorSeverity.CRITICAL : ErrorSeverity.MEDIUM,
          message: check.message,
          details: check.errorDetails,
          solution: check.solution,
          timestamp: Date.now()
        });
      } else {
        console.log(`✅ ${check.message}: PASSED`);
      }
    });
  }

  private checkDeviceCapabilities(): void {
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
      maxTouchPoints: navigator.maxTouchPoints || 0,
      deviceMemory: (navigator as any).deviceMemory || 'Unknown',
      connection: (navigator as any).connection
    };

    console.log('📱 Device Information:', deviceInfo);

    // Check for potential performance issues
    if (typeof deviceInfo.hardwareConcurrency === 'number' && deviceInfo.hardwareConcurrency < 2) {
      this.logError({
        id: 'LOW_CPU_CORES',
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.MEDIUM,
        message: 'Low CPU Core Count Detected',
        details: `Device has ${deviceInfo.hardwareConcurrency} CPU cores`,
        solution: 'Performance may be reduced. Consider lowering graphics settings.',
        timestamp: Date.now(),
        context: { deviceInfo }
      });
    }

    if (typeof deviceInfo.deviceMemory === 'number' && deviceInfo.deviceMemory < 2) {
      this.logError({
        id: 'LOW_DEVICE_MEMORY',
        category: ErrorCategory.PERFORMANCE,
        severity: ErrorSeverity.MEDIUM,
        message: 'Low Device Memory Detected',
        details: `Device has approximately ${deviceInfo.deviceMemory}GB of RAM`,
        solution: 'Close other applications and browser tabs to free up memory.',
        timestamp: Date.now(),
        context: { deviceInfo }
      });
    }

    if (!deviceInfo.onLine) {
      this.logError({
        id: 'OFFLINE_MODE',
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        message: 'Device is Offline',
        details: 'No internet connection detected',
        solution: 'Some features may be unavailable. Connect to internet for full experience.',
        timestamp: Date.now()
      });
    }
  }

  private checkNetworkStatus(): void {
    const connection = (navigator as any).connection;
    if (connection) {
      console.log('🌐 Network Information:', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      });

      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.logError({
          id: 'SLOW_NETWORK_CONNECTION',
          category: ErrorCategory.NETWORK,
          severity: ErrorSeverity.MEDIUM,
          message: 'Slow Network Connection Detected',
          details: `Connection type: ${connection.effectiveType}`,
          solution: 'Asset loading may be slow. Consider enabling data-saver mode.',
          timestamp: Date.now(),
          context: { connection }
        });
      }

      if (connection.saveData) {
        console.log('📊 Data Saver mode is enabled');
      }
    }
  }

  private checkStorageAvailability(): void {
    try {
      // Check localStorage quota
      const testKey = 'quota_test';
      let estimatedQuota = 0;
      
      try {
        for (let i = 0; i < 10000; i++) {
          localStorage.setItem(testKey + i, 'a'.repeat(1000));
          estimatedQuota += 1000;
        }
      } catch (e) {
        // Clean up test data
        for (let i = 0; i < 10000; i++) {
          localStorage.removeItem(testKey + i);
        }
      }

      console.log(`💾 Estimated localStorage quota: ~${Math.round(estimatedQuota / 1024)}KB`);

      if (estimatedQuota < 50000) { // Less than ~50KB
        this.logError({
          id: 'LOW_STORAGE_QUOTA',
          category: ErrorCategory.STORAGE,
          severity: ErrorSeverity.MEDIUM,
          message: 'Low Storage Quota',
          details: `Available storage: ~${Math.round(estimatedQuota / 1024)}KB`,
          solution: 'Game save data may be limited. Clear browser data to free up space.',
          timestamp: Date.now()
        });
      }
    } catch (e) {
      this.logError({
        id: 'STORAGE_ACCESS_ERROR',
        category: ErrorCategory.STORAGE,
        severity: ErrorSeverity.HIGH,
        message: 'Storage Access Error',
        details: `Cannot access browser storage: ${e}`,
        solution: 'Enable cookies and local storage in browser settings.',
        timestamp: Date.now(),
        context: { error: e }
      });
    }
  }

  public logError(error: GameError): void {
    this.errors.set(error.id, error);
    this.errorHistory.push(error);

    // Maintain history size
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Only log if severity meets threshold
    if (this.shouldLog(error.severity)) {
      const emoji = this.getSeverityEmoji(error.severity);
      const color = this.getSeverityColor(error.severity);
      
      console.group(`${emoji} [${error.category}] ${error.message}`);
      console.log(`%c${error.details}`, `color: ${color}; font-weight: bold;`);
      console.log(`💡 Solution: ${error.solution}`);
      console.log(`⏰ Timestamp: ${new Date(error.timestamp).toISOString()}`);
      
      if (error.context) {
        console.log('📋 Context:', error.context);
      }
      
      if (error.subErrors && error.subErrors.length > 0) {
        console.log('🔗 Related Errors:');
        error.subErrors.forEach(subError => {
          console.log(`  • ${subError.message}: ${subError.details}`);
        });
      }
      
      console.groupEnd();
    }
  }

  private shouldLog(severity: ErrorSeverity): boolean {
    const levels = [ErrorSeverity.CRITICAL, ErrorSeverity.HIGH, ErrorSeverity.MEDIUM, ErrorSeverity.LOW, ErrorSeverity.INFO];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const errorLevelIndex = levels.indexOf(severity);
    return errorLevelIndex <= currentLevelIndex;
  }

  private getSeverityEmoji(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL: return '🚨';
      case ErrorSeverity.HIGH: return '⚠️';
      case ErrorSeverity.MEDIUM: return '🔶';
      case ErrorSeverity.LOW: return '🔸';
      case ErrorSeverity.INFO: return 'ℹ️';
      default: return '❓';
    }
  }

  private getSeverityColor(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL: return '#ff0000';
      case ErrorSeverity.HIGH: return '#ff6600';
      case ErrorSeverity.MEDIUM: return '#ffaa00';
      case ErrorSeverity.LOW: return '#ffdd00';
      case ErrorSeverity.INFO: return '#0099ff';
      default: return '#666666';
    }
  }

  public getError(id: string): GameError | undefined {
    return this.errors.get(id);
  }

  public getAllErrors(): GameError[] {
    return Array.from(this.errors.values());
  }

  public getErrorsByCategory(category: ErrorCategory): GameError[] {
    return this.getAllErrors().filter(error => error.category === category);
  }

  public getErrorsBySeverity(severity: ErrorSeverity): GameError[] {
    return this.getAllErrors().filter(error => error.severity === severity);
  }

  public getCriticalErrors(): GameError[] {
    return this.getErrorsBySeverity(ErrorSeverity.CRITICAL);
  }

  public hasErrors(): boolean {
    return this.errors.size > 0;
  }

  public hasCriticalErrors(): boolean {
    return this.getCriticalErrors().length > 0;
  }

  public clearErrors(): void {
    this.errors.clear();
  }

  public setLogLevel(level: ErrorSeverity): void {
    this.logLevel = level;
  }

  public exportErrorReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errors: this.getAllErrors(),
      summary: {
        total: this.errors.size,
        critical: this.getCriticalErrors().length,
        byCategory: Object.values(ErrorCategory).reduce((acc, category) => {
          acc[category] = this.getErrorsByCategory(category).length;
          return acc;
        }, {} as Record<string, number>)
      }
    };

    return JSON.stringify(report, null, 2);
  }

  public logStartupSuccess(): void {
    console.log('🎉 ProtoFusionGirl startup completed successfully!');
    
    if (this.hasErrors()) {
      console.warn(`⚠️ ${this.errors.size} issues were detected during startup`);
      
      if (this.hasCriticalErrors()) {
        console.error(`🚨 ${this.getCriticalErrors().length} critical issues found!`);
      }
      
      console.log('📊 Error Summary by Category:');
      Object.values(ErrorCategory).forEach(category => {
        const count = this.getErrorsByCategory(category).length;
        if (count > 0) {
          console.log(`  ${category}: ${count}`);
        }
      });
    } else {
      console.log('✨ No issues detected - optimal startup!');
    }
  }

  // === ASI INTEGRATION METHODS ===

  /**
   * Log ASI-specific errors with enhanced context
   */
  public logASIError(error: Omit<GameError, 'timestamp'>, asiContext?: ASIErrorContext): void {
    const enhancedError: GameError = {
      ...error,
      timestamp: Date.now(),
      asiContext,
      autoRecoverable: this.isAutoRecoverable(error),
      playerImpact: this.assessPlayerImpact(error, asiContext)
    };

    this.logError(enhancedError);
    this.handleASIErrorResponse(enhancedError);
  }

  /**
   * Assess player frustration level based on error history
   */
  public assessPlayerFrustration(): FrustrationLevel {
    const recentErrors = this.errorHistory
      .filter(error => Date.now() - error.timestamp < 300000) // Last 5 minutes
      .filter(error => error.playerImpact && error.playerImpact !== PlayerImpactLevel.NONE);

    if (recentErrors.length === 0) return FrustrationLevel.CALM;
    if (recentErrors.length <= 2) return FrustrationLevel.MILD;
    if (recentErrors.length <= 5) return FrustrationLevel.MODERATE;
    if (recentErrors.length <= 10) return FrustrationLevel.HIGH;
    return FrustrationLevel.CRITICAL;
  }

  /**
   * Get errors by ASI system category
   */
  public getASISystemErrors(): GameError[] {
    const asiCategories = [
      ErrorCategory.ASI_COMMUNICATION,
      ErrorCategory.TRUST_SYSTEM,
      ErrorCategory.COMMAND_CENTER,
      ErrorCategory.INFORMATION_ASYMMETRY,
      ErrorCategory.UNIVERSAL_MAGIC,
      ErrorCategory.LEYLINE_SYSTEM,
      ErrorCategory.MULTIVERSE_STATE
    ];

    return this.getAllErrors().filter(error => 
      asiCategories.includes(error.category)
    );
  }

  /**
   * Calculate system health score (0-100)
   */
  public calculateSystemHealthScore(): number {
    const totalErrors = this.errors.size;
    const criticalErrors = this.getCriticalErrors().length;
    const asiErrors = this.getASISystemErrors().length;
    const recentErrors = this.errorHistory
      .filter(error => Date.now() - error.timestamp < 600000) // Last 10 minutes
      .length;

    // Base score starts at 100
    let score = 100;

    // Deduct points for various error types
    score -= criticalErrors * 25;  // Critical errors are severe
    score -= asiErrors * 10;       // ASI errors impact core gameplay
    score -= recentErrors * 5;     // Recent errors indicate instability
    score -= totalErrors * 2;      // General error count

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Attempt automatic error recovery for ASI systems
   */
  public async attemptAutoRecovery(errorId: string): Promise<boolean> {
    const error = this.errors.get(errorId);
    if (!error || !error.autoRecoverable) {
      return false;
    }

    try {
      const recovery = await this.executeRecoveryStrategy(error);
      if (recovery.success) {
        error.recoveryAttempts = (error.recoveryAttempts || 0) + 1;
        console.log(`✅ Auto-recovery successful for error: ${errorId}`);
        return true;
      }
    } catch (recoveryError) {
      console.error(`❌ Auto-recovery failed for error: ${errorId}`, recoveryError);
    }

    return false;
  }

  /**
   * Generate emotional error response based on player frustration
   */
  public generateEmotionalResponse(error: GameError): string {
    const frustration = this.assessPlayerFrustration();
    const impact = error.playerImpact || PlayerImpactLevel.MINOR;

    if (frustration >= FrustrationLevel.HIGH || impact === PlayerImpactLevel.CRITICAL) {
      return this.generateCalmingResponse(error);
    } else if (frustration >= FrustrationLevel.MODERATE) {
      return this.generateReassuranceResponse(error);
    } else {
      return error.solution; // Standard solution for calm players
    }
  }

  // === PRIVATE ASI HELPER METHODS ===

  private isAutoRecoverable(error: Omit<GameError, 'timestamp'>): boolean {
    const recoverableCategories = [
      ErrorCategory.NETWORK,
      ErrorCategory.PERFORMANCE,
      ErrorCategory.ASI_COMMUNICATION,
      ErrorCategory.LEYLINE_SYSTEM
    ];

    const nonRecoverableSeverities = [ErrorSeverity.CRITICAL];

    return recoverableCategories.includes(error.category) && 
           !nonRecoverableSeverities.includes(error.severity);
  }

  private assessPlayerImpact(error: Omit<GameError, 'timestamp'>, asiContext?: ASIErrorContext): PlayerImpactLevel {
    if (error.severity === ErrorSeverity.CRITICAL) return PlayerImpactLevel.CRITICAL;
    if (error.category === ErrorCategory.STARTUP) return PlayerImpactLevel.MAJOR;
    if (error.category === ErrorCategory.SCENE) return PlayerImpactLevel.MAJOR;
    
    // ASI-specific impact assessment
    if (asiContext?.trustLevel !== undefined && asiContext.trustLevel < 30) {
      return PlayerImpactLevel.MAJOR;
    }
    
    if (error.category === ErrorCategory.COMMAND_CENTER) return PlayerImpactLevel.MODERATE;
    if (error.category === ErrorCategory.UNIVERSAL_MAGIC) return PlayerImpactLevel.MODERATE;
    
    return PlayerImpactLevel.MINOR;
  }

  private handleASIErrorResponse(error: GameError): void {
    // Emit ASI-specific error events for other systems to respond
    if (typeof window !== 'undefined' && (window as any).gameEventBus) {
      (window as any).gameEventBus.emit({
        type: 'ASI_ERROR_DETECTED',
        data: {
          error,
          frustrationLevel: this.assessPlayerFrustration(),
          healthScore: this.calculateSystemHealthScore()
        }
      });
    }
  }

  private async executeRecoveryStrategy(error: GameError): Promise<{success: boolean, details?: string}> {
    // Implement specific recovery strategies based on error category
    switch (error.category) {
      case ErrorCategory.NETWORK:
        return this.recoverNetworkError(error);
      case ErrorCategory.ASI_COMMUNICATION:
        return this.recoverASICommunication(error);
      case ErrorCategory.LEYLINE_SYSTEM:
        return this.recoverLeyLineSystem(error);
      default:
        return { success: false, details: 'No recovery strategy available' };
    }
  }

  private async recoverNetworkError(error: GameError): Promise<{success: boolean, details?: string}> {
    // Simple network retry strategy
    try {
      const response = await fetch('/health-check', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return { success: response.ok, details: `Network status: ${response.status}` };
    } catch {
      return { success: false, details: 'Network still unavailable' };
    }
  }

  private async recoverASICommunication(error: GameError): Promise<{success: boolean, details?: string}> {
    // Reset ASI communication channel
    if (typeof window !== 'undefined' && (window as any).gameEventBus) {
      (window as any).gameEventBus.emit({
        type: 'ASI_COMMUNICATION_RESET_REQUESTED',
        data: { errorId: error.id }
      });
      return { success: true, details: 'ASI communication reset initiated' };
    }
    return { success: false, details: 'Event bus not available' };
  }

  private async recoverLeyLineSystem(error: GameError): Promise<{success: boolean, details?: string}> {
    // Attempt ley line system stabilization
    if (typeof window !== 'undefined' && (window as any).gameEventBus) {
      (window as any).gameEventBus.emit({
        type: 'LEYLINE_STABILIZATION_REQUESTED',
        data: { errorId: error.id }
      });
      return { success: true, details: 'Ley line stabilization initiated' };
    }
    return { success: false, details: 'Event bus not available' };
  }

  private generateCalmingResponse(error: GameError): string {
    const calmingPhrases = [
      "We understand this is frustrating. Let's work together to resolve this.",
      "I know this is inconvenient. We're actively working to fix this issue.",
      "This error is temporary and we're committed to getting you back to exploring the multiverse.",
      "Jane and the ASI are collaborating to restore full functionality."
    ];

    const randomPhrase = calmingPhrases[Math.floor(Math.random() * calmingPhrases.length)];
    return `${randomPhrase}\n\nTechnical details: ${error.solution}`;
  }

  private generateReassuranceResponse(error: GameError): string {
    const reassurancePhrases = [
      "This is a minor hiccup that we can quickly resolve.",
      "The ASI Control Interface is adapting to handle this situation.",
      "Jane's systems are self-correcting this issue."
    ];

    const randomPhrase = reassurancePhrases[Math.floor(Math.random() * reassurancePhrases.length)];
    return `${randomPhrase}\n\n${error.solution}`;
  }
}

// Initialize the error logger immediately
const errorLogger = ErrorLogger.getInstance();
export { errorLogger };
