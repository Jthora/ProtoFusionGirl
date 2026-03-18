// TileSelectionOverlay: Visual overlay for selected/marked tiles in the editor
import { WorldSelection } from './WorldSelection';

export class TileSelectionOverlay {
  private _selection?: WorldSelection;

  // Allow tests to construct without args
  constructor(selection?: WorldSelection) {
    this._selection = selection;
  }

  setSelection(sel: WorldSelection) {
    this._selection = sel;
  }

  clearSelection() {
    this._selection = undefined;
  }

  getSelection(): WorldSelection | undefined {
    return this._selection;
  }

  renderOverlay(_scene: Phaser.Scene) {
    // TODO: Draw selection rectangle/overlay in the scene
  }
}
