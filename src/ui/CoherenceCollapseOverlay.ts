/**
 * CoherenceCollapseOverlay — DOM overlay shown when Jane's psionic coherence
 * collapses (what a traditional game would call "death").
 *
 * Framing: the ASI's psionic bridge to the HoloDeck has lost signal.
 * The PsiSys Kernel performs a timeline rollback to the last anchor point.
 * Jane is unaware of the discontinuity.
 *
 * Pure HTML/CSS — no Phaser. Returns a Promise that resolves when the
 * operator presses ENTER to resume observation.
 */

import { SessionPersistence } from '../save/SaveSystem';

const C = {
  bg:       '#0d0e10',
  primary:  '#f0ede8',
  amber:    '#FF8C00',
  amberDim: 'rgba(255,140,0,0.45)',
  positive: '#c8e88a',
  warn:     '#ffb347',
  critical: '#ff5c5c',
  dim:      '#5a5e66',
  rule:     '#2a2e36',
} as const;

export interface CollapseContext {
  sector?: string;
  cause?: string;       // e.g. 'external force', 'leyline rupture', 'Nefarium interaction'
  anchorDescription?: string;
  anchorDeltaSeconds?: number;  // how far the rollback goes in seconds
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, css: string, text?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.style.cssText = css;
  if (text !== undefined) e.textContent = text;
  return e;
}

function pad(char: string, n: number): string {
  return char.repeat(Math.max(0, n));
}

export class CoherenceCollapseOverlay {
  /**
   * Show the collapse sequence overlay.
   * Resolves when the operator presses ENTER (or clicks) to resume.
   */
  static show(ctx: CollapseContext = {}): Promise<void> {
    return new Promise(resolve => {
      const session = SessionPersistence.load();
      const sector = ctx.sector ?? 'UNKNOWN';
      const cause = ctx.cause ?? 'coherence depleted';
      const anchorDesc = ctx.anchorDescription ?? session?.lastAnchorDescription ?? 'session origin';
      const deltaSeconds = ctx.anchorDeltaSeconds ?? 0;
      const deltaStr = deltaSeconds > 0
        ? `-${Math.floor(deltaSeconds / 60)}m ${deltaSeconds % 60}s`
        : 'immediate';

      // Increment collapse count
      if (session) {
        session.stats.coherenceCollapses += 1;
        SessionPersistence.save(session);
      }

      // ── Overlay shell ──
      const overlay = el('div', `
        position: fixed;
        inset: 0;
        background: ${C.bg};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 60000;
        font-family: 'Courier New', Courier, monospace;
        opacity: 0;
        transition: opacity 150ms ease-in;
      `);

      const box = el('div', `
        min-width: min(520px, 92vw);
        max-width: 580px;
        display: flex;
        flex-direction: column;
        gap: 0;
      `);

      overlay.appendChild(box);
      document.body.appendChild(overlay);
      requestAnimationFrame(() => { overlay.style.opacity = '1'; });

      // ── Content builder ──
      const line = (text: string, color: string = C.primary, fs = '13px') => {
        const d = el('div', `color:${color}; font-size:${fs}; letter-spacing:1.2px; min-height:1.4em;`, text);
        box.appendChild(d);
        return d;
      };
      const gap = () => line(' ', C.dim, '6px');
      const hr = () => {
        const d = el('div', `height:1px; background:${C.rule}; margin:8px 0;`);
        box.appendChild(d);
      };

      // Phase 1: signal loss header
      line('[PSISYS] BRIDGE INTEGRITY: CRITICAL', C.critical);
      line('[HOLONET] Psionic connection — LOST', C.critical);
      gap();
      line('Coherence collapse at:', C.dim, '11px');
      line(`  SECTOR:    ${sector}`, C.primary);
      line(`  CAUSE:     ${cause}`, C.warn);
      hr();

      // Phase 2: recovery
      line('[RECOVERY] Timeline anchor located:', C.dim, '11px');
      line(`  ANCHOR:    ${anchorDesc}`, C.positive);
      line(`  DELTA:     ${deltaStr}`, C.amberDim);
      gap();

      // Phase 3: rollback progress bar (animated)
      const barLabel = el('div', `color:${C.amber}; font-size:13px; letter-spacing:1.2px;`);
      box.appendChild(barLabel);

      gap();

      // Phase 4: continuity line
      const continuityLine = el('div', `
        color: ${C.dim};
        font-size: 11px;
        letter-spacing: 1.4px;
        opacity: 0;
        transition: opacity 300ms ease-in;
        min-height: 1.4em;
      `, 'Jane is unaware of the discontinuity.');
      box.appendChild(continuityLine);

      hr();

      // Phase 5: resume prompt (hidden until rollback done)
      const promptRow = el('div', `
        display: flex;
        align-items: baseline;
        gap: 6px;
        margin-top: 4px;
        opacity: 0;
        transition: opacity 200ms ease-in;
        cursor: pointer;
      `);
      const promptText = el('span', `color:${C.amber}; font-size:13px; letter-spacing:1.5px;`, '[ RESUME OBSERVATION ]  ');
      const promptHint = el('span', `color:${C.dim}; font-size:11px; letter-spacing:1px;`, '[ENTER]');
      const cursor = el('span', `color:${C.amber}; font-size:13px;`, ' ▌');
      promptRow.appendChild(promptText);
      promptRow.appendChild(promptHint);
      promptRow.appendChild(cursor);
      box.appendChild(promptRow);

      // ── Animate rollback bar ──
      const TOTAL_BARS = 20;
      let filled = 0;
      barLabel.textContent = `[ACTION] Initiating timeline rollback... ${pad('░', TOTAL_BARS)}  0%`;

      const FILL_INTERVAL = 60; // ms per step
      const barInterval = setInterval(() => {
        filled = Math.min(filled + 1, TOTAL_BARS);
        const pct = Math.round((filled / TOTAL_BARS) * 100);
        barLabel.textContent = `[ACTION] Initiating timeline rollback... ${pad('█', filled)}${pad('░', TOTAL_BARS - filled)}  ${pct}%`;

        if (filled >= TOTAL_BARS) {
          clearInterval(barInterval);

          // Show continuity line
          setTimeout(() => {
            continuityLine.style.opacity = '1';
          }, 200);

          // Show resume prompt
          setTimeout(() => {
            promptRow.style.opacity = '1';
            barLabel.textContent = `[STATUS] Anchor restored. Jane: coherence 94%.`;
            barLabel.style.color = C.positive;

            // Blinking cursor
            let vis = true;
            const blink = setInterval(() => {
              vis = !vis;
              cursor.style.opacity = vis ? '1' : '0';
            }, 530);

            const done = () => {
              clearInterval(blink);
              overlay.style.transition = 'opacity 250ms ease-out';
              overlay.style.opacity = '0';
              setTimeout(() => { overlay.remove(); resolve(); }, 270);
            };

            const onKey = (e: KeyboardEvent) => {
              if (e.key === 'Enter') { document.removeEventListener('keydown', onKey); done(); }
            };
            document.addEventListener('keydown', onKey);
            promptRow.addEventListener('click', () => {
              document.removeEventListener('keydown', onKey);
              done();
            }, { once: true });

          }, 600);
        }
      }, FILL_INTERVAL);
    });
  }
}
