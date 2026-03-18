// EmergentEventGenerator.ts
// Generates emergent gameplay events: stability-based surges, distress signals, rift expansion.
// See: progress-tracker tasks 5321-5324

import { EventBus } from '../core/EventBus';

export interface EmergentEventConfig {
  surgeCheckIntervalMs: number;     // how often to check for surge events
  distressHealthThreshold: number;  // companion health % that triggers distress
  riftExpansionCheckMs: number;     // how often to check rift expansion
}

export const DEFAULT_EMERGENT_CONFIG: EmergentEventConfig = {
  surgeCheckIntervalMs: 3000,
  distressHealthThreshold: 30,
  riftExpansionCheckMs: 5000,
};

export interface WorldSnapshot {
  nodeStabilities: Array<{ nodeId: string; stability: number }>;
  companionHealths: Array<{ id: string; health: number; maxHealth: number; x: number; y: number }>;
  activeRiftCount: number;
}

export class EmergentEventGenerator {
  private eventBus: EventBus;
  private config: EmergentEventConfig;
  private surgeTimer: number = 0;
  private distressTimer: number = 0;

  constructor(eventBus: EventBus, config?: Partial<EmergentEventConfig>) {
    this.eventBus = eventBus;
    this.config = { ...DEFAULT_EMERGENT_CONFIG, ...config };
  }

  /** Check world state and generate events as needed */
  update(dtMs: number, snapshot: WorldSnapshot): void {
    this.surgeTimer += dtMs;
    this.distressTimer += dtMs;

    // Surge generation based on low stability nodes
    if (this.surgeTimer >= this.config.surgeCheckIntervalMs) {
      this.surgeTimer = 0;
      this.checkSurgeEvents(snapshot);
    }

    // Distress signal generation
    if (this.distressTimer >= this.config.surgeCheckIntervalMs) {
      this.distressTimer = 0;
      this.checkDistressSignals(snapshot);
    }
  }

  private checkSurgeEvents(snapshot: WorldSnapshot): void {
    for (const node of snapshot.nodeStabilities) {
      if (node.stability > 0 && node.stability < 30) {
        const intensity = Math.round(100 - node.stability);
        this.eventBus.emit({
          type: 'SURGE_GENERATED',
          data: { nodeId: node.nodeId, intensity }
        });
      }
    }
  }

  private checkDistressSignals(snapshot: WorldSnapshot): void {
    for (const companion of snapshot.companionHealths) {
      const healthPct = (companion.health / companion.maxHealth) * 100;
      if (healthPct > 0 && healthPct < this.config.distressHealthThreshold) {
        this.eventBus.emit({
          type: 'DISTRESS_SIGNAL',
          data: {
            sourceId: companion.id,
            sourceType: 'companion',
            x: companion.x,
            y: companion.y,
            reason: 'low_health',
          }
        });
      }
    }
  }

  destroy(): void {
    this.surgeTimer = 0;
    this.distressTimer = 0;
  }
}
