// EconomySystem.ts
// Event-driven economy system using WorldStateManager and EventBus
// See: world_state_system_design_2025-06-04.artifact

import { WorldStateManager, EconomyState } from '../WorldStateManager';
import { EventBus, WorldEvent } from '../EventBus';

export class EconomySystem {
  private worldStateManager: WorldStateManager;
  private eventBus: EventBus;

  constructor(worldStateManager: WorldStateManager, eventBus: EventBus) {
    this.worldStateManager = worldStateManager;
    this.eventBus = eventBus;
    this.eventBus.subscribe('MISSION_COMPLETED', this.onMissionCompleted);
    this.eventBus.subscribe('RESOURCE_COLLECTED', this.onResourceCollected);
  }

  private onMissionCompleted = (event: WorldEvent) => {
    // Example: reward player with resources for completing a mission
    const { playerId } = event.data;
    const state = this.worldStateManager.getState();
    // For demo, reward 100 credits for any mission completion
    state.economy.resources['credits'] = (state.economy.resources['credits'] || 0) + 100;
    this.worldStateManager.updateState({ economy: state.economy });
    this.eventBus.publish({
      id: `economy_reward_${event.id}`,
      type: 'ECONOMY_REWARD_GRANTED',
      data: { playerId, amount: 100, resource: 'credits' },
      timestamp: Date.now(),
      version: state.version
    });
  };

  private onResourceCollected = (event: WorldEvent) => {
    // Example: update resource count in economy state
    const { resourceType, amount } = event.data;
    const state = this.worldStateManager.getState();
    state.economy.resources[resourceType] = (state.economy.resources[resourceType] || 0) + amount;
    this.worldStateManager.updateState({ economy: state.economy });
    this.eventBus.publish({
      id: `resource_collected_${event.id}`,
      type: 'ECONOMY_RESOURCE_UPDATED',
      data: { resourceType, amount },
      timestamp: Date.now(),
      version: state.version
    });
  };
}
