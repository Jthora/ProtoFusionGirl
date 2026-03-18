/**
 * ASIStandbyOverlay — DOM overlay for the pause/standby state.
 *
 * When the ASI enters standby, it shifts attention from active observation
 * to its console layer. The HoloDeck view desaturates behind this overlay
 * but continues running — the world keeps existing.
 *
 * Returns a Promise<'resume' | 'quit'> when the operator makes a choice.
 */

import { SessionPersistence } from '../save/SaveSystem';
import { SessionEndOverlay } from './SessionEndOverlay';
import { KernelConfig } from './KernelConfig';
import { ObserverProfile } from './ObserverProfile';
import { EntityRegistry } from './EntityRegistry';

const C = {
  bg:       'rgba(13,14,16,0.92)',   // gunmetal, slightly transparent
  primary:  '#f0ede8',
  amber:    '#FF8C00',
  amberDim: 'rgba(255,140,0,0.5)',
  positive: '#c8e88a',
  warn:     '#ffb347',
  critical: '#ff5c5c',
  dim:      '#5a5e66',
  rule:     '#2a2e36',
} as const;

type StandbyAction = 'resume' | 'quit';

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
  if (m === 0) return `${sec}s`;
  return `${m}m ${sec}s`;
}

export interface StandbyStats {
  sessionStartMs?: number;    // Date.now() at session start (for duration calc)
  timelineDelta?: number;
  interventionCount?: number;
  channelSaturation?: number; // 0–100
  janeCoherence?: number;     // 0–100
  leylineStability?: number;  // 0–100
}

export class ASIStandbyOverlay {
  /**
   * Show the standby overlay. The game canvas should be desaturated by the
   * caller before invoking this.
   *
   * @param stats  — live session stats from the game
   * @param onAnchor — optional callback to place a timeline anchor
   */
  static show(
    stats: StandbyStats = {},
    onAnchor?: () => void,
  ): Promise<StandbyAction> {
    return new Promise(resolve => {
      const session = SessionPersistence.load();
      const callsign = session?.callsign ?? 'OPERATOR';

      const sessionDuration = stats.sessionStartMs
        ? formatDuration(Date.now() - stats.sessionStartMs)
        : '—';
      const deltaSign = (stats.timelineDelta ?? 0) >= 0 ? '+' : '';
      const deltaStr = stats.timelineDelta != null
        ? `${deltaSign}${stats.timelineDelta.toFixed(3)}`
        : '—';
      const satStr = stats.channelSaturation != null
        ? `${Math.round(stats.channelSaturation)}%`
        : '—';
      const coherenceStr = stats.janeCoherence != null
        ? `${Math.round(stats.janeCoherence)}%`
        : '—';
      const leylineStr = stats.leylineStability != null
        ? `${Math.round(stats.leylineStability)}%`
        : '—';
      const interventionStr = stats.interventionCount != null
        ? String(stats.interventionCount)
        : '—';

      // ── Shell ──
      const overlay = el('div', `
        position: fixed;
        inset: 0;
        background: ${C.bg};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 55000;
        font-family: 'Courier New', Courier, monospace;
        opacity: 0;
        transition: opacity 180ms ease-in;
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

      // ── Content ──
      const addLine = (text: string, color: string = C.primary, fs = '13px') => {
        const d = el('div', `color:${color}; font-size:${fs}; letter-spacing:1.2px; min-height:1.4em;`, text);
        box.appendChild(d);
        return d;
      };
      const hr = () => {
        box.appendChild(el('div', `height:1px; background:${C.rule}; margin:8px 0;`));
      };
      const gap = (h = '4px') => {
        box.appendChild(el('div', `height:${h};`));
      };

      addLine('PSISYS KERNEL — STANDBY MODE', C.amber);
      addLine(`OPERATOR: ${callsign}`, C.dim, '11px');
      gap('2px');
      addLine('BRIDGE: suspended  (world: live)', C.amberDim, '11px');
      hr();

      // Session status table
      addLine('SESSION STATUS', C.dim, '11px');
      gap('4px');

      const tableRow = (label: string, value: string, color: string = C.primary) => {
        const r = el('div', `display:flex; justify-content:space-between; font-size:12px; letter-spacing:1px; margin:1px 0;`);
        r.appendChild(el('span', `color:${C.dim};`, label));
        r.appendChild(el('span', `color:${color};`, value));
        box.appendChild(r);
      };

      tableRow('SESSION DURATION',    sessionDuration);
      tableRow('TIMELINE DELTA',      deltaStr,
        (stats.timelineDelta ?? 0) > 0 ? C.positive : (stats.timelineDelta ?? 0) < -0.01 ? C.critical : C.dim);
      tableRow('INTERVENTIONS',       interventionStr);
      tableRow('CHANNEL SATURATION',  satStr,
        (stats.channelSaturation ?? 0) > 75 ? C.warn : C.dim);
      tableRow('JANE COHERENCE',      coherenceStr,
        (stats.janeCoherence ?? 100) < 30 ? C.critical : (stats.janeCoherence ?? 100) < 60 ? C.warn : C.positive);
      tableRow('LEYLINE STABILITY',   leylineStr,
        (stats.leylineStability ?? 72) < 35 ? C.critical : (stats.leylineStability ?? 72) < 60 ? C.warn : C.positive);

      hr();

      // ── Action buttons ──
      const btnBase = `
        display: block;
        width: 100%;
        background: transparent;
        border: 1px solid ${C.rule};
        font-family: 'Courier New', Courier, monospace;
        font-size: 13px;
        letter-spacing: 2px;
        padding: 8px 16px;
        margin: 4px 0;
        text-align: left;
        cursor: pointer;
        transition: background 100ms, border-color 100ms;
      `;

      const makeBtn = (text: string, color: string, onClick: () => void) => {
        const b = el('button', `${btnBase} color:${color};`);
        b.textContent = text;
        b.addEventListener('mouseenter', () => {
          b.style.background = 'rgba(255,140,0,0.07)';
          b.style.borderColor = color;
        });
        b.addEventListener('mouseleave', () => {
          b.style.background = 'transparent';
          b.style.borderColor = C.rule;
        });
        b.addEventListener('click', onClick);
        box.appendChild(b);
      };

      gap('6px');

      makeBtn('[RESUME]  Return to observation field', C.positive, () => {
        close('resume');
      });

      if (onAnchor) {
        makeBtn('[ANCHOR]  Place timeline anchor', C.amber, () => {
          onAnchor();
          addLine('  [ANCHOR] Timeline anchor placed.', C.positive, '11px');
        });
      }

      makeBtn('[REVIEW RECORD]  Observer profile and timeline log', C.amberDim, () => {
        overlay.style.opacity = '0.2';
        ObserverProfile.show().then(() => {
          overlay.style.transition = 'opacity 150ms ease-in';
          overlay.style.opacity = '1';
        });
      });

      makeBtn('[CONFIGURATION]  Kernel observer settings', C.amberDim, () => {
        // Temporarily hide (not close) while config panel is open
        overlay.style.opacity = '0.2';
        KernelConfig.show().then(() => {
          overlay.style.transition = 'opacity 150ms ease-in';
          overlay.style.opacity = '1';
        });
      });

      makeBtn('[ENTITY REGISTRY]  Personnel and technical substrate', C.amberDim, () => {
        overlay.style.opacity = '0.2';
        EntityRegistry.show().then(() => {
          overlay.style.transition = 'opacity 150ms ease-in';
          overlay.style.opacity = '1';
        });
      });

      makeBtn('[END SESSION]  Suspend observer bridge', C.warn, () => {
        // Show session end overlay first, then resolve quit
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          document.removeEventListener('keydown', onKey);
          SessionEndOverlay.show(stats).then(() => resolve('quit'));
        }, 220);
      });

      gap('8px');
      addLine('ESC or P — return to field', C.dim, '10px');

      // ── Keyboard shortcuts ──
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          document.removeEventListener('keydown', onKey);
          close('resume');
        }
      };
      document.addEventListener('keydown', onKey);

      function close(action: StandbyAction) {
        document.removeEventListener('keydown', onKey);
        overlay.style.transition = 'opacity 200ms ease-out';
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.remove(); resolve(action); }, 220);
      }
    });
  }
}
