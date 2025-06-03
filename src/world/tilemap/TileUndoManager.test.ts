// TileUndoManager tests (integration with EditorHistory)
import { TileUndoManager } from './TileUndoManager';

// Minimal EditorHistory and EditAction mocks for testing
class MockEditorHistory {
  private undoStack: any[] = [];
  private redoStack: any[] = [];
  push(action: any) { this.undoStack.push(action); this.redoStack = []; }
  undo() { return this.undoStack.length ? this.redoStack.push(this.undoStack.pop()) && this.redoStack[this.redoStack.length-1] : undefined; }
  redo() { return this.redoStack.length ? this.undoStack.push(this.redoStack.pop()) && this.undoStack[this.undoStack.length-1] : undefined; }
  getUndoStack() { return this.undoStack; }
  getRedoStack() { return this.redoStack; }
}

describe('TileUndoManager', () => {
  let history: MockEditorHistory;
  let manager: TileUndoManager;
  const actionA = { type: 'edit', tile: 'A', data: {} };
  const actionB = { type: 'edit', tile: 'B', data: {} };

  beforeEach(() => {
    history = new MockEditorHistory();
    manager = new TileUndoManager(history as any);
  });

  it('records actions and clears redo stack', () => {
    manager.record(actionA);
    expect(history.getUndoStack()).toEqual([actionA]);
    manager.record(actionB);
    expect(history.getUndoStack()).toEqual([actionA, actionB]);
    expect(history.getRedoStack()).toEqual([]);
  });

  it('undo returns last action and moves it to redo stack', () => {
    manager.record(actionA);
    manager.record(actionB);
    const undone = manager.undo();
    expect(undone).toEqual(actionB);
    expect(history.getUndoStack()).toEqual([actionA]);
    expect(history.getRedoStack()).toEqual([actionB]);
  });

  it('redo returns last undone action and moves it to undo stack', () => {
    manager.record(actionA);
    manager.record(actionB);
    manager.undo();
    const redone = manager.redo();
    expect(redone).toEqual(actionB);
    expect(history.getUndoStack()).toEqual([actionA, actionB]);
    expect(history.getRedoStack()).toEqual([]);
  });

  it('getUndoStack/getRedoStack reflect current state', () => {
    manager.record(actionA);
    manager.record(actionB);
    manager.undo();
    expect(manager.getUndoStack()).toEqual([actionA]);
    expect(manager.getRedoStack()).toEqual([actionB]);
  });

  it('clear empties both stacks', () => {
    manager.record(actionA);
    manager.record(actionB);
    manager.undo();
    manager.clear();
    expect(manager.getUndoStack()).toEqual([]);
    expect(manager.getRedoStack()).toEqual([]);
  });
});
