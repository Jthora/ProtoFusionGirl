// AttackLoader.test.ts
import { AttackRegistry } from '../../src/world/combat/AttackRegistry';
import { loadAttacks } from '../../src/data/attackLoader';
import attacksData from '../../src/data/attacks.json';

describe('AttackLoader', () => {
  it('loads all attacks from attacks.json into the registry', () => {
    const registry = new AttackRegistry();
    loadAttacks(registry);
    const allAttacks = registry.getAllAttacks();
    expect(allAttacks.length).toBe(attacksData.length);
    for (const attack of attacksData) {
      expect(registry.getAttack(attack.id)).toMatchObject(attack);
    }
  });
});
