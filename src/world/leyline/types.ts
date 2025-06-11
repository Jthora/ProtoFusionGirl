// src/world/leyline/types.ts
// Shared types for ley lines and nodes
// See: artifacts/copilot_leyline_system_advanced_development_2025-06-07.artifact

export interface Vector2 {
  x: number;
  y: number;
}

export interface LeyLineNode {
  id: string;
  position: Vector2;
  state?: 'active' | 'inactive' | 'unstable';
  upgrades?: string[];
}

export interface LeyLine {
  id: string;
  nodes: LeyLineNode[];
  strength?: number;
  energy?: number;
  status?: 'stable' | 'unstable';
}

export interface LeyLineInstabilityEvent {
  id: string;
  type: 'LEYLINE_INSTABILITY' | 'LEYLINE_SURGE' | 'LEYLINE_DISRUPTION' | 'RIFT_FORMED';
  leyLineId: string;
  nodeId?: string;
  severity: 'minor' | 'moderate' | 'major';
  triggeredBy: 'simulation' | 'player' | 'environment' | 'narrative';
  timestamp: number;
  branchId?: string;
  data?: Record<string, any>;
}

// Re-export interfaces for compatibility with import { LeyLine } from ...
export { LeyLine, LeyLineNode, LeyLineInstabilityEvent, Vector2 };
