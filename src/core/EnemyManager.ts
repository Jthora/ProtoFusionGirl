import Phaser from 'phaser';
import { EnemyRegistry } from '../world/enemies/EnemyRegistry';
import { EnemyInstance } from '../world/enemies/EnemyInstance';
import { AttackRegistry } from '../world/combat/AttackRegistry';
import { EnemyHealthBar } from '../ui/components/EnemyHealthBar';

// EnemyManager.ts
// Handles enemy spawning, health bars, and combat logic
// Artifact reference: combat_mechanics_2025-06-04.artifact

export class EnemyManager {
  private scene: Phaser.Scene;
  private enemyRegistry: EnemyRegistry;
  private attackRegistry: AttackRegistry;
  private groundGroup: Phaser.Physics.Arcade.StaticGroup;
  private playerController: any;
  public enemies: EnemyInstance[] = [];
  public enemySprites: Map<EnemyInstance, Phaser.Physics.Arcade.Sprite> = new Map();
  public enemyHealthBars: Map<EnemyInstance, EnemyHealthBar> = new Map();

  constructor(scene: Phaser.Scene, enemyRegistry: EnemyRegistry, attackRegistry: AttackRegistry, groundGroup: Phaser.Physics.Arcade.StaticGroup, playerController: any) {
    this.scene = scene;
    this.enemyRegistry = enemyRegistry;
    this.attackRegistry = attackRegistry;
    this.groundGroup = groundGroup;
    this.playerController = playerController;
  }

  spawnEnemy(type: string, x: number, y: number) {
    const enemy = this.enemyRegistry.createEnemy(type, x, y);
    if (enemy) {
      this.enemies.push(enemy);
      const sprite = this.scene.physics.add.sprite(x, y, enemy.texture);
      sprite.setOrigin(0.5, 1);
      sprite.setCollideWorldBounds(true);
      sprite.setBounce(0.2);
      this.enemySprites.set(enemy, sprite);

      // Create and position health bar
      const healthBar = new EnemyHealthBar(this.scene, enemy.health, enemy.definition.maxHealth);
      healthBar.setPosition(sprite.x - 20, sprite.y - 32);
      this.enemyHealthBars.set(enemy, healthBar);

      // Basic enemy AI (demo)
      this.scene.physics.add.collider(sprite, this.groundGroup);
      this.scene.physics.add.overlap(sprite, this.playerController.sprite, () => {
        if (enemy.isAlive) {
          this.playerController.takeDamage(enemy.definition.damage);
        }
      });
    }
  }

  update() {
    for (const enemy of this.enemies) {
      const sprite = this.enemySprites.get(enemy);
      if (sprite && enemy.isAlive) {
        // Simple AI: bounce at edges
        const sBody = sprite.body as Phaser.Physics.Arcade.Body | null;
        if (sBody && (sBody.blocked.left || sBody.blocked.right)) {
          sprite.setVelocityX(-sBody.velocity.x);
        }
        // Update health bar position
        const bar = this.enemyHealthBars.get(enemy);
        if (bar) {
          bar.updateHealth(enemy.health, enemy.definition.maxHealth);
          bar.setPosition(sprite.x - 20, sprite.y - 32);
        }
      }
    }
  }
}
