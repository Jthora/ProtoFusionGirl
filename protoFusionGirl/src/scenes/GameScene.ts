// GameScene.ts - protoFusionGirl core gameplay scene
// Implements player movement and prepares for tilemap, touch controls, and modding (see primer)
import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

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
  }

  create() {
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

    // TODO: Add touch controls for mobile (see primer)
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

    // TODO: Add touch controls for mobile
    // TODO: Add tilemap collision logic
  }
}

export default GameScene;
