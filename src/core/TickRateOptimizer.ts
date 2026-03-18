// TickRateOptimizer.ts
// Utility: run a system callback every N frames instead of every frame.
// Task 7433 — Optimize JaneAI tick rate (every 3-5 frames)

export interface TickSchedule {
  /** How many frames to skip between calls (1 = every frame, 3 = every 3rd frame). */
  interval: number;
  /** The system callback receiving elapsed dt (sum of skipped frames). */
  callback: (accumulatedDt: number) => void;
}

export class TickRateOptimizer {
  private schedules: Map<string, { schedule: TickSchedule; frameCounter: number; accDt: number }> = new Map();

  /** Register a system to be called every `interval` frames. */
  register(id: string, schedule: TickSchedule): void {
    this.schedules.set(id, { schedule, frameCounter: 0, accDt: 0 });
  }

  /** Unregister a system. */
  unregister(id: string): void {
    this.schedules.delete(id);
  }

  /** Call once per game frame with the raw delta time. */
  tick(dt: number): void {
    for (const entry of this.schedules.values()) {
      entry.frameCounter++;
      entry.accDt += dt;
      if (entry.frameCounter >= entry.schedule.interval) {
        entry.schedule.callback(entry.accDt);
        entry.frameCounter = 0;
        entry.accDt = 0;
      }
    }
  }

  getRegisteredIds(): string[] {
    return Array.from(this.schedules.keys());
  }
}
