// Jane.ts
// Core character class for Jane Tho'ra (FusionGirl)
// Implements stats, progression, AI hooks, and ASI/player duality
// See: copilot_development_anchor_roadmap_2025-06-05.artifact, PlayerManager.ts, ASIController.ts, docs/FusionGirl - Game Design Document_ Jane Tho'ra.md

import { EventBus } from './EventBus';

export interface JaneStats {
  health: number;
  maxHealth: number;
  psi: number;
  maxPsi: number;
  level: number;
  experience: number;
  skills: Record<string, number>;
}

export interface JaneConfig {
  name?: string;
  eventBus: EventBus;
  initialStats?: Partial<JaneStats>;
}

export class Jane {
  public name: string;
  public stats: JaneStats;
  private eventBus: EventBus;
  private aiEnabled: boolean = true;
  private asiOverride: boolean = false;

  constructor(config: JaneConfig) {
    this.name = config.name || "Jane Tho'ra";
    this.eventBus = config.eventBus;
    this.stats = {
      health: 100,
      maxHealth: 100,
      psi: 50,
      maxPsi: 50,
      level: 1,
      experience: 0,
      skills: {},
      ...config.initialStats
    };
  }

  // AI/ASI duality: allow ASI to take control
  setASIOverride(enabled: boolean) {
    this.asiOverride = enabled;
    this.eventBus.emit({ type: 'JANE_ASI_OVERRIDE', data: { enabled } });
  }

  isASIControlled() {
    return this.asiOverride;
  }

  // Example: stat/level progression
  gainExperience(amount: number) {
    this.stats.experience += amount;
    while (this.stats.experience >= this.getNextLevelXP()) {
      this.stats.experience -= this.getNextLevelXP();
      this.stats.level++;
      this.stats.maxHealth += 10;
      this.stats.maxPsi += 5;
      this.stats.health = this.stats.maxHealth;
      this.stats.psi = this.stats.maxPsi;
      this.eventBus.emit({ type: 'JANE_LEVEL_UP', data: { level: this.stats.level } });
    }
  }

  getNextLevelXP() {
    return 100 + (this.stats.level - 1) * 50;
  }

  // Example: take damage/heal
  takeDamage(amount: number) {
    this.stats.health = Math.max(0, this.stats.health - amount);
    this.eventBus.emit({ type: 'JANE_DAMAGED', data: { amount, health: this.stats.health } });
    if (this.stats.health === 0) {
      this.eventBus.emit({ type: 'JANE_DEFEATED', data: {} });
    }
  }

  heal(amount: number) {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
    this.eventBus.emit({ type: 'JANE_HEALED', data: { amount, health: this.stats.health } });
  }

  // Example: psi/ability use
  usePsi(amount: number) {
    if (this.stats.psi >= amount) {
      this.stats.psi -= amount;
      this.eventBus.emit({ type: 'JANE_PSI_USED', data: { amount, psi: this.stats.psi } });
      return true;
    }
    return false;
  }

  restorePsi(amount: number) {
    this.stats.psi = Math.min(this.stats.maxPsi, this.stats.psi + amount);
    this.eventBus.emit({ type: 'JANE_PSI_RESTORED', data: { amount, psi: this.stats.psi } });
  }

  // AI/behavior hooks (stub)
  updateAI(_dt: number) {
    if (!this.aiEnabled || this.asiOverride) return;
    // TODO: Implement Jane's autonomous behavior/decision-making
  }

  setAIEnabled(enabled: boolean) {
    this.aiEnabled = enabled;
  }

  isAIEnabled() {
    return this.aiEnabled;
  }
}
