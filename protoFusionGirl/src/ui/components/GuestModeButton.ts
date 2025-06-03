import Phaser from 'phaser';

export interface GuestModeButtonOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  onGuest: () => void;
}

export class GuestModeButton {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private onGuest: () => void;
  private button?: Phaser.GameObjects.Text;

  constructor(options: GuestModeButtonOptions) {
    this.scene = options.scene;
    this.x = options.x;
    this.y = options.y;
    this.onGuest = options.onGuest;
  }

  create() {
    this.button = this.scene.add.text(this.x, this.y, 'Play as Guest', {
      fontSize: '20px', color: '#aaa', backgroundColor: '#222', padding: { left: 8, right: 8, top: 4, bottom: 4 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.onGuest();
      });
    return this.button;
  }
}
