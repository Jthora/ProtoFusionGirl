// TileSelectionOverlay: Visual overlay for selected/marked tiles in the editor
import { WorldSelection } from './WorldSelection';

export class TileSelectionOverlay {
  private selection: WorldSelection;

  constructor(selection: WorldSelection) {
    this.selection = selection;
  }

  renderOverlay(scene: Phaser.Scene) {
    // TODO: Draw selection rectangle/overlay in the scene
  }
}
