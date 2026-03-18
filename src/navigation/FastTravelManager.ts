import { EventBus } from '../core/EventBus';

export interface FastTravelNode {
  id: string;
  name: string;
  x: number;
  y: number;
  unlocked: boolean;
}

/**
 * FastTravelManager — basic fast travel between ley nodes (P2).
 *
 * Manages a set of travel nodes. When travel is initiated,
 * emits events to move Jane to the destination node instantly.
 */
export class FastTravelManager {
  private eventBus: EventBus;
  private nodes = new Map<string, FastTravelNode>();
  private _isMapOpen = false;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  addNode(node: FastTravelNode): void {
    this.nodes.set(node.id, { ...node });
  }

  getNode(id: string): FastTravelNode | undefined {
    const n = this.nodes.get(id);
    return n ? { ...n } : undefined;
  }

  getAllNodes(): FastTravelNode[] {
    return [...this.nodes.values()].map(n => ({ ...n }));
  }

  unlockNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;
    node.unlocked = true;
    return true;
  }

  get isMapOpen(): boolean {
    return this._isMapOpen;
  }

  openMap(): void {
    this._isMapOpen = true;
    this.eventBus.emit({
      type: 'JANE_STATE_CHANGED',
      data: { newState: 'fast_travel_map', previousState: 'gameplay' }
    });
  }

  closeMap(): void {
    this._isMapOpen = false;
    this.eventBus.emit({
      type: 'JANE_STATE_CHANGED',
      data: { newState: 'gameplay', previousState: 'fast_travel_map' }
    });
  }

  /**
   * Travel to a node. Returns true if travel initiated.
   * Emits ASI_WAYPOINT_PLACED at destination for JaneAI to handle,
   * plus a direct teleport via JANE_RESPAWN (reusing respawn mechanic).
   */
  travelTo(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node || !node.unlocked) return false;

    this._isMapOpen = false;

    this.eventBus.emit({
      type: 'CHECKPOINT_SET',
      data: { x: node.x, y: node.y, checkpointId: node.id }
    });

    this.eventBus.emit({
      type: 'JANE_RESPAWN',
      data: { x: node.x, y: node.y, checkpointId: node.id }
    });

    return true;
  }

  // ── Animated Travel (P4, tasks 6341-6343) ──

  private _isTraveling = false;
  private _travelProgress = 0;
  private _travelDurationMs = 0;
  private _travelDestination: FastTravelNode | null = null;
  private _travelOrigin: FastTravelNode | null = null;
  private _transitEventChance = 0.3; // 30% chance of transit event per trip

  get isTraveling(): boolean {
    return this._isTraveling;
  }

  get travelProgress(): number {
    return this._travelProgress;
  }

  /**
   * Start animated travel: takes game-time, emits events, may trigger transit encounters.
   * Returns true if travel started.
   */
  startAnimatedTravel(fromNodeId: string, toNodeId: string): boolean {
    const from = this.nodes.get(fromNodeId);
    const to = this.nodes.get(toNodeId);
    if (!from || !to || !to.unlocked || this._isTraveling) return false;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this._travelDurationMs = Math.max(2000, dist * 2); // 2ms per pixel, min 2s
    this._travelProgress = 0;
    this._isTraveling = true;
    this._travelOrigin = from;
    this._travelDestination = to;
    this._isMapOpen = false;

    this.eventBus.emit({
      type: 'FAST_TRAVEL_STARTED',
      data: { fromNodeId, toNodeId, durationMs: this._travelDurationMs },
    });

    return true;
  }

  /** Update animated travel (call each frame with dtMs) */
  updateTravel(dtMs: number): void {
    if (!this._isTraveling || !this._travelDestination) return;

    this._travelProgress += dtMs / this._travelDurationMs;

    // Transit event at midpoint
    if (this._travelProgress >= 0.5 && this._travelProgress - (dtMs / this._travelDurationMs) < 0.5) {
      if (Math.random() < this._transitEventChance) {
        this.eventBus.emit({
          type: 'TRANSIT_EVENT',
          data: { type: 'random_encounter', progress: this._travelProgress },
        });
      }
    }

    if (this._travelProgress >= 1.0) {
      this._travelProgress = 1.0;
      this._isTraveling = false;
      const dest = this._travelDestination;

      this.eventBus.emit({
        type: 'JANE_RESPAWN',
        data: { x: dest.x, y: dest.y, checkpointId: dest.id },
      });
      this.eventBus.emit({
        type: 'FAST_TRAVEL_ARRIVED',
        data: { nodeId: dest.id, x: dest.x, y: dest.y },
      });

      this._travelDestination = null;
      this._travelOrigin = null;
    }
  }

  /** Override transit event chance for testing */
  setTransitEventChance(chance: number): void {
    this._transitEventChance = chance;
  }
}
