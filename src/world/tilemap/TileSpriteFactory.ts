// TileSpriteFactory.ts
// Responsible for creating and configuring tile sprites for the world (frames, physics, etc.)
import Phaser from 'phaser';
import { TileRegistry, TileDefinition } from './TileRegistry';

export type TileType = 'grass' | 'dirt' | 'stone' | 'air' | 'water' | 'sand' | 'wood' | 'metal' | 'crystal' | 'lava' | 'ice' | 'leyline_node';

export class TileSpriteFactory {
  private static tileRegistry: TileRegistry | null = null;

  static setTileRegistry(registry: TileRegistry) {
    TileSpriteFactory.tileRegistry = registry;
  }

  static createTileSprite(scene: Phaser.Scene, x: number, y: number, tileType: TileType): Phaser.GameObjects.Sprite {
    // Check if tilesheet texture exists before creating sprite
    if (!scene.textures.exists('tilesheet')) {
      console.warn(`TileSpriteFactory: 'tilesheet' texture not found, cannot create ${tileType} sprite`);
      // Return a placeholder colored rectangle instead
      const rect = scene.add.rectangle(x, y, 32, 32, 0x808080);
      return rect as any; // Cast for compatibility
    }

    // Create base sprite
    const sprite = scene.add.sprite(x, y, 'tilesheet');
    
    // Get tile definition from registry
    const tileDefinition = TileSpriteFactory.tileRegistry?.getTile(tileType);
    
    if (tileDefinition) {
      // Apply colors and visual properties from tile definition
      TileSpriteFactory.applyTileVisuals(sprite, tileDefinition);
    } else {
      // Fallback to legacy frame-based system
      TileSpriteFactory.applyLegacyFrame(sprite, tileType);
    }
    
    return sprite;
  }

  private static applyTileVisuals(sprite: Phaser.GameObjects.Sprite, tileDef: TileDefinition) {
    // Apply primary color tint
    if (tileDef.color !== undefined) {
      sprite.setTint(tileDef.color);
    }
    
    // Apply alpha/transparency
    if (tileDef.alpha !== undefined) {
      sprite.setAlpha(tileDef.alpha);
    }
    
    // Apply brightness by adjusting tint intensity
    if (tileDef.brightness !== undefined && tileDef.brightness !== 1.0) {
      const brightness = Math.max(0.1, Math.min(2.0, tileDef.brightness));
      // Apply brightness as a multiplicative tint
      if (tileDef.color !== undefined) {
        const r = ((tileDef.color >> 16) & 0xFF) * brightness;
        const g = ((tileDef.color >> 8) & 0xFF) * brightness;
        const b = (tileDef.color & 0xFF) * brightness;
        const adjustedColor = ((Math.min(255, r) << 16) | (Math.min(255, g) << 8) | Math.min(255, b));
        sprite.setTint(adjustedColor);
      }
    }
    
    // Set frame based on tile ID for texture variation
    const frameMap: Record<string, number> = {
      'air': 0,
      'grass': 1,
      'dirt': 2,
      'stone': 3,
      'water': 4,
      'sand': 5,
      'wood': 6,
      'metal': 7,
      'crystal': 8,
      'lava': 9,
      'ice': 10,
      'leyline_node': 11
    };
    
    const frame = frameMap[tileDef.id] || 0;
    
    // Safety check: Verify frame exists before setting it
    try {
      sprite.setFrame(frame);
    } catch (error) {
      console.warn(`Frame ${frame} not found for tile ${tileDef.id}, using frame 0. Error:`, error);
      sprite.setFrame(0);
    }
  }

  private static applyLegacyFrame(sprite: Phaser.GameObjects.Sprite, tileType: TileType) {
    // Legacy frame-based system with basic colors
    const safeSetFrame = (frame: number) => {
      try {
        sprite.setFrame(frame);
      } catch (error) {
        console.warn(`Legacy frame ${frame} not found for tile ${tileType}, using frame 0. Error:`, error);
        sprite.setFrame(0);
      }
    };

    switch (tileType) {
      case 'grass':
        safeSetFrame(1);
        sprite.setTint(0x32CD32); // Lime green
        break;
      case 'dirt':
        safeSetFrame(2);
        sprite.setTint(0x8B4513); // Saddle brown
        break;
      case 'stone':
        safeSetFrame(3);
        sprite.setTint(0x708090); // Slate gray
        break;
      case 'water':
        safeSetFrame(4);
        sprite.setTint(0x1E90FF); // Dodger blue
        sprite.setAlpha(0.7);
        break;
      case 'sand':
        safeSetFrame(5);
        sprite.setTint(0xF4A460); // Sandy brown
        break;
      case 'wood':
        safeSetFrame(6);
        sprite.setTint(0xA0522D); // Sienna
        break;
      case 'metal':
        safeSetFrame(7);
        sprite.setTint(0xC0C0C0); // Silver
        break;
      case 'crystal':
        safeSetFrame(8);
        sprite.setTint(0x9370DB); // Medium purple
        sprite.setAlpha(0.8);
        break;
      case 'lava':
        safeSetFrame(9);
        sprite.setTint(0xFF4500); // Orange red
        break;
      case 'ice':
        safeSetFrame(10);
        sprite.setTint(0xB0E0E6); // Powder blue
        sprite.setAlpha(0.9);
        break;
      case 'leyline_node':
        safeSetFrame(11);
        sprite.setTint(0x00FFCC); // Cyan
        sprite.setAlpha(0.8);
        break;
      case 'air':
      default:
        safeSetFrame(0);
        sprite.setTint(0x87CEEB); // Sky blue
        sprite.setAlpha(0.1);
        break;
    }
  }

  /**
   * Create a colored rectangle sprite for tiles without textures
   */
  static createColoredTileSprite(scene: Phaser.Scene, x: number, y: number, tileType: TileType, size: number = 32): Phaser.GameObjects.Rectangle {
    const tileDefinition = TileSpriteFactory.tileRegistry?.getTile(tileType);
    const color = tileDefinition?.color || 0x808080; // Default gray
    const alpha = tileDefinition?.alpha || 1.0;
    
    const rect = scene.add.rectangle(x, y, size, size, color, alpha);
    
    // Add subtle border for visual definition
    rect.setStrokeStyle(2, 0x000000, 0.3);
    
    return rect;
  }
}
