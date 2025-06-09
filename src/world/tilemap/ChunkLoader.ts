/**
 * ChunkLoader (Phaser)
 * Handles logic for loading, unloading, and managing visible chunks in the world.
 *
 * Artifact-driven: See artifacts/phaser_chunk_loader_design_2025-06-08.artifact, artifact_codified_conventions_2025-06-08.artifact, artifact_testing_validation_2025-06-08.artifact
 *
 * - Modular: Sprite factory is static (can be swapped for tests/mocks).
 * - Testable: All chunk load/unload logic is exposed and can be hooked.
 * - Extensible: Use onChunkLoaded/onChunkUnloaded for modding or analytics.
 * - Edge cases: Handles world wrapping, chunk radius, and empty chunk data.
 *
 * Extension points:
 *   - onChunkLoaded?: (cx, cy, group) => void
 *   - onChunkUnloaded?: (cx, cy) => void
 *
 * To test: See src/world/tilemap/ChunkLoader.test.ts
 */
import { TilemapManager } from './TilemapManager';
import { TileSpriteFactory, TileType } from './TileSpriteFactory';
import Phaser from 'phaser';

export class ChunkLoader {
  private scene: Phaser.Scene;
  private tilemapManager: TilemapManager;
  private loadedChunkSprites: Map<string, Phaser.GameObjects.Group> = new Map();
  private groundGroup: Phaser.Physics.Arcade.StaticGroup;
  private chunkRadius: number;

  /**
   * Optional: Called after a chunk is loaded and sprites are created.
   * Can be set by mods, analytics, or tests.
   */
  public onChunkLoaded?: (cx: number, cy: number, group: Phaser.GameObjects.Group) => void;
  /**
   * Optional: Called after a chunk is unloaded and sprites are removed.
   */
  public onChunkUnloaded?: (cx: number, cy: number) => void;

  constructor(
    scene: Phaser.Scene,
    tilemapManager: TilemapManager,
    groundGroup: Phaser.Physics.Arcade.StaticGroup,
    chunkRadius: number = 2
  ) {
    this.scene = scene;
    this.tilemapManager = tilemapManager;
    this.groundGroup = groundGroup;
    this.chunkRadius = chunkRadius;
  }

  /**
   * Loads/unloads visible chunks based on player position.
   * Calls onChunkLoaded/onChunkUnloaded if set.
   */
  updateLoadedChunks(playerX: number, playerY: number) {
    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    const tileSize = 16;
    const playerChunkX = Math.floor(TilemapManager.wrapX(playerX) / (chunkSize * tileSize));
    const playerChunkY = Math.floor(playerY / (chunkSize * tileSize));
    // Load/generate visible chunks
    for (let dx = -this.chunkRadius; dx <= this.chunkRadius; dx++) {
      for (let dy = -this.chunkRadius; dy <= this.chunkRadius; dy++) {
        // Use wrapChunkX for horizontal chunk wrapping
        const cx = TilemapManager.wrapChunkX(playerChunkX + dx, chunkSize);
        const cy = playerChunkY + dy;
        const key = `${cx},${cy}`;
        if (!this.loadedChunkSprites.has(key)) {
          const chunk = this.tilemapManager.chunkManager.loadChunk(cx, cy);
          if (chunk) {
            const group = this.scene.add.group();
            for (let x = 0; x < chunk.tiles.length; x++) {
              for (let y = 0; y < chunk.tiles[x].length; y++) {
                const tileType = chunk.tiles[x][y] as TileType;
                if (tileType && tileType !== 'air') {
                  // Wrap world X for seamless rendering
                  const wx = TilemapManager.wrapX((cx * chunkSize + x) * tileSize);
                  const wy = (cy * chunkSize + y) * tileSize;
                  const sprite = TileSpriteFactory.createTileSprite(this.scene, wx, wy, tileType);
                  group.add(sprite);
                  if (["grass", "dirt", "stone"].includes(tileType)) {
                    this.groundGroup.add(this.scene.physics.add.existing(sprite, true));
                  }
                }
              }
            }
            this.loadedChunkSprites.set(key, group);
            if (this.onChunkLoaded) this.onChunkLoaded(cx, cy, group);
          }
        }
      }
    }
    // Unload distant chunks
    for (const key of Array.from(this.loadedChunkSprites.keys())) {
      const [cx, cy] = key.split(',').map(Number);
      if (Math.abs(cx - playerChunkX) > this.chunkRadius || Math.abs(cy - playerChunkY) > this.chunkRadius) {
        this.loadedChunkSprites.get(key)?.clear(true, true);
        this.loadedChunkSprites.delete(key);
        this.tilemapManager.chunkManager.unloadChunk(cx, cy);
        if (this.onChunkUnloaded) this.onChunkUnloaded(cx, cy);
      }
    }
    // Remove all ground tiles not in loaded chunks
    this.groundGroup.children.iterate((child: Phaser.GameObjects.GameObject) => {
      if (child && child.active) {
        const sprite = child as Phaser.GameObjects.Sprite;
        const wx = sprite.x;
        const wy = sprite.y;
        const cx = Math.floor(wx / (chunkSize * tileSize));
        const cy = Math.floor(wy / (chunkSize * tileSize));
        if (Math.abs(cx - playerChunkX) > this.chunkRadius || Math.abs(cy - playerChunkY) > this.chunkRadius) {
          this.groundGroup.remove(sprite, true, true);
          return false;
        }
      }
      return true;
    });
  }
}
// End of ChunkLoader
