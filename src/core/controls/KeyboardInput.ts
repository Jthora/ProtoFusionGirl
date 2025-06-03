// Keyboard input abstraction
export class KeyboardInput {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: Phaser.Scene) {
    this.cursors = scene.input.keyboard.createCursorKeys();
  }

  getDirection(): number {
    if (this.cursors.left?.isDown) return -1;
    if (this.cursors.right?.isDown) return 1;
    return 0;
  }

  isJumpPressed(): boolean {
    return !!this.cursors.up?.isDown;
  }
}
