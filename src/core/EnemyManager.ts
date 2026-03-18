import Phaser from 'phaser';
import { EnemyRegistry } from '../world/enemies/EnemyRegistry';
import { EnemyInstance } from '../world/enemies/EnemyInstance';
import { AttackRegistry } from '../world/combat/AttackRegistry';
import { EnemyHealthBar } from '../ui/components/EnemyHealthBar';
import { EventBus } from './EventBus';

// EnemyManager.ts
// Handles enemy spawning, health bars, and combat logic
// Artifact reference: combat_mechanics_2025-06-04.artifact

const DETECTION_RANGE = 200;
const ATTACK_RANGE = 48;
const ATTACK_INTERVAL_MS = 800;
const PATROL_SPEED = 60;
const CHASE_SPEED = 120;
const DEATH_ANIM_MS = 300;

type EnemyState = 'patrol' | 'chase' | 'attack' | 'dying';

interface EnemyAIState {
  state: EnemyState;
  patrolDir: 1 | -1;
  lastAttackAt: number;
  dying: boolean;
}

export class EnemyManager {
  private scene: Phaser.Scene;
  private enemyRegistry: EnemyRegistry;
  // Reserved for future combat expansion (special attacks, cooldowns)
  // Prefix underscore to silence unused warning during incremental refactor
  private _attackRegistry: AttackRegistry;
  private groundGroup: Phaser.Physics.Arcade.StaticGroup;
  private playerController: any;
  private eventBus?: EventBus; // optional during incremental refactor
  public enemies: EnemyInstance[] = [];
  public enemySprites: Map<EnemyInstance, Phaser.Physics.Arcade.Sprite> = new Map();
  public enemyHealthBars: Map<EnemyInstance, EnemyHealthBar> = new Map();
  private enemyAI: Map<EnemyInstance, EnemyAIState> = new Map();

  constructor(
    scene: Phaser.Scene,
    enemyRegistry: EnemyRegistry,
  attackRegistry: AttackRegistry,
    groundGroup: Phaser.Physics.Arcade.StaticGroup,
    playerController: any,
    opts?: { eventBus?: EventBus }
  ) {
    this.scene = scene;
    this.enemyRegistry = enemyRegistry;
  this._attackRegistry = attackRegistry;
    this.groundGroup = groundGroup;
    this.playerController = playerController;
    this.eventBus = opts?.eventBus;
  }

  spawnEnemy(type: string, x: number, y: number) {
    const enemy = this.enemyRegistry.createEnemy(type, x, y);
    if (enemy) {
      this.enemies.push(enemy);

      // Check if sprite texture exists, use fallback if not
      let spriteTexture = enemy.definition.sprite;
      if (!this.scene.textures.exists(spriteTexture)) {
        console.warn(`Texture "${spriteTexture}" not found, using player texture as fallback`);
        spriteTexture = 'player';
      }

      const sprite = this.scene.physics.add.sprite(x, y, spriteTexture);
      sprite.setOrigin(0.5, 1);
      sprite.setCollideWorldBounds(true);
      sprite.setBounce(0.2);
      sprite.setTint(0x88ff88); // Green tint to distinguish enemies
      this.enemySprites.set(enemy, sprite);

      // Create and position health bar
      const healthBar = new EnemyHealthBar(this.scene, sprite.x - 20, sprite.y - 32, 40, 6);
      healthBar.updateHealth(enemy.health, enemy.definition.maxHealth);
      this.scene.add.existing(healthBar); // Add to scene
      this.enemyHealthBars.set(enemy, healthBar);

      // Initialize AI state
      this.enemyAI.set(enemy, {
        state: 'patrol',
        patrolDir: 1,
        lastAttackAt: 0,
        dying: false,
      });

      // Ground collision
      this.scene.physics.add.collider(sprite, this.groundGroup);
    }
  }

  /** Apply damage to the enemy closest to the given position, within range. */
  damageEnemy(enemy: EnemyInstance, amount: number): void {
    if (!enemy.isAlive) return;
    enemy.takeDamage(amount);
    const bar = this.enemyHealthBars.get(enemy);
    const sprite = this.enemySprites.get(enemy);
    if (bar && sprite) {
      bar.updateHealth(enemy.health, enemy.definition.maxHealth);
    }
  }

  update() {
    // Touch _attackRegistry to prevent unused variable elimination; future: drive enemy ability selection
    void this._attackRegistry;

    const janeSprite = this.playerController?.sprite as Phaser.Physics.Arcade.Sprite | undefined;
    const now = Date.now();

    for (const enemy of this.enemies) {
      const sprite = this.enemySprites.get(enemy);
      const ai = this.enemyAI.get(enemy);
      if (!sprite || !ai) continue;

      if (!enemy.isAlive) {
        if (!ai.dying) {
          ai.dying = true;
          ai.state = 'dying';
          // Death animation: scale to 0 over DEATH_ANIM_MS
          this.scene.tweens.add({
            targets: sprite,
            scaleX: 0,
            scaleY: 0,
            duration: DEATH_ANIM_MS,
            ease: 'Power2',
            onComplete: () => {
              // Remove from physics + scene
              const body = sprite.body as Phaser.Physics.Arcade.Body | null;
              if (body) body.enable = false;
              sprite.destroy();
              const bar = this.enemyHealthBars.get(enemy);
              if (bar) { bar.destroy(); this.enemyHealthBars.delete(enemy); }
              this.enemySprites.delete(enemy);
              this.enemyAI.delete(enemy);
              // Emit ENEMY_DEFEATED
              if (this.eventBus) {
                this.eventBus.emit({
                  type: 'ENEMY_DEFEATED',
                  data: { enemyId: enemy.definition.id || 'unknown' }
                });
              }
            }
          });
        }
        continue;
      }

      const body = sprite.body as Phaser.Physics.Arcade.Body | null;
      if (!body) continue;

      // Determine distance to Jane
      const distToJane = janeSprite
        ? Phaser.Math.Distance.Between(sprite.x, sprite.y, janeSprite.x, janeSprite.y)
        : Infinity;

      // State transitions
      if (ai.state !== 'dying') {
        if (distToJane <= ATTACK_RANGE) {
          ai.state = 'attack';
        } else if (distToJane <= DETECTION_RANGE) {
          ai.state = 'chase';
        } else {
          ai.state = 'patrol';
        }
      }

      // State behaviours
      switch (ai.state) {
        case 'patrol': {
          body.setVelocityX(PATROL_SPEED * ai.patrolDir);
          // Reverse at physics-blocked edges
          if (body.blocked.left) ai.patrolDir = 1;
          else if (body.blocked.right) ai.patrolDir = -1;
          break;
        }
        case 'chase': {
          if (janeSprite) {
            const dir = janeSprite.x < sprite.x ? -1 : 1;
            body.setVelocityX(CHASE_SPEED * dir);
          }
          break;
        }
        case 'attack': {
          // Stop moving
          body.setVelocityX(0);
          // Deal damage on interval
          if (now - ai.lastAttackAt >= ATTACK_INTERVAL_MS) {
            ai.lastAttackAt = now;
            if (this.playerController?.takeDamage) {
              this.playerController.takeDamage(enemy.definition.damage);
            }
            if (this.eventBus) {
              this.eventBus.emit({
                type: 'JANE_DAMAGED',
                data: { amount: enemy.definition.damage, health: this.playerController?.health ?? 100 }
              });
            }
          }
          break;
        }
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
