/**
 * WorldMaterialization — Stage 2.2
 *
 * The HoloDeck environment does not simply appear — it assembles, as if rendered
 * on demand by the projection system. This overlay recreates that sensation:
 *
 *   Phase 0  [0 – 150ms]   White flash — echo of the Projection Transit cut
 *   Phase 1  [150 – 500ms] White → dark (#0d0e10), HoloDeck grid breathes in
 *   Phase 2  [500 – 1700ms] Expanding amber ring reveals the world outward from
 *                            Jane's screen position (destination-out punch-through)
 *   Phase 3  [1700 – 2100ms] Overlay fades to transparent, self-removes
 *
 * The expanding amber ring IS the wireframe — the blueprint being printed.
 * Terrain closest to Jane materialises first; the far edges fill last.
 *
 * Pure DOM canvas overlay — no Phaser dependency.
 *
 * Usage:
 *   const mat = new WorldMaterialization(screenX, screenY);
 *   mat.mount();                 // starts immediately
 *   mat.onComplete = () => { … } // fires when overlay has fully faded
 */

export class WorldMaterialization {
  // Tuning ─────────────────────────────────────────────────────────────────
  private static readonly T_WHITE_HOLD   =  150;   // ms — white flash hold
  private static readonly T_DARK_FADE    =  350;   // ms — white → dark
  private static readonly T_RING_START   =  500;   // ms — expand begins
  private static readonly T_RING_END     = 1700;   // ms — fully revealed
  private static readonly T_FADE_END     = 2100;   // ms — overlay gone
  private static readonly RING_WIDTH     =   28;   // px — amber ring thickness
  private static readonly RING_ALPHA     =  0.9;   // amber ring opacity
  private static readonly DARK_ALPHA     =  0.92;  // dark overlay opacity

  // ─────────────────────────────────────────────────────────────────────────
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private raf    = 0;
  private startMs = 0;
  private centerX: number;
  private centerY: number;

  /** Called once the overlay has fully faded and been removed. */
  onComplete?: () => void;

  /**
   * @param centerX  Screen X of the focal point (Jane's screen position, or window center)
   * @param centerY  Screen Y of the focal point
   */
  constructor(centerX?: number, centerY?: number) {
    this.centerX = centerX ?? window.innerWidth  * 0.5;
    this.centerY = centerY ?? window.innerHeight * 0.5;

    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('WorldMaterialization: could not get 2D context');
    this.ctx = ctx;
  }

  /** Attach to DOM and begin the sequence. */
  mount(): void {
    this.canvas.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 62000;
      pointer-events: none;
    `;
    document.body.appendChild(this.canvas);

    // Handle resize
    const resize = () => this._resize();
    window.addEventListener('resize', resize);
    this._resize();

    this.startMs = performance.now();

    const tick = (now: number) => {
      const t = now - this.startMs;
      if (t >= WorldMaterialization.T_FADE_END) {
        this.canvas.remove();
        window.removeEventListener('resize', resize);
        this.onComplete?.();
        return;
      }
      this._draw(t);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  /** Abort and remove the overlay immediately (e.g. scene restart). */
  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.canvas.remove();
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private _resize(): void {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private _draw(t: number): void {
    const { ctx } = this;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const T_WH  = WorldMaterialization.T_WHITE_HOLD;
    const T_DF  = WorldMaterialization.T_DARK_FADE;
    const T_RS  = WorldMaterialization.T_RING_START;
    const T_RE  = WorldMaterialization.T_RING_END;
    const T_FE  = WorldMaterialization.T_FADE_END;

    ctx.clearRect(0, 0, W, H);

    // Maximum radius needed to cover the whole canvas from the focal point
    const maxR = Math.sqrt(
      Math.max(this.centerX, W - this.centerX) ** 2 +
      Math.max(this.centerY, H - this.centerY) ** 2,
    ) + WorldMaterialization.RING_WIDTH;

    if (t < T_WH) {
      // ── Phase 0: White flash ──────────────────────────────────────────────
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      return;
    }

    if (t < T_WH + T_DF) {
      // ── Phase 1: White → dark ─────────────────────────────────────────────
      const p = (t - T_WH) / T_DF;               // 0 → 1
      const whiteFraction = 1 - p;
      // Dark base
      ctx.fillStyle = `rgba(13,14,16,${(WorldMaterialization.DARK_ALPHA * p).toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
      // White residue fading
      if (whiteFraction > 0.01) {
        ctx.fillStyle = `rgba(255,255,255,${whiteFraction.toFixed(3)})`;
        ctx.fillRect(0, 0, W, H);
      }
      return;
    }

    if (t < T_RS) {
      // ── Phase 1 tail: fully dark, waiting for ring ────────────────────────
      ctx.fillStyle = `rgba(13,14,16,${WorldMaterialization.DARK_ALPHA})`;
      ctx.fillRect(0, 0, W, H);
      return;
    }

    // ── Phase 2: Expanding ring reveal ────────────────────────────────────
    const ringP = Math.min((t - T_RS) / (T_RE - T_RS), 1); // 0 → 1
    // Ease in-out quad
    const eased = ringP < 0.5
      ? 2 * ringP * ringP
      : 1 - (-2 * ringP + 2) ** 2 / 2;
    const revealR = eased * maxR;

    // Overall overlay alpha (1 during reveal, fading in Phase 3)
    let overlayAlpha = WorldMaterialization.DARK_ALPHA;
    if (t >= T_RE) {
      const fadeP = (t - T_RE) / (T_FE - T_RE);    // 0 → 1
      overlayAlpha = WorldMaterialization.DARK_ALPHA * (1 - fadeP);
    }

    if (overlayAlpha <= 0.005) return;

    // Draw dark overlay with circular punch-through (destination-out)
    ctx.save();
    ctx.globalAlpha = overlayAlpha;

    // Dark fill covers whole canvas
    ctx.fillStyle = '#0d0e10';
    ctx.fillRect(0, 0, W, H);

    // Punch a growing circle to reveal the game beneath
    if (revealR > 0) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, revealR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fill();
    }

    ctx.restore();

    // Amber wireframe ring at the expanding edge ─────────────────────────
    if (revealR > 0 && t < T_RE) {
      const ringW  = WorldMaterialization.RING_WIDTH;
      const innerR = Math.max(0, revealR - ringW);

      // Ring alpha: bright at start, dims as reveal nears completion
      const ringAlpha = WorldMaterialization.RING_ALPHA * (1 - ringP * 0.6);

      const grad = ctx.createRadialGradient(
        this.centerX, this.centerY, innerR,
        this.centerX, this.centerY, revealR,
      );
      grad.addColorStop(0,   `rgba(255,140,0,0)`);
      grad.addColorStop(0.4, `rgba(255,140,0,${(ringAlpha * 0.5).toFixed(3)})`);
      grad.addColorStop(0.75,`rgba(255,180,40,${ringAlpha.toFixed(3)})`);
      grad.addColorStop(1,   `rgba(255,220,80,${(ringAlpha * 0.3).toFixed(3)})`);

      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, revealR,  0, Math.PI * 2);
      ctx.arc(this.centerX, this.centerY, innerR,   0, Math.PI * 2, true);
      ctx.fill();
      ctx.restore();

      // Bright inner edge hairline
      if (revealR > 2) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = ringAlpha * 0.6;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, revealR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,220,100,0.8)';
        ctx.lineWidth   = 1.5;
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}
