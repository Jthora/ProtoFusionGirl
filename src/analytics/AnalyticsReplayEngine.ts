// AnalyticsReplayEngine: Tracks player actions, branch evolution, and emergent stories for analytics, replay, and sharing.
// Integrates with save/load, branch/anchor systems, and event engine.
export interface AnalyticsEvent {
  id: string;
  type: string;
  data: any;
  branchId: string;
  timestamp: number;
}

export class AnalyticsReplayEngine {
  private branchLogs: Record<string, AnalyticsEvent[]> = {};
  private optIn: boolean = true;

  logEvent(branchId: string, type: string, data: any) {
    if (!this.optIn) return;
    if (!this.branchLogs[branchId]) this.branchLogs[branchId] = [];
    this.branchLogs[branchId].push({ id: `${type}:${Date.now()}`, type, data, branchId, timestamp: Date.now() });
  }

  exportBranchLog(branchId: string): AnalyticsEvent[] {
    return this.branchLogs[branchId] || [];
  }

  importBranchLog(branchId: string, log: AnalyticsEvent[]) {
    this.branchLogs[branchId] = log;
  }

  setOptIn(optIn: boolean) {
    this.optIn = optIn;
  }
}
