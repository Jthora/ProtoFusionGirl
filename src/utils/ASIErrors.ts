/**
 * ProtoFusionGirl - ASI Control Interface Error Definitions
 * 
 * This file contains detailed error definitions for all ASI Control Interface
 * systems including Trust System, Command Center, Information Asymmetry,
 * Universal Magic Integration, and Ley Line System.
 */

import { ErrorCategory, ErrorSeverity, GameError, PlayerImpactLevel } from './ErrorLogger';

export const ASI_ERRORS: Record<string, Omit<GameError, 'timestamp'>> = {
  // === ASI COMMUNICATION ERRORS ===
  ASI_CONNECTION_LOST: {
    id: 'ASI_CONNECTION_LOST',
    category: ErrorCategory.ASI_COMMUNICATION,
    severity: ErrorSeverity.HIGH,
    message: 'ASI Communication Channel Disconnected',
    details: 'The connection between Jane and the ASI Control Interface has been interrupted',
    solution: 'The system will attempt automatic reconnection. If this persists, check your network connection and refresh the game.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.MAJOR,
    subErrors: [
      {
        id: 'ASI_HANDSHAKE_FAILED',
        category: ErrorCategory.ASI_COMMUNICATION,
        severity: ErrorSeverity.MEDIUM,
        message: 'ASI Handshake Protocol Failed',
        details: 'Initial authentication between player and ASI failed',
        solution: 'Attempting automatic re-authentication...',
        timestamp: 0
      },
      {
        id: 'ASI_PROTOCOL_MISMATCH',
        category: ErrorCategory.ASI_COMMUNICATION,
        severity: ErrorSeverity.MEDIUM,
        message: 'ASI Protocol Version Mismatch',
        details: 'Client and ASI are using incompatible communication protocols',
        solution: 'Update the game to the latest version for protocol compatibility',
        timestamp: 0
      }
    ]
  },

  ASI_BANDWIDTH_EXCEEDED: {
    id: 'ASI_BANDWIDTH_EXCEEDED',
    category: ErrorCategory.ASI_COMMUNICATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'ASI Communication Bandwidth Exceeded',
    details: 'Too many commands sent to ASI simultaneously, causing communication buffer overflow',
    solution: 'The ASI is processing commands more slowly to prevent overload. Consider spacing out complex actions.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.MODERATE
  },

  // === TRUST SYSTEM ERRORS ===
  TRUST_CALIBRATION_FAILED: {
    id: 'TRUST_CALIBRATION_FAILED',
    category: ErrorCategory.TRUST_SYSTEM,
    severity: ErrorSeverity.HIGH,
    message: 'Trust System Calibration Failed',
    details: 'Unable to establish baseline trust metrics between player and ASI',
    solution: 'Complete the trust calibration sequence in the Command Center. This helps Jane understand your decision-making patterns.',
    autoRecoverable: false,
    playerImpact: PlayerImpactLevel.MAJOR,
    subErrors: [
      {
        id: 'TRUST_METRICS_CORRUPTED',
        category: ErrorCategory.TRUST_SYSTEM,
        severity: ErrorSeverity.MEDIUM,
        message: 'Trust Metrics Data Corrupted',
        details: 'Stored trust relationship data has become corrupted or inconsistent',
        solution: 'Trust metrics will be recalibrated based on recent interactions',
        timestamp: 0
      },
      {
        id: 'TRUST_ALGORITHM_ERROR',
        category: ErrorCategory.TRUST_SYSTEM,
        severity: ErrorSeverity.HIGH,
        message: 'Trust Calculation Algorithm Error',
        details: 'Error in trust evaluation algorithm preventing accurate trust assessment',
        solution: 'System will use fallback trust evaluation methods',
        timestamp: 0
      }
    ]
  },

  TRUST_BREACH_DETECTED: {
    id: 'TRUST_BREACH_DETECTED',
    category: ErrorCategory.TRUST_SYSTEM,
    severity: ErrorSeverity.CRITICAL,
    message: 'Trust Relationship Breach Detected',
    details: 'Significant inconsistency detected between player actions and established trust patterns',
    solution: 'This may indicate account compromise or unusual behavior. Complete identity verification in the Command Center.',
    autoRecoverable: false,
    playerImpact: PlayerImpactLevel.CRITICAL
  },

  TRUST_ASYMMETRY_WARNING: {
    id: 'TRUST_ASYMMETRY_WARNING',
    category: ErrorCategory.TRUST_SYSTEM,
    severity: ErrorSeverity.MEDIUM,
    message: 'Trust Asymmetry Detected',
    details: 'Player and ASI have significantly different trust levels, which may affect collaboration',
    solution: 'Consider engaging in collaborative activities to build mutual trust. Jane suggests exploring together or working on shared objectives.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.MINOR
  },

  // === COMMAND CENTER ERRORS ===
  COMMAND_CENTER_OFFLINE: {
    id: 'COMMAND_CENTER_OFFLINE',
    category: ErrorCategory.COMMAND_CENTER,
    severity: ErrorSeverity.CRITICAL,
    message: 'Command Center Interface Offline',
    details: 'The primary ASI Command Center interface is not responding',
    solution: 'Attempting to establish emergency command protocols. Some ASI features will be limited until full restoration.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.CRITICAL,
    subErrors: [
      {
        id: 'COMMAND_PROCESSING_OVERLOAD',
        category: ErrorCategory.COMMAND_CENTER,
        severity: ErrorSeverity.HIGH,
        message: 'Command Processing Overload',
        details: 'Command center is processing too many simultaneous requests',
        solution: 'System will queue commands and process them sequentially',
        timestamp: 0
      },
      {
        id: 'COMMAND_AUTHORIZATION_FAILURE',
        category: ErrorCategory.COMMAND_CENTER,
        severity: ErrorSeverity.HIGH,
        message: 'Command Authorization Failure',
        details: 'Unable to verify authorization for command execution',
        solution: 'Re-authenticate through the trust system interface',
        timestamp: 0
      }
    ]
  },

  COMMAND_QUEUE_OVERFLOW: {
    id: 'COMMAND_QUEUE_OVERFLOW',
    category: ErrorCategory.COMMAND_CENTER,
    severity: ErrorSeverity.MEDIUM,
    message: 'Command Queue Overflow',
    details: 'Too many commands queued for execution, some may be delayed or dropped',
    solution: 'The ASI will prioritize critical commands. Consider simplifying complex multi-step actions.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.MODERATE
  },

  // === INFORMATION ASYMMETRY ERRORS ===
  INFORMATION_DESYNC: {
    id: 'INFORMATION_DESYNC',
    category: ErrorCategory.INFORMATION_ASYMMETRY,
    severity: ErrorSeverity.HIGH,
    message: 'Information Asymmetry Desynchronization',
    details: 'Player and ASI information states have diverged beyond acceptable parameters',
    solution: 'Initiating information synchronization protocol. Some game actions may be temporarily limited.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.MAJOR,
    subErrors: [
      {
        id: 'PLAYER_KNOWLEDGE_OVERFLOW',
        category: ErrorCategory.INFORMATION_ASYMMETRY,
        severity: ErrorSeverity.MEDIUM,
        message: 'Player Knowledge State Overflow',
        details: 'Player has accessed information beyond current ASI awareness threshold',
        solution: 'ASI is updating knowledge base to maintain proper information balance',
        timestamp: 0
      },
      {
        id: 'ASI_KNOWLEDGE_LEAK',
        category: ErrorCategory.INFORMATION_ASYMMETRY,
        severity: ErrorSeverity.HIGH,
        message: 'ASI Knowledge Leak Detected',
        details: 'ASI inadvertently revealed information beyond intended disclosure level',
        solution: 'Implementing information containment protocols and adjusting disclosure algorithms',
        timestamp: 0
      }
    ]
  },

  INFORMATION_COMPARTMENT_BREACH: {
    id: 'INFORMATION_COMPARTMENT_BREACH',
    category: ErrorCategory.INFORMATION_ASYMMETRY,
    severity: ErrorSeverity.CRITICAL,
    message: 'Information Compartment Security Breach',
    details: 'Unauthorized access to restricted information compartments detected',
    solution: 'Security protocols activated. Information access will be temporarily restricted while investigating the breach.',
    autoRecoverable: false,
    playerImpact: PlayerImpactLevel.CRITICAL
  },

  // === UNIVERSAL MAGIC ERRORS ===
  UNIVERSAL_MAGIC_INSTABILITY: {
    id: 'UNIVERSAL_MAGIC_INSTABILITY',
    category: ErrorCategory.UNIVERSAL_MAGIC,
    severity: ErrorSeverity.HIGH,
    message: 'Universal Magic System Instability',
    details: 'Fluctuations in Universal Language processing causing spell casting inconsistencies',
    solution: 'Magic system will operate in safe mode. Complex spells may have reduced effectiveness until stability is restored.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.MAJOR,
    subErrors: [
      {
        id: 'SYMBOL_PARSING_ERROR',
        category: ErrorCategory.UNIVERSAL_MAGIC,
        severity: ErrorSeverity.MEDIUM,
        message: 'Universal Symbol Parsing Error',
        details: 'Error interpreting Universal Language symbols in spell construction',
        solution: 'Using fallback symbol interpretation algorithms',
        timestamp: 0
      },
      {
        id: 'HARMONIC_FREQUENCY_DRIFT',
        category: ErrorCategory.UNIVERSAL_MAGIC,
        severity: ErrorSeverity.MEDIUM,
        message: 'Harmonic Frequency Drift Detected',
        details: 'Universal Language harmonic frequencies are drifting from calibrated values',
        solution: 'Recalibrating harmonic resonance chambers',
        timestamp: 0
      }
    ]
  },

  SPELL_COMPILATION_FAILED: {
    id: 'SPELL_COMPILATION_FAILED',
    category: ErrorCategory.UNIVERSAL_MAGIC,
    severity: ErrorSeverity.MEDIUM,
    message: 'Spell Compilation Failed',
    details: 'Unable to compile Universal Language symbols into executable magical effect',
    solution: 'Check spell syntax and ensure all required symbols are properly aligned. Jane can provide spell construction guidance.',
    autoRecoverable: false,
    playerImpact: PlayerImpactLevel.MODERATE
  },

  MAGIC_OVERFLOW_WARNING: {
    id: 'MAGIC_OVERFLOW_WARNING',
    category: ErrorCategory.UNIVERSAL_MAGIC,
    severity: ErrorSeverity.MEDIUM,
    message: 'Magic System Overflow Warning',
    details: 'Magical energy levels approaching maximum safe threshold',
    solution: 'Allow magical energy to dissipate before casting additional spells. Jane recommends focusing magical energy through meditation.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.MINOR
  },

  // === LEY LINE SYSTEM ERRORS ===
  LEYLINE_NETWORK_DISRUPTION: {
    id: 'LEYLINE_NETWORK_DISRUPTION',
    category: ErrorCategory.LEYLINE_SYSTEM,
    severity: ErrorSeverity.HIGH,
    message: 'Ley Line Network Disruption',
    details: 'Major disruption detected in the ley line network affecting magical and dimensional stability',
    solution: 'Ley line stabilization protocol initiated. Avoid major magical operations until network stability is restored.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.MAJOR,
    subErrors: [
      {
        id: 'LEYLINE_NODE_FAILURE',
        category: ErrorCategory.LEYLINE_SYSTEM,
        severity: ErrorSeverity.HIGH,
        message: 'Ley Line Node Failure',
        details: 'Critical ley line intersection node has failed or become corrupted',
        solution: 'Rerouting ley line energy through alternate pathways',
        timestamp: 0
      },
      {
        id: 'DIMENSIONAL_INTERFERENCE',
        category: ErrorCategory.LEYLINE_SYSTEM,
        severity: ErrorSeverity.MEDIUM,
        message: 'Dimensional Interference Detected',
        details: 'External dimensional forces interfering with ley line stability',
        solution: 'Deploying dimensional shielding around critical ley line segments',
        timestamp: 0
      }
    ]
  },

  LEYLINE_RESONANCE_CASCADE: {
    id: 'LEYLINE_RESONANCE_CASCADE',
    category: ErrorCategory.LEYLINE_SYSTEM,
    severity: ErrorSeverity.CRITICAL,
    message: 'Ley Line Resonance Cascade Detected',
    details: 'Dangerous resonance cascade building in ley line network - immediate intervention required',
    solution: 'Emergency ley line damping protocols activated. All magical activities are temporarily suspended for safety.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.CRITICAL
  },

  // === MULTIVERSE STATE ERRORS ===
  MULTIVERSE_COHERENCE_LOSS: {
    id: 'MULTIVERSE_COHERENCE_LOSS',
    category: ErrorCategory.MULTIVERSE_STATE,
    severity: ErrorSeverity.CRITICAL,
    message: 'Multiverse Coherence Loss Detected',
    details: 'Coherence between multiverse branches has degraded below safe operational thresholds',
    solution: 'Multiverse stabilization protocols engaged. Timeline jumping and dimensional travel are temporarily restricted.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.CRITICAL,
    subErrors: [
      {
        id: 'TIMELINE_BRANCH_COLLISION',
        category: ErrorCategory.MULTIVERSE_STATE,
        severity: ErrorSeverity.HIGH,
        message: 'Timeline Branch Collision',
        details: 'Two or more timeline branches are converging in an unstable manner',
        solution: 'Implementing timeline separation protocols',
        timestamp: 0
      },
      {
        id: 'CAUSALITY_LOOP_DETECTED',
        category: ErrorCategory.MULTIVERSE_STATE,
        severity: ErrorSeverity.HIGH,
        message: 'Causality Loop Detected',
        details: 'Temporal causality loop creating paradoxical multiverse state',
        solution: 'Analyzing causality chain and implementing temporal correction measures',
        timestamp: 0
      }
    ]
  },

  DIMENSIONAL_ANCHOR_FAILURE: {
    id: 'DIMENSIONAL_ANCHOR_FAILURE',
    category: ErrorCategory.MULTIVERSE_STATE,
    severity: ErrorSeverity.HIGH,
    message: 'Dimensional Anchor System Failure',
    details: 'Primary dimensional anchors maintaining multiverse position have failed',
    solution: 'Deploying emergency dimensional anchors. Avoid major dimensional transitions until primary anchors are restored.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.MAJOR
  },

  // === PROCEDURAL GENERATION ERRORS ===
  PROCEDURAL_GENERATION_OVERFLOW: {
    id: 'PROCEDURAL_GENERATION_OVERFLOW',
    category: ErrorCategory.PROCEDURAL_GENERATION,
    severity: ErrorSeverity.HIGH,
    message: 'Procedural Generation System Overflow',
    details: 'Procedural content generation system is overloaded and cannot process all requested content',
    solution: 'Reducing procedural generation complexity and implementing content streaming to manage load.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.MODERATE,
    subErrors: [
      {
        id: 'AI_GENERATION_TIMEOUT',
        category: ErrorCategory.PROCEDURAL_GENERATION,
        severity: ErrorSeverity.MEDIUM,
        message: 'AI Content Generation Timeout',
        details: 'AI systems took too long to generate requested procedural content',
        solution: 'Using cached content and simplified generation algorithms',
        timestamp: 0
      },
      {
        id: 'CONTENT_VALIDATION_FAILURE',
        category: ErrorCategory.PROCEDURAL_GENERATION,
        severity: ErrorSeverity.MEDIUM,
        message: 'Generated Content Validation Failure',
        details: 'Procedurally generated content failed quality validation checks',
        solution: 'Regenerating content with stricter quality parameters',
        timestamp: 0
      }
    ]
  },

  PROCEDURAL_COHERENCE_ERROR: {
    id: 'PROCEDURAL_COHERENCE_ERROR',
    category: ErrorCategory.PROCEDURAL_GENERATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Procedural Content Coherence Error',
    details: 'Generated content is inconsistent with established game world rules and lore',
    solution: 'Content will be regenerated with enhanced lore consistency checks. Jane will verify new content aligns with multiverse rules.',
    autoRecoverable: true,
    playerImpact: PlayerImpactLevel.MINOR
  }
};

/**
 * Enhanced error reporting for ASI systems with context
 */
export function createASIError(
  errorId: keyof typeof ASI_ERRORS,
  additionalContext?: any,
  trustLevel?: number,
  multiverseCoherence?: number
): GameError {
  const baseError = ASI_ERRORS[errorId];
  if (!baseError) {
    throw new Error(`Unknown ASI error ID: ${errorId}`);
  }

  return {
    ...baseError,
    timestamp: Date.now(),
    context: additionalContext,
    asiContext: {
      trustLevel,
      multiverseCoherence,
      playerFrustrationLevel: undefined // Will be calculated by ErrorLogger
    }
  };
}

/**
 * Get all ASI errors by category
 */
export function getASIErrorsByCategory(category: ErrorCategory): Array<Omit<GameError, 'timestamp'>> {
  return Object.values(ASI_ERRORS).filter(error => error.category === category);
}

/**
 * Check if an error is ASI-related
 */
export function isASIError(error: GameError): boolean {
  const asiCategories = [
    ErrorCategory.ASI_COMMUNICATION,
    ErrorCategory.TRUST_SYSTEM,
    ErrorCategory.COMMAND_CENTER,
    ErrorCategory.INFORMATION_ASYMMETRY,
    ErrorCategory.UNIVERSAL_MAGIC,
    ErrorCategory.LEYLINE_SYSTEM,
    ErrorCategory.MULTIVERSE_STATE,
    ErrorCategory.PROCEDURAL_GENERATION
  ];

  return asiCategories.includes(error.category);
}
