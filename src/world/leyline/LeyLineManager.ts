// LeyLineManager.ts
// See: artifacts/copilot_anchor_leyline_system_2025-06-06.artifact
// See: artifacts/copilot_leyline_unification_plan_2025-06-07.artifact
// Service for querying, updating, and visualizing ley lines and nodes in real time

import { LeyLine, LeyLineNode } from '../leyline/types';
import { LeyLinePathfinder } from './pathfinding/LeyLinePathfinder';
import { LeyLineProceduralGen } from './procedural/LeyLineProceduralGen';
import { LeyLineEvents } from './events/LeyLineEvents';
import { LeyLineVisualization } from './visualization/LeyLineVisualization';
import { EventBus } from '../../core/EventBus';
import { WorldStateManager } from '../WorldStateManager';

export class LeyLineManager {
  private worldStateManager: WorldStateManager;
  private pathfinder: LeyLinePathfinder;
  private events?: LeyLineEvents;

  constructor(worldStateManager: WorldStateManager, eventBus?: EventBus) {
    this.worldStateManager = worldStateManager;
    this.pathfinder = new LeyLinePathfinder(this.getLeyLines());
    if (eventBus) {
      this.events = new LeyLineEvents(eventBus);
      // Subscribe to ley line instability events and update world state
      eventBus.on('LEYLINE_INSTABILITY', (event) => {
        // Defensive: only handle if event has data and leyLineId
        if (event && event.data && event.data.leyLineId) {
          this.handleInstabilityEvent(event.data);
        }
      });
    }
  }

  /**
   * Procedurally generate a ley line network and replace current network.
   */
  generateProcedural(seed: string, nodeCount = 10) {
    const seedNum = this.stringToSeed(seed);
    const network = new LeyLineProceduralGen(seedNum).generateNetwork(nodeCount);
    const leyLines = [this.networkToLeyLine(network)];
    this.setLeyLines(leyLines);
  }

  private stringToSeed(str: string): number {
    // Simple hash to int
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private networkToLeyLine(network: any): LeyLine {
    // Convert LeyLineNetwork to unified LeyLine format
    return {
      id: 'procedural',
      nodes: network.nodes.map((n: any) => ({
        id: n.id,
        position: n.position,
        state: 'active',
      })),
      energy: 100,
      status: 'stable',
    };
  }

  /**
   * Returns the nearest ley line node to a given position.
   */
  getNearestNode(x: number, y: number): LeyLineNode | null {
    let minDist = Infinity;
    let nearest: LeyLineNode | null = null;
    for (const leyLine of this.getLeyLines()) {
      for (const node of leyLine.nodes) {
        const dx = node.position.x - x;
        const dy = node.position.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          nearest = node;
        }
      }
    }
    return nearest;
  }

  /**
   * Returns ley line "strength" at a given position (0-100).
   */
  getLeyLineStrength(x: number, y: number): number {
    const node = this.getNearestNode(x, y);
    if (!node) return 0;
    const dx = node.position.x - x;
    const dy = node.position.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.max(0, 100 - dist * 10);
  }

  /**
   * Returns all ley lines (for visualization, pathfinding, etc.)
   */
  getLeyLines(): LeyLine[] {
    return this.worldStateManager.getState().leyLines;
  }

  /**
   * Updates ley line network (e.g., after world events)
   */
  setLeyLines(leyLines: LeyLine[]) {
    this.worldStateManager.updateState({ leyLines });
    this.pathfinder = new LeyLinePathfinder(leyLines);
  }

  /**
   * Finds a path along ley lines from start to end (returns list of nodes).
   * Uses advanced pathfinding module.
   */
  findLeyLinePath(start: { x: number; y: number }, end: { x: number; y: number }): LeyLineNode[] {
    return this.pathfinder.findPath(start, end);
  }

  /**
   * Publishes a ley line activation event (if eventBus provided).
   */
  activateLeyLine(leyLineId: string) {
    if (this.events) this.events.publishActivation(leyLineId);
    // Optionally, update ley line state here as well
  }

  /**
   * Returns data for UI visualization of ley lines.
   */
  getVisualizationData() {
    return LeyLineVisualization.getRenderData(this.getLeyLines());
  }

  /**
   * Expose hybrid pathfinding for world traversal integration.
   */
  findHybridLeyLinePath(start: { x: number; y: number }, end: { x: number; y: number }, tileIsWalkable: (x: number, y: number) => boolean) {
    return this.pathfinder.findHybridPath(start, end, tileIsWalkable);
  }

  /**
   * Handle a ley line instability event (mark as unstable, escalate, etc.)
   */
  handleInstabilityEvent(event: import('../leyline/types').LeyLineInstabilityEvent, userId?: string) {
    this.worldStateManager.handleLeyLineInstability(event, userId);
    // Additional logic for escalation, propagation, or player feedback can be added here
  }

  /**
   * Escalate instability: propagate to nearby nodes/lines or escalate severity/state.
   * Artifact: leyline_instability_event_design_2025-06-08.artifact
   */
  escalateInstability(event: import('../leyline/types').LeyLineInstabilityEvent) {
    const leyLines = this.getLeyLines();
    const leyLine = leyLines.find(l => l.id === event.leyLineId);
    if (!leyLine) return;
    // Escalate severity if not already major
    if (event.severity === 'minor') {
      const escalatedEvent: import('../leyline/types').LeyLineInstabilityEvent = {
        ...event,
        severity: 'moderate',
        id: `${event.id}_escalate`,
        timestamp: Date.now(),
      };
      if (this.events) this.events.publishInstability(escalatedEvent);
    } else if (event.severity === 'moderate') {
      const escalatedEvent: import('../leyline/types').LeyLineInstabilityEvent = {
        ...event,
        severity: 'major',
        id: `${event.id}_escalate`,
        timestamp: Date.now(),
      };
      if (this.events) this.events.publishInstability(escalatedEvent);
    } else if (event.severity === 'major') {
      // Escalate to disruption/rift (stub)
      // See: leyline_instability_event_design_2025-06-08.artifact
    }
    // Propagate to connected nodes (stub)
    // ...
  }

  /**
   * Artifact-driven escalation/resolution loop for ley line instability events.
   * Implements: Stable → Instability → Surge/Disruption → Rift Formed → (Resolution/Escalation)
   * Artifacts: leyline_instability_event_design_2025-06-08.artifact
   */
  escalateOrResolveInstability(event: import('../leyline/types').LeyLineInstabilityEvent, _userId?: string) {
    if (event.severity === 'minor') {
      const escalatedEvent: import('../leyline/types').LeyLineInstabilityEvent = {
        ...event,
        severity: 'moderate',
        id: `${event.id}_escalate`,
        timestamp: Date.now(),
      };
      if (this.events) this.events.publishInstability(escalatedEvent);
    } else if (event.severity === 'moderate') {
      const escalatedEvent: import('../leyline/types').LeyLineInstabilityEvent = {
        ...event,
        severity: 'major',
        id: `${event.id}_escalate`,
        timestamp: Date.now(),
      };
      if (this.events) this.events.publishInstability(escalatedEvent);
    } else if (event.severity === 'major') {
      // Escalate to disruption or rift
      if (this.events) {
        this.events.emit('LEYLINE_DISRUPTION', {
          leyLineId: event.leyLineId,
          narrativeContext: 'Ley line destabilization escalated to disruption.'
        });
        this.events.emit('RIFT_FORMED', {
          leyLineId: event.leyLineId,
          severity: 'major',
          timestamp: Date.now(),
          narrativeContext: 'A dimensional rift has formed!'
        });
      }
    }
    // Resolution: If stabilized by player/AI, mark as stable and emit event
    // (Stub: actual stabilization logic should call this)
  }

  /**
   * Player/AI stabilization action for ley line instability.
   * Artifacts: leyline_instability_event_design_2025-06-08.artifact
   */
  stabilizeLeyLine(leyLineId: string, _nodeId?: string, _userId?: string) {
    if (this.events) {
      this.events.emit('LEYLINE_MANIPULATION', {
        leyLineId,
        status: 'stable',
        narrativeContext: 'Ley line stabilized by player/AI.'
      });
    }
    // Update world state accordingly (handled by WorldStateManager)
  }

  // ...additional advanced APIs for manipulation, surges, etc. can be added here
}
// See: artifacts/copilot_leyline_system_advanced_development_2025-06-07.artifact
