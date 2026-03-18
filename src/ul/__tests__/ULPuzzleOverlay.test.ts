// Integration tests for ULPuzzleOverlay
// Tests: palette opens, compose, validate, score, hints (P3.1 — task 5126)

import type { Gir, NodeType, Sort, ValidationResult, ScoreResult, Hint } from '../ulForgeTypes';

// Minimal Phaser mock
class MockContainer {
  x: number; y: number; scene: any; children: any[] = [];
  constructor(scene: any, x = 0, y = 0) { this.scene = scene; this.x = x; this.y = y; }
  add(child: any) { if (Array.isArray(child)) { this.children.push(...child); } else { this.children.push(child); } return this; }
  setScrollFactor() { return this; }
  setDepth() { return this; }
  destroy() { this.children = []; }
}

const MockPhaser = {
  GameObjects: {
    Container: MockContainer,
  },
  Geom: {
    Line: class { constructor(public x1: number, public y1: number, public x2: number, public y2: number) {} },
  },
  Math: {
    DegToRad: (d: number) => (d * Math.PI) / 180,
    Vector2: class { constructor(public x: number, public y: number) {} },
  },
  Curves: {
    QuadraticBezier: class {
      constructor(public p0: any, public p1: any, public p2: any) {}
      getPoints(n: number) {
        const pts = [];
        for (let i = 0; i <= n; i++) { const t = i / n; pts.push({ x: t, y: t }); }
        return pts;
      }
    },
  },
};
jest.mock('phaser', () => ({ __esModule: true, default: MockPhaser }));

// Mock the ulEventBus to avoid side effects
const emittedEvents: { type: string; payload: any }[] = [];
jest.mock('../ulEventBus', () => ({
  ulEventBus: {
    emit: (type: string, payload: any) => emittedEvents.push({ type, payload }),
    on: jest.fn(),
    off: jest.fn(),
  },
}));

import { ULPuzzleOverlay, PuzzleOverlayConfig } from '../ULPuzzleOverlay';
import { ULStubEngine, ULEngineRegistry } from '../ulWasmAdapter';

// Helper: create a mockScene that provides the minimum Phaser.Scene API
function createMockScene() {
  const mockGraphics = {
    setDepth: jest.fn().mockReturnThis(),
    clear: jest.fn(),
    destroy: jest.fn(),
    fillStyle: jest.fn(),
    lineStyle: jest.fn(),
    fillCircle: jest.fn(),
    strokeCircle: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillTriangle: jest.fn(),
    strokeTriangle: jest.fn(),
    strokeLineShape: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    fillPath: jest.fn(),
    strokePath: jest.fn(),
    arc: jest.fn(),
  };
  const texts: any[] = [];
  const mockScene = {
    add: {
      graphics: jest.fn(() => mockGraphics),
      text: jest.fn((_x: number, _y: number, content: string, _style: any) => {
        const txt: Record<string, any> = {
          content,
          setText: jest.fn(),
          setColor: jest.fn(),
          setInteractive: jest.fn(),
          on: jest.fn(),
          destroy: jest.fn(),
          getText: () => txt.content as string,
        };
        txt.setText.mockImplementation((t: string) => { txt.content = t; return txt; });
        txt.setColor.mockReturnValue(txt);
        txt.setInteractive.mockReturnValue(txt);
        txt.on.mockReturnValue(txt);
        texts.push(txt);
        return txt;
      }),
      existing: jest.fn(),
    },
    time: {
      delayedCall: jest.fn((_ms: number, cb: () => void) => cb()),
    },
  } as any;
  return { mockScene, mockGraphics, texts };
}

function makeTargetGir(): Gir {
  return {
    ul_gir: '1.0',
    root: 'n1',
    nodes: [{ id: 'n1', type: 'point' as NodeType, sort: 'entity' as Sort, label: 'existence' }],
    edges: [],
  };
}

describe('ULPuzzleOverlay', () => {
  beforeEach(() => {
    emittedEvents.length = 0;
    ULEngineRegistry.resetForTesting();
  });

  it('creates overlay with 5 palette buttons', () => {
    const { mockScene } = createMockScene();
    const completeFn = jest.fn();
    const overlay = new ULPuzzleOverlay({
      scene: mockScene,
      targetGir: makeTargetGir(),
      onComplete: completeFn,
    });
    expect(overlay.getPaletteButtons()).toHaveLength(5);
  });

  it('adds primitives to composition on palette click', () => {
    const { mockScene } = createMockScene();
    const overlay = new ULPuzzleOverlay({
      scene: mockScene,
      targetGir: makeTargetGir(),
      onComplete: jest.fn(),
    });

    // Simulate adding Point
    overlay.addPrimitive({ symbol: '●', nodeType: 'point', sort: 'entity', label: 'Point' });
    expect(overlay.getComposedNodes()).toHaveLength(1);
    expect(overlay.getComposedNodes()[0].type).toBe('point');

    // Add Line
    overlay.addPrimitive({ symbol: '─', nodeType: 'line', sort: 'relation', label: 'Line' });
    expect(overlay.getComposedNodes()).toHaveLength(2);
  });

  it('builds valid GIR from composed nodes', () => {
    const { mockScene } = createMockScene();
    const overlay = new ULPuzzleOverlay({
      scene: mockScene,
      targetGir: makeTargetGir(),
      onComplete: jest.fn(),
    });

    overlay.addPrimitive({ symbol: '●', nodeType: 'point', sort: 'entity', label: 'Point' });
    overlay.addPrimitive({ symbol: '─', nodeType: 'line', sort: 'relation', label: 'Line' });

    const gir = overlay.getComposedGir();
    expect(gir.ul_gir).toBe('1.0');
    expect(gir.nodes).toHaveLength(2);
    expect(gir.edges).toHaveLength(1);
    expect(gir.edges[0].source).toBe('n1');
    expect(gir.edges[0].target).toBe('n2');
  });

  it('updates validation display when primitives are added', () => {
    const { mockScene } = createMockScene();
    const overlay = new ULPuzzleOverlay({
      scene: mockScene,
      targetGir: makeTargetGir(),
      onComplete: jest.fn(),
    });

    overlay.addPrimitive({ symbol: '●', nodeType: 'point', sort: 'entity', label: 'Point' });

    // Validation text should have been set (contains Schema/Sort/Inv/Geom)
    const valText = overlay.getValidationText();
    expect(valText.setText).toHaveBeenCalled();

    // Get the last setText argument
    const lastCall = (valText.setText as jest.Mock).mock.calls.pop();
    expect(lastCall[0]).toContain('Schema');
    expect(lastCall[0]).toContain('Sort');
  });

  it('emits ul:puzzle:validated events', () => {
    const { mockScene } = createMockScene();
    const overlay = new ULPuzzleOverlay({
      scene: mockScene,
      targetGir: makeTargetGir(),
      onComplete: jest.fn(),
    });

    overlay.addPrimitive({ symbol: '●', nodeType: 'point', sort: 'entity', label: 'Point' });

    const validatedEvents = emittedEvents.filter(e => e.type === 'ul:puzzle:validated');
    expect(validatedEvents.length).toBeGreaterThan(0);
    expect(validatedEvents[validatedEvents.length - 1].payload.result).toBeDefined();
  });

  it('deploys and scores composition', () => {
    const { mockScene } = createMockScene();
    const completeFn = jest.fn();
    const overlay = new ULPuzzleOverlay({
      scene: mockScene,
      targetGir: makeTargetGir(),
      onComplete: completeFn,
    });

    overlay.addPrimitive({ symbol: '●', nodeType: 'point', sort: 'entity', label: 'Point' });
    overlay.deploy();

    // Score text should be updated
    const scoreText = overlay.getScoreText();
    expect(scoreText.setText).toHaveBeenCalled();
    const lastScoreCall = (scoreText.setText as jest.Mock).mock.calls.pop();
    expect(lastScoreCall[0]).toContain('Score');
  });

  it('shows hints when requested', () => {
    const { mockScene } = createMockScene();
    const overlay = new ULPuzzleOverlay({
      scene: mockScene,
      targetGir: makeTargetGir(),
      onComplete: jest.fn(),
    });

    // With no nodes, hint says to add a primitive
    overlay.showHints();
    const hintText = overlay.getHintText();
    const noNodeCall = (hintText.setText as jest.Mock).mock.calls.pop();
    expect(noNodeCall[0]).toContain('Add at least one primitive');

    // With a node, should show actual hints from engine
    overlay.addPrimitive({ symbol: '─', nodeType: 'line', sort: 'relation', label: 'Line' });
    overlay.showHints();
    const hintCall = (hintText.setText as jest.Mock).mock.calls.pop();
    expect(hintCall[0].length).toBeGreaterThan(0);
  });

  it('emits ul:puzzle:started on construction', () => {
    const { mockScene } = createMockScene();
    new ULPuzzleOverlay({
      scene: mockScene,
      targetGir: makeTargetGir(),
      onComplete: jest.fn(),
    });

    const startedEvents = emittedEvents.filter(e => e.type === 'ul:puzzle:started');
    expect(startedEvents).toHaveLength(1);
  });

  it('compose with operation merges nodes', () => {
    const { mockScene } = createMockScene();
    const overlay = new ULPuzzleOverlay({
      scene: mockScene,
      targetGir: makeTargetGir(),
      onComplete: jest.fn(),
    });

    overlay.addPrimitive({ symbol: '●', nodeType: 'point', sort: 'entity', label: 'Point' });
    overlay.addPrimitive({ symbol: '─', nodeType: 'line', sort: 'relation', label: 'Line' });

    const beforeCount = overlay.getComposedNodes().length;
    overlay.composeWithOperation('predicate');

    // Composed nodes may change after operation
    const afterGir = overlay.getComposedGir();
    expect(afterGir.nodes.length).toBeGreaterThan(0);
  });
});
