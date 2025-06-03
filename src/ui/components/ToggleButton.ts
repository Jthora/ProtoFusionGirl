import Phaser from 'phaser';

export interface ToggleButtonOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  value: boolean;
  onChange: (v: boolean) => void;
}

export class ToggleButton {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private value: boolean;
  private onChange: (v: boolean) => void;
  private box?: Phaser.GameObjects.Rectangle;
  private check?: Phaser.GameObjects.Text;

  constructor(options: ToggleButtonOptions) {
    this.scene = options.scene;
    this.x = options.x;
    this.y = options.y;
    this.value = options.value;
    this.onChange = options.onChange;
  }

  create() {
    this.box = this.scene.add.rectangle(this.x, this.y, 32, 32, this.value ? 0x0fa000 : 0x444444).setOrigin(0.5).setInteractive();
    this.check = this.scene.add.text(this.x, this.y, this.value ? '✔' : '', { fontSize: '22px', color: '#fff' }).setOrigin(0.5);
    this.box.on('pointerdown', () => {
      this.value = !this.value;
      this.check!.setText(this.value ? '✔' : '');
      this.box!.setFillStyle(this.value ? 0x0fa000 : 0x444444);
      this.onChange(this.value);
    });
    return this.box;
  }
}
