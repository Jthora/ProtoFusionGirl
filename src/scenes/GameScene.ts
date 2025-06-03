// GameScene.ts - protoFusionGirl core gameplay scene
// Implements player movement and prepares for tilemap, touch controls, and modding (see primer)
// TODO: Add touch controls for mobile (see .primer)
// TODO: Implement a JSON-based tilemap (see .primer)
// TODO: Add a scrolling background with parallax effect (see .primer)
// TODO: Implement a health bar UI above the player sprite (see .primer)
// TODO: Reference artifacts/tilemap_system_design.artifact for tilemap logic

import Phaser from 'phaser';
import { PauseMenuScene } from './PauseMenuScene';
import { SettingsService } from '../services/SettingsService';
import { SettingsScene } from './SettingsScene';
import { HealthBar, TouchControls } from '../ui/components';
import { EnemyHealthBar } from '../ui/components/EnemyHealthBar';
import { DamageNumber } from '../ui/components/DamageNumber';
import { InputManager } from '../core/controls/InputManager';
import { TilemapManager } from '../world/tilemap/TilemapManager';
import { EnemyRegistry } from '../world/enemies/EnemyRegistry';
import { EnemyInstance } from '../world/enemies/EnemyInstance';
import { AttackRegistry } from '../world/combat/AttackRegistry';
import { CombatService } from '../world/combat/CombatService';
import { registerModEnemies, registerModAttacks } from '../mods/mod_loader';
import sampleEnemyMod from '../mods/sample_enemy_mod.json';
import { PlayerStats } from '../world/player/PlayerStats';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private backgroundFar!: Phaser.GameObjects.TileSprite;
  private backgroundNear!: Phaser.GameObjects.TileSprite;
  private playerHealth: number = 100;
  private maxHealth: number = 100;
  private healthBarComponent!: HealthBar;
  private moveSpeed = 200;
  private jumpForce = 350;
  private inputManager!: InputManager;
  private tilemapManager!: TilemapManager;

  // --- Player State Machine ---
  private playerState: 'idle' | 'running' | 'jumping' | 'falling' = 'idle';
  private lastPlayerState: typeof this.playerState = 'idle';

  // --- Character/Animation/Game State ---
  private playerConfig = {
    startX: 400,
    startY: 300,
    texture: 'player',
    frame: 0,
    animations: [
      { key: 'idle', frames: { start: 0, end: 3 }, frameRate: 6, repeat: -1 },
      { key: 'run', frames: { start: 4, end: 9 }, frameRate: 12, repeat: -1 },
      { key: 'jump', frames: { start: 10, end: 12 }, frameRate: 8, repeat: 0 },
      { key: 'fall', frames: { start: 13, end: 15 }, frameRate: 8, repeat: 0 }
    ]
  };

  private gameState: 'playing' | 'paused' | 'gameover' = 'playing';

  // Tilemap variables
  private tilemap?: Phaser.Tilemaps.Tilemap;
  private groundLayer?: Phaser.Tilemaps.TilemapLayer;
  // For future: chunk management
  private loadedChunks: Map<string, Phaser.Tilemaps.TilemapLayer> = new Map();

  // Enemy and combat variables
  private enemyRegistry = new EnemyRegistry();
  private attackRegistry = new AttackRegistry();
  private enemies: EnemyInstance[] = [];
  private enemySprites: Map<EnemyInstance, Phaser.Physics.Arcade.Sprite> = new Map();
  private enemyHealthBars: Map<EnemyInstance, EnemyHealthBar> = new Map();

  private _playerStats?: PlayerStats;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // --- PLAYER ASSETS ---
    this.load.spritesheet('player', 'src/assets/player.png', { frameWidth: 48, frameHeight: 48 });

    // --- TILEMAP ASSETS ---
    // TODO: Add 'tiles.json' (Tiled map export) and 'tiles.png' (tileset image) to src/assets/
    this.load.tilemapTiledJSON('level1', 'src/assets/tiles.json');
    this.load.image('tiles', 'src/assets/tiles.png');

    // --- BACKGROUND ASSETS ---
    this.load.image('background-far', 'assets/background-far.png');
    this.load.image('background-near', 'assets/background-near.png');
  }

  create() {
    // --- Settings integration ---
    const settings = SettingsService.getInstance();
    if (settings.get('showDebug')) {
      // Example: enable debug overlays, etc.
      console.log('[Settings] Debug mode enabled');
    }
    settings.onChange((newSettings) => {
      // React to settings changes globally
      if (typeof newSettings.showDebug === 'boolean') {
        // Toggle debug overlays, etc.
      }
    });

    // Parallax backgrounds
    this.backgroundFar = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background-far').setOrigin(0, 0).setScrollFactor(0);
    this.backgroundNear = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background-near').setOrigin(0, 0).setScrollFactor(0);

    // --- PLAYER ANIMATIONS ---
    this.createPlayerAnimations();
    // --- Create player sprite ---
    this.player = this.physics.add.sprite(
      this.playerConfig.startX,
      this.playerConfig.startY,
      this.playerConfig.texture,
      this.playerConfig.frame
    );
    this.player.setCollideWorldBounds(true);

    // --- INPUT MANAGER SETUP ---
    this.inputManager = InputManager.getInstance(this);

    // --- MAP SYSTEM SETUP ---
    this.setupMapSystem();

    // Health bar UI above player (modular)
    this.healthBarComponent = new HealthBar({
      scene: this,
      x: 0,
      y: 0,
      max: this.maxHealth,
      value: this.playerHealth
    });
    this.healthBarComponent.create();

    // --- TOUCH CONTROLS FOR MOBILE (modular) ---
    if (this.sys.game.device.input.touch) {
      const width = this.scale.width;
      const height = this.scale.height;
      const touchInput = this.inputManager.getTouchInput();
      new TouchControls({
        scene: this,
        width,
        height,
        onLeft: (down) => touchInput.setLeft(down),
        onRight: (down) => touchInput.setRight(down),
        onJump: (down) => touchInput.setJump(down),
      }).create();
      this.input.addPointer(2);
    }

    // Register PauseMenuScene and SettingsScene if not already
    if (!this.scene.get('PauseMenuScene')) {
      this.scene.add('PauseMenuScene', PauseMenuScene, false);
    }
    if (!this.scene.get('SettingsScene')) {
      this.scene.add('SettingsScene', SettingsScene, false);
    }
    // Listen for ESC key to pause
    this.input.keyboard?.on('keydown-ESC', () => {
      if (!this.scene.isPaused('GameScene')) {
        this.scene.launch('PauseMenuScene');
        this.scene.pause();
      }
    });

    // Ensure backgrounds are behind everything
    this.children.sendToBack(this.backgroundFar);
    this.children.sendToBack(this.backgroundNear);

    // --- TILEMAP MANAGER & EQUIPMENT UI ---
    this.tilemapManager = new TilemapManager();
    // Give player some starter equipment for demo
    this.tilemapManager.equipmentService.equipItem('cyber_helmet', 'head');
    // Integrate inventory and equipment panels for equip flow
    this.tilemapManager.inventoryPanel.setEquipmentIntegration(this.tilemapManager.equipmentService, 'weapon');
    // Render equipment, inventory, and crafting panels
    this.tilemapManager.equipmentPanel.render(this);
    this.tilemapManager.inventoryPanel.render(this);
    this.tilemapManager.craftingPanel.render(this);

    // Register enemies and attacks from mods
    registerModEnemies(sampleEnemyMod, this.enemyRegistry);
    registerModAttacks(sampleEnemyMod, this.attackRegistry);
    // Spawn a demo enemy
    this.spawnEnemy('slime', 600, 300);

    // Listen for attack input (spacebar)
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.playerAttackNearestEnemy();
    });
  }

  private createPlayerAnimations() {
    for (const anim of this.playerConfig.animations) {
      if (!this.anims.exists(anim.key)) {
        this.anims.create({
          key: anim.key,
          frames: this.anims.generateFrameNumbers('player', anim.frames),
          frameRate: anim.frameRate,
          repeat: anim.repeat
        });
      }
    }
  }

  private spawnEnemy(enemyId: string, x: number, y: number) {
    const def = this.enemyRegistry.getEnemy(enemyId);
    if (!def) return;
    const enemy = new EnemyInstance(def, x, y);
    this.enemies.push(enemy);
    const sprite = this.physics.add.sprite(x, y, def.sprite);
    sprite.setCollideWorldBounds(true);
    this.enemySprites.set(enemy, sprite);
    // Collide with ground
    if (this.groundLayer) {
      this.physics.add.collider(sprite, this.groundLayer);
    }
    // Simple AI: patrol left/right
    sprite.setVelocityX(def.speed * (Math.random() < 0.5 ? 1 : -1));
    // Health bar
    const healthBar = new EnemyHealthBar(this, 0, 0, 40, 6);
    this.add.existing(healthBar);
    this.enemyHealthBars.set(enemy, healthBar);
  }

  private playerAttackNearestEnemy() {
    if (this.enemies.length === 0) return;
    // Find nearest alive enemy
    const px = this.player.x, py = this.player.y;
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
    // Use first attack from registry (or fallback)
    const attack = this.attackRegistry.getAttack('slime_bounce') || { id: 'basic', name: 'Punch', type: 'melee', damage: 5, range: 60, cooldown: 0.5 };
    const playerStats = this.getPlayerStats();
    const damage = CombatService.playerAttackEnemy(playerStats, nearest, attack);
    // Show damage number
    const sprite = this.enemySprites.get(nearest);
    if (sprite) {
      const damageText = new DamageNumber(this, sprite.x, sprite.y - 20, damage);
      damageText.setOrigin(0.5, 0);
      this.add.existing(damageText);
      damageText.play('damage_floating');
    }
  }

  private getPlayerStats(): PlayerStats {
    // Use the tilemapManager's equipmentService for stat calculation
    if (!this._playerStats) {
      this._playerStats = new PlayerStats(
        { health: this.playerHealth, attack: 5, defense: 2, speed: 100 },
        this.tilemapManager.equipmentService
      );
    }
    // Sync health
    this._playerStats.setBaseStats({
      health: this.playerHealth,
      attack: 5,
      defense: 2,
      speed: 100
    });
    return this._playerStats;
  }

  private canJump(): boolean {
    const body = this.player.body as Phaser.Physics.Arcade.Body | undefined;
    return !!body && body.blocked && (body.blocked.down as boolean);
  }

  update() {
    // --- Robust input: allow for future expansion (multiplayer, rebinding, etc.) ---
    const direction = this.inputManager.getDirection();
    this.player.setVelocityX(direction * this.moveSpeed);

    // State machine: determine state
    const body = this.player.body as Phaser.Physics.Arcade.Body | undefined;
    const onGround = !!body && body.blocked && (body.blocked.down as boolean);
    const isMoving = direction !== 0;
    const isJumpPressed = this.inputManager.isJumpPressed();

    if (onGround) {
      if (isJumpPressed && this.canJump()) {
        this.player.setVelocityY(-this.jumpForce);
        this.playerState = 'jumping';
      } else if (isMoving) {
        this.playerState = 'running';
      } else {
        this.playerState = 'idle';
      }
    } else {
      if (body && body.velocity.y < 0) {
        this.playerState = 'jumping';
      } else {
        this.playerState = 'falling';
      }
    }

    // --- Animation Hooks ---
    if (this.playerState !== this.lastPlayerState) {
      switch (this.playerState) {
        case 'idle':
          this.player.play('idle', true);
          break;
        case 'running':
          this.player.play('run', true);
          break;
        case 'jumping':
          this.player.play('jump', true);
          break;
        case 'falling':
          this.player.play('fall', true);
          break;
      }
      this.lastPlayerState = this.playerState;
    }

    // Parallax effect: move backgrounds at different rates based on camera scroll
    if (this.cameras && this.cameras.main) {
      this.backgroundFar.tilePositionX = this.cameras.main.scrollX * 0.2;
      this.backgroundNear.tilePositionX = this.cameras.main.scrollX * 0.5;
    }

    // Update health bar position above player (modular)
    if (this.player && this.healthBarComponent) {
      this.healthBarComponent.update(this.player.x, this.player.y - 34, this.playerHealth);
    }

    // Update enemy sprites and health bars
    for (const enemy of this.enemies) {
      const sprite = this.enemySprites.get(enemy);
      const bar = this.enemyHealthBars.get(enemy);
      if (sprite && enemy.isAlive) {
        // Simple AI: bounce at edges
        const sBody = sprite.body as Phaser.Physics.Arcade.Body | null;
        if (sBody && (sBody.blocked.left || sBody.blocked.right)) {
          sprite.setVelocityX(-sBody.velocity.x);
        }
        // Update health bar position
        if (bar) bar.updateHealth(enemy.health, enemy.definition.maxHealth);
        if (bar) bar.setPosition(sprite.x - 20, sprite.y - 32);
      }
    }
  }

  private setupMapSystem() {
    // --- TILEMAP SYSTEM ---
    const map = this.make.tilemap({ key: 'level1' });
    this.tilemap = map;

    // Tileset integration
    const tileset = map.addTilesetImage('tiles', 'tiles');
    this.groundLayer = map.createLayer('Ground', tileset, 0, 0).setCollisionByProperty({ collides: true });

    // --- CAMERA SETUP ---
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Follow player
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    // --- DEBUGGING VISUALS ---
    this.add.debug.geom(new Phaser.Geom.Rectangle(0, 0, map.widthInPixels, map.heightInPixels), 0xff0000);
    this.add.text(16, 16, 'Debug Info', { color: '#ffffff' });
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject === this.player) {
        this.scene.restart();
      }
    });
  }

  // --- PAUSE / RESUME ---
  pause() {
    this.scene.pause();
    this.gameState = 'paused';
  }

  resume() {
    this.scene.resume();
    this.gameState = 'playing';
  }
}
