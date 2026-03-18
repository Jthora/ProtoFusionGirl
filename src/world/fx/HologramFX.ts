// HologramFX.ts
// Hologram visual effect for Jono's briefing sprite.
// Composites a scanline overlay over the character sprite
// and handles flicker + disappear transitions.

export class HologramFX {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private scanlines: Phaser.GameObjects.TileSprite | null = null;
  private flickerTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite) {
    this.scene = scene;
    this.sprite = sprite;
    // Hologram base appearance
    this.sprite.setAlpha(0.6);
    this.sprite.setTint(0x00e5ff);
  }

  /** Start the ambient flicker loop and add scanline overlay. */
  appear(): void {
    this.buildScanlines();
    this.startFlicker();
  }

  private buildScanlines(): void {
    if (this.scanlines) return;
    // Ensure scanline texture
    if (!this.scene.textures.exists('scanline_tile')) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false } as any);
      g.fillStyle(0x000000, 0.3);
      g.fillRect(0, 2, 1, 1); // 1×4 tile: 2px gap, 1px dark line, 1px gap
      g.generateTexture('scanline_tile', 1, 4);
      g.destroy();
    }
    const b = this.sprite.getBounds();
    this.scanlines = this.scene.add.tileSprite(
      this.sprite.x - b.width / 2,
      this.sprite.y - b.height / 2,
      b.width, b.height,
      'scanline_tile'
    ).setOrigin(0, 0).setAlpha(0.3).setScrollFactor(this.sprite.scrollFactorX, this.sprite.scrollFactorY);
  }

  private startFlicker(): void {
    this.killFlicker();
    this.flickerTween = this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.3, to: 0.5 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** Rapid glitch flash, then fade to invisible. */
  disappear(onComplete?: () => void): void {
    this.killFlicker();

    // Rapid glitch
    let glitchCount = 0;
    const glitch = this.scene.time.addEvent({
      delay: 60,
      repeat: 5,
      callback: () => {
        this.sprite.setAlpha(glitchCount % 2 === 0 ? 0 : 0.6);
        glitchCount++;
      },
    });

    this.scene.time.delayedCall(420, () => {
      glitch.destroy();
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0,
        duration: 300,
        ease: 'Linear',
        onComplete: () => {
          this.destroyScanlines();
          onComplete?.();
        },
      });
    });
  }

  private killFlicker(): void {
    if (this.flickerTween) {
      this.flickerTween.stop();
      this.flickerTween = null;
    }
  }

  private destroyScanlines(): void {
    if (this.scanlines) {
      this.scanlines.destroy();
      this.scanlines = null;
    }
  }

  destroy(): void {
    this.killFlicker();
    this.destroyScanlines();
  }
}
