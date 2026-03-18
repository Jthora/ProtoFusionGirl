/**
 * BeuSignatureRenderer — Stage 6.2.1
 *
 * Renders Beu as an ASI-visible data signature in world space:
 *   - Bright white light point (always visible to the ASI)
 *   - Lifecycle orbit ring that changes with Beu's stage:
 *       seed    — no ring (Beu not yet present)
 *       sprout  — faint single ring, slow pulse
 *       growth  — steady single ring, moderate pulse
 *       bloom   — bright single ring, faster pulse
 *       bond    — resonant double ring with phase offset
 *   - Unique frequency waveform drawn near the Beu point
 *
 * This is a Phaser.GameObjects.Graphics object — it renders in world space
 * at depth 65 (above Jane aura at 55, below UI at 1000).
 *
 * Usage (in GameScene.create()):
 *   this.beuSig = new BeuSignatureRenderer(this);
 *   this.beuSig.setStage('sprout');
 *
 * Usage (in GameScene.update()):
 *   this.beuSig.render(beuGlowX, beuGlowY, time);
 */

import Phaser from 'phaser';

export type BeuLifecycleStage = 'seed' | 'sprout' | 'growth' | 'bloom' | 'bond';

// Per-stage tuning
const STAGE_PARAMS: Record<BeuLifecycleStage, {
  ringCount: number;
  baseR: number;       // inner ring radius (px)
  pulseAmp: number;    // radius pulse amplitude
  pulseHz: number;     // pulse frequency (Hz)
  alpha: number;       // ring alpha
  waveAmp: number;     // waveform amplitude (px)
}> = {
  seed:   { ringCount: 0, baseR: 8,  pulseAmp: 0,   pulseHz: 0.6, alpha: 0,    waveAmp: 0 },
  sprout: { ringCount: 1, baseR: 8,  pulseAmp: 1.5, pulseHz: 0.6, alpha: 0.30, waveAmp: 2 },
  growth: { ringCount: 1, baseR: 10, pulseAmp: 2.0, pulseHz: 0.9, alpha: 0.55, waveAmp: 3 },
  bloom:  { ringCount: 1, baseR: 13, pulseAmp: 2.5, pulseHz: 1.3, alpha: 0.80, waveAmp: 4.5 },
  bond:   { ringCount: 2, baseR: 13, pulseAmp: 1.5, pulseHz: 1.5, alpha: 0.90, waveAmp: 5 },
};

export class BeuSignatureRenderer {
  private gfx: Phaser.GameObjects.Graphics;
  private stage: BeuLifecycleStage = 'seed';
  /** Unique seed for the waveform shape (0–1). Set once on creation. */
  private waveSeed: number;

  constructor(scene: Phaser.Scene, waveSeed?: number) {
    this.gfx = scene.add.graphics().setDepth(65);
    this.waveSeed = waveSeed ?? Math.random();
  }

  setStage(stage: BeuLifecycleStage): void {
    this.stage = stage;
  }

  getStage(): BeuLifecycleStage {
    return this.stage;
  }

  /**
   * Call each frame from GameScene.update().
   * @param x      World X of the Beu's centre
   * @param y      World Y of the Beu's centre
   * @param timeMs Phaser time (ms) for animation
   */
  render(x: number, y: number, timeMs: number): void {
    this.gfx.clear();

    const p = STAGE_PARAMS[this.stage];
    if (this.stage === 'seed') return;  // nothing to draw yet

    const t     = timeMs / 1000;
    const pulse = Math.sin(t * Math.PI * 2 * p.pulseHz);

    // ── White light point ─────────────────────────────────────────────────
    this.gfx.fillStyle(0xf0ede8, Math.min(1, p.alpha * 1.4));
    this.gfx.fillCircle(x, y, 2.5 + pulse * 0.5);

    // Soft glow halo
    this.gfx.fillStyle(0xffffff, p.alpha * 0.12);
    this.gfx.fillCircle(x, y, 7 + pulse);

    // ── Orbit ring(s) ─────────────────────────────────────────────────────
    for (let ring = 0; ring < p.ringCount; ring++) {
      const phase   = ring === 1 ? Math.PI * 0.55 : 0;   // second ring phase-offset
      const ringR   = p.baseR + (ring * 6) + pulse * p.pulseAmp;
      const ringAlpha = ring === 1 ? p.alpha * 0.55 : p.alpha;

      this.gfx.lineStyle(ring === 1 ? 0.8 : 1.2, 0xf0ede8, ringAlpha);
      this.gfx.beginPath();

      // Draw ring as a series of arcs with tiny gaps (dashed feel at bond stage)
      const segments = this.stage === 'bond' ? 24 : 64;
      const gapFraction = this.stage === 'bond' ? 0.12 : 0.0;
      for (let s = 0; s < segments; s++) {
        const a0 = (s / segments) * Math.PI * 2 + phase + t * (ring === 1 ? -0.4 : 0.3);
        const a1 = ((s + (1 - gapFraction)) / segments) * Math.PI * 2 + phase + t * (ring === 1 ? -0.4 : 0.3);
        const sx = x + Math.cos(a0) * ringR;
        const sy = y + Math.sin(a0) * ringR;
        const ex = x + Math.cos(a1) * ringR;
        const ey = y + Math.sin(a1) * ringR;
        if (s === 0) {
          this.gfx.moveTo(sx, sy);
        }
        this.gfx.lineTo(ex, ey);
      }
      this.gfx.strokePath();
    }

    // ── Frequency waveform ────────────────────────────────────────────────
    if (p.waveAmp > 0) {
      this._drawWaveform(x, y, t, p.waveAmp, p.alpha);
    }
  }

  /** Draw a small 12-point sine waveform to the right of the Beu point. */
  private _drawWaveform(cx: number, cy: number, t: number, amp: number, alpha: number): void {
    const waveLen = 18;   // px horizontal span
    const points  = 14;
    const startX  = cx + 9;
    const freq    = 2.5 + this.waveSeed * 1.5;  // unique per Beu
    const phaseOffset = this.waveSeed * Math.PI * 2;

    this.gfx.lineStyle(0.8, 0xf0ede8, alpha * 0.6);
    this.gfx.beginPath();
    for (let i = 0; i <= points; i++) {
      const px = startX + (i / points) * waveLen;
      const py = cy + Math.sin(freq * (i / points) * Math.PI * 2 + t * 2.2 + phaseOffset) * amp;
      if (i === 0) this.gfx.moveTo(px, py);
      else         this.gfx.lineTo(px, py);
    }
    this.gfx.strokePath();
  }

  destroy(): void {
    this.gfx.destroy();
  }
}
