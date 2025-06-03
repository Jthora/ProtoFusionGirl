// TilePalette: UI and logic for selecting tile types for editing/painting
import { TileRegistry } from './TileRegistry';

export class TilePalette {
  private registry: TileRegistry;
  private selectedTileId: string = '';

  constructor(registry: TileRegistry) {
    this.registry = registry;
  }

  selectTile(tileId: string) {
    this.selectedTileId = tileId;
  }

  getSelectedTile(): string {
    return this.selectedTileId;
  }

  /**
   * Renders a simple tile palette UI in the bottom-left corner of the scene.
   * Allows clicking to select a tile for painting/placing.
   */
  render(scene: Phaser.Scene) {
    const tiles = this.registry.getAllTiles();
    const tileSize = 32;
    const margin = 8;
    const cols = 6;
    const x0 = margin;
    const y0 = scene.scale.height - tileSize - margin;
    let i = 0;
    for (const tile of tiles) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = x0 + col * (tileSize + margin);
      const y = y0 - row * (tileSize + margin);
      // Draw tile background (highlight if selected)
      const isSelected = tile.id === this.selectedTileId;
      const bg = scene.add.rectangle(x + tileSize/2, y + tileSize/2, tileSize, tileSize, isSelected ? 0x44ff88 : 0x222222, isSelected ? 0.7 : 0.4).setDepth(1000);
      // Draw tile texture (placeholder: just text for now)
      scene.add.text(x + 4, y + 4, tile.name[0] || '?', { font: '20px monospace', color: '#fff' }).setDepth(1001);
      // Click handler
      bg.setInteractive().on('pointerdown', () => this.selectTile(tile.id));
      i++;
    }
  }
}
