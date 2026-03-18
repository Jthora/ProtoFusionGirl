/**
 * KernelConfig — Stage 5.1
 *
 * Settings panel in PsiSys Kernel aesthetic. All settings use in-world language.
 * Pure DOM overlay — no Phaser dependency.
 *
 * Sections:
 *   AUDIO       — signal levels
 *   DISPLAY     — observation parameters
 *   INTERFACE   — field operator preferences
 *
 * Usage:
 *   const result = await KernelConfig.show();
 *   // result: 'saved' | 'dismissed'
 */

import { SettingsService } from '../services/SettingsService';

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:       '#0d0e10',
  panel:    '#111318',
  amber:    '#FF8C00',
  amberDim: 'rgba(255,140,0,0.45)',
  border:   'rgba(255,140,0,0.35)',
  text:     '#e8e4dc',
  dim:      '#5a5e66',
  positive: '#c8e88a',
} as const;

// ── In-world labels ───────────────────────────────────────────────────────────
const SECTIONS: Array<{
  title: string;
  entries: Array<{
    key: string;
    label: string;
    sublabel: string;
    type: 'range' | 'toggle';
    min?: number; max?: number; step?: number;
  }>;
}> = [
  {
    title: 'AUDIO',
    entries: [
      { key: 'audioVolume',  label: 'Signal amplitude',          sublabel: 'Master output level',        type: 'range', min: 0, max: 1, step: 0.05 },
      { key: 'musicVolume',  label: 'HoloDeck ambient level',     sublabel: 'Environmental audio presence', type: 'range', min: 0, max: 1, step: 0.05 },
      { key: 'sfxVolume',    label: 'Event audio sensitivity',    sublabel: 'Interaction and system tones', type: 'range', min: 0, max: 1, step: 0.05 },
    ],
  },
  {
    title: 'DISPLAY',
    entries: [
      { key: 'showDebug',    label: 'Diagnostic overlay',         sublabel: 'Render internal system state',  type: 'toggle' },
    ],
  },
  {
    title: 'INTERFACE',
    entries: [
      { key: 'touchControls', label: 'Field operator mode',       sublabel: 'Optimise controls for touch surface', type: 'toggle' },
    ],
  },
];

export class KernelConfig {
  static show(): Promise<'saved' | 'dismissed'> {
    return new Promise(resolve => {
      const svc = SettingsService.getInstance();
      const current = svc.getAll();

      // Working copy — only written on save
      const draft = { ...current };

      // ── Shell ──────────────────────────────────────────────────────────────
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.72);
        display: flex; align-items: center; justify-content: center;
        z-index: 75000;
        font-family: 'Courier New', Courier, monospace;
        opacity: 0; transition: opacity 180ms ease-in;
      `;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => { overlay.style.opacity = '1'; });

      // ── Panel ──────────────────────────────────────────────────────────────
      const panel = document.createElement('div');
      panel.style.cssText = `
        background: ${C.bg};
        border: 1px solid ${C.amber};
        box-shadow: 0 0 20px rgba(255,140,0,0.12);
        padding: 28px 32px 24px;
        width: min(480px, calc(100vw - 40px));
        max-height: calc(100vh - 80px);
        overflow-y: auto;
      `;
      overlay.appendChild(panel);

      // ── Header ─────────────────────────────────────────────────────────────
      const hdr = document.createElement('div');
      hdr.style.cssText = `margin-bottom:20px;`;
      hdr.innerHTML = `
        <div style="font-size:9px;letter-spacing:3px;color:${C.amberDim};margin-bottom:4px;">PSISYS KERNEL</div>
        <div style="font-size:15px;letter-spacing:2px;color:${C.amber};">OBSERVER CONFIGURATION</div>
      `;
      panel.appendChild(hdr);

      // Rule
      const rule = document.createElement('div');
      rule.style.cssText = `height:1px;background:${C.border};margin-bottom:20px;`;
      panel.appendChild(rule);

      // ── Sections ───────────────────────────────────────────────────────────
      const inputs: Map<string, HTMLInputElement> = new Map();

      for (const section of SECTIONS) {
        // Section header
        const sh = document.createElement('div');
        sh.style.cssText = `font-size:9px;letter-spacing:2.5px;color:${C.amberDim};margin-bottom:12px;`;
        sh.textContent = `── ${section.title}`;
        panel.appendChild(sh);

        for (const entry of section.entries) {
          const row = document.createElement('div');
          row.style.cssText = `
            display:flex; align-items:center; justify-content:space-between;
            margin-bottom:14px; gap:16px;
          `;

          // Label block
          const lbl = document.createElement('div');
          lbl.style.cssText = `flex:1; min-width:0;`;
          lbl.innerHTML = `
            <div style="font-size:12px;color:${C.text};letter-spacing:0.5px;">${entry.label}</div>
            <div style="font-size:9px;color:${C.dim};margin-top:2px;letter-spacing:0.3px;">${entry.sublabel}</div>
          `;
          row.appendChild(lbl);

          // Control
          const ctrl = document.createElement('div');
          ctrl.style.cssText = `flex-shrink:0;`;

          if (entry.type === 'range') {
            const input = document.createElement('input');
            input.type  = 'range';
            input.min   = String(entry.min ?? 0);
            input.max   = String(entry.max ?? 1);
            input.step  = String(entry.step ?? 0.05);
            input.value = String(draft[entry.key] ?? entry.max ?? 1);
            input.style.cssText = `
              width: 120px;
              accent-color: ${C.amber};
              cursor: pointer;
              vertical-align: middle;
            `;

            const valEl = document.createElement('span');
            valEl.style.cssText = `font-size:10px;color:${C.amber};margin-left:8px;display:inline-block;width:32px;text-align:right;`;
            valEl.textContent = `${Math.round((draft[entry.key] ?? 1) * 100)}%`;

            input.addEventListener('input', () => {
              draft[entry.key] = parseFloat(input.value);
              valEl.textContent = `${Math.round(parseFloat(input.value) * 100)}%`;
            });

            ctrl.appendChild(input);
            ctrl.appendChild(valEl);
            inputs.set(entry.key, input);

          } else {
            // Toggle button
            let active: boolean = !!(draft[entry.key]);
            const btn = document.createElement('button');
            const update = () => {
              btn.style.cssText = `
                font-family: 'Courier New', Courier, monospace;
                font-size: 10px; letter-spacing: 1px;
                padding: 5px 14px;
                background: ${active ? 'rgba(255,140,0,0.12)' : 'transparent'};
                border: 1px solid ${active ? C.amber : C.dim};
                color: ${active ? C.amber : C.dim};
                cursor: pointer;
                min-width: 72px;
              `;
              btn.textContent = active ? 'ENABLED' : 'DISABLED';
            };
            update();
            btn.addEventListener('click', () => {
              active = !active;
              draft[entry.key] = active;
              update();
            });
            ctrl.appendChild(btn);
          }

          row.appendChild(ctrl);
          panel.appendChild(row);
        }

        // Section spacer
        const spacer = document.createElement('div');
        spacer.style.cssText = `height:8px;`;
        panel.appendChild(spacer);
      }

      // ── Separator ──────────────────────────────────────────────────────────
      const sep = document.createElement('div');
      sep.style.cssText = `height:1px;background:${C.border};margin:8px 0 18px;`;
      panel.appendChild(sep);

      // ── Action buttons ─────────────────────────────────────────────────────
      const actions = document.createElement('div');
      actions.style.cssText = `display:flex;gap:12px;justify-content:flex-end;`;

      const dismiss = (outcome: 'saved' | 'dismissed') => {
        overlay.style.transition = 'opacity 200ms ease-out';
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.remove(); resolve(outcome); }, 220);
      };

      const cancelBtn = document.createElement('button');
      cancelBtn.style.cssText = `
        font-family: 'Courier New', Courier, monospace;
        font-size: 11px; letter-spacing: 1.5px;
        padding: 8px 20px;
        background: transparent;
        border: 1px solid ${C.dim};
        color: ${C.dim};
        cursor: pointer;
      `;
      cancelBtn.textContent = 'CANCEL';
      cancelBtn.addEventListener('click', () => dismiss('dismissed'));

      const saveBtn = document.createElement('button');
      saveBtn.style.cssText = `
        font-family: 'Courier New', Courier, monospace;
        font-size: 11px; letter-spacing: 1.5px;
        padding: 8px 20px;
        background: rgba(255,140,0,0.12);
        border: 1px solid ${C.amber};
        color: ${C.amber};
        cursor: pointer;
      `;
      saveBtn.textContent = 'APPLY';
      saveBtn.addEventListener('click', () => {
        Object.entries(draft).forEach(([k, v]) => svc.set(k, v));
        dismiss('saved');
      });

      actions.appendChild(cancelBtn);
      actions.appendChild(saveBtn);
      panel.appendChild(actions);

      // ESC to dismiss
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); dismiss('dismissed'); }
      };
      document.addEventListener('keydown', onKey);
    });
  }
}
