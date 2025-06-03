// DamageNumber: Floating damage number UI
import Phaser from 'phaser';

export class DamageNumber extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number, damage: number) {
    super(scene, x, y, `-${damage}`, { font: '16px Arial', color: '#ff4444', stroke: '#000', strokeThickness: 2 });
    scene.add.existing(this);
    scene.tweens.add({
      targets: this,
      y: y - 20,
      alpha: 0,
      duration: 700,
      onComplete: () => this.destroy()
    });
  }
}
