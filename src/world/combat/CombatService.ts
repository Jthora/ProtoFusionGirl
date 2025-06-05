// CombatService: Handles attack resolution, damage, stat effects
import { EnemyInstance } from '../enemies/EnemyInstance';
import { PlayerStats } from '../player/PlayerStats';
import { AttackDefinition } from './AttackDefinition';

export class CombatService {
  // Enhancement: Ability effects in combat
  static playerAttackEnemy(player: PlayerStats, enemy: EnemyInstance, attack: AttackDefinition, abilityId?: string) {
    const stats = player.getStats();
    let baseDamage = (stats.attack || 1) + attack.damage;
    // If an ability is used, apply its effect to the enemy
    if (abilityId) {
      const ability = player.getAbilities().find(a => a.id === abilityId);
      if (ability && ability.effect) {
        ability.effect(enemy);
      }
    }
    const defense = enemy.definition.defense;
    const damage = Math.max(1, baseDamage - defense);
    enemy.takeDamage(damage);
    return damage;
  }

  static enemyAttackPlayer(enemy: EnemyInstance, player: PlayerStats) {
    const stats = player.getStats();
    const baseDamage = enemy.definition.attack;
    const defense = stats.defense || 0;
    const damage = Math.max(1, baseDamage - defense);
    // Apply status effects (e.g., shield, debuff)
    player.setBaseStats({
      ...stats,
      health: Math.max(0, (stats.health || 0) - damage)
    });
    return damage;
  }
}
