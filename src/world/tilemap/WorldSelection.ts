// WorldSelection: Handles selection, area marking, and multi-tile operations for editing
export interface SelectionRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class WorldSelection {
  private selection?: SelectionRect;

  // Start a new selection at (x, y)
  start(x: number, y: number) {
    this.selection = { x, y, w: 1, h: 1 };
    this._anchor = { x, y };
  }

  // Update selection to (x, y) (dragging)
  update(x: number, y: number) {
    if (!this._anchor) return;
    const x1 = Math.min(this._anchor.x, x);
    const y1 = Math.min(this._anchor.y, y);
    const x2 = Math.max(this._anchor.x, x);
    const y2 = Math.max(this._anchor.y, y);
    this.selection = { x: x1, y: y1, w: x2 - x1 + 1, h: y2 - y1 + 1 };
  }

  // End selection at (x, y)
  end(x: number, y: number) {
    this.update(x, y);
    this._anchor = undefined;
  }

  // Returns true if a selection is active
  isActive(): boolean {
    return !!this.selection;
  }

  // Returns {x1, y1, x2, y2} bounds of selection
  getBounds(): { x1: number, y1: number, x2: number, y2: number } | undefined {
    if (!this.selection) return undefined;
    const { x, y, w, h } = this.selection;
    return { x1: x, y1: y, x2: x + w - 1, y2: y + h - 1 };
  }

  private _anchor?: { x: number, y: number };
}
