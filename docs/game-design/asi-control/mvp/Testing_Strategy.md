# Testing Strategy for MVP ASI Interface

## Testing Overview

The MVP testing strategy focuses on validating the core hypothesis: **Players will prefer ASI control over direct character control**. This requires both quantitative metrics collection and qualitative user feedback to measure engagement, preference, and the overall ASI experience.

## Testing Phases

### Phase 1: Unit & Integration Testing

#### Component Testing
```typescript
// Test structure for core components
describe('TrustManager', () => {
  let trustManager: TrustManager;
  let mockEventBus: EventBus;
  
  beforeEach(() => {
    mockEventBus = new EventBus();
    trustManager = new TrustManager(mockEventBus);
  });
  
  it('should increase trust when guidance is followed successfully', () => {
    // Test trust increase mechanism
    trustManager.handleGuidanceFollowed({
      data: { context: 'successful_guidance' }
    });
    
    expect(trustManager.getTrustLevel()).toBeGreaterThan(50);
  });
  
  it('should decrease trust when guidance leads to failure', () => {
    // Test trust decrease mechanism
    trustManager.handlePlayerFailure({
      data: { guidanceInfluenced: true, context: 'failed_guidance' }
    });
    
    expect(trustManager.getTrustLevel()).toBeLessThan(50);
  });
  
  it('should emit trust change events', () => {
    const eventSpy = jest.spyOn(mockEventBus, 'emit');
    
    trustManager.handleGuidanceFollowed({
      data: { context: 'test' }
    });
    
    expect(eventSpy).toHaveBeenCalledWith({
      type: 'TRUST_CHANGED',
      data: expect.objectContaining({
        currentLevel: expect.any(Number),
        change: expect.any(Number)
      })
    });
  });
});
```

#### System Integration Testing
```typescript
describe('ASI System Integration', () => {
  let scene: Phaser.Scene;
  let eventBus: EventBus;
  let trustManager: TrustManager;
  let guidanceEngine: GuidanceEngine;
  let threatDetector: ThreatDetector;
  
  beforeEach(() => {
    scene = new MockScene();
    eventBus = new EventBus();
    trustManager = new TrustManager(eventBus);
    threatDetector = new ThreatDetector(scene, eventBus);
    guidanceEngine = new GuidanceEngine(scene, eventBus, trustManager, threatDetector);
  });
  
  it('should generate threat-based guidance suggestions', () => {
    // Simulate threat detection
    threatDetector.updateThreat({
      id: 'test_threat',
      type: 'enemy',
      position: { x: 100, y: 100 },
      severity: 'high',
      janeAware: false
    });
    
    const suggestions = guidanceEngine.getActiveSuggestions();
    expect(suggestions).toHaveLength(greaterThan(0));
    expect(suggestions[0].type).toBe('movement');
  });
  
  it('should handle guidance selection and trust updates', () => {
    const trustSpy = jest.spyOn(trustManager, 'handleGuidanceFollowed');
    
    guidanceEngine.handleGuidanceSelection('test_suggestion');
    
    expect(trustSpy).toHaveBeenCalled();
  });
});

### Phase 1.1: Implemented-slice tests (now playable)

- Guidance v1
  - On ASI_GUIDANCE_GIVEN with world target, GameScene issues physics.moveTo and draws a guidance path. Assert tween/graphics created and destroyed after fade.
  - On arrival within epsilon radius, emit GUIDANCE_FOLLOWED; on timeout, emit GUIDANCE_IGNORED. Trust should adjust accordingly (pending next step).

- Shield Window
  - Given THREAT_DETECTED with severity=high and TTI < threshold and trust >= emergency, timeScale reduces for duration and then restores; cooldown blocks repeated triggers. Verify cooldown timestamp logic.

- Threat TTI halos
  - addOrUpdateThreatIndicator creates per-id graphics; updates arc proportionally as TTI decreases; removes on resolve.

Smoke checklist for CI:
- Build compiles with no type errors.
- GameScene tests pass (mocks for Phaser time/physics as needed).
- No more than N warnings from jest --detectOpenHandles.
- Coverage for CommandCenterUI threat indicator paths ≥ basic lines touched.
```

### Phase 2: A/B Testing Framework

#### Test Configuration
```typescript
interface ABTestConfig {
  testId: string;
  name: string;
  description: string;
  variants: TestVariant[];
  targetMetrics: string[];
  sampleSize: number;
  duration: number; // in days
  startDate: Date;
  endDate: Date;
}

interface TestVariant {
  id: string;
  name: string;
  description: string;
  config: VariantConfig;
  trafficAllocation: number; // percentage
}

interface VariantConfig {
  interface: {
    showThreatOverlays: boolean;
    guidanceFrequency: number;
    trustMeterVisible: boolean;
    magicSystemEnabled: boolean;
  };
  
  behavior: {
    janeResponseRate: number;
    trustGainRate: number;
    threatDetectionRadius: number;
  };
}
```

#### Test Implementation
```typescript
class ABTestManager {
  private activeTests: Map<string, ABTest> = new Map();
  private analytics: AnalyticsCollector;
  private userAssignments: Map<string, string> = new Map();
  
  constructor(analytics: AnalyticsCollector) {
    this.analytics = analytics;
  }
  
  initializeTest(config: ABTestConfig): void {
    const test = new ABTest(config);
    this.activeTests.set(config.testId, test);
    
    // Set up metric collection
    this.setupMetricCollection(test);
  }
  
  assignUserToVariant(userId: string, testId: string): string {
    const test = this.activeTests.get(testId);
    if (!test) return 'control';
    
    // Consistent assignment based on user ID hash
    const hash = this.hashUserId(userId);
    const variant = test.getVariantForHash(hash);
    
    this.userAssignments.set(`${userId}_${testId}`, variant.id);
    return variant.id;
  }
  
  getTestConfiguration(userId: string, testId: string): VariantConfig {
    const variantId = this.userAssignments.get(`${userId}_${testId}`);
    const test = this.activeTests.get(testId);
    
    return test?.getVariantConfig(variantId) || this.getDefaultConfig();
  }
  
  recordMetric(userId: string, testId: string, metric: string, value: number): void {
    const variantId = this.userAssignments.get(`${userId}_${testId}`);
    if (!variantId) return;
    
    this.analytics.recordEvent({
      type: 'ab_test_metric',
      testId,
      variantId,
      userId,
      metric,
      value,
      timestamp: Date.now()
    });
  }
  
  private setupMetricCollection(test: ABTest): void {
    // Set up automatic metric collection for test
    test.config.targetMetrics.forEach(metric => {
      this.analytics.on(metric, (event: any) => {
        this.recordMetric(event.userId, test.config.testId, metric, event.value);
      });
    });
  }
  
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
```

### Phase 3: User Testing Protocol

#### Testing Sessions Structure
```typescript
interface UserTestingSession {
  sessionId: string;
  userId: string;
  testType: 'moderated' | 'unmoderated' | 'remote';
  duration: number; // minutes
  tasks: TestTask[];
  metrics: SessionMetrics;
  feedback: UserFeedback;
}

interface TestTask {
  id: string;
  description: string;
  expectedDuration: number;
  successCriteria: string[];
  metrics: TaskMetrics;
}

interface TaskMetrics {
  startTime: number;
  endTime: number;
  completed: boolean;
  errors: Error[];
  assistanceRequired: boolean;
  userSatisfaction: number; // 1-10 scale
}
```

#### Testing Scenarios
```typescript
const USER_TESTING_SCENARIOS: TestTask[] = [
  {
    id: 'first_guidance',
    description: 'Provide your first guidance suggestion to Jane',
    expectedDuration: 2,
    successCriteria: [
      'User clicks on a guidance suggestion',
      'User observes Jane\'s response',
      'User notices trust meter change'
    ],
    metrics: {
      clickTime: 0,
      completionTime: 0,
      clickAccuracy: 0,
      comprehensionScore: 0
    }
  },
  
  {
    id: 'threat_detection',
    description: 'Help Jane avoid a threat she cannot see',
    expectedDuration: 5,
    successCriteria: [
      'User notices threat overlay',
      'User provides appropriate guidance',
      'Jane successfully avoids threat'
    ],
    metrics: {
      threatNoticeTime: 0,
      guidanceDelay: 0,
      successRate: 0
    }
  },
  
  {
    id: 'magic_usage',
    description: 'Use Universal Magic to help Jane overcome an obstacle',
    expectedDuration: 3,
    successCriteria: [
      'User selects magic symbol',
      'User drags symbol to appropriate location',
      'Magic effect helps Jane progress'
    ],
    metrics: {
      symbolSelectionTime: 0,
      dragAccuracy: 0,
      effectiveness: 0
    }
  },
  
  {
    id: 'preference_comparison',
    description: 'Compare ASI control vs direct control',
    expectedDuration: 10,
    successCriteria: [
      'User tries both control methods',
      'User expresses preference',
      'User explains reasoning'
    ],
    metrics: {
      timeInASIMode: 0,
      timeInDirectMode: 0,
      preferenceScore: 0,
      reasoningQuality: 0
    }
  }
];
```

#### Data Collection Framework
```typescript
class UserTestingCollector {
  private sessionData: Map<string, UserTestingSession> = new Map();
  private screenRecorder: ScreenRecorder;
  private interactionTracker: InteractionTracker;
  
  startSession(userId: string, testType: string): string {
    const sessionId = this.generateSessionId();
    
    const session: UserTestingSession = {
      sessionId,
      userId,
      testType: testType as any,
      duration: 0,
      tasks: [...USER_TESTING_SCENARIOS],
      metrics: this.initializeSessionMetrics(),
      feedback: this.initializeFeedback()
    };
    
    this.sessionData.set(sessionId, session);
    
    // Start recording
    this.screenRecorder.start(sessionId);
    this.interactionTracker.start(sessionId);
    
    return sessionId;
  }
  
  recordTaskCompletion(sessionId: string, taskId: string, metrics: TaskMetrics): void {
    const session = this.sessionData.get(sessionId);
    if (!session) return;
    
    const task = session.tasks.find(t => t.id === taskId);
    if (task) {
      task.metrics = metrics;
    }
  }
  
  recordInteraction(sessionId: string, interaction: UserInteraction): void {
    this.interactionTracker.recordEvent(sessionId, interaction);
  }
  
  recordFeedback(sessionId: string, feedback: UserFeedback): void {
    const session = this.sessionData.get(sessionId);
    if (session) {
      session.feedback = feedback;
    }
  }
  
  endSession(sessionId: string): UserTestingSession {
    const session = this.sessionData.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    // Stop recording
    this.screenRecorder.stop(sessionId);
    this.interactionTracker.stop(sessionId);
    
    // Calculate session metrics
    session.duration = this.calculateSessionDuration(session);
    session.metrics = this.calculateSessionMetrics(session);
    
    return session;
  }
}
```

### Phase 4: Performance Testing

#### Performance Metrics
```typescript
interface PerformanceMetrics {
  framerate: {
    average: number;
    minimum: number;
    maximum: number;
    drops: number; // Count of drops below 30fps
  };
  
  memory: {
    usage: number; // MB
    peak: number;
    leaks: number;
    gcFrequency: number;
  };
  
  loading: {
    initialLoad: number; // milliseconds
    assetLoad: number;
    sceneTransition: number;
  };
  
  responsiveness: {
    inputLag: number; // milliseconds
    uiUpdateLag: number;
    animationSmootness: number;
  };
}
```

#### Performance Testing Implementation
```typescript
class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private isMonitoring: boolean = false;
  private startTime: number = 0;
  
  startMonitoring(): void {
    this.isMonitoring = true;
    this.startTime = performance.now();
    this.initializeMetrics();
    this.setupMonitoringLoop();
  }
  
  private setupMonitoringLoop(): void {
    const monitor = () => {
      if (!this.isMonitoring) return;
      
      this.updateFramerateMetrics();
      this.updateMemoryMetrics();
      this.updateResponsivenessMetrics();
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }
  
  private updateFramerateMetrics(): void {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    const fps = 1000 / deltaTime;
    
    this.metrics.framerate.average = this.calculateRollingAverage(
      this.metrics.framerate.average,
      fps
    );
    
    this.metrics.framerate.minimum = Math.min(
      this.metrics.framerate.minimum,
      fps
    );
    
    this.metrics.framerate.maximum = Math.max(
      this.metrics.framerate.maximum,
      fps
    );
    
    if (fps < 30) {
      this.metrics.framerate.drops++;
    }
    
    this.lastFrameTime = now;
  }
  
  private updateMemoryMetrics(): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const currentUsage = memInfo.usedJSHeapSize / 1024 / 1024; // MB
      
      this.metrics.memory.usage = currentUsage;
      this.metrics.memory.peak = Math.max(
        this.metrics.memory.peak,
        currentUsage
      );
    }
  }
  
  measureInputLag(): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      // Simulate input processing
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const lag = endTime - startTime;
        
        this.metrics.responsiveness.inputLag = lag;
        resolve(lag);
      });
    });
  }
  
  getPerformanceReport(): PerformanceMetrics {
    return { ...this.metrics };
  }
}
```

### Phase 5: Analytics Collection

#### Analytics Events
```typescript
interface AnalyticsEvent {
  type: string;
  timestamp: number;
  userId: string;
  sessionId: string;
  data: any;
}

interface ASIAnalyticsEvents {
  'asi_guidance_given': {
    suggestionId: string;
    suggestionType: string;
    priority: string;
    trustLevel: number;
    context: string;
  };
  
  'jane_response': {
    guidanceId: string;
    followed: boolean;
    responseTime: number;
    trustChange: number;
    outcome: string;
  };
  
  'threat_detected': {
    threatId: string;
    threatType: string;
    severity: string;
    janeAware: boolean;
    distance: number;
  };
  
  'magic_cast': {
    symbolId: string;
    targetPosition: { x: number; y: number };
    success: boolean;
    trustLevel: number;
    effectDuration: number;
  };
  
  'session_preference': {
    preferredMode: 'asi' | 'direct';
    confidenceLevel: number;
    reasoningCategories: string[];
    totalTimeASI: number;
    totalTimeDirect: number;
  };
}
```

#### Analytics Implementation
```typescript
class ASIAnalytics {
  private events: AnalyticsEvent[] = [];
  private sessionStartTime: number = 0;
  private userId: string;
  private sessionId: string;
  
  constructor(userId: string, sessionId: string) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.sessionStartTime = Date.now();
  }
  
  trackEvent<T extends keyof ASIAnalyticsEvents>(
    type: T,
    data: ASIAnalyticsEvents[T]
  ): void {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      data
    };
    
    this.events.push(event);
    this.sendToAnalyticsService(event);
  }
  
  trackGuidanceGiven(suggestion: GuidanceSuggestion, trustLevel: number): void {
    this.trackEvent('asi_guidance_given', {
      suggestionId: suggestion.id,
      suggestionType: suggestion.type,
      priority: suggestion.priority,
      trustLevel,
      context: 'user_selected_guidance'
    });
  }
  
  trackJaneResponse(guidanceId: string, followed: boolean, trustChange: number): void {
    this.trackEvent('jane_response', {
      guidanceId,
      followed,
      responseTime: this.calculateResponseTime(guidanceId),
      trustChange,
      outcome: followed ? 'followed' : 'ignored'
    });
  }
  
  trackSessionPreference(preference: 'asi' | 'direct', confidence: number): void {
    const timeInASI = this.calculateTimeInMode('asi');
    const timeInDirect = this.calculateTimeInMode('direct');
    
    this.trackEvent('session_preference', {
      preferredMode: preference,
      confidenceLevel: confidence,
      reasoningCategories: this.extractReasoningCategories(),
      totalTimeASI: timeInASI,
      totalTimeDirect: timeInDirect
    });
  }
  
  generateReport(): AnalyticsReport {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.sessionStartTime,
      totalEvents: this.events.length,
      eventBreakdown: this.getEventBreakdown(),
      keyMetrics: this.calculateKeyMetrics(),
      userBehaviorPattern: this.analyzeUserBehavior()
    };
  }
  
  private sendToAnalyticsService(event: AnalyticsEvent): void {
    // Send to analytics backend
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
  }
  
  private calculateKeyMetrics(): KeyMetrics {
    const guidanceEvents = this.events.filter(e => e.type === 'asi_guidance_given');
    const responseEvents = this.events.filter(e => e.type === 'jane_response');
    
    const guidanceFollowRate = responseEvents.filter(e => e.data.followed).length / responseEvents.length;
    const averageTrustLevel = this.calculateAverageTrustLevel();
    const magicUsageRate = this.calculateMagicUsageRate();
    
    return {
      guidanceFollowRate,
      averageTrustLevel,
      magicUsageRate,
      sessionEngagement: this.calculateEngagementScore()
    };
  }
}
```

### Phase 6: Success Criteria Validation

#### Validation Framework
```typescript
interface SuccessCriteria {
  primary: {
    asiPreference: {
      target: 70; // 70% of users prefer ASI
      actual: number;
      achieved: boolean;
    };
    
    timeInASIMode: {
      target: 80; // 80% of time in ASI mode
      actual: number;
      achieved: boolean;
    };
    
    trustProgression: {
      target: 60; // Average trust level above 60
      actual: number;
      achieved: boolean;
    };
  };
  
  secondary: {
    magicUsage: {
      target: 60; // 60% of available magic actions used
      actual: number;
      achieved: boolean;
    };
    
    guidanceFollowRate: {
      target: 70; // 70% of guidance followed
      actual: number;
      achieved: boolean;
    };
    
    sessionSatisfaction: {
      target: 7; // Average satisfaction score above 7/10
      actual: number;
      achieved: boolean;
    };
  };
}
```

#### Validation Implementation
```typescript
class SuccessValidation {
  private criteria: SuccessCriteria;
  private analytics: ASIAnalytics;
  
  constructor(analytics: ASIAnalytics) {
    this.analytics = analytics;
    this.initializeCriteria();
  }
  
  validateCriteria(): ValidationResult {
    const reports = this.analytics.getAllReports();
    
    this.validatePrimaryCriteria(reports);
    this.validateSecondaryCriteria(reports);
    
    return {
      overallSuccess: this.calculateOverallSuccess(),
      primarySuccess: this.calculatePrimarySuccess(),
      secondarySuccess: this.calculateSecondarySuccess(),
      recommendations: this.generateRecommendations(),
      detailedResults: this.criteria
    };
  }
  
  private validatePrimaryCriteria(reports: AnalyticsReport[]): void {
    // ASI Preference validation
    const preferenceEvents = reports.flatMap(r => 
      r.events.filter(e => e.type === 'session_preference')
    );
    
    const asiPreferenceRate = preferenceEvents.filter(e => 
      e.data.preferredMode === 'asi'
    ).length / preferenceEvents.length * 100;
    
    this.criteria.primary.asiPreference.actual = asiPreferenceRate;
    this.criteria.primary.asiPreference.achieved = 
      asiPreferenceRate >= this.criteria.primary.asiPreference.target;
    
    // Time in ASI mode validation
    const avgTimeInASI = reports.reduce((sum, r) => 
      sum + r.keyMetrics.timeInASIMode, 0
    ) / reports.length;
    
    this.criteria.primary.timeInASIMode.actual = avgTimeInASI;
    this.criteria.primary.timeInASIMode.achieved = 
      avgTimeInASI >= this.criteria.primary.timeInASIMode.target;
    
    // Trust progression validation
    const avgTrustLevel = reports.reduce((sum, r) => 
      sum + r.keyMetrics.averageTrustLevel, 0
    ) / reports.length;
    
    this.criteria.primary.trustProgression.actual = avgTrustLevel;
    this.criteria.primary.trustProgression.achieved = 
      avgTrustLevel >= this.criteria.primary.trustProgression.target;
  }
  
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (!this.criteria.primary.asiPreference.achieved) {
      recommendations.push(
        'Improve ASI interface intuitiveness and immediate value demonstration'
      );
    }
    
    if (!this.criteria.primary.timeInASIMode.achieved) {
      recommendations.push(
        'Enhance ASI-only features and reduce direct control appeal'
      );
    }
    
    if (!this.criteria.primary.trustProgression.achieved) {
      recommendations.push(
        'Refine guidance accuracy and trust-building mechanisms'
      );
    }
    
    return recommendations;
  }
}
```

This comprehensive testing strategy ensures that the MVP ASI interface is thoroughly validated against its core objectives while providing actionable data for future improvements and iterations.
