/**
 * VisionDegradation — Stage 4.2
 *
 * Applies post-processing effects to the Phaser canvas via CSS filter
 * and a fixed-position canvas overlay for scanlines.
 *
 * Effects:
 *   scanlines   — 2px horizontal repeating lines, variable opacity
 *   inversion   — brief CSS invert(1) flash, 80–150ms
 *   edgeNoise   — per-frame noise at screen edges (canvas overlay)
 *   brightShift — global brightness offset (±)
 *
 * State presets driven by game events:
 *   'clear'     — no effects
 *   'nefarium'  — faint scanlines (15% opacity)
 *   'disrupted' — scanlines (25%) + edge noise
 *   'saturated' — edge noise intensifies
 *   'critical'  — scanlines (40%) + edge noise + brief inversion
 *
 * Usage:
 *   const vd = new VisionDegradation(phaserCanvas);
 *   vd.mount();
 *   vd.setState('nefarium');
 *   vd.triggerInversion();   // one-shot 80ms invert
 *   vd.destroy();
 */

export type VisionState = 'clear' | 'nefarium' | 'disrupted' | 'saturated' | 'critical';

interface VisionStateConfig {
  scanlineAlpha: number;   // 0–1
  edgeNoiseAmp: number;    // 0 = none, 1 = full
  brightnessOffset: number;// e.g. -0.05 = darken 5%
}

const STATE_CONFIG: Record<VisionState, VisionStateConfig> = {
  clear:     { scanlineAlpha: 0,    edgeNoiseAmp: 0,    brightnessOffset: 0     },
  nefarium:  { scanlineAlpha: 0.12, edgeNoiseAmp: 0,    brightnessOffset: -0.03 },
  disrupted: { scanlineAlpha: 0.22, edgeNoiseAmp: 0.35, brightnessOffset: -0.05 },
  saturated: { scanlineAlpha: 0.15, edgeNoiseAmp: 0.65, brightnessOffset: 0     },
  critical:  { scanlineAlpha: 0.40, edgeNoiseAmp: 0.80, brightnessOffset: -0.08 },
};

export class VisionDegradation {
  private phaserCanvas: HTMLCanvasElement;
  private overlay: HTMLCanvasElement;
  private oCtx: CanvasRenderingContext2D;

  private currentState: VisionState = 'clear';
  private currentScanAlpha  = 0;
  private currentEdgeNoise  = 0;
  private currentBrightness = 0;

  private targetScanAlpha  = 0;
  private targetEdgeNoise  = 0;
  private targetBrightness = 0;

  private invertActive   = false;
  private invertUntil    = 0;

  private mounted   = false;
  private destroyed = false;
  private animFrame = 0;
  private lastTime  = 0;
  private resizeObs: ResizeObserver | null = null;

  constructor(phaserCanvas: HTMLCanvasElement) {
    this.phaserCanvas = phaserCanvas;

    this.overlay = document.createElement('canvas');
    this.oCtx    = this.overlay.getContext('2d')!;

    this.overlay.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 10003;
      width: 100%;
      height: 100%;
    `;
  }

  mount(): void {
    if (this.mounted || this.destroyed) return;
    this.mounted = true;
    document.body.appendChild(this.overlay);
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(document.body);
    this.resize();
    this.lastTime  = performance.now();
    this.animFrame = requestAnimationFrame(t => this.tick(t));
  }

  private resize(): void {
    this.overlay.width  = window.innerWidth;
    this.overlay.height = window.innerHeight;
  }

  setState(state: VisionState): void {
    if (state === this.currentState) return;
    this.currentState     = state;
    const cfg             = STATE_CONFIG[state];
    this.targetScanAlpha  = cfg.scanlineAlpha;
    this.targetEdgeNoise  = cfg.edgeNoiseAmp;
    this.targetBrightness = cfg.brightnessOffset;
  }

  /**
   * Trigger a brief inversion flash (one-shot, non-repeating).
   * Duration: 80–150ms depending on current state.
   */
  triggerInversion(durationMs = 100): void {
    if (this.invertActive) return;
    this.invertActive = true;
    this.invertUntil  = performance.now() + durationMs;
  }

  private tick(now: number): void {
    if (this.destroyed) return;

    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // Lerp all values toward targets (0.8s transition)
    const lerpRate = dt * 1.25;
    this.currentScanAlpha  += (this.targetScanAlpha  - this.currentScanAlpha)  * Math.min(1, lerpRate);
    this.currentEdgeNoise  += (this.targetEdgeNoise  - this.currentEdgeNoise)  * Math.min(1, lerpRate);
    this.currentBrightness += (this.targetBrightness - this.currentBrightness) * Math.min(1, lerpRate);

    // Inversion flash
    const inverting = this.invertActive && now < this.invertUntil;
    if (this.invertActive && now >= this.invertUntil) {
      this.invertActive = false;
    }

    // Apply CSS filter to Phaser canvas
    this.applyFilter(inverting);

    // Draw overlay (scanlines + edge noise)
    this.drawOverlay(now);

    this.animFrame = requestAnimationFrame(t => this.tick(t));
  }

  private applyFilter(inverting: boolean): void {
    const brightness = Math.max(0.3, 1 + this.currentBrightness);
    let filter = `brightness(${brightness.toFixed(3)})`;
    if (inverting) filter += ' invert(1)';
    // Only write when value actually changed (avoid style thrashing)
    if (this.phaserCanvas.style.filter !== filter) {
      this.phaserCanvas.style.filter = filter;
    }
  }

  private drawOverlay(now: number): void {
    const { overlay, oCtx } = this;
    const W = overlay.width;
    const H = overlay.height;
    oCtx.clearRect(0, 0, W, H);

    // ── Scanlines ─────────────────────────────────────────────────────────────
    if (this.currentScanAlpha > 0.005) {
      oCtx.fillStyle = `rgba(0,0,0,${this.currentScanAlpha.toFixed(3)})`;
      for (let y = 0; y < H; y += 4) {
        oCtx.fillRect(0, y, W, 2);
      }
    }

    // ── Edge noise ────────────────────────────────────────────────────────────
    if (this.currentEdgeNoise > 0.01) {
      const edgeW = Math.round(W * 0.08);   // 8% of width each side
      const edgeH = Math.round(H * 0.06);   // 6% of height each side
      const seed  = now * 0.001;

      oCtx.save();
      // Left edge
      this.drawEdgeNoise(oCtx, 0, 0, edgeW, H, seed, this.currentEdgeNoise);
      // Right edge
      this.drawEdgeNoise(oCtx, W - edgeW, 0, edgeW, H, seed + 100, this.currentEdgeNoise);
      // Top edge
      this.drawEdgeNoise(oCtx, 0, 0, W, edgeH, seed + 200, this.currentEdgeNoise);
      // Bottom edge
      this.drawEdgeNoise(oCtx, 0, H - edgeH, W, edgeH, seed + 300, this.currentEdgeNoise);
      oCtx.restore();
    }
  }

  private drawEdgeNoise(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    seed: number, amp: number
  ): void {
    const pts = 24;
    for (let i = 0; i < pts; i++) {
      const nx = x + Math.random() * w;
      const ny = y + Math.random() * h;
      const ns = Math.sin(seed + i * 1.7) * 0.5 + 0.5;
      const alpha = ns * amp * 0.18;
      ctx.fillStyle = `rgba(255,140,0,${alpha.toFixed(3)})`;
      ctx.fillRect(nx, ny, 1 + Math.random() * 2, 1);
    }
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    cancelAnimationFrame(this.animFrame);
    this.resizeObs?.disconnect();
    // Restore Phaser canvas filter
    if (this.phaserCanvas.style.filter && !this.phaserCanvas.style.filter.includes('saturate')) {
      this.phaserCanvas.style.filter = '';
    }
    this.overlay.remove();
  }
}
