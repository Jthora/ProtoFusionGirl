// WorldStateManager.ts
// Central authority for persistent, cross-functional world state in ProtoFusionGirl
// See: world_state_system_design_2025-06-04.artifact, world_state_data_model_2025-06-04.artifact
// See: artifacts/copilot_leyline_unification_plan_2025-06-07.artifact
// See: artifacts/test_system_traceability_2025-06-08.artifact
import { EventBus } from '../core/EventBus';
import { GameEvent } from '../core/EventTypes';
import Ajv from 'ajv';
import { ulEventBus } from '../ul/ulEventBus';
import { LeyLine } from './leyline/types';
import { LeyLineSystem } from '../leyline/LeyLineSystem';

// --- State Domain Interfaces ---
// (LeyLineNode and LeyLine are now imported from shared types)

export interface Rift {
  id: string;
  position: { x: number; y: number };
  status: 'open' | 'closed' | 'stabilizing';
  threatLevel: number;
}

export interface PlayerState {
  id: string;
  name: string;
  position: { x: number; y: number };
  inventory: Record<string, number>;
  progression: string[];
  stats: Record<string, number>;
}

export interface EconomyState {
  resources: Record<string, number>;
  marketPrices: Record<string, number>;
  scarcity: Record<string, number>;
}

export interface MetaState {
  online: boolean;
  aiAgents: string[];
  mods: string[];
}

export interface TechLevelState {
  playerTechLevel: TechLevelId;
  factionTechLevel: TechLevelId;
  unlocks: string[];
}

// Extend WorldState to include techLevelState
export interface WorldState {
  version: number;
  leyLines: LeyLine[];
  rifts: Rift[];
  players: PlayerState[];
  economy: EconomyState;
  events: GameEvent[];
  meta: MetaState;
  techLevelState?: TechLevelState;
}

// --- Tech Level Integration (artifact-driven) ---
export type TechLevelId = 'neolithic' | 'cyber' | 'spacer' | 'holo' | string;

// --- WorldState JSON Schema (permissive for nested/array types) ---
const worldStateSchema = {
  type: 'object',
  properties: {
    version: { type: 'number' },
    leyLines: { type: 'array', items: { type: 'object' } },
    rifts: { type: 'array', items: { type: 'object' } },
    players: { type: 'array', items: { type: 'object' } },
    economy: { type: 'object' },
    events: { type: 'array', items: { type: 'object' } },
    meta: { type: 'object' }
  },
  required: ['version', 'leyLines', 'rifts', 'players', 'economy', 'events', 'meta'],
  additionalProperties: false
};

const ajv = new Ajv();
const validateWorldState = ajv.compile(worldStateSchema);

// --- WorldStateManager ---
export class WorldStateManager {
  private state: WorldState;
  private eventBus: EventBus;
  public leyLineSystem: LeyLineSystem; // Canonical API for graph queries

  constructor(initialState: WorldState, eventBus: EventBus) {
    this.state = initialState;
    this.eventBus = eventBus;
    this.leyLineSystem = new LeyLineSystem();
    // Sync leyLineSystem nodes/lines with state
    if (this.state.leyLines && this.state.leyLines.length > 0) {
      for (const leyLine of this.state.leyLines) {
        // Add nodes, defaulting state if missing, and update canonical state
        for (const node of leyLine.nodes) {
          if (node.state === undefined) node.state = 'inactive';
          this.leyLineSystem.addNode({ ...node, state: node.state as 'active' | 'inactive' | 'unstable' });
        }
        // Add lines between consecutive nodes for test coverage (simple chain)
        for (let i = 0; i < leyLine.nodes.length - 1; i++) {
          this.leyLineSystem.addLine({
            id: `${leyLine.id}_L${i}`,
            nodes: [leyLine.nodes[i].id, leyLine.nodes[i + 1].id],
            strength: leyLine.strength ?? 100
          });
        }
      }
    }
    // Optionally add lines if needed
    // Cross-system integration: Listen for UL puzzle completion
    ulEventBus.on('ul:puzzle:completed', (payload) => {
      if (payload && typeof payload.id === 'string') {
        // Example: unlock area, activate ley line, change environment
        // TODO: Map puzzle IDs to world/environment effects
        console.log(`[UL] WorldStateManager: Puzzle completed: ${payload.id}`);
        // Example stub: unlock a ley line if puzzle ID matches
        if (payload.id.startsWith('leyline_')) {
          const leyLineId = payload.id.replace('leyline_', '');
          const leyLine = this.state.leyLines.find(l => l.id === leyLineId);
          if (leyLine) {
            leyLine.nodes.forEach(n => n.state = 'active');
          }
        }
        // Add more mappings as needed for rifts, weather, etc.
      }
    });
  }

  getState(): WorldState {
    return this.state;
  }

  // Permission check stub (expand as needed)
  private hasPermission(_action: string, _userId?: string): boolean {
    // TODO: Implement real permission logic
    return true;
  }

  updateState(patch: Partial<WorldState>, userId?: string): void {
    if (!this.hasPermission('updateState', userId)) {
      throw new Error('Permission denied');
    }
    const newState = { ...this.state, ...patch };
    if (!validateWorldState(newState)) {
      throw new Error('WorldState validation failed: ' + JSON.stringify(validateWorldState.errors));
    }
    this.state = newState;
    this.eventBus.emit({
      type: 'STATE_UPDATED',
      data: { state: patch }
    });
  }

  // Serialization
  save(): string {
    return JSON.stringify(this.state);
  }

  load(json: string): void {
    const loaded = JSON.parse(json);
    // Versioning/migration stub
    if (loaded.version !== this.state.version) {
      // TODO: Implement migration logic
      // For now, just accept if schema matches
    }
    // Migrate legacy nodes with 'active' to 'state'
    if (Array.isArray(loaded.leyLines)) {
      loaded.leyLines = loaded.leyLines.map((l: any) => ({
        ...l,
        nodes: l.nodes.map((n: any) => {
          let state: 'active' | 'inactive' | 'unstable' = n.state ?? 'inactive';
          if (n.active === true) state = 'active';
          if (n.active === false) state = 'inactive';
          return {
            id: n.id,
            position: n.position,
            state,
            upgrades: n.upgrades,
          };
        }),
      }));
    }
    if (!validateWorldState(loaded)) {
      throw new Error('Loaded WorldState validation failed: ' + JSON.stringify(validateWorldState.errors));
    }
    this.state = loaded as unknown as WorldState;
  }

  /**
   * Handle a ley line instability event: mark ley line or node as 'unstable', persist, and broadcast.
   * Artifact: leyline_instability_event_design_2025-06-08.artifact
   * Artifact: leyline_instability_event_integration_points_2025-06-08.artifact
   */
  handleLeyLineInstability(event: import('./leyline/types').LeyLineInstabilityEvent, userId?: string) {
    const leyLine = this.state.leyLines.find(l => l.id === event.leyLineId);
    if (leyLine) {
      if (event.nodeId) {
        const node = leyLine.nodes.find(n => n.id === event.nodeId);
        if (node) {
          node.state = 'unstable';
          // Also update the node in leyLineSystem
          const sysNode = this.leyLineSystem.getNodeById(node.id);
          if (sysNode) sysNode.state = 'unstable';
        }
        // --- Propagate to connected nodes if severity is major or escalation ---
        if (event.severity === 'major' && node) {
          if (this.leyLineSystem && this.leyLineSystem.getConnectedNodes) {
            const connected = this.leyLineSystem.getConnectedNodes(node.id);
            for (const neighbor of connected) {
              if (neighbor.state !== 'unstable') {
                neighbor.state = 'unstable';
                // Also update the node in the canonical WorldState
                for (const l of this.state.leyLines) {
                  const n = l.nodes.find(n => n.id === neighbor.id);
                  if (n) n.state = 'unstable';
                }
                // Emit canonical instability event for neighbor (fix: correct nodeId and leyLineId)
                this.eventBus.emit({
                  type: 'LEYLINE_INSTABILITY',
                  data: {
                    id: `instab_${event.leyLineId}_${neighbor.id}_${Date.now()}`,
                    type: 'LEYLINE_INSTABILITY',
                    leyLineId: event.leyLineId,
                    nodeId: neighbor.id,
                    severity: 'minor',
                    triggeredBy: 'environment',
                    timestamp: Date.now(),
                    branchId: event.branchId,
                    data: { propagatedFrom: event.nodeId }
                  }
                });
              }
            }
          }
        }
      } else {
        leyLine.status = 'unstable';
        leyLine.nodes.forEach(n => n.state = 'unstable');
      }
      // Escalation/propagation logic (stub)
      // TODO: If severity escalates, mark as 'disrupted' or trigger rift, per artifact
      this.updateState({ leyLines: this.state.leyLines }, userId);
      // Branch/timeline propagation (stub)
      // TODO: If branchId is present, ensure state change is branch-aware
    }
  }

  /**
   * Advance the player or faction to a new tech level, unlocking features and triggering events.
   * See: tech_level_feature_spec_2025-06-08.artifact
   */
  advanceTechLevel(newLevel: TechLevelId, _userId?: string) {
    // Validate progression path, check requirements (stub)
    if (!this.state.techLevelState) {
      this.state.techLevelState = {
        playerTechLevel: newLevel,
        factionTechLevel: newLevel,
        unlocks: []
      };
    } else {
      this.state.techLevelState.playerTechLevel = newLevel;
      this.state.techLevelState.factionTechLevel = newLevel;
    }
    // Unlock features for Holo Tech
    if (newLevel === 'holo') {
      this.state.techLevelState.unlocks = [
        'Holo Gear',
        'Simulation Missions',
        'Reality Manipulation',
        'zone_holo_simulation',
        'skill:holo_shield'
      ];
      // Trigger narrative event for Holo Tech unlock
      this.eventBus.emit({
        type: 'NARRATIVE_EVENT',
        data: { eventId: 'holo_tech_unlocked', data: { /* ... */ } }
      });
    }
    this.eventBus.emit({
      type: 'TECH_LEVEL_ADVANCED',
      data: { techLevel: newLevel }
    });
  }

  /**
   * Regression logic for catastrophic events (e.g., simulation collapse).
   * See: tech_level_progression_flow_2025-06-08.artifact
   */
  regressTechLevel(regressTo: TechLevelId, _userId?: string) {
    if (this.state.techLevelState) {
      this.state.techLevelState.playerTechLevel = regressTo;
      this.state.techLevelState.factionTechLevel = regressTo;
      // Remove holo unlocks if regressing from Holo Tech
      if (regressTo !== 'holo') {
        this.state.techLevelState.unlocks = this.state.techLevelState.unlocks?.filter(
          u => !['Holo Gear', 'Simulation Missions', 'Reality Manipulation', 'zone_holo_simulation', 'skill:holo_shield'].includes(u)
        ) || [];
        // Trigger regression narrative event (stub)
        this.eventBus.emit({
          type: 'NARRATIVE_EVENT',
          data: { eventId: 'holo_tech_regressed', data: { /* ... */ } }
        });
      }
      this.eventBus.emit({
        type: 'TECH_LEVEL_REGRESSED',
        data: { techLevel: regressTo }
      });
    }
  }

  /**
   * Check if a feature is unlocked at the current tech level.
   */
  isFeatureUnlocked(feature: string): boolean {
    return this.state.techLevelState?.unlocks?.includes(feature) ?? false;
  }

  /**
   * Get the current player tech level.
   */
  getCurrentTechLevel(): TechLevelId {
    return this.state.techLevelState?.playerTechLevel ?? 'neolithic';
  }

  /**
   * Utility: Is Holo Tech unlocked?
   */
  isHoloTechUnlocked(): boolean {
    return this.getCurrentTechLevel() === 'holo';
  }
}
