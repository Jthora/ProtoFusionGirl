// LeyLineSystem.ts
// Event-driven ley line subsystem for ProtoFusionGirl
// Integrates with WorldStateManager and EventBus

import { WorldStateManager } from '../WorldStateManager';
import { EventBus, WorldEvent } from '../EventBus';

export class LeyLineSystem {
  private worldState: WorldStateManager;
  private eventBus: EventBus;

  constructor(worldState: WorldStateManager, eventBus: EventBus) {
    this.worldState = worldState;
    this.eventBus = eventBus;
    this.eventBus.subscribe('LEYLINE_ACTIVATED', this.onLeyLineActivated.bind(this));
  }

  activateLeyLine(leyLineId: string, userId?: string) {
    // Find and activate ley line
    const state = this.worldState.getState();
    const leyLine = state.leyLines.find(l => l.id === leyLineId);
    if (leyLine && !leyLine.nodes.every(n => n.active)) {
      leyLine.nodes.forEach(n => (n.active = true));
      this.worldState.updateState({ leyLines: state.leyLines }, userId);
      this.eventBus.publish({
        id: `leyline_activated_${leyLineId}_${Date.now()}`,
        type: 'LEYLINE_ACTIVATED',
        data: { leyLineId },
        timestamp: Date.now(),
        version: state.version
      }, userId);
    }
  }

  private onLeyLineActivated(_event: WorldEvent) {
    // Example: log or trigger further effects
    // (Extend as needed for gameplay logic)
    // console.log('Ley line activated:', event.data.leyLineId);
  }
}
