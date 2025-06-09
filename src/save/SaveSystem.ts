// SaveSystem.ts
// Handles persistence of Jane and Magneto Speeder state
// References: magneto_speeder_gameplay_foundation_2025-06-06.artifact

import { Jane } from '../core/Jane';

export class SaveSystem {
  /**
   * Serializes Jane and her speeder to JSON for saving.
   */
  static save(jane: Jane): string {
    return JSON.stringify(jane.toJSON());
  }

  /**
   * Loads Jane and her speeder from JSON.
   */
  static load(data: string, eventBus: any): Jane {
    const parsed = JSON.parse(data);
    return Jane.fromJSON(parsed, eventBus);
  }
}
