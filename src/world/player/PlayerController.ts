import Phaser from 'phaser';
import { HealthBar } from '../../ui/components';
import { InputManager } from '../../core/controls/InputManager';
import { PlayerStats } from './PlayerStats';

export type PlayerState = 'idle' | 'run' | 'jump' | 'fall';

export interface PlayerControllerConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  texture: string;
  frame: number;
  animations: Array<{ key: string; frames: { start: number; end: number }; frameRate: number; repeat: number }>;
  maxHealth: number;
  moveSpeed: number;
  jumpForce: number;
  inputManager: InputManager;
}

export class PlayerController {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public healthBar: HealthBar;
  public state: PlayerState = 'idle';
  private lastState: PlayerState = 'idle';
  private health: number;
  private maxHealth: number;
  private moveSpeed: number;
  private jumpForce: number;
  private inputManager: InputManager;
  private stats: PlayerStats;
  private scene: Phaser.Scene;

  constructor(config: PlayerControllerConfig) {
    this.scene = config.scene;
    this.sprite = this.scene.physics.add.sprite(config.x, config.y, config.texture, config.frame);
    this.sprite.setCollideWorldBounds(true);
    this.maxHealth = config.maxHealth;
    this.health = config.maxHealth;
    this.moveSpeed = config.moveSpeed;
    this.jumpForce = config.jumpForce;
    this.inputManager = config.inputManager;
    this.stats = new PlayerStats({ health: this.health, attack: 5, defense: 2, speed: 100 });
    this.healthBar = new HealthBar({ scene: this.scene, x: 0, y: 0, max: this.maxHealth, value: this.health });
    this.healthBar.create();
    this.createAnimations(config.animations);
  }

  private createAnimations(anims: Array<{ key: string; frames: { start: number; end: number }; frameRate: number; repeat: number }>) {
    console.log('🎬 Creating player animations...');
    for (const anim of anims) {
      if (!this.scene.anims.exists(anim.key)) {
        this.scene.anims.create({
          key: anim.key,
          frames: this.scene.anims.generateFrameNumbers('player', anim.frames),
          frameRate: anim.frameRate,
          repeat: anim.repeat
        });
        console.log(`✅ Created animation: ${anim.key} (frames ${anim.frames.start}-${anim.frames.end})`);
      } else {
        console.log(`ℹ️ Animation already exists: ${anim.key}`);
      }
    }
    console.log('🎬 Animation creation complete');
  }

  public update() {
    const direction = this.inputManager.getDirection();
    this.sprite.setVelocityX(direction * this.moveSpeed);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body | undefined;
    const onGround = !!body && body.blocked && (body.blocked.down as boolean);
    const isMoving = direction !== 0;
    const isJumpPressed = this.inputManager.isJumpPressed();

    if (onGround) {
      if (isJumpPressed && this.canJump()) {
        this.sprite.setVelocityY(-this.jumpForce);
        this.state = 'jump';
      } else if (isMoving) {
        this.state = 'run';
      } else {
        this.state = 'idle';
      }
    } else {
      if (body && body.velocity.y < 0) {
        this.state = 'jump';
      } else {
        this.state = 'fall';
      }
    }

    if (this.state !== this.lastState) {
      console.log(`🎮 Playing animation: ${this.state} (previous: ${this.lastState})`);
      
      // Check if animation exists before playing
      if (this.scene.anims.exists(this.state)) {
        this.sprite.play(this.state, true);
        console.log(`✅ Animation '${this.state}' started successfully`);
      } else {
        console.error(`❌ Animation '${this.state}' does not exist!`);
      }
      
      this.lastState = this.state;
    }

    // Update health bar position
    this.healthBar.update(this.sprite.x, this.sprite.y - 34, this.health);
  }

  public canJump(): boolean {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body | undefined;
    return !!body && body.blocked && (body.blocked.down as boolean);
  }

  public setHealth(value: number) {
    this.health = Math.max(0, Math.min(this.maxHealth, value));
    this.stats.setBaseStats({
      health: this.health,
      attack: this.stats.getBaseStats().attack,
      defense: this.stats.getBaseStats().defense,
      speed: this.stats.getBaseStats().speed
    });
  }

  public getHealth() {
    return this.health;
  }

  public getStats() {
    return this.stats;
  }

  public destroy() {
    this.sprite.destroy();
    this.healthBar.destroy();
  }
}
