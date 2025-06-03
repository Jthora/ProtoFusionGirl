// Touch input abstraction
export class TouchInput {
  private left: boolean = false;
  private right: boolean = false;
  private jump: boolean = false;

  constructor(scene: Phaser.Scene) {
    // UI components should call setLeft/Right/Jump
  }

  setLeft(down: boolean) { this.left = down; }
  setRight(down: boolean) { this.right = down; }
  setJump(down: boolean) { this.jump = down; }

  getDirection(): number {
    if (this.left) return -1;
    if (this.right) return 1;
    return 0;
  }

  isJumpPressed(): boolean {
    return this.jump;
  }
}
