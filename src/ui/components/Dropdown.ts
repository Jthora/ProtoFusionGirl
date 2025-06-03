import Phaser from 'phaser';

export interface DropdownOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

export class Dropdown {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private value: string;
  private options: string[];
  private onChange: (v: string) => void;
  private text?: Phaser.GameObjects.Text;
  private currentIdx: number;

  constructor(options: DropdownOptions) {
    this.scene = options.scene;
    this.x = options.x;
    this.y = options.y;
    this.value = options.value;
    this.options = options.options;
    this.onChange = options.onChange;
    this.currentIdx = this.options.indexOf(this.value) >= 0 ? this.options.indexOf(this.value) : 0;
  }

  create() {
    this.text = this.scene.add.text(this.x, this.y, this.options[this.currentIdx], {
      fontSize: '20px', color: '#0af', backgroundColor: '#111', padding: { left: 8, right: 8, top: 4, bottom: 4 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.currentIdx = (this.currentIdx + 1) % this.options.length;
        this.text!.setText(this.options[this.currentIdx]);
        this.onChange(this.options[this.currentIdx]);
      });
    return this.text;
  }
}
