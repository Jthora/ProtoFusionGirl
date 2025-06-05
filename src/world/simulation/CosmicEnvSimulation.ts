// CosmicEnvSimulation: Simulates ley lines, vortices, cosmic events, and environmental hazards per branch/timeline.
// Integrates with WorldPersistence and MultiverseEventEngine.
export interface CosmicEvent {
  id: string;
  type: string;
  data: any;
  branchId: string;
  timestamp: number;
}

export interface CosmicState {
  leyLines: any[];
  vortices: any[];
  hazards: any[];
  events: CosmicEvent[];
}

export class CosmicEnvSimulation {
  private branchStates: Record<string, CosmicState> = {};

  getBranchState(branchId: string): CosmicState {
    if (!this.branchStates[branchId]) {
      this.branchStates[branchId] = { leyLines: [], vortices: [], hazards: [], events: [] };
    }
    return this.branchStates[branchId];
  }

  addCosmicEvent(branchId: string, event: Omit<CosmicEvent, 'branchId' | 'timestamp'>) {
    const state = this.getBranchState(branchId);
    const fullEvent: CosmicEvent = { ...event, branchId, timestamp: Date.now() };
    state.events.push(fullEvent);
  }

  simulateTick(branchId: string) {
    // TODO: Simulate ley line/vortex/hazard changes, trigger events
    // For now, just log
    // Example: this.addCosmicEvent(branchId, { id: 'tick', type: 'tick', data: {} });
  }

  mergeBranchStates(targetBranchId: string, sourceBranchId: string) {
    const target = this.getBranchState(targetBranchId);
    const source = this.getBranchState(sourceBranchId);
    // Naive merge: concat arrays, deduplicate by id
    target.leyLines = [...target.leyLines, ...source.leyLines];
    target.vortices = [...target.vortices, ...source.vortices];
    target.hazards = [...target.hazards, ...source.hazards];
    const eventIds = new Set(target.events.map(e => e.id));
    for (const e of source.events) {
      if (!eventIds.has(e.id)) target.events.push(e);
    }
  }

  rollbackBranchState(branchId: string, toTimestamp: number) {
    const state = this.getBranchState(branchId);
    state.events = state.events.filter(e => e.timestamp <= toTimestamp);
    // Optionally rollback leyLines/vortices/hazards as well
  }
}
