// SpriteFactoryScene.ts — Phaser preview scene for the Sprite Factory.
import type { CharacterEntry } from './CatalogLoader';

export class SpriteFactoryScene extends Phaser.Scene {
  private previewSprite!: Phaser.GameObjects.Sprite;
  private currentCharacter = '';
  private infoOverlay!: HTMLElement;

  constructor(private catalog: CharacterEntry[]) {
    super({ key: 'SpriteFactory' });
  }

  preload(): void {
    for (const char of this.catalog) {
      this.load.atlas(char.atlasKey, char.atlasUrl, char.atlasJsonUrl);
    }
  }

  create(): void {
    // Checkerboard background (shows alpha)
    this.add.grid(400, 300, 800, 600, 16, 16, 0x222244, 1, 0x1a1a3e, 1);

    const firstChar = this.catalog[0];
    this.currentCharacter = firstChar?.id ?? '';

    this.previewSprite = this.add.sprite(400, 300, this.currentCharacter || '__missing')
      .setScale(2);

    this.infoOverlay = document.getElementById('info-overlay')!;

    window.addEventListener('pfg:select-animation', (e: Event) => {
      const { character, animKey, fps } = (e as CustomEvent).detail;
      this.playAnimation(character, animKey, fps);
    });
  }

  playAnimation(charId: string, animKey: string, fps: number): void {
    if (this.currentCharacter !== charId) {
      this.previewSprite.setTexture(charId);
      this.currentCharacter = charId;
    }

    if (!this.anims.exists(animKey)) {
      const frameKeys = this.textures.get(charId).getFrameNames()
        .filter((k: string) => k.startsWith(animKey + '_'))
        .sort();

      if (frameKeys.length === 0) {
        console.warn(`[SpriteFactory] No frames found for ${animKey}`);
        return;
      }

      this.anims.create({
        key: animKey,
        frames: frameKeys.map((f: string) => ({ key: charId, frame: f })),
        frameRate: fps,
        repeat: -1,
      });
    }

    this.previewSprite.play(animKey, true);
  }

  update(): void {
    const anim = this.previewSprite?.anims;
    if (anim?.isPlaying && this.infoOverlay) {
      const frameIdx  = anim.currentFrame?.index ?? 0;
      const frameTotal = anim.currentAnim?.frames.length ?? 0;
      const fps       = anim.currentAnim?.frameRate ?? 0;
      const key       = anim.currentAnim?.key ?? '';
      this.infoOverlay.innerHTML =
        `${key}<br>Frame: ${frameIdx} / ${frameTotal}<br>FPS: ${fps}`;
    }
  }
}
