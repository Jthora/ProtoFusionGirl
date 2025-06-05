// TimestreamManager.ts
// Handles creation, branching, merging, and traversal of timestreams and timelines
import { Timestream, Timeline, TimelineEvent } from './types';

export type BranchingHook = (timeline: Timeline, event: TimelineEvent) => Timeline;

export class TimestreamManager {
  private timestreams: Map<string, Timestream> = new Map();
  private branchingHooks: BranchingHook[] = [];

  createTimestream(label: string, rootTimeline: Timeline): Timestream {
    const id = `ts_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const ts: Timestream = { id, label, rootTimeline, branches: [], metadata: {} };
    this.timestreams.set(id, ts);
    return ts;
  }

  branchTimeline(timestreamId: string, fromEventId: string, label: string): Timeline | null {
    const ts = this.timestreams.get(timestreamId);
    if (!ts) return null;
    const parent = ts.rootTimeline;
    const branch: Timeline = {
      id: `tl_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      label,
      events: [],
      parentTimestream: ts.id,
      branchFromEventId: fromEventId
    };
    ts.branches.push(branch);
    return branch;
  }

  mergeTimelines(timelineA: Timeline, timelineB: Timeline, label: string): Timeline | null {
    // Simple merge: concatenate events, mark as merged
    if (!timelineA || !timelineB) return null;
    const merged: Timeline = {
      id: `tl_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      label,
      events: [...timelineA.events, ...timelineB.events],
      parentTimestream: timelineA.parentTimestream,
      branchFromEventId: undefined
    };
    // Optionally, add to the parent timestream's branches if needed
    return merged;
  }

  registerBranchingHook(hook: BranchingHook) {
    this.branchingHooks.push(hook);
  }

  // Serialization/deserialization stubs
  serialize(): any {
    // Serialize all timestreams to JSON
    return Array.from(this.timestreams.values());
  }
  deserialize(data: any): void {
    // Deserialize from JSON array
    if (Array.isArray(data)) {
      this.timestreams.clear();
      for (const ts of data) {
        this.timestreams.set(ts.id, ts);
      }
    }
  }
}
