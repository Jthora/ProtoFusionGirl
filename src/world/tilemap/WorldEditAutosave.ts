// WorldEditAutosave: Handles autosaving of world edits at intervals or on change
import { TilemapManager } from './TilemapManager';

export class WorldEditAutosave {
  private tilemapManager: TilemapManager;
  private intervalId?: NodeJS.Timeout;

  constructor(tilemapManager: TilemapManager) {
    this.tilemapManager = tilemapManager;
  }

  start(intervalMs: number = 30000) {
    this.stop();
    this.intervalId = setInterval(() => {
      this.tilemapManager.saveWorld('autosave.world');
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = undefined;
  }
}
