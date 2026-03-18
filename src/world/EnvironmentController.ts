// EnvironmentController.ts
// ASI interaction with doors, node defenses, and energy conduits.
// See: progress-tracker tasks 6321-6323

import { EventBus } from '../core/EventBus';

export interface Door {
  id: string;
  nodeId: string;
  open: boolean;
  locked: boolean;
}

export interface NodeDefense {
  id: string;
  nodeId: string;
  active: boolean;
  type: string; // 'shield' | 'turret' | 'barrier'
}

export interface EnergyConduit {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  flowRate: number; // energy units per second
  active: boolean;
}

export class EnvironmentController {
  private eventBus: EventBus;
  private doors = new Map<string, Door>();
  private defenses = new Map<string, NodeDefense>();
  private conduits = new Map<string, EnergyConduit>();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  // ── Doors (6321) ──

  registerDoor(door: Door): void {
    this.doors.set(door.id, { ...door });
  }

  openDoor(doorId: string): boolean {
    const door = this.doors.get(doorId);
    if (!door || door.locked) return false;
    door.open = true;
    this.eventBus.emit({
      type: 'DOOR_STATE_CHANGED',
      data: { doorId, nodeId: door.nodeId, open: true },
    });
    return true;
  }

  closeDoor(doorId: string): boolean {
    const door = this.doors.get(doorId);
    if (!door) return false;
    door.open = false;
    this.eventBus.emit({
      type: 'DOOR_STATE_CHANGED',
      data: { doorId, nodeId: door.nodeId, open: false },
    });
    return true;
  }

  getDoor(doorId: string): Door | undefined {
    const d = this.doors.get(doorId);
    return d ? { ...d } : undefined;
  }

  // ── Node Defenses (6322) ──

  registerDefense(defense: NodeDefense): void {
    this.defenses.set(defense.id, { ...defense });
  }

  activateDefense(defenseId: string): boolean {
    const def = this.defenses.get(defenseId);
    if (!def || def.active) return false;
    def.active = true;
    this.eventBus.emit({
      type: 'NODE_DEFENSE_STATE_CHANGED',
      data: { defenseId, nodeId: def.nodeId, active: true, type: def.type },
    });
    return true;
  }

  deactivateDefense(defenseId: string): boolean {
    const def = this.defenses.get(defenseId);
    if (!def || !def.active) return false;
    def.active = false;
    this.eventBus.emit({
      type: 'NODE_DEFENSE_STATE_CHANGED',
      data: { defenseId, nodeId: def.nodeId, active: false, type: def.type },
    });
    return true;
  }

  getDefense(defenseId: string): NodeDefense | undefined {
    const d = this.defenses.get(defenseId);
    return d ? { ...d } : undefined;
  }

  // ── Energy Conduits (6323) ──

  registerConduit(conduit: EnergyConduit): void {
    this.conduits.set(conduit.id, { ...conduit });
  }

  redirectConduit(conduitId: string, newTargetNodeId: string): boolean {
    const conduit = this.conduits.get(conduitId);
    if (!conduit || !conduit.active) return false;
    const oldTarget = conduit.targetNodeId;
    conduit.targetNodeId = newTargetNodeId;
    this.eventBus.emit({
      type: 'ENERGY_CONDUIT_REDIRECTED',
      data: { conduitId, sourceNodeId: conduit.sourceNodeId, oldTargetNodeId: oldTarget, newTargetNodeId },
    });
    return true;
  }

  toggleConduit(conduitId: string): boolean {
    const conduit = this.conduits.get(conduitId);
    if (!conduit) return false;
    conduit.active = !conduit.active;
    return true;
  }

  getConduit(conduitId: string): EnergyConduit | undefined {
    const c = this.conduits.get(conduitId);
    return c ? { ...c } : undefined;
  }

  getConduitsByNode(nodeId: string): EnergyConduit[] {
    return [...this.conduits.values()].filter(
      c => c.sourceNodeId === nodeId || c.targetNodeId === nodeId
    );
  }
}
