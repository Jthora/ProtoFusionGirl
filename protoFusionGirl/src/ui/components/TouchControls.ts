import Phaser from 'phaser';

export interface TouchControlsOptions {
  scene: Phaser.Scene;
  width: number;
  height: number;
  onLeft: (down: boolean) => void;
  onRight: (down: boolean) => void;
  onJump: (down: boolean) => void;
}

export class TouchControls {
  private scene: Phaser.Scene;
  private width: number;
  private height: number;
  private onLeft: (down: boolean) => void;
  private onRight: (down: boolean) => void;
  private onJump: (down: boolean) => void;

  constructor(options: TouchControlsOptions) {
    this.scene = options.scene;
    this.width = options.width;
    this.height = options.height;
    this.onLeft = options.onLeft;
    this.onRight = options.onRight;
    this.onJump = options.onJump;
  }

  create() {
    // Visual feedback rectangles (optional)
    this.scene.add.rectangle(this.width * 0.165, this.height * 0.5, this.width * 0.33, this.height, 0x00aaff, 0.08).setOrigin(0.5);
    this.scene.add.rectangle(this.width * 0.835, this.height * 0.5, this.width * 0.33, this.height, 0x00ff88, 0.08).setOrigin(0.5);
    this.scene.add.rectangle(this.width * 0.5, this.height * 0.25, this.width * 0.34, this.height * 0.5, 0xffaa00, 0.08).setOrigin(0.5);
    // Touch zones
    const leftZone = this.scene.add.zone(0, this.height * 0.5, this.width * 0.33, this.height)
      .setOrigin(0, 0.5)
      .setInteractive();
    const rightZone = this.scene.add.zone(this.width * 0.67, this.height * 0.5, this.width * 0.33, this.height)
      .setOrigin(0, 0.5)
      .setInteractive();
    const jumpZone = this.scene.add.zone(this.width * 0.33, 0, this.width * 0.34, this.height * 0.5)
      .setOrigin(0, 0)
      .setInteractive();
    // Touch state handlers
    leftZone.on('pointerdown', () => this.onLeft(true));
    leftZone.on('pointerup', () => this.onLeft(false));
    leftZone.on('pointerout', () => this.onLeft(false));
    rightZone.on('pointerdown', () => this.onRight(true));
    rightZone.on('pointerup', () => this.onRight(false));
    rightZone.on('pointerout', () => this.onRight(false));
    jumpZone.on('pointerdown', () => this.onJump(true));
    jumpZone.on('pointerup', () => this.onJump(false));
    jumpZone.on('pointerout', () => this.onJump(false));
  }
}
