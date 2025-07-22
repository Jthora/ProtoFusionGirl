// ASI Control Interface Type definitions
// This file contains all TypeScript interfaces and types for the ASI Control Interface implementation

export interface Vector2 {
  x: number;
  y: number;
}

export interface JaneState {
  position: Vector2;
  health: number;
  maxHealth: number;
  psi: number;
  maxPsi: number;
  emotionalState: EmotionalState;
  isMoving: boolean;
  isInCombat: boolean;
  currentAction: string | null;
  trustLevel: number;
  asiControlled: boolean;
}

export interface EmotionalState {
  confidence: number; // 0-100
  stress: number;     // 0-100
  curiosity: number;  // 0-100
  trust: number;      // 0-100
  fear: number;       // 0-100
}

export interface ThreatInfo {
  id: string;
  type: 'enemy' | 'environmental' | 'social' | 'temporal';
  position: Vector2;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timeToImpact: number;
  janeAware: boolean;
  description: string;
  suggestedAction?: string;
}

export interface GuidanceSuggestion {
  id: string;
  type: 'movement' | 'combat' | 'social' | 'magic' | 'environmental';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100 - how likely Jane is to follow this
  expectedOutcome: string;
  trustImpact: number; // -10 to +10 - how this affects trust if followed
  position?: Vector2; // target position if applicable
  targetId?: string; // target entity if applicable
}

export interface GuidanceContext {
  janeState: JaneState;
  nearbyThreats: ThreatInfo[];
  availableActions: string[];
  environmentalFactors: EnvironmentalFactor[];
  socialContext: SocialContext;
  missionContext?: MissionContext;
}

export interface EnvironmentalFactor {
  type: 'leyline' | 'hazard' | 'resource' | 'passage' | 'platform';
  position: Vector2;
  strength: number;
  accessible: boolean;
  janeAware: boolean;
}

export interface SocialContext {
  nearbyNPCs: NPCInfo[];
  relationships: RelationshipInfo[];
  reputation: FactionReputation[];
}

export interface NPCInfo {
  id: string;
  name: string;
  position: Vector2;
  relationship: number; // -100 to +100
  mood: string;
  intent: string;
  trustworthy: boolean;
  janeAware: boolean;
}

export interface RelationshipInfo {
  npcId: string;
  relationship: number;
  history: string[];
  influence: number;
}

export interface FactionReputation {
  factionId: string;
  reputation: number;
  standing: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';
}

export interface MissionContext {
  missionId: string;
  objectives: MissionObjective[];
  timeRemaining?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface MissionObjective {
  id: string;
  description: string;
  completed: boolean;
  progress: number;
  required: boolean;
}

export interface TrustState {
  currentLevel: number; // 0-100
  trend: 'increasing' | 'decreasing' | 'stable';
  lastChange: number;
  changeRate: number;
  recentEvents: TrustEvent[];
}

export interface TrustEvent {
  type: 'guidance_followed' | 'guidance_ignored' | 'success' | 'failure' | 'intervention';
  impact: number; // -10 to +10
  timestamp: number;
  context: string;
  guidanceId?: string;
}

export interface UniversalMagicSymbol {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  cooldown: number;
  available: boolean;
  category: 'elemental' | 'temporal' | 'spatial' | 'energy' | 'matter';
  effects: MagicEffect[];
  trustRequirement: number; // minimum trust level to use
}

export interface MagicEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'environmental' | 'utility';
  magnitude: number;
  duration: number;
  radius: number;
  targetType: 'self' | 'ally' | 'enemy' | 'environment' | 'area';
}

export interface MagicCombination {
  symbols: string[]; // symbol IDs
  name: string;
  description: string;
  energyCost: number;
  effects: MagicEffect[];
  discovered: boolean;
  trustRequirement: number;
}

export interface CommandCenterUIConfig {
  scene: Phaser.Scene;
  width: number;
  height: number;
  eventBus: any; // EventBus type
  playerManager: any; // PlayerManager type
  trustManager: any; // TrustManager instance
  threatDetector: any; // ThreatDetector instance
  guidanceEngine: any; // GuidanceEngine instance
}

export interface PanelConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: number;
  borderColor: number;
  borderWidth: number;
  borderRadius: number;
  alpha: number;
}

export interface OverlayLayer {
  id: string;
  name: string;
  visible: boolean;
  alpha: number;
  zIndex: number;
  color: number;
  asiOnly: boolean;
}

export interface GuidanceEngineConfig {
  scene: Phaser.Scene;
  eventBus: any;
  trustManager: any; // TrustManager instance
  threatDetector: any; // ThreatDetector instance
  contextUpdateInterval: number;
  maxSuggestions: number;
}

export interface TrustManagerConfig {
  eventBus: any;
  initialTrust: number;
  maxTrust: number;
  minTrust: number;
  decayRate: number;
  updateInterval: number;
}

export interface ThreatDetectorConfig {
  scene: Phaser.Scene;
  eventBus: any;
  detectionRadius: number;
  updateInterval: number;
  threatTypes: string[];
}

// Forward declarations for circular dependencies
export interface TrustManager {
  getTrustLevel(): number;
  getTrustState(): TrustState;
  handleGuidanceFollowed(event: any): void;
  handleGuidanceIgnored(event: any): void;
  handlePlayerSuccess(event: any): void;
  handlePlayerFailure(event: any): void;
  updateTrust(change: number, context: string): void;
}

export interface GuidanceEngine {
  getActiveSuggestions(): GuidanceSuggestion[];
  generateSuggestions(context: GuidanceContext): GuidanceSuggestion[];
  handleGuidanceSelection(suggestionId: string): void;
  updateContext(): void;
}

export interface ThreatDetector {
  getActiveThreats(): ThreatInfo[];
  updateThreat(threat: ThreatInfo): void;
  removeThreat(threatId: string): void;
  getThreatsInRadius(position: Vector2, radius: number): ThreatInfo[];
}

// Event types for ASI Control Interface
export interface ASIControlEvents {
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
    threat: ThreatInfo;
  };
  
  'THREAT_RESOLVED': {
    threatId: string;
    resolution: 'avoided' | 'handled' | 'ignored';
  };
  
  'MAGIC_CAST': {
    symbolId: string;
    combination?: string[];
    targetPosition: Vector2;
    success: boolean;
    trustLevel: number;
  };
  
  'GUIDANCE_SELECTED': {
    suggestion: GuidanceSuggestion;
    timestamp: number;
  };
  
  'COMMAND_CENTER_ACTIVATED': {
    timestamp: number;
    mode: 'full' | 'minimal';
  };
  
  'COMMAND_CENTER_DEACTIVATED': {
    timestamp: number;
    duration: number;
  };
  
  'ASI_MODE_CHANGED': {
    previousMode: string;
    newMode: string;
    timestamp: number;
  };
}

// Animation and UI types
export interface AnimationConfig {
  key: string;
  duration: number;
  ease: string;
  yoyo: boolean;
  repeat: number;
  delay: number;
}

export interface UITransition {
  type: 'fade' | 'slide' | 'scale' | 'rotate';
  duration: number;
  ease: string;
  from: any;
  to: any;
}

export interface ComponentState {
  visible: boolean;
  alpha: number;
  interactive: boolean;
  position: Vector2;
  scale: Vector2;
  rotation: number;
}

// Metrics and Analytics types
export interface SessionMetrics {
  startTime: number;
  endTime: number;
  totalPlayTime: number;
  asiModeTime: number;
  directControlTime: number;
  guidanceGiven: number;
  guidanceFollowed: number;
  trustLevelMax: number;
  trustLevelMin: number;
  trustLevelAverage: number;
  magicCasts: number;
  threatsDetected: number;
  threatsResolved: number;
  userSatisfaction?: number;
  userPreference?: 'asi' | 'direct' | 'mixed';
}

export interface ABTestGroup {
  id: string;
  name: string;
  description: string;
  features: string[];
  userCount: number;
  metrics: SessionMetrics[];
}

export interface UserFeedback {
  sessionId: string;
  userId?: string;
  timestamp: number;
  rating: number; // 1-10
  preference: 'asi' | 'direct' | 'mixed';
  comments: string;
  usabilityScore: number;
  enjoymentScore: number;
  powerFeelScore: number;
  difficultyScore: number;
}
