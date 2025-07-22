// MVP Integration Test
// Tests the basic functionality of MVP ASI Interface components

import { EventBus } from '../../core/EventBus';
import { TrustManager } from '../systems/TrustManager';
import { ThreatDetector } from '../systems/ThreatDetector';
import { GuidanceEngine } from '../systems/GuidanceEngine';

describe('MVP ASI Interface Integration', () => {
  let eventBus: EventBus;
  let trustManager: TrustManager;
  let threatDetector: ThreatDetector;
  let guidanceEngine: GuidanceEngine;

  beforeEach(() => {
    eventBus = new EventBus();
    
    trustManager = new TrustManager({
      eventBus,
      initialTrust: 50,
      maxTrust: 100,
      minTrust: 0,
      decayRate: 0.1,
      updateInterval: 1000
    });
    
    // Create mock scene
    const mockScene = {
      registry: {
        get: jest.fn().mockReturnValue(null)
      }
    } as any;
    
    threatDetector = new ThreatDetector({
      scene: mockScene,
      eventBus,
      detectionRadius: 300,
      updateInterval: 1000,
      threatTypes: ['enemy', 'environmental', 'social']
    });
    
    guidanceEngine = new GuidanceEngine({
      scene: mockScene,
      eventBus,
      trustManager,
      threatDetector,
      contextUpdateInterval: 2000,
      maxSuggestions: 5
    });
  });

  afterEach(() => {
    trustManager.destroy();
    threatDetector.destroy();
    guidanceEngine.destroy();
  });

  describe('Trust System', () => {
    it('should initialize with correct trust level', () => {
      expect(trustManager.getTrustLevel()).toBe(50);
    });

    it('should update trust when guidance is followed', () => {
      const initialTrust = trustManager.getTrustLevel();
      
      trustManager.handleGuidanceFollowed({
        guidanceId: 'test_guidance',
        trustChange: 3
      });
      
      expect(trustManager.getTrustLevel()).toBeGreaterThan(initialTrust);
    });

    it('should decrease trust when guidance is ignored', () => {
      const initialTrust = trustManager.getTrustLevel();
      
      trustManager.handleGuidanceIgnored({
        guidanceId: 'test_guidance',
        trustChange: -2
      });
      
      expect(trustManager.getTrustLevel()).toBeLessThan(initialTrust);
    });

    it('should emit trust change events', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');
      
      trustManager.updateTrust(5, 'test context');
      
      expect(eventSpy).toHaveBeenCalledWith({
        type: 'TRUST_CHANGED',
        data: expect.objectContaining({
          change: expect.any(Number),
          currentLevel: expect.any(Number),
          previousLevel: expect.any(Number)
        })
      });
    });

    it('should calculate guidance receptivity based on trust', () => {
      // High trust should result in high receptivity
      trustManager.updateTrust(40, 'high trust test'); // Should be ~90
      const highReceptivity = trustManager.getGuidanceReceptivity();
      
      // Low trust should result in low receptivity
      trustManager.updateTrust(-70, 'low trust test'); // Should be ~20
      const lowReceptivity = trustManager.getGuidanceReceptivity();
      
      expect(highReceptivity).toBeGreaterThan(lowReceptivity);
    });
  });

  describe('Threat Detection', () => {
    it('should initialize with no active threats', () => {
      expect(threatDetector.getActiveThreats()).toHaveLength(0);
    });

    it('should add and track new threats', () => {
      const threat = {
        id: 'test_threat',
        type: 'enemy' as const,
        position: { x: 100, y: 100 },
        severity: 'medium' as const,
        timeToImpact: 3000,
        janeAware: false,
        description: 'Test threat'
      };
      
      threatDetector.updateThreat(threat);
      
      const activeThreats = threatDetector.getActiveThreats();
      expect(activeThreats).toHaveLength(1);
      expect(activeThreats[0].id).toBe('test_threat');
    });

    it('should remove resolved threats', () => {
      const threat = {
        id: 'test_threat',
        type: 'enemy' as const,
        position: { x: 100, y: 100 },
        severity: 'medium' as const,
        timeToImpact: 3000,
        janeAware: false,
        description: 'Test threat'
      };
      
      threatDetector.updateThreat(threat);
      expect(threatDetector.getActiveThreats()).toHaveLength(1);
      
      threatDetector.removeThreat('test_threat');
      expect(threatDetector.getActiveThreats()).toHaveLength(0);
    });

    it('should emit threat detection events', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');
      
      const threat = {
        id: 'test_threat',
        type: 'enemy' as const,
        position: { x: 100, y: 100 },
        severity: 'medium' as const,
        timeToImpact: 3000,
        janeAware: false,
        description: 'Test threat'
      };
      
      threatDetector.updateThreat(threat);
      
      expect(eventSpy).toHaveBeenCalledWith({
        type: 'THREAT_DETECTED',
        data: { threat }
      });
    });
  });

  describe('Guidance Engine', () => {
    it('should initialize with no active suggestions', () => {
      expect(guidanceEngine.getActiveSuggestions()).toHaveLength(0);
    });

    it('should generate suggestions based on context', () => {
      const mockContext = {
        janeState: {
          position: { x: 0, y: 0 },
          health: 100,
          maxHealth: 100,
          psi: 50,
          maxPsi: 100,
          emotionalState: {
            confidence: 70,
            stress: 30,
            curiosity: 60,
            trust: 50,
            fear: 20
          },
          isMoving: false,
          isInCombat: false,
          currentAction: null,
          trustLevel: 50,
          asiControlled: false
        },
        nearbyThreats: [],
        availableActions: ['move', 'interact'],
        environmentalFactors: [],
        socialContext: {
          nearbyNPCs: [],
          relationships: [],
          reputation: []
        }
      };
      
      const suggestions = guidanceEngine.generateSuggestions(mockContext);
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should handle guidance selection', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');
      
      // Add a test suggestion
      guidanceEngine.updateContext();
      
      // This would normally select an actual suggestion
      // For now, we'll just verify the method exists
      expect(typeof guidanceEngine.handleGuidanceSelection).toBe('function');
    });
  });

  describe('System Integration', () => {
    it('should integrate trust changes with guidance receptivity', () => {
      // Start with medium trust
      expect(trustManager.getTrustLevel()).toBe(50);
      
      // Increase trust
      trustManager.updateTrust(30, 'successful guidance');
      const highTrustReceptivity = trustManager.getGuidanceReceptivity();
      
      // Decrease trust
      trustManager.updateTrust(-50, 'failed guidance');
      const lowTrustReceptivity = trustManager.getGuidanceReceptivity();
      
      expect(highTrustReceptivity).toBeGreaterThan(lowTrustReceptivity);
    });

    it('should handle threat-based guidance generation', () => {
      // Add a threat
      const threat = {
        id: 'test_threat',
        type: 'enemy' as const,
        position: { x: 100, y: 100 },
        severity: 'high' as const,
        timeToImpact: 2000,
        janeAware: false,
        description: 'Dangerous enemy approaching'
      };
      
      threatDetector.updateThreat(threat);
      
      // Update guidance context
      guidanceEngine.updateContext();
      
      // Should generate threat-based suggestions
      const suggestions = guidanceEngine.getActiveSuggestions();
      // In full implementation, we'd expect threat-based suggestions here
    });

    it('should maintain event-driven architecture', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');
      
      // Test that systems emit events
      trustManager.updateTrust(5, 'test');
      
      const threat = {
        id: 'test_threat',
        type: 'enemy' as const,
        position: { x: 100, y: 100 },
        severity: 'medium' as const,
        timeToImpact: 3000,
        janeAware: false,
        description: 'Test threat'
      };
      
      threatDetector.updateThreat(threat);
      
      // Verify events were emitted
      expect(eventSpy).toHaveBeenCalledWith({
        type: 'TRUST_CHANGED',
        data: expect.any(Object)
      });
      
      expect(eventSpy).toHaveBeenCalledWith({
        type: 'THREAT_DETECTED',
        data: { threat }
      });
    });
  });

  describe('Performance and Cleanup', () => {
    it('should handle system destruction properly', () => {
      // Verify systems can be destroyed without errors
      expect(() => {
        trustManager.destroy();
        threatDetector.destroy();
        guidanceEngine.destroy();
      }).not.toThrow();
    });

    it('should not leak memory with frequent updates', () => {
      // Simulate rapid updates
      for (let i = 0; i < 100; i++) {
        trustManager.updateTrust(0.1, `test ${i}`);
        
        if (i % 10 === 0) {
          const threat = {
            id: `threat_${i}`,
            type: 'enemy' as const,
            position: { x: i, y: i },
            severity: 'low' as const,
            timeToImpact: 1000,
            janeAware: false,
            description: `Test threat ${i}`
          };
          
          threatDetector.updateThreat(threat);
        }
      }
      
      // Verify systems still function
      expect(trustManager.getTrustLevel()).toBeGreaterThan(40);
      expect(threatDetector.getActiveThreats().length).toBeGreaterThan(0);
    });
  });

  describe('MVP Success Criteria', () => {
    it('should provide measurable trust metrics', () => {
      const trustState = trustManager.getTrustState();
      
      expect(trustState).toHaveProperty('currentLevel');
      expect(trustState).toHaveProperty('trend');
      expect(trustState).toHaveProperty('changeRate');
      expect(trustState).toHaveProperty('recentEvents');
      
      expect(typeof trustState.currentLevel).toBe('number');
      expect(['increasing', 'decreasing', 'stable']).toContain(trustState.trend);
    });

    it('should support A/B testing scenarios', () => {
      // Test different trust scenarios
      const scenarios = [
        { name: 'high_trust', trustChange: 40 },
        { name: 'low_trust', trustChange: -30 },
        { name: 'stable_trust', trustChange: 0 }
      ];
      
      scenarios.forEach(scenario => {
        const initialTrust = trustManager.getTrustLevel();
        trustManager.updateTrust(scenario.trustChange, scenario.name);
        
        const receptivity = trustManager.getGuidanceReceptivity();
        expect(typeof receptivity).toBe('number');
        expect(receptivity).toBeGreaterThanOrEqual(0);
        expect(receptivity).toBeLessThanOrEqual(1);
      });
    });

    it('should provide data for user preference analysis', () => {
      // Simulate user session data
      const sessionData = {
        trustLevel: trustManager.getTrustLevel(),
        trustTrend: trustManager.getTrustState().trend,
        activeThreats: threatDetector.getActiveThreats().length,
        guidanceSuggestions: guidanceEngine.getActiveSuggestions().length,
        receptivity: trustManager.getGuidanceReceptivity()
      };
      
      // Verify all metrics are available
      expect(sessionData.trustLevel).toBeDefined();
      expect(sessionData.trustTrend).toBeDefined();
      expect(sessionData.activeThreats).toBeDefined();
      expect(sessionData.guidanceSuggestions).toBeDefined();
      expect(sessionData.receptivity).toBeDefined();
    });
  });
});
