// GuidanceViz.ts
// Small helper to render guidance paths/markers consistently

export class GuidanceViz {
  private scene: Phaser.Scene;
  private g: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, depth: number = 1100) {
    this.scene = scene;
    this.g = scene.add.graphics().setDepth(depth);
  }

  drawPath(from: { x: number; y: number }, to: { x: number; y: number }, color: number = 0x00ffcc, alpha: number = 0.8, duration: number = 1200) {
    this.g.clear();
    this.g.lineStyle(2, color, alpha);
    this.g.strokeLineShape(new Phaser.Geom.Line(from.x, from.y, to.x, to.y));
    // Fade and clear
    this.scene.tweens.add({
      targets: this.g,
      alpha: 0,
      duration,
      onComplete: () => {
        this.g.clear();
        this.g.setAlpha(1);
      }
    });
  }

  destroy() {
    this.g.destroy();
  }
}
