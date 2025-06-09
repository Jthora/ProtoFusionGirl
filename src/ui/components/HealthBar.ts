import Phaser from 'phaser';

export interface HealthBarOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width?: number;
  height?: number;
  max: number;
  value: number;
}

export class HealthBar {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private max: number;
  private value: number;
  private bg!: Phaser.GameObjects.Rectangle;
  private bar!: Phaser.GameObjects.Rectangle;

  constructor(options: HealthBarOptions) {
    this.scene = options.scene;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width || 50;
    this.height = options.height || 8;
    this.max = options.max;
    this.value = options.value;
  }

  create() {
    this.bg = this.scene.add.rectangle(this.x, this.y, this.width + 2, this.height + 2, 0x222222).setOrigin(0.5, 1);
    this.bar = this.scene.add.rectangle(this.x, this.y, this.width * (this.value / this.max), this.height, 0xff3366).setOrigin(0.5, 1);
    this.bar.setDepth(10);
    this.bg.setDepth(9);
    return { bg: this.bg, bar: this.bar };
  }

  update(x: number, y: number, value: number) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.bg.x = x;
    this.bg.y = y;
    this.bar.x = x;
    this.bar.y = y - 2;
    this.bar.width = this.width * (value / this.max);
  }

  destroy() {
    this.bg.destroy();
    this.bar.destroy();
  }

  // TODO: Add animation for health bar changes (e.g., smooth transitions, color flashes on damage/heal).
  // TODO: Integrate with event system for automatic updates on player/enemy health changes.
  // TODO: Support custom styles and mod/plugin extensions for health bar appearance.
}
