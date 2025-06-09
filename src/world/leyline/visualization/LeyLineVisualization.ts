// LeyLineVisualization.ts
// Hooks for UI overlays, debug, and visualization of ley lines
// See: artifacts/copilot_leyline_system_advanced_development_2025-06-07.artifact

import { LeyLine } from '../types';

export class LeyLineVisualization {
  /**
   * Returns a data structure for rendering ley lines, nodes, and event overlays in the UI.
   * Includes line segments, node states, and event highlights.
   * See: copilot_leyline_tilemap_traversal_integration_2025-06-07.artifact
   */
  static getRenderData(leyLines: LeyLine[], eventOverlays: any[] = []) {
    const lines: Array<{ from: { x: number; y: number }, to: { x: number; y: number }, leyLineId: string }> = [];
    const nodes: Array<{ position: { x: number; y: number }, state: string, leyLineId: string }> = [];
    for (const leyLine of leyLines) {
      // Add nodes
      for (const node of leyLine.nodes) {
        nodes.push({ position: node.position, state: node.state ?? 'inactive', leyLineId: leyLine.id });
      }
      // Add line segments (connect consecutive nodes)
      for (let i = 0; i < leyLine.nodes.length - 1; i++) {
        lines.push({
          from: leyLine.nodes[i].position,
          to: leyLine.nodes[i + 1].position,
          leyLineId: leyLine.id
        });
      }
    }
    // Event overlays: highlight affected nodes/tiles (e.g., surges/disruptions)
    const overlays = eventOverlays.map(ev => ({
      type: ev.type,
      affectedTiles: ev.affectedTiles,
      color: ev.type === 'LEYLINE_SURGE' ? 'cyan' : ev.type === 'LEYLINE_DISRUPTION' ? 'red' : 'yellow',
      lore: ev.lore
    }));
    return { lines, nodes, overlays };
  }

  /**
   * Utility: Generate overlays for recent ley line events (for debug/player feedback)
   * Accepts a list of recent event payloads (see event schema in artifact)
   */
  static generateEventOverlays(events: any[]) {
    return events.map(ev => ({
      type: ev.type,
      affectedTiles: ev.affectedTiles,
      color: ev.type === 'LEYLINE_SURGE' ? 'cyan' : ev.type === 'LEYLINE_DISRUPTION' ? 'red' : 'yellow',
      lore: ev.lore
    }));
  }

  // TODO: Add hooks for live debug overlays, minimap integration, and player feedback popups
}
