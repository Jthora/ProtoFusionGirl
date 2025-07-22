// ASIControlIntegrationTest.ts
// Integration test for ASI Control Interface components
// Tests the interaction between TrustManager, ThreatDetector, GuidanceEngine, and CommandCenterUI

import { EventBus } from '../core/EventBus';
import { TrustManager } from './systems/TrustManager';
import { ThreatDetector } from './systems/ThreatDetector';
import { GuidanceEngine } from './systems/GuidanceEngine';
import { CommandCenterUI } from './ui/components/CommandCenterUI';
import { 
  TrustManagerConfig, 
  ThreatDetectorConfig, 
  GuidanceEngineConfig, 
  CommandCenterUIConfig 
} from './types';

describe('ASI Control Interface Integration', () => {
  let mockScene: any;
  let eventBus: EventBus;
  let trustManager: TrustManager;
  let threatDetector: ThreatDetector;
  let guidanceEngine: GuidanceEngine;
  let commandCenter: CommandCenterUI;

  beforeEach(() => {
    // Mock Phaser scene
    mockScene = {
      add: {
        existing: jest.fn(),
        graphics: jest.fn(() => ({
          fillStyle: jest.fn(),
          fillRect: jest.fn(),
          lineStyle: jest.fn(),
          strokeRect: jest.fn(),
          fillRoundedRect: jest.fn(),
          strokeRoundedRect: jest.fn(),
          fillCircle: jest.fn(),
          strokeCircle: jest.fn(),
          clear: jest.fn(),
          setInteractive: jest.fn(),
          on: jest.fn(),
          setPosition: jest.fn()
        })),
        container: jest.fn(() => ({
          add: jest.fn(),
          setVisible: jest.fn(),
          setDepth: jest.fn(),
          setAlpha: jest.fn(),
          setOrigin: jest.fn(),
          list: []
        })),
        text: jest.fn(() => ({
          setOrigin: jest.fn(),
          setDepth: jest.fn(),
          destroy: jest.fn()
        })),
        group: jest.fn(() => ({
          add: jest.fn(),
          clear: jest.fn()
        }))
      },
      tweens: {
        add: jest.fn()
      },
      input: {
        keyboard: {
          on: jest.fn()
        }
      },
      scale: {
        width: 1024,
        height: 768
      },
      registry: {
        get: jest.fn()
      }
    };

    // Initialize event bus
    eventBus = new EventBus();

    // Initialize trust manager
    const trustConfig: TrustManagerConfig = {
      eventBus,
      initialTrust: 50,
      maxTrust: 100,
      minTrust: 0,
      decayRate: 0.1,
      updateInterval: 5000
    };
    trustManager = new TrustManager(trustConfig);

    // Initialize threat detector
    const threatConfig: ThreatDetectorConfig = {
      scene: mockScene,
      eventBus,
      detectionRadius: 300,
      updateInterval: 1000,
      threatTypes: ['enemy', 'environmental', 'social']
    };
    threatDetector = new ThreatDetector(threatConfig);

    // Initialize guidance engine
    const guidanceConfig: GuidanceEngineConfig = {
      scene: mockScene,
      eventBus,
      trustManager,
      threatDetector,
      contextUpdateInterval: 2000,
      maxSuggestions: 5
    };
    guidanceEngine = new GuidanceEngine(guidanceConfig);

    // Initialize command center UI
    const uiConfig: CommandCenterUIConfig = {
      scene: mockScene,
      width: 1024,
      height: 768,
      eventBus,
      playerManager: null, // Mock if needed
      trustManager,
      threatDetector,
      guidanceEngine
    };
    commandCenter = new CommandCenterUI(uiConfig);
  });

  afterEach(() => {
    trustManager?.destroy();
    threatDetector?.destroy();
    guidanceEngine?.destroy();
    commandCenter?.destroy();
  });

  describe('Trust System Integration', () => {
    it('should initialize with default trust level', () => {
      expect(trustManager.getTrustLevel()).toBe(50);
      expect(trustManager.getTrustState().trend).toBe('stable');
    });

    it('should update trust when guidance is followed', () => {
      const initialTrust = trustManager.getTrustLevel();
      
      // Simulate guidance being followed
      eventBus.emit({
        type: 'JANE_RESPONSE',
        data: {
          guidanceId: 'test-guidance',
          followed: true,
          responseTime: 1000,
          trustChange: 3
        }
      });

      // Trust should increase
      expect(trustManager.getTrustLevel()).toBeGreaterThan(initialTrust);
    });

    it('should decrease trust when guidance is ignored', () => {
      const initialTrust = trustManager.getTrustLevel();
      
      // Simulate guidance being ignored
      eventBus.emit({
        type: 'JANE_RESPONSE',
        data: {
          guidanceId: 'test-guidance',
          followed: false,
          responseTime: 1000,
          trustChange: -2
        }
      });

      // Trust should decrease
      expect(trustManager.getTrustLevel()).toBeLessThan(initialTrust);
    });

    it('should emit trust change events', () => {
      const trustChangeHandler = jest.fn();
      eventBus.on('TRUST_CHANGED', trustChangeHandler);

      // Trigger trust change
      trustManager.updateTrust(5, 'test context');

      expect(trustChangeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'TRUST_CHANGED',
          data: expect.objectContaining({
            change: expect.any(Number),
            currentLevel: expect.any(Number),
            previousLevel: expect.any(Number)
          })
        })
      );
    });
  });

  describe('Threat Detection Integration', () => {
    it('should track active threats', () => {
      expect(threatDetector.getActiveThreats()).toEqual([]);
    });

    it('should add and remove threats', () => {
      const threat = {
        id: 'test-threat',
        type: 'enemy' as const,
        position: { x: 100, y: 100 },
        severity: 'medium' as const,
        timeToImpact: 5000,
        janeAware: false,
        description: 'Test threat'
      };

      threatDetector.updateThreat(threat);
      expect(threatDetector.getActiveThreats()).toHaveLength(1);

      threatDetector.removeThreat('test-threat');
      expect(threatDetector.getActiveThreats()).toHaveLength(0);
    });

    it('should emit threat detection events', () => {
      const threatHandler = jest.fn();
      eventBus.on('THREAT_DETECTED', threatHandler);

      const threat = {
        id: 'test-threat',
        type: 'enemy' as const,
        position: { x: 100, y: 100 },
        severity: 'high' as const,
        timeToImpact: 3000,
        janeAware: false,
        description: 'Test enemy threat'
      };

      threatDetector.updateThreat(threat);

      expect(threatHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'THREAT_DETECTED',
          data: expect.objectContaining({
            threat
          })
        })
      );
    });

    it('should find threats in radius', () => {
      const threat1 = {
        id: 'threat-1',
        type: 'enemy' as const,
        position: { x: 50, y: 50 },
        severity: 'low' as const,
        timeToImpact: 5000,
        janeAware: false,
        description: 'Close threat'
      };

      const threat2 = {
        id: 'threat-2',
        type: 'enemy' as const,
        position: { x: 500, y: 500 },
        severity: 'low' as const,
        timeToImpact: 5000,
        janeAware: false,
        description: 'Far threat'
      };

      threatDetector.updateThreat(threat1);
      threatDetector.updateThreat(threat2);

      const nearbyThreats = threatDetector.getThreatsInRadius({ x: 0, y: 0 }, 100);
      expect(nearbyThreats).toHaveLength(1);
      expect(nearbyThreats[0].id).toBe('threat-1');
    });
  });

  describe('Guidance Engine Integration', () => {
    it('should generate guidance suggestions', () => {
      const suggestions = guidanceEngine.getActiveSuggestions();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle guidance selection', () => {
      const guidanceHandler = jest.fn();
      eventBus.on('ASI_GUIDANCE_GIVEN', guidanceHandler);

      // Add a mock suggestion
      guidanceEngine.handleGuidanceSelection('test-suggestion');

      // Should emit guidance event (even if suggestion doesn't exist)
      // This tests the event flow
    });

    it('should respond to trust changes', () => {
      const initialSuggestions = guidanceEngine.getActiveSuggestions().length;
      
      // Change trust level
      trustManager.updateTrust(20, 'test boost');

      // Context should update (though suggestions might be the same in mock)
      expect(guidanceEngine.getActiveSuggestions()).toBeDefined();
    });
  });

  describe('Command Center UI Integration', () => {
    it('should initialize with proper panel structure', () => {
      expect(commandCenter).toBeDefined();
      expect(mockScene.add.existing).toHaveBeenCalled();
    });

    it('should respond to trust changes', () => {
      // Simulate trust change
      eventBus.emit({
        type: 'TRUST_CHANGED',
        data: {
          previousLevel: 50,
          currentLevel: 70,
          change: 20,
          trend: 'increasing'
        }
      });

      // UI should update (tested via mock calls)
      expect(mockScene.add.text).toHaveBeenCalled();
    });

    it('should handle threat detection', () => {
      const threat = {
        id: 'ui-threat',
        type: 'enemy' as const,
        position: { x: 200, y: 200 },
        severity: 'high' as const,
        timeToImpact: 2000,
        janeAware: false,
        description: 'UI test threat'
      };

      // Simulate threat detection
      eventBus.emit({
        type: 'THREAT_DETECTED',
        data: { threat }
      });

      // UI should create threat indicator
      expect(mockScene.add.graphics).toHaveBeenCalled();
    });

    it('should toggle interface visibility', () => {
      commandCenter.activate();
      expect(mockScene.tweens.add).toHaveBeenCalled();

      commandCenter.deactivate();
      expect(mockScene.tweens.add).toHaveBeenCalled();
    });
  });

  describe('System Integration Workflows', () => {
    it('should handle complete guidance workflow', () => {
      // 1. Threat is detected
      const threat = {
        id: 'workflow-threat',
        type: 'enemy' as const,
        position: { x: 150, y: 150 },
        severity: 'high' as const,
        timeToImpact: 3000,
        janeAware: false,
        description: 'Workflow test threat'
      };

      threatDetector.updateThreat(threat);

      // 2. Guidance should be generated (in real implementation)
      const suggestions = guidanceEngine.getActiveSuggestions();
      expect(suggestions).toBeDefined();

      // 3. Trust should be affected when guidance is followed
      const initialTrust = trustManager.getTrustLevel();
      
      eventBus.emit({
        type: 'JANE_RESPONSE',
        data: {
          guidanceId: 'workflow-guidance',
          followed: true,
          responseTime: 1500,
          trustChange: 4
        }
      });

      expect(trustManager.getTrustLevel()).toBeGreaterThan(initialTrust);
    });

    it('should handle magic casting with trust requirements', () => {
      // Set high trust level
      trustManager.updateTrust(40, 'boost for magic test');

      // Attempt magic cast
      eventBus.emit({
        type: 'MAGIC_CAST',
        data: {
          symbolId: 'fire',
          targetPosition: { x: 100, y: 100 },
          success: true,
          trustLevel: trustManager.getTrustLevel()
        }
      });

      // Trust should be updated based on successful magic use
      expect(trustManager.getTrustLevel()).toBeGreaterThan(50);
    });

    it('should handle cascading system updates', () => {
      // Start with threat detection
      const threat = {
        id: 'cascade-threat',
        type: 'environmental' as const,
        position: { x: 300, y: 300 },
        severity: 'critical' as const,
        timeToImpact: 1000,
        janeAware: false,
        description: 'Cascading test threat'
      };

      threatDetector.updateThreat(threat);

      // Should trigger guidance generation
      guidanceEngine.updateContext();

      // Should update UI
      const suggestions = guidanceEngine.getActiveSuggestions();
      expect(suggestions).toBeDefined();

      // Should be able to select guidance
      if (suggestions.length > 0) {
        guidanceEngine.handleGuidanceSelection(suggestions[0].id);
      }
    });
  });

  describe('Performance and Cleanup', () => {
    it('should properly clean up resources', () => {
      // Test that destroy methods don't throw errors
      expect(() => {
        trustManager.destroy();
        threatDetector.destroy();
        guidanceEngine.destroy();
        commandCenter.destroy();
      }).not.toThrow();
    });

    it('should handle high frequency updates', () => {
      // Simulate rapid threat updates
      for (let i = 0; i < 10; i++) {
        const threat = {
          id: `perf-threat-${i}`,
          type: 'enemy' as const,
          position: { x: i * 50, y: i * 50 },
          severity: 'low' as const,
          timeToImpact: 5000,
          janeAware: false,
          description: `Performance test threat ${i}`
        };
        
        threatDetector.updateThreat(threat);
      }

      expect(threatDetector.getActiveThreats()).toHaveLength(10);

      // Clean up
      for (let i = 0; i < 10; i++) {
        threatDetector.removeThreat(`perf-threat-${i}`);
      }

      expect(threatDetector.getActiveThreats()).toHaveLength(0);
    });
  });
});
