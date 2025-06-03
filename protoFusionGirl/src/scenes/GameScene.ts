// GameScene.ts - protoFusionGirl core gameplay scene
// Implements player movement and prepares for tilemap, touch controls, and modding (see primer)
import Phaser from 'phaser';
import { PauseMenuScene } from './PauseMenuScene';
import { SettingsService } from '../services/SettingsService';
import { SettingsScene } from './SettingsScene';
import { HealthBar, TouchControls } from '../ui/components';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private backgroundFar!: Phaser.GameObjects.TileSprite;
  private backgroundNear!: Phaser.GameObjects.TileSprite;
  private playerHealth: number = 100;
  private maxHealth: number = 100;
  private touchControls?: { left: boolean; right: boolean; jump: boolean };
  private healthBarComponent!: HealthBar;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // --- PLAYER ASSETS ---
    // TODO: Add 'player.png' to src/assets/ (see primer for asset instructions)
    this.load.image('player', 'src/assets/player.png');

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

    // Create player sprite in the center of the screen
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // Set up keyboard controls
    if (!this.input.keyboard) throw new Error('Keyboard input not available');
    const cursors = this.input.keyboard.createCursorKeys();
    if (!cursors) throw new Error('Cursor keys not available');
    this.cursors = cursors;

    // --- TILEMAP SETUP ---
    // Create tilemap and layers
    const map = this.make.tilemap({ key: 'level1' });
    const tileset = map.addTilesetImage('tiles', 'tiles');
    if (!tileset) throw new Error('Tileset not found');
    // Assumes a layer named 'Ground' in Tiled
    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
    if (!groundLayer) throw new Error('Ground layer not found in tilemap');
    groundLayer.setCollisionByProperty({ collides: true });

    // Collide player with ground
    this.physics.add.collider(this.player, groundLayer, (player, tile) => {
      // Optional: Add custom logic for landing, sound, etc.
    });

    // Debug: Show collision tiles in development
    const showDebug = true;
    if (showDebug) {
      const debugGraphics = this.add.graphics().setAlpha(0.5);
      groundLayer.renderDebug(debugGraphics, {
        tileColor: null, // No color for non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Orange for colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Dark for face edges
      });
    }

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
      this.touchControls = { left: false, right: false, jump: false };
      new TouchControls({
        scene: this,
        width,
        height,
        onLeft: (down) => (this.touchControls!.left = down),
        onRight: (down) => (this.touchControls!.right = down),
        onJump: (down) => (this.touchControls!.jump = down),
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
  }

  update() {
    // Reset velocity
    this.player.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(200);
    }

    // Jumping
    if (
      this.cursors &&
      this.cursors.up &&
      this.cursors.up.isDown &&
      this.player.body &&
      this.player.body.blocked &&
      (this.player.body.blocked.down as boolean)
    ) {
      this.player.setVelocityY(-350);
    }

    // --- TOUCH CONTROLS LOGIC (modular) ---
    if (this.touchControls) {
      if (this.touchControls.left) {
        this.player.setVelocityX(-200);
      } else if (this.touchControls.right) {
        this.player.setVelocityX(200);
      }
      if (
        this.touchControls.jump &&
        this.player.body &&
        this.player.body.blocked &&
        (this.player.body.blocked.down as boolean)
      ) {
        this.player.setVelocityY(-350);
      }
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

    // TODO: Add tilemap collision logic
  }
}

export default GameScene;
