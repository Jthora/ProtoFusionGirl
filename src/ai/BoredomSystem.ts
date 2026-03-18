// BoredomSystem.ts
// Tracks Jane's idle time and triggers wander behavior after prolonged inactivity.
// See: progress-tracker tasks 5411-5413

import { EventBus } from '../core/EventBus';

export interface BoredomConfig {
  boredomThresholdMs: number;  // time before boredom triggers (45-60s)
  wanderRadius: number;        // how far Jane wanders
}

export const DEFAULT_BOREDOM_CONFIG: BoredomConfig = {
  boredomThresholdMs: 50000, // 50 seconds (midpoint of 45-60)
  wanderRadius: 200,
};

export class BoredomSystem {
  private eventBus: EventBus;
  private config: BoredomConfig;
  private idleTime: number = 0;
  private bored: boolean = false;
  private lastActivityTime: number = 0;

  constructor(eventBus: EventBus, config?: Partial<BoredomConfig>) {
    this.eventBus = eventBus;
    this.config = { ...DEFAULT_BOREDOM_CONFIG, ...config };
  }

  /** Call when Jane does any significant action (move, attack, puzzle, etc.) */
  recordActivity(): void {
    this.idleTime = 0;
    this.bored = false;
    this.lastActivityTime = Date.now();
  }

  /** Update each frame. Returns a wander target if boredom triggered. */
  update(dtMs: number, janeX: number, janeY: number): { wanderX: number; wanderY: number } | null {
    this.idleTime += dtMs;

    if (!this.bored && this.idleTime >= this.config.boredomThresholdMs) {
      this.bored = true;
      this.eventBus.emit({
        type: 'JANE_BOREDOM_TRIGGERED',
        data: { idleTime: this.idleTime }
      });

      // Pick a random wander direction
      const angle = Math.random() * Math.PI * 2;
      const dist = this.config.wanderRadius * (0.5 + Math.random() * 0.5);
      const wanderX = janeX + Math.cos(angle) * dist;
      const wanderY = janeY + Math.sin(angle) * dist;

      this.eventBus.emit({
        type: 'JANE_WANDER_STARTED',
        data: { targetX: wanderX, targetY: wanderY }
      });

      return { wanderX, wanderY };
    }

    return null;
  }

  isBored(): boolean {
    return this.bored;
  }

  getIdleTime(): number {
    return this.idleTime;
  }

  reset(): void {
    this.idleTime = 0;
    this.bored = false;
  }

  destroy(): void {
    this.reset();
  }
}
