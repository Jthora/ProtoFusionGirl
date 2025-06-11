// Tests for WorldSelection and SelectionRect
// TODO: Test selection creation, resizing, moving, and edge cases (out-of-bounds, zero-size)
// TODO: Test SelectionRect structure and type safety
// TODO: Test start, update, end sequence for selection
// TODO: Test isActive returns correct state
// TODO: Test getBounds returns correct coordinates for various selection shapes
// TODO: Test selection with negative width/height (dragging in reverse)
// TODO: Test selection reset/clear behavior
// TODO: Test overlapping selections and multi-selection scenarios (if supported)
// TODO: Test selection at world/tilemap boundaries
// TODO: Test SelectionRect with non-integer values (should be clamped or rejected)

import { WorldSelection } from './WorldSelection';

describe('WorldSelection', () => {
  it('should create and manipulate selections', () => {
    const sel = new WorldSelection();
    sel.start(1, 1);
    sel.update(3, 3);
    expect(sel.isActive()).toBe(true);
    const bounds = sel.getBounds();
    expect(bounds).toBeDefined();
    if (bounds) {
      expect(bounds.x1).toBeLessThanOrEqual(bounds.x2);
      expect(bounds.y1).toBeLessThanOrEqual(bounds.y2);
    }
    sel.end(3, 3);
    expect(sel.isActive()).toBe(true);
  });

  it('should handle selection with negative width/height (reverse drag)', () => {
    const sel = new WorldSelection();
    sel.start(5, 5);
    sel.update(2, 2);
    const bounds = sel.getBounds();
    expect(bounds).toBeDefined();
    if (bounds) {
      expect(bounds.x1).toBe(2);
      expect(bounds.y1).toBe(2);
      expect(bounds.x2).toBe(5);
      expect(bounds.y2).toBe(5);
    }
  });

  it('should reset/clear selection', () => {
    const sel = new WorldSelection();
    sel.start(1, 1);
    sel.update(2, 2);
    sel.end(2, 2);
    // Simulate clear by starting a new selection
    sel.start(10, 10);
    const bounds = sel.getBounds();
    expect(bounds).toBeDefined();
    if (bounds) {
      expect(bounds.x1).toBe(10);
    }
  });

  it('should handle selection at world/tilemap boundaries', () => {
    const sel = new WorldSelection();
    sel.start(0, 0);
    sel.update(9999, 9999);
    const bounds = sel.getBounds();
    expect(bounds).toBeDefined();
    if (bounds) {
      expect(bounds.x1).toBe(0);
      expect(bounds.y1).toBe(0);
      expect(bounds.x2).toBe(9999);
      expect(bounds.y2).toBe(9999);
    }
  });
});
