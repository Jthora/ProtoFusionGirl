export * from './CombatSystem';
export * from './PsiAbilities';
export * from './EnemyTypes';
export { loadAttacks } from '../data/attackLoader';

// Usage: Call loadAttacks(registry) after creating an AttackRegistry instance to load all attacks from data.
// Example:
//   import { AttackRegistry } from '../world/combat/AttackRegistry';
//   import { loadAttacks } from '../combat';
//   const registry = new AttackRegistry();
//   loadAttacks(registry);
//   // registry now contains all attacks from attacks.json
