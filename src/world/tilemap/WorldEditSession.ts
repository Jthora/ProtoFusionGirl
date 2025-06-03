// WorldEditSession: Manages the state of an editing session (active tool, selection, etc.)
import { TileBrush } from './TileBrush';
import { TileClipboard } from './TileClipboard';
import { EditorHistory } from './EditorHistory';
import { WorldSelection } from './WorldSelection';

export class WorldEditSession {
  brush: TileBrush;
  clipboard: TileClipboard;
  history: EditorHistory;
  selection: WorldSelection;
  activeTool: 'brush' | 'fill' | 'select' | 'erase' | 'move' = 'brush';

  constructor(brush: TileBrush, clipboard: TileClipboard, history: EditorHistory, selection: WorldSelection) {
    this.brush = brush;
    this.clipboard = clipboard;
    this.history = history;
    this.selection = selection;
  }

  setActiveTool(tool: 'brush' | 'fill' | 'select' | 'erase' | 'move') {
    this.activeTool = tool;
  }
}
