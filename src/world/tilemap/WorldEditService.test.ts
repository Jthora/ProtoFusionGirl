// WorldEditService.test.ts
// Unit tests for WorldEditService
import { WorldEditService } from './WorldEditService';
import { TilemapManager } from './TilemapManager';
import { WorldStateManager } from '../WorldStateManager';
describe('WorldEditService', () => {
  // TODO: Test fill/brush with overlapping/invalid positions (e.g., brushPaint with duplicate positions)
  // TODO: Test integration with WorldStateManager updates (e.g., verify updateState is called on edit)
  // TODO: Test modding/extensibility hooks (e.g., emitEditEvent with custom type and data)
  let service: WorldEditService;
  let tilemapManager: TilemapManager;
  let worldStateManager: WorldStateManager;
  beforeEach(() => {
    tilemapManager = { chunkManager: { chunkSize: 16, getChunk: () => ({ tiles: [["air"]] }) }, recordTileDelta: jest.fn(), getCurrentBranch: jest.fn(), getBranchDeltas: jest.fn() } as any;
    worldStateManager = { getState: () => ({ tilemap: [["air"]] }), updateState: jest.fn() } as any;
    service = new WorldEditService(tilemapManager, worldStateManager);
  });
  it('can set and get a tile', () => {
    service.setTile(0, 0, 'grass');
    expect(typeof service.getTile(0, 0)).toBe('string');
  });
  it('supports undo/redo', () => {
    service.setTile(0, 0, 'grass');
    service.undo();
    service.redo();
  });
  it('supports brushPaint', () => {
    service.brushPaint([{x:0,y:0},{x:1,y:1}], 'dirt');
  });
  it('supports fillArea', () => {
    service.fillArea(0,0,2,2,'stone');
  });
  it('emits edit events', () => {
    service.emitEditEvent('tileEdit', {x:0,y:0});
  });
  it('emits TILE_EDITED event and triggers autosave on setTile', () => {
    const mockEmit = jest.fn();
    const mockSaveWorld = jest.fn();
    const mockScene = { add: { text: jest.fn().mockReturnValue({ setDepth: jest.fn().mockReturnThis(), setScrollFactor: jest.fn().mockReturnThis(), setAlpha: jest.fn().mockReturnThis(), setInteractive: jest.fn().mockReturnThis(), on: jest.fn().mockReturnThis(), destroy: jest.fn() }) } };
    const tilemapManager = {
      chunkManager: { chunkSize: 16, getChunk: () => ({ tiles: [["air"]] }) },
      recordTileDelta: jest.fn(),
      getCurrentBranch: jest.fn(),
      getBranchDeltas: jest.fn(),
      saveWorld: mockSaveWorld,
      scene: mockScene
    } as any;
    const worldStateManager = { getState: () => ({ tilemap: [["air"]] }), updateState: jest.fn() } as any;
    const service = new WorldEditService(tilemapManager, worldStateManager);
    // Patch events to use mockEmit
    (service as any).events.emit = mockEmit;
    service.setTile(0, 0, 'grass');
    expect(mockEmit).toHaveBeenCalledWith(expect.objectContaining({ type: 'TILE_EDITED' }));
    // Simulate TILE_EDITED event triggers autosave
    expect(mockSaveWorld).toHaveBeenCalledWith('autosave.world');
  });
  it('returns default or handles gracefully for out-of-bounds getTile', () => {
    const tilemapManager = {
      chunkManager: { chunkSize: 16, getChunk: () => null },
      recordTileDelta: jest.fn(),
      getCurrentBranch: jest.fn(),
      getBranchDeltas: jest.fn()
    } as any;
    const worldStateManager = { getState: () => ({}), updateState: jest.fn() } as any;
    const service = new WorldEditService(tilemapManager, worldStateManager);
    expect(service.getTile(-1, -1)).toBe('air');
  });
  it('handles undo with empty history and redo after new edit', () => {
    const tilemapManager = {
      chunkManager: { chunkSize: 16, getChunk: () => ({ tiles: [["air"]] }) },
      recordTileDelta: jest.fn(),
      getCurrentBranch: jest.fn(),
      getBranchDeltas: jest.fn()
    } as any;
    const worldStateManager = { getState: () => ({}), updateState: jest.fn() } as any;
    const service = new WorldEditService(tilemapManager, worldStateManager);
    // Undo with empty history
    expect(service.undo()).toBeUndefined();
    // Redo after new edit
    service.setTile(0, 0, 'grass');
    service.undo();
    service.setTile(0, 0, 'dirt');
    expect(service.redo()).toBeUndefined();
  });
  it('calls updateState on WorldStateManager when setTile is called', () => {
    const tilemapManager = {
      chunkManager: { chunkSize: 16, getChunk: () => ({ tiles: [["air"]] }) },
      recordTileDelta: jest.fn(),
      getCurrentBranch: jest.fn(),
      getBranchDeltas: jest.fn()
    } as any;
    const updateState = jest.fn();
    const worldStateManager = { getState: () => ({}), updateState } as any;
    const service = new WorldEditService(tilemapManager, worldStateManager);
    service.setTile(0, 0, 'grass');
    expect(updateState).toHaveBeenCalled();
  });
  it('emits tileEdit event for modding/extensibility', () => {
    const tilemapManager = {
      chunkManager: { chunkSize: 16, getChunk: () => ({ tiles: [["air"]] }) },
      recordTileDelta: jest.fn(),
      getCurrentBranch: jest.fn(),
      getBranchDeltas: jest.fn()
    } as any;
    const worldStateManager = { getState: () => ({}), updateState: jest.fn() } as any;
    const service = new WorldEditService(tilemapManager, worldStateManager);
    const mockEmit = jest.fn();
    (service as any).events.emit = mockEmit;
    service.emitEditEvent('tileEdit', { foo: 'bar' });
    expect(mockEmit).toHaveBeenCalledWith({ type: 'tileEdit', data: { foo: 'bar' } });
  });
});
