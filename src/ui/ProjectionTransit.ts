/**
 * ProjectionTransit — DOM/Canvas overlay for the projection transit phase.
 *
 * Three amber oscilloscope traces (PSIONIC_CARRIER, HOLOFIELD_SYNC,
 * NEURAL_ANCHOR) converge from noise → flat line over ~4 seconds.
 * A temporal fragment fades in during convergence.
 * On frequency lock: hard-cut to white → caller handles HoloDeck fade-up.
 *
 * Pure HTML/Canvas — no Phaser.
 */

import { SessionPersistence } from '../save/SaveSystem';

// ─── Palette ─────────────────────────────────────────────────────────────────

const C = {
  bg:         '#0d0e10',
  amber:      '#FF8C00',
  amberDim:   'rgba(255,140,0,0.55)',
  amberTrace: 'rgba(255,140,0,0.85)',
  dim:        '#5a5e66',
  positive:   '#c8e88a',
  rule:       '#2a2e36',
} as const;

// ─── Temporal fragments pool ──────────────────────────────────────────────────

const FRAGMENTS = [
  'The ley line under Sector 7 has been resonating for eleven minutes.',
  'Jane looked up at the wrong moment. She noticed something.',
  'Three new Nefarium nodes since last cycle.',
  'A Beu signal went quiet two hours ago. It came back different.',
  'The PsiNet recorded an anomaly at Junction 14. Cause: unclassified.',
  'She has been standing at the edge of Sector 3 for four minutes. Thinking.',
  'Nether concentration in this sector is higher than the models predicted.',
  'Someone placed an anchor here before you. Not in this timeline.',
  'The ley lines are running warm today. Nefarium will push harder.',
  'Jane\'s psionic output is elevated. She knows something is coming.',
  'Beu node CYGNUS-3 has been silent. Status: unknown.',
  'Junction 14 resonance: 61%. The window is narrowing.',
  'The simulation has been running for six cycles without a major deviation.',
  'An echo from a prior timeline is still embedded in Sector 3-East.',
  'Jono placed this anchor before you arrived. He expected you here.',
  'The ley line hum shifted pitch seven minutes ago. Nobody noticed.',
  'Three Beu nodes converged on Jane\'s position yesterday. She walked past them.',
  'Timeline delta: net positive. Do not get comfortable.',
  'The Nefarium index spiked at 03:14. It stabilized. For now.',
  'There are twenty-seven known timelines where Jane succeeds. You are in one of them.',
];

function pickFragment(): string {
  const session = SessionPersistence.load();
  // Seed with visit count so it varies per session
  const seed = (session?.visitCount ?? 0) + Math.floor(Date.now() / 60_000);
  return FRAGMENTS[seed % FRAGMENTS.length];
}

// ─── Oscilloscope channel ─────────────────────────────────────────────────────

interface Channel {
  label: string;
  phase: number;          // phase offset for noise variety
  lockDelay: number;      // ms after start that this channel begins converging
  lockDuration: number;   // ms to fully converge
  locked: boolean;
}

const CHANNELS: Channel[] = [
  { label: 'PSIONIC_CARRIER', phase: 0.0,  lockDelay: 0,    lockDuration: 2400, locked: false },
  { label: 'HOLOFIELD_SYNC',  phase: 1.7,  lockDelay: 400,  lockDuration: 2200, locked: false },
  { label: 'NEURAL_ANCHOR',   phase: 3.1,  lockDelay: 800,  lockDuration: 2000, locked: false },
];

// ─── ProjectionTransit class ──────────────────────────────────────────────────

export class ProjectionTransit {
  /**
   * Show the transit overlay. Resolves when the white flash is complete
   * and the caller should begin fading in the HoloDeck.
   */
  static show(): Promise<void> {
    return new Promise(resolve => {
      // ── Shell ──
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; inset: 0;
        background: ${C.bg};
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        z-index: 52000;
        font-family: 'Courier New', Courier, monospace;
        opacity: 0; transition: opacity 180ms ease-in;
      `;
      document.body.appendChild(overlay);
      requestAnimationFrame(() => { overlay.style.opacity = '1'; });

      // ── Header ──
      const header = document.createElement('div');
      header.style.cssText = `color:${C.amberDim}; font-size:11px; letter-spacing:2px; margin-bottom:14px; text-align:center;`;
      header.textContent = 'PSISYS KERNEL — PROJECTION SEQUENCE';
      overlay.appendChild(header);

      // ── Oscilloscope canvas ──
      const CANVAS_W = Math.min(560, window.innerWidth - 48);
      const TRACK_H  = 48;
      const TRACK_GAP = 10;
      const LABEL_W  = 130;
      const PLOT_W   = CANVAS_W - LABEL_W - 8;
      const CANVAS_H = CHANNELS.length * (TRACK_H + TRACK_GAP);

      const canvas = document.createElement('canvas');
      canvas.width  = CANVAS_W;
      canvas.height = CANVAS_H;
      canvas.style.cssText = `display:block; margin: 0 auto;`;
      overlay.appendChild(canvas);
      const ctx = canvas.getContext('2d')!;

      // ── Progress line ──
      const progRow = document.createElement('div');
      progRow.style.cssText = `
        color:${C.amber}; font-size:13px; letter-spacing:1.8px;
        margin-top:16px; text-align:center; min-height:1.4em;
      `;
      progRow.textContent = 'SYNCHRONIZING...  0%';
      overlay.appendChild(progRow);

      // ── Temporal fragment ──
      const fragment = document.createElement('div');
      fragment.style.cssText = `
        color:${C.amberDim}; font-size:11px; letter-spacing:1.4px;
        margin-top:18px; text-align:center; max-width:480px;
        opacity:0; transition:opacity 800ms ease-in;
        font-style:italic;
      `;
      fragment.textContent = `"${pickFragment()}"`;
      overlay.appendChild(fragment);

      // Show fragment after 1s
      setTimeout(() => { fragment.style.opacity = '1'; }, 1000);

      // ── Animation ────────────────────────────────────────────────────────────
      const startMs = performance.now();
      let animFrame: number;
      let allLocked = false;

      // Noise helpers
      const noise = (t: number, phase: number, freq: number) =>
        Math.sin(t * freq + phase) * 0.6 +
        Math.sin(t * freq * 2.1 + phase * 1.3) * 0.25 +
        Math.sin(t * freq * 0.7 + phase * 0.8) * 0.15;

      const draw = (now: number) => {
        const elapsed = now - startMs;
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        let totalProgress = 0;

        CHANNELS.forEach((ch, i) => {
          const y0 = i * (TRACK_H + TRACK_GAP);
          const midY = y0 + TRACK_H / 2;

          // Convergence progress for this channel
          const chElapsed = Math.max(0, elapsed - ch.lockDelay);
          const chProgress = Math.min(1, chElapsed / ch.lockDuration);
          const amplitude = 1 - chProgress; // 1 → 0
          ch.locked = chProgress >= 1;
          totalProgress += chProgress;

          // Label
          ctx.font = '10px Courier New, monospace';
          ctx.fillStyle = ch.locked ? C.positive : C.dim;
          ctx.letterSpacing = '1px';
          ctx.textBaseline = 'middle';
          ctx.fillText(ch.label, 0, midY);

          // Track background
          ctx.fillStyle = 'rgba(255,140,0,0.04)';
          ctx.fillRect(LABEL_W, y0 + 4, PLOT_W, TRACK_H - 8);

          // Waveform
          ctx.beginPath();
          ctx.strokeStyle = ch.locked
            ? `rgba(200,232,138,0.9)`
            : `rgba(255,140,0,${0.5 + amplitude * 0.4})`;
          ctx.lineWidth = 1.2;

          const points = 200;
          for (let p = 0; p <= points; p++) {
            const px = LABEL_W + (p / points) * PLOT_W;
            const t = elapsed * 0.003 + p * 0.08;
            const freq = 1.2 + ch.phase * 0.1;
            const yn = noise(t, ch.phase, freq) * amplitude * (TRACK_H / 2 - 6);
            const py = midY + yn;
            p === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.stroke();

          // Lock indicator
          if (ch.locked) {
            ctx.font = 'bold 9px Courier New, monospace';
            ctx.fillStyle = C.positive;
            ctx.textBaseline = 'middle';
            ctx.fillText('■ LOCK', LABEL_W + PLOT_W + 6, midY);
          }

          // Separator rule
          ctx.fillStyle = C.rule;
          ctx.fillRect(0, y0 + TRACK_H + TRACK_GAP / 2 - 1, CANVAS_W, 1);
        });

        // Overall progress
        const pct = Math.round((totalProgress / CHANNELS.length) * 100);
        progRow.textContent = `SYNCHRONIZING...  ${pct}%`;

        if (!allLocked && CHANNELS.every(c => c.locked)) {
          allLocked = true;
          progRow.textContent = 'FREQUENCY LOCK — CONFIRMED';
          progRow.style.color = C.positive;
          fragment.style.opacity = '0';

          // Hard cut to white after 300ms
          setTimeout(() => {
            overlay.style.transition = 'none';
            overlay.style.background = '#ffffff';
            overlay.style.opacity = '1';

            // Hold 150ms then resolve
            setTimeout(() => {
              overlay.style.transition = 'opacity 600ms ease-out';
              overlay.style.opacity = '0';
              setTimeout(() => { overlay.remove(); resolve(); }, 620);
            }, 150);
          }, 300);
          return; // stop rAF
        }

        animFrame = requestAnimationFrame(draw);
      };

      animFrame = requestAnimationFrame(draw);

      // Safety: never block more than 7s total
      setTimeout(() => {
        cancelAnimationFrame(animFrame);
        if (!allLocked) { overlay.remove(); resolve(); }
      }, 7000);
    });
  }
}
