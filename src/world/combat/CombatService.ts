// CombatService: Handles attack resolution, damage, stat effects
import { EnemyInstance } from '../enemies/EnemyInstance';
import { PlayerStats } from '../player/PlayerStats';
import { AttackDefinition } from './AttackDefinition';

export class CombatService {
  static playerAttackEnemy(player: PlayerStats, enemy: EnemyInstance, attack: AttackDefinition) {
    // Simple damage formula: (player attack + attack.damage) - enemy.defense
    const baseDamage = (player.attack || 1) + attack.damage;
    const defense = enemy.definition.defense;
    const damage = Math.max(1, baseDamage - defense);
    enemy.takeDamage(damage);
    return damage;
  }

  static enemyAttackPlayer(enemy: EnemyInstance, player: PlayerStats) {
    // Simple damage formula: enemy.attack - player.defense
    const baseDamage = enemy.definition.attack;
    const defense = player.defense || 0;
    const damage = Math.max(1, baseDamage - defense);
    player.health = Math.max(0, (player.health || 0) - damage);
    return damage;
  }
}
