// WorldPersistence: Handles saving/loading world data (chunks, metadata, etc.) to disk or cloud
import { TilemapManager } from './TilemapManager';

export class WorldPersistence {
  private tilemapManager: TilemapManager;
  private modMetadata: Record<string, any> = {};

  constructor(tilemapManager: TilemapManager) {
    this.tilemapManager = tilemapManager;
  }

  setModMetadata(modId: string, data: any) {
    this.modMetadata[modId] = data;
  }

  getModMetadata(modId: string): any {
    return this.modMetadata[modId];
  }

  /**
   * Loads world data from a JSON file (chunks, metadata, etc.).
   * @param file Path to the world file (relative or absolute)
   */
  async loadFromFile(file: string) {
    let data: any;
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    if (isBrowser) {
      const res = await fetch(file);
      data = await res.json();
    } else {
      const fs = await import('fs/promises');
      const content = await fs.readFile(file, 'utf-8');
      data = JSON.parse(content);
    }
    if (data.chunks) {
      this.tilemapManager.chunkManager.setLoadedChunks(data.chunks);
    }
    if (data.tileRegistry) {
      this.tilemapManager.tileRegistry.fromJSON(data.tileRegistry);
    }
    if (data.itemRegistry && (this.tilemapManager as any).itemRegistry) {
      (this.tilemapManager as any).itemRegistry.fromJSON(data.itemRegistry);
    }
    if (data.equipmentRegistry && (this.tilemapManager as any).equipmentRegistry) {
      (this.tilemapManager as any).equipmentRegistry.fromJSON(data.equipmentRegistry);
    }
    if (data.equipmentService && (this.tilemapManager as any).equipmentService) {
      (this.tilemapManager as any).equipmentService.fromJSON(data.equipmentService);
    }
    if (data.playerStats && (this.tilemapManager as any).playerStats) {
      (this.tilemapManager as any).playerStats.fromJSON(data.playerStats);
    }
    if (data.inventory && (this.tilemapManager as any).inventoryService) {
      (this.tilemapManager as any).inventoryService.fromJSON(data.inventory);
    }
    if (data.modMetadata) {
      this.modMetadata = data.modMetadata;
    }
    return data;
  }

  /**
   * Saves world data (chunks, metadata, etc.) to a JSON file.
   * @param file Path to save the world file
   */
  async saveToFile(file: string) {
    const data: any = {
      chunks: this.tilemapManager.chunkManager.getLoadedChunks(),
      tileRegistry: this.tilemapManager.tileRegistry.toJSON(),
      itemRegistry: (this.tilemapManager as any).itemRegistry?.toJSON?.(),
      equipmentRegistry: (this.tilemapManager as any).equipmentRegistry?.toJSON?.(),
      equipmentService: (this.tilemapManager as any).equipmentService?.toJSON?.(),
      playerStats: (this.tilemapManager as any).playerStats?.toJSON?.(),
      inventory: (this.tilemapManager as any).inventoryService?.toJSON?.(),
      modMetadata: this.modMetadata
    };
    const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    if (isBrowser) {
      // const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      // Optionally: trigger download or autosave
    } else {
      const fs = await import('fs/promises');
      await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
    }
  }

  /**
   * (Optional) Save a single chunk (for streaming worlds)
   */
  async saveChunk(_chunkX: number, _chunkY: number, _chunk: any) {
    // Implement as needed for your persistence model
    // For now, just a stub
  }

  /**
   * (Optional) Load a single chunk (for streaming worlds)
   */
  loadChunk(_chunkX: number, _chunkY: number): any {
    // Implement as needed for your persistence model
    // For now, just a stub
    return null;
  }
}
