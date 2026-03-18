// CosmicCalendar.ts
// Day counter with 12-phase cosmic cycle affecting event weights.
// See: progress-tracker tasks 6211-6214, 7231-7233

import { EventBus } from '../core/EventBus';

export type CosmicPhase =
  | 'Fire' | 'Earth' | 'Air' | 'Water'
  | 'Lightning' | 'Ice' | 'Void' | 'Light'
  | 'Shadow' | 'Growth' | 'Decay' | 'Harmony';

export const PHASE_ORDER: CosmicPhase[] = [
  'Fire', 'Earth', 'Air', 'Water',
  'Lightning', 'Ice', 'Void', 'Light',
  'Shadow', 'Growth', 'Decay', 'Harmony',
];

/** How many game-time seconds per day */
export const SECONDS_PER_DAY = 120; // 2 real minutes = 1 game day

/** Event weight modifiers per phase (12-phase matrix) */
export const PHASE_WEIGHTS: Record<CosmicPhase, Record<string, number>> = {
  Fire:      { combat: 1.5, surge: 1.3, distress: 0.8, rift: 1.2, diplomacy: 0.7, mastery: 0.9, healing: 0.6 },
  Earth:     { combat: 0.8, surge: 0.7, distress: 1.0, rift: 0.6, diplomacy: 1.3, mastery: 1.1, healing: 1.2 },
  Air:       { combat: 1.0, surge: 1.0, distress: 1.2, rift: 1.0, diplomacy: 1.0, mastery: 1.2, healing: 1.0 },
  Water:     { combat: 0.7, surge: 0.8, distress: 1.3, rift: 0.8, diplomacy: 1.5, mastery: 1.0, healing: 1.5 },
  Lightning: { combat: 1.4, surge: 1.6, distress: 0.7, rift: 1.3, diplomacy: 0.6, mastery: 1.3, healing: 0.5 },
  Ice:       { combat: 0.6, surge: 0.5, distress: 1.4, rift: 0.5, diplomacy: 1.0, mastery: 0.8, healing: 1.3 },
  Void:      { combat: 1.2, surge: 0.9, distress: 1.5, rift: 1.8, diplomacy: 0.4, mastery: 0.6, healing: 0.4 },
  Light:     { combat: 0.5, surge: 1.1, distress: 0.5, rift: 0.3, diplomacy: 1.4, mastery: 1.5, healing: 1.4 },
  Shadow:    { combat: 1.3, surge: 1.2, distress: 1.3, rift: 1.5, diplomacy: 0.5, mastery: 0.7, healing: 0.7 },
  Growth:    { combat: 0.7, surge: 0.8, distress: 0.6, rift: 0.4, diplomacy: 1.2, mastery: 1.4, healing: 1.6 },
  Decay:     { combat: 1.1, surge: 1.0, distress: 1.6, rift: 1.4, diplomacy: 0.8, mastery: 0.5, healing: 0.3 },
  Harmony:   { combat: 0.4, surge: 0.6, distress: 0.4, rift: 0.2, diplomacy: 1.8, mastery: 1.6, healing: 1.8 },
};

export class CosmicCalendar {
  private eventBus: EventBus;
  private day: number = 0;
  private elapsedSeconds: number = 0;
  private secondsPerDay: number;

  constructor(eventBus: EventBus, secondsPerDay = SECONDS_PER_DAY) {
    this.eventBus = eventBus;
    this.secondsPerDay = secondsPerDay;
  }

  /** Update clock; call each frame with delta in ms */
  update(dtMs: number): void {
    this.elapsedSeconds += dtMs / 1000;
    const newDay = Math.floor(this.elapsedSeconds / this.secondsPerDay);
    if (newDay !== this.day) {
      const prevPhase = this.getPhase();
      this.day = newDay;
      const newPhase = this.getPhase();
      this.eventBus.emit({
        type: 'COSMIC_DAY_CHANGED',
        data: { day: this.day, phase: newPhase },
      });
      if (prevPhase !== newPhase) {
        this.eventBus.emit({
          type: 'COSMIC_PHASE_CHANGED',
          data: { previousPhase: prevPhase, newPhase, day: this.day },
        });
      }
    }
  }

  getDay(): number { return this.day; }

  getPhase(): CosmicPhase {
    return PHASE_ORDER[this.day % 12];
  }

  /** Get the event weight modifier for the current phase */
  getWeight(eventType: string): number {
    const weights = PHASE_WEIGHTS[this.getPhase()];
    return weights[eventType] ?? 1.0;
  }

  /** Get all weights for the current phase */
  getPhaseWeights(): Record<string, number> {
    return { ...PHASE_WEIGHTS[this.getPhase()] };
  }

  getElapsedSeconds(): number {
    return this.elapsedSeconds;
  }

  destroy(): void {
    this.day = 0;
    this.elapsedSeconds = 0;
  }
}
