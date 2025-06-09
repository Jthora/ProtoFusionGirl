// LeyLineEvents.ts
// Dynamic ley line event hooks: activation, surges, disruptions, manipulation
// See: artifacts/copilot_leyline_system_advanced_development_2025-06-07.artifact

import { EventBus } from '../../../core/EventBus';
import { EventName, GameEvent } from '../../../core/EventTypes';

export class LeyLineEvents {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Subscribe to ley line events (activation, surges, disruptions, manipulation)
   */
  on<T extends EventName>(eventType: T, handler: (payload: GameEvent<T>["data"]) => void) {
    this.eventBus.on(eventType, (event: GameEvent<T>) => {
      handler(event.data);
    });
  }

  /**
   * Publish a ley line event with narrative-driven payload
   */
  emit<T extends EventName>(eventType: T, data: GameEvent<T>["data"]) {
    this.eventBus.emit({ type: eventType, data });
  }

  /**
   * Publish a ley line activation event.
   */
  publishActivation(leyLineId: string) {
    this.emit('LEYLINE_ACTIVATED', { leyLineId });
  }

  // Example: publish a ley line surge event
  publishSurge(leyLineId: string, magnitude: number, narrativeContext?: string, affectedTiles?: Array<{ x: number; y: number }>, triggeredBy?: string) {
    this.emit('LEYLINE_SURGE', { leyLineId, magnitude, narrativeContext, affectedTiles, triggeredBy });
  }

  // Example: publish a ley line disruption event
  publishDisruption(leyLineId: string, affectedTiles?: Array<{ x: number; y: number }>, narrativeContext?: string, triggeredBy?: string) {
    this.emit('LEYLINE_DISRUPTION', { leyLineId, affectedTiles, narrativeContext, triggeredBy });
  }

  // Example: publish a ley line manipulation event
  publishManipulation(leyLineId: string, status: 'stable' | 'unstable', narrativeContext?: string) {
    this.emit('LEYLINE_MANIPULATION', { leyLineId, status, narrativeContext });
  }

  // Publish a ley line instability event
  publishInstability(event: import('../types').LeyLineInstabilityEvent) {
    this.emit('LEYLINE_INSTABILITY', event);
  }
}
