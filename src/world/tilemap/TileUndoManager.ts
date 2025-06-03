// TileUndoManager: Manages undo/redo for tile edits, integrates with EditorHistory
import { EditorHistory, EditAction } from './EditorHistory';

export class TileUndoManager {
  private history: EditorHistory;

  constructor(history: EditorHistory) {
    this.history = history;
  }

  /**
   * Records an edit action and clears the redo stack.
   * Optionally emits an event for UI or multiplayer sync.
   */
  record(action: EditAction) {
    this.history.push(action);
    // Optionally: emit event for undo/redo stack change
    // this.events?.emit({ type: 'undoStackChange', data: { action } });
  }

  /**
   * Undo the last edit action. Returns the undone action, or undefined if none.
   */
  undo(): EditAction | undefined {
    const action = this.history.undo();
    // Optionally: emit event for undo
    // this.events?.emit({ type: 'undo', data: { action } });
    return action;
  }

  /**
   * Redo the last undone action. Returns the redone action, or undefined if none.
   */
  redo(): EditAction | undefined {
    const action = this.history.redo();
    // Optionally: emit event for redo
    // this.events?.emit({ type: 'redo', data: { action } });
    return action;
  }

  /**
   * Returns the current undo stack (for UI visualization).
   */
  getUndoStack(): EditAction[] {
    return this.history.getUndoStack();
  }

  /**
   * Returns the current redo stack (for UI visualization).
   */
  getRedoStack(): EditAction[] {
    return this.history.getRedoStack();
  }

  /**
   * Clears all undo/redo history.
   */
  clear() {
    this.history.getUndoStack().length = 0;
    this.history.getRedoStack().length = 0;
  }
}
