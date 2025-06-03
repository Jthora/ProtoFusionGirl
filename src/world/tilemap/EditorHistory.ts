// EditorHistory: Undo/redo stack for world editing
export interface EditAction {
  type: string;
  data: any;
}

export class EditorHistory {
  private undoStack: EditAction[] = [];
  private redoStack: EditAction[] = [];

  push(action: EditAction) {
    this.undoStack.push(action);
    this.redoStack = [];
  }

  undo(): EditAction | undefined {
    const action = this.undoStack.pop();
    if (action) this.redoStack.push(action);
    return action;
  }

  redo(): EditAction | undefined {
    const action = this.redoStack.pop();
    if (action) this.undoStack.push(action);
    return action;
  }

  getUndoStack(): EditAction[] {
    return this.undoStack;
  }

  getRedoStack(): EditAction[] {
    return this.redoStack;
  }
}
