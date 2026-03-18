# Integration Guide for MVP ASI Interface

## Overview

This guide provides detailed instructions for integrating the MVP ASI interface with the existing ProtoFusionGirl codebase. The integration follows a modular approach that extends existing systems while maintaining backward compatibility.

## Integration Architecture

### System Dependencies

```typescript
// Integration dependency graph
interface IntegrationDependencies {
  core: {
    EventBus: '../core/EventBus';
    PlayerManager: '../core/PlayerManager';
    UIManager: '../core/UIManager';
    Jane: '../core/Jane';
  };
  
  world: {
    ASIController: '../world/asi/ASIController';
    PlayerController: '../world/player/PlayerController';
  };
  
  ui: {
    components: '../ui/components';
    AgentOptimizedUI: '../ui/AgentOptimizedUI';
  };
  
  mvp: {
    TrustManager: './mvp/systems/TrustManager';
    GuidanceEngine: './mvp/systems/GuidanceEngine';
    CommandCenterUI: './mvp/ui/components/CommandCenterUI';
  };
}
```

## Addendum: Implemented MVP slice wiring (current repo)

This codebase already includes a minimal end-to-end MVP slice. Key integration points:

- CommandCenterUI
  - Emits GUIDANCE_SELECTED for trust pipeline and ASI_GUIDANCE_GIVEN for immediate action when the user clicks in world space.
  - Maintains a map of threat indicators keyed by threat id; draws severity color and TTI arc; updates and removes on resolve.

- GameScene
  - Subscribes to ASI_GUIDANCE_GIVEN and uses Arcade Physics moveTo to guide Jane or the MagnetoSpeeder toward the world target. Draws a cyan path line that fades.
  - Subscribes to THREAT_DETECTED and triggers a Shield Window slow-mo bubble for imminent critical threats if trust >= emergency threshold; enforces a cooldown.
  - Preserves world streaming and spawn systems (dynamic ground level, chunk loader, unified gravity via WorldPhysics).

- ThreatDetector
  - Emits THREAT_DETECTED/RESOLVED with stable ids; UI halos track these ids to keep indicators consistent.

Compatibility notes:
- EventBus payloads for threat events should include a unique id and time-to-impact (TTI) seconds. The UI guards against minor shape variance but consistency is preferred.
- Trust gating reads from TrustManager emergency/override thresholds. Ensure these values are exported or accessible where the Shield Window logic runs.

- Config constants are centralized in `src/asiControl/config.ts` (arrival epsilon, guidance timeout, shield timings, and trust threshold name). Prefer using these over hard-coded literals.

Next integration tasks:
- Emit GUIDANCE_FOLLOWED / GUIDANCE_IGNORED upon arrival/timeout and route to TrustManager.
- Expose and document Shield Window constants (imminence threshold, slow factor, duration, cooldown) under a config module.
- Wire a minimal “Shield Window” chip in the Command Center status panel to reflect active/cooldown/trust states (now present).
- Centralize path draw and cleanup in a small GuidanceViz helper for reuse and testing.

## Phase 1: Core System Extensions

### 1. EventBus Integration

**File**: `src/core/EventBus.ts`

Add MVP-specific event types:

```typescript
// Add to existing EventTypes interface
interface EventTypes {
  // ... existing events
  
  // MVP ASI Events
  'ASI_GUIDANCE_GIVEN': {
    suggestion: GuidanceSuggestion;
    context: GuidanceContext;
  };
  
  'JANE_RESPONSE': {
    guidanceId: string;
    followed: boolean;
    responseTime: number;
    trustChange: number;
  };
  
  'TRUST_CHANGED': {
    previousLevel: number;
    currentLevel: number;
    change: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  
  'THREAT_DETECTED': {
    threatId: string;
    type: 'enemy' | 'environmental' | 'social';
    position: { x: number; y: number };
    severity: 'low' | 'medium' | 'high';
    janeAware: boolean;
  };
  
  'MAGIC_CAST': {
    symbolId: string;
    targetPosition: { x: number; y: number };
    success: boolean;
    trustLevel: number;
  };
  
  'GUIDANCE_SELECTED': {
    suggestion: GuidanceSuggestion;
    timestamp: number;
  };
}
```

### 2. PlayerManager Extensions

**File**: `src/core/PlayerManager.ts`

Add MVP system integration:

```typescript
// Add imports
import { TrustManager } from '../mvp/systems/TrustManager';
import { GuidanceEngine } from '../mvp/systems/GuidanceEngine';
import { ThreatDetector } from '../mvp/systems/ThreatDetector';
import { JaneAI } from '../mvp/systems/JaneAI';

// Add to PlayerManager class
export class PlayerManager {
  // ... existing properties
  
  // MVP Systems
  private trustManager: TrustManager | undefined;
  private guidanceEngine: GuidanceEngine | undefined;
  private threatDetector: ThreatDetector | undefined;
  private janeAI: JaneAI | undefined;
  private mvpEnabled: boolean = false;
  
  // ... existing methods
  
  // Add MVP initialization
  initializeMVP(): void {
    if (this.mvpEnabled) return;
    
    // Initialize MVP systems
    this.trustManager = new TrustManager(this.eventBus);
    this.threatDetector = new ThreatDetector(this.scene, this.eventBus);
    this.guidanceEngine = new GuidanceEngine(
      this.scene,
      this.eventBus,
      this.trustManager,
      this.threatDetector
    );
    this.janeAI = new JaneAI(this.scene, this.eventBus, this.trustManager);
    
    // Set up MVP event handlers
    this.setupMVPEventHandlers();
    
    this.mvpEnabled = true;
    
    // Emit MVP initialization event
    this.eventBus.emit({
      type: 'MVP_INITIALIZED',
      data: { timestamp: Date.now() }
    });
  }
  
  private setupMVPEventHandlers(): void {
    // Handle guidance selection
    this.eventBus.on('GUIDANCE_SELECTED', (event) => {
      this.guidanceEngine?.handleGuidanceSelection(event.data.suggestion.id);
    });
    
    // Handle Jane's ASI override requests
    this.eventBus.on('JANE_ASI_OVERRIDE', (event) => {
      if (event.data.enabled) {
        this.enableASIOverride();
      } else {
        this.disableASIOverride();
      }
    });
  }
  
  private enableASIOverride(): void {
    // Switch to ASI control mode
    this.setJaneASIOverride(true);
    
    // Update UI to show ASI control
    this.eventBus.emit({
      type: 'ASI_CONTROL_ENABLED',
      data: { timestamp: Date.now() }
    });
  }
  
  private disableASIOverride(): void {
    // Switch back to Jane control
    this.setJaneASIOverride(false);
    
    // Update UI to show Jane control
    this.eventBus.emit({
      type: 'ASI_CONTROL_DISABLED',
      data: { timestamp: Date.now() }
    });
  }
  
  // MVP system accessors
  getTrustManager(): TrustManager | undefined {
    return this.trustManager;
  }
  
  getGuidanceEngine(): GuidanceEngine | undefined {
    return this.guidanceEngine;
  }
  
  getThreatDetector(): ThreatDetector | undefined {
    return this.threatDetector;
  }
  
  getJaneAI(): JaneAI | undefined {
    return this.janeAI;
  }
  
  isMVPEnabled(): boolean {
    return this.mvpEnabled;
  }
}
```

### 3. UIManager Extensions

**File**: `src/core/UIManager.ts`

Add CommandCenterUI integration:

```typescript
// Add imports
import { CommandCenterUI } from '../mvp/ui/components/CommandCenterUI';
import { TrustManager } from '../mvp/systems/TrustManager';

// Add to UIManager class
export class UIManager {
  // ... existing properties
  
  // MVP UI Components
  private commandCenterUI: CommandCenterUI | undefined;
  private mvpUIEnabled: boolean = false;
  
  // ... existing methods
  
  // Add MVP UI initialization
  initializeMVPUI(playerManager: PlayerManager): void {
    if (this.mvpUIEnabled || !playerManager.isMVPEnabled()) return;
    
    // Create CommandCenterUI
    this.commandCenterUI = new CommandCenterUI({
      scene: this.scene,
      width: this.scene.scale.width,
      height: this.scene.scale.height,
      eventBus: this.eventBus,
      playerManager: playerManager
    });
    
    // Initially hidden - will be shown when ASI control is enabled
    this.commandCenterUI.setVisible(false);
    
    // Set up MVP UI event handlers
    this.setupMVPUIEventHandlers();
    
    this.mvpUIEnabled = true;
    
    // Emit MVP UI initialization event
    this.eventBus.emit({
      type: 'MVP_UI_INITIALIZED',
      data: { timestamp: Date.now() }
    });
  }
  
  private setupMVPUIEventHandlers(): void {
    // Show/hide CommandCenterUI based on ASI control state
    this.eventBus.on('ASI_CONTROL_ENABLED', () => {
      this.showCommandCenterUI();
    });
    
    this.eventBus.on('ASI_CONTROL_DISABLED', () => {
      this.hideCommandCenterUI();
    });
    
    // Handle trust visualization updates
    this.eventBus.on('TRUST_CHANGED', (event) => {
      this.updateTrustVisualization(event.data);
    });
    
    // Handle threat detection updates
    this.eventBus.on('THREAT_DETECTED', (event) => {
      this.updateThreatVisualization(event.data);
    });
  }
  
  private showCommandCenterUI(): void {
    if (this.commandCenterUI) {
      this.commandCenterUI.setVisible(true);
      this.commandCenterUI.fadeIn();
    }
  }
  
  private hideCommandCenterUI(): void {
    if (this.commandCenterUI) {
      this.commandCenterUI.fadeOut(() => {
        this.commandCenterUI?.setVisible(false);
      });
    }
  }
  
  private updateTrustVisualization(trustData: any): void {
    // Update trust-related UI components
    this.commandCenterUI?.updateTrustDisplay(trustData);
  }
  
  private updateThreatVisualization(threatData: any): void {
    // Update threat-related UI components
    this.commandCenterUI?.updateThreatDisplay(threatData);
  }
  
  // MVP UI accessors
  getCommandCenterUI(): CommandCenterUI | undefined {
    return this.commandCenterUI;
  }
  
  isMVPUIEnabled(): boolean {
    return this.mvpUIEnabled;
  }
}
```

### 4. ASIController Extensions

**File**: `src/world/asi/ASIController.ts`

Add MVP system integration:

```typescript
// Add imports
import { TrustManager } from '../../mvp/systems/TrustManager';
import { GuidanceEngine } from '../../mvp/systems/GuidanceEngine';

// Add to ASIController class
export class ASIController {
  // ... existing properties
  
  // MVP system references
  private trustManager: TrustManager | undefined;
  private guidanceEngine: GuidanceEngine | undefined;
  
  // ... existing methods
  
  // Add MVP integration
  integrateWithMVP(playerManager: PlayerManager): void {
    this.trustManager = playerManager.getTrustManager();
    this.guidanceEngine = playerManager.getGuidanceEngine();
    
    // Set up MVP event handlers
    this.setupMVPIntegration();
  }
  
  private setupMVPIntegration(): void {
    // Handle guidance requests
    this.eventBus.on('ASI_GUIDANCE_REQUESTED', (event) => {
      this.handleGuidanceRequest(event.data);
    });
    
    // Handle trust-based ASI behavior
    this.eventBus.on('TRUST_CHANGED', (event) => {
      this.adjustASIBehavior(event.data);
    });
  }
  
  private handleGuidanceRequest(requestData: any): void {
    // Process guidance request through ASI logic
    const context = this.analyzeCurrentContext();
    const recommendation = this.generateRecommendation(context);
    
    // Emit guidance recommendation
    this.eventBus.emit({
      type: 'ASI_GUIDANCE_RECOMMENDATION',
      data: {
        recommendation,
        context,
        timestamp: Date.now()
      }
    });
  }
  
  private adjustASIBehavior(trustData: any): void {
    // Adjust ASI behavior based on trust level
    if (trustData.currentLevel > 75) {
      // High trust - more proactive behavior
      this.setASIAggressiveness(0.8);
    } else if (trustData.currentLevel < 25) {
      // Low trust - more conservative behavior
      this.setASIAggressiveness(0.3);
    } else {
      // Medium trust - balanced behavior
      this.setASIAggressiveness(0.5);
    }
  }
  
  private setASIAggressiveness(level: number): void {
    // Adjust ASI intervention frequency and intensity
    this.interventionThreshold = 1.0 - level;
    this.suggestionFrequency = level * 2.0;
  }
  
  // Enhanced intervention with MVP integration
  intervene(target: 'jane' | 'robot', action: string, params?: any): void {
    // Call existing intervention logic
    super.intervene(target, action, params);
    
    // Add MVP-specific intervention tracking
    if (this.trustManager) {
      this.eventBus.emit({
        type: 'ASI_INTERVENTION_TRACKED',
        data: {
          target,
          action,
          params,
          trustLevel: this.trustManager.getTrustLevel(),
          timestamp: Date.now()
        }
      });
    }
  }
}
```

## Phase 2: GameScene Integration

### GameScene Modifications

**File**: `src/scenes/GameScene.ts`

Add MVP initialization to GameScene:

```typescript
// Add imports
import { PlayerManager } from '../core/PlayerManager';
import { UIManager } from '../core/UIManager';

// Add to GameScene class
export class GameScene extends Phaser.Scene {
  // ... existing properties
  
  // MVP initialization flag
  private mvpInitialized: boolean = false;
  
  // ... existing methods
  
  create(): void {
    // ... existing create logic
    
    // Initialize MVP systems after core systems are ready
    this.initializeMVP();
    
    // ... rest of create logic
  }
  
  private initializeMVP(): void {
    if (this.mvpInitialized) return;
    
    // Initialize MVP systems in PlayerManager
    this.playerManager.initializeMVP();
    
    // Initialize MVP UI in UIManager
    this.uiManager.initializeMVPUI(this.playerManager);
    
    // Integrate ASI controller with MVP
    const asiController = this.playerManager.getASIController();
    if (asiController) {
      asiController.integrateWithMVP(this.playerManager);
    }
    
    // Set up MVP scene event handlers
    this.setupMVPEventHandlers();
    
    this.mvpInitialized = true;
    
    console.log('MVP ASI Interface initialized');
  }
  
  private setupMVPEventHandlers(): void {
    // Handle ASI control toggle (Q key)
    this.input.keyboard?.on('keydown-Q', () => {
      const current = this.playerManager.isJaneASIControlled();
      this.playerManager.setJaneASIOverride(!current);
      
      // Visual feedback
      this.uiManager.showFeedback(
        current ? 'ASI Control Disabled' : 'ASI Control Enabled'
      );
    });
    
    // Handle guidance hotkeys (1-4)
    this.input.keyboard?.on('keydown-ONE', () => {
      this.selectGuidanceSuggestion(0);
    });
    
    this.input.keyboard?.on('keydown-TWO', () => {
      this.selectGuidanceSuggestion(1);
    });
    
    this.input.keyboard?.on('keydown-THREE', () => {
      this.selectGuidanceSuggestion(2);
    });
    
    this.input.keyboard?.on('keydown-FOUR', () => {
      this.selectGuidanceSuggestion(3);
    });
  }
  
  private selectGuidanceSuggestion(index: number): void {
    const guidanceEngine = this.playerManager.getGuidanceEngine();
    if (!guidanceEngine) return;
    
    const suggestions = guidanceEngine.getActiveSuggestions();
    if (suggestions.length > index) {
      this.eventBus.emit({
        type: 'GUIDANCE_SELECTED',
        data: {
          suggestion: suggestions[index],
          timestamp: Date.now()
        }
      });
    }
  }
  
  update(time: number, delta: number): void {
    // ... existing update logic
    
    // Update MVP systems
    this.updateMVPSystems(delta);
  }
  
  private updateMVPSystems(delta: number): void {
    // MVP systems handle their own updates through event loops
    // This is a placeholder for any scene-level MVP updates
    
    // Example: Update threat detection visualization
    const threatDetector = this.playerManager.getThreatDetector();
    if (threatDetector) {
      // threatDetector.updateVisualization(delta);
    }
  }
}
```

## Phase 3: Configuration Integration

### Configuration Management

**File**: `src/mvp/config/MVPConfig.ts`

Create centralized MVP configuration:

```typescript
export interface MVPConfiguration {
  enabled: boolean;
  features: {
    trustSystem: boolean;
    guidanceEngine: boolean;
    threatDetection: boolean;
    magicSystem: boolean;
    analytics: boolean;
  };
  
  ui: {
    commandCenterEnabled: boolean;
    trustMeterVisible: boolean;
    threatOverlaysVisible: boolean;
    guidancePanelVisible: boolean;
    magicPaletteVisible: boolean;
  };
  
  gameplay: {
    trustStartLevel: number;
    trustGainRate: number;
    trustLossRate: number;
    guidanceFrequency: number;
    threatDetectionRadius: number;
    magicCooldownRate: number;
  };
  
  performance: {
    maxThreatOverlays: number;
    updateFrequency: number;
    renderOptimization: boolean;
  };
  
  testing: {
    abTestingEnabled: boolean;
    analyticsEnabled: boolean;
    debugMode: boolean;
  };
}

export const DEFAULT_MVP_CONFIG: MVPConfiguration = {
  enabled: true,
  features: {
    trustSystem: true,
    guidanceEngine: true,
    threatDetection: true,
    magicSystem: true,
    analytics: true
  },
  ui: {
    commandCenterEnabled: true,
    trustMeterVisible: true,
    threatOverlaysVisible: true,
    guidancePanelVisible: true,
    magicPaletteVisible: true
  },
  gameplay: {
    trustStartLevel: 50,
    trustGainRate: 1.0,
    trustLossRate: 1.0,
    guidanceFrequency: 1.0,
    threatDetectionRadius: 300,
    magicCooldownRate: 1.0
  },
  performance: {
    maxThreatOverlays: 20,
    updateFrequency: 500,
    renderOptimization: true
  },
  testing: {
    abTestingEnabled: false,
    analyticsEnabled: true,
    debugMode: false
  }
};
```

### Environment-Specific Configuration

**File**: `src/mvp/config/environments.ts`

```typescript
import { MVPConfiguration } from './MVPConfig';

export const DEVELOPMENT_CONFIG: Partial<MVPConfiguration> = {
  testing: {
    abTestingEnabled: true,
    analyticsEnabled: true,
    debugMode: true
  },
  gameplay: {
    trustStartLevel: 70, // Start higher for easier testing
    guidanceFrequency: 2.0, // More frequent for testing
  }
};

export const PRODUCTION_CONFIG: Partial<MVPConfiguration> = {
  testing: {
    abTestingEnabled: true,
    analyticsEnabled: true,
    debugMode: false
  },
  performance: {
    renderOptimization: true,
    updateFrequency: 1000 // Less frequent updates in production
  }
};

export const TESTING_CONFIG: Partial<MVPConfiguration> = {
  features: {
    analytics: false // Disable analytics during automated testing
  },
  testing: {
    abTestingEnabled: false,
    analyticsEnabled: false,
    debugMode: true
  }
};
```

## Phase 4: Asset Integration

### Asset Management

**File**: `src/mvp/assets/AssetManager.ts`

```typescript
export class MVPAssetManager {
  private scene: Phaser.Scene;
  private assetsLoaded: boolean = false;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  preloadAssets(): void {
    // UI Assets
    this.scene.load.image('trust-meter-bg', 'assets/mvp/ui/trust-meter-bg.png');
    this.scene.load.image('trust-meter-fill', 'assets/mvp/ui/trust-meter-fill.png');
    this.scene.load.image('panel-bg', 'assets/mvp/ui/panel-bg.png');
    this.scene.load.image('button-bg', 'assets/mvp/ui/button-bg.png');
    
    // Magic Symbols
    this.scene.load.image('magic-symbol-1', 'assets/mvp/magic/symbol-1.png');
    this.scene.load.image('magic-symbol-2', 'assets/mvp/magic/symbol-2.png');
    this.scene.load.image('magic-symbol-3', 'assets/mvp/magic/symbol-3.png');
    this.scene.load.image('magic-symbol-4', 'assets/mvp/magic/symbol-4.png');
    
    // Threat Indicators
    this.scene.load.image('threat-indicator-low', 'assets/mvp/threats/indicator-low.png');
    this.scene.load.image('threat-indicator-medium', 'assets/mvp/threats/indicator-medium.png');
    this.scene.load.image('threat-indicator-high', 'assets/mvp/threats/indicator-high.png');
    
    // Audio Assets
    this.scene.load.audio('guidance-success', 'assets/mvp/audio/guidance-success.wav');
    this.scene.load.audio('guidance-ignored', 'assets/mvp/audio/guidance-ignored.wav');
    this.scene.load.audio('trust-increase', 'assets/mvp/audio/trust-increase.wav');
    this.scene.load.audio('trust-decrease', 'assets/mvp/audio/trust-decrease.wav');
    this.scene.load.audio('threat-detected', 'assets/mvp/audio/threat-detected.wav');
    this.scene.load.audio('magic-cast', 'assets/mvp/audio/magic-cast.wav');
    
    // Particle Effects
    this.scene.load.image('particle-trust', 'assets/mvp/particles/trust-particle.png');
    this.scene.load.image('particle-magic', 'assets/mvp/particles/magic-particle.png');
    this.scene.load.image('particle-threat', 'assets/mvp/particles/threat-particle.png');
  }
  
  createAssets(): void {
    if (this.assetsLoaded) return;
    
    // Create particle emitters
    this.createParticleEmitters();
    
    // Create audio manager
    this.createAudioManager();
    
    // Create animation presets
    this.createAnimationPresets();
    
    this.assetsLoaded = true;
  }
  
  private createParticleEmitters(): void {
    // Trust particles
    this.scene.add.particles('particle-trust', {
      x: 0,
      y: 0,
      lifespan: 1000,
      speed: { min: 50, max: 100 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      emitting: false
    });
    
    // Magic particles
    this.scene.add.particles('particle-magic', {
      x: 0,
      y: 0,
      lifespan: 2000,
      speed: { min: 100, max: 200 },
      scale: { start: 0.8, end: 0.2 },
      alpha: { start: 1, end: 0 },
      emitting: false
    });
  }
  
  private createAudioManager(): void {
    // Set up audio groups for better management
    this.scene.sound.add('guidance-success', { volume: 0.3 });
    this.scene.sound.add('guidance-ignored', { volume: 0.2 });
    this.scene.sound.add('trust-increase', { volume: 0.4 });
    this.scene.sound.add('trust-decrease', { volume: 0.3 });
    this.scene.sound.add('threat-detected', { volume: 0.5 });
    this.scene.sound.add('magic-cast', { volume: 0.4 });
  }
  
  private createAnimationPresets(): void {
    // Trust meter animations
    this.scene.anims.create({
      key: 'trust-increase',
      frames: this.scene.anims.generateFrameNumbers('trust-meter-fill', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0
    });
    
    // Threat indicator animations
    this.scene.anims.create({
      key: 'threat-pulse',
      frames: this.scene.anims.generateFrameNumbers('threat-indicator-high', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
  }
}
```

## Phase 5: Testing Integration

### Test Configuration

**File**: `src/mvp/testing/TestSetup.ts`

```typescript
import { MVPConfiguration, DEFAULT_MVP_CONFIG } from '../config/MVPConfig';

export class MVPTestSetup {
  private static testConfig: MVPConfiguration;
  
  static initializeTestEnvironment(): void {
    this.testConfig = {
      ...DEFAULT_MVP_CONFIG,
      testing: {
        abTestingEnabled: false,
        analyticsEnabled: false,
        debugMode: true
      },
      performance: {
        ...DEFAULT_MVP_CONFIG.performance,
        updateFrequency: 100 // Faster updates for testing
      }
    };
  }
  
  static getTestConfiguration(): MVPConfiguration {
    return this.testConfig;
  }
  
  static createMockScene(): Phaser.Scene {
    // Create mock scene for testing
    return {
      add: {
        existing: jest.fn(),
        text: jest.fn(),
        graphics: jest.fn(),
        container: jest.fn(),
        rectangle: jest.fn(),
        particles: jest.fn()
      },
      time: {
        addEvent: jest.fn()
      },
      physics: {
        add: {
          sprite: jest.fn()
        }
      },
      anims: {
        create: jest.fn(),
        generateFrameNumbers: jest.fn()
      },
      sound: {
        add: jest.fn(),
        play: jest.fn()
      },
      scale: {
        width: 1920,
        height: 1080
      }
    } as any;
  }
  
  static createMockEventBus(): EventBus {
    return {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      once: jest.fn()
    } as any;
  }
}
```

## Phase 6: Deployment Integration

### Build Configuration

**File**: `webpack.config.js` (modifications)

```javascript
// Add MVP-specific build configuration
module.exports = {
  // ... existing configuration
  
  resolve: {
    alias: {
      // ... existing aliases
      '@mvp': path.resolve(__dirname, 'src/mvp'),
      '@mvp-assets': path.resolve(__dirname, 'assets/mvp')
    }
  },
  
  plugins: [
    // ... existing plugins
    
    new webpack.DefinePlugin({
      'process.env.MVP_ENABLED': JSON.stringify(process.env.MVP_ENABLED || 'true'),
      'process.env.MVP_DEBUG': JSON.stringify(process.env.MVP_DEBUG || 'false')
    })
  ]
};
```

### Environment Variables

**File**: `.env.development`

```bash
# MVP Configuration
MVP_ENABLED=true
MVP_DEBUG=true
MVP_ANALYTICS=true
MVP_AB_TESTING=true

# MVP Performance
MVP_UPDATE_FREQUENCY=500
MVP_MAX_THREATS=20
MVP_RENDER_OPTIMIZATION=false
```

**File**: `.env.production`

```bash
# MVP Configuration
MVP_ENABLED=true
MVP_DEBUG=false
MVP_ANALYTICS=true
MVP_AB_TESTING=true

# MVP Performance
MVP_UPDATE_FREQUENCY=1000
MVP_MAX_THREATS=15
MVP_RENDER_OPTIMIZATION=true
```

## Integration Checklist

### Pre-Integration
- [ ] Backup current codebase
- [ ] Create integration branch
- [ ] Review dependency requirements
- [ ] Set up test environment

### Core Integration
- [ ] Extend EventBus with MVP events
- [ ] Integrate TrustManager with PlayerManager
- [ ] Add GuidanceEngine to PlayerManager
- [ ] Extend UIManager with CommandCenterUI
- [ ] Integrate ASIController with MVP systems

### Scene Integration
- [ ] Add MVP initialization to GameScene
- [ ] Set up MVP event handlers in GameScene
- [ ] Add keyboard shortcuts for MVP controls
- [ ] Test MVP systems in GameScene

### Asset Integration
- [ ] Add MVP asset loading
- [ ] Create MVP asset manager
- [ ] Set up MVP audio system
- [ ] Add MVP particle effects

### Testing Integration
- [ ] Set up MVP test environment
- [ ] Create MVP test utilities
- [ ] Add MVP-specific test cases
- [ ] Verify integration tests pass

### Deployment Integration
- [ ] Update build configuration
- [ ] Set up environment variables
- [ ] Add MVP feature flags
- [ ] Create deployment scripts

### Post-Integration
- [ ] Conduct integration testing
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Documentation updates

## Troubleshooting Common Issues

### Performance Issues
- Reduce update frequencies in production
- Implement object pooling for overlays
- Use efficient rendering techniques
- Monitor memory usage

### Integration Conflicts
- Check for event name collisions
- Verify system initialization order
- Ensure proper cleanup on scene transitions
- Test with existing save files

### UI Layout Issues
- Test responsive design across screen sizes
- Verify touch interaction compatibility
- Check accessibility compliance
- Validate color contrast ratios

### Audio/Visual Issues
- Verify asset loading order
- Check audio format compatibility
- Test particle effect performance
- Validate animation timing

This integration guide provides a comprehensive approach to successfully incorporating the MVP ASI interface into the existing ProtoFusionGirl codebase while maintaining system stability and performance.
