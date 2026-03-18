/**
 * JonoTransmission — Stage 3.4
 *
 * Encrypted packet transmission overlay. Three phases:
 *   A (0–800ms):   Canvas waveform "caller-ID" signature + channel-open border pulse.
 *   B (800ms+):    Text renders character-by-character (12ms/char).
 *   C (8s total):  Panel fades out; caller triggers PsiNet log callback.
 *
 * Session cap: max 4 transmissions per session, minimum 90s apart.
 *
 * Usage:
 *   JonoTransmission.show('The node is destabilising.', () => {
 *     psiNetLog.add('BRIDGE', 'Packet received — logged');
 *   });
 */

// ── Palette (PsiSys amber on gunmetal) ───────────────────────────────────────
const C = {
  bg:      '#0d0e10',
  amber:   '#FF8C00',
  amberDim:'rgba(255,140,0,0.5)',
  border:  '#FF8C00',
  text:    '#e8e4dc',
  label:   'rgba(255,140,0,0.45)',
} as const;

const CHAR_DELAY_MS   = 12;
const DISPLAY_MS      = 8_000;
const FADE_MS         = 600;
const SESSION_CAP     = 4;
const MIN_GAP_MS      = 90_000;

export class JonoTransmission {
  private static _sessionCount = 0;
  private static _lastShownAt  = 0;
  private static _active       = false;

  /**
   * Show a Jono transmission. Silently no-ops if session cap or gap is not met.
   * @param text       The transmission body (newlines supported).
   * @param onFade     Called when the panel finishes fading out.
   */
  static show(text: string, onFade?: () => void): void {
    const now = Date.now();
    if (this._active) return;
    if (this._sessionCount >= SESSION_CAP) return;
    if (now - this._lastShownAt < MIN_GAP_MS && this._lastShownAt > 0) return;

    this._active = true;
    this._sessionCount++;
    this._lastShownAt = now;

    // ── Channel-open border pulse ──────────────────────────────────────────
    this._borderPulse();

    // ── Panel shell ────────────────────────────────────────────────────────
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed;
      bottom: 48px;
      left: 50%;
      transform: translateX(-50%);
      width: min(560px, calc(100vw - 48px));
      background: ${C.bg};
      border: 1px solid ${C.border};
      box-shadow: 0 0 12px rgba(255,140,0,0.18);
      padding: 18px 24px 20px;
      z-index: 70000;
      font-family: 'Courier New', Courier, monospace;
      opacity: 0;
      transition: opacity 200ms ease-in;
      pointer-events: none;
    `;
    document.body.appendChild(panel);
    requestAnimationFrame(() => { panel.style.opacity = '1'; });

    // ── Header row ─────────────────────────────────────────────────────────
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 12px;
    `;

    const label = document.createElement('div');
    label.style.cssText = `font-size: 9px; letter-spacing: 2.5px; color: ${C.label}; flex: 1;`;
    label.textContent = 'PSISYS — INCOMING ENCRYPTED PACKET';

    const lockEl = document.createElement('div');
    lockEl.style.cssText = `font-size: 9px; letter-spacing: 1px; color: ${C.amberDim};`;
    lockEl.textContent = '■ DECODING';

    header.appendChild(label);
    header.appendChild(lockEl);
    panel.appendChild(header);

    // ── Waveform canvas (caller-ID) ────────────────────────────────────────
    const WAVE_W = panel.getBoundingClientRect().width || 512;
    const WAVE_H = 28;
    const waveCanvas = document.createElement('canvas');
    waveCanvas.width  = Math.round(WAVE_W);
    waveCanvas.height = WAVE_H;
    waveCanvas.style.cssText = 'display:block; margin-bottom:14px; width:100%; height:28px;';
    panel.appendChild(waveCanvas);
    const wCtx = waveCanvas.getContext('2d')!;

    // ── Speaker tag ───────────────────────────────────────────────────────
    const speakerEl = document.createElement('div');
    speakerEl.style.cssText = `font-size: 10px; letter-spacing: 2px; color: ${C.amberDim}; margin-bottom: 8px;`;
    speakerEl.textContent = 'JONO THOƦA // PSINET FRAGMENT';
    panel.appendChild(speakerEl);

    // ── Text body ─────────────────────────────────────────────────────────
    const textEl = document.createElement('div');
    textEl.style.cssText = `
      font-size: 15px; line-height: 1.65;
      color: ${C.text};
      white-space: pre-wrap;
      min-height: 1.65em;
    `;
    panel.appendChild(textEl);

    // ── Animate waveform caller-ID (800ms) ────────────────────────────────
    const waveStart = performance.now();
    let waveFrame: number;
    let textStarted = false;

    const drawWave = (now: number) => {
      const elapsed  = now - waveStart;
      const progress = Math.min(1, elapsed / 800);   // converges over 800ms
      const amp      = (1 - progress) * (WAVE_H / 2 - 3) + 0.5;
      const freq     = 3.2;

      wCtx.clearRect(0, 0, waveCanvas.width, WAVE_H);
      wCtx.fillStyle = 'rgba(255,140,0,0.04)';
      wCtx.fillRect(0, 0, waveCanvas.width, WAVE_H);

      const color = progress >= 1
        ? 'rgba(200,232,138,0.85)'
        : `rgba(255,140,0,${0.5 + progress * 0.3})`;
      wCtx.strokeStyle = color;
      wCtx.lineWidth   = 1.2;
      wCtx.beginPath();

      const pts  = 80;
      const midY = WAVE_H / 2;
      const ts   = elapsed * 0.003;
      for (let i = 0; i <= pts; i++) {
        const x  = (i / pts) * waveCanvas.width;
        const p  = (i / pts) * Math.PI * 2;
        const yn = Math.sin(p * freq + ts) * 0.6
                 + Math.sin(p * freq * 2.1 + ts * 1.3) * 0.25
                 + Math.sin(p * freq * 0.7 + ts * 0.8) * 0.15;
        const y  = midY + yn * amp;
        i === 0 ? wCtx.moveTo(x, y) : wCtx.lineTo(x, y);
      }
      wCtx.stroke();

      if (progress < 1) {
        waveFrame = requestAnimationFrame(drawWave);
      } else {
        // Lock confirmed
        lockEl.textContent = '■ LOCK';
        lockEl.style.color = 'rgba(200,232,138,0.8)';
        if (!textStarted) {
          textStarted = true;
          this._typewrite(textEl, text, () => {
            // Begin display timer after text finishes
            const showDuration = Math.max(3000, DISPLAY_MS - (performance.now() - waveStart));
            setTimeout(() => this._fadeOut(panel, () => {
              this._active = false;
              onFade?.();
            }), showDuration);
          });
        }
      }
    };

    waveFrame = requestAnimationFrame(drawWave);

    // Safety: clear wave rAF if panel is removed externally
    setTimeout(() => cancelAnimationFrame(waveFrame), DISPLAY_MS + 2000);
  }

  /** Flash a brief amber border around the full viewport (channel opening). */
  private static _borderPulse(): void {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed; inset: 0;
      border: 2px solid rgba(255,140,0,0.7);
      pointer-events: none;
      z-index: 69999;
      opacity: 1;
      transition: opacity 350ms ease-out;
    `;
    document.body.appendChild(flash);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 380);
      });
    });
  }

  /** Typewrite text char-by-char into an element. Calls onComplete when done. */
  private static _typewrite(el: HTMLElement, text: string, onComplete: () => void): void {
    let i = 0;
    const step = () => {
      if (i >= text.length) { onComplete(); return; }
      el.textContent = text.slice(0, ++i);
      setTimeout(step, CHAR_DELAY_MS);
    };
    step();
  }

  private static _fadeOut(el: HTMLElement, onDone: () => void): void {
    el.style.transition = `opacity ${FADE_MS}ms ease-out`;
    el.style.opacity    = '0';
    setTimeout(() => { el.remove(); onDone(); }, FADE_MS + 50);
  }

  /** Reset session counters (call on session start / new game). */
  static resetSession(): void {
    this._sessionCount = 0;
    this._lastShownAt  = 0;
    this._active       = false;
  }
}
