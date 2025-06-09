// LeyLineStabilizationModal.ts
// UI modal for player/AI ley line stabilization/escalation interaction
// Artifact-driven: leyline_instability_event_design_2025-06-08.artifact

import Phaser from 'phaser';
import { LeyLineInstabilityEvent } from '../../world/leyline/types';

export class LeyLineStabilizationModal extends Phaser.GameObjects.Container {
  private progressBar: Phaser.GameObjects.Rectangle;
  private progressText: Phaser.GameObjects.Text;
  private stabilizeBtn: Phaser.GameObjects.Text;
  private escalateBtn: Phaser.GameObjects.Text;
  private feedbackText: Phaser.GameObjects.Text;
  private onStabilize: () => void;
  private onEscalate: () => void;
  private progress: number = 0;
  private interval?: Phaser.Time.TimerEvent;

  constructor(
    scene: Phaser.Scene,
    event: LeyLineInstabilityEvent,
    onStabilize: () => void,
    onEscalate: () => void
  ) {
    super(scene, scene.scale.width / 2, scene.scale.height / 2);
    this.onStabilize = onStabilize;
    this.onEscalate = onEscalate;
    this.setDepth(2001);
    this.setScrollFactor(0);

    // Modal background
    const bg = scene.add.rectangle(0, 0, 420, 220, 0x222244, 0.97).setOrigin(0.5);
    this.add(bg);

    // Title
    const title = scene.add.text(0, -90, 'Ley Line Instability Detected!', {
      fontSize: '22px', color: '#ff0', fontStyle: 'bold', backgroundColor: '#222244', padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
    this.add(title);

    // Ley line info
    const info = scene.add.text(0, -55, `Ley Line: ${event.leyLineId}\nSeverity: ${event.severity}`, {
      fontSize: '16px', color: '#fff', align: 'center', wordWrap: { width: 380 }
    }).setOrigin(0.5);
    this.add(info);

    // Progress bar background
    const pbBg = scene.add.rectangle(0, 0, 320, 28, 0x444466, 0.8).setOrigin(0.5);
    this.add(pbBg);
    // Progress bar
    this.progressBar = scene.add.rectangle(-160, 0, 0, 24, 0x00ff88, 0.95).setOrigin(0, 0.5);
    this.add(this.progressBar);
    // Progress text
    this.progressText = scene.add.text(0, 0, '0%', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    this.add(this.progressText);

    // Stabilize button
    this.stabilizeBtn = scene.add.text(-80, 60, '[Stabilize]', {
      fontSize: '18px', color: '#00ff88', backgroundColor: '#222', padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.handleStabilize());
    this.add(this.stabilizeBtn);
    // Escalate button
    this.escalateBtn = scene.add.text(80, 60, '[Escalate]', {
      fontSize: '18px', color: '#ff4444', backgroundColor: '#222', padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.handleEscalate());
    this.add(this.escalateBtn);

    // Feedback text
    this.feedbackText = scene.add.text(0, 100, '', { fontSize: '16px', color: '#ff0' }).setOrigin(0.5);
    this.add(this.feedbackText);
  }

  private handleStabilize() {
    this.stabilizeBtn.disableInteractive();
    this.escalateBtn.disableInteractive();
    this.feedbackText.setText('Stabilizing ley line...');
    this.progress = 0;
    this.interval = this.scene.time.addEvent({
      delay: 60,
      repeat: 49,
      callback: () => {
        this.progress += 2;
        this.updateProgress();
        if (this.progress >= 100) {
          this.feedbackText.setText('Ley line stabilized!');
          this.onStabilize();
          this.scene.time.delayedCall(900, () => this.destroy());
        }
      }
    });
  }

  private handleEscalate() {
    this.stabilizeBtn.disableInteractive();
    this.escalateBtn.disableInteractive();
    this.feedbackText.setText('Escalating instability...');
    this.scene.time.delayedCall(900, () => {
      this.onEscalate();
      this.destroy();
    });
  }

  private updateProgress() {
    this.progressBar.width = 3.2 * this.progress;
    this.progressText.setText(`${this.progress}%`);
  }

  destroy() {
    this.interval?.remove();
    super.destroy();
  }
}
