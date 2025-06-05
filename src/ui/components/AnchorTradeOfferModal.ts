import Phaser from 'phaser';

export interface AnchorTradeOfferModalOptions {
  scene: Phaser.Scene;
  offer: {
    from: string;
    anchor: { label: string };
  };
  onAccept: () => void;
  onReject: () => void;
}

export class AnchorTradeOfferModal {
  private scene: Phaser.Scene;
  private offer: { from: string; anchor: { label: string } };
  private onAccept: () => void;
  private onReject: () => void;
  private bg?: Phaser.GameObjects.Rectangle;
  private text?: Phaser.GameObjects.Text;
  private acceptBtn?: Phaser.GameObjects.Text;
  private rejectBtn?: Phaser.GameObjects.Text;

  constructor(options: AnchorTradeOfferModalOptions) {
    this.scene = options.scene;
    this.offer = options.offer;
    this.onAccept = options.onAccept;
    this.onReject = options.onReject;
  }

  show() {
    const { scene } = this;
    const centerX = scene.cameras.main.width / 2;
    const centerY = scene.cameras.main.height / 2;
    this.bg = scene.add.rectangle(centerX, centerY, 420, 180, 0x222244, 0.98).setDepth(2000);
    this.text = scene.add.text(centerX, centerY - 40,
      `Player ${this.offer.from} wants to trade anchor '${this.offer.anchor.label}'.\nAccept this trade?`,
      { fontSize: '18px', color: '#fff', align: 'center', wordWrap: { width: 380 } })
      .setOrigin(0.5)
      .setDepth(2001);
    this.acceptBtn = scene.add.text(centerX - 60, centerY + 40, 'Accept',
      { fontSize: '18px', color: '#fff', backgroundColor: '#0a4', padding: { left: 16, right: 16, top: 6, bottom: 6 } })
      .setOrigin(0.5)
      .setDepth(2001)
      .setInteractive()
      .on('pointerdown', () => { this.onAccept(); this.destroy(); });
    this.rejectBtn = scene.add.text(centerX + 60, centerY + 40, 'Reject',
      { fontSize: '18px', color: '#fff', backgroundColor: '#a00', padding: { left: 16, right: 16, top: 6, bottom: 6 } })
      .setOrigin(0.5)
      .setDepth(2001)
      .setInteractive()
      .on('pointerdown', () => { this.onReject(); this.destroy(); });
    this.bg.setInteractive().on('pointerdown', () => this.destroy());
  }

  destroy() {
    this.bg?.destroy();
    this.text?.destroy();
    this.acceptBtn?.destroy();
    this.rejectBtn?.destroy();
  }
}
