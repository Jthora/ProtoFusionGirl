import type Phaser from 'phaser';

interface LabelProps {
  scene: Phaser.Scene;
  x: number;
  y: number;
  text: string;
  style?: Phaser.Types.GameObjects.Text.TextStyle;
  originX?: number;
  originY?: number;
}

export class Label {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private text: string;
  private style?: Phaser.Types.GameObjects.Text.TextStyle;
  private originX: number;
  private originY: number;
  public gameObject!: Phaser.GameObjects.Text;

  constructor({ scene, x, y, text, style, originX = 0.5, originY = 0.5 }: LabelProps) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.text = text;
    this.style = style;
    this.originX = originX;
    this.originY = originY;
  }

  create() {
    this.gameObject = this.scene.add.text(this.x, this.y, this.text, this.style).setOrigin(this.originX, this.originY);
    return this.gameObject;
  }
}
