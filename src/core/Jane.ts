// Jane.ts
// Core character class for Jane Tho'ra (FusionGirl)
// Implements stats, progression, AI hooks, and ASI/player duality
// See: copilot_development_anchor_roadmap_2025-06-05.artifact, PlayerManager.ts, ASIController.ts, docs/FusionGirl - Game Design Document_ Jane Tho'ra.md

import { EventBus } from './EventBus';
import { MagnetoSpeeder } from '../magneto/MagnetoSpeeder';
import { LeyLineManager } from '../world/leyline/LeyLineManager';
import { EventName, GameEvent } from './EventTypes';

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
  id?: string;
  name?: string;
  eventBus: import('./EventBus').EventBus;
  initialStats?: Partial<JaneStats>;
}

export class Jane {
  public id: string;
  public name: string;
  public stats: JaneStats;
  private eventBus: import('./EventBus').EventBus;
  private aiEnabled: boolean = true;
  private asiOverride: boolean = false;
  public speeder: MagnetoSpeeder | null = null;
  public isMounted: boolean = false;

  // World position (shared with speeder if mounted)
  public position: { x: number; y: number } = { x: 0, y: 0 };
  private leyLineManager?: LeyLineManager;

  constructor(config: JaneConfig & { leyLineManager?: LeyLineManager }) {
    this.id = config.id || 'jane';
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
    this.leyLineManager = config.leyLineManager;
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
      this.eventBus.emit({ type: 'JANE_LEVEL_UP', data: { level: this.stats.level } } as GameEvent<'JANE_LEVEL_UP'>);
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

  /**
   * Mounts the Magneto Speeder, instantiating if needed.
   */
  mountSpeeder() {
    if (!this.speeder) {
      this.speeder = new MagnetoSpeeder(this.leyLineManager);
    } else if (this.leyLineManager) {
      this.speeder.setLeyLineManager(this.leyLineManager);
    }
    this.isMounted = true;
    this.eventBus.emit({ type: 'JANE_MOUNTED_SPEEDER', data: {} });
  }

  /**
   * Dismounts the Magneto Speeder.
   */
  dismountSpeeder() {
    this.isMounted = false;
    this.eventBus.emit({ type: 'JANE_DISMOUNTED_SPEEDER', data: {} });
  }

  /**
   * Switches control mode of the speeder if mounted.
   */
  setSpeederMode(mode: 'manual' | 'auto') {
    if (this.speeder && this.isMounted) {
      this.speeder.setMode(mode);
      this.eventBus.emit({ type: 'SPEEDER_MODE_CHANGED', data: { mode } });
    }
  }

  /**
   * Example: Use Jane's psi to boost speeder energy if mounted.
   */
  boostSpeederWithPsi(psiAmount: number) {
    if (this.speeder && this.isMounted && this.stats.psi >= psiAmount) {
      this.stats.psi -= psiAmount;
      this.speeder.updateEnergy(psiAmount); // 1:1 boost for now
      this.eventBus.emit({ type: 'JANE_PSI_USED_FOR_SPEEDER', data: { psiAmount } });
    }
  }

  /**
   * Move Jane or the speeder (if mounted) to a new position.
   */
  moveTo(x: number, y: number) {
    if (this.isMounted && this.speeder) {
      this.speeder.setPosition(x, y);
      this.position = { x, y };
      this.eventBus.emit({ type: 'CHARACTER_MOVED', data: { id: this.name, x, y } } as GameEvent<'CHARACTER_MOVED'>);
    } else {
      this.position = { x, y };
      this.eventBus.emit({ type: 'CHARACTER_MOVED', data: { id: this.name, x, y } } as GameEvent<'CHARACTER_MOVED'>);
    }
  }

  /**
   * Requests a ley line-aware path from Jane's current position to a target.
   * Stores the path for future movement logic.
   */
  planLeyLineRouteTo(target: { x: number; y: number }) {
    if (this.leyLineManager) {
      this.leyLineManager.findLeyLinePath(this.position, target);
      // Optionally emit an event or update UI here
    }
  }

  /**
   * UI hook: Get current speeder status for display.
   */
  getSpeederStatus() {
    if (this.speeder && this.isMounted) {
      return {
        energy: this.speeder.energy,
        mode: this.speeder.mode,
        upgrades: this.speeder.upgrades,
      };
    }
    return null;
  }

  /**
   * Accessibility: Stub for unified remapping/colorblind settings.
   */
  setAccessibilityOption(option: string, value: any) {
    // TODO: Integrate with global accessibility system
    if (this.speeder) {
      // Forward to speeder if needed
      if (typeof this.speeder.setAccessibilityFeature === 'function') {
        this.speeder.setAccessibilityFeature(option, value);
      }
    }
    // ...apply to Jane as needed
  }

  /**
   * Save/load stubs for persistence.
   */
  toJSON() {
    return {
      name: this.name,
      stats: this.stats,
      position: this.position,
      isMounted: this.isMounted,
      speeder: this.speeder ? {
        energy: this.speeder.energy,
        mode: this.speeder.mode,
        upgrades: this.speeder.upgrades,
        position: this.speeder.position,
      } : null,
    };
  }

  static fromJSON(data: any, eventBus: EventBus): Jane {
    const jane = new Jane({ name: data.name, eventBus, initialStats: data.stats });
    jane.position = data.position;
    jane.isMounted = data.isMounted;
    if (data.speeder) {
      jane.speeder = new MagnetoSpeeder();
      jane.speeder.energy = data.speeder.energy;
      jane.speeder.mode = data.speeder.mode;
      jane.speeder.upgrades = data.speeder.upgrades;
      jane.speeder.position = data.speeder.position;
    }
    return jane;
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

// Reference: artifacts/copilot_leyline_unification_plan_2025-06-07.artifact
