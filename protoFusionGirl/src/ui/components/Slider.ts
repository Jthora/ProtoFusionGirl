import Phaser from 'phaser';

export interface SliderOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  value: number;
  onChange: (v: number) => void;
}

export class Slider {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private value: number;
  private onChange: (v: number) => void;
  private bar?: Phaser.GameObjects.Rectangle;
  private knob?: Phaser.GameObjects.Rectangle;

  constructor(options: SliderOptions) {
    this.scene = options.scene;
    this.x = options.x;
    this.y = options.y;
    this.value = options.value;
    this.onChange = options.onChange;
  }

  create() {
    this.bar = this.scene.add.rectangle(this.x, this.y, 120, 8, 0x888888).setOrigin(0.5);
    this.knob = this.scene.add.rectangle(this.x - 60 + this.value * 120, this.y, 16, 24, 0x0afafc).setOrigin(0.5).setInteractive({ draggable: true });
    this.knob.on('drag', (pointer: any, dragX: number) => {
      const rel = Phaser.Math.Clamp((dragX - (this.x - 60)) / 120, 0, 1);
      this.knob!.x = this.x - 60 + rel * 120;
      this.onChange(Number(rel.toFixed(2)));
    });
    return this.knob;
  }
}
