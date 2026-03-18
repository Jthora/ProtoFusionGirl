import { EventBus } from '../../core/EventBus';
import { SpeedCategory, SpeedClassifier, SpeedConfig } from '../core/SpeedCategories';

/**
 * ThrottleController — Analog speed control within the current gear's range.
 *
 * - throttle: 0.0 (idle) to 1.0 (full) within current gear
 * - Hold key → ramp up, release → ramp down
 * - currentSpeed = gear.minSpeed + throttle * (gear.maxSpeed - gear.minSpeed)
 */

export interface ThrottleConfig {
  eventBus: EventBus;
  /** How fast throttle ramps up per second (0-1 units/sec). Default 1.5 */
  rampUpRate?: number;
  /** How fast throttle ramps down per second. Default 2.0 */
  rampDownRate?: number;
  /** Starting gear. Default WALKING */
  initialGear?: SpeedCategory;
}

export class ThrottleController {
  private eventBus: EventBus;
  private _throttle = 0;
  private _gear: SpeedCategory;
  private _gearConfig: SpeedConfig;
  private rampUpRate: number;
  private rampDownRate: number;
  private accelerating = false;
  private decelerating = false;

  constructor(config: ThrottleConfig) {
    this.eventBus = config.eventBus;
    this.rampUpRate = config.rampUpRate ?? 1.5;
    this.rampDownRate = config.rampDownRate ?? 2.0;
    this._gear = config.initialGear ?? SpeedCategory.WALKING;
    this._gearConfig = SpeedClassifier.getConfigByCategory(this._gear)
      ?? SpeedClassifier.getSpeedConfigs()[0];
  }

  get throttle(): number {
    return this._throttle;
  }

  get gear(): SpeedCategory {
    return this._gear;
  }

  get currentSpeedKmh(): number {
    const min = this._gearConfig.minSpeedKmh;
    const max = this._gearConfig.maxSpeedKmh;
    return min + this._throttle * (max - min);
  }

  get gearConfig(): SpeedConfig {
    return this._gearConfig;
  }

  /** Call when accelerate key is pressed/held. */
  setAccelerating(active: boolean): void {
    this.accelerating = active;
  }

  /** Call when decelerate key is pressed/held. */
  setDecelerating(active: boolean): void {
    this.decelerating = active;
  }

  /** Shift to next gear. Returns true if shifted. */
  gearUp(): boolean {
    const next = SpeedClassifier.getNextSpeedCategory(this._gear);
    if (!next) return false;
    this._gear = next;
    this._gearConfig = SpeedClassifier.getConfigByCategory(next)!;
    this._throttle = 0; // Reset throttle on gear change
    this.eventBus.emit({
      type: 'JANE_STATE_CHANGED',
      data: { newState: `gear_${next}`, previousState: `gear_${this._gear}` }
    });
    return true;
  }

  /** Shift to previous gear. Returns true if shifted. */
  gearDown(): boolean {
    const prev = SpeedClassifier.getPreviousSpeedCategory(this._gear);
    if (!prev) return false;
    this._gear = prev;
    this._gearConfig = SpeedClassifier.getConfigByCategory(prev)!;
    this._throttle = 0;
    return true;
  }

  /**
   * Update throttle based on input state. Call each frame.
   * @param dtMs Delta time in milliseconds
   */
  update(dtMs: number): void {
    const dtSec = dtMs / 1000;

    if (this.accelerating && !this.decelerating) {
      this._throttle = Math.min(1, this._throttle + this.rampUpRate * dtSec);
    } else if (this.decelerating && !this.accelerating) {
      this._throttle = Math.max(0, this._throttle - this.rampDownRate * dtSec);
    } else if (!this.accelerating && !this.decelerating) {
      // No input → coast down
      this._throttle = Math.max(0, this._throttle - this.rampDownRate * dtSec);
    }
    // Both pressed → maintain current throttle (no change)
  }

  /** Reset to idle. */
  reset(): void {
    this._throttle = 0;
    this.accelerating = false;
    this.decelerating = false;
  }
}
