// CompanionAI.ts
// AI for robot and alternate Jane companions.
// Implements follow, shield, hold-position states.
// See: progress-tracker tasks 5211-5213

import { EventBus } from '../core/EventBus';

export type CompanionState = 'follow' | 'shield' | 'hold_position' | 'idle';

export interface CompanionConfig {
  id: string;
  type: string; // 'terra', 'minion', 'hero_robot'
  followDistance: number;
  shieldDuration: number; // ms
  shieldCooldown: number; // ms
  moveSpeed: number;
}

export const DEFAULT_COMPANION_CONFIG: Omit<CompanionConfig, 'id' | 'type'> = {
  followDistance: 60,
  shieldDuration: 3000,
  shieldCooldown: 8000,
  moveSpeed: 120,
};

export class CompanionAI {
  private eventBus: EventBus;
  readonly config: CompanionConfig;
  private state: CompanionState = 'idle';
  private x: number = 0;
  private y: number = 0;
  private health: number = 100;
  private maxHealth: number = 100;

  // Shield state
  private shielding: boolean = false;
  private shieldTarget: string | null = null;
  private shieldTimer: number = 0;
  private shieldCooldownTimer: number = 0;

  // Follow target
  private followTargetX: number = 0;
  private followTargetY: number = 0;

  // Hold position
  private holdX: number = 0;
  private holdY: number = 0;

  constructor(eventBus: EventBus, config: CompanionConfig) {
    this.eventBus = eventBus;
    this.config = config;
  }

  getState(): CompanionState { return this.state; }
  getPosition(): { x: number; y: number } { return { x: this.x, y: this.y }; }
  getHealth(): number { return this.health; }
  isShielding(): boolean { return this.shielding; }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /** Transition to a new state */
  setState(newState: CompanionState): void {
    if (newState === this.state) return;
    const prev = this.state;
    this.state = newState;
    this.eventBus.emit({
      type: 'COMPANION_STATE_CHANGED',
      data: { companionId: this.config.id, previousState: prev, newState }
    });
  }

  /** Command the companion: 'follow', 'shield', 'hold', 'defend_here' */
  command(cmd: string, x?: number, y?: number): void {
    this.eventBus.emit({
      type: 'COMPANION_COMMAND',
      data: { companionId: this.config.id, command: cmd, x, y }
    });
    switch (cmd) {
      case 'follow':
        this.setState('follow');
        break;
      case 'shield':
        this.activateShield('player');
        break;
      case 'hold':
      case 'defend_here':
        this.holdX = x ?? this.x;
        this.holdY = y ?? this.y;
        this.setState('hold_position');
        break;
    }
  }

  /** Activate shield ability on a target */
  activateShield(targetId: string): boolean {
    if (this.shieldCooldownTimer > 0 || this.shielding) return false;
    this.shielding = true;
    this.shieldTarget = targetId;
    this.shieldTimer = this.config.shieldDuration;
    this.setState('shield');
    this.eventBus.emit({
      type: 'COMPANION_SHIELD_ACTIVATED',
      data: { companionId: this.config.id, targetId, duration: this.config.shieldDuration }
    });
    return true;
  }

  /** Auto-shield: shields if enemy is nearby and cooldown is ready */
  autoShieldCheck(enemyNearby: boolean, targetId: string): boolean {
    if (!enemyNearby || this.shielding || this.shieldCooldownTimer > 0) return false;
    return this.activateShield(targetId);
  }

  /** Update companion AI each frame */
  update(dtMs: number, janeX: number, janeY: number): void {
    this.followTargetX = janeX;
    this.followTargetY = janeY;

    // Shield timer
    if (this.shielding) {
      this.shieldTimer -= dtMs;
      if (this.shieldTimer <= 0) {
        this.shielding = false;
        this.shieldTarget = null;
        this.shieldCooldownTimer = this.config.shieldCooldown;
        this.setState('follow');
      }
    }

    // Shield cooldown
    if (this.shieldCooldownTimer > 0) {
      this.shieldCooldownTimer -= dtMs;
      if (this.shieldCooldownTimer < 0) this.shieldCooldownTimer = 0;
    }

    // Movement based on state
    switch (this.state) {
      case 'follow':
        this.moveToward(janeX, janeY, this.config.followDistance, dtMs);
        break;
      case 'hold_position':
        this.moveToward(this.holdX, this.holdY, 5, dtMs);
        break;
      case 'shield':
        this.moveToward(janeX, janeY, 30, dtMs);
        break;
      case 'idle':
        break;
    }
  }

  private moveToward(tx: number, ty: number, minDist: number, dtMs: number): void {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= minDist) return;

    const step = (this.config.moveSpeed * dtMs) / 1000;
    const ratio = Math.min(step / dist, 1);
    this.x += dx * ratio;
    this.y += dy * ratio;
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  isAlive(): boolean {
    return this.health > 0;
  }

  destroy(): void {
    this.state = 'idle';
    this.shielding = false;
  }
}
