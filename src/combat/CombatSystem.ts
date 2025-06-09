// CombatSystem.ts
// Handles Magneto Speeder-based combat, synergy with Jane's abilities, and event integration
// References: magneto_speeder_gameplay_foundation_2025-06-06.artifact

import { MagnetoSpeeder } from '../magneto/MagnetoSpeeder';
import { Jane } from '../core/Jane';
import { EventBus } from '../core/EventBus';

export class CombatSystem {
  private speeder: MagnetoSpeeder;
  private jane: Jane;
  private eventBus: EventBus;

  constructor(jane: Jane, speeder: MagnetoSpeeder, eventBus: EventBus) {
    this.jane = jane;
    this.speeder = speeder;
    this.eventBus = eventBus;
  }

  /**
   * Executes a speeder-based attack, optionally using Jane's psi for synergy.
   */
  speederAttack(type: 'ram' | 'dash' | 'psi-burst', psiCost: number = 0) {
    if (this.jane.isMounted && this.speeder.energy > 0) {
      if (psiCost > 0 && this.jane.stats.psi >= psiCost) {
        this.jane.stats.psi -= psiCost;
        // Psi synergy: boost attack effect
        this.eventBus.emit({ type: 'SPEEDER_PSI_ATTACK', data: { type, psiCost } });
      } else if (psiCost > 0) {
        // Not enough psi
        this.eventBus.emit({ type: 'SPEEDER_ATTACK_FAILED', data: { reason: 'not_enough_psi' } });
        return;
      }
      // Drain energy for attack
      this.speeder.updateEnergy(-10);
      this.eventBus.emit({ type: 'SPEEDER_ATTACK', data: { type } });
    } else {
      this.eventBus.emit({ type: 'SPEEDER_ATTACK_FAILED', data: { reason: 'not_mounted_or_no_energy' } });
    }
  }

  /**
   * Handles incoming damage to the speeder (e.g., from world hazards or combat).
   */
  applyDamage(amount: number) {
    this.speeder.updateEnergy(-amount);
    this.eventBus.emit({ type: 'SPEEDER_DAMAGED', data: { amount, energy: this.speeder.energy } });
    if (this.speeder.energy <= 0) {
      this.eventBus.emit({ type: 'SPEEDER_DISABLED', data: {} });
      // Optionally auto-dismount Jane
      this.jane.dismountSpeeder();
    }
  }
}
