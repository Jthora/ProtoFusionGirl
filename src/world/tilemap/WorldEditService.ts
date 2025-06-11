// WorldEditService: Provides high-level editing operations (set tile, fill, brush, undo, etc.)
import { TilemapManager } from './TilemapManager';
import { EditorHistory } from './EditorHistory';
import type { EditAction } from './EditorHistory';
import { EventBus } from '../../core/EventBus';
import { WorldStateManager } from '../WorldStateManager';

export class WorldEditService {
  private tilemapManager: TilemapManager;
  private history: EditorHistory;
  private events: EventBus;
  private worldStateManager: WorldStateManager;

  constructor(tilemapManager: TilemapManager, worldStateManager: WorldStateManager) {
    this.tilemapManager = tilemapManager;
    this.worldStateManager = worldStateManager;
    this.history = (tilemapManager as any).history || new EditorHistory();
    this.events = (tilemapManager as any).events || new EventBus();
    // --- Event-driven autosave integration ---
    this.events.on('TILE_EDITED', async () => {
      // Trigger autosave (prototype: save to autosave.world)
      if (this.tilemapManager.saveWorld) {
        await this.tilemapManager.saveWorld('autosave.world');
        // UI feedback: show a toast or log (if scene is available)
        if ((this.tilemapManager as any).scene && (this.tilemapManager as any).scene.add) {
          const toast = (this.tilemapManager as any).scene.add.text(10, 10, 'Autosaved!', { color: '#00ffcc', fontSize: '12px' })
            .setDepth(2001).setScrollFactor(0).setAlpha(0.8).setInteractive();
          toast.on('pointerdown', () => { toast.destroy(); });
        } else {
          // Fallback: log to console
          console.log('Autosaved!');
        }
      }
    });
  }

  // Set a tile at world coordinates (x, y) to tileId, with undo support and event emission
  setTile(x: number, y: number, tileId: string) {
    const prevTile = this.getTile(x, y);
    if (prevTile === tileId) return;
    // Update world state via WorldStateManager
    const event: import('../../core/EventTypes').GameEvent<'TILE_EDITED'> = {
      type: 'TILE_EDITED',
      data: { x, y, prevTile, newTile: tileId }
    };
    this.events.emit(event);
    this.worldStateManager.updateState({ /* tile change patch here */ });
    this.history?.push({ type: 'setTile', data: { x, y, prevTile, newTile: tileId } });
    this.tilemapManager.recordTileDelta(x, y, prevTile, tileId);
  }

  // Get the tileId at world coordinates (x, y)
  getTile(x: number, y: number): string {
    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    const chunkX = Math.floor(x / chunkSize);
    const chunkY = Math.floor(y / chunkSize);
    const chunk = this.tilemapManager.chunkManager.getChunk(chunkX, chunkY);
    if (!chunk || !chunk.tiles) return 'air';
    const localX = x % chunkSize;
    const localY = y % chunkSize;
    return (chunk.tiles[localX] && chunk.tiles[localX][localY]) || 'air';
  }

  // Undo last edit
  undo(): EditAction | undefined {
    const action = this.history?.undo();
    if (!action) return;
    if (action.type === 'setTile') {
      const { x, y, prevTile, newTile } = action.data;
      this.setTile(x, y, prevTile);
      // Remove the last delta for this tile if it matches newTile
      const branchId = this.tilemapManager.getCurrentBranch();
      const deltas = this.tilemapManager.getBranchDeltas(branchId);
      for (let i = deltas.length - 1; i >= 0; i--) {
        if (deltas[i].x === x && deltas[i].y === y && deltas[i].newTile === newTile) {
          deltas.splice(i, 1);
          break;
        }
      }
    }
    // ...handle other action types as needed
  }

  // Redo last undone edit
  redo(): EditAction | undefined {
    const action = this.history?.redo();
    if (!action) return;
    if (action.type === 'setTile') {
      const { x, y, newTile } = action.data;
      this.setTile(x, y, newTile);
      // Delta is already recorded in setTile
    }
    // ...handle other action types as needed
  }

  // Brush tool: paint with undo/redo and event support
  brushPaint(positions: Array<{x: number, y: number}>, tileId: string) {
    const prevTiles = positions.map(pos => ({ ...pos, prevTile: this.getTile(pos.x, pos.y) }));
    positions.forEach(pos => {
      this.setTile(pos.x, pos.y, tileId);
      // Delta is already recorded in setTile
    });
    this.history?.push({ type: 'brushPaint', data: { positions: prevTiles, newTile: tileId } });
    // Emit TILE_EDITED for each position
    prevTiles.forEach(pos => {
      this.events?.emit({ type: 'TILE_EDITED', data: { x: pos.x, y: pos.y, prevTile: pos.prevTile, newTile: tileId } });
    });
  }

  // Fill tool: fill area with undo/redo and event support
  fillArea(x: number, y: number, w: number, h: number, tileId: string) {
    const prevTiles: Array<{x: number, y: number, prevTile: string}> = [];
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        const px = x + dx, py = y + dy;
        prevTiles.push({ x: px, y: py, prevTile: this.getTile(px, py) });
        this.setTile(px, py, tileId);
        // Delta is already recorded in setTile
      }
    }
    this.history?.push({ type: 'fillArea', data: { area: { x, y, w, h }, prevTiles, newTile: tileId } });
    // Emit TILE_EDITED for each position
    prevTiles.forEach(pos => {
      this.events?.emit({ type: 'TILE_EDITED', data: { x: pos.x, y: pos.y, prevTile: pos.prevTile, newTile: tileId } });
    });
  }

  // For modding/extensibility: generic edit event
  emitEditEvent(type: 'TILE_EDITED', data: { x: number, y: number, prevTile: string, newTile: string }) {
    this.events?.emit({ type, data });
  }
}
