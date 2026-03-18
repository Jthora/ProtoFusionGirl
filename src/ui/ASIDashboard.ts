// ASIDashboard.ts
// Persistent DOM-based ASI operator dashboard — always visible, always degrading.
// Shows: Jane status, trust level, node stability panel, timeline recording indicator.

import { EventBus } from '../core/EventBus';

export interface NodeStabilityEntry {
  id: string;
  name: string;
  stability: number;
  maxStability: number;
}

export class ASIDashboard {
  private el: HTMLElement;
  private statusEl!: HTMLElement;
  private trustEl!: HTMLElement;
  private nodesEl!: HTMLElement;
  private nodes: NodeStabilityEntry[] = [];
  private trustLevel = 50;
  private janeGuided = false;
  private unsubscribers: (() => void)[] = [];

  constructor(private eventBus: EventBus) {
    this.el = document.createElement('div');
    this.el.id = 'pfg-asi-dashboard';
    this.el.style.cssText = `
      position: fixed;
      top: 12px;
      left: 12px;
      z-index: 5000;
      background: rgba(0, 8, 16, 0.85);
      border: 1px solid #003333;
      padding: 10px 14px;
      font-family: monospace;
      font-size: 11px;
      color: #006666;
      line-height: 1.7;
      pointer-events: none;
      min-width: 210px;
    `;

    this.build();
    document.body.appendChild(this.el);
    this.wireEvents();
  }

  private build(): void {
    // Recording indicator
    const rec = document.createElement('div');
    rec.style.cssText = 'font-size: 10px; color: #003333; margin-bottom: 6px; letter-spacing: 1px;';
    rec.innerHTML = '<span style="color:#330000">&#9679;</span> TIMELINE RECORDING';
    this.el.appendChild(rec);

    // Jane status line
    this.statusEl = document.createElement('div');
    this.statusEl.style.cssText = 'color: #00ffcc; font-size: 12px; margin-bottom: 4px;';
    this.el.appendChild(this.statusEl);

    // Trust level
    this.trustEl = document.createElement('div');
    this.trustEl.style.marginBottom = '8px';
    this.el.appendChild(this.trustEl);

    // Divider
    const divider = document.createElement('div');
    divider.style.cssText = 'border-top: 1px solid #002222; margin-bottom: 6px;';
    this.el.appendChild(divider);

    // Node stability panel
    this.nodesEl = document.createElement('div');
    this.el.appendChild(this.nodesEl);

    this.renderStatus();
    this.renderTrust();
    this.renderNodes();
  }

  private renderStatus(): void {
    this.statusEl.textContent = this.janeGuided
      ? 'GUIDED \u2014 Jane navigating'
      : 'AUTONOMOUS \u2014 Jane unguided';
  }

  private renderTrust(): void {
    const arrow = this.trustLevel >= 50 ? '\u25b2' : '\u25bc';
    const color = this.trustLevel >= 60 ? '#00cc66' : this.trustLevel >= 30 ? '#cccc00' : '#cc3300';
    this.trustEl.innerHTML =
      `<span style="color:#004444">TRUST </span>` +
      `<span style="color:${color}">${this.trustLevel}% ${arrow}</span>`;
  }

  private renderNodes(): void {
    if (this.nodes.length === 0) {
      this.nodesEl.innerHTML = '';
      return;
    }
    this.nodesEl.innerHTML = this.nodes
      .map(n => {
        const pct = Math.round((n.stability / n.maxStability) * 100);
        const warn = pct <= 35 ? ' <span style="color:#cc2200">\u26a0</span>' : '';
        const color = pct > 60 ? '#004444' : pct > 30 ? '#664400' : '#660000';
        return `<div style="color:${color}">${n.name.toUpperCase()} ${pct}%${warn}</div>`;
      })
      .join('');
  }

  addNode(node: NodeStabilityEntry): void {
    const existing = this.nodes.findIndex(n => n.id === node.id);
    if (existing >= 0) {
      this.nodes[existing] = node;
    } else {
      this.nodes.push(node);
    }
    this.renderNodes();
  }

  setTrust(level: number): void {
    this.trustLevel = Math.round(level);
    this.renderTrust();
  }

  setJaneGuided(guided: boolean): void {
    this.janeGuided = guided;
    this.renderStatus();
  }

  private wireEvents(): void {
    this.unsubscribers.push(
      this.eventBus.on('NODE_STABILITY_CHANGED', (event) => {
        const existing = this.nodes.find(n => n.id === event.data.nodeId);
        if (existing) {
          existing.stability = event.data.newStability;
          this.renderNodes();
        }
      })
    );

    this.unsubscribers.push(
      this.eventBus.on('TRUST_CHANGED', (event) => {
        this.setTrust(event.data.currentLevel ?? this.trustLevel);
      })
    );

    this.unsubscribers.push(
      this.eventBus.on('ASI_WAYPOINT_PLACED', () => {
        this.setJaneGuided(true);
      })
    );

    this.unsubscribers.push(
      this.eventBus.on('JANE_ARRIVED_AT_WAYPOINT', () => {
        this.setJaneGuided(false);
      })
    );

    this.unsubscribers.push(
      this.eventBus.on('ASI_WAYPOINT_CLEARED', () => {
        this.setJaneGuided(false);
      })
    );
  }

  /**
   * Flash a temporary alert message on the dashboard.
   * @param text Message to display
   * @param color CSS color string (default: '#cc2200' red)
   * @param durationMs How long to show the alert before auto-clearing
   */
  showAlert(text: string, color = '#cc2200', durationMs = 5000): void {
    let alertEl = this.el.querySelector('#pfg-asi-alert') as HTMLElement | null;
    if (!alertEl) {
      alertEl = document.createElement('div');
      alertEl.id = 'pfg-asi-alert';
      alertEl.style.cssText = 'font-size: 11px; font-weight: bold; letter-spacing: 1px; margin-top: 6px; padding: 4px 0;';
      this.el.appendChild(alertEl);
    }
    alertEl.textContent = text;
    alertEl.style.color = color;
    clearTimeout((alertEl as any)._clearTimer);
    (alertEl as any)._clearTimer = setTimeout(() => {
      if (alertEl) alertEl.textContent = '';
    }, durationMs);
  }

  destroy(): void {
    this.unsubscribers.forEach(u => u());
    this.el.remove();
  }
}
