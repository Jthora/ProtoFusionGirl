// ULGlyphRenderer.ts
// Renders PositionedGlyph data (from ulWasmAdapter layout()) into Phaser graphics.
// Each ShapeType variant maps to a specific Phaser drawing call.
// Usage: create an instance with a Phaser scene, then call render() with layout data.

import Phaser from 'phaser';
import type { PositionedGlyph, PositionedElement, LayoutConnection, ShapeType } from './ulForgeTypes';

const DEFAULT_COLORS = {
  fill: 0x00ffcc,
  stroke: 0x00ddaa,
  connection: 0x888888,
  directed: 0xffcc00,
  fillAlpha: 0.8,
  strokeAlpha: 1.0,
  connectionAlpha: 0.6,
};

export interface GlyphRenderOptions {
  offsetX?: number;
  offsetY?: number;
  fill?: number;
  stroke?: number;
  connectionColor?: number;
  depth?: number;
}

export class ULGlyphRenderer {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, depth = 1500) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(depth);
  }

  render(glyph: PositionedGlyph, options: GlyphRenderOptions = {}): void {
    const ox = options.offsetX ?? 0;
    const oy = options.offsetY ?? 0;
    const fill = options.fill ?? DEFAULT_COLORS.fill;
    const stroke = options.stroke ?? DEFAULT_COLORS.stroke;
    const connColor = options.connectionColor ?? DEFAULT_COLORS.connection;

    this.graphics.clear();

    // Draw connections first (below elements)
    for (const conn of glyph.connections) {
      this.drawConnection(conn, ox, oy, connColor);
    }

    // Draw elements on top
    for (const el of glyph.elements) {
      this.drawElement(el, ox, oy, fill, stroke);
    }
  }

  private drawElement(el: PositionedElement, ox: number, oy: number, fill: number, stroke: number): void {
    const x = el.x + ox;
    const y = el.y + oy;
    const shape = el.shape;

    this.graphics.fillStyle(fill, DEFAULT_COLORS.fillAlpha);
    this.graphics.lineStyle(2, stroke, DEFAULT_COLORS.strokeAlpha);

    if ('Point' in shape) {
      const r = shape.Point.radius;
      this.graphics.fillCircle(x, y, r);
      this.graphics.strokeCircle(x, y, r);
    } else if ('Circle' in shape) {
      const r = shape.Circle.radius;
      this.graphics.strokeCircle(x, y, r);
    } else if ('Triangle' in shape) {
      const s = shape.Triangle.size;
      const h = (s * Math.sqrt(3)) / 2;
      this.graphics.fillTriangle(x, y - h / 2, x - s / 2, y + h / 2, x + s / 2, y + h / 2);
      this.graphics.strokeTriangle(x, y - h / 2, x - s / 2, y + h / 2, x + s / 2, y + h / 2);
    } else if ('Square' in shape) {
      const s = shape.Square.size;
      this.graphics.fillRect(x - s / 2, y - s / 2, s, s);
      this.graphics.strokeRect(x - s / 2, y - s / 2, s, s);
    } else if ('Pentagon' in shape) {
      this.drawRegularPolygon(x, y, shape.Pentagon.size / 2, 5, fill, stroke);
    } else if ('Hexagon' in shape) {
      this.drawRegularPolygon(x, y, shape.Hexagon.size / 2, 6, fill, stroke);
    } else if ('Line' in shape) {
      const l = shape.Line;
      this.graphics.lineStyle(2, stroke, DEFAULT_COLORS.strokeAlpha);
      this.graphics.strokeLineShape(new Phaser.Geom.Line(l.x1 + ox, l.y1 + oy, l.x2 + ox, l.y2 + oy));
      if (l.directed) {
        this.drawArrowhead(l.x1 + ox, l.y1 + oy, l.x2 + ox, l.y2 + oy, stroke);
      }
    } else if ('Angle' in shape) {
      const a = shape.Angle;
      this.graphics.lineStyle(2, stroke, DEFAULT_COLORS.strokeAlpha);
      // Draw angle arc
      const startAngle = -a.degrees / 2;
      const endAngle = a.degrees / 2;
      this.graphics.beginPath();
      this.graphics.arc(x, y, a.radius, Phaser.Math.DegToRad(startAngle), Phaser.Math.DegToRad(endAngle));
      this.graphics.strokePath();
      // Draw the two rays
      const r = a.radius;
      this.graphics.strokeLineShape(new Phaser.Geom.Line(
        x, y,
        x + r * Math.cos(Phaser.Math.DegToRad(startAngle)),
        y + r * Math.sin(Phaser.Math.DegToRad(startAngle))
      ));
      this.graphics.strokeLineShape(new Phaser.Geom.Line(
        x, y,
        x + r * Math.cos(Phaser.Math.DegToRad(endAngle)),
        y + r * Math.sin(Phaser.Math.DegToRad(endAngle))
      ));
    } else if ('Curve' in shape) {
      const c = shape.Curve;
      this.graphics.lineStyle(2, stroke, DEFAULT_COLORS.strokeAlpha);
      // Quadratic curve via midpoint offset by curvature
      const mx = (c.x1 + c.x2) / 2 + ox;
      const my = (c.y1 + c.y2) / 2 + oy - c.curvature * 40;
      const curve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(c.x1 + ox, c.y1 + oy),
        new Phaser.Math.Vector2(mx, my),
        new Phaser.Math.Vector2(c.x2 + ox, c.y2 + oy)
      );
      const points = curve.getPoints(20);
      this.graphics.beginPath();
      this.graphics.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        this.graphics.lineTo(points[i].x, points[i].y);
      }
      this.graphics.strokePath();
    }
  }

  private drawConnection(conn: LayoutConnection, ox: number, oy: number, color: number): void {
    const alpha = DEFAULT_COLORS.connectionAlpha;
    if (conn.dashed) {
      this.graphics.lineStyle(1, color, alpha);
      // Approximate dashed line
      const dx = conn.x2 - conn.x1;
      const dy = conn.y2 - conn.y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const dashLen = 6;
      const gaps = Math.floor(len / dashLen);
      for (let i = 0; i < gaps; i += 2) {
        const t0 = i / gaps;
        const t1 = Math.min((i + 1) / gaps, 1);
        this.graphics.strokeLineShape(new Phaser.Geom.Line(
          conn.x1 + dx * t0 + ox, conn.y1 + dy * t0 + oy,
          conn.x1 + dx * t1 + ox, conn.y1 + dy * t1 + oy
        ));
      }
    } else {
      this.graphics.lineStyle(2, color, alpha);
      this.graphics.strokeLineShape(new Phaser.Geom.Line(
        conn.x1 + ox, conn.y1 + oy, conn.x2 + ox, conn.y2 + oy
      ));
    }
    if (conn.directed) {
      this.drawArrowhead(conn.x1 + ox, conn.y1 + oy, conn.x2 + ox, conn.y2 + oy, color);
    }
  }

  private drawArrowhead(x1: number, y1: number, x2: number, y2: number, color: number): void {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 8;
    const spread = Math.PI / 6;
    this.graphics.fillStyle(color, 1);
    this.graphics.fillTriangle(
      x2, y2,
      x2 - headLen * Math.cos(angle - spread), y2 - headLen * Math.sin(angle - spread),
      x2 - headLen * Math.cos(angle + spread), y2 - headLen * Math.sin(angle + spread)
    );
  }

  private drawRegularPolygon(cx: number, cy: number, radius: number, sides: number, fill: number, stroke: number): void {
    const points: number[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
      points.push(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    }
    this.graphics.fillStyle(fill, DEFAULT_COLORS.fillAlpha);
    this.graphics.beginPath();
    this.graphics.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      this.graphics.lineTo(points[i], points[i + 1]);
    }
    this.graphics.closePath();
    this.graphics.fillPath();
    this.graphics.lineStyle(2, stroke, DEFAULT_COLORS.strokeAlpha);
    this.graphics.strokePath();
  }

  clear(): void {
    this.graphics.clear();
  }

  destroy(): void {
    this.graphics.destroy();
  }

  getGraphics(): Phaser.GameObjects.Graphics {
    return this.graphics;
  }
}
