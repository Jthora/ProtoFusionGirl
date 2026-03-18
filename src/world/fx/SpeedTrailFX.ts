// SpeedTrailFX.ts
// Ghost-sprite speed trail for supersonic movement.
// Captures 5 ghost frames of the player sprite, applies cyan tint + fading alpha.

export class SpeedTrailFX {
  private ghosts: Phaser.GameObjects.Sprite[] = [];
  private scene: Phaser.Scene;
  private frameCount = 0;
  private active = false;
  private readonly GHOST_COUNT = 5;
  private readonly CAPTURE_EVERY = 3; // frames

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Activate the trail. Call once when supersonic tier begins. */
  activate(textureKey: string, frame?: string | number): void {
    if (this.active) return;
    this.active = true;
    for (let i = 0; i < this.GHOST_COUNT; i++) {
      const ghost = this.scene.add.sprite(0, 0, textureKey, frame)
        .setAlpha(0)
        .setTint(0x00e5ff)
        .setDepth(-1); // render behind player
      this.ghosts.push(ghost);
    }
  }

  /** Deactivate and hide all ghosts. */
  deactivate(): void {
    this.active = false;
    for (const g of this.ghosts) {
      g.setAlpha(0);
    }
  }

  /**
   * Call every game frame from the update loop.
   * @param source The player sprite to track.
   */
  update(source: Phaser.GameObjects.Sprite): void {
    if (!this.active) return;
    this.frameCount++;
    if (this.frameCount % this.CAPTURE_EVERY !== 0) return;

    // Shift ghosts: ghost[0] is oldest, ghost[N-1] is newest
    for (let i = 0; i < this.GHOST_COUNT - 1; i++) {
      const newer = this.ghosts[i + 1];
      const older = this.ghosts[i];
      older.setPosition(newer.x, newer.y);
      older.setTexture(newer.texture.key, newer.frame.name);
      // Alpha fades from 0.1 (oldest) to 0.5 (newest)
      older.setAlpha(newer.alpha);
    }

    // Capture current source state into newest ghost
    const newest = this.ghosts[this.GHOST_COUNT - 1];
    newest.setPosition(source.x, source.y);
    newest.setTexture(source.texture.key, source.frame.name);
    newest.setFlipX(source.flipX);
    newest.setAlpha(0.5);

    // Re-apply decaying alpha along chain
    for (let i = 0; i < this.GHOST_COUNT; i++) {
      this.ghosts[i].setAlpha(0.1 + (i / this.GHOST_COUNT) * 0.4);
    }
  }

  destroy(): void {
    for (const g of this.ghosts) {
      g.destroy();
    }
    this.ghosts = [];
  }
}
