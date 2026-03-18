// AquaHero.ts
// Aqua — Water Hero companion with healing ability.
// Discoverable + repairable at a ley node.
// See: progress-tracker tasks 7221-7224

import { EventBus } from '../core/EventBus';
import { CompanionAI, DEFAULT_COMPANION_CONFIG } from './CompanionAI';

export interface AquaHeroConfig {
  /** Heal amount per tick (default 5) */
  healAmount?: number;
  /** Heal cooldown in ms (default 6000) */
  healCooldownMs?: number;
  /** HP threshold ratio to trigger auto-heal (default 0.6) */
  healThreshold?: number;
  /** Node ID where Aqua can be discovered */
  discoveryNodeId?: string;
}

const DEFAULT_AQUA_CONFIG: Required<AquaHeroConfig> = {
  healAmount: 5,
  healCooldownMs: 6000,
  healThreshold: 0.6,
  discoveryNodeId: 'ley_nexus',
};

export class AquaHero {
  private eventBus: EventBus;
  private companion: CompanionAI;
  private config: Required<AquaHeroConfig>;
  private healCooldownRemaining = 0;
  private discovered = false;
  private repaired = false;

  constructor(eventBus: EventBus, config?: AquaHeroConfig) {
    this.eventBus = eventBus;
    this.config = { ...DEFAULT_AQUA_CONFIG, ...config };
    this.companion = new CompanionAI(eventBus, {
      ...DEFAULT_COMPANION_CONFIG,
      id: 'aqua',
      type: 'hero_robot',
    });
  }

  /** Discover Aqua at a ley node (task 7223) */
  discover(): void {
    this.discovered = true;
    this.eventBus.emit({
      type: 'COMPANION_SPAWNED',
      data: { companionId: 'aqua', companionType: 'hero_robot', x: 0, y: 0 },
    });
  }

  /** Repair Aqua so she can join the squad */
  repair(): boolean {
    if (!this.discovered) return false;
    this.repaired = true;
    this.companion.setState('follow');
    return true;
  }

  /**
   * Attempt to heal an ally (task 7222).
   * Returns the heal amount applied, or 0 if on cooldown / not ready.
   */
  healAlly(allyCurrentHealth: number, allyMaxHealth: number): number {
    if (!this.repaired || !this.companion.isAlive()) return 0;
    if (this.healCooldownRemaining > 0) return 0;

    const ratio = allyCurrentHealth / allyMaxHealth;
    if (ratio >= this.config.healThreshold) return 0; // ally healthy enough

    const healAmount = Math.min(this.config.healAmount, allyMaxHealth - allyCurrentHealth);
    this.healCooldownRemaining = this.config.healCooldownMs;

    this.eventBus.emit({
      type: 'JANE_STATE_CHANGED',
      data: { newState: 'aqua_healing', previousState: 'normal' },
    });

    return healAmount;
  }

  /** Auto-check: should Aqua heal Jane? (call in update loop) */
  autoHealCheck(janeHealth: number, janeMaxHealth: number): number {
    return this.healAlly(janeHealth, janeMaxHealth);
  }

  /** Update cooldowns (call each frame) */
  update(dtMs: number, janeX: number, janeY: number): void {
    if (!this.repaired) return;
    if (this.healCooldownRemaining > 0) {
      this.healCooldownRemaining = Math.max(0, this.healCooldownRemaining - dtMs);
    }
    this.companion.update(dtMs, janeX, janeY);
  }

  getCompanion(): CompanionAI { return this.companion; }
  isDiscovered(): boolean { return this.discovered; }
  isRepaired(): boolean { return this.repaired; }
  isAlive(): boolean { return this.companion.isAlive(); }
  getDiscoveryNodeId(): string { return this.config.discoveryNodeId; }

  getHealCooldownRemaining(): number {
    return this.healCooldownRemaining;
  }
}
