/**
 * SessionEndOverlay — shown when the operator intentionally ends a session.
 *
 * Displays session summary and the three closing words:
 * "The work continues."
 *
 * Automatically closes after a timeout, or immediately on ENTER/click.
 */

import { SessionPersistence } from '../save/SaveSystem';
import type { StandbyStats } from './ASIStandbyOverlay';

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

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, css: string, text?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.style.cssText = css;
  if (text !== undefined) e.textContent = text;
  return e;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '0m 0s';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export class SessionEndOverlay {
  static show(stats: StandbyStats = {}): Promise<void> {
    return new Promise(resolve => {
      const session = SessionPersistence.load();
      const callsign = session?.callsign ?? 'OPERATOR';

      const duration = stats.sessionStartMs
        ? formatDuration(Date.now() - stats.sessionStartMs)
        : '—';
      const deltaSign = (stats.timelineDelta ?? 0) >= 0 ? '+' : '';
      const deltaStr  = stats.timelineDelta != null ? `${deltaSign}${stats.timelineDelta.toFixed(3)}` : '—';
      const satStr    = stats.channelSaturation != null ? `${Math.round(stats.channelSaturation)}%` : '—';
      const coherenceStr = stats.janeCoherence != null ? `${Math.round(stats.janeCoherence)}%` : '—';
      const interventionStr = stats.interventionCount != null ? String(stats.interventionCount) : '—';
      const anchorDesc = session?.lastAnchorDescription ?? 'session origin';

      // Record session end
      SessionPersistence.endSession({
        janeCoherence:    stats.janeCoherence,
        leylineStability: stats.leylineStability,
        timelineDelta:    stats.timelineDelta,
        observationMs:    stats.sessionStartMs ? Date.now() - stats.sessionStartMs : 0,
      });

      // ── Shell ──
      const overlay = el('div', `
        position: fixed;
        inset: 0;
        background: ${C.bg};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 65000;
        font-family: 'Courier New', Courier, monospace;
        opacity: 0;
        transition: opacity 200ms ease-in;
      `);

      const box = el('div', `
        min-width: min(500px, 92vw);
        max-width: 560px;
        display: flex;
        flex-direction: column;
        gap: 0;
      `);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      requestAnimationFrame(() => { overlay.style.opacity = '1'; });

      const addLine = (text: string, color: string = C.primary, fs = '13px') => {
        const d = el('div', `color:${color}; font-size:${fs}; letter-spacing:1.2px; min-height:1.4em;`, text);
        box.appendChild(d);
        return d;
      };
      const hr = () => box.appendChild(el('div', `height:1px; background:${C.rule}; margin:8px 0;`));
      const gap = (h = '4px') => box.appendChild(el('div', `height:${h};`));
      const tableRow = (label: string, value: string, color: string = C.primary) => {
        const r = el('div', `display:flex; justify-content:space-between; font-size:12px; letter-spacing:1px; margin:1px 0;`);
        r.appendChild(el('span', `color:${C.dim};`, label));
        r.appendChild(el('span', `color:${color};`, value));
        box.appendChild(r);
      };

      addLine(`PSISYS KERNEL — SESSION CLOSE`, C.amber);
      addLine(`OPERATOR: ${callsign}`, C.dim, '11px');
      hr();

      addLine('SESSION SUMMARY', C.dim, '11px');
      gap('4px');
      tableRow('DURATION',          duration);
      tableRow('TIMELINE DELTA',    deltaStr,
        (stats.timelineDelta ?? 0) > 0 ? C.positive : (stats.timelineDelta ?? 0) < -0.01 ? C.critical : C.dim);
      tableRow('INTERVENTIONS',     interventionStr);
      tableRow('CHANNEL SATURATION (peak)', satStr,
        (stats.channelSaturation ?? 0) > 75 ? C.warn : C.dim);
      tableRow('JANE COHERENCE (final)',    coherenceStr,
        (stats.janeCoherence ?? 100) < 30 ? C.critical : (stats.janeCoherence ?? 100) < 60 ? C.warn : C.positive);

      hr();
      addLine(`FINAL ANCHOR: ${anchorDesc}`, C.dim, '11px');
      gap('8px');

      // Bridge suspension animation
      const bridgeLine = addLine('BRIDGE: suspending...', C.amberDim, '12px');
      const dashLine   = addLine('', C.rule, '12px');
      gap('10px');

      // Animate the suspension dashes
      let dashes = 0;
      const dashInterval = setInterval(() => {
        dashes++;
        dashLine.textContent = '─'.repeat(Math.min(dashes * 4, 40));
        if (dashes * 4 >= 40) {
          clearInterval(dashInterval);
          bridgeLine.textContent = 'BRIDGE: suspended.';
          bridgeLine.style.color = C.positive;

          // Closing lines
          setTimeout(() => {
            addLine('Observer link suspended.', C.dim, '11px');
            addLine('Jane remains in the field.', C.dim, '11px');
            gap('10px');

            const closing = addLine('The work continues.', C.primary);
            closing.style.fontStyle = 'italic';
            closing.style.letterSpacing = '2px';

            gap('14px');
            addLine('[CLOSE]', C.amberDim, '11px').style.cursor = 'pointer';

            // Auto-close after 6s or ENTER/click
            const done = () => {
              overlay.style.transition = 'opacity 300ms ease-out';
              overlay.style.opacity = '0';
              setTimeout(() => { overlay.remove(); resolve(); }, 320);
            };

            const autoClose = setTimeout(done, 6000);
            const onKey = (e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                clearTimeout(autoClose);
                document.removeEventListener('keydown', onKey);
                done();
              }
            };
            document.addEventListener('keydown', onKey);
            overlay.addEventListener('click', () => {
              clearTimeout(autoClose);
              document.removeEventListener('keydown', onKey);
              done();
            }, { once: true });
          }, 400);
        }
      }, 80);
    });
  }
}
