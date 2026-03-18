// ULMasterySystem.ts
// Tracks Jane's mastery of Universal Language symbols.
// Mastery levels: 0=unaware, 1=exposed, 2=familiar, 3=competent, 4=mastered
// See: progress-tracker tasks 7111-7115

import { EventBus } from '../core/EventBus';

export enum MasteryLevel {
  Unaware = 0,
  Exposed = 1,
  Familiar = 2,
  Competent = 3,
  Mastered = 4,
}

export interface SymbolMastery {
  symbol: string;
  level: MasteryLevel;
  observations: number; // how many times Jane has observed ASI use this symbol
  attempts: number; // how many times Jane tried it independently
  successes: number; // how many successful independent attempts
}

export interface ULMasteryConfig {
  /** Observations needed to reach Exposed (default 1) */
  exposedThreshold?: number;
  /** Observations needed to reach Familiar (default 3) */
  familiarThreshold?: number;
  /** Successes needed to reach Competent (default 2) */
  competentThreshold?: number;
  /** Successes needed to reach Mastered (default 5) */
  masteredThreshold?: number;
  /** Base success rate at Familiar level (default 0.5) */
  baseSuccessRate?: number;
  /** Success rate improvement per ASI feedback (default 0.1) */
  feedbackBoost?: number;
}

const DEFAULT_CONFIG: Required<ULMasteryConfig> = {
  exposedThreshold: 1,
  familiarThreshold: 3,
  competentThreshold: 2,
  masteredThreshold: 5,
  baseSuccessRate: 0.5,
  feedbackBoost: 0.1,
};

export class ULMasterySystem {
  private eventBus: EventBus;
  private config: Required<ULMasteryConfig>;
  private symbols = new Map<string, SymbolMastery>();
  private feedbackCount = 0; // cumulative positive feedback from ASI

  constructor(eventBus: EventBus, config?: ULMasteryConfig) {
    this.eventBus = eventBus;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Record that Jane observed the ASI (player) using a symbol (task 7112) */
  recordObservation(symbol: string): void {
    const entry = this.getOrCreate(symbol);
    entry.observations++;
    const prevLevel = entry.level;
    this.updateLevel(entry);
    if (entry.level !== prevLevel) {
      this.emitMasteryChanged(entry);
    }
  }

  /** Jane attempts a UL symbol independently (task 7113). Returns true if successful. */
  attemptSymbol(symbol: string, rng?: () => number): boolean {
    const entry = this.getOrCreate(symbol);
    if (entry.level < MasteryLevel.Familiar) return false; // can't attempt below Familiar

    entry.attempts++;
    const successRate = this.getSuccessRate(entry);
    const roll = (rng ?? Math.random)();
    const success = roll < successRate;

    if (success) {
      entry.successes++;
      const prevLevel = entry.level;
      this.updateLevel(entry);
      if (entry.level !== prevLevel) {
        this.emitMasteryChanged(entry);
      }
    }

    this.eventBus.emit({
      type: 'JANE_UL_ATTEMPT',
      data: { symbol, success, mastery: entry.level, successRate },
    });

    return success;
  }

  /** Apply ASI positive feedback — improves future success rates (task 7123) */
  applyFeedback(positive: boolean): void {
    if (positive) {
      this.feedbackCount++;
    }
    this.eventBus.emit({
      type: 'ASI_FEEDBACK_GIVEN',
      data: { positive, totalFeedback: this.feedbackCount },
    });
  }

  /** Get the success rate for a symbol at its current mastery + feedback */
  getSuccessRate(entry: SymbolMastery): number {
    let rate = 0;
    if (entry.level >= MasteryLevel.Familiar) rate = this.config.baseSuccessRate;
    if (entry.level >= MasteryLevel.Competent) rate = 0.75;
    if (entry.level >= MasteryLevel.Mastered) rate = 0.95;
    // ASI feedback boost
    rate += this.feedbackCount * this.config.feedbackBoost;
    return Math.min(rate, 0.99);
  }

  getMastery(symbol: string): SymbolMastery | undefined {
    return this.symbols.get(symbol);
  }

  getAllMastery(): SymbolMastery[] {
    return [...this.symbols.values()];
  }

  getKnownSymbols(): string[] {
    return [...this.symbols.values()]
      .filter(s => s.level >= MasteryLevel.Familiar)
      .map(s => s.symbol);
  }

  getFeedbackCount(): number {
    return this.feedbackCount;
  }

  private getOrCreate(symbol: string): SymbolMastery {
    let entry = this.symbols.get(symbol);
    if (!entry) {
      entry = { symbol, level: MasteryLevel.Unaware, observations: 0, attempts: 0, successes: 0 };
      this.symbols.set(symbol, entry);
    }
    return entry;
  }

  private updateLevel(entry: SymbolMastery): void {
    if (entry.successes >= this.config.masteredThreshold) {
      entry.level = MasteryLevel.Mastered;
    } else if (entry.successes >= this.config.competentThreshold) {
      entry.level = MasteryLevel.Competent;
    } else if (entry.observations >= this.config.familiarThreshold) {
      entry.level = MasteryLevel.Familiar;
    } else if (entry.observations >= this.config.exposedThreshold) {
      entry.level = MasteryLevel.Exposed;
    }
  }

  private emitMasteryChanged(entry: SymbolMastery): void {
    this.eventBus.emit({
      type: 'UL_MASTERY_CHANGED',
      data: { symbol: entry.symbol, level: entry.level, observations: entry.observations, successes: entry.successes },
    });
  }
}
