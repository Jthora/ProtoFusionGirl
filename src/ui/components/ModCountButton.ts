import Phaser from 'phaser';

export interface ModCountButtonOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  onFetch: () => Promise<number>;
}

export class ModCountButton {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private onFetch: () => Promise<number>;
  private button?: Phaser.GameObjects.Text;

  constructor(options: ModCountButtonOptions) {
    this.scene = options.scene;
    this.x = options.x;
    this.y = options.y;
    this.onFetch = options.onFetch;
  }

  create() {
    this.button = this.scene.add.text(this.x, this.y, 'Fetch Mod Count', {
      fontSize: '20px', color: '#0fa', backgroundColor: '#222', padding: { left: 8, right: 8, top: 4, bottom: 4 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', async () => {
        this.button!.setText('Fetching...');
        try {
          const count = await this.onFetch();
          this.button!.setText('Mod Count: ' + count);
        } catch (err) {
          this.button!.setText('Error fetching mod count');
        }
      });
    return this.button;
  }
}
