# Design: Terrain Physics Layer

> How the signal function becomes a physics-collidable surface.
> Replaces the per-tile static physics group.

---

## The Current Problem

The old system attached one Phaser Arcade Physics static body to every tile.
A chunk of 16×16 tiles = 256 physics bodies. A visible area of 4×4 chunks =
4,096 physics bodies. The physics engine checks every one for collision every
frame. This is catastrophically expensive for what is effectively a flat-ish
ground surface.

---

## The Solution: One Polygon Body

The terrain signal function produces a continuous height curve. That curve,
sampled at intervals and simplified, becomes a single polygon. One physics
body. Always. Regardless of terrain complexity.

```
signal function → sampled points → simplified polyline → polygon body
     f(X)       →  [(x0,y0)...]  →  fewer vertices   →  Phaser body
```

---

## Curve Sampling

Sample the terrain height function at intervals across the visible world range
plus a margin:

```typescript
function sampleTerrainCurve(
  worldXStart: number,
  worldXEnd: number,
  state: LeyLineSignalState,
  sampleInterval: number = 4  // world units between samples
): Vector2[] {
  const points: Vector2[] = [];
  for (let x = worldXStart; x <= worldXEnd; x += sampleInterval) {
    const y = terrain_height(x, state);
    points.push({ x, y });
  }
  // Close the polygon: add bottom-left and bottom-right to form a solid shape
  const bottom = worldBottom + 100; // well below any reachable position
  points.push({ x: worldXEnd, y: bottom });
  points.push({ x: worldXStart, y: bottom });
  return points;
}
```

**Sample interval at each fidelity level:**

| Fidelity | Interval | Points for 800px screen | Notes |
|----------|----------|------------------------|-------|
| CRITICAL | 32 units | ~25 points | Floor line, approximate |
| LOW | 16 units | ~50 points | Reasonable terrain shape |
| STANDARD | 8 units | ~100 points | Accurate curve |
| HIGH | 4 units | ~200 points | Full detail |

---

## Polygon Simplification

Raw sampled points have redundant collinear segments. Simplify with the
Ramer-Douglas-Peucker algorithm to reduce vertex count while preserving
the shape's visual accuracy:

```typescript
function simplifyPolyline(points: Vector2[], epsilon: number): Vector2[] {
  // RDP algorithm — removes points within epsilon pixels of the line
  // epsilon = 1.5 for STANDARD, 3.0 for LOW
}
```

Typical reduction: 200 points → 40–60 points after simplification. The physics
engine handles 60-vertex polygons trivially.

---

## Physics Body Creation

### Arcade Physics (recommended for prototype)

Phaser's Arcade Physics doesn't natively support concave polygon bodies. The
workaround: use a **static group of thin rectangle segments** tracing the curve.
One rectangle per pair of adjacent sample points, tilted to match the slope.

```typescript
function buildArcadeTerrainBody(
  scene: Phaser.Scene,
  points: Vector2[]
): Phaser.Physics.Arcade.StaticGroup {
  const group = scene.physics.add.staticGroup();
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const seg = createSlopeSegment(scene, p1, p2);
    group.add(seg);
  }
  return group;
}
```

Cost: ~50 bodies instead of 4,096. A 98.8% reduction.

### Matter.js (recommended for post-prototype)

Matter.js (included with Phaser 3) supports arbitrary polygon bodies natively.
One body, full concave support. Switch to this once the prototype loop works.

```typescript
const terrainBody = this.matter.add.fromVertices(
  centerX, centerY, points, { isStatic: true }
);
```

---

## Terrain Retrace (Mutation)

When `LeyLineSignalState` changes significantly (energy level or corruption
changes by > 5 points), the physics body must be rebuilt:

```typescript
class TerrainPhysics {
  private body: Phaser.Physics.Arcade.StaticGroup;
  private lastState: LeyLineSignalState;

  onSignalStateChange(newState: LeyLineSignalState): void {
    const delta = Math.abs(newState.energyLevel - this.lastState.energyLevel)
                + Math.abs(newState.corruptionLevel - this.lastState.corruptionLevel);
    if (delta > 5) {
      this.rebuildBody(newState);
      this.lastState = { ...newState };
    }
  }

  private rebuildBody(state: LeyLineSignalState): void {
    this.body.destroy(); // remove old bodies
    const points = sampleTerrainCurve(visibleXStart, visibleXEnd, state);
    const simplified = simplifyPolyline(points, 1.5);
    this.body = buildArcadeTerrainBody(this.scene, simplified);
  }
}
```

**Throttle:** Rebuild at most once per 250ms to prevent thrashing during
rapid energy changes.

**Smooth transition:** The visual terrain curve updates immediately (renderer
reads from signal function directly). The physics body updates on the throttle
timer. The brief discrepancy is imperceptible at normal play speeds.

---

## Moving Camera Window

As Jane moves, the visible X range shifts. The physics body covers the current
visible range + a margin. When Jane moves far enough that the old body no longer
covers the visible range, a new body is generated for the new position.

```
Body coverage: [cameraX - margin, cameraX + screenWidth + margin]
Rebuild trigger: Jane moves beyond (bodyStart + margin/2) or (bodyEnd - margin/2)
Margin: 1 screen width in each direction
```

This means a body rebuild occurs roughly every screen width of travel — infrequent
and cheap.

---

## Collision Layers

Three physics layers relevant to terrain:

| Layer | Members | Collides with terrain? |
|-------|---------|----------------------|
| PLAYER | Jane sprite | Yes |
| SPEEDER | Magneto Speeder | Yes (different friction) |
| ENEMY | Enemy sprites | Yes (can be disabled for flying enemies) |
| PROJECTILE | Attack effects | No (pass through terrain) |
| ROBOT | PsiSys bots | Optional (some hover) |

---

## Edge Cases

**Rift spike:** When a rift forms, a terrain spike is added at its X coordinate
(via `node_spikes`). The spike height can be impassable (> jump height). This is
intentional — rifts create physical barriers that the player must route around
or seal to remove.

**Water tiles:** When `terrain_height(X) < 0` (sub-sea-level), the terrain is
filled with water. Jane cannot walk through water — it acts as a physics barrier
above the waterline. The speeder can skim over water at speed.

**Vertical world boundary:** The world has a maximum and minimum Y. If a
corruption spike would push terrain beyond a threshold, it caps at a maximum
height. The ASI observing "off-the-charts" corruption terrain is still valid
aesthetically.

**Speeder vs. walking physics:** The speeder should interact with the terrain
curve as a smooth surface regardless of fidelity — it follows the H1+H2 envelope
even at HIGH fidelity where H3+H4 create small bumps. This prevents the speeder
from getting stuck on micro-features at high speed.
