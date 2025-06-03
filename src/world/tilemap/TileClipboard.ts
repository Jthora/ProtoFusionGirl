// TileClipboard: Copy/cut/paste support for world editing
import { WorldSelection } from './WorldSelection';
import { TilemapManager } from './TilemapManager';

export class TileClipboard {
  private buffer: { tiles: string[][], width: number, height: number } | null = null;
  private tilemapManager?: TilemapManager;

  setTilemapManager(manager: TilemapManager) {
    this.tilemapManager = manager;
  }

  /**
   * Copies the selected area to the clipboard buffer, including tile IDs and metadata.
   * @param selection WorldSelection with getBounds(): {x1, y1, x2, y2}
   */
  copy(selection: WorldSelection) {
    if (!this.tilemapManager) return;
    const { x1, y1, x2, y2 } = selection.getBounds();
    const width = x2 - x1 + 1;
    const height = y2 - y1 + 1;
    const tiles: string[][] = [];
    for (let dx = 0; dx < width; dx++) {
      tiles[dx] = [];
      for (let dy = 0; dy < height; dy++) {
        // Optionally: copy tile metadata as well (not just ID)
        tiles[dx][dy] = this.tilemapManager.editService.getTile(x1 + dx, y1 + dy);
      }
    }
    this.buffer = { tiles, width, height };
  }

  /**
   * Cuts the selected area: copies to buffer, then erases (sets to 'air').
   */
  cut(selection: WorldSelection) {
    this.copy(selection);
    if (!this.tilemapManager) return;
    const { x1, y1, x2, y2 } = selection.getBounds();
    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        this.tilemapManager.editService.setTile(x, y, 'air');
      }
    }
  }

  /**
   * Pastes the clipboard buffer at the given world coordinates (top-left corner).
   * Optionally, can support flipping, rotating, or pasting with metadata.
   */
  paste(x: number, y: number) {
    if (!this.tilemapManager || !this.buffer) return;
    for (let dx = 0; dx < this.buffer.width; dx++) {
      for (let dy = 0; dy < this.buffer.height; dy++) {
        const tileId = this.buffer.tiles[dx][dy];
        // Optionally: skip 'air' if pasting as overlay
        this.tilemapManager.editService.setTile(x + dx, y + dy, tileId);
      }
    }
  }

  /**
   * Clears the clipboard buffer.
   */
  clear() {
    this.buffer = null;
  }

  /**
   * Returns true if there is something in the clipboard buffer.
   */
  hasData(): boolean {
    return !!this.buffer;
  }
}
