// LeyLineSystem.ts
// Core module for ley line generation, node management, and visualization

export interface LeyLineNode {
  id: string;
  position: { x: number; y: number; };
  state: 'active' | 'inactive' | 'unstable';
  upgrades?: string[];
}

export interface LeyLine {
  id: string;
  nodes: [string, string]; // node ids
  strength: number;
}

export class LeyLineSystem {
  nodes: LeyLineNode[] = [];
  lines: LeyLine[] = [];

  constructor() {}

  /**
   * Procedurally generates a network of ley line nodes and lines.
   * For now, generates a simple grid or random network for N nodes.
   * @param seed Optional seed for deterministic generation
   * @param nodeCount Number of nodes to generate (default: 10)
   * @param lineCount Number of lines to generate (default: nodeCount*2)
   */
  generateNetwork(seed?: number, nodeCount: number = 10, lineCount: number = 20) {
    // Simple deterministic random for demo
    const rand = seed !== undefined ? (() => {
      let s = seed;
      return () => (s = Math.sin(s) * 10000, s - Math.floor(s));
    })() : Math.random;

    this.nodes = [];
    this.lines = [];
    // Generate nodes
    for (let i = 0; i < nodeCount; i++) {
      this.nodes.push({
        id: `N${i}`,
        position: { x: Math.floor(rand() * 100), y: Math.floor(rand() * 100) },
        state: 'active',
      });
    }
    // Generate lines (random pairs)
    for (let i = 0; i < lineCount; i++) {
      const a = Math.floor(rand() * nodeCount);
      let b = Math.floor(rand() * nodeCount);
      if (a === b) b = (b + 1) % nodeCount;
      this.lines.push({
        id: `L${i}`,
        nodes: [`N${a}`, `N${b}`],
        strength: Math.floor(rand() * 100),
      });
    }
  }

  /**
   * Returns a node by its ID.
   */
  getNodeById(id: string): LeyLineNode | undefined {
    return this.nodes.find(n => n.id === id);
  }

  /**
   * Returns all nodes connected to the given node ID.
   */
  getConnectedNodes(id: string): LeyLineNode[] {
    const connectedIds = this.lines
      .filter(line => line.nodes.includes(id))
      .map(line => line.nodes[0] === id ? line.nodes[1] : line.nodes[0]);
    return this.nodes.filter(n => connectedIds.includes(n.id));
  }

  /**
   * Removes a node and all lines connected to it (modding API).
   */
  removeNode(id: string) {
    this.nodes = this.nodes.filter(n => n.id !== id);
    this.lines = this.lines.filter(l => !l.nodes.includes(id));
  }

  /**
   * Removes a line by its ID (modding API).
   */
  removeLine(id: string) {
    this.lines = this.lines.filter(l => l.id !== id);
  }

  /**
   * Modding/event hook: Register a callback for ley line instability events (artifact-driven)
   * Artifact: leyline_instability_event_api_reference_2025-06-08.artifact
   * @param handler Callback to invoke with LeyLineInstabilityEvent
   */
  static instabilityEventHandlers: Array<(event: any) => void> = [];
  static onInstabilityEvent(handler: (event: any) => void) {
    LeyLineSystem.instabilityEventHandlers.push(handler);
  }
  /**
   * Emit a ley line instability event to all registered handlers (for mods, systems, etc.)
   * @param event Canonical LeyLineInstabilityEvent
   */
  static emitInstabilityEvent(event: any) {
    for (const handler of LeyLineSystem.instabilityEventHandlers) handler(event);
  }
  // Example usage for modders:
  // LeyLineSystem.onInstabilityEvent((event) => { /* custom logic */ });

  // Visualization and artifact/documentation sync hooks would go here

  addNode(node: LeyLineNode) {
    this.nodes.push(node);
  }

  addLine(line: LeyLine) {
    this.lines.push(line);
  }

  // ...additional methods for node management, upgrades, visualization hooks
}
