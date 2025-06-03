import Phaser from 'phaser';

export interface ModToggleButtonOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export class ModToggleButton {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private enabled: boolean;
  private onToggle: (enabled: boolean) => void;
  private button?: Phaser.GameObjects.Text;

  constructor(options: ModToggleButtonOptions) {
    this.scene = options.scene;
    this.x = options.x;
    this.y = options.y;
    this.enabled = options.enabled;
    this.onToggle = options.onToggle;
  }

  create() {
    this.button = this.scene.add.text(
      this.x,
      this.y,
      this.enabled ? '✔ Enabled' : 'Enable',
      {
        fontSize: '18px',
        color: this.enabled ? '#0f0' : '#4f4',
        backgroundColor: '#222',
        padding: { left: 8, right: 8, top: 4, bottom: 4 },
      }
    )
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.button!.disableInteractive();
        setTimeout(() => this.button!.setInteractive(), 300);
        this.enabled = !this.enabled;
        this.button!.setText(this.enabled ? '✔ Enabled' : 'Enable');
        this.button!.setColor(this.enabled ? '#0f0' : '#4f4');
        this.onToggle(this.enabled);
      })
      .on('pointerover', () => {
        this.button!.setStyle({ backgroundColor: '#333' });
      })
      .on('pointerout', () => {
        this.button!.setStyle({ backgroundColor: '#222' });
      });
    return this.button;
  }
}
