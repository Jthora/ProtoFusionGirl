// RefusalSystem.ts
// Evaluates ASI guidance and allows Jane to refuse dangerous/suicidal orders.
// Refusal neither gains nor loses trust — it's a neutral safety mechanism.
// See: progress-tracker tasks 5431-5434

import { EventBus } from '../core/EventBus';

export interface RefusalConfig {
  healthDangerThreshold: number;    // refuse if health below this %
  riftProximityDanger: number;      // refuse if guidance leads within this distance of rift
  enemyCountDanger: number;         // refuse if guidance area has this many enemies
}

export const DEFAULT_REFUSAL_CONFIG: RefusalConfig = {
  healthDangerThreshold: 0.2,
  riftProximityDanger: 100,
  enemyCountDanger: 5,
};

export interface GuidanceContext {
  targetX: number;
  targetY: number;
  janeHealth: number;
  janeMaxHealth: number;
  nearbyEnemyCount: number;
  nearestRiftDistance: number | null;
  guidanceType: string;
}

export interface RefusalResult {
  refused: boolean;
  reason: string | null;
}

export class RefusalSystem {
  private eventBus: EventBus;
  private config: RefusalConfig;

  constructor(eventBus: EventBus, config?: Partial<RefusalConfig>) {
    this.eventBus = eventBus;
    this.config = { ...DEFAULT_REFUSAL_CONFIG, ...config };
  }

  /** Evaluate whether Jane should refuse guidance */
  evaluate(ctx: GuidanceContext): RefusalResult {
    const healthRatio = ctx.janeHealth / ctx.janeMaxHealth;

    // Refuse if health is critically low and heading into danger
    if (healthRatio < this.config.healthDangerThreshold && ctx.nearbyEnemyCount > 0) {
      return this.refuse('too_dangerous_low_health', ctx.guidanceType);
    }

    // Refuse if guidance leads into a rift
    if (ctx.nearestRiftDistance !== null && ctx.nearestRiftDistance < this.config.riftProximityDanger) {
      return this.refuse('rift_proximity', ctx.guidanceType);
    }

    // Refuse if area is swarming with enemies
    if (ctx.nearbyEnemyCount >= this.config.enemyCountDanger) {
      return this.refuse('too_many_enemies', ctx.guidanceType);
    }

    return { refused: false, reason: null };
  }

  private refuse(reason: string, guidanceType: string): RefusalResult {
    this.eventBus.emit({
      type: 'JANE_REFUSED_GUIDANCE',
      data: { reason, guidanceType }
    });
    return { refused: true, reason };
  }

  getDialogue(reason: string): string {
    switch (reason) {
      case 'too_dangerous_low_health':
        return "I'm too hurt to go in there right now.";
      case 'rift_proximity':
        return "I'm not going near that rift without a plan.";
      case 'too_many_enemies':
        return "That's a death trap. I need backup.";
      default:
        return "Something doesn't feel right about this.";
    }
  }
}
