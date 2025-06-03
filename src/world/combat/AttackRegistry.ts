// AttackRegistry: Central registry for all attacks, mod support
import { AttackDefinition } from './AttackDefinition';

export class AttackRegistry {
  private attacks: Map<string, AttackDefinition> = new Map();
  private modAttackSources: Record<string, string[]> = {};

  registerAttack(attack: AttackDefinition, modId?: string) {
    this.attacks.set(attack.id, attack);
    if (modId) {
      if (!this.modAttackSources[modId]) this.modAttackSources[modId] = [];
      this.modAttackSources[modId].push(attack.id);
    }
  }

  registerAttacksFromMod(mod: { id: string, attacks: AttackDefinition[] }) {
    if (!mod.attacks) return;
    for (const attack of mod.attacks) {
      this.registerAttack(attack, mod.id);
    }
  }

  getAttack(id: string): AttackDefinition | undefined {
    return this.attacks.get(id);
  }

  getAllAttacks(): AttackDefinition[] {
    return Array.from(this.attacks.values());
  }
}
