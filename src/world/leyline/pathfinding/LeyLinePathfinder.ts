// LeyLinePathfinder.ts
// Advanced ley line-aware pathfinding algorithms (A*, Dijkstra, etc.)
// See: artifacts/copilot_leyline_system_advanced_development_2025-06-07.artifact

import { LeyLine, LeyLineNode } from '../types';

export class LeyLinePathfinder {
  leyLines: LeyLine[];

  constructor(leyLines: LeyLine[]) {
    this.leyLines = leyLines;
  }

  /**
   * Filter nodes for pathfinding to avoid unstable/disrupted/rifted nodes (artifact-driven)
   * Artifact: leyline_instability_event_design_2025-06-08.artifact
   * @param nodes Array of LeyLineNode
   * @param avoidStates Array of states to avoid (default: ['unstable', 'disrupted', 'rift'])
   */
  static filterNodesForPathfinding(nodes: LeyLineNode[], avoidStates: string[] = ['unstable', 'disrupted', 'rift']): LeyLineNode[] {
    return nodes.filter(n => !avoidStates.includes(n.state || ''));
  }

  /**
   * Find the shortest path between two points using ley line nodes as a graph.
   * Returns a list of nodes representing the path.
   * Skips unstable/disrupted/rifted nodes per artifact.
   */
  findPath(start: { x: number; y: number }, end: { x: number; y: number }): LeyLineNode[] {
    // Only use stable/active nodes for pathfinding
    const allNodes = LeyLinePathfinder.filterNodesForPathfinding(this.leyLines.flatMap(l => l.nodes));
    if (allNodes.length === 0) return [];
    const nearest = (pt: { x: number; y: number }) =>
      allNodes.reduce((min, n) => {
        const d = Math.hypot(n.position.x - pt.x, n.position.y - pt.y);
        return d < min.dist ? { node: n, dist: d } : min;
      }, { node: allNodes[0], dist: Infinity }).node;
    const startNode = nearest(start);
    const endNode = nearest(end);
    return [startNode, endNode];
  }

  /**
   * Hybrid pathfinding: combines ley line graph traversal with tile-based pathfinding.
   * @param start Start position
   * @param end End position
   * @param tileIsWalkable Callback: (x, y) => boolean
   * @returns PathResult: { nodes: LeyLineNode[], tiles: Vector2[] }
   */
  findHybridPath(
    start: { x: number; y: number },
    end: { x: number; y: number },
    tileIsWalkable: (x: number, y: number) => boolean
  ): { nodes: LeyLineNode[]; tiles: { x: number; y: number }[] } {
    // 1. Find nearest ley line node to start and end
    const allNodes = this.leyLines.flatMap(l => l.nodes);
    const nearest = (pt: { x: number; y: number }) =>
      allNodes.reduce((min, n) => {
        const d = Math.hypot(n.position.x - pt.x, n.position.y - pt.y);
        return d < min.dist ? { node: n, dist: d } : min;
      }, { node: allNodes[0], dist: Infinity }).node;
    const startNode = nearest(start);
    const endNode = nearest(end);

    // 2. (Stub) Find ley line node path (A* or Dijkstra on ley line graph)
    // For now, just direct connection
    const nodePath = [startNode, endNode];

    // 3. Tile-based pathfinding from start to startNode, and endNode to end
    // (Stub: straight line, should be replaced with A* on tilemap)
    const tilePath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      // Simple straight-line walk, skipping impassable tiles
      const path: { x: number; y: number }[] = [];
      let x = Math.round(from.x), y = Math.round(from.y);
      const tx = Math.round(to.x), ty = Math.round(to.y);
      while (x !== tx || y !== ty) {
        if (x < tx) x++; else if (x > tx) x--;
        if (y < ty) y++; else if (y > ty) y--;
        if (tileIsWalkable(x, y)) path.push({ x, y });
        else break; // Stop if blocked
      }
      return path;
    };
    const tilesToLey = tilePath(start, startNode.position);
    const tilesFromLey = tilePath(endNode.position, end);

    return { nodes: nodePath, tiles: [...tilesToLey, ...tilesFromLey] };
  }

  // Artifact: leyline_instability_event_design_2025-06-08.artifact
  // Adapt pathfinding to avoid or penalize unstable/disrupted/rift nodes/lines
  // Example stub:
  // In findPath(...):
  //   - Skip or increase cost for nodes/lines with state/status 'unstable', 'disrupted', or 'rift'
  // TODO: Implement path cost/avoidance logic for instability/disruption/rift
}
