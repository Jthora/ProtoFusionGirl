import { connectWallet } from '../web3';

export class StartScene extends Phaser.Scene {
  private walletButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'StartScene' });
  }

  create() {
    // Title
    this.add.text(400, 150, 'protoFusionGirl', { fontSize: '40px', color: '#fff' }).setOrigin(0.5);
    // Start button
    this.add.text(400, 250, 'Start Game', { fontSize: '28px', color: '#0ff' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('GameScene'));
    // Web3 wallet connect button
    this.walletButton = this.add.text(400, 350, 'Connect Wallet', { fontSize: '24px', color: '#ff0', backgroundColor: '#222' })
      .setOrigin(0.5)
      .setPadding(10)
      .setInteractive()
      .on('pointerdown', async () => {
        this.walletButton.setText('Connecting...');
        const address = await connectWallet();
        if (address) {
          this.walletButton.setText('Wallet: ' + address.slice(0, 6) + '...' + address.slice(-4));
        } else {
          this.walletButton.setText('Connect Wallet');
          this.add.text(400, 400, 'Please install MetaMask', { fontSize: '20px', color: '#f00' }).setOrigin(0.5);
        }
      });
  }
}