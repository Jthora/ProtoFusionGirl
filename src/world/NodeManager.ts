// NodeManager.ts
// Manages ley node stability, decay, and surge events for P2 world state.
// See: docs/rebuild/01-systems/world/instability-events.md

import { EventBus } from '../core/EventBus';

export interface LeyNodeState {
  id: string;
  name: string;
  x: number;
  y: number;
  stability: number; // 0-100
  maxStability: number;
  decayRate: number; // stability loss per second
  surgeThreshold: number; // triggers SURGE_WARNING when stability drops below
}

export class NodeManager {
  private eventBus: EventBus;
  private nodes: Map<string, LeyNodeState> = new Map();
  private collapsedNodes: Set<string> = new Set(); // nodes that have already fired NODE_COLLAPSED
  private elapsed: number = 0;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  addNode(node: LeyNodeState): void {
    this.nodes.set(node.id, { ...node });
  }

  getNode(id: string): LeyNodeState | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): LeyNodeState[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Called each frame. Decays stability and checks thresholds.
   */
  update(dtSeconds: number): void {
    this.elapsed += dtSeconds;

    for (const node of this.nodes.values()) {
      if (node.stability <= 0) continue;

      const previousStability = node.stability;
      node.stability = Math.max(0, node.stability - node.decayRate * dtSeconds);

      // Emit stability changed if it crossed an integer boundary
      if (Math.floor(previousStability) !== Math.floor(node.stability)) {
        this.eventBus.emit({
          type: 'NODE_STABILITY_CHANGED',
          data: {
            nodeId: node.id,
            previousStability: Math.round(previousStability),
            newStability: Math.round(node.stability),
          }
        });
      }

      // Collapse: stability first hits 0
      if (previousStability > 0 && node.stability <= 0 && !this.collapsedNodes.has(node.id)) {
        this.collapsedNodes.add(node.id);
        this.eventBus.emit({
          type: 'NODE_COLLAPSED',
          data: { nodeId: node.id, x: node.x, y: node.y }
        });
      }

      // Surge warning at threshold
      if (previousStability >= node.surgeThreshold && node.stability < node.surgeThreshold) {
        this.eventBus.emit({
          type: 'SURGE_WARNING',
          data: { nodeId: node.id, stability: Math.round(node.stability) }
        });
      }

      // Surge triggered at critical level (half of threshold)
      const criticalLevel = node.surgeThreshold / 2;
      if (previousStability >= criticalLevel && node.stability < criticalLevel) {
        this.eventBus.emit({
          type: 'SURGE_TRIGGERED',
          data: {
            nodeId: node.id,
            severity: node.stability < 10 ? 'major' : node.stability < 20 ? 'moderate' : 'minor',
          }
        });
      }
    }
  }

  /**
   * Restores stability to a node (e.g., after rift seal or repair).
   */
  restoreStability(nodeId: string, amount: number): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    const prev = node.stability;
    node.stability = Math.min(node.maxStability, node.stability + amount);
    // Allow re-collapse if stability drops to 0 again
    if (node.stability > 0) this.collapsedNodes.delete(nodeId);
    this.eventBus.emit({
      type: 'NODE_STABILITY_CHANGED',
      data: {
        nodeId: node.id,
        previousStability: Math.round(prev),
        newStability: Math.round(node.stability),
      }
    });
  }

  /**
   * Directly reduces stability (e.g., from rift or attack).
   */
  damageStability(nodeId: string, amount: number): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    const prev = node.stability;
    node.stability = Math.max(0, node.stability - amount);
    this.eventBus.emit({
      type: 'NODE_STABILITY_CHANGED',
      data: {
        nodeId: node.id,
        previousStability: Math.round(prev),
        newStability: Math.round(node.stability),
      }
    });
  }

  destroy(): void {
    this.nodes.clear();
  }
}
