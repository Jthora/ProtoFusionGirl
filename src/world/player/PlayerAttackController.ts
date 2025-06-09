import { EnemyInstance } from '../enemies/EnemyInstance';
import { AttackRegistry } from '../combat/AttackRegistry';
import { CombatService } from '../combat/CombatService';
import { PlayerStats } from './PlayerStats';
import { DamageNumber } from '../../ui/components/DamageNumber';
import Phaser from 'phaser';
import { Jane } from '../../core/Jane';
import { CombatSystem } from '../../combat/CombatSystem';

export interface PlayerAttackControllerConfig {
  scene: Phaser.Scene;
  playerSprite: Phaser.Physics.Arcade.Sprite;
  enemies: EnemyInstance[];
  enemySprites: Map<EnemyInstance, Phaser.Physics.Arcade.Sprite>;
  attackRegistry: AttackRegistry;
  getPlayerStats: () => PlayerStats;
  onEnemyDefeated: (enemy: EnemyInstance) => void;
  jane: Jane;
  combatSystem: CombatSystem;
}

export class PlayerAttackController {
  private scene: Phaser.Scene;
  private playerSprite: Phaser.Physics.Arcade.Sprite;
  private enemies: EnemyInstance[];
  private enemySprites: Map<EnemyInstance, Phaser.Physics.Arcade.Sprite>;
  private attackRegistry: AttackRegistry;
  private getPlayerStats: () => PlayerStats;
  private onEnemyDefeated: (enemy: EnemyInstance) => void;
  private jane: Jane;
  private combatSystem: CombatSystem;

  constructor(config: PlayerAttackControllerConfig) {
    this.scene = config.scene;
    this.playerSprite = config.playerSprite;
    this.enemies = config.enemies;
    this.enemySprites = config.enemySprites;
    this.attackRegistry = config.attackRegistry;
    this.getPlayerStats = config.getPlayerStats;
    this.onEnemyDefeated = config.onEnemyDefeated;
    this.jane = config.jane;
    this.combatSystem = config.combatSystem;
  }

  public attackNearestEnemy() {
    if (this.enemies.length === 0) return;
    // Find nearest alive enemy
    const px = this.playerSprite.x, py = this.playerSprite.y;
    let nearest: EnemyInstance | null = null;
    let minDist = Infinity;
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;
      const sprite = this.enemySprites.get(enemy);
      if (!sprite) continue;
      const dx = sprite.x - px, dy = sprite.y - py;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < minDist && dist < 60) { // 60px attack range
        minDist = dist;
        nearest = enemy;
      }
    }
    if (!nearest) return;

    // If Jane is mounted, use speeder attack logic
    if (this.jane.isMounted && this.jane.speeder) {
      this.combatSystem.speederAttack('ram');
      // Example: apply damage to enemy based on speeder's attack stat (placeholder value for now)
      const speederDamage = 15; // TODO: Replace with dynamic stat from MagnetoSpeeder
      nearest.takeDamage(speederDamage);
      const nearestSprite = this.enemySprites.get(nearest);
      if (nearestSprite) {
        const damageText = new DamageNumber(this.scene, nearestSprite.x, nearestSprite.y - 20, speederDamage);
        damageText.setOrigin(0.5, 0);
        this.scene.add.existing(damageText);
      }
      if (!nearest.isAlive) {
        this.onEnemyDefeated(nearest);
      }
      return;
    }

    // Otherwise, use standard player attack logic
    const attack = this.attackRegistry.getAttack('slime_bounce') || { id: 'basic', name: 'Punch', type: 'melee', damage: 5, range: 60, cooldown: 0.5 };
    const playerStats = this.getPlayerStats();
    const normalDamage = CombatService.playerAttackEnemy(playerStats, nearest, attack);
    const nearestSprite = this.enemySprites.get(nearest);
    if (nearestSprite) {
      const damageText = new DamageNumber(this.scene, nearestSprite.x, nearestSprite.y - 20, normalDamage);
      damageText.setOrigin(0.5, 0);
      this.scene.add.existing(damageText);
    }
    if (!nearest.isAlive) {
      this.onEnemyDefeated(nearest);
    }
  }
}
