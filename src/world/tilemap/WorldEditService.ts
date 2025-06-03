// WorldEditService: Provides high-level editing operations (set tile, fill, brush, undo, etc.)
import { TilemapManager } from './TilemapManager';
import { EditorHistory } from './EditorHistory';
import type { EditAction } from './EditorHistory';
import { WorldEvents } from './WorldEvents';

export class WorldEditService {
  private tilemapManager: TilemapManager;
  private history: EditorHistory;
  private events: WorldEvents;

  constructor(tilemapManager: TilemapManager) {
    this.tilemapManager = tilemapManager;
    this.history = (tilemapManager as any).history || new EditorHistory();
    this.events = (tilemapManager as any).events || new WorldEvents();
  }

  // Set a tile at world coordinates (x, y) to tileId, with undo support and event emission
  setTile(x: number, y: number, tileId: string) {
    const prevTile = this.getTile(x, y);
    if (prevTile === tileId) return; // Early return if no change
    // Find the chunk for (x, y)
    const chunkSize = this.tilemapManager.chunkManager.chunkSize;
    const chunkX = Math.floor(x / chunkSize);
    const chunkY = Math.floor(y / chunkSize);
    const chunk = this.tilemapManager.chunkManager.loadChunk(chunkX, chunkY);
    if (!chunk) return;
    // Local coordinates within chunk
    const localX = x % chunkSize;
    const localY = y % chunkSize;
    if (!chunk.tiles) chunk.tiles = [];
    if (!chunk.tiles[localX]) chunk.tiles[localX] = [];
    chunk.tiles[localX][localY] = tileId;
    chunk.dirty = true;
    this.history?.push({ type: 'setTile', data: { x, y, prevTile, newTile: tileId } });
    this.events?.emit({ type: 'tileEdit', data: { x, y, prevTile, newTile: tileId } });
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
      const { x, y, prevTile } = action.data;
      this.setTile(x, y, prevTile);
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
    }
    // ...handle other action types as needed
  }

  // Brush tool: paint with undo/redo and event support
  brushPaint(positions: Array<{x: number, y: number}>, tileId: string) {
    const prevTiles = positions.map(pos => ({ ...pos, prevTile: this.getTile(pos.x, pos.y) }));
    positions.forEach(pos => this.setTile(pos.x, pos.y, tileId));
    this.history?.push({ type: 'brushPaint', data: { positions: prevTiles, newTile: tileId } });
    this.events?.emit({ type: 'tileEdit', data: { positions: prevTiles, newTile: tileId } });
  }

  // Fill tool: fill area with undo/redo and event support
  fillArea(x: number, y: number, w: number, h: number, tileId: string) {
    const prevTiles: Array<{x: number, y: number, prevTile: string}> = [];
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        const px = x + dx, py = y + dy;
        prevTiles.push({ x: px, y: py, prevTile: this.getTile(px, py) });
        this.setTile(px, py, tileId);
      }
    }
    this.history?.push({ type: 'fillArea', data: { area: { x, y, w, h }, prevTiles, newTile: tileId } });
    this.events?.emit({ type: 'tileEdit', data: { area: { x, y, w, h }, prevTiles, newTile: tileId } });
  }

  // Rectangle select: returns all tile positions in a rectangle
  getRectPositions(x: number, y: number, w: number, h: number): Array<{x: number, y: number}> {
    const positions: Array<{x: number, y: number}> = [];
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        positions.push({ x: x + dx, y: y + dy });
      }
    }
    return positions;
  }

  // For modding/extensibility: generic edit event
  emitEditEvent(type: 'tileEdit' | 'chunkLoad' | 'chunkUnload' | 'worldSave' | 'worldLoad', data: any) {
    this.events?.emit({ type, data });
  }
}
