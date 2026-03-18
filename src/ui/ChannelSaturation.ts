/**
 * ChannelSaturation — Stage 4.3
 *
 * Tracks ASI observer channel saturation (0–100%).
 * High saturation degrades the ASI's ability to intervene actively.
 *
 * Costs (increase saturation):
 *   guidance pulse        +4%
 *   ley line stabilize    +10%
 *   emergency pulse       +25%
 *
 * Decay (reduce saturation):
 *   passive (no action)   −2% / min
 *   near active ley node  −5% / min
 *   Jane psionic flare    −15% instant
 *
 * Mechanical effects:
 *   51–75%  → active power cooldowns +50%
 *   76–90%  → some interventions blocked
 *   91–100% → passive observation only
 */

export type SaturationTier = 'clear' | 'elevated' | 'impaired' | 'locked';

export interface SaturationEvent {
  tier: SaturationTier;
  value: number;
}

type SaturationListener = (event: SaturationEvent) => void;

const DECAY_PER_SEC        = 2 / 60;        // 2% per minute → per second
const NEAR_NODE_DECAY_SEC  = 5 / 60;        // 5% per minute → per second
const COSTS = {
  guidance:    4,
  stabilize:   10,
  emergency:   25,
} as const;

function tierFor(value: number): SaturationTier {
  if (value >= 91) return 'locked';
  if (value >= 76) return 'impaired';
  if (value >= 51) return 'elevated';
  return 'clear';
}

export class ChannelSaturation {
  private _value  = 0;
  private _tier: SaturationTier = 'clear';
  private _nearNode = false;
  private _lastTick = 0;
  private _listeners: SaturationListener[] = [];

  constructor() {
    this._lastTick = performance.now();
  }

  // ── Tick (call once per frame or once per second) ─────────────────────────

  tick(): void {
    const now      = performance.now();
    const dtSec    = Math.min((now - this._lastTick) / 1000, 1);
    this._lastTick = now;

    const decay = this._nearNode ? NEAR_NODE_DECAY_SEC : DECAY_PER_SEC;
    this._set(this._value - decay * dtSec);
  }

  // ── Costs ─────────────────────────────────────────────────────────────────

  /** Returns false if locked (>90%) and action is blocked. */
  chargeGuidancePulse(): boolean {
    if (this._value >= 91) return false;
    this._set(this._value + COSTS.guidance);
    return true;
  }

  chargeLeylineStabilize(): boolean {
    if (this._value >= 91) return false;
    this._set(this._value + COSTS.stabilize);
    return true;
  }

  chargeEmergencyPulse(): boolean {
    if (this._value >= 91) return false;
    this._set(this._value + COSTS.emergency);
    return true;
  }

  // ── Reductions ────────────────────────────────────────────────────────────

  applyPsionicFlare(): void {
    this._set(this._value - 15);
  }

  setNearNode(near: boolean): void {
    this._nearNode = near;
  }

  // ── Cooldown multiplier (for Stage 4.3.2) ────────────────────────────────

  get cooldownMultiplier(): number {
    if (this._value >= 91) return Infinity;
    if (this._value >= 51) return 1.5;
    return 1;
  }

  get isLocked(): boolean {
    return this._value >= 91;
  }

  get isImpaired(): boolean {
    return this._value >= 76;
  }

  get value(): number {
    return this._value;
  }

  get tier(): SaturationTier {
    return this._tier;
  }

  // ── Event subscription ────────────────────────────────────────────────────

  on(listener: SaturationListener): () => void {
    this._listeners.push(listener);
    return () => { this._listeners = this._listeners.filter(l => l !== listener); };
  }

  private _set(raw: number): void {
    const clamped  = Math.max(0, Math.min(100, raw));
    const newTier  = tierFor(clamped);
    const tierChanged = newTier !== this._tier;

    this._value = clamped;
    this._tier  = newTier;

    if (tierChanged) {
      const event: SaturationEvent = { tier: newTier, value: clamped };
      this._listeners.forEach(l => l(event));
    }
  }

  reset(): void {
    this._value    = 0;
    this._tier     = 'clear';
    this._nearNode = false;
    this._lastTick = performance.now();
  }
}
