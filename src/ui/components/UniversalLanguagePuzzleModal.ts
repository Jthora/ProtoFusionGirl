import Phaser from 'phaser';
import { ulEventBus, ULEventPayload } from '../../ul/ulEventBus';

/**
 * UniversalLanguagePuzzleModal: Simple symbol alignment puzzle for anchor gating.
 * Replace with more advanced logic as needed.
 */
export class UniversalLanguagePuzzleModal extends Phaser.GameObjects.Container {
  private onComplete: (success: boolean) => void;
  private closeBtn: Phaser.GameObjects.Text;
  private puzzleText: Phaser.GameObjects.Text;
  private solution: string;
  private userInput: string;
  private feedbackText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, onComplete: (success: boolean) => void) {
    super(scene);
    this.onComplete = onComplete;
    this.solution = '△○□'; // Example: triangle, circle, square
    this.userInput = '';
    this.puzzleText = scene.add.text(0, 0, 'Align the symbols: △○□', { color: '#fff', fontSize: '18px' });
    this.add(this.puzzleText);
    // Input buttons
    const symbols = ['△', '○', '□'];
    symbols.forEach((sym, i) => {
      const btn = scene.add.text(0, 40 + i * 32, `[${sym}]`, { color: '#00ffcc', fontSize: '20px' })
        .setInteractive()
        .on('pointerdown', () => this.addSymbol(sym));
      this.add(btn);
    });
    // Submit button
    const submitBtn = scene.add.text(0, 140, '[Submit]', { color: '#ffcc00', fontSize: '18px' })
      .setInteractive()
      .on('pointerdown', () => this.submit());
    this.add(submitBtn);
    // Feedback text
    this.feedbackText = scene.add.text(0, 180, '', { color: '#ff8888', fontSize: '16px' });
    this.add(this.feedbackText);
    // Close button
    this.closeBtn = scene.add.text(120, 0, '[X]', { color: '#ff4444', fontSize: '16px' })
      .setInteractive()
      .on('pointerdown', () => this.close(false));
    this.add(this.closeBtn);
    this.setScrollFactor(0);
    this.setDepth(2001);
    this.setPosition(60, 60);
    // Listen for UL events
    ulEventBus.on('ul:puzzle:validated', this.handleValidationEvent);
    ulEventBus.on('ul:puzzle:completed', this.handleCompletedEvent);
  }

  private addSymbol(sym: string) {
    this.userInput += sym;
    this.puzzleText.setText(`Align the symbols: △○□\nYour input: ${this.userInput}`);
    this.feedbackText.setText('');
  }

  private submit() {
    const success = this.userInput === this.solution;
    if (success) {
      ulEventBus.emit('ul:puzzle:completed', { id: 'demo', time: Date.now(), stats: { input: this.userInput } });
    } else {
      ulEventBus.emit('ul:puzzle:validated', { id: 'demo', result: false, errors: ['Incorrect sequence.'] });
    }
    // Do not close immediately; wait for event feedback
  }

  private handleValidationEvent = (payload: ULEventPayload) => {
    if (payload.result === false && payload.errors) {
      this.feedbackText.setText(`Error: ${payload.errors.join(', ')}`);
    }
  };

  private handleCompletedEvent = (_payload: ULEventPayload) => {
    this.feedbackText.setColor('#00ff88');
    this.feedbackText.setText('Puzzle solved!');
    this.scene.time.delayedCall(1000, () => this.close(true));
  };

  private close(success: boolean) {
    ulEventBus.off('ul:puzzle:validated', this.handleValidationEvent);
    ulEventBus.off('ul:puzzle:completed', this.handleCompletedEvent);
    this.destroy();
    this.onComplete(success);
  }
}
