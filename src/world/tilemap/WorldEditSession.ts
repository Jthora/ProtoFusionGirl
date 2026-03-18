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

  static createTestSession(overrides?: Partial<{ brush: TileBrush; clipboard: TileClipboard; history: EditorHistory; selection: WorldSelection }>): WorldEditSession {
    const dummyBrush: any = overrides?.brush || { paint: () => {}, erase: () => {}, getTilemapManager: () => ({ editService: { fillArea: () => {} } }), getTileId: () => 'grass' };
    const dummyClipboard: any = overrides?.clipboard || { copy: () => {}, paste: () => {} };
    const dummyHistory: any = overrides?.history || { undo: () => {}, redo: () => {} };
    const dummySelection: any = overrides?.selection || { isActive: () => false };
    return new WorldEditSession(dummyBrush, dummyClipboard, dummyHistory, dummySelection);
  }

  setActiveTool(tool: 'brush' | 'fill' | 'select' | 'erase' | 'move') {
    this.activeTool = tool;
  }
}
