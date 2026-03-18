// Tests for ULGlyphRenderer
// Mocks Phaser.Scene and Phaser.GameObjects.Graphics to verify rendering logic

import type { PositionedGlyph } from '../ulForgeTypes';

// Mock Phaser objects
function createMockGraphics() {
  return {
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
}

// Mock Phaser module
const MockPhaser = {
  Geom: {
    Line: class {
      constructor(public x1: number, public y1: number, public x2: number, public y2: number) {}
    },
  },
  Math: {
    DegToRad: (d: number) => (d * Math.PI) / 180,
    Vector2: class {
      constructor(public x: number, public y: number) {}
    },
  },
  Curves: {
    QuadraticBezier: class {
      constructor(public p0: any, public p1: any, public p2: any) {}
      getPoints(n: number) {
        const pts = [];
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          pts.push({
            x: (1 - t) * (1 - t) * this.p0.x + 2 * (1 - t) * t * this.p1.x + t * t * this.p2.x,
            y: (1 - t) * (1 - t) * this.p0.y + 2 * (1 - t) * t * this.p1.y + t * t * this.p2.y,
          });
        }
        return pts;
      }
    },
  },
};
jest.mock('phaser', () => ({ __esModule: true, default: MockPhaser }));

import { ULGlyphRenderer } from '../ULGlyphRenderer';

function createMockScene() {
  const mockGraphics = createMockGraphics();
  const mockScene = {
    add: {
      graphics: jest.fn(() => mockGraphics),
    },
  } as any;
  return { mockScene, graphics: mockGraphics };
}

describe('ULGlyphRenderer', () => {
  it('constructs with a scene and creates graphics', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    expect(mockScene.add.graphics).toHaveBeenCalled();
    expect(renderer).toBeDefined();
  });

  it('renders a Point element', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    const glyph: PositionedGlyph = {
      elements: [{ node_id: 'n1', x: 100, y: 100, shape: { Point: { radius: 8 } } }],
      connections: [],
      width: 256,
      height: 256,
    };
    renderer.render(glyph);
    expect(graphics.fillCircle).toHaveBeenCalledWith(100, 100, 8);
    expect(graphics.strokeCircle).toHaveBeenCalledWith(100, 100, 8);
  });

  it('renders a Circle element', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    const glyph: PositionedGlyph = {
      elements: [{ node_id: 'n1', x: 50, y: 50, shape: { Circle: { radius: 20 } } }],
      connections: [],
      width: 256,
      height: 256,
    };
    renderer.render(glyph);
    expect(graphics.strokeCircle).toHaveBeenCalledWith(50, 50, 20);
  });

  it('renders a Square element', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    const glyph: PositionedGlyph = {
      elements: [{ node_id: 'n1', x: 64, y: 64, shape: { Square: { size: 24 } } }],
      connections: [],
      width: 256,
      height: 256,
    };
    renderer.render(glyph);
    expect(graphics.fillRect).toHaveBeenCalledWith(52, 52, 24, 24);
    expect(graphics.strokeRect).toHaveBeenCalledWith(52, 52, 24, 24);
  });

  it('renders a Triangle element', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    const glyph: PositionedGlyph = {
      elements: [{ node_id: 'n1', x: 128, y: 128, shape: { Triangle: { size: 30 } } }],
      connections: [],
      width: 256,
      height: 256,
    };
    renderer.render(glyph);
    expect(graphics.fillTriangle).toHaveBeenCalled();
    expect(graphics.strokeTriangle).toHaveBeenCalled();
  });

  it('renders connections', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    const glyph: PositionedGlyph = {
      elements: [
        { node_id: 'n1', x: 50, y: 50, shape: { Point: { radius: 8 } } },
        { node_id: 'n2', x: 150, y: 50, shape: { Point: { radius: 8 } } },
      ],
      connections: [{ edge_id: 'e1', x1: 50, y1: 50, x2: 150, y2: 50, directed: false, dashed: false }],
      width: 256,
      height: 256,
    };
    renderer.render(glyph);
    expect(graphics.strokeLineShape).toHaveBeenCalled();
  });

  it('renders directed connections with arrowhead', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    const glyph: PositionedGlyph = {
      elements: [],
      connections: [{ edge_id: 'e1', x1: 0, y1: 0, x2: 100, y2: 0, directed: true, dashed: false }],
      width: 256,
      height: 256,
    };
    renderer.render(glyph);
    // Arrowhead drawn as filled triangle
    expect(graphics.fillTriangle).toHaveBeenCalled();
  });

  it('respects offset options', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    const glyph: PositionedGlyph = {
      elements: [{ node_id: 'n1', x: 10, y: 10, shape: { Point: { radius: 4 } } }],
      connections: [],
      width: 256,
      height: 256,
    };
    renderer.render(glyph, { offsetX: 100, offsetY: 200 });
    expect(graphics.fillCircle).toHaveBeenCalledWith(110, 210, 4);
  });

  it('clears previous graphics on re-render', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    const glyph: PositionedGlyph = { elements: [], connections: [], width: 256, height: 256 };
    renderer.render(glyph);
    renderer.render(glyph);
    expect(graphics.clear).toHaveBeenCalledTimes(2);
  });

  it('clear() clears the graphics', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    renderer.clear();
    expect(graphics.clear).toHaveBeenCalled();
  });

  it('destroy() destroys the graphics', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    renderer.destroy();
    expect(graphics.destroy).toHaveBeenCalled();
  });

  it('renders a Pentagon (regular polygon with 5 sides)', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    const glyph: PositionedGlyph = {
      elements: [{ node_id: 'n1', x: 50, y: 50, shape: { Pentagon: { size: 20 } } }],
      connections: [],
      width: 256,
      height: 256,
    };
    renderer.render(glyph);
    expect(graphics.beginPath).toHaveBeenCalled();
    expect(graphics.fillPath).toHaveBeenCalled();
    expect(graphics.strokePath).toHaveBeenCalled();
  });

  it('renders a Curve element', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    const glyph: PositionedGlyph = {
      elements: [{ node_id: 'n1', x: 0, y: 0, shape: { Curve: { x1: 10, y1: 50, x2: 90, y2: 50, curvature: 1.0 } } }],
      connections: [],
      width: 256,
      height: 256,
    };
    renderer.render(glyph);
    expect(graphics.beginPath).toHaveBeenCalled();
    expect(graphics.strokePath).toHaveBeenCalled();
  });

  it('renders an Angle element', () => {
    const { mockScene, graphics } = createMockScene();
    const renderer = new ULGlyphRenderer(mockScene);
    const glyph: PositionedGlyph = {
      elements: [{ node_id: 'n1', x: 128, y: 128, shape: { Angle: { radius: 20, degrees: 90 } } }],
      connections: [],
      width: 256,
      height: 256,
    };
    renderer.render(glyph);
    expect(graphics.arc).toHaveBeenCalled();
    expect(graphics.strokePath).toHaveBeenCalled();
    // Two rays from the vertex
    expect(graphics.strokeLineShape).toHaveBeenCalledTimes(2);
  });
});
