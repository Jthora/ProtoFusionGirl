// EnemyHealthBar: UI for displaying enemy health
import Phaser from 'phaser';

export class EnemyHealthBar extends Phaser.GameObjects.Container {
  private bar: Phaser.GameObjects.Graphics;
  private maxWidth: number;
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);
    this.maxWidth = width;
    this.bar = scene.add.graphics();
    this.add(this.bar);
    this.setSize(width, height);
  }

  updateHealth(current: number, max: number) {
    this.bar.clear();
    this.bar.fillStyle(0x222222, 0.8);
    this.bar.fillRect(0, 0, this.maxWidth, 6);
    this.bar.fillStyle(0xff4444, 1);
    const healthWidth = Math.max(0, (current / max) * this.maxWidth);
    this.bar.fillRect(0, 0, healthWidth, 6);
  }
}
