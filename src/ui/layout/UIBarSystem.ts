// UIBarSystem.ts
// Manages essential HUD elements in screen-edge bars.
// Keeps the centre clear for gameplay.

import Phaser from 'phaser';
import { UILayoutManager } from './UILayoutManager';
import { UIDepths } from '../UIDepths';

const BAR_W = 180;
const BAR_H = 14;

export class UIBarSystem extends Phaser.GameObjects.Container {
  private layoutManager: UILayoutManager;
  private topBar: Phaser.GameObjects.Container;
  private bottomBar: Phaser.GameObjects.Container;

  // Stored references — no brittle array-index access
  private healthFill!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private psiFill!: Phaser.GameObjects.Graphics;
  private psiText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, layoutManager: UILayoutManager) {
    super(scene, 0, 0);
    this.layoutManager = layoutManager;

    this.topBar    = scene.add.container(0, 0);
    this.bottomBar = scene.add.container(0, 0);
    this.add([this.topBar, this.bottomBar]);

    this.setDepth(UIDepths.HUD_BASE);
    this.setScrollFactor(0);

    this.createTopBar();
    this.createBottomBar();
    this.positionBars();

    layoutManager.registerComponent('uiBarSystem', this, 'overlays', 'essential');
  }

  // ── Top bar: Health | PSI | Status ──────────────────────────────────────────

  private createTopBar(): void {
    // Health bar
    const hBg = this.scene.add.graphics();
    hBg.fillStyle(0x220000, 0.85);
    hBg.fillRect(0, 0, BAR_W, BAR_H);

    this.healthFill = this.scene.add.graphics();
    this.drawBar(this.healthFill, 1.0, 0xdd2233);

    this.healthText = this.scene.add.text(BAR_W / 2, BAR_H / 2, 'HP  —/—', {
      fontSize: '11px', fontFamily: 'monospace', color: '#ffbbcc',
    }).setOrigin(0.5);

    const hCon = this.scene.add.container(16, 10);
    hCon.add([hBg, this.healthFill, this.healthText]);
    this.topBar.add(hCon);

    // PSI bar
    const pBg = this.scene.add.graphics();
    pBg.fillStyle(0x000e2a, 0.85);
    pBg.fillRect(0, 0, BAR_W, BAR_H);

    this.psiFill = this.scene.add.graphics();
    this.drawBar(this.psiFill, 1.0, 0x0077ff);

    this.psiText = this.scene.add.text(BAR_W / 2, BAR_H / 2, 'PSI  —/—', {
      fontSize: '11px', fontFamily: 'monospace', color: '#aaccff',
    }).setOrigin(0.5);

    const pCon = this.scene.add.container(16 + BAR_W + 14, 10);
    pCon.add([pBg, this.psiFill, this.psiText]);
    this.topBar.add(pCon);

    // Status (centre of top bar — positioned in positionBars)
    this.statusText = this.scene.add.text(0, 0, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#00e5ff',
      backgroundColor: '#00000066', padding: { x: 8, y: 3 },
    }).setOrigin(0.5);
    this.topBar.add(this.statusText);
  }

  // ── Bottom bar: Speed | Controls hint ───────────────────────────────────────

  private createBottomBar(): void {
    this.speedText = this.scene.add.text(16, 0, 'Speed: —', {
      fontSize: '13px', fontFamily: 'monospace', color: '#00ff88',
      backgroundColor: '#001122', padding: { x: 6, y: 3 },
    }).setOrigin(0, 0.5);
    this.bottomBar.add(this.speedText);

    const hint = this.scene.add.text(0, 0,
      'WASD · SPACE: Attack · Q: ASI · C: Commands · TAB: Guidance · E: Interact · F1: Help',
      {
        fontSize: '11px', fontFamily: 'monospace',
        color: '#445566', padding: { x: 8, y: 3 },
      }
    ).setOrigin(0.5);
    this.bottomBar.add(hint);
  }

  private drawBar(gfx: Phaser.GameObjects.Graphics, pct: number, color: number): void {
    gfx.clear();
    gfx.fillStyle(color, 1);
    gfx.fillRect(0, 0, BAR_W * Math.max(0, Math.min(1, pct)), BAR_H);
  }

  private positionBars(): void {
    const layout = this.layoutManager.getLayout();

    this.topBar.setPosition(layout.topBar.x, layout.topBar.y);
    this.bottomBar.setPosition(layout.bottomBar.x, layout.bottomBar.y);

    // Status text: centred horizontally in top bar
    this.statusText.setPosition(layout.topBar.width / 2, layout.topBar.height / 2);

    // Controls hint: centred in bottom bar
    const hint = this.bottomBar.list[1] as Phaser.GameObjects.Text;
    if (hint) hint.setPosition(layout.bottomBar.width / 2, layout.bottomBar.height / 2);
  }

  // ── Public update API ────────────────────────────────────────────────────────

  public updateHealth(current: number, max: number): void {
    this.drawBar(this.healthFill, current / max, 0xdd2233);
    this.healthText.setText(`HP  ${current}/${max}`);
  }

  public updatePSI(current: number, max: number): void {
    this.drawBar(this.psiFill, current / max, 0x0077ff);
    this.psiText.setText(`PSI  ${current}/${max}`);
  }

  public updateStatus(status: string): void {
    this.statusText.setText(status);
  }

  public updateSpeed(speed: number): void {
    this.speedText.setText(`Speed: ${speed.toFixed(1)}×`);
  }

  public onResize(): void {
    this.positionBars();
  }
}
