// attackLoader.ts
// Loads attack definitions from data/attacks.json and registers them with the AttackRegistry
import { AttackRegistry } from '../world/combat/AttackRegistry';
import { AttackDefinition } from '../world/combat/AttackDefinition';
import attacksData from './attacks.json';

export function loadAttacks(registry: AttackRegistry) {
  if (!attacksData || typeof attacksData !== 'object') return;
  const arr = Array.isArray(attacksData) ? attacksData : (attacksData as any).attacks || [];
  if (!Array.isArray(arr)) return;
  (arr as AttackDefinition[]).forEach(attack => {
    if (attack && (attack as any).id) {
      registry.registerAttack(attack);
    }
  });
}
