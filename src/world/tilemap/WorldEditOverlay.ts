// WorldEditOverlay: Master overlay for all world/tilemap editing UI (selection, palette, inspector, etc.)
import { TileSelectionOverlay } from './TileSelectionOverlay';
import { TilePalette } from './TilePalette';
import { TileInspector } from './TileInspector';
import { TileHistoryVisualizer } from './TileHistoryVisualizer';

export class WorldEditOverlay {
  private selectionOverlay: TileSelectionOverlay;
  private palette: TilePalette;
  private inspector: TileInspector;
  private historyVisualizer: TileHistoryVisualizer;

  constructor(selectionOverlay: TileSelectionOverlay, palette: TilePalette, inspector: TileInspector, historyVisualizer: TileHistoryVisualizer) {
    this.selectionOverlay = selectionOverlay;
    this.palette = palette;
    this.inspector = inspector;
    this.historyVisualizer = historyVisualizer;
  }

  render(scene: Phaser.Scene) {
    this.selectionOverlay.renderOverlay(scene);
    this.palette.render(scene);
    this.inspector.render(scene);
    this.historyVisualizer.render(scene);
  }
}
