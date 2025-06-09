// attackLoader.ts
// Loads attack definitions from data/attacks.json and registers them with the AttackRegistry
import { AttackRegistry } from '../world/combat/AttackRegistry';
import { AttackDefinition } from '../world/combat/AttackDefinition';
import attacksData from './attacks.json';

export function loadAttacks(registry: AttackRegistry) {
  (attacksData as AttackDefinition[]).forEach(attack => {
    registry.registerAttack(attack);
  });
}
