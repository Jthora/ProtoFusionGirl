// WorldEditInput: Handles input events for world editing (mouse, keyboard, touch, etc.)
import { WorldEditSession } from './WorldEditSession';

export class WorldEditInput {
  private session: WorldEditSession;

  constructor(session: WorldEditSession) {
    this.session = session;
  }

  handlePointerDown(x: number, y: number) {
    // Convert screen to world coordinates if needed (integration point)
    const { wx, wy } = this.toWorldCoords(x, y);
    switch (this.session.activeTool) {
      case 'brush':
        this.session.brush.paint(wx, wy);
        break;
      case 'erase':
        this.session.brush.erase(wx, wy);
        break;
      case 'select':
        this.session.selection.start?.(wx, wy);
        break;
      case 'fill':
        if (this.session.selection.isActive?.()) {
          const bounds = this.session.selection.getBounds?.();
          if (bounds) {
            const { x1, y1, x2, y2 } = bounds;
            // Use public getter for tilemapManager and tileId
            this.session.brush.getTilemapManager().editService.fillArea(x1, y1, x2 - x1 + 1, y2 - y1 + 1, this.session.brush.getTileId());
          }
        } else {
          this.session.brush.paint(wx, wy);
        }
        break;
      // ...other tools
    }
  }

  handlePointerMove(x: number, y: number) {
    const { wx, wy } = this.toWorldCoords(x, y);
    switch (this.session.activeTool) {
      case 'brush':
        this.session.brush.paint(wx, wy);
        break;
      case 'erase':
        this.session.brush.erase(wx, wy);
        break;
      case 'select':
        this.session.selection.update?.(wx, wy);
        break;
      // ...other tools
    }
  }

  handlePointerUp(x: number, y: number) {
    const { wx, wy } = this.toWorldCoords(x, y);
    switch (this.session.activeTool) {
      case 'select':
        this.session.selection.end?.(wx, wy);
        break;
      // ...other tools (finalize drag, etc.)
    }
  }

  handleKeyDown(key: string, event?: KeyboardEvent) {
    // Use event for ctrl/cmd detection if provided
    const ctrlOrCmd = event ? (event.ctrlKey || event.metaKey) : this.isCtrlOrCmd();
    switch (key) {
      case 'z':
        if (ctrlOrCmd) this.session.history.undo();
        break;
      case 'y':
        if (ctrlOrCmd) this.session.history.redo();
        break;
      case 'b':
        this.session.setActiveTool('brush');
        break;
      case 'e':
        this.session.setActiveTool('erase');
        break;
      case 'f':
        this.session.setActiveTool('fill');
        break;
      case 's':
        this.session.setActiveTool('select');
        break;
      // ...other shortcuts
    }
  }

  /**
   * Converts screen or pointer coordinates to world/tile coordinates.
   * Integration point: override or inject camera/scene logic as needed.
   */
  toWorldCoords(x: number, y: number): { wx: number, wy: number } {
    // For now, assume 1:1 mapping. Integrate with camera/scene for real use.
    return { wx: Math.floor(x), wy: Math.floor(y) };
  }

  private isCtrlOrCmd(): boolean {
    // In a real implementation, check event.ctrlKey or event.metaKey
    // Here, always return true for demo/testing
    return true;
  }
}
