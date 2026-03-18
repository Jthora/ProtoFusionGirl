// ULObservationSystem.ts
// Tracks Jane's exposure to UL symbol usage and drives learning progression.
// When ASI uses UL nearby, Jane's exposure counter increments.
// See: progress-tracker tasks 5421-5423

import { EventBus } from '../core/EventBus';

export interface ULObservationConfig {
  observationRange: number; // distance within which Jane "sees" UL usage
}

export const DEFAULT_UL_OBSERVATION_CONFIG: ULObservationConfig = {
  observationRange: 300,
};

export class ULObservationSystem {
  private eventBus: EventBus;
  private config: ULObservationConfig;
  private exposure: number = 0;
  private symbolExposure: Map<string, number> = new Map();

  constructor(eventBus: EventBus, config?: Partial<ULObservationConfig>) {
    this.eventBus = eventBus;
    this.config = { ...DEFAULT_UL_OBSERVATION_CONFIG, ...config };
  }

  /** Record that a UL symbol was used near Jane */
  recordExposure(symbolUsed: string, distanceToJane: number): boolean {
    if (distanceToJane > this.config.observationRange) return false;

    this.exposure++;
    this.symbolExposure.set(symbolUsed, (this.symbolExposure.get(symbolUsed) ?? 0) + 1);

    this.eventBus.emit({
      type: 'UL_EXPOSURE_INCREMENTED',
      data: { totalExposure: this.exposure, symbolUsed }
    });

    return true;
  }

  getTotalExposure(): number {
    return this.exposure;
  }

  getSymbolExposure(symbol: string): number {
    return this.symbolExposure.get(symbol) ?? 0;
  }

  /** Get symbols Jane has "learned" (exposure >= threshold) */
  getLearnedSymbols(threshold: number = 3): string[] {
    const learned: string[] = [];
    for (const [symbol, count] of this.symbolExposure.entries()) {
      if (count >= threshold) learned.push(symbol);
    }
    return learned;
  }

  destroy(): void {
    this.exposure = 0;
    this.symbolExposure.clear();
  }
}
