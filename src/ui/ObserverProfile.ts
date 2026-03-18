/**
 * ObserverProfile — Stage 5.2
 *
 * Displays the operator's cumulative observation record in PsiSys Kernel style.
 * Three sections: TIMELINE RECORD / INTERVENTION RECORD / JANE STATUS
 *
 * Pure DOM overlay — no Phaser dependency.
 *
 * Usage:
 *   await ObserverProfile.show();
 */

import { SessionPersistence } from '../save/SaveSystem';

const C = {
  bg:       '#0d0e10',
  amber:    '#FF8C00',
  amberDim: 'rgba(255,140,0,0.45)',
  border:   'rgba(255,140,0,0.35)',
  text:     '#e8e4dc',
  dim:      '#5a5e66',
  positive: '#c8e88a',
  warn:     '#ffb347',
  critical: '#ff5c5c',
  rule:     '#2a2e36',
} as const;

function formatDuration(ms: number): string {
  if (ms <= 0 || isNaN(ms)) return '—';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

function formatDate(ts: number | null | undefined): string {
  if (!ts) return '—';
  return new Date(ts).toISOString().replace('T', '  ').substring(0, 19);
}

export class ObserverProfile {
  static show(): Promise<void> {
    return new Promise(resolve => {
      const session = SessionPersistence.load();
      const callsign = session?.callsign ?? 'UNREGISTERED';
      const stats    = session?.stats;

      // ── Shell ──────────────────────────────────────────────────────────────
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.78);
        display: flex; align-items: center; justify-content: center;
        z-index: 76000;
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
        box-shadow: 0 0 20px rgba(255,140,0,0.1);
        padding: 28px 32px 24px;
        width: min(500px, calc(100vw - 40px));
        max-height: calc(100vh - 80px);
        overflow-y: auto;
      `;
      overlay.appendChild(panel);

      // ── Helper renderers ───────────────────────────────────────────────────
      const addHeader = (text: string) => {
        const d = document.createElement('div');
        d.style.cssText = `font-size:9px;letter-spacing:3px;color:${C.amberDim};margin-bottom:3px;`;
        d.textContent = text;
        panel.appendChild(d);
      };

      const addTitle = (text: string) => {
        const d = document.createElement('div');
        d.style.cssText = `font-size:15px;letter-spacing:2px;color:${C.amber};margin-bottom:16px;`;
        d.textContent = text;
        panel.appendChild(d);
      };

      const addRule = () => {
        const d = document.createElement('div');
        d.style.cssText = `height:1px;background:${C.rule};margin:12px 0;`;
        panel.appendChild(d);
      };

      const addSectionLabel = (text: string) => {
        const d = document.createElement('div');
        d.style.cssText = `font-size:9px;letter-spacing:2.5px;color:${C.amberDim};margin:14px 0 8px;`;
        d.textContent = `── ${text}`;
        panel.appendChild(d);
      };

      const addRow = (label: string, value: string, valueColor: string = C.text) => {
        const r = document.createElement('div');
        r.style.cssText = `
          display:flex;justify-content:space-between;
          font-size:11px;letter-spacing:0.5px;margin:3px 0;
        `;
        const l = document.createElement('span');
        l.style.color = C.dim;
        l.textContent = label;
        const v = document.createElement('span');
        v.style.color = valueColor;
        v.textContent = value;
        r.appendChild(l);
        r.appendChild(v);
        panel.appendChild(r);
      };

      // ── Render content ─────────────────────────────────────────────────────
      addHeader('PSISYS KERNEL');
      addTitle('OBSERVER PROFILE');
      addRule();

      addRow('CALLSIGN', callsign, C.amber);
      addRow('REGISTERED', formatDate(session?.registeredAt));
      addRow('LAST OBSERVATION', formatDate(session?.lastSessionStart));

      // ── TIMELINE RECORD ────────────────────────────────────────────────────
      addSectionLabel('TIMELINE RECORD');

      addRow('TOTAL SESSIONS',        String(stats?.totalSessions ?? 0));
      addRow('TIMELINES CORRECTED',   String(stats?.timelinesCorreected ?? 0),  C.positive);
      addRow('TIMELINES FAILED',      String(stats?.timelinesFailed ?? 0),
        (stats?.timelinesFailed ?? 0) > 0 ? C.warn : C.dim);
      addRow('TIMELINE DELTA (CUMULATIVE)', (() => {
        // Estimate from session data if available
        const d = session?.lastTimelineDelta;
        if (d == null) return '—';
        return `${d >= 0 ? '+' : ''}${d.toFixed(3)}`;
      })(), (() => {
        const d = session?.lastTimelineDelta ?? 0;
        return d > 0 ? C.positive : d < -0.01 ? C.critical : C.dim;
      })());

      // ── INTERVENTION RECORD ────────────────────────────────────────────────
      addSectionLabel('INTERVENTION RECORD');

      addRow('GUIDANCE PULSES DELIVERED', String(stats?.guidancePulsesDelivered ?? 0));
      addRow('LEY LINES RESTORED',        String(stats?.leyLinesRestored ?? 0), C.positive);
      addRow('NEFARIUM NODES DISRUPTED',  String(stats?.nefariumNodesDisrupted ?? 0), C.positive);
      addRow('BEU BONDS FACILITATED',     String(stats?.beuBondsFacilitated ?? 0), C.positive);

      // ── JANE STATUS ────────────────────────────────────────────────────────
      addSectionLabel('JANE STATUS');

      const lastCoherence = session?.lastJaneCoherence ?? 100;
      addRow('LAST COHERENCE READING',
        lastCoherence > 0 ? `${Math.round(lastCoherence)}%` : '—',
        lastCoherence < 30 ? C.critical : lastCoherence < 60 ? C.warn : C.positive);
      addRow('PEAK COHERENCE OBSERVED',
        (stats?.peakCoherenceObserved ?? 0) > 0 ? `${Math.round(stats!.peakCoherenceObserved)}%` : '—',
        C.positive);
      addRow('COHERENCE COLLAPSES',
        String(stats?.coherenceCollapses ?? 0),
        (stats?.coherenceCollapses ?? 0) > 0 ? C.warn : C.dim);
      addRow('LAST ANCHOR',
        session?.lastAnchorDescription ?? '—');
      addRow('LAST LEYLINE STABILITY',
        session?.lastLeylineStability != null ? `${Math.round(session.lastLeylineStability)}%` : '—',
        (session?.lastLeylineStability ?? 72) < 35 ? C.critical
          : (session?.lastLeylineStability ?? 72) < 60 ? C.warn : C.positive);
      addRow('NEFARIUM ACTIVITY',
        session?.lastNefariumActivity ?? '—',
        session?.lastNefariumActivity === 'critical' ? C.critical
          : session?.lastNefariumActivity === 'elevated' ? C.warn : C.dim);

      addRule();

      // ── Close button ───────────────────────────────────────────────────────
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
        margin: 0 auto;
      `;
      closeBtn.textContent = '[ CLOSE ]';

      const dismiss = () => {
        overlay.style.transition = 'opacity 180ms ease-out';
        overlay.style.opacity = '0';
        document.removeEventListener('keydown', onKey);
        setTimeout(() => { overlay.remove(); resolve(); }, 200);
      };

      closeBtn.addEventListener('click', dismiss);
      panel.appendChild(closeBtn);

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') dismiss();
      };
      document.addEventListener('keydown', onKey);
    });
  }
}
