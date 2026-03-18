// InteractionDiagnostics.ts
// Lightweight overlay for pointer + key state & EventBus listener keys.
// Activated with ?diag=1 (query string) or via manual instantiation; toggle visibility with F9.

import { EventBus } from '../core/EventBus';

export class InteractionDiagnostics {
  private scene: Phaser.Scene;
  private eventBus: EventBus;
  private text: Phaser.GameObjects.Text;
  private keys: Set<string> = new Set();
  private lastUpdate = 0;
  private interval = 250;

  constructor(scene: Phaser.Scene, eventBus: EventBus) {
    this.scene = scene;
    this.eventBus = eventBus;
    this.text = scene.add.text(8, 8, 'diag', { fontSize: '12px', color: '#00ffcc', backgroundColor: '#002222', padding: { x: 6, y: 4 } })
      .setDepth(50000)
      .setScrollFactor(0)
      .setAlpha(0.85);

    scene.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      this.keys.add(e.key);
      if (e.key === 'F9') this.text.setVisible(!this.text.visible);
    });
    scene.input.keyboard?.on('keyup', (e: KeyboardEvent) => this.keys.delete(e.key));
    scene.events.on('update', this.update, this);
  }

  private update() {
    const now = performance.now();
    if (now - this.lastUpdate < this.interval) return;
    this.lastUpdate = now;
    const p = this.scene.input.activePointer;
    let listeners = '';
    try {
      const internal: any = this.eventBus as any;
      if (internal.listeners) listeners = Object.keys(internal.listeners).slice(0, 6).join(',');
    } catch { /* ignore */ }
    this.text.setText(
      `PTR ${Math.round(p.x)},${Math.round(p.y)} d:${p.isDown ? 1 : 0}\n` +
      `KEYS ${Array.from(this.keys).slice(0, 8).join(' ')}\n` +
      (listeners ? `EVT ${listeners}` : '')
    );
  }
}
