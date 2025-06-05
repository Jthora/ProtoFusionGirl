// types.ts
// Canonical types for timestream, timeline, time map, warp zone, and anchor

export interface TimelineEvent {
  id: string;
  type: 'warp' | 'anchor' | 'narrative' | 'system' | string;
  timestamp: number;
  data: any;
}

export interface Timeline {
  id: string;
  label: string;
  events: TimelineEvent[];
  parentTimestream: string;
  branchFromEventId?: string;
}

export interface Timestream {
  id: string;
  label: string;
  rootTimeline: Timeline;
  branches: Timeline[];
  metadata: Record<string, any>;
}

export interface TimeMap {
  nodes: Array<{ id: string, type: 'timestream' | 'timeline' | 'event', ref: any }>;
  edges: Array<{ from: string, to: string, type: string }>;
}

export interface WarpZone {
  id: string;
  label: string;
  region: { x: number, y: number, width: number, height: number };
  triggerType: 'anchor' | 'area' | 'event' | string;
  linkedTimelineId?: string;
  metadata: Record<string, any>;
}

export interface WarpAnchor {
  id: string;
  label: string;
  position: { x: number, y: number };
  owner?: string;
  shared?: boolean;
  linkedWarpZoneId?: string;
  metadata: Record<string, any>;
}
