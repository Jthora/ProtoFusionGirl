// EventHistoryLog.ts
// Records timestamped game events with FIFO cap.
// See: progress-tracker tasks 6111-6113

import { EventBus } from '../core/EventBus';

export interface HistoryEntry {
  timestamp: number;  // game-time ms
  type: string;
  outcome: string;
  data?: Record<string, unknown>;
}

export class EventHistoryLog {
  private eventBus: EventBus;
  private entries: HistoryEntry[] = [];
  private maxEntries: number;
  private gameTime: number = 0;

  constructor(eventBus: EventBus, maxEntries = 1000) {
    this.eventBus = eventBus;
    this.maxEntries = maxEntries;
  }

  /** Record an event into the history log */
  record(type: string, outcome: string, data?: Record<string, unknown>): void {
    const entry: HistoryEntry = {
      timestamp: this.gameTime,
      type,
      outcome,
      data,
    };
    this.entries.push(entry);
    // FIFO cap
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
    this.eventBus.emit({
      type: 'HISTORY_RECORDED',
      data: { entry },
    });
  }

  /** Advance game time (call each frame) */
  update(dtMs: number): void {
    this.gameTime += dtMs;
  }

  /** Get all history entries */
  getAll(): readonly HistoryEntry[] {
    return this.entries;
  }

  /** Get entries of a specific type */
  getByType(type: string): HistoryEntry[] {
    return this.entries.filter(e => e.type === type);
  }

  /** Get the most recent N entries */
  getRecent(count: number): HistoryEntry[] {
    return this.entries.slice(-count);
  }

  /** Find decision points (events with guidance/combat/refusal outcomes) */
  getDecisionPoints(): HistoryEntry[] {
    const decisionTypes = new Set([
      'GUIDANCE_ACCEPTED', 'GUIDANCE_REFUSED', 'JANE_REFUSED_GUIDANCE',
      'COMBAT_START', 'COMBAT_END', 'UL_PUZZLE_SUCCESS', 'UL_PUZZLE_FAILURE',
      'RIFT_SEALED', 'COMPANION_SPAWNED',
    ]);
    return this.entries.filter(e => decisionTypes.has(e.type));
  }

  getLength(): number {
    return this.entries.length;
  }

  getGameTime(): number {
    return this.gameTime;
  }

  clear(): void {
    this.entries = [];
  }

  destroy(): void {
    this.entries = [];
    this.gameTime = 0;
  }
}
