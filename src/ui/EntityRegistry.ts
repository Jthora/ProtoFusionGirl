/**
 * EntityRegistry — Stage 5.3
 *
 * PsiSys Kernel Personnel and Entity Registry — the credits screen,
 * rendered in full Kernel aesthetic. No fourth-wall breaks.
 *
 * Three primary sections:
 *   CORE ENTITIES — Jordan Traña, Jono Thoʻra, Jane Thoʻra
 *   CONTRIBUTING OPERATORS — team credits in registry format
 *   TECHNICAL SUBSTRATE — Phaser, TypeScript, Vite, etc.
 *
 * Pure DOM overlay — no Phaser dependency.
 *
 * Usage:
 *   await EntityRegistry.show();
 */

const C = {
  bg:       '#0d0e10',
  amber:    '#FF8C00',
  amberDim: 'rgba(255,140,0,0.45)',
  border:   'rgba(255,140,0,0.35)',
  text:     '#f0ede8',
  dim:      '#5a5e66',
  rule:     '#2a2e36',
  positive: '#c8e88a',
} as const;

// ─── Registry data ────────────────────────────────────────────────────────────

interface RegistryEntry {
  name: string;
  lines: string[];
}

const CORE_ENTITIES: RegistryEntry[] = [
  {
    name: 'JORDAN TRAÑA',
    lines: [
      'Architect — real-world mission counterpart',
      'PsiNet framework author, Universal Language',
    ],
  },
  {
    name: 'JONO THOʻRA',
    lines: [
      'PsiNet architect — HoloDeck design lead',
      'Timesight operator — Alpha timeline',
    ],
  },
  {
    name: 'JANE THOʻRA',
    lines: [
      'PsiOps recruit — training cohort 7-alpha',
      'Psionic lineage: Thoʻra Clan',
      'Current timeline coherence: operational',
    ],
  },
];

/** Extend this array as contributors join the project. */
const CONTRIBUTING_OPERATORS: RegistryEntry[] = [
  // Example format — remove or replace when real contributors are added:
  // { name: 'CALLSIGN', lines: ['Role descriptor in Kernel language'] },
];

const TECHNICAL_SUBSTRATE: Array<{ label: string; value: string }> = [
  { label: 'HOLONET ENGINE',             value: 'Phaser 3.90' },
  { label: 'PSISYS RUNTIME',             value: 'TypeScript 5.8 / Vite 7' },
  { label: 'TIMELINE SUBSTRATE',         value: 'Web Audio API / Canvas 2D' },
  { label: 'OPERATOR CALLSIGN REGISTRY', value: 'localStorage (pfg_session_v2)' },
  { label: 'RENDER CONTEXT',             value: 'WebGL / DOM overlay stack' },
];

const ACKNOWLEDGMENTS = [
  'To every player who has observed the field: thank you.',
  'Your interventions have shaped timelines across the multiverse.',
  'The Thoʻra Clan endures because of operators like you.',
];

const AXIOM = [
  '"Your entire existence can be described mathematically.',
  ' There exists a Universal Language."',
  '',
  '— Universal Language Foundational Axiom',
  '  Jordan Traña, 2025',
];

// ─── Component ────────────────────────────────────────────────────────────────

export class EntityRegistry {
  static show(): Promise<void> {
    return new Promise(resolve => {
      // ── Shell ────────────────────────────────────────────────────────────
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.82);
        display: flex; align-items: center; justify-content: center;
        z-index: 77000;
        font-family: 'Courier New', Courier, monospace;
        opacity: 0; transition: opacity 180ms ease-in;
      `;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => { overlay.style.opacity = '1'; });

      // ── Panel ────────────────────────────────────────────────────────────
      const panel = document.createElement('div');
      panel.style.cssText = `
        background: ${C.bg};
        border: 1px solid ${C.amber};
        box-shadow: 0 0 24px rgba(255,140,0,0.08);
        padding: 28px 32px 24px;
        width: min(560px, calc(100vw - 40px));
        max-height: calc(100vh - 80px);
        overflow-y: auto;
      `;
      overlay.appendChild(panel);

      // ── Renderer helpers ─────────────────────────────────────────────────
      const addEl = (tag: string, css: string, text?: string): HTMLElement => {
        const d = document.createElement(tag);
        (d as HTMLElement).style.cssText = css;
        if (text !== undefined) d.textContent = text;
        panel.appendChild(d);
        return d as HTMLElement;
      };

      const header = (text: string) =>
        addEl('div',
          `font-size:9px;letter-spacing:3px;color:${C.amberDim};margin-bottom:3px;`,
          text);

      const title = (text: string) =>
        addEl('div',
          `font-size:15px;letter-spacing:2px;color:${C.amber};margin-bottom:4px;`,
          text);

      const subtitle = (text: string) =>
        addEl('div',
          `font-size:10px;letter-spacing:1.5px;color:${C.dim};margin-bottom:16px;`,
          text);

      const rule = () =>
        addEl('div',
          `height:1px;background:${C.rule};margin:10px 0;`);

      const heavyRule = () =>
        addEl('div',
          `height:1px;background:${C.amber};opacity:0.25;margin:14px 0;`);

      const sectionLabel = (text: string) =>
        addEl('div',
          `font-size:9px;letter-spacing:3px;color:${C.amberDim};margin:16px 0 10px;`,
          `━━ ${text}`);

      const bodyLine = (text: string, color: string = C.text, size = '11px') =>
        addEl('div',
          `font-size:${size};letter-spacing:0.5px;color:${color};margin:2px 0;line-height:1.5;`,
          text);

      // ── Header ───────────────────────────────────────────────────────────
      header('PSISYS KERNEL');
      title('ENTITY REGISTRY');
      subtitle('PROJECT: PROTO FUSION GIRL');
      heavyRule();

      // ── CORE ENTITIES ────────────────────────────────────────────────────
      sectionLabel('CORE ENTITIES');

      for (const entity of CORE_ENTITIES) {
        // Name row with dot-leader padding
        const nameRow = document.createElement('div');
        nameRow.style.cssText = `
          display: flex; align-items: baseline;
          margin: 8px 0 2px;
        `;

        const namePart = document.createElement('span');
        namePart.style.cssText = `
          font-size:12px;letter-spacing:1.5px;color:${C.amber};
          white-space: nowrap;
        `;
        namePart.textContent = entity.name;

        const dots = document.createElement('span');
        dots.style.cssText = `
          flex: 1; border-bottom: 1px dotted ${C.rule};
          margin: 0 8px 3px;
          min-width: 12px;
        `;

        nameRow.appendChild(namePart);
        nameRow.appendChild(dots);
        panel.appendChild(nameRow);

        for (const line of entity.lines) {
          bodyLine(`  ${line}`, C.dim, '10px');
        }
      }

      heavyRule();

      // ── CONTRIBUTING OPERATORS ───────────────────────────────────────────
      sectionLabel('CONTRIBUTING OPERATORS');

      if (CONTRIBUTING_OPERATORS.length === 0) {
        bodyLine('  [REGISTRY PENDING — OPERATORS NOT YET LOGGED]', C.rule, '10px');
      } else {
        for (const op of CONTRIBUTING_OPERATORS) {
          const opRow = document.createElement('div');
          opRow.style.cssText = `
            display: flex; align-items: baseline;
            margin: 6px 0 2px;
          `;
          const opName = document.createElement('span');
          opName.style.cssText = `font-size:11px;letter-spacing:1px;color:${C.text};white-space:nowrap;`;
          opName.textContent = op.name;
          const opDots = document.createElement('span');
          opDots.style.cssText = `flex:1;border-bottom:1px dotted ${C.rule};margin:0 8px 3px;min-width:12px;`;
          opRow.appendChild(opName);
          opRow.appendChild(opDots);
          panel.appendChild(opRow);
          for (const line of op.lines) {
            bodyLine(`  ${line}`, C.dim, '10px');
          }
        }
      }

      heavyRule();

      // ── TECHNICAL SUBSTRATE ──────────────────────────────────────────────
      sectionLabel('TECHNICAL SUBSTRATE');

      for (const item of TECHNICAL_SUBSTRATE) {
        const row = document.createElement('div');
        row.style.cssText = `
          display:flex;align-items:baseline;margin:4px 0;
        `;
        const labelSpan = document.createElement('span');
        labelSpan.style.cssText = `font-size:10px;letter-spacing:1px;color:${C.amberDim};white-space:nowrap;`;
        labelSpan.textContent = item.label;

        const dotsSpan = document.createElement('span');
        dotsSpan.style.cssText = `flex:1;border-bottom:1px dotted ${C.rule};margin:0 8px 3px;min-width:8px;`;

        const valueSpan = document.createElement('span');
        valueSpan.style.cssText = `font-size:10px;letter-spacing:0.5px;color:${C.dim};white-space:nowrap;`;
        valueSpan.textContent = item.value;

        row.appendChild(labelSpan);
        row.appendChild(dotsSpan);
        row.appendChild(valueSpan);
        panel.appendChild(row);
      }

      heavyRule();

      // ── ACKNOWLEDGMENTS ──────────────────────────────────────────────────
      sectionLabel('ACKNOWLEDGMENTS');

      for (const line of ACKNOWLEDGMENTS) {
        bodyLine(line, C.dim, '10px');
      }

      heavyRule();

      // ── Axiom ────────────────────────────────────────────────────────────
      for (const line of AXIOM) {
        if (line === '') {
          addEl('div', 'height:6px;');
        } else if (line.startsWith('—')) {
          bodyLine(line, C.amberDim, '10px');
        } else {
          bodyLine(line, C.text, '11px');
        }
      }

      rule();

      // ── Close button ─────────────────────────────────────────────────────
      const closeBtn = document.createElement('button');
      closeBtn.style.cssText = `
        font-family: 'Courier New', Courier, monospace;
        font-size: 11px; letter-spacing: 2px;
        padding: 8px 20px;
        background: transparent;
        border: 1px solid ${C.border};
        color: ${C.amberDim};
        cursor: pointer;
        display: block;
        margin: 4px auto 0;
      `;
      closeBtn.textContent = '[ RETURN TO FIELD ]';

      const dismiss = () => {
        overlay.style.transition = 'opacity 180ms ease-out';
        overlay.style.opacity = '0';
        document.removeEventListener('keydown', onKey);
        setTimeout(() => { overlay.remove(); resolve(); }, 200);
      };

      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255,140,0,0.07)';
        closeBtn.style.borderColor = C.amber;
      });
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'transparent';
        closeBtn.style.borderColor = C.border;
      });
      closeBtn.addEventListener('click', dismiss);
      panel.appendChild(closeBtn);

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') dismiss();
      };
      document.addEventListener('keydown', onKey);
    });
  }
}
