/**
 * HoloDeckGrid — screen-space canvas overlay showing the underlying structure
 * of the simulation. Visible to the ASI; never scrolls with the world.
 *
 * Opacity is reactive to game state:
 *   stable    → 4%   (barely perceptible)
 *   active    → 8%
 *   disrupted → 12%
 *   nefarium  → 16% + horizontal drift distortion
 *   critical  → 25% + scan-line flicker
 *   failure   → 35% + inversion flash pulses
 *
 * Usage:
 *   const grid = new HoloDeckGrid(tileSize);
 *   grid.mount();                    // inserts canvas into DOM
 *   grid.setState('disrupted');     // changes opacity target
 *   grid.destroy();
 */

export type GridState =
  | 'stable'
  | 'active'
  | 'disrupted'
  | 'nefarium'
  | 'critical'
  | 'failure';

interface GridStateConfig {
  targetOpacity: number;
  driftAmp: number;       // px horizontal wobble amplitude
  driftSpeed: number;     // wobble speed (radians/second)
  flickerHz: number;      // 0 = no flicker
}

const STATE_CONFIG: Record<GridState, GridStateConfig> = {
  stable:    { targetOpacity: 0.04, driftAmp: 0,    driftSpeed: 0,   flickerHz: 0   },
  active:    { targetOpacity: 0.08, driftAmp: 0,    driftSpeed: 0,   flickerHz: 0   },
  disrupted: { targetOpacity: 0.12, driftAmp: 0,    driftSpeed: 0,   flickerHz: 0   },
  nefarium:  { targetOpacity: 0.16, driftAmp: 1.5,  driftSpeed: 0.8, flickerHz: 0   },
  critical:  { targetOpacity: 0.25, driftAmp: 0,    driftSpeed: 0,   flickerHz: 2.5 },
  failure:   { targetOpacity: 0.35, driftAmp: 2.5,  driftSpeed: 1.4, flickerHz: 5   },
};

const GRID_COLOR = 'rgba(255, 140, 0, 1)'; // opacity applied via canvas globalAlpha

export class HoloDeckGrid {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize: number;
  private mounted = false;
  private destroyed = false;

  private currentOpacity  = 0;
  private targetOpacity   = STATE_CONFIG.stable.targetOpacity;
  private currentDriftAmp = 0;
  private driftPhase      = 0;
  private driftSpeed      = 0;
  private flickerHz       = 0;
  private flickerPhase    = 0;

  private animFrame = 0;
  private lastTime  = 0;
  private resizeObserver: ResizeObserver | null = null;

  constructor(tileSize = 32) {
    this.tileSize = tileSize;
    this.canvas   = document.createElement('canvas');
    this.ctx      = this.canvas.getContext('2d')!;

    this.canvas.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 10001;
      width: 100%;
      height: 100%;
      opacity: 1;
    `;
  }

  mount(): void {
    if (this.mounted || this.destroyed) return;
    this.mounted = true;
    document.body.appendChild(this.canvas);
    this.resize();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(document.body);

    this.lastTime = performance.now();
    this.animFrame = requestAnimationFrame(t => this.tick(t));
  }

  private resize(): void {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setState(state: GridState): void {
    const cfg = STATE_CONFIG[state];
    this.targetOpacity   = cfg.targetOpacity;
    this.driftSpeed      = cfg.driftSpeed;
    this.currentDriftAmp = cfg.driftAmp;
    this.flickerHz       = cfg.flickerHz;
  }

  private tick(now: number): void {
    if (this.destroyed) return;

    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // Lerp opacity toward target (0.5s transition)
    this.currentOpacity += (this.targetOpacity - this.currentOpacity) * Math.min(1, dt * 2);

    // Drift phase
    this.driftPhase  += this.driftSpeed * dt;
    this.flickerPhase += (this.flickerHz * 2 * Math.PI) * dt;

    this.draw(now);
    this.animFrame = requestAnimationFrame(t => this.tick(t));
  }

  private draw(_now: number): void {
    const { canvas, ctx, tileSize, currentOpacity } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentOpacity < 0.002) return;

    // Flicker modulation
    let opacity = currentOpacity;
    if (this.flickerHz > 0) {
      const flicker = 0.5 + 0.5 * Math.sin(this.flickerPhase);
      opacity = currentOpacity * (0.6 + 0.4 * flicker);
    }

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth   = 1;

    const drift = this.currentDriftAmp > 0
      ? Math.sin(this.driftPhase) * this.currentDriftAmp
      : 0;

    const W = canvas.width;
    const H = canvas.height;

    // Vertical lines
    ctx.beginPath();
    for (let x = drift; x <= W + tileSize; x += tileSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
    }
    ctx.stroke();

    // Horizontal lines
    ctx.beginPath();
    for (let y = 0; y <= H + tileSize; y += tileSize) {
      ctx.moveTo(0,     y);
      ctx.lineTo(W + (drift * 0.3), y);
    }
    ctx.stroke();

    ctx.restore();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    cancelAnimationFrame(this.animFrame);
    this.resizeObserver?.disconnect();
    this.canvas.remove();
  }
}
