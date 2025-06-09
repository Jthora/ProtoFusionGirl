// NarrativeEngine.ts
// Data-driven, event-oriented narrative system
import { EventBus } from '../core/EventBus';
import { loadNarrativeEvents, NarrativeEventDefinition } from '../data/narrativeLoader';
import { GameEvent } from '../core/EventTypes';

export class NarrativeEngine {
  private eventBus: EventBus;
  private events: NarrativeEventDefinition[];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.events = loadNarrativeEvents();
    this.eventBus.onAny(this.handleEvent.bind(this));
  }

  private handleEvent(event: GameEvent) {
    // Check for narrative events triggered by this event
    for (const narrative of this.events) {
      if (this.isTriggerMatch(narrative.trigger, event)) {
        this.executeActions(narrative.actions, event);
      }
    }
  }

  private isTriggerMatch(trigger: string, event: GameEvent): boolean {
    // Simple: match event type or event type with payload (e.g., 'game_start', 'quest_completed:angelic_trial')
    if (trigger === event.type) return true;
    if (trigger.startsWith(event.type + ':')) {
      // e.g., trigger: 'quest_completed:angelic_trial', event: { type: 'quest_completed', data: { id: 'angelic_trial' } }
      const triggerSuffix = trigger.split(':')[1];
      return event.data && Object.values(event.data).includes(triggerSuffix);
    }
    return false;
  }

  private executeActions(actions: string[], event: GameEvent) {
    for (const action of actions) {
      // For now, just log; in future, emit events or call systems
      console.log(`[Narrative] Executing action: ${action} (triggered by ${event.type})`);
      // TODO: Emit events or call systems as needed
    }
  }
}
