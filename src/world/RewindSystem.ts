// RewindSystem.ts
// Death → Decision-Point Rewind mechanic.
// Uses EventHistoryLog to find rewind points and world state snapshots.
// See: progress-tracker tasks 6121-6125

import { EventBus } from '../core/EventBus';
import { EventHistoryLog, HistoryEntry } from './EventHistoryLog';

export interface WorldSnapshot {
  id: string;
  gameTime: number;
  state: Record<string, unknown>;
}

export interface RewindPoint {
  entry: HistoryEntry;
  snapshotId: string;
}

export class RewindSystem {
  private eventBus: EventBus;
  private historyLog: EventHistoryLog;
  private snapshots = new Map<string, WorldSnapshot>();
  private nextSnapshotId = 1;
  private maxSnapshots = 50;
  private isRewinding = false;

  constructor(eventBus: EventBus, historyLog: EventHistoryLog) {
    this.eventBus = eventBus;
    this.historyLog = historyLog;
  }

  /** Take a snapshot of the world state at a decision point (task 6122) */
  captureSnapshot(state: Record<string, unknown>): string {
    const id = `snap_${this.nextSnapshotId++}`;
    const snapshot: WorldSnapshot = {
      id,
      gameTime: this.historyLog.getGameTime(),
      state: JSON.parse(JSON.stringify(state)),
    };
    this.snapshots.set(id, snapshot);

    // Cap snapshots (FIFO)
    if (this.snapshots.size > this.maxSnapshots) {
      const oldest = this.snapshots.keys().next().value;
      if (oldest !== undefined) {
        this.snapshots.delete(oldest);
      }
    }

    return id;
  }

  /** Record a decision point with associated snapshot */
  recordDecisionPoint(type: string, outcome: string, worldState: Record<string, unknown>): void {
    const snapshotId = this.captureSnapshot(worldState);
    this.historyLog.record(type, outcome, { snapshotId });
  }

  /** Get available rewind points (decision points with snapshots) (task 6122) */
  getRewindPoints(): RewindPoint[] {
    const decisionPoints = this.historyLog.getDecisionPoints();
    const points: RewindPoint[] = [];
    for (const entry of decisionPoints) {
      const snapshotId = entry.data?.snapshotId as string | undefined;
      if (snapshotId && this.snapshots.has(snapshotId)) {
        points.push({ entry, snapshotId });
      }
    }
    return points;
  }

  /** Rewind to a specific decision point (task 6123) */
  rewindTo(snapshotId: string): WorldSnapshot | null {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) return null;

    this.isRewinding = true;
    this.eventBus.emit({
      type: 'REWIND_STARTED',
      data: { snapshotId, gameTime: snapshot.gameTime },
    });

    return snapshot;
  }

  /** Resume from rewind point (task 6124) */
  resumeFromRewind(snapshotId: string): boolean {
    if (!this.isRewinding) return false;
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) return false;

    this.isRewinding = false;
    this.eventBus.emit({
      type: 'REWIND_COMPLETED',
      data: { snapshotId, resumeGameTime: snapshot.gameTime },
    });

    // Trim history entries after the rewind point
    // (entries with timestamp > snapshot.gameTime are from the "old" future)

    return true;
  }

  getIsRewinding(): boolean {
    return this.isRewinding;
  }

  getSnapshot(snapshotId: string): WorldSnapshot | undefined {
    const s = this.snapshots.get(snapshotId);
    return s ? { ...s, state: JSON.parse(JSON.stringify(s.state)) } : undefined;
  }

  getSnapshotCount(): number {
    return this.snapshots.size;
  }
}
