import Phaser from 'phaser';

export interface MenuButtonOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  label: string;
  style?: Phaser.Types.GameObjects.Text.TextStyle;
  onClick: () => void;
  onHover?: () => void;
  onOut?: () => void;
}

export class MenuButton {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private label: string;
  private style?: Phaser.Types.GameObjects.Text.TextStyle;
  private onClick: () => void;
  private onHover?: () => void;
  private onOut?: () => void;
  private button?: Phaser.GameObjects.Text;

  constructor(options: MenuButtonOptions) {
    this.scene = options.scene;
    this.x = options.x;
    this.y = options.y;
    this.label = options.label;
    this.style = options.style;
    this.onClick = options.onClick;
    this.onHover = options.onHover;
    this.onOut = options.onOut;
  }

  create() {
    this.button = this.scene.add.text(this.x, this.y, this.label, this.style || {})
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', this.onClick);
    if (this.onHover) this.button.on('pointerover', this.onHover);
    if (this.onOut) this.button.on('pointerout', this.onOut);
    return this.button;
  }
}
