// BoostSystem.ts
// Provides burst speed boosts with cooldown timer and ley line energy cost.
// See: progress-tracker tasks 5441-5444

import { EventBus } from '../core/EventBus';

export interface BoostConfig {
  speedMultiplier: number;  // e.g. 2.0 = double speed
  durationMs: number;       // boost duration in ms
  cooldownMs: number;       // cooldown after boost ends
  energyCost: number;       // ley line energy consumed per boost
}

export const DEFAULT_BOOST_CONFIG: BoostConfig = {
  speedMultiplier: 2.0,
  durationMs: 3000,
  cooldownMs: 8000,
  energyCost: 15,
};

export class BoostSystem {
  private eventBus: EventBus;
  private config: BoostConfig;
  private boosting: boolean = false;
  private boostTimer: number = 0;
  private cooldownTimer: number = 0;

  constructor(eventBus: EventBus, config?: Partial<BoostConfig>) {
    this.eventBus = eventBus;
    this.config = { ...DEFAULT_BOOST_CONFIG, ...config };
  }

  /** Attempt to activate boost. Returns true if successful. */
  activate(currentEnergy: number): boolean {
    if (this.boosting || this.cooldownTimer > 0) return false;
    if (currentEnergy < this.config.energyCost) return false;

    this.boosting = true;
    this.boostTimer = this.config.durationMs;

    this.eventBus.emit({
      type: 'BOOST_ACTIVATED',
      data: { speedMultiplier: this.config.speedMultiplier, duration: this.config.durationMs }
    });

    return true;
  }

  /** Update each frame */
  update(dtMs: number): void {
    if (this.boosting) {
      this.boostTimer -= dtMs;
      if (this.boostTimer <= 0) {
        this.boosting = false;
        this.boostTimer = 0;
        this.cooldownTimer = this.config.cooldownMs;
        this.eventBus.emit({
          type: 'BOOST_COOLDOWN_STARTED',
          data: { cooldownMs: this.config.cooldownMs }
        });
      }
    }

    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= dtMs;
      if (this.cooldownTimer < 0) this.cooldownTimer = 0;
    }
  }

  /** Current speed multiplier (1.0 if not boosting) */
  getSpeedMultiplier(): number {
    return this.boosting ? this.config.speedMultiplier : 1.0;
  }

  isBoosting(): boolean {
    return this.boosting;
  }

  isOnCooldown(): boolean {
    return this.cooldownTimer > 0;
  }

  getCooldownRemaining(): number {
    return this.cooldownTimer;
  }

  getEnergyCost(): number {
    return this.config.energyCost;
  }

  destroy(): void {
    this.boosting = false;
    this.boostTimer = 0;
    this.cooldownTimer = 0;
  }
}
