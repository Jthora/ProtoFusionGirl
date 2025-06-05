import Phaser from 'phaser';

/**
 * UniversalLanguagePuzzleModal: Simple symbol alignment puzzle for anchor gating.
 * Replace with more advanced logic as needed.
 */
export class UniversalLanguagePuzzleModal extends Phaser.GameObjects.Container {
  private onComplete: (success: boolean) => void;
  private closeBtn: Phaser.GameObjects.Text;
  private puzzleText: Phaser.GameObjects.Text;
  private solution: string;
  private input: string;

  constructor(scene: Phaser.Scene, onComplete: (success: boolean) => void) {
    super(scene);
    this.onComplete = onComplete;
    this.solution = '△○□'; // Example: triangle, circle, square
    this.input = '';
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
    // Close button
    this.closeBtn = scene.add.text(120, 0, '[X]', { color: '#ff4444', fontSize: '16px' })
      .setInteractive()
      .on('pointerdown', () => this.close(false));
    this.add(this.closeBtn);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(2001);
    this.setPosition(60, 60);
  }

  private addSymbol(sym: string) {
    this.input += sym;
    this.puzzleText.setText(`Align the symbols: △○□\nYour input: ${this.input}`);
  }

  private submit() {
    const success = this.input === this.solution;
    this.close(success);
  }

  private close(success: boolean) {
    this.destroy();
    this.onComplete(success);
  }
}
