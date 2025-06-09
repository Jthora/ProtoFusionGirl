// LeyLineProceduralGen.ts
// Procedural ley line network generation for world/leyline
// See: artifacts/copilot_leyline_system_advanced_development_2025-06-07.artifact

import type { Vector2, LeyLineNode } from '../types'; // Use correct relative path

export interface LeyLineEdge {
  from: string;
  to: string;
  strength: number;
}

export interface LeyLineNetwork {
  nodes: LeyLineNode[];
  edges: LeyLineEdge[];
}

export class LeyLineProceduralGen {
  private seed: number;
  private network: LeyLineNetwork | null = null;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Deterministic pseudo-random number generator (LCG)
  private rand = (() => {
    let s = this.seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  })();

  // Generate a procedural ley line network (nodes/edges as a graph)
  /**
   * @param nodeCount Number of ley line nodes to generate
   * @param areaSize Size of the world area (for random placement)
   * @param tileIsWalkable Optional callback: (x, y) => boolean, returns true if tile is walkable
   */
  generateNetwork(nodeCount = 12, areaSize = 1000, tileIsWalkable?: (x: number, y: number) => boolean): LeyLineNetwork {
    const nodes: LeyLineNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      let pos: Vector2 | null = null;
      let maxTries = 100;
      while (maxTries-- > 0) {
        const candidate = {
          x: this.rand() * areaSize,
          y: this.rand() * areaSize,
        };
        if (!tileIsWalkable || tileIsWalkable(Math.round(candidate.x), Math.round(candidate.y))) {
          pos = candidate;
          break;
        }
      }
      // Fallback: if no valid tile found, just use last candidate
      if (!pos) {
        pos = {
          x: this.rand() * areaSize,
          y: this.rand() * areaSize,
        };
      }
      nodes.push({
        id: `node_${i}`,
        position: pos,
        state: 'inactive',
      });
    }
    // Connect nodes with edges (simple MST + random extra edges)
    const edges: LeyLineEdge[] = this.generateEdges(nodes);
    this.network = { nodes, edges };
    return this.network;
  }

  // Minimum Spanning Tree (Prim's algorithm) + random extra edges
  private generateEdges(nodes: LeyLineNode[]): LeyLineEdge[] {
    const edges: LeyLineEdge[] = [];
    const connected = new Set<string>();
    connected.add(nodes[0].id);
    while (connected.size < nodes.length) {
      let minDist = Infinity;
      let minEdge: LeyLineEdge | null = null;
      for (const n1 of nodes) {
        if (!connected.has(n1.id)) continue;
        for (const n2 of nodes) {
          if (connected.has(n2.id)) continue;
          const dist = this.distance(n1.position, n2.position);
          if (dist < minDist) {
            minDist = dist;
            minEdge = { from: n1.id, to: n2.id, strength: 1 };
          }
        }
      }
      if (minEdge) {
        edges.push(minEdge);
        connected.add(minEdge.to);
      }
    }
    // Add a few random extra edges for loops
    for (let i = 0; i < Math.floor(nodes.length / 3); i++) {
      const a = nodes[Math.floor(this.rand() * nodes.length)];
      const b = nodes[Math.floor(this.rand() * nodes.length)];
      if (a.id !== b.id && !edges.find(e => (e.from === a.id && e.to === b.id) || (e.from === b.id && e.to === a.id))) {
        edges.push({ from: a.id, to: b.id, strength: 0.5 + this.rand() });
      }
    }
    return edges;
  }

  private distance(a: Vector2, b: Vector2): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  getNetwork(): LeyLineNetwork | null {
    return this.network;
  }

  /**
   * Filter nodes for instability/disruption/rift state (artifact-driven)
   * Artifact: leyline_instability_event_design_2025-06-08.artifact
   * @param nodes Array of LeyLineNode
   * @param excludeStates Array of states to exclude (e.g., ['unstable', 'disrupted', 'rift'])
   */
  static filterNodesForInstability(nodes: LeyLineNode[], excludeStates: string[] = ['unstable', 'disrupted', 'rift']): LeyLineNode[] {
    return nodes.filter(n => !excludeStates.includes(n.state || ''));
  }

  // Artifact: leyline_instability_event_design_2025-06-08.artifact
  // Adapt procedural generation to support unstable/disrupted/rift ley lines/nodes
  // Example: mark some nodes/lines as 'unstable' or 'disrupted' based on input or random chance
  // TODO: Accept instability/disruption/rift parameters and set node/line state accordingly

  // Example stub:
  // function generateNetworkWithInstability(seed: number, nodeCount: number, instabilityChance = 0.1) {
  //   const network = this.generateNetwork(seed, nodeCount);
  //   for (const node of network.nodes) {
  //     if (Math.random() < instabilityChance) node.state = 'unstable';
  //   }
  //   for (const line of network.lines) {
  //     if (Math.random() < instabilityChance) line.status = 'disrupted';
  //   }
  //   return network;
  // }
}

// Usage: new LeyLineProceduralGen(seed).generateNetwork()
