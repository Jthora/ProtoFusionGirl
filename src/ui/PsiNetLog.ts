/**
 * PsiNetLog — Stage 3.2
 *
 * Ambient log stream rendered bottom-left of the HUD.
 * Entries expire after 60s TTL (no animation — they simply stop rendering).
 * Priority entries (Jono, Beu direct comms) show at higher opacity temporarily.
 *
 * Categories:
 *   PSINET · JANE · BEU · NEFARIUM · TIMELINE · BRIDGE · ANCHOR
 *
 * Usage:
 *   const log = new PsiNetLog(scene);
 *   log.mount();
 *   log.add('PSINET', 'Ley line resonance shift detected — Sector 7');
 *   log.destroy();
 */

export type LogCategory =
  | 'PSINET'
  | 'JANE'
  | 'BEU'
  | 'NEFARIUM'
  | 'TIMELINE'
  | 'BRIDGE'
  | 'ANCHOR';

interface LogEntry {
  category: LogCategory;
  message: string;
  addedAt: number;     // performance.now() timestamp
  priority: boolean;   // higher opacity for a short window
  priorityUntil: number; // ms timestamp when priority expires
}

// Per-category color tint (applies to bracket prefix)
const CATEGORY_COLOR: Record<LogCategory, string> = {
  PSINET:    '#FF8C00',
  JANE:      '#c8e88a',
  BEU:       '#FFD700',
  NEFARIUM:  '#FF3300',
  TIMELINE:  '#88aaff',
  BRIDGE:    '#aaaaaa',
  ANCHOR:    '#FF8C00',
};

const TTL_MS            = 60_000;   // entries vanish after 60s
const PRIORITY_MS       = 8_000;    // priority window for Jono/Beu entries
const MAX_VISIBLE       = 4;        // show at most 4 lines
const FONT              = '10px "Courier New", Courier, monospace';
const BASE_ALPHA        = 0.50;
const PRIORITY_ALPHA    = 0.90;
const LINE_HEIGHT       = 16;
const LEFT_PAD          = 14;
const BOTTOM_PAD        = 52;       // above controls hint

export class PsiNetLog {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private entries: LogEntry[] = [];
  private mounted = false;
  private destroyed = false;
  private animFrame = 0;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx    = this.canvas.getContext('2d')!;

    this.canvas.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 10002;
      width: 100%;
      height: 100%;
    `;
  }

  mount(): void {
    if (this.mounted || this.destroyed) return;
    this.mounted = true;
    document.body.appendChild(this.canvas);
    this.resize();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(document.body);

    this.animFrame = requestAnimationFrame(() => this.tick());
  }

  private resize(): void {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Add a log entry.
   * @param category   One of the defined log categories.
   * @param message    The message body.
   * @param priority   If true, renders at high opacity for 8s (Jono / Beu direct).
   */
  add(category: LogCategory, message: string, priority = false): void {
    const now = performance.now();
    this.entries.push({
      category,
      message,
      addedAt: now,
      priority,
      priorityUntil: priority ? now + PRIORITY_MS : 0,
    });
  }

  private tick(): void {
    if (this.destroyed) return;
    this.draw();
    this.animFrame = requestAnimationFrame(() => this.tick());
  }

  private draw(): void {
    const { canvas, ctx } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now    = performance.now();
    const H      = canvas.height;

    // Prune entries that have exceeded TTL
    this.entries = this.entries.filter(e => now - e.addedAt < TTL_MS);

    // Take the last MAX_VISIBLE live entries
    const visible = this.entries.slice(-MAX_VISIBLE);
    if (visible.length === 0) return;

    ctx.font = FONT;

    // Render bottom-up
    visible.forEach((entry, idx) => {
      const y = H - BOTTOM_PAD - (visible.length - 1 - idx) * LINE_HEIGHT;

      // Determine alpha
      const age        = now - entry.addedAt;
      const isPriority = entry.priority && now < entry.priorityUntil;
      let alpha = isPriority ? PRIORITY_ALPHA : BASE_ALPHA;

      // Fade out in final 5s of TTL
      const remaining = TTL_MS - age;
      if (remaining < 5000) {
        alpha *= remaining / 5000;
      }

      if (alpha < 0.01) return;

      // Bracket prefix: [CATEGORY]
      const prefix = `[${entry.category}]`;
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = CATEGORY_COLOR[entry.category];
      ctx.fillText(prefix, LEFT_PAD, y);

      // Message body in off-white
      const prefixW = ctx.measureText(prefix + ' ').width;
      ctx.fillStyle = '#e8e4dc';
      ctx.fillText(entry.message, LEFT_PAD + prefixW, y);
    });

    ctx.globalAlpha = 1;
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    cancelAnimationFrame(this.animFrame);
    this.resizeObserver?.disconnect();
    this.canvas.remove();
  }
}
