import Phaser from 'phaser';
import { MenuButton } from '../ui/components';

// Shared palette — matches GameScene's cyan/magenta aesthetic
const C = {
  cyan:    '#00e5ff',
  magenta: '#ff00cc',
  white:   '#e8f4f8',
  dimText: '#88aaaa',
  bg:      '#00000099',     // semi-transparent panel bg (as hex for graphics)
  btnBg:   '#001122',
  btnHover:'#002244',
  dangerBg:'#220011',
  dangerHover: '#440022',
} as const;

export class PauseMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseMenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    // Dark overlay
    this.add.rectangle(cx, cy, width, height, 0x000011, 0.75).setScrollFactor(0);

    // Thin cyan border panel
    const panelW = 320;
    const panelH = 260;
    const panelGfx = this.add.graphics();
    panelGfx.lineStyle(1, 0x00e5ff, 0.6);
    panelGfx.strokeRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH);
    panelGfx.fillStyle(0x000b1a, 0.85);
    panelGfx.fillRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH);

    // Title
    this.add.text(cx, cy - 92, '// PAUSED', {
      fontSize: '28px', fontFamily: 'monospace',
      color: C.cyan, fontStyle: 'bold',
    }).setOrigin(0.5);

    // Divider
    const divGfx = this.add.graphics();
    divGfx.lineStyle(1, 0x00e5ff, 0.3);
    divGfx.lineBetween(cx - 120, cy - 66, cx + 120, cy - 66);

    // Helper to create a styled button with working hover
    const makeBtn = (y: number, label: string, accent: string, onClick: () => void) => {
      const btn = new MenuButton({
        scene: this,
        x: cx, y,
        label,
        style: {
          fontSize: '20px', fontFamily: 'monospace',
          color: accent,
          backgroundColor: C.btnBg,
          padding: { x: 28, y: 10 },
        },
        onClick,
      }).create();
      // Proper hover: captured reference, no @ts-ignore needed
      btn.on('pointerover', () => btn.setStyle({ backgroundColor: C.btnHover, color: C.white }));
      btn.on('pointerout',  () => btn.setStyle({ backgroundColor: C.btnBg,   color: accent }));
    };

    makeBtn(cy - 24, 'RESUME', C.cyan, () => {
      this.scene.stop();
      this.scene.resume('GameScene');
    });

    makeBtn(cy + 32, 'SETTINGS', C.dimText, () => {
      this.scene.launch('SettingsScene');
    });

    // Quit gets a subtle danger colour
    const quitBtn = new MenuButton({
      scene: this,
      x: cx, y: cy + 88,
      label: 'QUIT TO MENU',
      style: {
        fontSize: '18px', fontFamily: 'monospace',
        color: C.magenta,
        backgroundColor: C.dangerBg,
        padding: { x: 28, y: 9 },
      },
      onClick: () => {
        this.scene.stop('GameScene');
        this.scene.stop();
        this.scene.start('StartScene');
      },
    }).create();
    quitBtn.on('pointerover', () => quitBtn.setStyle({ backgroundColor: C.dangerHover, color: C.white }));
    quitBtn.on('pointerout',  () => quitBtn.setStyle({ backgroundColor: C.dangerBg,   color: C.magenta }));

    // Hint
    this.add.text(cx, cy + 118, 'ESC or P to resume', {
      fontSize: '11px', fontFamily: 'monospace', color: C.dimText,
    }).setOrigin(0.5);

    // Keyboard shortcuts
    this.input.keyboard?.on('keydown-ESC', () => { this.scene.stop(); this.scene.resume('GameScene'); });
    this.input.keyboard?.on('keydown-P',   () => { this.scene.stop(); this.scene.resume('GameScene'); });
  }
}
