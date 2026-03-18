// UIBarSystem.ts
// Stage 3.1 — HUD Telemetry Reframe
// COHERENCE waveform (replaces HP bar) + RESONANCE pulsing dot (replaces PSI bar).
// Color palette: amber (#FF8C00) / gold (#FFD700) on gunmetal — PsiSys aesthetic.

import Phaser from 'phaser';
import { UILayoutManager } from './UILayoutManager';
import { UIDepths } from '../UIDepths';

const BAR_W = 160;
const BAR_H = 14;

export class UIBarSystem extends Phaser.GameObjects.Container {
  private layoutManager: UILayoutManager;
  private topBar: Phaser.GameObjects.Container;
  private bottomBar: Phaser.GameObjects.Container;

  // COHERENCE display
  private coherenceGfx!: Phaser.GameObjects.Graphics;
  private coherenceLabel!: Phaser.GameObjects.Text;

  // RESONANCE display
  private resonanceGfx!: Phaser.GameObjects.Graphics;
  private resonanceLabel!: Phaser.GameObjects.Text;

  // Status / speed
  private statusText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;

  // Live values (dirty-flag approach)
  private _coherencePct = 1.0;
  private _resonancePct = 1.0;
  private _lastHealth = -1;
  private _lastMaxHealth = -1;
  private _lastPsi = -1;
  private _lastMaxPsi = -1;
  private _lastStatus = '';
  private _lastSpeed = -1;
  private _leylineDisrupted = false;

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

  // ── Top bar: COHERENCE | RESONANCE | Status ──────────────────────────────────

  private createTopBar(): void {
    // ── COHERENCE waveform ────────────────────────────────────────────────────
    this.coherenceGfx = this.scene.add.graphics();

    this.coherenceLabel = this.scene.add.text(BAR_W / 2, BAR_H / 2, 'COHERENCE  —%', {
      fontSize: '9px', fontFamily: 'Courier New, monospace', color: '#FF8C00',
    }).setOrigin(0.5).setAlpha(0.85);

    const cCon = this.scene.add.container(16, 10);
    cCon.add([this.coherenceGfx, this.coherenceLabel]);
    this.topBar.add(cCon);

    // ── RESONANCE pulsing dot ────────────────────────────────────────────────
    this.resonanceGfx = this.scene.add.graphics();

    this.resonanceLabel = this.scene.add.text(BAR_W / 2, BAR_H / 2, 'RESONANCE  —%', {
      fontSize: '9px', fontFamily: 'Courier New, monospace', color: '#FFD700',
    }).setOrigin(0.5).setAlpha(0.85);

    const rCon = this.scene.add.container(16 + BAR_W + 12, 10);
    rCon.add([this.resonanceGfx, this.resonanceLabel]);
    this.topBar.add(rCon);

    // ── Status (centre) ───────────────────────────────────────────────────────
    this.statusText = this.scene.add.text(0, 0, '', {
      fontSize: '10px', fontFamily: 'Courier New, monospace',
      color: 'rgba(255,140,0,0.45)', padding: { x: 6, y: 2 },
    }).setOrigin(0.5);
    this.topBar.add(this.statusText);
  }

  // ── Bottom bar: Speed | Controls hint ───────────────────────────────────────

  private createBottomBar(): void {
    this.speedText = this.scene.add.text(16, 0, '', {
      fontSize: '11px', fontFamily: 'Courier New, monospace', color: '#FF8C00',
      backgroundColor: 'rgba(0,0,0,0)', padding: { x: 4, y: 2 },
    }).setOrigin(0, 0.5);
    this.bottomBar.add(this.speedText);

    const hint = this.scene.add.text(0, 0,
      'WASD · SPACE: Attack · Q: ASI · C: CMD · E: Interact · F1: Help',
      {
        fontSize: '10px', fontFamily: 'Courier New, monospace',
        color: 'rgba(255,255,255,0.2)', padding: { x: 6, y: 2 },
      }
    ).setOrigin(0.5);
    this.bottomBar.add(hint);
  }

  // ── Waveform draw ─────────────────────────────────────────────────────────────

  private drawCoherenceWaveform(t: number): void {
    const pct = this._coherencePct;

    // Amplitude: flat at 100% coherence, chaotic at 0%
    const amp     = (1 - pct) * (BAR_H / 2 - 2) + 0.5;
    const freq    = 2.5 + (1 - pct) * 5;       // higher frequency when low
    const freq2   = freq * 2.3;

    // Color: amber (#FF8C00) → red-amber (#FF2200)
    const g       = Math.round(0x8C * pct);
    const lineClr = (0xFF << 16) | (g << 8) | 0x00;
    const alpha   = 0.75 + pct * 0.25;

    this.coherenceGfx.clear();

    // Background
    this.coherenceGfx.fillStyle(0x1a0800, 0.88);
    this.coherenceGfx.fillRect(0, 0, BAR_W, BAR_H);

    // Waveform trace
    this.coherenceGfx.lineStyle(1.5, lineClr, alpha);
    this.coherenceGfx.beginPath();

    const pts  = 48;
    const midY = BAR_H / 2;
    const ts   = t * 0.0018;

    for (let i = 0; i <= pts; i++) {
      const x  = (i / pts) * BAR_W;
      const p  = (i / pts) * Math.PI * 2;
      const yn = Math.sin(p * freq  + ts)      * 0.55
               + Math.sin(p * freq2 + ts * 1.4) * 0.30
               + Math.sin(p * freq * 0.7 + ts * 0.9) * 0.15;
      const y  = midY + yn * amp;
      if (i === 0) this.coherenceGfx.moveTo(x, y);
      else         this.coherenceGfx.lineTo(x, y);
    }
    this.coherenceGfx.strokePath();

    // Critical spike overlay (pct < 0.25)
    if (pct < 0.25) {
      const spike = Math.sin(t * 0.015) > 0.7 ? 1 : 0;
      if (spike) {
        const sx = BAR_W * 0.5;
        this.coherenceGfx.lineStyle(1, 0xFF0000, 0.6);
        this.coherenceGfx.beginPath();
        this.coherenceGfx.moveTo(sx, 0);
        this.coherenceGfx.lineTo(sx, BAR_H);
        this.coherenceGfx.strokePath();
      }
    }
  }

  private drawResonanceDot(t: number): void {
    const pct     = this._resonancePct;
    const MAX_R   = 4;
    const dotR    = Math.max(0.5, pct * MAX_R);

    // Pulse: slower when full, flicker if ley line disrupted
    const pulseSpeed = this._leylineDisrupted ? 0.012 : 0.004;
    const pulse      = 0.65 + 0.35 * Math.sin(t * pulseSpeed);
    const dotAlpha   = (0.5 + pct * 0.5) * pulse;

    this.resonanceGfx.clear();

    // Background
    this.resonanceGfx.fillStyle(0x110d00, 0.88);
    this.resonanceGfx.fillRect(0, 0, BAR_W, BAR_H);

    const cx = BAR_W / 2;
    const cy = BAR_H / 2;

    // Outer ring (max capacity marker)
    this.resonanceGfx.lineStyle(1, 0xFFD700, 0.3);
    this.resonanceGfx.strokeCircle(cx, cy, MAX_R + 2);

    // Secondary concentric ring (mid-range marker at 50%)
    this.resonanceGfx.lineStyle(0.5, 0xFFD700, 0.15);
    this.resonanceGfx.strokeCircle(cx, cy, MAX_R * 0.6 + 2);

    // Inner filled dot (size = available resonance)
    this.resonanceGfx.fillStyle(0xFFD700, dotAlpha);
    this.resonanceGfx.fillCircle(cx, cy, dotR);

    // Ley line disruption: small flickering ticks around ring
    if (this._leylineDisrupted && Math.sin(t * 0.02) > 0.5) {
      this.resonanceGfx.lineStyle(1, 0xFF4400, 0.6);
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
        const ex = cx + Math.cos(a) * (MAX_R + 4);
        const ey = cy + Math.sin(a) * (MAX_R + 4);
        this.resonanceGfx.fillStyle(0xFF4400, 0.5);
        this.resonanceGfx.fillCircle(ex, ey, 0.8);
      }
    }
  }

  private positionBars(): void {
    const layout = this.layoutManager.getLayout();

    this.topBar.setPosition(layout.topBar.x, layout.topBar.y);
    this.bottomBar.setPosition(layout.bottomBar.x, layout.bottomBar.y);

    this.statusText.setPosition(layout.topBar.width / 2, layout.topBar.height / 2);

    const hint = this.bottomBar.list[1] as Phaser.GameObjects.Text;
    if (hint) hint.setPosition(layout.bottomBar.width / 2, layout.bottomBar.height / 2);
  }

  // ── Public update API ─────────────────────────────────────────────────────────

  /**
   * Call once per frame to animate the waveform and resonance dot.
   */
  public update(): void {
    const t = performance.now();
    this.drawCoherenceWaveform(t);
    this.drawResonanceDot(t);
  }

  /**
   * Update COHERENCE display.
   */
  public updateCoherence(current: number, max: number): void {
    this.updateHealth(current, max);
  }

  /** @deprecated Use updateCoherence() */
  public updateHealth(current: number, max: number): void {
    if (current === this._lastHealth && max === this._lastMaxHealth) return;
    this._lastHealth    = current;
    this._lastMaxHealth = max;
    this._coherencePct  = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;

    const pct = Math.round(this._coherencePct * 100);
    const color = this._coherencePct < 0.25 ? '#FF3300' : '#FF8C00';
    this.coherenceLabel.setText(`COHERENCE  ${pct}%`).setColor(color);

    if (this._coherencePct < 0.25) {
      // ⚠ pulse handled in drawCoherenceWaveform via spike overlay
      this.coherenceLabel.setText(`⚠ COHERENCE  ${pct}%`);
    }
  }

  /**
   * Update RESONANCE display.
   */
  public updateResonance(current: number, max: number): void {
    this.updatePSI(current, max);
  }

  /** @deprecated Use updateResonance() */
  public updatePSI(current: number, max: number): void {
    if (current === this._lastPsi && max === this._lastMaxPsi) return;
    this._lastPsi    = current;
    this._lastMaxPsi = max;
    this._resonancePct = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;

    const pct = Math.round(this._resonancePct * 100);
    this.resonanceLabel.setText(`RESONANCE  ${pct}%`);
  }

  /**
   * Notify that the local ley line is disrupted — causes resonance dot flicker.
   */
  public setLeylineDisrupted(disrupted: boolean): void {
    this._leylineDisrupted = disrupted;
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
    this.speedText.setText(rounded <= 1.0 ? '' : `${rounded.toFixed(1)}×`);
  }

  public onResize(): void {
    this.positionBars();
  }
}
