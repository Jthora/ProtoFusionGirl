// TimestreamFramework.ts
// Core framework for timeline branching, anchor event logging, and narrative consequence management
// See artifacts/copilot_timestream_framework_deep_design_2025-06-04.artifact and related docs

import { TimestreamHooks } from './TimestreamHooks';
import { TimestreamUtils } from './TimestreamUtils';

export interface AnchorEvent {
  id: string; // Unique event ID (hash)
  anchorId: string;
  playerId: string;
  timestamp: number;
  location: { x: number; y: number };
  worldSeed: string;
  metadata?: Record<string, any>;
}

export interface TimestreamBranch {
  id: string; // Unique branch ID (hash)
  parentId?: string;
  anchorEvent: AnchorEvent;
  worldStateHash: string;
  consequences: string[]; // IDs or descriptions of consequences
  children: string[]; // Child branch IDs
  worldStateSnapshot?: any; // Serialized world state (optional, for restoration)
}

export class TimestreamFramework {
  private branches: Map<string, TimestreamBranch> = new Map();
  private anchorEvents: Map<string, AnchorEvent> = new Map();
  private currentBranchId: string | null = null;

  // Log an anchor event and create a new branch
  logAnchorEvent(event: AnchorEvent, parentBranchId?: string): string {
    // Generate event ID if missing
    if (!event.id) {
      const { id, ...eventWithoutId } = event;
      event.id = TimestreamUtils.eventIdFromAnchor(eventWithoutId);
    }
    this.anchorEvents.set(event.id, event);
    const branchId = TimestreamUtils.branchId(parentBranchId, event.id);
    const branch: TimestreamBranch = {
      id: branchId,
      parentId: parentBranchId,
      anchorEvent: event,
      worldStateHash: event.worldSeed, // Placeholder for full state hash
      consequences: [],
      children: []
    };
    this.branches.set(branchId, branch);
    if (parentBranchId && this.branches.has(parentBranchId)) {
      this.branches.get(parentBranchId)!.children.push(branchId);
    }
    this.currentBranchId = branchId;
    // Trigger modding/system hooks
    TimestreamHooks.triggerAnchorEvent(event, branch);
    TimestreamHooks.triggerBranchChange(branch);
    return branchId;
  }

  // Get current branch
  getCurrentBranch(): TimestreamBranch | null {
    return this.currentBranchId ? this.branches.get(this.currentBranchId) || null : null;
  }

  // Get branch history (traverse up to root)
  getBranchHistory(branchId: string): TimestreamBranch[] {
    const history: TimestreamBranch[] = [];
    let current = this.branches.get(branchId);
    while (current) {
      history.unshift(current);
      current = current.parentId ? this.branches.get(current.parentId) : undefined;
    }
    return history;
  }

  // Add a consequence to a branch
  addConsequence(branchId: string, consequence: string) {
    const branch = this.branches.get(branchId);
    if (branch) branch.consequences.push(consequence);
  }

  // Serialize the current timestream state (branches, anchor events)
  serialize(): string {
    // TODO: Use deterministic serialization for all branches and anchor events
    return JSON.stringify({
      branches: Array.from(this.branches.entries()),
      anchorEvents: Array.from(this.anchorEvents.entries()),
      currentBranchId: this.currentBranchId
    });
  }

  // Restore timestream state from serialized data
  static deserialize(data: string): TimestreamFramework {
    const obj = JSON.parse(data);
    const framework = new TimestreamFramework();
    for (const [id, branch] of obj.branches) {
      framework.branches.set(id, branch);
    }
    for (const [id, event] of obj.anchorEvents) {
      framework.anchorEvents.set(id, event);
    }
    framework.currentBranchId = obj.currentBranchId;
    return framework;
  }

  // Multiplayer: export anchor/timestream event log for sync
  exportEventLog(): AnchorEvent[] {
    return Array.from(this.anchorEvents.values());
  }

  // Multiplayer: import anchor/timestream event log (merge)
  importEventLog(events: AnchorEvent[]) {
    for (const event of events) {
      if (!this.anchorEvents.has(event.id)) {
        this.logAnchorEvent(event, event.metadata?.parentBranchId);
      }
    }
  }

  // UI: subscribe to branch changes (observer pattern)
  private branchChangeListeners: Array<(branch: TimestreamBranch) => void> = [];
  onBranchChange(listener: (branch: TimestreamBranch) => void) {
    this.branchChangeListeners.push(listener);
  }
  private notifyBranchChange(branch: TimestreamBranch) {
    for (const listener of this.branchChangeListeners) {
      listener(branch);
    }
  }

  // Call this after changing currentBranchId
  private setCurrentBranch(branchId: string) {
    this.currentBranchId = branchId;
    const branch = this.branches.get(branchId);
    if (branch) this.notifyBranchChange(branch);
  }

  // Prune orphaned or abandoned branches (utility)
  pruneBranches(predicate: (branch: TimestreamBranch) => boolean) {
    for (const [id, branch] of this.branches.entries()) {
      if (predicate(branch)) {
        this.branches.delete(id);
      }
    }
  }

  // Inspect all branches (for debugging/UI)
  getAllBranches(): TimestreamBranch[] {
    return Array.from(this.branches.values());
  }

  // --- World State Serialization & Restoration ---
  /**
   * Capture a diff of the current world state for a branch (to be called by game/engine).
   * Stores only the diff from the parent branch's state.
   * @param branchId The branch to update
   * @param getWorldState A function that returns a serializable world state object
   */
  captureWorldStateDiff(branchId: string, getWorldState: () => any) {
    const branch = this.branches.get(branchId);
    if (!branch) return;
    let parentState = {};
    if (branch.parentId && this.branches.get(branch.parentId)?.worldStateSnapshot) {
      parentState = this.reconstructWorldState(branch.parentId);
    }
    const currentState = getWorldState();
    const diff = TimestreamUtils.deepDiff(parentState, currentState);
    branch.worldStateSnapshot = diff;
    branch.worldStateHash = TimestreamUtils.simpleHash(JSON.stringify(currentState));
  }

  /**
   * Reconstruct the full world state for a branch by applying diffs up the branch chain.
   * @param branchId The branch to reconstruct
   * @returns The reconstructed world state object
   */
  reconstructWorldState(branchId: string): any {
    const history = this.getBranchHistory(branchId);
    let state = {};
    for (const branch of history) {
      if (branch.worldStateSnapshot) {
        state = this.applyDiff(state, branch.worldStateSnapshot);
      }
    }
    return state;
  }

  /**
   * Apply a diff object to a base object (deep merge).
   */
  private applyDiff(base: any, diff: any): any {
    if (typeof diff !== 'object' || diff === null) return diff;
    if (Array.isArray(diff)) return diff.slice();
    const out = { ...base };
    for (const key of Object.keys(diff)) {
      out[key] = this.applyDiff(base ? base[key] : undefined, diff[key]);
    }
    return out;
  }

  // TODO: Serialization, diffing, multiplayer, and UI hooks
}
