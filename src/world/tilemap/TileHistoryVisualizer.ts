// TileHistoryVisualizer: Visualizes undo/redo stack for world editing
import { EditorHistory } from './EditorHistory';

export class TileHistoryVisualizer {
  private history: EditorHistory;

  constructor(history: EditorHistory) {
    this.history = history;
  }

  render(scene: Phaser.Scene) {
    // Simple overlay: show undo/redo stack as text in top-left
    const style = { font: '12px monospace', color: '#fff', backgroundColor: '#222', padding: { x: 4, y: 2 } };
    let y = 8;
    scene.add.text(8, y, 'Undo Stack:', style);
    y += 16;
    const undoStack = this.history.getUndoStack();
    for (let i = Math.max(0, undoStack.length - 10); i < undoStack.length; i++) {
      const action = undoStack[i];
      scene.add.text(8, y, `- ${action.type}`, style);
      y += 14;
    }
    y += 8;
    scene.add.text(8, y, 'Redo Stack:', style);
    y += 16;
    const redoStack = this.history.getRedoStack();
    for (let i = Math.max(0, redoStack.length - 10); i < redoStack.length; i++) {
      const action = redoStack[i];
      scene.add.text(8, y, `- ${action.type}`, style);
      y += 14;
    }
  }
}
