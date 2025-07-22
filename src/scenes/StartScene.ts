import Phaser from 'phaser';

export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  preload() {
    // Load any assets needed for the start screen
    // For now, we'll use simple graphics
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x220022);
    
    // Title
    const title = this.add.text(width / 2, height / 2 - 100, 'ProtoFusionGirl', {
      fontSize: '48px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(width / 2, height / 2 - 40, 'A Sci-Fi Platformer Adventure', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Start button
    const startButton = this.add.text(width / 2, height / 2 + 50, 'Start Game', {
      fontSize: '32px',
      color: '#00ff00',
      backgroundColor: '#004400',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    // Button hover effects
    startButton.on('pointerover', () => {
      startButton.setStyle({ backgroundColor: '#006600' });
    });
    
    startButton.on('pointerout', () => {
      startButton.setStyle({ backgroundColor: '#004400' });
    });
    
    // Start game on click
    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
    
    // Also allow Enter key to start
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });
    
    // Add some visual flair
    this.tweens.add({
      targets: title,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }
}