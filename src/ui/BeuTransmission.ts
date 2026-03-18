/**
 * BeuTransmission — Stage 6.2.3
 *
 * Compact Beu-to-ASI direct transmission panel. Data format, not language.
 * Appears in the top-right corner (below any Jono transmissions).
 *
 *   ┌─────────────────────────────────────┐
 *   │ BEU.ORION // DIRECT // PRIORITY-2   │
 *   │ COORD  [3841, 472]                  │
 *   │ CONF   0.87 — HIGH                  │
 *   │ JANE   AWARE                        │
 *   └─────────────────────────────────────┘
 *
 * Auto-dismisses after 6 seconds. At most one transmission visible at a time.
 *
 * Usage:
 *   BeuTransmission.show({
 *     name: 'ORION',
 *     coordX: 3841, coordY: 472,
 *     confidence: 0.87,
 *     janeAware: true,
 *   });
 */

const C = {
  bg:       'rgba(13,14,16,0.93)',
  border:   'rgba(255,140,0,0.30)',
  amber:    '#FF8C00',
  amberDim: 'rgba(255,140,0,0.5)',
  white:    '#f0ede8',
  dim:      '#5a5e66',
  positive: '#c8e88a',
  warn:     '#ffb347',
} as const;

export interface BeuTransmissionData {
  name: string;       // e.g. "ORION"
  coordX: number;
  coordY: number;
  confidence: number; // 0–1
  janeAware: boolean;
  priority?: 1 | 2 | 3;
}

export class BeuTransmission {
  private static _current?: { el: HTMLElement; timer: ReturnType<typeof setTimeout> };

  static show(data: BeuTransmissionData, durationMs = 6000): void {
    BeuTransmission.dismiss();

    const priority = data.priority ?? 2;
    const confLabel = data.confidence >= 0.8 ? 'HIGH' : data.confidence >= 0.5 ? 'MODERATE' : 'LOW';
    const confColor = data.confidence >= 0.8 ? C.positive : data.confidence >= 0.5 ? C.amber : C.warn;

    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed;
      top: 72px;
      right: 16px;
      z-index: 64000;
      font-family: 'Courier New', Courier, monospace;
      background: ${C.bg};
      border: 1px solid ${C.border};
      border-left: 2px solid ${C.amber};
      padding: 8px 14px 8px 12px;
      width: min(260px, calc(100vw - 40px));
      opacity: 0;
      transition: opacity 150ms ease-in;
      pointer-events: none;
    `;
    document.body.appendChild(panel);
    requestAnimationFrame(() => { panel.style.opacity = '1'; });

    // ── Header ──────────────────────────────────────────────────────────
    const header = document.createElement('div');
    header.style.cssText = `
      font-size: 9px;
      letter-spacing: 1.5px;
      color: ${C.amber};
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    header.textContent = `BEU.${data.name} // DIRECT // PRIORITY-${priority}`;
    panel.appendChild(header);

    // ── Data rows ────────────────────────────────────────────────────────
    const addRow = (key: string, value: string, valColor: string = C.white) => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        letter-spacing: 0.5px;
        margin: 1px 0;
      `;
      const k = document.createElement('span');
      k.style.color = C.dim;
      k.textContent = key;
      const v = document.createElement('span');
      v.style.color = valColor;
      v.textContent = value;
      row.appendChild(k);
      row.appendChild(v);
      panel.appendChild(row);
    };

    addRow('COORD',
      `[${Math.round(data.coordX)}, ${Math.round(data.coordY)}]`);
    addRow('CONF',
      `${data.confidence.toFixed(2)} — ${confLabel}`,
      confColor);
    addRow('JANE',
      data.janeAware ? 'AWARE' : 'UNAWARE',
      data.janeAware ? C.positive : C.warn);

    // Fade-out progress indicator (thin bottom strip)
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      height: 1px;
      background: ${C.amberDim};
      margin-top: 8px;
      transform-origin: left;
      transform: scaleX(1);
      transition: transform ${durationMs}ms linear;
    `;
    panel.appendChild(progressBar);
    // Start the bar depleting on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressBar.style.transform = 'scaleX(0)';
      });
    });

    const timer = setTimeout(() => BeuTransmission.dismiss(), durationMs);
    BeuTransmission._current = { el: panel, timer };
  }

  static dismiss(): void {
    const cur = BeuTransmission._current;
    if (!cur) return;
    BeuTransmission._current = undefined;
    clearTimeout(cur.timer);
    cur.el.style.transition = 'opacity 200ms ease-out';
    cur.el.style.opacity = '0';
    setTimeout(() => cur.el.remove(), 220);
  }
}
