// TileBrush: Tools for painting, erasing, and stamping tiles in the world editor
import { TilemapManager } from './TilemapManager';

export type BrushShape = 'single' | 'rectangle' | 'circle' | 'custom';

export class TileBrush {
  private tilemapManager: TilemapManager;
  private shape: BrushShape = 'single';
  private size: number = 1;
  private tileId: string = '';

  constructor(tilemapManager: TilemapManager) {
    this.tilemapManager = tilemapManager;
  }

  setBrush(shape: BrushShape, size: number, tileId: string) {
    this.shape = shape;
    this.size = size;
    this.tileId = tileId;
  }

  getTileId(): string {
    return this.tileId;
  }

  paint(x: number, y: number) {
    if (!this.tileId) return;
    if (this.shape === 'single') {
      this.tilemapManager.editService.setTile(x, y, this.tileId);
    } else if (this.shape === 'rectangle') {
      const half = Math.floor(this.size / 2);
      for (let dx = -half; dx <= half; dx++) {
        for (let dy = -half; dy <= half; dy++) {
          this.tilemapManager.editService.setTile(x + dx, y + dy, this.tileId);
        }
      }
    } else if (this.shape === 'circle') {
      const r = this.size / 2;
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (dx * dx + dy * dy <= r * r) {
            this.tilemapManager.editService.setTile(x + Math.round(dx), y + Math.round(dy), this.tileId);
          }
        }
      }
    } else if (this.shape === 'custom') {
      // TODO: Custom brush logic (e.g., from mod or user input)
    }
  }

  erase(x: number, y: number) {
    if (this.shape === 'single') {
      this.tilemapManager.editService.setTile(x, y, 'air'); // 'air' = empty tile
    } else if (this.shape === 'rectangle') {
      const half = Math.floor(this.size / 2);
      for (let dx = -half; dx <= half; dx++) {
        for (let dy = -half; dy <= half; dy++) {
          this.tilemapManager.editService.setTile(x + dx, y + dy, 'air');
        }
      }
    } else if (this.shape === 'circle') {
      const r = this.size / 2;
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          if (dx * dx + dy * dy <= r * r) {
            this.tilemapManager.editService.setTile(x + Math.round(dx), y + Math.round(dy), 'air');
          }
        }
      }
    } else if (this.shape === 'custom') {
      // TODO: Custom erase logic
    }
  }

  // Expose tilemapManager for integration (read-only)
  getTilemapManager(): TilemapManager {
    return this.tilemapManager;
  }
}
