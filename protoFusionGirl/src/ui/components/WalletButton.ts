import Phaser from 'phaser';

export interface WalletButtonOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  onConnect: () => Promise<string | null>; // Fix: should be a function returning a Promise
}

export class WalletButton {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private onConnect: () => Promise<string | null>;
  private button?: Phaser.GameObjects.Text;

  constructor(options: WalletButtonOptions) {
    this.scene = options.scene;
    this.x = options.x;
    this.y = options.y;
    this.onConnect = options.onConnect;
  }

  create() {
    this.button = this.scene.add.text(this.x, this.y, 'Connect Wallet', {
      fontSize: '24px', color: '#ff0', backgroundColor: '#222', padding: { left: 10, right: 10, top: 6, bottom: 6 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', async () => {
        this.button!.setText('Connecting...');
        // The actual connectWallet logic should be injected by the parent scene
        const address = await this.onConnect();
        if (address) {
          this.button!.setText('Wallet: ' + address.slice(0, 6) + '...' + address.slice(-4));
        } else {
          this.button!.setText('Connect Wallet');
        }
      });
    return this.button;
  }
}
