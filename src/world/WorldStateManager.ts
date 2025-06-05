// WorldStateManager.ts
// Central authority for persistent, cross-functional world state in ProtoFusionGirl
// See: world_state_system_design_2025-06-04.artifact, world_state_data_model_2025-06-04.artifact

import { EventBus, WorldEvent } from './EventBus';
import Ajv from 'ajv';

// --- State Domain Interfaces ---
export interface LeyLineNode {
  id: string;
  position: { x: number; y: number };
  type: 'node' | 'junction' | 'anchor';
  active: boolean;
}

export interface LeyLine {
  id: string;
  nodes: LeyLineNode[];
  energy: number;
}

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

export interface WorldState {
  version: number;
  leyLines: LeyLine[];
  rifts: Rift[];
  players: PlayerState[];
  economy: EconomyState;
  events: WorldEvent[];
  meta: MetaState;
}

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

  constructor(initialState: WorldState, eventBus: EventBus) {
    this.state = initialState;
    this.eventBus = eventBus;
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
    this.eventBus.publish({
      id: `state_update_${Date.now()}`,
      type: 'STATE_UPDATED',
      data: patch,
      timestamp: Date.now(),
      version: this.state.version
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
    if (!validateWorldState(loaded)) {
      throw new Error('Loaded WorldState validation failed: ' + JSON.stringify(validateWorldState.errors));
    }
    this.state = loaded;
  }
}
