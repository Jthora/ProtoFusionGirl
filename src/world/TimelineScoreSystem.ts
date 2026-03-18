// TimelineScoreSystem.ts
// Computes aggregate timeline quality score from world state.
// See: progress-tracker tasks 7411-7413

import { EventBus } from '../core/EventBus';

export interface TimelineScoreInput {
  /** Average ley node stability (0-100) */
  averageStability: number;
  /** Number of active allies (companions + heroes) */
  allyCount: number;
  /** Number of rifts sealed */
  riftsSealed: number;
  /** Number of rifts still active */
  activeRifts: number;
  /** Total Jane deaths (rewinds) */
  deathCount: number;
  /** Trust level (0-100) */
  trustLevel: number;
  /** Number of UL symbols Jane has mastered */
  masteredSymbols: number;
}

export interface TimelineScore {
  total: number;         // 0-100 composite score
  stability: number;     // 0-25 from ley network health
  alliances: number;     // 0-20 from companions
  exploration: number;   // 0-20 from rifts sealed
  trust: number;         // 0-20 from ASI-Jane trust
  mastery: number;       // 0-15 from UL learning
  penalties: number;     // subtracted for deaths and active rifts
}

export class TimelineScoreSystem {
  private eventBus: EventBus;
  private lastScore: TimelineScore | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /** Calculate the timeline quality score (task 7411) */
  calculate(input: TimelineScoreInput): TimelineScore {
    const stability = Math.min(25, (input.averageStability / 100) * 25);
    const alliances = Math.min(20, input.allyCount * 10);
    const exploration = Math.min(20, input.riftsSealed * 5);
    const trust = Math.min(20, (input.trustLevel / 100) * 20);
    const mastery = Math.min(15, input.masteredSymbols * 3);
    const penalties = Math.min(30, input.deathCount * 5 + input.activeRifts * 3);

    const raw = stability + alliances + exploration + trust + mastery - penalties;
    const total = Math.max(0, Math.min(100, Math.round(raw)));

    const score: TimelineScore = { total, stability, alliances, exploration, trust, mastery, penalties };
    this.lastScore = score;

    this.eventBus.emit({
      type: 'TIMELINE_SCORE_UPDATED',
      data: score,
    });

    return score;
  }

  getLastScore(): TimelineScore | null {
    return this.lastScore;
  }
}
