/**
 * SectorScanRadar — Stage 6.3
 *
 * The minimap is not a top-down map. It is a psionic radar sweep — the ASI's
 * passive awareness of the surrounding area.
 *
 * Visual design (spec §05-asi-interface.md §3):
 *   - Dark circular display (#0a0500 bg) with amber border
 *   - A sweep line rotates through the display — like a sonar ping
 *   - Elements appear as the sweep passes them, then fade between sweeps
 *   - 3-second full rotation period
 *
 * Entity types and their display:
 *   jane        — bright amber dot labeled "J", always centered
 *   ley-node    — amber dot, pulsing at ley frequency
 *   ley-disrupted — fragmented dot, irregular pulse
 *   beu         — bright white dot with orbit ring
 *   nefarium    — dark inverted dot with distortion halo
 *   anchor      — small amber diamond
 *   waypoint    — fading amber ring
 *   enemy       — red-amber dot, sharp edges
 *
 * Scan range modifiers (set via `setScanQuality()`):
 *   normal      — full range
 *   disrupted   — 70% range, ping artifacts
 *   nefarium    — 60% range, false readings
 *
 * Pure DOM canvas overlay — no Phaser dependency.
 *
 * Usage:
 *   const radar = new SectorScanRadar(160, 800);
 *   radar.mount();                         // attaches to DOM
 *   // In game update loop:
 *   radar.updateEntities(janeX, janeY, entities);
 *   radar.setScanQuality('disrupted');     // optional
 */

export type RadarEntityType =
  | 'jane' | 'ley-node' | 'ley-disrupted'
  | 'beu' | 'nefarium' | 'anchor' | 'waypoint' | 'enemy';

export type ScanQuality = 'normal' | 'disrupted' | 'nefarium';

export interface RadarEntity {
  id: string;
  type: RadarEntityType;
  worldX: number;
  worldY: number;
}

// ─── Tuning ───────────────────────────────────────────────────────────────────

const SWEEP_PERIOD_MS = 3000;       // ms per full rotation
const FADE_DURATION_MS = 2600;      // ms before entity fades back to 0 after sweep
const ARTIFACT_JITTER_PX = 3;      // max jitter for disrupted-zone artifacts

// Entity display colours (hex strings for canvas)
const E_AMBER    = '#FF8C00';
const E_AMBER_DIM= 'rgba(255,140,0,0.55)';
const E_WHITE    = '#f0ede8';
const E_RED      = '#ff6633';
const E_NEFAR    = 'rgba(20,8,8,0.9)';

// ─── Component ────────────────────────────────────────────────────────────────

interface TrackedEntity extends RadarEntity {
  revealTime: number;   // performance.now() when the sweep last passed it
  alpha: number;        // current render alpha (updated per frame)
}

export class SectorScanRadar {
  private readonly displaySize: number;   // diameter of the circular radar (px)
  private readonly scanRangeWorld: number;// world units that = full radar radius

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private raf     = 0;
  private prevNow = 0;

  private sweepAngle = -Math.PI / 2;     // current sweep angle (radians, 0 = right)
  private sweepQ: ScanQuality = 'normal';

  private janeWorldX = 0;
  private janeWorldY = 0;
  private tracked: Map<string, TrackedEntity> = new Map();

  /** Fired when the overlay is fully set up (informational). */
  onMount?: () => void;

  /**
   * @param displaySize    Diameter of the circular radar in pixels (default 160)
   * @param scanRangeWorld World-unit radius shown at full radar radius (default 800)
   */
  constructor(displaySize = 160, scanRangeWorld = 800) {
    this.displaySize    = displaySize;
    this.scanRangeWorld = scanRangeWorld;

    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('SectorScanRadar: no 2D context');
    this.ctx = ctx;
  }

  /** Attach to DOM and start the RAF loop. */
  mount(): void {
    const d = this.displaySize;
    this.canvas.width  = d;
    this.canvas.height = d;
    this.canvas.style.cssText = `
      position: fixed;
      bottom: 16px;
      right: 16px;
      width: ${d}px;
      height: ${d}px;
      z-index: 58000;
      pointer-events: none;
      border-radius: 50%;
    `;
    document.body.appendChild(this.canvas);
    this.prevNow = performance.now();

    const tick = (now: number) => {
      const dt = now - this.prevNow;
      this.prevNow = now;
      this._update(dt, now);
      this._draw(now);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
    this.onMount?.();
  }

  /** Remove from DOM and stop animation. */
  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.canvas.remove();
  }

  /**
   * Push world-space entity data each game frame.
   * Jane is derived from janeWorldX/Y — do not include her in `entities`.
   */
  updateEntities(janeWorldX: number, janeWorldY: number, entities: RadarEntity[]): void {
    this.janeWorldX = janeWorldX;
    this.janeWorldY = janeWorldY;

    // Mark new/updated entities
    const seen = new Set<string>();
    for (const e of entities) {
      seen.add(e.id);
      const existing = this.tracked.get(e.id);
      if (existing) {
        existing.worldX = e.worldX;
        existing.worldY = e.worldY;
        existing.type   = e.type;
      } else {
        this.tracked.set(e.id, { ...e, revealTime: -FADE_DURATION_MS, alpha: 0 });
      }
    }
    // Remove stale entities
    for (const id of this.tracked.keys()) {
      if (!seen.has(id)) this.tracked.delete(id);
    }
  }

  /** Set scan quality (affects range and artifacts). */
  setScanQuality(q: ScanQuality): void {
    this.sweepQ = q;
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private _rangeMultiplier(): number {
    switch (this.sweepQ) {
      case 'disrupted': return 0.70;
      case 'nefarium':  return 0.60;
      default:          return 1.00;
    }
  }

  private _update(dt: number, now: number): void {
    // Advance sweep angle
    this.sweepAngle += (2 * Math.PI) / SWEEP_PERIOD_MS * dt;
    if (this.sweepAngle > Math.PI) this.sweepAngle -= 2 * Math.PI;

    const R    = this.displaySize / 2;
    const range = this.scanRangeWorld * this._rangeMultiplier();

    // Check which entities the sweep is currently crossing
    for (const e of this.tracked.values()) {
      const dx = e.worldX - this.janeWorldX;
      const dy = e.worldY - this.janeWorldY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > range) {
        // Out of range — don't reveal
        e.alpha = 0;
        continue;
      }
      const entityAngle = Math.atan2(dy, dx);
      // Sweep crosses entity when sweepAngle ≈ entityAngle
      const diff = _angleDiff(entityAngle, this.sweepAngle);
      if (Math.abs(diff) < (2 * Math.PI) / SWEEP_PERIOD_MS * dt * 2) {
        e.revealTime = now;
      }

      // Decay alpha based on time since last reveal
      const elapsed = now - e.revealTime;
      if (elapsed <= 0) {
        e.alpha = 1;
      } else {
        e.alpha = Math.max(0, 1 - elapsed / FADE_DURATION_MS);
        // Extra decay for nefarium-zone jitter
        if (this.sweepQ === 'nefarium' && Math.random() < 0.02) {
          e.alpha *= Math.random();
        }
      }
    }

    // Scale-suppress: keep the unused R binding so TS doesn't warn
    void R;
  }

  private _draw(now: number): void {
    const ctx  = this.ctx;
    const d    = this.displaySize;
    const R    = d / 2;  // radar display radius (px)
    const range = this.scanRangeWorld * this._rangeMultiplier();

    ctx.clearRect(0, 0, d, d);

    // ── Clip everything to circle ─────────────────────────────────────────
    ctx.save();
    ctx.beginPath();
    ctx.arc(R, R, R - 1, 0, Math.PI * 2);
    ctx.clip();

    // ── Background ────────────────────────────────────────────────────────
    ctx.fillStyle = '#0a0500';
    ctx.fillRect(0, 0, d, d);

    // ── Concentric range rings ─────────────────────────────────────────────
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(R, R, (R - 2) * (i / 3), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,140,0,0.08)';
      ctx.lineWidth   = 1;
      ctx.stroke();
    }

    // ── Crosshairs ────────────────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(255,140,0,0.07)';
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(R, 2); ctx.lineTo(R, d - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, R); ctx.lineTo(d - 2, R); ctx.stroke();

    // ── Sweep trail (gradient sector behind sweep line) ───────────────────
    const trailSweep = Math.PI * 0.4;   // trailing arc size
    const trailStart = this.sweepAngle - trailSweep;
    const grad = (ctx as any).createConicGradient
      ? (ctx as any).createConicGradient(trailStart, R, R)
      : null;

    if (grad) {
      // Conical gradient (only available in some browsers)
      grad.addColorStop(0, 'rgba(255,140,0,0)');
      grad.addColorStop(1, 'rgba(255,140,0,0.12)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(R, R);
      ctx.arc(R, R, R - 2, trailStart, this.sweepAngle);
      ctx.closePath();
      ctx.fill();
    } else {
      // Fallback: manual sector gradient using multiple arcs
      const steps = 12;
      for (let i = 0; i < steps; i++) {
        const a0 = trailStart + (trailSweep / steps) * i;
        const a1 = a0 + trailSweep / steps;
        const alpha = (i / steps) * 0.12;
        ctx.fillStyle = `rgba(255,140,0,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(R, R);
        ctx.arc(R, R, R - 2, a0, a1);
        ctx.closePath();
        ctx.fill();
      }
    }

    // ── Sweep line ────────────────────────────────────────────────────────
    const sweepEndX = R + (R - 2) * Math.cos(this.sweepAngle);
    const sweepEndY = R + (R - 2) * Math.sin(this.sweepAngle);
    const sweepGrad = ctx.createLinearGradient(R, R, sweepEndX, sweepEndY);
    sweepGrad.addColorStop(0,   'rgba(255,180,0,0)');
    sweepGrad.addColorStop(0.3, 'rgba(255,180,0,0.5)');
    sweepGrad.addColorStop(1,   'rgba(255,220,60,0.9)');
    ctx.beginPath();
    ctx.moveTo(R, R);
    ctx.lineTo(sweepEndX, sweepEndY);
    ctx.strokeStyle = sweepGrad;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // ── Entities ──────────────────────────────────────────────────────────
    for (const e of this.tracked.values()) {
      if (e.alpha < 0.02) continue;

      const dx = e.worldX - this.janeWorldX;
      const dy = e.worldY - this.janeWorldY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > range) continue;

      // World → radar screen coordinates
      const screenR = (dist / range) * (R - 6);
      let sx = R + (dx / range) * (R - 6);
      let sy = R + (dy / range) * (R - 6);

      // Disrupted zone: jitter on artifacts
      if (this.sweepQ !== 'normal') {
        sx += (Math.random() - 0.5) * ARTIFACT_JITTER_PX * (1 - e.alpha);
        sy += (Math.random() - 0.5) * ARTIFACT_JITTER_PX * (1 - e.alpha);
      }
      void screenR;

      ctx.save();
      ctx.globalAlpha = e.alpha;
      this._drawEntity(ctx, e, sx, sy, now);
      ctx.restore();
    }

    // ── Jane — always at centre, always fully bright ──────────────────────
    this._drawJane(ctx, R, R);

    ctx.restore(); // end clip

    // ── Outer border ring (outside clip, on top) ──────────────────────────
    ctx.save();
    ctx.beginPath();
    ctx.arc(R, R, R - 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,140,0,0.55)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    // Subtle outer glow ring
    ctx.beginPath();
    ctx.arc(R, R, R + 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,140,0,0.1)';
    ctx.lineWidth   = 3;
    ctx.stroke();
    ctx.restore();

    // ── Scan quality label (bottom of radar) ─────────────────────────────
    if (this.sweepQ !== 'normal') {
      ctx.save();
      ctx.font          = '7px "Courier New", monospace';
      ctx.letterSpacing = '1px';
      ctx.fillStyle     = this.sweepQ === 'nefarium' ? '#ff5c5c' : '#ffb347';
      ctx.textAlign     = 'center';
      ctx.fillText(
        this.sweepQ === 'nefarium' ? 'INTERFERENCE' : 'DEGRADED',
        R, d - 6,
      );
      ctx.restore();
    }
  }

  private _drawJane(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    // Bright amber dot
    ctx.save();
    ctx.fillStyle = E_AMBER;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    // "J" label
    ctx.font      = '7px "Courier New", monospace';
    ctx.fillStyle = '#0a0500';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('J', x, y + 0.5);
    ctx.restore();
  }

  private _drawEntity(
    ctx: CanvasRenderingContext2D,
    e: TrackedEntity,
    x: number,
    y: number,
    now: number,
  ): void {
    switch (e.type) {
      case 'ley-node': {
        // Amber dot pulsing at ley frequency
        const pulse = 0.5 + 0.5 * Math.sin(now / 900);
        ctx.fillStyle = E_AMBER;
        ctx.beginPath();
        ctx.arc(x, y, 2.5 + pulse * 1, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'ley-disrupted': {
        // Fragmented dot — draw as dashes
        ctx.strokeStyle = '#ffb347';
        ctx.lineWidth   = 1;
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + now / 600;
          const r1 = 2, r2 = 3.5;
          ctx.beginPath();
          ctx.moveTo(x + r1 * Math.cos(angle), y + r1 * Math.sin(angle));
          ctx.lineTo(x + r2 * Math.cos(angle), y + r2 * Math.sin(angle));
          ctx.stroke();
        }
        break;
      }
      case 'beu': {
        // Bright white dot with orbit ring
        ctx.fillStyle = E_WHITE;
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(240,237,232,0.4)';
        ctx.lineWidth   = 0.8;
        ctx.stroke();
        break;
      }
      case 'nefarium': {
        // Inverted: dark dot with distortion halo
        ctx.fillStyle = E_NEFAR;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        // Distortion halo
        const phase = now / 300;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + phase;
          const jx = x + Math.cos(a) * (5 + Math.sin(phase + i) * 1.5);
          const jy = y + Math.sin(a) * (5 + Math.cos(phase + i) * 1.5);
          ctx.fillStyle = 'rgba(200,0,0,0.25)';
          ctx.beginPath();
          ctx.arc(jx, jy, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'anchor': {
        // Small amber diamond
        ctx.fillStyle = E_AMBER;
        ctx.beginPath();
        ctx.moveTo(x, y - 4);
        ctx.lineTo(x + 3, y);
        ctx.lineTo(x, y + 4);
        ctx.lineTo(x - 3, y);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'waypoint': {
        // Fading amber ring
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.strokeStyle = E_AMBER_DIM;
        ctx.lineWidth   = 1.5;
        ctx.stroke();
        break;
      }
      case 'enemy': {
        // Red-amber, sharp edges (square/plus)
        ctx.fillStyle = E_RED;
        ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
        break;
      }
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Smallest signed angle difference from `to` back to `from`. */
function _angleDiff(from: number, to: number): number {
  let d = from - to;
  while (d >  Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}
