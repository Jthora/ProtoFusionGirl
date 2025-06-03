import Phaser from 'phaser';

export interface TitleTextOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  text: string;
  style?: Phaser.Types.GameObjects.Text.TextStyle;
}

export class TitleText {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private text: string;
  private style?: Phaser.Types.GameObjects.Text.TextStyle;
  private title?: Phaser.GameObjects.Text;

  constructor(options: TitleTextOptions) {
    this.scene = options.scene;
    this.x = options.x;
    this.y = options.y;
    this.text = options.text;
    this.style = options.style;
  }

  create() {
    this.title = this.scene.add.text(this.x, this.y, this.text, this.style || { fontSize: '40px', color: '#fff' }).setOrigin(0.5);
    return this.title;
  }
}
