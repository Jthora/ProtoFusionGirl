// MinimalGameScene.ts - A simplified version of GameScene for basic functionality testing
import Phaser from 'phaser';
import { createPlayerSpritesheet, createTileset, createBackgroundImage } from '../utils/PlaceholderAssets';

export class MinimalGameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'MinimalGameScene' });
  }

  preload() {
    // Create placeholder assets at runtime
    this.createPlaceholderAssets();
  }

  private createPlaceholderAssets() {
    // Create player spritesheet
    const playerCanvas = createPlayerSpritesheet();
    this.textures.addCanvas('player', playerCanvas);

    // Create tileset
    const tileCanvas = createTileset();
    this.textures.addCanvas('tiles', tileCanvas);

    // Create backgrounds
    const backgroundFar = createBackgroundImage(800, 600, '#0a0a2e');
    this.textures.addCanvas('background-far', backgroundFar);

    const backgroundNear = createBackgroundImage(800, 600, '#16213e');
    this.textures.addCanvas('background-near', backgroundNear);
  }

  create() {
    const { width, height } = this.cameras.main;

    // Add parallax backgrounds
    this.add.tileSprite(0, 0, width, height, 'background-far').setOrigin(0, 0).setScrollFactor(0);
    this.add.tileSprite(0, 0, width, height, 'background-near').setOrigin(0, 0).setScrollFactor(0);

    // Create platforms
    this.platforms = this.physics.add.staticGroup();

    // Ground platform
    const ground = this.add.rectangle(width / 2, height - 32, width, 64, 0x654321);
    this.platforms.add(ground);

    // Some floating platforms
    const platform1 = this.add.rectangle(400, height - 200, 200, 32, 0x654321);
    const platform2 = this.add.rectangle(600, height - 350, 200, 32, 0x654321);
    this.platforms.add(platform1);
    this.platforms.add(platform2);

    // Create player
    this.player = this.physics.add.sprite(100, height - 150, 'player', 0);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // Player physics
    this.physics.add.collider(this.player, this.platforms);

    // Create player animations
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
      frameRate: 8,
      repeat: 0
    });

    // Input setup
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Camera follows player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, width * 2, height);

    // UI Text
    this.add.text(16, 16, 'ProtoFusionGirl - Minimal Game Scene', {
      fontSize: '18px',
      color: '#00ffff'
    }).setScrollFactor(0);

    this.add.text(16, 40, 'Use Arrow Keys to Move, Up to Jump', {
      fontSize: '14px',
      color: '#ffffff'
    }).setScrollFactor(0);

    // ESC to pause
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.pause();
      this.scene.launch('PauseMenuScene');
    });
  }

  update() {
    if (!this.player || !this.cursors) return;

    // Player movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.play('run', true);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.play('run', true);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
      this.player.play('idle', true);
    }

    // Jumping
    if (this.cursors.up.isDown && this.player.body?.touching.down) {
      this.player.setVelocityY(-350);
      this.player.play('jump', true);
    }
  }
}
