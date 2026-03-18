// ModalManager.ts
// Centralized modal queue and overlay manager to prevent popup clutter
// Keeps only one modal visible at a time; additional modals are queued.

import Phaser from 'phaser';

export type ModalTask = {
  id?: string;
  run: (close: () => void) => void;
};

export class ModalManager {
  private scene: Phaser.Scene;
  private current?: { id?: string; cleanup: () => void } & { id?: string };
  private queue: ModalTask[] = [];
  private overlay?: Phaser.GameObjects.Rectangle;
  private overlayDepth = 2999; // Just under UILayout overlays depth 3000

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Optional: attach an overlay to the UILayout overlays zone
  public attachToLayout(depth?: number) {
    if (typeof depth === 'number') this.overlayDepth = depth;
  }

  public isShowing(): boolean {
    return !!this.current;
  }

  public enqueue(task: ModalTask) {
    // If same id as current or queued, drop duplicates (basic de-dupe)
    if (task.id) {
      if (this.current?.id === task.id) return;
      if (this.queue.some(t => t.id === task.id)) return;
    }
    this.queue.push(task);
    this.maybeRunNext();
  }

  public showContainer(container: Phaser.GameObjects.Container, opts?: { id?: string; dismissOnEsc?: boolean }) {
    this.enqueue({
      id: opts?.id,
      run: (close) => {
        this.showOverlay();
        // Ensure UI depth and no scroll
        (container as any).setScrollFactor?.(0);
        (container as any).setDepth?.(this.overlayDepth + 1);
        this.scene.add.existing(container);

        const escHandler = (ev: KeyboardEvent) => {
          if (opts?.dismissOnEsc !== false && ev.key === 'Escape') close();
        };
        window.addEventListener('keydown', escHandler);

        const cleanup = () => {
          try { container.destroy(); } catch { /* noop */ }
          window.removeEventListener('keydown', escHandler);
          this.hideOverlay();
        };
        this.current = { id: opts?.id, cleanup } as any;
      }
    });
  }

  public showTextModal(message: string, opts?: { id?: string; autoCloseMs?: number }) {
    this.enqueue({
      id: opts?.id,
      run: (close) => {
        this.showOverlay(0.6);
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;
        const bg = this.scene.add.rectangle(centerX, centerY, 520, 160, 0x000000, 0.8).setDepth(this.overlayDepth + 1).setScrollFactor(0);
        const text = this.scene.add.text(centerX, centerY, message, {
          fontSize: '20px', color: '#ff0', align: 'center', wordWrap: { width: 480 }, backgroundColor: '#00000066', padding: { x: 12, y: 8 }
        }).setOrigin(0.5).setDepth(this.overlayDepth + 2).setScrollFactor(0);

        const cleanup = () => { bg.destroy(); text.destroy(); this.hideOverlay(); };
        this.current = { id: opts?.id, cleanup } as any;

        const delay = Math.max(0, opts?.autoCloseMs ?? 1800);
        this.scene.time.delayedCall(delay, () => close());
      }
    });
  }

  public closeCurrent() {
    if (this.current) {
      const c = this.current;
      this.current = undefined;
      c.cleanup();
      this.maybeRunNext();
    }
  }

  private maybeRunNext() {
    if (this.current || this.queue.length === 0) return;
    const next = this.queue.shift()!;
    const close = () => this.closeCurrent();
    next.run(close);
  }

  private showOverlay(alpha: number = 0.4) {
    if (!this.overlay) {
      this.overlay = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0x000000, alpha)
        .setOrigin(0)
        .setDepth(this.overlayDepth)
        .setScrollFactor(0)
        .setInteractive();
    } else {
      this.overlay.setAlpha(alpha);
      this.overlay.setVisible(true);
    }
  }

  private hideOverlay() {
    if (this.overlay) {
      this.overlay.setVisible(false);
    }
  }
}
