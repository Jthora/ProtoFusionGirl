/**
 * LeyLineDive — Stage 6.1 (Concept C — Projection Transit)
 *
 * The Ley Line Dive transit sequence. Pure Canvas 2D, no Phaser.
 *
 * Visual sequence:
 *   Phase 0  [0   – 1200ms]  Network view — Earth circle + ley line geometry
 *   Phase 1  [1200 – 1600ms] ALPHA-7 node pulses bright; "HOLOZONE ALPHA-7" label
 *   Phase 2  [1600 – 3400ms] Camera accelerates toward ALPHA-7 — ley lines streak
 *   Phase 3  [3400 – 4000ms] Node geometry tears open (expanding ring of light)
 *   Phase 4  [4000 – 4200ms] Hard white flash, then done
 *
 * Total duration: ~4.2 seconds.
 *
 * Usage:
 *   const dive = new LeyLineDive();
 *   dive.onComplete = () => { startGame(); };
 *   dive.mount();
 */

// ── Earth geometry constants ─────────────────────────────────────────────────

/** ALPHA-7 node location as a normalized angle offset from Earth centre (0=right). */
const ALPHA7_ANGLE = -0.42;   // radians from horizontal (roughly Pacific Northwest)
const ALPHA7_DIST  = 0.38;    // fraction of Earth radius from centre

// Ley line network: each entry is [startAngle, startRadius, endAngle, endRadius]
// in terms of Earth-relative polar coords (so they look like great-circle chords)
const LEY_LINES: [number, number, number, number][] = [
  [-2.8,  0.90,  1.1,  0.85],
  [-2.1,  0.95,  0.3,  0.92],
  [-1.5,  0.88,  1.8,  0.80],
  [-0.9,  0.95, -2.3,  0.88],
  [-0.3,  0.85,  2.4,  0.90],
  [ 0.5,  0.92, -1.9,  0.85],
  [ 1.2,  0.90,  2.8,  0.82],
  [ 1.9,  0.88, -0.7,  0.95],
  [ 2.5,  0.85,  0.8,  0.80],
  [ 3.0,  0.90, -2.5,  0.88],
  [-2.4,  0.82,  0.6,  0.78],
  [-1.7,  0.75,  1.5,  0.72],
  [-0.6,  0.80,  2.1,  0.76],
  [ 0.2,  0.70, -1.2,  0.82],
  [ 0.9,  0.78, -2.9,  0.75],
  [ 2.0,  0.65,  0.0,  0.70],
  [-3.1,  0.68,  1.7,  0.60],
  [-1.0,  0.60,  2.7,  0.65],
  [ 0.4,  0.55, -2.0,  0.62],
  [ 1.6,  0.50,  3.1,  0.55],
];

/** Named ley nodes (angle, radius) for the smaller intersection dots. */
const LEY_NODES: [number, number][] = [
  [-2.8,  0.90], [-1.5, 0.88], [-0.3, 0.85], [0.5, 0.92],
  [1.9,  0.88],  [2.5,  0.85], [-2.4, 0.82], [-1.7, 0.75],
  [0.2,  0.70],  [2.0,  0.65], [-1.0, 0.60], [0.4,  0.55],
  [ALPHA7_ANGLE, ALPHA7_DIST],  // ALPHA-7 node (index used below)
];
const ALPHA7_NODE_IDX = LEY_NODES.length - 1;

// ── Timing constants ─────────────────────────────────────────────────────────
const T_NETWORK_END   = 1200;
const T_PULSE_END     = 1600;
const T_ZOOM_END      = 3400;
const T_TEAR_END      = 4000;
const T_FLASH_END     = 4200;

// ── Component ─────────────────────────────────────────────────────────────────

export class LeyLineDive {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private raf    = 0;
  private startMs = 0;

  /** Called when the sequence finishes (white flash done). */
  onComplete?: () => void;

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('LeyLineDive: no 2D context');
    this.ctx = ctx;
  }

  /** Attach to DOM and begin immediately. */
  mount(): void {
    this.canvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 75000;
      background: #000;
    `;
    document.body.appendChild(this.canvas);
    this._resize();
    window.addEventListener('resize', () => this._resize());

    this.startMs = performance.now();
    const tick = (now: number) => {
      const t = now - this.startMs;
      if (t >= T_FLASH_END) {
        this.canvas.remove();
        this.onComplete?.();
        return;
      }
      this._draw(t);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.canvas.remove();
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private _resize(): void {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private _draw(t: number): void {
    const ctx  = this.ctx;
    const W    = this.canvas.width;
    const H    = this.canvas.height;
    const cx   = W / 2;
    const cy   = H / 2;

    // ── Phase 4: White flash ───────────────────────────────────────────────
    if (t >= T_TEAR_END) {
      const p = (t - T_TEAR_END) / (T_FLASH_END - T_TEAR_END);
      ctx.fillStyle = `rgba(255,255,255,${p.toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
      // Keep network underneath fading white
      this._drawNetwork(ctx, cx, cy, W, H, t, 0);
      ctx.fillStyle = `rgba(255,255,255,${(p * 0.92).toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
      return;
    }

    // ── Black background ───────────────────────────────────────────────────
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    // ── Compute zoom transform for phases 2-3 ────────────────────────────
    // Alpha7 world position (relative to Earth centre, pre-zoom)
    const earthR0 = Math.min(W, H) * 0.35;  // base Earth radius
    const a7wx = Math.cos(ALPHA7_ANGLE) * ALPHA7_DIST * earthR0;
    const a7wy = Math.sin(ALPHA7_ANGLE) * ALPHA7_DIST * earthR0;

    let zoom   = 1.0;
    let panX   = 0;
    let panY   = 0;
    let speed  = 0;

    if (t > T_PULSE_END && t < T_TEAR_END) {
      const p = (t - T_PULSE_END) / (T_ZOOM_END - T_PULSE_END);
      // Exponential zoom
      const eased = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      zoom  = 1 + eased * 18;
      speed = eased;
      // Pan so ALPHA-7 stays at screen centre
      panX = -(a7wx * (zoom - 1));
      panY = -(a7wy * (zoom - 1));
    } else if (t >= T_ZOOM_END) {
      zoom  = 19;
      speed = 1;
      panX  = -(a7wx * (zoom - 1));
      panY  = -(a7wy * (zoom - 1));
    }

    // ── Phase 3: Geometry tear ────────────────────────────────────────────
    if (t >= T_ZOOM_END) {
      const tearP = (t - T_ZOOM_END) / (T_TEAR_END - T_ZOOM_END);
      const tearR = tearP * Math.max(W, H) * 0.8;

      // Draw network dimly behind tear
      this._drawNetwork(ctx, cx + panX, cy + panY, W, H, t, zoom, 0.15);

      // Tear ring: expanding bright ring from centre
      const grad = ctx.createRadialGradient(cx, cy, Math.max(0, tearR - 40), cx, cy, tearR + 20);
      grad.addColorStop(0,   'rgba(255,255,255,0)');
      grad.addColorStop(0.5, `rgba(255,220,100,${(0.9 * (1 - tearP * 0.5)).toFixed(3)})`);
      grad.addColorStop(0.8, `rgba(255,255,255,${(0.7 * (1 - tearP * 0.6)).toFixed(3)})`);
      grad.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Bright white centre flash
      const centreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, tearR * 0.3);
      centreGrad.addColorStop(0,   `rgba(255,255,255,${(tearP * 0.8).toFixed(3)})`);
      centreGrad.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.fillStyle = centreGrad;
      ctx.fillRect(0, 0, W, H);
      return;
    }

    // ── Phases 0-2: Network view ──────────────────────────────────────────
    this._drawNetwork(ctx, cx + panX, cy + panY, W, H, t, zoom, 1.0, speed);
  }

  /** Draw the Earth ley-line network with zoom/pan transform applied. */
  private _drawNetwork(
    ctx: CanvasRenderingContext2D,
    originX: number,
    originY: number,
    W: number,
    H: number,
    t: number,
    zoom: number,
    baseAlpha = 1.0,
    speed = 0,
  ): void {
    const earthR = Math.min(W, H) * 0.35 * zoom;

    // ── Earth circle ──────────────────────────────────────────────────────
    ctx.save();
    ctx.strokeStyle = `rgba(255,255,255,${(baseAlpha * 0.35).toFixed(3)})`;
    ctx.lineWidth   = Math.max(0.5, zoom * 0.5);
    ctx.beginPath();
    ctx.arc(originX, originY, earthR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // ── Ley lines ─────────────────────────────────────────────────────────
    for (const [sa, sr, ea, er] of LEY_LINES) {
      const sx = originX + Math.cos(sa) * sr * earthR;
      const sy = originY + Math.sin(sa) * sr * earthR;
      const ex = originX + Math.cos(ea) * er * earthR;
      const ey = originY + Math.sin(ea) * er * earthR;

      // At high speed, draw streaked lines (motion-blur effect)
      const streakCount = speed > 0.1 ? Math.ceil(speed * 5) : 1;
      for (let s = 0; s < streakCount; s++) {
        const frac    = s / Math.max(streakCount - 1, 1);
        const lineAlpha = baseAlpha * 0.2 * (1 - frac * 0.8);
        const streakOffset = speed * s * 8;

        ctx.save();
        ctx.strokeStyle = `rgba(255,140,0,${lineAlpha.toFixed(3)})`;
        ctx.lineWidth   = Math.max(0.3, zoom * 0.25);
        ctx.beginPath();
        // Streak in the direction toward screen centre (zoom direction)
        const dirX = (sx - originX) * streakOffset / earthR;
        const dirY = (sy - originY) * streakOffset / earthR;
        ctx.moveTo(sx - dirX, sy - dirY);
        ctx.lineTo(ex - dirX, ey - dirY);
        ctx.stroke();
        ctx.restore();
      }

      // Primary line
      ctx.save();
      ctx.strokeStyle = `rgba(255,140,0,${(baseAlpha * 0.25).toFixed(3)})`;
      ctx.lineWidth   = Math.max(0.3, zoom * 0.3);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.restore();
    }

    // ── Ley nodes ─────────────────────────────────────────────────────────
    for (let i = 0; i < LEY_NODES.length; i++) {
      const [na, nr] = LEY_NODES[i];
      const nx = originX + Math.cos(na) * nr * earthR;
      const ny = originY + Math.sin(na) * nr * earthR;
      const isAlpha7 = i === ALPHA7_NODE_IDX;

      let nodeAlpha  = baseAlpha * 0.5;
      let nodeRadius = Math.max(1, zoom * 1.5);
      let nodeColor  = 'rgba(255,140,0,';

      if (isAlpha7 && t >= T_NETWORK_END) {
        // Pulse bright
        const pulseP = Math.min(1, (t - T_NETWORK_END) / (T_PULSE_END - T_NETWORK_END));
        const pulse  = 0.6 + 0.4 * Math.sin(t / 150);
        nodeAlpha    = baseAlpha * (0.5 + pulseP * 0.5) * pulse;
        nodeRadius   = Math.max(2, zoom * (2 + pulseP * 3));
        nodeColor    = 'rgba(255,220,60,';

        // Outer glow halo
        if (zoom < 15) {
          const haloGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nodeRadius * 4);
          haloGrad.addColorStop(0,   `rgba(255,200,0,${(nodeAlpha * 0.5).toFixed(3)})`);
          haloGrad.addColorStop(1,   'rgba(255,200,0,0)');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(nx, ny, nodeRadius * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // "HOLOZONE ALPHA-7" label (appears during pulse phase)
        if (t >= T_NETWORK_END + 100 && t < T_ZOOM_END && zoom < 8) {
          const labelAlpha = Math.min(1, (t - T_NETWORK_END - 100) / 300) * baseAlpha;
          ctx.save();
          ctx.font          = `${Math.max(9, zoom * 8)}px 'Courier New', monospace`;
          ctx.fillStyle     = `rgba(255,180,0,${labelAlpha.toFixed(3)})`;
          ctx.letterSpacing = '2px';
          ctx.textAlign     = 'left';
          ctx.fillText('HOLOZONE ALPHA-7', nx + nodeRadius * 2, ny - nodeRadius);
          ctx.restore();
        }
      }

      ctx.fillStyle = `${nodeColor}${nodeAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(nx, ny, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
