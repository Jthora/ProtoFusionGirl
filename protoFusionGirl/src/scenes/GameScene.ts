// GameScene.ts - protoFusionGirl core gameplay scene
// Implements player movement and prepares for tilemap, touch controls, and modding (see primer)
import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private backgroundFar!: Phaser.GameObjects.TileSprite;
  private backgroundNear!: Phaser.GameObjects.TileSprite;
  private healthBarBg!: Phaser.GameObjects.Rectangle;
  private healthBar!: Phaser.GameObjects.Rectangle;
  private playerHealth: number = 100;
  private maxHealth: number = 100;
  private touchControls!: { left: boolean; right: boolean; jump: boolean };

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
    this.physics.add.collider(this.player, groundLayer);

    // Health bar UI above player
    this.healthBarBg = this.add.rectangle(0, 0, 52, 10, 0x222222).setOrigin(0.5, 1);
    this.healthBar = this.add.rectangle(0, 0, 50, 8, 0xff3366).setOrigin(0.5, 1);
    this.healthBar.setDepth(10);
    this.healthBarBg.setDepth(9);

    // --- TOUCH CONTROLS FOR MOBILE ---
    if (this.sys.game.device.input.touch) {
      // Add left/right/jump zones
      const width = this.scale.width;
      const height = this.scale.height;
      // Visual feedback rectangles (optional)
      this.add.rectangle(width * 0.165, height * 0.5, width * 0.33, height, 0x00aaff, 0.08).setOrigin(0.5);
      this.add.rectangle(width * 0.835, height * 0.5, width * 0.33, height, 0x00ff88, 0.08).setOrigin(0.5);
      this.add.rectangle(width * 0.5, height * 0.25, width * 0.34, height * 0.5, 0xffaa00, 0.08).setOrigin(0.5);
      // Touch zones
      const leftZone = this.add.zone(0, height * 0.5, width * 0.33, height)
        .setOrigin(0, 0.5)
        .setInteractive();
      const rightZone = this.add.zone(width * 0.67, height * 0.5, width * 0.33, height)
        .setOrigin(0, 0.5)
        .setInteractive();
      const jumpZone = this.add.zone(width * 0.33, 0, width * 0.34, height * 0.5)
        .setOrigin(0, 0)
        .setInteractive();

      // Touch state
      this.input.addPointer(2);
      this.touchControls = { left: false, right: false, jump: false };

      leftZone.on('pointerdown', () => (this.touchControls.left = true));
      leftZone.on('pointerup', () => (this.touchControls.left = false));
      leftZone.on('pointerout', () => (this.touchControls.left = false));
      rightZone.on('pointerdown', () => (this.touchControls.right = true));
      rightZone.on('pointerup', () => (this.touchControls.right = false));
      rightZone.on('pointerout', () => (this.touchControls.right = false));
      jumpZone.on('pointerdown', () => (this.touchControls.jump = true));
      jumpZone.on('pointerup', () => (this.touchControls.jump = false));
      jumpZone.on('pointerout', () => (this.touchControls.jump = false));
    }

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

    // --- TOUCH CONTROLS LOGIC ---
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

    // Update health bar position above player
    if (this.player) {
      this.healthBarBg.x = this.player.x;
      this.healthBarBg.y = this.player.y - 32;
      this.healthBar.x = this.player.x;
      this.healthBar.y = this.player.y - 34;
      // Update health bar width based on health
      this.healthBar.width = 50 * (this.playerHealth / this.maxHealth);
    }

    // TODO: Add tilemap collision logic
  }
}

export default GameScene;
