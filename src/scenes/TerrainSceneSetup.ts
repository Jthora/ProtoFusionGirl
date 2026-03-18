import Phaser from 'phaser';
import { TilemapManager } from '../world/tilemap/TilemapManager';
import { ChunkLoader } from '../world/tilemap/ChunkLoader';
import { WorldPhysics } from '../world/tilemap/WorldPhysics';
import { TILE_SIZE } from '../world/tilemap/constants';

export interface TerrainSetupResult {
  groundGroup: Phaser.Physics.Arcade.StaticGroup;
  chunkLoader: ChunkLoader | undefined;
  platformX: number;
  platformY: number;
  playerStartX: number;
  playerStartY: number;
  dynamicGroundLevel: number;
}

export class TerrainSceneSetup {
  /**
   * Dynamically calculate ground level at a given X position based on terrain generation.
   * Falls back to screen-based calculation if terrain isn't available yet.
   */
  static getDynamicGroundLevel(scene: Phaser.Scene, tilemapManager: TilemapManager, x: number): number {
    try {
      if (tilemapManager && tilemapManager.worldGen) {
        const chunkSize = tilemapManager.chunkManager?.chunkSize || 16;
        const tileSize = TILE_SIZE;
        const chunkX = Math.floor(x / (chunkSize * tileSize));
        const localX = Math.floor((x % (chunkSize * tileSize)) / tileSize);

        const chunk = tilemapManager.chunkManager.loadChunk(chunkX, 0);
        if (chunk && chunk.tiles && chunk.tiles[localX]) {
          for (let y = chunk.tiles[localX].length - 1; y >= 0; y--) {
            const tileType = chunk.tiles[localX][y];
            const above = y - 1 >= 0 ? chunk.tiles[localX][y - 1] : 'air';
            if (tileType && tileType !== 'air' && (!above || above === 'air')) {
              return y * tileSize;
            }
          }
        }
      }
    } catch {
      // fallback
    }
    return scene.scale.height - 100;
  }

  /**
   * Find the actual ground level by checking loaded sprites in the ground group.
   */
  static findActualGroundLevel(groundGroup: Phaser.Physics.Arcade.StaticGroup, x: number, fallback: number): number {
    let highestGroundY = -Infinity;
    groundGroup.children.entries.forEach(child => {
      const sprite = child as any;
      if (Math.abs(sprite.x - x) < 64) {
        if (sprite.y > highestGroundY) {
          highestGroundY = sprite.y;
        }
      }
    });
    if (highestGroundY === -Infinity) return fallback;
    return highestGroundY;
  }

  /**
   * Adjust spawn positions after terrain has been loaded.
   */
  static adjustSpawnForLoadedTerrain(
    scene: Phaser.Scene,
    groundGroup: Phaser.Physics.Arcade.StaticGroup,
    tilemapManager: TilemapManager,
    playerManager: { getJaneSprite(): Phaser.Physics.Arcade.Sprite | undefined },
    speederSprite: Phaser.Physics.Arcade.Sprite | undefined,
    platformX: number,
    playerStartY: number
  ): void {
    try {
      const actualGroundLevel = TerrainSceneSetup.findActualGroundLevel(groundGroup, platformX, scene.scale.height - 100);
      const currentDynamicLevel = TerrainSceneSetup.getDynamicGroundLevel(scene, tilemapManager, platformX);

      if (Math.abs(actualGroundLevel - currentDynamicLevel) > 32) {
        const heightAdjustment = actualGroundLevel - currentDynamicLevel;
        const newPlayerY = playerStartY + heightAdjustment;

        const platforms = groundGroup.children.entries.filter(child => {
          const sprite = child as any;
          return sprite.x >= platformX - 100 && sprite.x <= platformX + 100;
        });
        platforms.forEach(platform => {
          const sprite = platform as any;
          if (sprite.body) {
            sprite.y += heightAdjustment;
            (sprite.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
          }
        });

        const janeSprite = playerManager.getJaneSprite();
        if (janeSprite) {
          janeSprite.y = newPlayerY;
        }
        if (speederSprite) {
          speederSprite.y = newPlayerY;
        }
      }
    } catch {
      // silently continue
    }
  }

  /**
   * Set up the entire terrain system: ground group, platform, chunk loader.
   */
  static init(scene: Phaser.Scene, tilemapManager: TilemapManager): TerrainSetupResult {
    const tileSize = TILE_SIZE;
    const platformHeight = 5 * tileSize;
    const platformX = 400;
    const platformWidth = 6 * tileSize;

    const dynamicGroundLevel = TerrainSceneSetup.getDynamicGroundLevel(scene, tilemapManager, platformX);
    const platformY = dynamicGroundLevel - platformHeight;
    const playerStartX = platformX - tileSize;
    const playerStartY = platformY - tileSize - 16;

    const groundGroup = scene.physics.add.staticGroup();
    WorldPhysics.setupGravity(scene);

    const useChunkLoader = scene.textures.exists('tilesheet');
    if (!useChunkLoader) {
      const fallbackGroundLevel = scene.scale.height - 100;
      for (let x = -200; x < scene.scale.width + 200; x += tileSize) {
        const groundTile = scene.add.rectangle(x, fallbackGroundLevel + tileSize / 2, tileSize, tileSize, 0x8B4513);
        scene.physics.add.existing(groundTile, true);
        groundGroup.add(groundTile);
      }
    }

    // Floating platform with stilts
    const platform = scene.add.rectangle(platformX, platformY, platformWidth, tileSize, 0x4169E1);
    platform.setStrokeStyle(2, 0x00FFCC);
    scene.physics.add.existing(platform, true);
    groundGroup.add(platform);

    const stiltWidth = tileSize / 2;
    const stiltHeight = platformHeight;

    const leftStilt = scene.add.rectangle(platformX - platformWidth / 3, platformY + (stiltHeight / 2), stiltWidth, stiltHeight, 0x654321);
    leftStilt.setStrokeStyle(1, 0x8B4513);
    scene.physics.add.existing(leftStilt, true);
    groundGroup.add(leftStilt);

    const rightStilt = scene.add.rectangle(platformX + platformWidth / 3, platformY + (stiltHeight / 2), stiltWidth, stiltHeight, 0x654321);
    rightStilt.setStrokeStyle(1, 0x8B4513);
    scene.physics.add.existing(rightStilt, true);
    groundGroup.add(rightStilt);

    scene.add.circle(platformX - platformWidth / 2, platformY, 8, 0x00FFCC);
    scene.add.circle(platformX + platformWidth / 2, platformY, 8, 0x00FFCC);

    // Chunk loader
    let chunkLoader: ChunkLoader | undefined;
    try {
      chunkLoader = new ChunkLoader(scene, tilemapManager, groundGroup, 1);
    } catch {
      console.warn('⚠️ ChunkLoader not available');
    }

    // Start terrain monitoring
    TerrainSceneSetup.monitorTerrainChanges(scene, groundGroup, tilemapManager, { getJaneSprite: () => undefined }, chunkLoader);

    return { groundGroup, chunkLoader, platformX, platformY, playerStartX, playerStartY, dynamicGroundLevel };
  }

  /**
   * Monitor terrain changes periodically.
   */
  static monitorTerrainChanges(
    scene: Phaser.Scene,
    groundGroup: Phaser.Physics.Arcade.StaticGroup,
    tilemapManager: TilemapManager,
    playerManager: { getJaneSprite(): Phaser.Physics.Arcade.Sprite | undefined },
    chunkLoader: ChunkLoader | undefined
  ): void {
    scene.time.addEvent({
      delay: 5000,
      callback: () => {
        const janeSprite = playerManager.getJaneSprite();
        if (janeSprite && chunkLoader) {
          const currentGroundLevel = TerrainSceneSetup.findActualGroundLevel(groundGroup, janeSprite.x, scene.scale.height - 100);
          const expectedGroundLevel = TerrainSceneSetup.getDynamicGroundLevel(scene, tilemapManager, janeSprite.x);
          if (Math.abs(currentGroundLevel - expectedGroundLevel) > 64) {
            console.log(`🌍 Terrain inconsistency at player: actual=${currentGroundLevel}, expected=${expectedGroundLevel}`);
          }
        }
      },
      loop: true
    });
  }
}
