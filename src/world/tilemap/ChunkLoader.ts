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
  
  // Throttling to prevent infinite loops
  private lastUpdateTime: number = 0;
  private updateThrottle: number = 100; // ms
  private errorCount: number = 0;
  private maxErrors: number = 50; // Stop after 50 errors to prevent spam
  private chunksLoadedThisSession: number = 0;
  private maxChunksPerSession: number = 25; // Limit total chunks loaded

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
   * @param playerX Player X position
   * @param playerY Player Y position  
   * @param speedKmh Optional speed in km/h for adaptive chunk loading
   */
  updateLoadedChunks(playerX: number, playerY: number, speedKmh: number = 0) {
    // Throttle updates to prevent infinite loops
    const now = Date.now();
    if (now - this.lastUpdateTime < this.updateThrottle) {
      return;
    }
    this.lastUpdateTime = now;
    
    // Stop if too many errors have occurred
    if (this.errorCount > this.maxErrors) {
      console.error(`ChunkLoader: Too many errors (${this.errorCount}), stopping tile generation to prevent infinite loop`);
      return;
    }

    // Stop if too many chunks loaded this session
    if (this.chunksLoadedThisSession > this.maxChunksPerSession) {
      console.warn(`ChunkLoader: Chunk limit reached (${this.chunksLoadedThisSession}), throttling chunk generation`);
      return;
    }

    // Speed-adaptive chunk loading radius
    let dynamicRadius = this.chunkRadius;
    
    if (speedKmh > 12000) { // Hypersonic (Mach 35+)
      dynamicRadius = Math.min(12, this.chunkRadius * 6);
    } else if (speedKmh > 1200) { // Supersonic
      dynamicRadius = Math.min(8, this.chunkRadius * 4);
    } else if (speedKmh > 200) { // Aircraft
      dynamicRadius = Math.min(6, this.chunkRadius * 2);
    }
    
    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    const tileSize = 16;
    const playerChunkX = Math.floor(TilemapManager.wrapX(playerX) / (chunkSize * tileSize));
    const playerChunkY = Math.floor(playerY / (chunkSize * tileSize));
    // Load/generate visible chunks using dynamic radius
    for (let dx = -dynamicRadius; dx <= dynamicRadius; dx++) {
      for (let dy = -dynamicRadius; dy <= dynamicRadius; dy++) {
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
                  
                  try {
                    const sprite = TileSpriteFactory.createTileSprite(this.scene, wx, wy, tileType);
                    group.add(sprite);
                    if (["grass", "dirt", "stone"].includes(tileType)) {
                      this.groundGroup.add(this.scene.physics.add.existing(sprite, true));
                    }
                  } catch (error) {
                    this.errorCount++;
                    console.warn(`Error creating tile sprite for ${tileType} at (${wx}, ${wy}):`, error);
                    if (this.errorCount > this.maxErrors) {
                      console.error('Too many tile sprite errors, stopping chunk generation');
                      return;
                    }
                  }
                }
              }
            }
            this.loadedChunkSprites.set(key, group);
            this.chunksLoadedThisSession++; // Track chunk loading
            console.log(`📦 Loaded chunk (${cx}, ${cy}) - Session total: ${this.chunksLoadedThisSession}`);
            if (this.onChunkLoaded) this.onChunkLoaded(cx, cy, group);
          }
        }
      }
    }
    // Unload distant chunks using dynamic radius
    for (const key of Array.from(this.loadedChunkSprites.keys())) {
      const [cx, cy] = key.split(',').map(Number);
      if (Math.abs(cx - playerChunkX) > dynamicRadius || Math.abs(cy - playerChunkY) > dynamicRadius) {
        this.loadedChunkSprites.get(key)?.clear(true, true);
        this.loadedChunkSprites.delete(key);
        this.tilemapManager.chunkManager.unloadChunk(cx, cy);
        if (this.onChunkUnloaded) this.onChunkUnloaded(cx, cy);
      }
    }
    // Remove all ground tiles not in loaded chunks using dynamic radius
    this.groundGroup.children.iterate((child: Phaser.GameObjects.GameObject) => {
      if (child && child.active) {
        const sprite = child as Phaser.GameObjects.Sprite;
        const wx = sprite.x;
        const wy = sprite.y;
        const cx = Math.floor(wx / (chunkSize * tileSize));
        const cy = Math.floor(wy / (chunkSize * tileSize));
        if (Math.abs(cx - playerChunkX) > dynamicRadius || Math.abs(cy - playerChunkY) > dynamicRadius) {
          this.groundGroup.remove(sprite, true, true);
          return false;
        }
      }
      return true;
    });
  }
}
// End of ChunkLoader
