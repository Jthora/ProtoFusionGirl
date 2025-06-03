import Phaser from 'phaser';

export class FeedbackModal {
  private scene: Phaser.Scene;
  private centerX: number;
  private bg?: Phaser.GameObjects.Rectangle;
  private input?: Phaser.GameObjects.DOMElement;
  private submit?: Phaser.GameObjects.Text;
  private thankYouText?: Phaser.GameObjects.Text;
  private onSubmit?: (value: string) => void;

  constructor(scene: Phaser.Scene, centerX: number, onSubmit?: (value: string) => void) {
    this.scene = scene;
    this.centerX = centerX;
    this.onSubmit = onSubmit;
  }

  show() {
    const { scene, centerX } = this;
    const centerY = scene.cameras.main.height / 2;
    this.bg = scene.add.rectangle(centerX, centerY, 420, 180, 0x222222, 0.95).setDepth(1000);
    this.input = scene.add.dom(centerX, centerY, 'input', 'width: 350px; font-size: 18px; padding: 8px;', '').setDepth(1001);
    this.submit = scene.add.text(centerX, centerY + 50, 'Submit', { fontSize: '18px', color: '#fff', backgroundColor: '#0af', padding: { left: 10, right: 10, top: 4, bottom: 4 } })
      .setOrigin(0.5)
      .setDepth(1001)
      .setInteractive()
      .on('pointerdown', () => {
        const value = (this.input!.node as HTMLInputElement).value;
        if (value && value.length > 2) {
          if (this.onSubmit) this.onSubmit(value);
          this.destroy();
          this.thankYouText = scene.add.text(centerX, centerY, 'Thank you for your feedback!', { fontSize: '18px', color: '#0fa' }).setOrigin(0.5).setDepth(1002);
          setTimeout(() => this.thankYouText?.destroy(), 2000);
        }
      });
    this.bg.setInteractive().on('pointerdown', () => this.destroy());
  }

  destroy() {
    this.bg?.destroy();
    this.input?.destroy();
    this.submit?.destroy();
  }
}

// Usage: new FeedbackModal(scene, centerX, (value) => { ... }).show();
