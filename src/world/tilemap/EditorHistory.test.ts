// Tests for EditorHistory and EditAction
// TODO: Test EditAction structure and type safety
// TODO: Test pushing multiple actions and verify stack order
// TODO: Test undo/redo after new push (redo stack should clear)
// TODO: Test undo/redo with no actions (should return undefined)
// TODO: Test EditAction with complex data payloads
// TODO: Test getUndoStack and getRedoStack return correct arrays
// TODO: Test memory usage with large number of actions
// TODO: Test immutability of returned stacks (modifying result does not affect internal state)
// TODO: Test integration with world edit operations (mocked)

import { EditorHistory } from './EditorHistory';

describe('EditorHistory', () => {
  it('should push and undo/redo actions', () => {
    const history = new EditorHistory();
    history.push({ type: 'edit', data: 1 });
    history.push({ type: 'edit', data: 2 });
    expect(history.getUndoStack().length).toBe(2);
    const undone = history.undo();
    expect(undone && undone.data).toBe(2);
    expect(history.getUndoStack().length).toBe(1);
    const redone = history.redo();
    expect(redone && redone.data).toBe(2);
    expect(history.getUndoStack().length).toBe(2);
  });

  it('should clear redo stack after new push', () => {
    const history = new EditorHistory();
    history.push({ type: 'edit', data: 1 });
    history.undo();
    history.push({ type: 'edit', data: 2 });
    expect(history.getRedoStack().length).toBe(0);
  });

  it('should return undefined when undo/redo with empty stack', () => {
    const history = new EditorHistory();
    expect(history.undo()).toBeUndefined();
    expect(history.redo()).toBeUndefined();
  });

  it('getUndoStack and getRedoStack return correct arrays', () => {
    const history = new EditorHistory();
    history.push({ type: 'edit', data: 1 });
    history.push({ type: 'edit', data: 2 });
    history.undo();
    expect(history.getUndoStack().length).toBe(1);
    expect(history.getRedoStack().length).toBe(1);
  });

  it('returned stacks are immutable (modifying result does not affect internal state)', () => {
    const history = new EditorHistory();
    history.push({ type: 'edit', data: 1 });
    const undoStack = history.getUndoStack();
    undoStack.pop();
    expect(history.getUndoStack().length).toBe(1);
  });

  it('should handle EditAction with complex data payloads', () => {
    const history = new EditorHistory();
    const action = { type: 'edit', data: { foo: [1,2,3], bar: { baz: true } } };
    history.push(action);
    expect(history.getUndoStack()[0].data).toEqual(action.data);
  });
});
