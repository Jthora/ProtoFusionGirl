// UIBarSystem.ts
// Manages essential HUD elements in screen-edge bars.
// Keeps the centre clear for gameplay.
// Color palette: orange (#FF8C00) / gold (#FFD700) on black — matches fusiongirl.app

import Phaser from 'phaser';
import { UILayoutManager } from './UILayoutManager';
import { UIDepths } from '../UIDepths';

const BAR_W = 160;
const BAR_H = 12;

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

  // Dirty-flag tracking — only redraw if values changed
  private _lastHealth = -1;
  private _lastMaxHealth = -1;
  private _lastPsi = -1;
  private _lastMaxPsi = -1;
  private _lastStatus = '';
  private _lastSpeed = -1;

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
    hBg.fillStyle(0x1a0800, 0.9);
    hBg.fillRect(0, 0, BAR_W, BAR_H);

    this.healthFill = this.scene.add.graphics();
    this.drawBar(this.healthFill, 1.0, 0xFF8C00);

    this.healthText = this.scene.add.text(BAR_W / 2, BAR_H / 2, 'HP  —/—', {
      fontSize: '10px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0.5);

    const hCon = this.scene.add.container(16, 12);
    hCon.add([hBg, this.healthFill, this.healthText]);
    this.topBar.add(hCon);

    // PSI bar
    const pBg = this.scene.add.graphics();
    pBg.fillStyle(0x1a1000, 0.9);
    pBg.fillRect(0, 0, BAR_W, BAR_H);

    this.psiFill = this.scene.add.graphics();
    this.drawBar(this.psiFill, 1.0, 0xFFD700);

    this.psiText = this.scene.add.text(BAR_W / 2, BAR_H / 2, 'PSI  —/—', {
      fontSize: '10px', fontFamily: 'monospace', color: '#ffffff',
    }).setOrigin(0.5);

    const pCon = this.scene.add.container(16 + BAR_W + 12, 12);
    pCon.add([pBg, this.psiFill, this.psiText]);
    this.topBar.add(pCon);

    // Status (centre of top bar — positioned in positionBars)
    this.statusText = this.scene.add.text(0, 0, '', {
      fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)',
      padding: { x: 6, y: 2 },
    }).setOrigin(0.5);
    this.topBar.add(this.statusText);
  }

  // ── Bottom bar: Speed | Controls hint ───────────────────────────────────────

  private createBottomBar(): void {
    this.speedText = this.scene.add.text(16, 0, '', {
      fontSize: '11px', fontFamily: 'monospace', color: '#FF8C00',
      backgroundColor: 'rgba(0,0,0,0)', padding: { x: 4, y: 2 },
    }).setOrigin(0, 0.5);
    this.bottomBar.add(this.speedText);

    const hint = this.scene.add.text(0, 0,
      'WASD · SPACE: Attack · Q: ASI · C: CMD · E: Interact · F1: Help',
      {
        fontSize: '10px', fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.25)', padding: { x: 6, y: 2 },
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

  // ── Public update API (dirty-flag: only redraws when values change) ──────────

  public updateHealth(current: number, max: number): void {
    if (current === this._lastHealth && max === this._lastMaxHealth) return;
    this._lastHealth = current;
    this._lastMaxHealth = max;
    this.drawBar(this.healthFill, current / max, 0xFF8C00);
    this.healthText.setText(`HP  ${Math.round(current)}/${max}`);
  }

  public updatePSI(current: number, max: number): void {
    if (current === this._lastPsi && max === this._lastMaxPsi) return;
    this._lastPsi = current;
    this._lastMaxPsi = max;
    this.drawBar(this.psiFill, current / max, 0xFFD700);
    this.psiText.setText(`PSI  ${Math.round(current)}/${max}`);
  }

  public updateStatus(status: string): void {
    if (status === this._lastStatus) return;
    this._lastStatus = status;
    this.statusText.setText(status);
  }

  public updateSpeed(speed: number): void {
    const rounded = Math.round(speed * 10) / 10;
    if (rounded === this._lastSpeed) return;
    this._lastSpeed = rounded;
    // Only show speed indicator when moving at non-trivial speed
    if (rounded <= 1.0) {
      this.speedText.setText('');
    } else {
      this.speedText.setText(`${rounded.toFixed(1)}×`);
    }
  }

  public onResize(): void {
    this.positionBars();
  }
}
