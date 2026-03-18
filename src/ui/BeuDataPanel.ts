/**
 * BeuDataPanel — Stage 6.2.2
 *
 * On hover/select of a Beu entity, renders a Kernel-format data panel:
 *
 *   BEU NODE — ORION
 *   ─────────────────────────────────────
 *   STAGE           bloom
 *   BOND STATUS     unbound
 *   ASSOCIATED      Jane.Tho'ra (proximity)
 *   ACTIVITY        resonance exploration
 *   SIGNAL          0.74 (strong)
 *   RESONANCE       ████████░░  80%
 *   ─────────────────────────────────────
 *
 * Pure DOM overlay — no Phaser dependency.
 * Auto-dismisses after 8 seconds or on click.
 *
 * Usage:
 *   BeuDataPanel.show({ name: 'ORION', stage: 'bloom', ... });
 */

import { BeuLifecycleStage } from './BeuSignatureRenderer';

const C = {
  bg:       'rgba(13,14,16,0.94)',
  amber:    '#FF8C00',
  amberDim: 'rgba(255,140,0,0.45)',
  text:     '#f0ede8',
  dim:      '#5a5e66',
  rule:     '#2a2e36',
  white:    '#ffffff',
  positive: '#c8e88a',
} as const;

export interface BeuDataRecord {
  name: string;               // e.g. "ORION"
  stage: BeuLifecycleStage;
  bondStatus: 'unbound' | 'proximity' | 'bonded';
  associatedEntity: string;   // e.g. "Jane.Tho'ra" or "—"
  activity: string;           // e.g. "resonance exploration"
  signal: number;             // 0–1
  resonance: number;          // 0–1 (from HarmonicEngine or estimated)
}

const STAGE_LABEL: Record<BeuLifecycleStage, string> = {
  seed:   'seed (dormant)',
  sprout: 'sprout',
  growth: 'growth',
  bloom:  'bloom',
  bond:   'bonded',
};

const BOND_COLOUR: Record<BeuDataRecord['bondStatus'], string> = {
  unbound:  C.dim,
  proximity: C.amberDim,
  bonded:   C.positive,
};

export class BeuDataPanel {
  private static _current?: { el: HTMLElement; timer: ReturnType<typeof setTimeout> };

  /** Show the data panel. Replaces any existing panel. */
  static show(data: BeuDataRecord, durationMs = 8000): void {
    // Dismiss existing
    BeuDataPanel.dismiss();

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      bottom: 192px;
      right: 16px;
      z-index: 59000;
      font-family: 'Courier New', Courier, monospace;
      opacity: 0;
      transition: opacity 150ms ease-in;
      pointer-events: auto;
    `;

    const panel = document.createElement('div');
    panel.style.cssText = `
      background: ${C.bg};
      border: 1px solid rgba(255,140,0,0.35);
      padding: 12px 16px 10px;
      width: min(260px, calc(100vw - 40px));
    `;
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });

    // ── Header ──────────────────────────────────────────────────────────
    const hdrLabel = document.createElement('div');
    hdrLabel.style.cssText = `font-size:8px;letter-spacing:2.5px;color:${C.amberDim};margin-bottom:2px;`;
    hdrLabel.textContent = 'PSISYS KERNEL — BEU NODE';
    panel.appendChild(hdrLabel);

    const hdrName = document.createElement('div');
    hdrName.style.cssText = `font-size:13px;letter-spacing:2px;color:${C.white};margin-bottom:8px;`;
    hdrName.textContent = data.name;
    panel.appendChild(hdrName);

    const rule = () => {
      const d = document.createElement('div');
      d.style.cssText = `height:1px;background:${C.rule};margin:6px 0;`;
      panel.appendChild(d);
    };
    rule();

    // ── Rows ─────────────────────────────────────────────────────────────
    const addRow = (label: string, value: string, valColor: string = C.text) => {
      const r = document.createElement('div');
      r.style.cssText = `display:flex;justify-content:space-between;font-size:10px;letter-spacing:0.5px;margin:2px 0;`;
      const l = document.createElement('span');
      l.style.color = C.dim;
      l.textContent = label;
      const v = document.createElement('span');
      v.style.color = valColor;
      v.textContent = value;
      r.appendChild(l);
      r.appendChild(v);
      panel.appendChild(r);
    };

    addRow('STAGE',          STAGE_LABEL[data.stage],     C.amber);
    addRow('BOND STATUS',    data.bondStatus,              BOND_COLOUR[data.bondStatus]);
    addRow('ASSOCIATED',     data.associatedEntity);
    addRow('ACTIVITY',       data.activity);
    addRow('SIGNAL',         `${data.signal.toFixed(2)} (${_signalLabel(data.signal)})`,
      data.signal > 0.7 ? C.positive : data.signal > 0.4 ? C.amber : C.dim);

    // Resonance bar
    const resonancePct = Math.round(data.resonance * 100);
    const filledBlocks = Math.round(data.resonance * 10);
    const bar = '█'.repeat(filledBlocks) + '░'.repeat(10 - filledBlocks);
    addRow('RESONANCE', `${bar}  ${resonancePct}%`, C.amber);

    rule();

    // ── Dismiss hint ─────────────────────────────────────────────────────
    const hint = document.createElement('div');
    hint.style.cssText = `font-size:8px;letter-spacing:1px;color:${C.dim};text-align:center;`;
    hint.textContent = '[ CLICK TO DISMISS ]';
    panel.appendChild(hint);

    const dismiss = () => BeuDataPanel.dismiss();
    overlay.addEventListener('click', dismiss);

    const timer = setTimeout(dismiss, durationMs);
    BeuDataPanel._current = { el: overlay, timer };
  }

  static dismiss(): void {
    const cur = BeuDataPanel._current;
    if (!cur) return;
    BeuDataPanel._current = undefined;
    clearTimeout(cur.timer);
    cur.el.style.transition = 'opacity 180ms ease-out';
    cur.el.style.opacity = '0';
    setTimeout(() => cur.el.remove(), 200);
  }
}

function _signalLabel(signal: number): string {
  if (signal >= 0.8) return 'strong';
  if (signal >= 0.5) return 'moderate';
  if (signal >= 0.25) return 'faint';
  return 'trace';
}
