/**
 * PsiSysKernel — DOM-based entry interface for ProtoFusionGirl
 *
 * Renders the PsiSys Kernel OS layer before Phaser starts.
 * Two modes:
 *   - Cold boot: first-ever session → callsign registration
 *   - Status diff: return session → field report + elapsed time
 *
 * Pure HTML/CSS/JS — no Phaser dependency.
 * Resolves a Promise<string> (callsign) when the user presses ENTER.
 */

import { SessionPersistence, SessionState, isFirstBoot } from '../save/SaveSystem';

// ─── Palette constants ────────────────────────────────────────────────────────

const C = {
  bg:       '#0d0e10',
  primary:  '#f0ede8',   // warm off-white
  amber:    '#FF8C00',   // ember orange
  amberDim: 'rgba(255,140,0,0.45)',
  positive: '#c8e88a',   // muted green
  warn:     '#ffb347',   // amber-orange warning
  critical: '#ff5c5c',   // red
  dim:      '#5a5e66',   // gunmetal mid
  rule:     '#2a2e36',   // separator line colour
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  css: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.style.cssText = css;
  if (text !== undefined) e.textContent = text;
  return e;
}

function rule(): HTMLDivElement {
  return el('div',
    `height:1px; background:${C.rule}; margin:10px 0;`,
  );
}

/** Formats ms elapsed into a human string: "3d 14h 22m" */
function formatElapsed(ms: number): string {
  if (ms <= 0) return '< 1m';
  const totalMin = Math.floor(ms / 60_000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || parts.length === 0) parts.push(`${m}m`);
  return parts.join(' ');
}

function nefariumColor(level: SessionState['lastNefariumActivity']): string {
  switch (level) {
    case 'critical':  return C.critical;
    case 'elevated':  return C.warn;
    case 'low':       return C.amber;
    default:          return C.positive;
  }
}

// ─── Typewriter animation ─────────────────────────────────────────────────────

function typewrite(container: HTMLElement, lines: Array<{
  text: string;
  color?: string;
  charDelay?: number;   // ms per character
  lineDelay?: number;   // ms before this line starts (after prev line finished)
  bold?: boolean;
}>): Promise<void> {
  return new Promise(resolve => {
    let lineIdx = 0;
    let totalDelay = 0;

    for (const line of lines) {
      const lineEl = el('div',
        `color:${line.color ?? C.primary}; font-size:13px; letter-spacing:1.2px;
         min-height:1.4em; ${line.bold ? 'font-weight:bold;' : ''}`,
      );
      container.appendChild(lineEl);

      const lineStartDelay = totalDelay + (line.lineDelay ?? 0);
      const charDelay = line.charDelay ?? 14;

      if (charDelay <= 0 || line.text.trim() === '') {
        // Instant line
        setTimeout(() => { lineEl.textContent = line.text; }, lineStartDelay);
        totalDelay = lineStartDelay;
      } else {
        // Character-by-character
        for (let i = 0; i < line.text.length; i++) {
          const ch = line.text[i];
          const t = lineStartDelay + i * charDelay;
          setTimeout(() => { lineEl.textContent += ch; }, t);
        }
        totalDelay = lineStartDelay + line.text.length * charDelay;
      }

      lineIdx++;
    }

    setTimeout(resolve, totalDelay + 80);
  });
}

// ─── PsiSysKernel class ───────────────────────────────────────────────────────

export class PsiSysKernel {
  private overlay: HTMLDivElement;
  private output: HTMLDivElement;
  private callsign = '';

  constructor() {
    this.overlay = el('div', `
      position: fixed;
      inset: 0;
      background: ${C.bg};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 50000;
      font-family: 'Courier New', Courier, monospace;
      opacity: 0;
      transition: opacity 200ms ease-in;
    `);

    this.output = el('div', `
      min-width: min(560px, 92vw);
      max-width: 620px;
      display: flex;
      flex-direction: column;
      gap: 0;
    `);

    this.overlay.appendChild(this.output);
    document.body.appendChild(this.overlay);
  }

  /** Fade the overlay in. */
  private show(): void {
    requestAnimationFrame(() => { this.overlay.style.opacity = '1'; });
  }

  /** Fade the overlay out, then remove it from DOM. */
  private hide(): Promise<void> {
    return new Promise(resolve => {
      this.overlay.style.transition = 'opacity 300ms ease-out';
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        this.overlay.remove();
        resolve();
      }, 320);
    });
  }

  /**
   * Main entry point.
   * Shows cold boot (first run) or status diff (return), waits for ENTER,
   * then fades out. Returns the callsign.
   */
  public async run(): Promise<string> {
    this.show();

    if (isFirstBoot()) {
      this.callsign = await this.coldBoot();
    } else {
      const session = SessionPersistence.load()!;
      this.callsign = session.callsign ?? 'OPERATOR';
      await this.statusDiff(session);
    }

    await this.hide();
    return this.callsign;
  }

  // ─── Cold Boot ─────────────────────────────────────────────────────────────

  private async coldBoot(): Promise<string> {
    await typewrite(this.output, [
      { text: 'PSISYS KERNEL v9.7.1 — COLD BOOT',        color: C.amber,   charDelay: 18, lineDelay: 200 },
      { text: '████████████████████ 100%',               color: C.dim,     charDelay: 0,  lineDelay: 40  },
      { text: ' ',                                        charDelay: 0,     lineDelay: 60  },
      { text: 'PSIONIC MATRIX .......... ONLINE',         color: C.positive,charDelay: 8,  lineDelay: 40  },
      { text: 'HOLONET ................. CONNECTED',      color: C.positive,charDelay: 8,  lineDelay: 20  },
      { text: 'TIMELINE ANCHORS ........ 0 (no prior sessions)', color: C.dim, charDelay: 8, lineDelay: 20 },
      { text: 'ASI INSTANCE ............ UNREGISTERED',  color: C.warn,    charDelay: 8,  lineDelay: 20  },
      { text: ' ',                                        charDelay: 0,     lineDelay: 80  },
      { text: '>> No operator callsign detected.',        color: C.primary, charDelay: 10, lineDelay: 40  },
      { text: '>> This identifier persists across all observed timelines.', color: C.dim, charDelay: 8, lineDelay: 30 },
    ]);

    // Callsign input prompt
    const callsign = await this.callsignPrompt();

    // Confirmation lines
    this.output.appendChild(rule());
    await typewrite(this.output, [
      { text: `CALLSIGN REGISTERED: ${callsign}`,          color: C.amber,   charDelay: 10, lineDelay: 60  },
      { text: 'OPERATOR CLEARANCE: ASI-7 │ ARCHANGEL AGENCY', color: C.dim, charDelay: 8,  lineDelay: 30  },
      { text: ' ',                                          charDelay: 0,     lineDelay: 30  },
      { text: 'ACTIVE HOLODECK INSTANCES:',                 color: C.dim,     charDelay: 8,  lineDelay: 20  },
      { text: '  ALPHA-7 .............. TRAINING — ACTIVE', color: C.positive,charDelay: 8,  lineDelay: 20  },
      { text: '  TARGET: JANE THO\u02beRA .. PSIOPS RECRUIT',color: C.primary, charDelay: 8,  lineDelay: 20  },
      { text: ' ',                                          charDelay: 0,     lineDelay: 40  },
    ]);

    await this.enterPrompt('>> Initiate observation link?');

    SessionPersistence.registerCallsign(callsign);
    return callsign;
  }

  // ─── Callsign input ────────────────────────────────────────────────────────

  private callsignPrompt(): Promise<string> {
    return new Promise(resolve => {
      const row = el('div', `display:flex; align-items:baseline; gap:6px; margin-top:6px;`);
      const label = el('span', `color:${C.amber}; font-size:13px; letter-spacing:1.2px;`, '>> Enter callsign: ');
      const input = el('input', `
        background: transparent;
        border: none;
        border-bottom: 1px solid ${C.amber};
        outline: none;
        color: ${C.amber};
        font-family: 'Courier New', monospace;
        font-size: 13px;
        letter-spacing: 2px;
        width: 180px;
        padding: 0 2px 2px;
        text-transform: uppercase;
      `);
      input.maxLength = 14;
      input.setAttribute('spellcheck', 'false');
      input.setAttribute('autocomplete', 'off');

      row.appendChild(label);
      row.appendChild(input);
      this.output.appendChild(row);

      setTimeout(() => input.focus(), 100);

      const hint = el('div', `color:${C.dim}; font-size:11px; letter-spacing:1px; margin-top:4px; margin-left:2px;`,
        '3–14 chars, letters/numbers/hyphens. Press ENTER to confirm.');
      this.output.appendChild(hint);

      const error = el('div', `color:${C.critical}; font-size:11px; letter-spacing:1px; margin-top:3px; min-height:1.2em;`);
      this.output.appendChild(error);

      input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key !== 'Enter') return;
        const val = input.value.trim().toUpperCase();
        if (val.length < 3) { error.textContent = 'Minimum 3 characters.'; return; }
        if (!/^[A-Z0-9\-_]+$/.test(val)) { error.textContent = 'Letters, numbers, hyphens and underscores only.'; return; }
        error.textContent = '';
        input.disabled = true;
        resolve(val);
      });
    });
  }

  // ─── Return session status diff ────────────────────────────────────────────

  private async statusDiff(session: SessionState): Promise<void> {
    const elapsed = session.lastSessionEnd
      ? formatElapsed(Date.now() - session.lastSessionEnd)
      : 'first session';

    const nefariumLabel = {
      none: 'nominal',
      low: 'low',
      elevated: 'ELEVATED',
      critical: 'CRITICAL',
    }[session.lastNefariumActivity];

    const deltaSign = session.lastTimelineDelta >= 0 ? '+' : '';
    const deltaColor = session.lastTimelineDelta > 0 ? C.positive
      : session.lastTimelineDelta < 0 ? C.critical : C.dim;

    await typewrite(this.output, [
      { text: 'PSISYS KERNEL — SESSION RESUME',            color: C.amber,   charDelay: 14, lineDelay: 200 },
      { text: `OPERATOR: ${session.callsign}`,             color: C.dim,     charDelay: 0,  lineDelay: 30  },
      { text: ' ',                                          charDelay: 0,     lineDelay: 20  },
      { text: `ELAPSED SINCE LAST OBSERVATION: ${elapsed}`,color: C.primary, charDelay: 10, lineDelay: 40  },
      { text: ' ',                                          charDelay: 0,     lineDelay: 30  },
    ]);

    this.output.appendChild(rule());

    // Field report table
    const table = el('div', `display:flex; flex-direction:column; gap:3px; margin:6px 0 10px;`);

    const row = (label: string, value: string, color: string, arrow = '') => {
      const r = el('div', `display:flex; justify-content:space-between; font-size:12px; letter-spacing:1px;`);
      const l = el('span', `color:${C.dim};`, label);
      const v = el('span', `color:${color};`, value + arrow);
      r.appendChild(l); r.appendChild(v);
      return r;
    };

    table.appendChild(row('JANE',               'operational', C.positive));
    table.appendChild(row('LEYLINE STABILITY',
      `${session.lastLeylineStability}%`,
      session.lastLeylineStability > 60 ? C.positive : session.lastLeylineStability > 35 ? C.warn : C.critical,
      session.lastLeylineStability < 60 ? '  ▼ degraded' : '',
    ));
    table.appendChild(row('NEFARIUM ACTIVITY',  nefariumLabel,  nefariumColor(session.lastNefariumActivity)));
    table.appendChild(row('TIMELINE DELTA',     `${deltaSign}${session.lastTimelineDelta.toFixed(3)}`, deltaColor));

    this.output.appendChild(table);
    this.output.appendChild(rule());

    const anchorLine = session.lastAnchorDescription
      ? `LAST ANCHOR: ${session.lastAnchorDescription}`
      : 'LAST ANCHOR: session origin';

    const warnLine = session.lastLeylineStability < 55
      ? 'WARNING: Leyline degradation accelerating — intervention advised'
      : null;

    const trailers: Array<Parameters<typeof typewrite>[1][0]> = [
      { text: anchorLine, color: C.dim, charDelay: 0, lineDelay: 40 },
    ];
    if (warnLine) {
      trailers.push({ text: ' ', charDelay: 0, lineDelay: 20 });
      trailers.push({ text: warnLine, color: C.warn, charDelay: 10, lineDelay: 20 });
    }
    trailers.push({ text: ' ', charDelay: 0, lineDelay: 40 });

    await typewrite(this.output, trailers);
    await this.enterPrompt('[ RESUME OBSERVATION ]');
  }

  // ─── ENTER prompt with blinking cursor ────────────────────────────────────

  private enterPrompt(promptText: string): Promise<void> {
    return new Promise(resolve => {
      const row = el('div', `display:flex; align-items:baseline; gap:0; margin-top:4px;`);
      const label = el('span', `color:${C.amber}; font-size:13px; letter-spacing:1.5px;`, promptText + '  ');
      const hint = el('span', `color:${C.dim}; font-size:11px; letter-spacing:1px;`, '[ENTER]');
      const cursor = el('span', `color:${C.amber}; font-size:13px;`, ' ▌');
      row.appendChild(label);
      row.appendChild(hint);
      row.appendChild(cursor);
      this.output.appendChild(row);

      // Blinking cursor
      let visible = true;
      const blink = setInterval(() => {
        visible = !visible;
        cursor.style.opacity = visible ? '1' : '0';
      }, 530);

      const done = () => {
        clearInterval(blink);
        cursor.remove();
        hint.remove();
        // Replace label with confirmed look
        label.style.color = C.positive;
        label.textContent = promptText + '  [CONFIRMED]';
        resolve();
      };

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          document.removeEventListener('keydown', onKey);
          done();
        }
      };
      document.addEventListener('keydown', onKey);

      // Also allow click/tap
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        document.removeEventListener('keydown', onKey);
        done();
      }, { once: true });
    });
  }
}
