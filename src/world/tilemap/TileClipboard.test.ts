// TileClipboard.test.ts
// Unit tests for TileClipboard
import { TileClipboard } from './TileClipboard';
describe('TileClipboard', () => {
  // TODO: Test paste with flipping/rotating (simulate transformations on paste)
  // TODO: Test paste with/without tilemapManager set (should handle missing manager gracefully)
  // TODO: Test error handling for empty buffer (calling paste with no buffer set)
  let clipboard: TileClipboard;
  beforeEach(() => {
    clipboard = new TileClipboard();
    clipboard.setTilemapManager({ editService: { getTile: () => 'grass', setTile: jest.fn() } } as any);
  });
  it('can copy a selection', () => {
    const selection = { getBounds: () => ({ x1: 0, y1: 0, x2: 1, y2: 1 }) } as any;
    clipboard.copy(selection);
  });
  it('can cut a selection', () => {
    const selection = { getBounds: () => ({ x1: 0, y1: 0, x2: 1, y2: 1 }) } as any;
    clipboard.cut(selection);
  });
  it('can paste a buffer', () => {
    clipboard["buffer"] = { tiles: [["grass"]], width: 1, height: 1 };
    clipboard.setTilemapManager({ editService: { setTile: jest.fn() } } as any);
    clipboard.paste(0, 0);
  });
  it('throws or handles gracefully when paste is called with no buffer', () => {
    const clipboard = new TileClipboard();
    clipboard.setTilemapManager({ editService: { setTile: jest.fn() } } as any);
    expect(() => clipboard.paste(0, 0)).not.toThrow(); // Should not throw, should handle gracefully
  });
  it('handles paste gracefully with no tilemapManager set', () => {
    const clipboard = new TileClipboard();
    clipboard["buffer"] = { tiles: [["grass"]], width: 1, height: 1 };
    expect(() => clipboard.paste(0, 0)).not.toThrow();
  });
  it('copies and cuts selection with metadata', () => {
    const clipboard = new TileClipboard();
    clipboard.setTilemapManager({ editService: { getTile: (x: number, y: number) => ({ id: 'grass', meta: { hp: 5 } }) } } as any);
    const selection = { getBounds: () => ({ x1: 0, y1: 0, x2: 0, y2: 0 }) } as any;
    clipboard.copy(selection);
    expect(clipboard["buffer"]).toBeDefined();
    clipboard.cut(selection);
    expect(clipboard["buffer"]).toBeDefined();
  });
});
