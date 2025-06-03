import Phaser from 'phaser';

export class SettingsButton {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private button?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
  }

  create() {
    this.button = this.scene.add.text(this.x, this.y, 'Settings', {
      fontSize: '18px', color: '#fff', backgroundColor: '#0af', padding: { left: 12, right: 12, top: 6, bottom: 6 }
    })
      .setOrigin(1, 0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.scene.launch('SettingsScene');
      });
    return this.button;
  }
}

// Usage: new SettingsButton(scene, x, y).create();
