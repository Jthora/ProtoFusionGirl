// TileSpriteFactory.ts
// Responsible for creating and configuring tile sprites for the world (frames, physics, etc.)
import Phaser from 'phaser';

export type TileType = 'grass' | 'dirt' | 'stone' | 'air';

export class TileSpriteFactory {
  static createTileSprite(scene: Phaser.Scene, x: number, y: number, tileType: TileType): Phaser.GameObjects.Sprite {
    const sprite = scene.add.sprite(x, y, 'tiles');
    // Set frame based on tile type
    switch (tileType) {
      case 'grass':
        sprite.setFrame(0);
        break;
      case 'dirt':
        sprite.setFrame(1);
        break;
      case 'stone':
        sprite.setFrame(2);
        break;
      default:
        sprite.setFrame(1);
    }
    return sprite;
  }
}
