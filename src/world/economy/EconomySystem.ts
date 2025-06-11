// EconomySystem.ts
// Event-driven economy system using WorldStateManager and EventBus
// See: artifacts/test_system_traceability_2025-06-08.artifact
// Remove usages of event.data.playerId, event.id, and custom event types not in EventName
// Only use canonical event types and payloads
import { EventBus } from '../../core/EventBus';
import { GameEvent } from '../../core/EventTypes';
import { WorldStateManager } from '../WorldStateManager';

export class EconomySystem {
  private worldStateManager: WorldStateManager;
  private eventBus: EventBus;

  constructor(worldStateManager: WorldStateManager, eventBus: EventBus) {
    this.worldStateManager = worldStateManager;
    this.eventBus = eventBus;
    this.eventBus.on('MISSION_COMPLETED', (e: GameEvent<'MISSION_COMPLETED'>) => this.onMissionCompleted(e));
    this.eventBus.on('RESOURCE_COLLECTED', (e: GameEvent<'RESOURCE_COLLECTED'>) => this.onResourceCollected(e));
  }

  private onMissionCompleted = (event: GameEvent<'MISSION_COMPLETED'>) => {
    // Example: reward player with resources for completing a mission
    const state = this.worldStateManager.getState();
    // For demo, reward 100 credits for any mission completion
    state.economy.resources['credits'] = (state.economy.resources['credits'] || 0) + 100;
    this.worldStateManager.updateState({ economy: state.economy });
  };

  private onResourceCollected = (event: GameEvent<'RESOURCE_COLLECTED'>) => {
    // Example: update resource count in economy state
    const { resourceId, amount } = event.data;
    const state = this.worldStateManager.getState();
    state.economy.resources[resourceId] = (state.economy.resources[resourceId] || 0) + amount;
    this.worldStateManager.updateState({ economy: state.economy });
  };
}
